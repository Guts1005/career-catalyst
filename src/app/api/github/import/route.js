import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { name, description, html_url, language, stargazers_count } = body;

    if (!name) {
      return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
    }

    // Check if project already exists
    const existing = db.prepare('SELECT id FROM projects WHERE github_url = ? OR name = ?').get(html_url, name);
    if (existing) {
      return NextResponse.json({ success: true, alreadyExists: true, message: 'Project already in portfolio!' });
    }

    const techStack = language ? `${language}, Git, GitHub` : 'Python, Git';
    const impact = stargazers_count > 0 ? `Open-source repository with ${stargazers_count} GitHub stars.` : 'Production-ready codebase with full unit test coverage and documentation.';

    const result = db.prepare(`
      INSERT INTO projects (name, description, status, github_url, tech_stack, category, impact)
      VALUES (?, ?, 'in_progress', ?, ?, 'Open Source', ?)
    `).run(
      name,
      description || 'Repository imported from GitHub',
      html_url || '',
      techStack,
      impact
    );

    const projectId = result.lastInsertRowid;

    // Add initial milestones
    const insertMilestone = db.prepare(`
      INSERT INTO project_milestones (project_id, name, completed)
      VALUES (?, ?, ?)
    `);

    insertMilestone.run(projectId, 'Initial code commit & architecture setup', 1);
    insertMilestone.run(projectId, 'Comprehensive documentation & README polish', 0);
    insertMilestone.run(projectId, 'Production deployment & performance benchmarking', 0);

    // Cross-system skill harvest: If language is known, ensure skill level in Skill Map is boosted!
    if (language) {
      const skillName = language;
      const skill = db.prepare('SELECT id, current_level FROM skills WHERE LOWER(name) = LOWER(?)').get(skillName);
      if (skill) {
        db.prepare('UPDATE skills SET current_level = MIN(100, current_level + 10) WHERE id = ?').run(skill.id);
      }
    }

    db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
      'Imported GitHub project', 'project', projectId, name
    );

    return NextResponse.json({ success: true, projectId, message: 'Successfully imported to portfolio!' });
  } catch (error) {
    console.error('Failed to import GitHub repo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
