import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = getSupabase();

  const [{ data: certs }, { data: projects }, { data: skills }, { data: resources }, { data: jobs }, { data: questions }, { data: qProgress }, { data: recentActivity }, { data: certDeadlines }, { data: projDeadlines }] = await Promise.all([
    supabase.from('certifications').select('status'),
    supabase.from('projects').select('status'),
    supabase.from('skills').select('current_level, target_level'),
    supabase.from('resources').select('completed'),
    supabase.from('job_applications').select('status'),
    supabase.from('interview_questions').select('id'),
    supabase.from('user_question_progress').select('status'),
    supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('certifications').select('name, deadline, status').not('deadline', 'is', null).neq('status', 'completed'),
    supabase.from('projects').select('name, end_date, status').not('end_date', 'is', null).neq('status', 'completed')
  ]);

  const certStats = {
    total: certs?.length || 0,
    completed: certs?.filter(c => c.status === 'completed').length || 0,
    in_progress: certs?.filter(c => c.status === 'in_progress').length || 0,
    planned: certs?.filter(c => c.status === 'planned').length || 0
  };

  const projectStats = {
    total: projects?.length || 0,
    completed: projects?.filter(p => p.status === 'completed').length || 0,
    in_progress: projects?.filter(p => p.status === 'in_progress').length || 0
  };

  const skillStats = {
    total: skills?.length || 0,
    avg_level: skills?.length ? Math.round(skills.reduce((sum, s) => sum + (s.current_level || 0), 0) / skills.length) : 0,
    mastered: skills?.filter(s => s.current_level >= s.target_level).length || 0
  };

  const resourceStats = {
    total: resources?.length || 0,
    completed: resources?.filter(r => r.completed === 1 || r.completed === true).length || 0
  };

  const jobStats = {
    total: jobs?.length || 0,
    active_interviews: jobs?.filter(j => j.status === 'interview' || j.status === 'final').length || 0,
    offers: jobs?.filter(j => j.status === 'offer').length || 0
  };

  const interviewStats = {
    total: questions?.length || 0,
    mastered: qProgress?.filter(p => p.status === 'mastered').length || 0
  };

  const upcomingDeadlines = [
    ...(certDeadlines || []).map(c => ({ name: c.name, deadline: c.deadline, status: c.status, type: 'certification' })),
    ...(projDeadlines || []).map(p => ({ name: p.name, deadline: p.end_date, status: p.status, type: 'project' }))
  ].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);

  return NextResponse.json({
    certifications: certStats,
    projects: projectStats,
    skills: skillStats,
    resources: resourceStats,
    jobs: jobStats,
    interview: interviewStats,
    recentActivity: recentActivity || [],
    upcomingDeadlines,
  });
}
