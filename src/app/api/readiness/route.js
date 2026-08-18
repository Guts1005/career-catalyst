import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = getSupabase();

  const [{ data: certs }, { data: projects }, { data: skills }, { data: resources }] = await Promise.all([
    supabase.from('certifications').select('status'),
    supabase.from('projects').select('status'),
    supabase.from('skills').select('current_level, target_level'),
    supabase.from('resources').select('completed')
  ]);

  const certStats = {
    total: certs?.length || 0,
    completed: certs?.filter(c => c.status === 'completed').length || 0,
    in_progress: certs?.filter(c => c.status === 'in_progress').length || 0
  };

  const projectStats = {
    total: projects?.length || 0,
    completed: projects?.filter(p => p.status === 'completed').length || 0
  };

  const skillStats = {
    total: skills?.length || 0,
    avg_progress: skills?.length 
      ? skills.reduce((sum, s) => sum + (s.target_level > 0 ? (s.current_level * 1.0 / s.target_level) * 100 : 0), 0) / skills.length 
      : 0
  };

  const resourceStats = {
    total: resources?.length || 0,
    completed: resources?.filter(r => r.completed === 1 || r.completed === true).length || 0
  };

  // Weighted score calculation
  const weights = {
    certs: 30,        // 30% weight
    projects: 30,     // 30% weight
    skills: 25,       // 25% weight
    resources: 15,    // 15% weight
  };

  const certScore = certStats.total > 0
    ? ((certStats.completed + certStats.in_progress * 0.3) / certStats.total) * weights.certs
    : 0;

  const projectScore = projectStats.total > 0
    ? (projectStats.completed / projectStats.total) * weights.projects
    : 0;

  const skillScore = (skillStats.avg_progress || 0) / 100 * weights.skills;

  const resourceScore = resourceStats.total > 0
    ? (resourceStats.completed / resourceStats.total) * weights.resources
    : 0;

  const totalScore = Math.round(certScore + projectScore + skillScore + resourceScore);

  return NextResponse.json({
    score: Math.min(totalScore, 100),
    breakdown: {
      certifications: { score: Math.round(certScore), weight: weights.certs, ...certStats },
      projects: { score: Math.round(projectScore), weight: weights.projects, ...projectStats },
      skills: { score: Math.round(skillScore), weight: weights.skills, avgProgress: Math.round(skillStats.avg_progress || 0) },
      resources: { score: Math.round(resourceScore), weight: weights.resources, ...resourceStats },
    }
  });
}
