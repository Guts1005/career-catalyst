import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { 
  sanitizeObject,
  whitelistFields,
  validateEnum,
  parseAndValidateBody,
  logSecurityEvent,
  PayloadTooLargeError,
  MalformedBodyError,
} from '@/lib/security';

export async function PUT(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    
    let body;
    try {
      body = await parseAndValidateBody(request);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) return NextResponse.json({ error: e.message }, { status: 413 });
      if (e instanceof MalformedBodyError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
    
    body = whitelistFields(body, 'jobs', '/api/jobs/[id]');
    body = sanitizeObject(body);
    
    if (body.status !== undefined && !validateEnum(body.status, ['wishlist', 'applied', 'oa', 'interview', 'final', 'offer', 'rejected'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'status' });
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (body.work_model !== undefined && !validateEnum(body.work_model, ['remote', 'hybrid', 'onsite'])) {
      logSecurityEvent('BLOCK', 'INVALID_ENUM', { field: 'work_model' });
      return NextResponse.json({ error: 'Invalid work_model' }, { status: 400 });
    }

    const { data: current, error: fetchError } = await supabase.from('job_applications').select('*').eq('id', id).single();
    if (fetchError || !current) {
      return NextResponse.json({ error: 'Job application not found' }, { status: 404 });
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

    let matchScore = current.match_score;
    if (required_skills !== undefined) {
      const skillsArray = required_skills ? required_skills.split(',').map(s => s.trim().toLowerCase()) : [];
      if (skillsArray.length > 0) {
        const { data: allUserSkills } = await supabase.from('skills').select('name, current_level');
        const userSkillMap = new Map((allUserSkills || []).map(s => [s.name.toLowerCase(), s.current_level]));
        let matchedCount = 0;
        for (const reqSkill of skillsArray) {
          if (userSkillMap.has(reqSkill) && (userSkillMap.get(reqSkill) > 20)) {
            matchedCount++;
          }
        }
        matchScore = Math.round((matchedCount / skillsArray.length) * 100);
      }
    }

    const newStatus = status !== undefined ? status : current.status;

    const { error: updateError } = await supabase.from('job_applications').update({
      company: company !== undefined ? company : current.company,
      role: role !== undefined ? role : current.role,
      location: location !== undefined ? location : current.location,
      work_model: work_model !== undefined ? work_model : current.work_model,
      salary: salary !== undefined ? salary : current.salary,
      status: newStatus,
      applied_date: applied_date !== undefined ? applied_date : current.applied_date,
      job_url: job_url !== undefined ? job_url : current.job_url,
      recruiter_contact: recruiter_contact !== undefined ? recruiter_contact : current.recruiter_contact,
      required_skills: required_skills !== undefined ? required_skills : current.required_skills,
      match_score: matchScore,
      notes: notes !== undefined ? notes : current.notes,
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (updateError) throw updateError;

    if (newStatus !== current.status) {
      await supabase.from('activity_log').insert([{
        action: `Stage moved to ${newStatus.toUpperCase()}`, entity_type: 'job_application', entity_id: id, entity_name: `${current.role} at ${current.company}`
      }]);
    }

    return NextResponse.json({ success: true, message: 'Application updated' });
  } catch (error) {
    console.error('Failed to update job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    
    const { data: current } = await supabase.from('job_applications').select('company, role').eq('id', id).single();

    if (!current) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from('job_applications').delete().eq('id', id);
    if (deleteError) throw deleteError;

    await supabase.from('activity_log').insert([{
      action: 'deleted', entity_type: 'job_application', entity_id: id, entity_name: `${current.role} at ${current.company}`
    }]);

    return NextResponse.json({ success: true, message: 'Job application deleted' });
  } catch (error) {
    console.error('Failed to delete job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
