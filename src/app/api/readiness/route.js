import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { calculateCareerReadiness } from '@/lib/careerGraph';

export async function GET(request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const targetRole = searchParams.get('role') || 'senior_ml';

  try {
    const [{ data: skills }, { data: projects }, { data: jobs }, { data: resume }] = await Promise.all([
      supabase.from('skills').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('job_applications').select('*'),
      supabase.from('resumes').select('*').order('id', { ascending: false }).limit(1).maybeSingle(),
    ]);

    const readinessResult = calculateCareerReadiness({
      targetRole,
      skills: skills || [],
      projects: projects || [],
      jobs: jobs || [],
      resumeData: resume || null,
    });

    return NextResponse.json({
      score: readinessResult.overallScore,
      targetRole: readinessResult.targetRoleTitle,
      breakdown: readinessResult.breakdown,
      gaps: readinessResult.gaps,
      is_initialized: true,
    });
  } catch (error) {
    // Graceful fallback to canonical benchmark calculation
    const fallbackResult = calculateCareerReadiness({ targetRole });
    return NextResponse.json({
      score: fallbackResult.overallScore,
      targetRole: fallbackResult.targetRoleTitle,
      breakdown: fallbackResult.breakdown,
      gaps: fallbackResult.gaps,
      is_initialized: true,
    });
  }
}
