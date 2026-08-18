import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();

  const certStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as planned
    FROM certifications
  `).get();

  const projectStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress
    FROM projects
  `).get();

  const skillStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      ROUND(AVG(current_level), 0) as avg_level,
      SUM(CASE WHEN current_level >= target_level THEN 1 ELSE 0 END) as mastered
    FROM skills
  `).get();

  const resourceStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
    FROM resources
  `).get();

  const jobStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'interview' OR status = 'final' THEN 1 ELSE 0 END) as active_interviews,
      SUM(CASE WHEN status = 'offer' THEN 1 ELSE 0 END) as offers
    FROM job_applications
  `).get();

  const interviewStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN p.status = 'mastered' THEN 1 ELSE 0 END) as mastered
    FROM interview_questions q
    LEFT JOIN user_question_progress p ON q.id = p.question_id
  `).get();

  const recentActivity = db.prepare(`
    SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10
  `).all();

  const upcomingDeadlines = db.prepare(`
    SELECT name, deadline, status, 'certification' as type FROM certifications WHERE deadline IS NOT NULL AND status != 'completed'
    UNION ALL
    SELECT name, end_date as deadline, status, 'project' as type FROM projects WHERE end_date IS NOT NULL AND status != 'completed'
    ORDER BY deadline ASC LIMIT 5
  `).all();

  return NextResponse.json({
    certifications: certStats,
    projects: projectStats,
    skills: skillStats,
    resources: resourceStats,
    jobs: jobStats,
    interview: interviewStats,
    recentActivity,
    upcomingDeadlines,
  });
}
