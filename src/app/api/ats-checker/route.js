import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

const keywords = [
  "python", "machine learning", "deep learning", "neural network", "tensorflow", "pytorch", 
  "pandas", "numpy", "scikit-learn", "nlp", "computer vision", "sql", "data analysis", 
  "statistics", "regression", "classification", "clustering", "random forest", 
  "gradient boosting", "xgboost", "feature engineering", "model deployment", "mlops", 
  "docker", "aws", "gcp", "azure", "spark", "hadoop", "tableau", "power bi", "jupyter", 
  "a/b testing", "hypothesis testing"
];

const sections = ["experience", "education", "skills", "projects", "certifications", "summary", "objective"];
const verbs = ["developed", "implemented", "designed", "analyzed", "built", "created", "optimized", "improved", "trained", "deployed", "achieved", "reduced", "increased"];

function analyzeResume(content, jd) {
  const lowerContent = content.toLowerCase();
  
  // Keyword matching
  let matches = [];
  let missing = [];
  
  keywords.forEach(kw => {
    if (lowerContent.includes(kw)) {
      matches.push(kw);
    }
  });

  missing = keywords.filter(kw => !matches.includes(kw)).slice(0, 10);
  
  let keywordScore = Math.min((matches.length / 10) * 100, 100);

  // Format score (section headers)
  let foundSections = sections.filter(sec => lowerContent.includes(sec));
  let formatScore = Math.min((foundSections.length / 4) * 100, 100);
  
  let formatIssues = [];
  if (!foundSections.includes("experience")) formatIssues.push("Missing 'Experience' section.");
  if (!foundSections.includes("education")) formatIssues.push("Missing 'Education' section.");
  if (!foundSections.includes("skills")) formatIssues.push("Missing 'Skills' section.");
  
  // Action verbs usage
  let verbMatches = verbs.filter(verb => lowerContent.includes(verb));
  let verbScore = Math.min((verbMatches.length / 5) * 100, 100);
  
  // Quantifiable results
  const numberRegex = /\d+%?|\$\d+/g;
  let numbersFound = (content.match(numberRegex) || []).length;
  let quantScore = Math.min((numbersFound / 5) * 100, 100);
  if (numbersFound < 3) formatIssues.push("Try to include more numbers and quantifiable achievements (e.g., 'increased accuracy by 5%').");
  
  // Contact info
  const emailRegex = /\S+@\S+\.\S+/;
  const phoneRegex = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/;
  const urlRegex = /linkedin\.com\/in\/|github\.com\//;
  
  let hasEmail = emailRegex.test(content);
  let hasPhone = phoneRegex.test(content);
  let hasUrl = urlRegex.test(lowerContent);
  
  let contactScore = 0;
  if (hasEmail) contactScore += 34;
  if (hasPhone) contactScore += 33;
  if (hasUrl) contactScore += 33;
  if (!hasEmail) formatIssues.push("No email address found.");
  if (!hasPhone) formatIssues.push("No phone number found.");
  if (!hasUrl) formatIssues.push("Consider adding a LinkedIn or GitHub profile link.");
  
  // Length
  let wordCount = content.split(/\s+/).length;
  let lengthScore = 100;
  if (wordCount < 200) {
    lengthScore = 50;
    formatIssues.push("Resume is very short. Aim for at least 400 words.");
  } else if (wordCount > 1000) {
    lengthScore = 70;
    formatIssues.push("Resume is quite long. Consider condensing it to be more concise.");
  }
  
  // Overall score
  let overallScore = Math.round((keywordScore * 0.3) + (formatScore * 0.2) + (verbScore * 0.15) + (quantScore * 0.15) + (contactScore * 0.1) + (lengthScore * 0.1));
  
  let feedback = [];
  if (overallScore > 80) feedback.push("Great job! Your resume is well-optimized for ATS.");
  else if (overallScore > 60) feedback.push("Your resume is on the right track, but needs some improvements to pass ATS filters reliably.");
  else feedback.push("Your resume needs significant improvement. Focus on adding keywords, quantifiable results, and standard sections.");
  
  return {
    score: overallScore,
    feedback: feedback.join(" "),
    keyword_matches: JSON.stringify(matches),
    missing_keywords: JSON.stringify(missing),
    format_issues: JSON.stringify(formatIssues)
  };
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { content, jd } = body;
    
    if (!content) {
      return NextResponse.json({ error: 'Resume content is required' }, { status: 400 });
    }
    
    const analysis = analyzeResume(content, jd);
    
    const stmt = db.prepare(`
      INSERT INTO resume_checks 
      (content, score, feedback, keyword_matches, missing_keywords, format_issues) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      content, 
      analysis.score, 
      analysis.feedback, 
      analysis.keyword_matches, 
      analysis.missing_keywords, 
      analysis.format_issues
    );
    
    // Log activity
    db.prepare('INSERT INTO activity_log (action, entity_type, entity_id, entity_name) VALUES (?, ?, ?, ?)').run(
      'analyzed_resume', 'ats_check', info.lastInsertRowid, 'Resume Check'
    );
    
    return NextResponse.json({
      id: info.lastInsertRowid,
      ...analysis
    });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const db = getDb();
    const checks = db.prepare('SELECT * FROM resume_checks ORDER BY created_at DESC').all();
    
    return NextResponse.json(checks);
  } catch (error) {
    console.error('Error fetching resume checks:', error);
    return NextResponse.json({ error: 'Failed to fetch resume checks' }, { status: 500 });
  }
}
