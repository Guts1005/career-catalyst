import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import {
  sanitizeObject,
  whitelistFields,
  validateRequired,
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

    const { company, role, job_description, required_skills, candidate_projects, candidate_skills } = body;

    // Fetch user context from database or fallback
    const { data: resumes } = await supabase.from('resumes').select('*').order('id', { ascending: false }).limit(1);
    const resume = resumes && resumes.length > 0 ? resumes[0] : null;

    const { data: certsData } = await supabase.from('certifications').select('name, provider').eq('status', 'completed');
    const certs = certsData || [];

    const { data: projectsData } = await supabase.from('projects').select('name, tech_stack, impact').order('id', { ascending: false }).limit(2);
    const projects = (candidate_projects && candidate_projects.length > 0) ? candidate_projects : (projectsData || []);

    const { data: skillsData } = await supabase.from('skills').select('name').order('current_level', { ascending: false }).limit(6);
    const topSkills = candidate_skills || (skillsData || []).map(s => s.name).join(', ') || 'PyTorch, Triton, Distributed Systems, CUDA, FlashAttention';

    const fullName = resume?.full_name || 'Sharvin Neve';
    const email = resume?.email || 'sharvinneve67@gmail.com';
    const phone = resume?.phone || '+1 (555) 342-8901';

    const p1 = projects[0]
      ? `Recently, I architected "${projects[0].name}" utilizing ${projects[0].tech_stack || 'PyTorch and Triton'}, where I ${projects[0].impact ? projects[0].impact.toLowerCase() : 'reduced P99 inference latency by 45% and scaled serving throughput across multi-GPU clusters'}.`
      : 'Recently, I architected a low-latency model inference gateway with custom Triton GPU kernels, achieving sub-15ms P99 latency bounds across multi-node clusters.';

    const p2 = projects[1]
      ? `Additionally, I developed "${projects[1].name}" (${projects[1].tech_stack || 'CUDA & Distributed Systems'}), successfully ${projects[1].impact ? projects[1].impact.toLowerCase() : 'optimizing memory hierarchy bounds and eliminating communication bottlenecks'}.`
      : 'Additionally, I developed a high-throughput hybrid vector retrieval engine combining dense embeddings with BM25 sparse indices and cross-encoder re-ranking.';

    const certNames = certs.map(c => c.name).join(', ');

    // Generate Tailored STAR Cover Letter (Connection E)
    const coverLetterText = `Dear Hiring Team at ${company},

I am writing to express my strong enthusiasm for the ${role} position at ${company}. With a rigorous background in Machine Learning Systems, high-throughput inference optimization, and distributed cluster engineering—paired with hands-on expertise in ${required_skills || topSkills}—I am excited about the opportunity to contribute directly to ${company}'s frontier engineering initiatives.

${p1}

${p2}

To complement my systems engineering experience, I have completed specialized certifications including ${certNames || 'AWS Certified Machine Learning Specialty and Deep Learning Systems'}, reinforcing my foundation in GPU memory hierarchy bounds, automated failover, and high-availability MLOps pipelines.

${company}'s leadership in building transformative AI technology aligns perfectly with my focus on mathematically sound, low-latency machine learning architectures. I welcome the opportunity to discuss how my technical expertise and verified portfolio evidence can accelerate ${company}'s roadmaps.

Thank you for your time and consideration.

Sincerely,
${fullName}
${email} | ${phone}`;

    // Generate Recruiter Outreach InMail Pitch (Connection E)
    const recruiterPitchText = `Hi [Recruiter Name] — I saw ${company} is expanding the team for the ${role} role and wanted to reach out directly.

I specialize in high-performance ML systems (${topSkills}) with verifiable production metrics—including ${projects[0]?.impact || 'reducing inference latency by 45% and optimizing memory hierarchy bounds'}.

Given ${company}'s ambitious engineering goals, I would love to connect and discuss how my distributed systems and kernel optimization background can add immediate velocity to your team.

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
      entity_name: `${company} — ${role}`
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
