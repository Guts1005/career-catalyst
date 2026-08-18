import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();

  // Calculate readiness score based on multiple factors
  const certStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress
    FROM certifications
  `).get();

  const projectStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM projects
  `).get();

  const skillStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      AVG(CASE WHEN target_level > 0 THEN (current_level * 1.0 / target_level) * 100 ELSE 0 END) as avg_progress
    FROM skills
  `).get();

  const resourceStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
    FROM resources
  `).get();

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
