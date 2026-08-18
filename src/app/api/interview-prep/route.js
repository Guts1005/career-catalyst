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
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let query = supabase.from('interview_questions').select('*, user_question_progress(status, notes, last_reviewed_at)');

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (difficulty && difficulty !== 'All') {
      query = query.eq('difficulty', difficulty.toLowerCase());
    }

    const { data: rawQuestions, error: questionsError } = await query.order('id', { ascending: true });
    if (questionsError) throw questionsError;

    const questions = rawQuestions.map(q => {
      const progress = Array.isArray(q.user_question_progress) ? q.user_question_progress[0] : q.user_question_progress;
      const { user_question_progress, ...rest } = q;
      return {
        ...rest,
        user_status: progress?.status || 'unprepared',
        user_notes: progress?.notes || null,
        last_reviewed_at: progress?.last_reviewed_at || null
      };
    });

    // Compute stats
    const { data: allQuestionsForStats, error: statsError } = await supabase
      .from('interview_questions')
      .select('id, user_question_progress(status)');
    
    if (statsError) throw statsError;

    const stats = {
      total_questions: allQuestionsForStats.length,
      mastered_count: 0,
      reviewing_count: 0,
      unprepared_count: 0
    };

    allQuestionsForStats.forEach(q => {
      const p = Array.isArray(q.user_question_progress) ? q.user_question_progress[0] : q.user_question_progress;
      const status = p?.status || 'unprepared';
      if (status === 'mastered') stats.mastered_count++;
      else if (status === 'reviewing') stats.reviewing_count++;
      else stats.unprepared_count++;
    });

    return NextResponse.json({ questions, stats });
  } catch (error) {
    console.error('Failed to get interview questions:', error);
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

    body = whitelistFields(body, 'interview_prep', '/api/interview-prep');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['question', 'answer']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.difficulty && !validateEnum(body.difficulty, ['easy', 'medium', 'hard'])) {
      logSecurityEvent('BLOCK', 'Invalid difficulty enum', { difficulty: body.difficulty });
      return NextResponse.json({ error: 'Invalid difficulty enum' }, { status: 400 });
    }

    const { category, difficulty, question, answer, key_takeaways, code_snippet, tags } = body;

    const { data: newQuestion, error: insertError } = await supabase.from('interview_questions').insert([{
      category: category || 'Machine Learning',
      difficulty: difficulty || 'medium',
      question,
      answer,
      key_takeaways: key_takeaways || '',
      code_snippet: code_snippet || '',
      tags: tags || ''
    }]).select().single();
    
    if (insertError) throw insertError;

    await supabase.from('user_question_progress').insert([{
      question_id: newQuestion.id,
      status: 'unprepared'
    }]);

    return NextResponse.json({ id: newQuestion.id, message: 'Question created' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
