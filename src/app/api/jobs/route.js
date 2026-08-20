import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateRequired,
  validateEnum,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function GET() {
  const defaultJobs = [
    { id: 1, company: 'Anthropic', role: 'ML Systems Engineer', location: 'San Francisco, CA', work_model: 'hybrid', salary: '$210,000 - $270,000', status: 'interview', match_score: 95, required_skills: 'PyTorch, Triton, CUDA, Distributed Systems' },
    { id: 2, company: 'NVIDIA', role: 'Inference Performance Engineer', location: 'Santa Clara, CA', work_model: 'onsite', salary: '$195,000 - $250,000', status: 'oa', match_score: 92, required_skills: 'C++, CUDA, TensorRT-LLM, FlashAttention' },
    { id: 3, company: 'Cohere', role: 'Distributed Training Engineer', location: 'Remote', work_model: 'remote', salary: '$185,000 - $240,000', status: 'applied', match_score: 89, required_skills: 'DeepSpeed, PyTorch, Ray, Megatron-LM' },
  ];

  try {
    const supabase = getSupabase();
    
    const [{ data: jobs }, { data: userSkills }] = await Promise.all([
      supabase.from('job_applications').select('*').order('updated_at', { ascending: false }),
      supabase.from('skills').select('name, current_level')
    ]);
    
    const finalJobs = (jobs && jobs.length > 0) ? jobs : defaultJobs;
    return NextResponse.json({ jobs: finalJobs, userSkills: userSkills || [] });
  } catch (error) {
    console.error('Failed to fetch jobs, using defaults:', error);
    return NextResponse.json({ jobs: defaultJobs, userSkills: [] });
  }
}

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
    
    body = whitelistFields(body, 'jobs', '/api/jobs');
    body = sanitizeObject(body);
    
    const required = validateRequired(body, ['company', 'role']);
    if (!required.valid) {
      logSecurityEvent('BLOCK', 'MISSING_REQUIRED_FIELDS', { missing: required.missing });
      return NextResponse.json({ error: 'Missing required fields', missing: required.missing }, { status: 400 });
    }
    
    if (body.status !== undefined && !validateEnum(body.status, ['wishlist', 'applied', 'oa', 'interview', 'final', 'offer', 'rejected'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'status' });
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (body.work_model !== undefined && !validateEnum(body.work_model, ['remote', 'hybrid', 'onsite'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'work_model' });
      return NextResponse.json({ error: 'Invalid work_model' }, { status: 400 });
    }

    const {
      company,
      role,
      location,
      work_model,
      salary,
      status,
      applied_date,
      job_url,
      recruiter_contact,
      required_skills,
      notes
    } = body;

    let matchScore = 0;
    if (required_skills) {
      const skillsArray = required_skills.split(',').map(s => s.trim().toLowerCase());
      const { data: allUserSkills } = await supabase.from('skills').select('name, current_level');
      const userSkillMap = new Map((allUserSkills || []).map(s => [s.name.toLowerCase(), s.current_level]));
      
      let matchedCount = 0;
      for (const reqSkill of skillsArray) {
        if (userSkillMap.has(reqSkill) && (userSkillMap.get(reqSkill) > 20)) {
          matchedCount++;
        }
      }
      matchScore = skillsArray.length > 0 ? Math.round((matchedCount / skillsArray.length) * 100) : 50;
    }

    const { data: result, error: insertError } = await supabase.from('job_applications').insert([{
      company,
      role,
      location: location || '',
      work_model: work_model || 'remote',
      salary: salary || '',
      status: status || 'wishlist',
      applied_date: applied_date || null,
      job_url: job_url || '',
      recruiter_contact: recruiter_contact || '',
      required_skills: required_skills || '',
      match_score: matchScore,
      notes: notes || ''
    }]).select().single();

    if (insertError) throw insertError;

    await supabase.from('activity_log').insert([{
      action: 'created', entity_type: 'job_application', entity_id: result.id, entity_name: `${role} at ${company}`
    }]);

    return NextResponse.json({ id: result.id, message: 'Application created successfully' });
  } catch (error) {
    console.error('Failed to create job application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
