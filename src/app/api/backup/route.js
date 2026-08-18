import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    if (format === 'jsonresume') {
      const resume = db.prepare('SELECT * FROM resumes ORDER BY id DESC LIMIT 1').get();
      const certs = db.prepare("SELECT * FROM certifications WHERE status = 'completed'").all();
      const projects = db.prepare("SELECT * FROM projects WHERE status = 'completed'").all();
      const skills = db.prepare('SELECT * FROM skills ORDER BY current_level DESC').all();

      const education = resume?.education_json ? JSON.parse(resume.education_json) : [];
      const experience = resume?.experience_json ? JSON.parse(resume.experience_json) : [];

      const jsonResume = {
        $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
        basics: {
          name: resume?.full_name || 'Sharvin Neve',
          label: 'Data Science & Machine Learning Engineer',
          email: resume?.email || 'sharvinneve67@gmail.com',
          phone: resume?.phone || '+1 (555) 342-8901',
          url: resume?.portfolio_url || 'https://career-catalyst.dev',
          summary: resume?.summary || '',
          location: {
            city: 'San Francisco',
            region: 'CA',
            countryCode: 'US'
          },
          profiles: [
            { network: 'GitHub', username: 'Guts1005', url: 'https://github.com/Guts1005' },
            { network: 'LinkedIn', username: 'sharvin-neve', url: 'https://linkedin.com/in/sharvin-neve' }
          ]
        },
        work: experience.map(exp => ({
          name: exp.company,
          position: exp.role,
          startDate: exp.dates?.split('–')[0]?.trim() || '',
          highlights: exp.bullets || []
        })),
        education: education.map(edu => ({
          institution: edu.institution,
          area: edu.degree,
          score: edu.gpa,
          courses: edu.coursework?.split(',').map(c => c.trim()) || []
        })),
        certificates: certs.map(c => ({
          name: c.name,
          issuer: c.provider,
          url: c.url
        })),
        skills: skills.map(s => ({
          name: s.name,
          level: s.current_level >= 80 ? 'Master' : s.current_level >= 50 ? 'Intermediate' : 'Beginner',
          keywords: [s.category]
        })),
        projects: projects.map(p => ({
          name: p.name,
          description: p.description,
          highlights: [p.impact],
          keywords: p.tech_stack?.split(',').map(t => t.trim()) || [],
          url: p.github_url || p.live_url
        }))
      };

      return new NextResponse(JSON.stringify(jsonResume, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="resume.json"'
        }
      });
    }

    // Full system backup
    const backup = {
      export_version: '2.0',
      exported_at: new Date().toISOString(),
      data: {
        certifications: db.prepare('SELECT * FROM certifications').all(),
        projects: db.prepare('SELECT * FROM projects').all(),
        project_milestones: db.prepare('SELECT * FROM project_milestones').all(),
        skills: db.prepare('SELECT * FROM skills').all(),
        resources: db.prepare('SELECT * FROM resources').all(),
        job_applications: db.prepare('SELECT * FROM job_applications').all(),
        interview_questions: db.prepare('SELECT * FROM interview_questions').all(),
        user_question_progress: db.prepare('SELECT * FROM user_question_progress').all(),
        coding_profiles: db.prepare('SELECT * FROM coding_profiles').all(),
        coding_problems: db.prepare('SELECT * FROM coding_problems').all(),
        resumes: db.prepare('SELECT * FROM resumes').all(),
        activity_log: db.prepare('SELECT * FROM activity_log ORDER BY id DESC LIMIT 100').all()
      }
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="career_catalyst_backup_${new Date().toISOString().slice(0,10)}.json"`
      }
    });
  } catch (error) {
    console.error('Backup export failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();

    if (!body || !body.data) {
      return NextResponse.json({ error: 'Invalid backup file payload' }, { status: 400 });
    }

    const { data } = body;

    // Restore inside transaction
    const restoreTx = db.transaction(() => {
      if (Array.isArray(data.certifications)) {
        db.prepare('DELETE FROM certifications').run();
        const insert = db.prepare(`
          INSERT INTO certifications (id, name, provider, url, status, progress, priority, deadline, notes, category, estimated_hours)
          VALUES (@id, @name, @provider, @url, @status, @progress, @priority, @deadline, @notes, @category, @estimated_hours)
        `);
        for (const row of data.certifications) insert.run(row);
      }

      if (Array.isArray(data.projects)) {
        db.prepare('DELETE FROM projects').run();
        const insert = db.prepare(`
          INSERT INTO projects (id, name, description, status, github_url, live_url, tech_stack, category, impact, start_date, end_date)
          VALUES (@id, @name, @description, @status, @github_url, @live_url, @tech_stack, @category, @impact, @start_date, @end_date)
        `);
        for (const row of data.projects) insert.run(row);
      }

      if (Array.isArray(data.skills)) {
        db.prepare('DELETE FROM skills').run();
        const insert = db.prepare(`
          INSERT INTO skills (id, name, category, current_level, target_level, importance)
          VALUES (@id, @name, @category, @current_level, @target_level, @importance)
        `);
        for (const row of data.skills) insert.run(row);
      }

      if (Array.isArray(data.job_applications)) {
        db.prepare('DELETE FROM job_applications').run();
        const insert = db.prepare(`
          INSERT INTO job_applications (id, company, role, location, work_model, salary, status, applied_date, job_url, recruiter_contact, required_skills, match_score, notes)
          VALUES (@id, @company, @role, @location, @work_model, @salary, @status, @applied_date, @job_url, @recruiter_contact, @required_skills, @match_score, @notes)
        `);
        for (const row of data.job_applications) insert.run(row);
      }

      if (Array.isArray(data.coding_problems)) {
        db.prepare('DELETE FROM coding_problems').run();
        const insert = db.prepare(`
          INSERT INTO coding_problems (id, title, platform, category, difficulty, status, url, solution_notes, completed_at)
          VALUES (@id, @title, @platform, @category, @difficulty, @status, @url, @solution_notes, @completed_at)
        `);
        for (const row of data.coding_problems) insert.run(row);
      }

      db.prepare('INSERT INTO activity_log (action, entity_type, entity_name) VALUES (?, ?, ?)').run(
        'Restored database backup', 'system', `Restored ${new Date().toLocaleTimeString()}`
      );
    });

    restoreTx();

    return NextResponse.json({ success: true, message: 'Database backup successfully restored!' });
  } catch (error) {
    console.error('Backup restore failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
