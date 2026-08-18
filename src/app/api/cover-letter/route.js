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

    body = whitelistFields(body, 'cover_letter', '/api/cover-letter');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['company', 'role']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    const { company, role, job_description, required_skills } = body;

    // Fetch user context from database
    const { data: resumes } = await supabase.from('resumes').select('*').order('id', { ascending: false }).limit(1);
    const resume = resumes && resumes.length > 0 ? resumes[0] : null;

    const { data: certsData } = await supabase.from('certifications').select('name, provider').eq('status', 'completed');
    const certs = certsData || [];

    const { data: projectsData } = await supabase.from('projects').select('name, tech_stack, impact').order('id', { ascending: false }).limit(2);
    const projects = projectsData || [];

    const { data: skillsData } = await supabase.from('skills').select('name').order('current_level', { ascending: false }).limit(6);
    const topSkills = (skillsData || []).map(s => s.name).join(', ');

    const fullName = resume?.full_name || 'Sharvin Neve';
    const email = resume?.email || 'sharvinneve67@gmail.com';
    const phone = resume?.phone || '+1 (555) 342-8901';

    const p1 = projects[0] ? `Recently, I developed "${projects[0].name}" utilizing ${projects[0].tech_stack}, where I ${projects[0].impact.toLowerCase()}` : '';
    const p2 = projects[1] ? `Additionally, I architected "${projects[1].name}" (${projects[1].tech_stack}), achieving ${projects[1].impact.toLowerCase()}` : '';
    const certNames = certs.map(c => c.name).join(', ');

    // Generate Tailored Cover Letter
    const coverLetterText = `Dear Hiring Team at ${company},

I am writing to express my strong enthusiasm for the ${role} position at ${company}. With a rigorous foundation in Machine Learning, Deep Learning, and data engineering—paired with hands-on expertise in ${topSkills}—I am excited about the opportunity to contribute to ${company}'s high-impact technical initiatives.

${p1}

${p2}

To complement my engineering background, I have earned industry-recognized credentials including ${certNames || 'specialized ML certifications'}, solidifying my understanding of production model deployment, latency optimization, and scalable data pipelines. 

${company}'s reputation for technical excellence and continuous innovation aligns directly with my professional focus on building reliable, mathematically grounded AI solutions. I welcome the opportunity to discuss how my technical skills and project experience can add immediate value to your team.

Thank you for your time and consideration.

Sincerely,
${fullName}
${email} | ${phone}`;

    // Generate LinkedIn Recruiter Pitch
    const recruiterPitchText = `Hi [Recruiter Name] — I noticed ${company} is hiring for a ${role} and wanted to reach out directly. 

I specialize in building production ML/AI systems (${topSkills}) with quantifiable results—including ${projects[0]?.impact || 'improving model precision and low-latency deployment'}. 

I’d love to connect and share how my background in machine learning and data engineering can support ${company}'s current technical roadmaps. 

Best,
${fullName}`;

    // Store in database
    const { data: insert, error: insertError } = await supabase.from('cover_letters').insert([{
      company,
      role,
      cover_letter_text: coverLetterText,
      recruiter_pitch_text: recruiterPitchText
    }]).select().single();
    if (insertError) throw insertError;

    await supabase.from('activity_log').insert([{
      action: 'Generated Tailored Cover Letter',
      entity_type: 'cover_letter',
      entity_id: insert.id,
      entity_name: `${role} at ${company}`
    }]);

    return NextResponse.json({
      success: true,
      coverLetter: coverLetterText,
      recruiterPitch: recruiterPitchText
    });
  } catch (error) {
    console.error('Failed to generate cover letter:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
