import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    if (format === 'jsonresume') {
      const { data: resumes } = await supabase.from('resumes').select('*').order('id', { ascending: false }).limit(1);
      const resume = resumes && resumes.length > 0 ? resumes[0] : null;
      const { data: certs } = await supabase.from('certifications').select('*').eq('status', 'completed');
      const { data: projects } = await supabase.from('projects').select('*').eq('status', 'completed');
      const { data: skills } = await supabase.from('skills').select('*').order('current_level', { ascending: false });

      const education = resume?.education_json ? (typeof resume.education_json === 'string' ? JSON.parse(resume.education_json) : resume.education_json) : [];
      const experience = resume?.experience_json ? (typeof resume.experience_json === 'string' ? JSON.parse(resume.experience_json) : resume.experience_json) : [];

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
        certifications: (await supabase.from('certifications').select('*')).data || [],
        projects: (await supabase.from('projects').select('*')).data || [],
        project_milestones: (await supabase.from('project_milestones').select('*')).data || [],
        skills: (await supabase.from('skills').select('*')).data || [],
        resources: (await supabase.from('resources').select('*')).data || [],
        job_applications: (await supabase.from('job_applications').select('*')).data || [],
        interview_questions: (await supabase.from('interview_questions').select('*')).data || [],
        user_question_progress: (await supabase.from('user_question_progress').select('*')).data || [],
        coding_profiles: (await supabase.from('coding_profiles').select('*')).data || [],
        coding_problems: (await supabase.from('coding_problems').select('*')).data || [],
        resumes: (await supabase.from('resumes').select('*')).data || [],
        activity_log: (await supabase.from('activity_log').select('*').order('id', { ascending: false }).limit(100)).data || []
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
    const supabase = getSupabase();
    const body = await request.json();

    if (!body || !body.data) {
      return NextResponse.json({ error: 'Invalid backup file payload' }, { status: 400 });
    }

    const { data } = body;

    // Restore sequentially
    if (Array.isArray(data.certifications)) {
      await supabase.from('certifications').delete().not('id', 'is', null);
      if (data.certifications.length > 0) await supabase.from('certifications').insert(data.certifications);
    }

    if (Array.isArray(data.projects)) {
      await supabase.from('projects').delete().not('id', 'is', null);
      if (data.projects.length > 0) await supabase.from('projects').insert(data.projects);
    }

    if (Array.isArray(data.skills)) {
      await supabase.from('skills').delete().not('id', 'is', null);
      if (data.skills.length > 0) await supabase.from('skills').insert(data.skills);
    }

    if (Array.isArray(data.job_applications)) {
      await supabase.from('job_applications').delete().not('id', 'is', null);
      if (data.job_applications.length > 0) await supabase.from('job_applications').insert(data.job_applications);
    }

    if (Array.isArray(data.coding_problems)) {
      await supabase.from('coding_problems').delete().not('id', 'is', null);
      if (data.coding_problems.length > 0) await supabase.from('coding_problems').insert(data.coding_problems);
    }

    await supabase.from('activity_log').insert([{
      action: 'Restored database backup',
      entity_type: 'system',
      entity_name: `Restored ${new Date().toLocaleTimeString()}`
    }]);

    return NextResponse.json({ success: true, message: 'Database backup successfully restored!' });
  } catch (error) {
    console.error('Backup restore failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
