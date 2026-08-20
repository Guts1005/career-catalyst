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
      hard_solved: 0,
    };

    allProblems.forEach((p) => {
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

    // Handle Real Live LeetCode Profile API Sync
    if (body.action === 'sync_leetcode') {
      const username = body.username?.trim();
      if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
      }

      try {
        const lcRes = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          body: JSON.stringify({
            query: `
              query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                  username
                  submitStatsGlobal {
                    acSubmissionNum {
                      difficulty
                      count
                    }
                  }
                  profile {
                    ranking
                    reputation
                  }
                }
              }
            `,
            variables: { username },
          }),
        });

        const lcData = await lcRes.json();
        const matched = lcData?.data?.matchedUser;
        if (!matched) {
          return NextResponse.json({ error: `LeetCode user "${username}" not found or profile is private.` }, { status: 404 });
        }

        const subStats = matched.submitStatsGlobal?.acSubmissionNum || [];
        const allCount = subStats.find((s) => s.difficulty === 'All')?.count || 0;
        const easyCount = subStats.find((s) => s.difficulty === 'Easy')?.count || 0;
        const medCount = subStats.find((s) => s.difficulty === 'Medium')?.count || 0;
        const hardCount = subStats.find((s) => s.difficulty === 'Hard')?.count || 0;

        return NextResponse.json({
          success: true,
          username: matched.username,
          total_solved: allCount,
          easy_solved: easyCount,
          medium_solved: medCount,
          hard_solved: hardCount,
          ranking: matched.profile?.ranking ? Number(matched.profile.ranking).toLocaleString() : 'Top 5%',
          reputation: matched.profile?.reputation || 0,
          synced_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to query LeetCode GraphQL:', err);
        return NextResponse.json({ error: 'Failed to communicate with LeetCode live endpoint' }, { status: 502 });
      }
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

    if (body.platform && !validateEnum(body.platform, ['LeetCode', 'Kaggle', 'HackerRank', 'CodeSignal', 'Other', 'Custom'])) {
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
      solution_notes: solution_notes || '',
    }]).select().single();
    if (insertError) throw insertError;

    return NextResponse.json(newProb, { status: 201 });
  } catch (error) {
    console.error('Failed to save coding problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
