import { getDb } from '@/lib/db';
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

export async function GET(request) {
  try {
    const db = getDb();
    const benchmarks = db.prepare('SELECT * FROM salary_benchmarks ORDER BY total_comp_median DESC').all();
    return NextResponse.json({ benchmarks });
  } catch (error) {
    console.error('Failed to get salary benchmarks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await parseAndValidateBody(request);
    } catch (e) {
      if (e instanceof PayloadTooLargeError) return NextResponse.json({ error: e.message }, { status: 413 });
      if (e instanceof MalformedBodyError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }

    body = whitelistFields(body, 'salary_insights', '/api/salary-insights');
    body = sanitizeObject(body);

    const { valid, missing } = validateRequired(body, ['company', 'role', 'baseOffered']);
    if (!valid) {
      logSecurityEvent('BLOCK', 'Missing required fields', { missing });
      return NextResponse.json({ error: 'Missing required fields', missing }, { status: 400 });
    }

    if (body.leverageReason && !validateEnum(body.leverageReason, ['competing_offers', 'market_benchmarks', 'skill_match'])) {
      logSecurityEvent('BLOCK', 'Invalid leverageReason enum', { leverageReason: body.leverageReason });
      return NextResponse.json({ error: 'Invalid leverageReason enum' }, { status: 400 });
    }

    const { company, role, baseOffered, equityOffered, bonusOffered, targetComp, leverageReason } = body;

    const base = Number(baseOffered) || 0;
    const equity = Number(equityOffered) || 0;
    const bonus = Number(bonusOffered) || 0;
    const totalOffered = base + equity + bonus;
    const target = Number(targetComp) || Math.round(totalOffered * 1.18);

    let negotiationScript = '';

    if (leverageReason === 'competing_offers') {
      negotiationScript = `Dear [Hiring Manager / Recruiter],

Thank you so much for extending the offer to join ${company} as a ${role}. I am very excited about the team's vision and the technical roadmap.

As I evaluate my options, I currently have another active offer in the $${target.toLocaleString()} total compensation range. However, ${company} remains my top choice because of the opportunity to work directly on your core ML systems.

If ${company} is able to adjust the base compensation to $${Math.round(base * 1.12).toLocaleString()} and increase the initial equity grant to $${Math.round(equity * 1.25).toLocaleString()}, bringing total compensation closer to $${target.toLocaleString()}, I would be thrilled to sign immediately.

Thank you again for your support throughout this process.

Best regards,
Sharvin Neve`;
    } else if (leverageReason === 'market_benchmarks') {
      negotiationScript = `Dear [Hiring Manager / Recruiter],

Thank you for extending the offer for the ${role} position at ${company}. I am genuinely enthusiastic about the opportunity to contribute.

Based on current industry compensation benchmarks for machine learning engineers with hands-on production experience in deep learning and low-latency deployment, market median for this tier is in the $${target.toLocaleString()} range.

Given the quantifiable impact I can bring from day one, would ${company} be open to revisiting the compensation package to $${target.toLocaleString()} total compensation (either through a $${Math.round(base * 1.1).toLocaleString()} base adjustment or an increased equity grant)?

I am eager to finalize this and join the team.

Warm regards,
Sharvin Neve`;
    } else {
      negotiationScript = `Dear [Hiring Manager / Recruiter],

Thank you for putting together the offer for the ${role} position. I am very excited about the prospect of joining ${company}.

I would love to understand if there is flexibility around the initial compensation package. To align closer with my target compensation of $${target.toLocaleString()}, could we explore an adjustment to the starting base salary or a signing bonus?

I look forward to discussing how we can make this a seamless fit.

Best regards,
Sharvin Neve`;
    }

    return NextResponse.json({
      success: true,
      totalOffered,
      targetComp: target,
      negotiationScript
    });
  } catch (error) {
    console.error('Failed to generate negotiation script:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
