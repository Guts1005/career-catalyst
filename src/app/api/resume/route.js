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

export async function GET() {
  try {
    const supabase = getSupabase();

    // Fetch primary resume record or fallback
    let { data: resumes } = await supabase.from('resumes').select('*').order('id', { ascending: true }).limit(1);
    let resume = resumes && resumes.length > 0 ? resumes[0] : null;
    
    if (!resume) {
      await supabase.from('resumes').insert([{
        title: 'Data Science Resume',
        full_name: 'Sharvin Neve',
        email: 'sharvinneve67@gmail.com',
        summary: 'Aspiring Machine Learning Engineer'
      }]);
      const { data: newResumes } = await supabase.from('resumes').select('*').order('id', { ascending: true }).limit(1);
      resume = newResumes ? newResumes[0] : null;
    }

    // Pull completed/in-progress certifications from database
    const { data: certsData } = await supabase.from('certifications')
      .select('id, name, provider, status, progress, url, category')
      .in('status', ['completed', 'in_progress'])
      .order('status', { ascending: false })
      .order('progress', { ascending: false });
    const certifications = certsData || [];

    // Pull projects with completed milestones
    const { data: rawProjects } = await supabase.from('projects')
      .select('*, project_milestones(completed)')
      .order('status', { ascending: false })
      .order('created_at', { ascending: false });
    
    const projects = (rawProjects || []).map(p => {
      const ms = p.project_milestones || [];
      const { project_milestones, ...rest } = p;
      return {
        ...rest,
        completed_milestones: ms.filter(m => m.completed).length,
        total_milestones: ms.length
      };
    });

    // Pull skills grouped by category
    const { data: skillsData } = await supabase.from('skills')
      .select('name, category, current_level, target_level, importance')
      .gt('current_level', 20)
      .order('category', { ascending: true })
      .order('current_level', { ascending: false });
    const skills = skillsData || [];

    // Format skills grouped by category
    const skillsByCategory = {};
    for (const skill of skills) {
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill.name);
    }

    return NextResponse.json({
      resume: {
        ...resume,
        education: JSON.parse(resume.education_json || '[]'),
        experience: JSON.parse(resume.experience_json || '[]')
      },
      liveData: {
        certifications,
        projects,
        skillsByCategory
      }
    });
  } catch (error) {
    console.error('Failed to get resume data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
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

    body = whitelistFields(body, 'resume', '/api/resume');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['full_name']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.email && !validateLength(body.email, 200)) {
      logSecurityEvent('BLOCK', 'Email exceeds maximum length', { length: body.email.length });
      return NextResponse.json({ error: 'Email exceeds maximum length of 200' }, { status: 400 });
    }

    const {
      title,
      full_name,
      email,
      phone,
      location,
      linkedin_url,
      github_url,
      portfolio_url,
      summary,
      template_name,
      education,
      experience
    } = body;

    const { data: resumes } = await supabase.from('resumes').select('id').order('id', { ascending: true }).limit(1);
    const current = resumes && resumes.length > 0 ? resumes[0] : null;
    if (!current) {
      return NextResponse.json({ error: 'No resume record found' }, { status: 404 });
    }

    const { error: updateError } = await supabase.from('resumes').update({
      title: title || 'Primary Resume',
      full_name: full_name || '',
      email: email || '',
      phone: phone || '',
      location: location || '',
      linkedin_url: linkedin_url || '',
      github_url: github_url || '',
      portfolio_url: portfolio_url || '',
      summary: summary || '',
      template_name: template_name || 'modern-ats',
      education_json: JSON.stringify(education || []),
      experience_json: JSON.stringify(experience || []),
      updated_at: new Date().toISOString()
    }).eq('id', current.id);
    
    if (updateError) throw updateError;

    await supabase.from('activity_log').insert([{
      action: 'updated',
      entity_type: 'resume',
      entity_id: current.id,
      entity_name: title || 'Resume'
    }]);

    return NextResponse.json({ success: true, message: 'Resume saved successfully' });
  } catch (error) {
    console.error('Failed to update resume:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
