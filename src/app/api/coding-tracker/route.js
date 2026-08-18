import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import {
  sanitizeObject,
  whitelistFields,
  validateRequired,
  validateEnum,
  validateRange,
  validateLength,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function GET(request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const category = searchParams.get('category');

    const { data: profiles, error: profError } = await supabase.from('coding_profiles').select('*').order('id', { ascending: true });
    if (profError) throw profError;

    let probQuery = supabase.from('coding_problems').select('*');
    if (platform && platform !== 'All') probQuery = probQuery.eq('platform', platform);
    if (category && category !== 'All') probQuery = probQuery.eq('category', category);
    
    const { data: problems, error: probError } = await probQuery.order('completed_at', { ascending: false }).order('id', { ascending: false });
    if (probError) throw probError;

    // stats
    const { data: allProblems, error: statsError } = await supabase.from('coding_problems').select('status, difficulty');
    if (statsError) throw statsError;

    const stats = {
      total_logged: allProblems.length,
      total_solved: 0,
      easy_solved: 0,
      medium_solved: 0,
      hard_solved: 0
    };

    allProblems.forEach(p => {
      if (p.status === 'solved') {
        stats.total_solved++;
        if (p.difficulty === 'easy') stats.easy_solved++;
        else if (p.difficulty === 'medium') stats.medium_solved++;
        else if (p.difficulty === 'hard') stats.hard_solved++;
      }
    });

    return NextResponse.json({ profiles, problems, stats });
  } catch (error) {
    console.error('Failed to get coding data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = getSupabase();
    let body;
    try {
      body = await parseAndValidateBody(request);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) return NextResponse.json({ error: e.message }, { status: 413 });
      if (e instanceof MalformedBodyError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }

    body = whitelistFields(body, 'coding_tracker', '/api/coding-tracker');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['title']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.difficulty && !validateEnum(body.difficulty, ['easy', 'medium', 'hard'])) {
      logSecurityEvent('BLOCK', 'Invalid difficulty enum', { difficulty: body.difficulty });
      return NextResponse.json({ error: 'Invalid difficulty enum' }, { status: 400 });
    }

    if (body.platform && !validateEnum(body.platform, ['LeetCode', 'Kaggle', 'HackerRank', 'CodeSignal', 'Other'])) {
      logSecurityEvent('BLOCK', 'Invalid platform enum', { platform: body.platform });
      return NextResponse.json({ error: 'Invalid platform enum' }, { status: 400 });
    }

    const { title, platform, category, difficulty, status, url, solution_notes } = body;

    const { data: newProb, error: insertError } = await supabase.from('coding_problems').insert([{
      title,
      platform: platform || 'LeetCode',
      category: category || 'Machine Learning Math',
      difficulty: difficulty || 'medium',
      status: status || 'solved',
      url: url || '',
      solution_notes: solution_notes || ''
    }]).select().single();
    if (insertError) throw insertError;

    // Increment profile solved count if solved
    if (status === 'solved') {
      const { data: prof } = await supabase.from('coding_profiles').select('solved_count').eq('platform', platform).single();
      if (prof) {
         await supabase.from('coding_profiles').update({ solved_count: prof.solved_count + 1, updated_at: new Date().toISOString() }).eq('platform', platform);
      }
    }

    await supabase.from('activity_log').insert([{
      action: 'Solved problem',
      entity_type: 'coding_problem',
      entity_id: newProb.id,
      entity_name: `${title} (${platform})`
    }]);

    return NextResponse.json({ id: newProb.id, message: 'Problem logged successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to log problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
