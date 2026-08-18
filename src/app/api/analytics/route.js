import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const db = getDb();

    // Fetch all needed data
    const certifications = db.prepare('SELECT * FROM certifications').all();
    const projects = db.prepare('SELECT * FROM projects').all();
    const skills = db.prepare('SELECT * FROM skills').all();
    const resources = db.prepare('SELECT * FROM resources').all();
    const resumeChecks = db.prepare('SELECT * FROM resume_checks ORDER BY created_at ASC').all();
    const activityLog = db.prepare('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10').all();

    // Aggregations
    
    // Overall Progress
    const totalItems = certifications.length + projects.length + skills.length + resources.length;
    
    let completedItems = 0;
    completedItems += certifications.filter(c => c.status === 'Completed').length;
    completedItems += projects.filter(p => p.status === 'Completed').length;
    completedItems += resources.filter(r => r.completed === 1).length;
    
    const trackableItems = certifications.length + projects.length + resources.length;
    const completionRate = trackableItems > 0 ? Math.round((completedItems / trackableItems) * 100) : 0;

    // Certifications
    const certsByStatus = certifications.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    const certsByCategory = certifications.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
    const estimatedHoursRemaining = certifications
      .filter(c => c.status !== 'Completed')
      .reduce((sum, c) => sum + (c.estimated_hours || 0) * (1 - (c.progress || 0) / 100), 0);

    // Skills
    const skillsByCategory = skills.reduce((acc, s) => {
      if (!acc[s.category]) acc[s.category] = { total: 0, count: 0 };
      acc[s.category].total += s.current_level;
      acc[s.category].count += 1;
      return acc;
    }, {});
    
    const avgSkillByCategory = Object.entries(skillsByCategory).map(([category, data]) => ({
      category,
      avg: Math.round((data.total / data.count) * 10) / 10
    }));

    const biggestSkillGaps = skills
      .map(s => ({ ...s, gap: s.target_level - s.current_level }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5);

    const skillsByImportance = skills.reduce((acc, s) => {
      const importanceStr = String(s.importance);
      acc[importanceStr] = (acc[importanceStr] || 0) + 1;
      return acc;
    }, {});

    // Projects
    const projectsByStatus = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const techStackFreqMap = {};
    projects.forEach(p => {
      if (p.tech_stack) {
        const stack = p.tech_stack.split(',').map(s => s.trim());
        stack.forEach(tech => {
          if (tech) techStackFreqMap[tech] = (techStackFreqMap[tech] || 0) + 1;
        });
      }
    });
    const techStackFrequency = Object.entries(techStackFreqMap)
      .map(([tech, count]) => ({ tech, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Resources
    const resourcesByType = resources.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    const resourcesCompleted = resources.filter(r => r.completed === 1).length;
    const resourceCompletionRate = resources.length > 0 ? Math.round((resourcesCompleted / resources.length) * 100) : 0;

    const topicsMap = {};
    resources.forEach(r => {
      if (r.topic) {
        topicsMap[r.topic] = (topicsMap[r.topic] || 0) + 1;
      }
    });
    const topTopics = Object.entries(topicsMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recommendations Engine
    const recommendations = [];
    
    // Skill gaps
    const criticalSkills = skills.filter(s => s.importance >= 4 && s.current_level <= 30);
    if (criticalSkills.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `You have ${criticalSkills.length} critical skills at or below 30% - prioritize these.`
      });
    }

    // Certs in progress
    const inProgressCerts = certifications.filter(c => c.status === 'In Progress');
    if (inProgressCerts.length > 0) {
      recommendations.push({
        type: 'info',
        message: 'Complete your in-progress certifications before starting new ones to maintain momentum.'
      });
    }

    // Tech stack variety
    if (projects.length > 0 && techStackFrequency.length < 3) {
      recommendations.push({
        type: 'info',
        message: 'Your project portfolio might need more variety in the tech stack. Consider exploring new tools.'
      });
    }

    // Find most used tech without a related cert or resource? Just generic message based on top tech
    if (techStackFrequency.length > 0) {
      const topTech = techStackFrequency[0].tech;
      recommendations.push({
        type: 'success',
        message: `You frequently use ${topTech}. Consider getting a recognized certification for it if you haven't already.`
      });
    }

    const data = {
      overall: {
        totalItems,
        completionRate,
      },
      certifications: {
        byStatus: certsByStatus,
        byCategory: certsByCategory,
        estimatedHoursRemaining: Math.round(estimatedHoursRemaining)
      },
      skills: {
        avgByCategory: avgSkillByCategory,
        biggestGaps: biggestSkillGaps,
        byImportance: skillsByImportance
      },
      projects: {
        byStatus: projectsByStatus,
        techStackFrequency
      },
      resources: {
        byType: resourcesByType,
        completionRate: resourceCompletionRate,
        topTopics
      },
      timeline: activityLog,
      atsTrend: resumeChecks.map(r => ({ score: r.score, date: r.created_at })),
      recommendations
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
