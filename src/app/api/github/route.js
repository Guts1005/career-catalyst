import { getSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data: analyses, error } = await supabase.from('github_analyses').select('id, username, analyzed_at').order('analyzed_at', { ascending: false }).limit(50);
    if (error) throw error;
    return NextResponse.json(analyses);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json({ error: 'Failed to fetch past analyses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { username } = await request.json();
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Fetch Profile
    const profileRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'Career-Catalyst-App' }
    });

    if (profileRes.status === 404) {
      return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
    }
    if (!profileRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch from GitHub API (might be rate limited)' }, { status: 502 });
    }

    const profileData = await profileRes.json();

    // Fetch Repos
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, {
      headers: { 'User-Agent': 'Career-Catalyst-App' }
    });
    
    let repoData = [];
    if (reposRes.ok) {
      repoData = await reposRes.json();
    }

    const topRepos = [...repoData].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10);
    const languages = {};
    
    for (const repo of topRepos) {
        if (!repo.language) continue;
        const langRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`, {
           headers: { 'User-Agent': 'Career-Catalyst-App' }
        });
        if (langRes.ok) {
           const repoLangs = await langRes.json();
           for (const [lang, bytes] of Object.entries(repoLangs)) {
               languages[lang] = (languages[lang] || 0) + bytes;
           }
        } else {
            languages[repo.language] = (languages[repo.language] || 0) + 1000;
        }
    }

    repoData.slice(10).forEach(repo => {
        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 500;
        }
    });

    let score = 0;
    if (profileData.bio) score += 20;
    if (profileData.blog) score += 20;
    if (profileData.avatar_url) score += 10;
    if (profileData.public_repos > 5) score += 25;
    else if (profileData.public_repos > 0) score += 10;
    if (profileData.followers > 10) score += 25;
    else if (profileData.followers > 0) score += 10;

    const recommendations = [];
    if (!profileData.bio) recommendations.push('Add a descriptive bio to your GitHub profile.');
    if (!profileData.blog) recommendations.push('Link your personal website or LinkedIn profile.');
    if (profileData.public_repos < 5) recommendations.push('Aim for at least 5 public repositories to show activity.');
    
    let pythonBytes = languages['Python'] || languages['Jupyter Notebook'] || 0;
    let totalBytes = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
    if (pythonBytes / totalBytes < 0.2 && repoData.length > 0) {
        recommendations.push('As a DS/ML student, add more Python or Jupyter Notebook projects.');
    }

    if (topRepos.length > 0) {
        recommendations.push(`Your most starred repo is ${topRepos[0].name} - highlight this on your resume!`);
    }

    const contributionStats = {
        total_repos: profileData.public_repos,
        followers: profileData.followers,
        following: profileData.following,
        score
    };

    const supabase = getSupabase();
    const { data: insert, error: insertError } = await supabase.from('github_analyses').insert([{
      username,
      profile_data: JSON.stringify(profileData),
      repo_data: JSON.stringify(repoData),
      language_stats: JSON.stringify(languages),
      contribution_stats: JSON.stringify(contributionStats),
      recommendations: JSON.stringify(recommendations)
    }]).select().single();
    if (insertError) throw insertError;

    await supabase.from('activity_log').insert([{
      action: 'analyzed_github',
      entity_type: 'github_analysis',
      entity_id: insert.id,
      entity_name: username
    }]);

    return NextResponse.json({ id: insert.id });
  } catch (error) {
    console.error('Error analyzing github:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
