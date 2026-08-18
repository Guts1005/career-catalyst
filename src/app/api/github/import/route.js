import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { name, description, html_url, language, stargazers_count } = body;

    if (!name) {
      return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
    }

    // Check if project already exists
    const { data: existingUrl } = html_url ? await supabase.from('projects').select('id').eq('github_url', html_url).maybeSingle() : { data: null };
    const { data: existingName } = await supabase.from('projects').select('id').eq('name', name).maybeSingle();
    
    if (existingUrl || existingName) {
      return NextResponse.json({ success: true, alreadyExists: true, message: 'Project already in portfolio!' });
    }

    const techStack = language ? `${language}, Git, GitHub` : 'Python, Git';
    const impact = stargazers_count > 0 ? `Open-source repository with ${stargazers_count} GitHub stars.` : 'Production-ready codebase with full unit test coverage and documentation.';

    const { data: newProject, error: insertError } = await supabase.from('projects').insert([{
      name,
      description: description || 'Repository imported from GitHub',
      status: 'in_progress',
      github_url: html_url || '',
      tech_stack: techStack,
      category: 'Open Source',
      impact
    }]).select().single();
    
    if (insertError) throw insertError;

    const projectId = newProject.id;

    // Add initial milestones
    await supabase.from('project_milestones').insert([
      { project_id: projectId, name: 'Initial code commit & architecture setup', completed: 1 },
      { project_id: projectId, name: 'Comprehensive documentation & README polish', completed: 0 },
      { project_id: projectId, name: 'Production deployment & performance benchmarking', completed: 0 }
    ]);

    // Cross-system skill harvest: If language is known, ensure skill level in Skill Map is boosted!
    if (language) {
      const { data: skill } = await supabase.from('skills').select('id, current_level').ilike('name', language).maybeSingle();
      if (skill) {
        await supabase.from('skills').update({ current_level: Math.min(100, skill.current_level + 10) }).eq('id', skill.id);
      }
    }

    await supabase.from('activity_log').insert([{
      action: 'Imported GitHub project',
      entity_type: 'project',
      entity_id: projectId,
      entity_name: name
    }]);

    return NextResponse.json({ success: true, projectId, message: 'Successfully imported to portfolio!' });
  } catch (error) {
    console.error('Failed to import GitHub repo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
