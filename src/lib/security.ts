/**
 * ──────────────────────────────────────────────────────────────────
 * Career Catalyst — Security Utilities (TypeScript)
 * Centralized input validation, sanitization, field whitelisting,
 * request size enforcement, and security event logging.
 * ──────────────────────────────────────────────────────────────────
 */

export type SecurityLogLevel = 'INFO' | 'WARN' | 'BLOCK' | 'ERROR';

export interface SecurityEventEntry {
  timestamp: string;
  service: string;
  level: SecurityLogLevel;
  event: string;
  [key: string]: any;
}

// ── Security Event Logger ─────────────────────────────────────────
/**
 * Log a security-relevant event with structured JSON output for
 * serverless log drains (Vercel) and optional local development file logs.
 */
export function logSecurityEvent(
  level: SecurityLogLevel,
  event: string,
  details: Record<string, any> = {}
): void {
  const entry: SecurityEventEntry = {
    timestamp: new Date().toISOString(),
    service: 'catalyst-security',
    level,
    event,
    ...details,
  };

  const formattedLog = `[CATALYST_SECURITY] ${JSON.stringify(entry)}`;

  if (level === 'ERROR' || level === 'BLOCK') {
    console.error(formattedLog);
  } else if (level === 'WARN') {
    console.warn(formattedLog);
  } else {
    console.info(formattedLog);
  }

  // Attempt local filesystem append if running in a writable node environment (e.g. local dev)
  if (process.env.NODE_ENV === 'development' && typeof process !== 'undefined' && process.cwd) {
    try {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.appendFileSync(path.join(logDir, 'security.log'), JSON.stringify(entry) + '\n');
    } catch {
      // Ignore filesystem errors in read-only / serverless containers
    }
  }
}

// ── Input Sanitization ────────────────────────────────────────────

/**
 * Strip HTML tags and dangerous characters from a string value.
 */
export function sanitizeString(value: any): any {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Strip control chars
    .trim();
}

/**
 * Recursively sanitize all string values in an object.
 */
export function sanitizeObject<T = any>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(sanitizeObject) as unknown as T;
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeObject(value);
    }
    return cleaned as T;
  }
  return obj;
}

// ── Field Whitelisting ────────────────────────────────────────────

/**
 * Allowed fields per API resource. Any field NOT in this list
 * will be silently stripped from the request body.
 */
export const ALLOWED_FIELDS: Record<string, string[]> = {
  certifications: [
    'name', 'provider', 'url', 'status', 'progress', 'priority',
    'deadline', 'notes', 'category', 'estimated_hours',
  ],
  jobs: [
    'company', 'role', 'location', 'work_model', 'salary', 'status',
    'applied_date', 'job_url', 'recruiter_contact', 'required_skills', 'notes',
  ],
  projects: [
    'name', 'description', 'status', 'github_url', 'live_url', 'tech_stack',
    'category', 'impact', 'start_date', 'end_date', 'milestones',
  ],
  milestones: ['name', 'due_date', 'milestone_id', 'completed'],
  skills: [
    'name', 'category', 'current_level', 'target_level', 'importance',
  ],
  resources: [
    'title', 'url', 'type', 'topic', 'completed', 'rating', 'notes',
  ],
  resume: [
    'title', 'full_name', 'email', 'phone', 'location', 'linkedin_url',
    'github_url', 'portfolio_url', 'summary', 'template_name',
    'education', 'experience',
  ],
  interview_prep: [
    'category', 'difficulty', 'question', 'answer', 'key_takeaways',
    'code_snippet', 'tags', 'status', 'notes',
  ],
  coding_tracker: [
    'title', 'platform', 'category', 'difficulty', 'status', 'url',
    'solution_notes',
  ],
  ats_checker: ['content', 'jd'],
  github: ['username'],
  github_import: [
    'name', 'description', 'html_url', 'language', 'stargazers_count',
  ],
  cover_letter: ['company', 'role', 'job_description', 'required_skills'],
  mock_interview: ['track', 'duration_minutes', 'answers'],
  salary_insights: [
    'company', 'role', 'baseOffered', 'equityOffered', 'bonusOffered',
    'targetComp', 'leverageReason',
  ],
};

/**
 * Filter a request body to only include whitelisted fields.
 * Logs a WARN event if unknown fields are detected.
 */
export function whitelistFields<T extends Record<string, any>>(
  body: T,
  resource: string,
  route = ''
): Partial<T> {
  const allowed = ALLOWED_FIELDS[resource];
  if (!allowed || !body || typeof body !== 'object') return body;

  const filtered: Record<string, any> = {};
  const rejected: string[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (allowed.includes(key)) {
      filtered[key] = value;
    } else {
      rejected.push(key);
    }
  }

  if (rejected.length > 0) {
    logSecurityEvent('WARN', 'FIELD_TAMPERING', {
      route,
      rejectedFields: rejected,
    });
  }

  return filtered as Partial<T>;
}

// ── Input Validation ──────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  missing: string[];
}

/**
 * Validate that required fields are present and non-empty.
 */
export function validateRequired(
  body: Record<string, any>,
  requiredFields: string[]
): ValidationResult {
  const missing: string[] = [];
  for (const field of requiredFields) {
    const val = body[field];
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      missing.push(field);
    }
  }
  return { valid: missing.length === 0, missing };
}

/**
 * Validate that a value is one of the allowed enum values.
 */
export function validateEnum<E extends string>(value: any, allowed: readonly E[] | E[]): value is E {
  return allowed.includes(value);
}

/**
 * Validate that a numeric value is within bounds.
 */
export function validateRange(value: any, min: number, max: number): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate max string length.
 */
export function validateLength(value: any, maxLen: number): boolean {
  return typeof value === 'string' && value.length <= maxLen;
}

// ── Request Size Guard ────────────────────────────────────────────

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

/**
 * Parse and validate request body size.
 * Returns the parsed JSON body or throws if too large / invalid.
 */
export async function parseAndValidateBody<T = any>(request: Request): Promise<T> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    logSecurityEvent('BLOCK', 'OVERSIZED_REQUEST', {
      size: contentLength,
      url: request.url,
    });
    throw new PayloadTooLargeError();
  }

  const text = await request.text();
  if (text.length > MAX_BODY_SIZE) {
    logSecurityEvent('BLOCK', 'OVERSIZED_REQUEST', {
      size: text.length,
      url: request.url,
    });
    throw new PayloadTooLargeError();
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    logSecurityEvent('WARN', 'MALFORMED_JSON', { url: request.url });
    throw new MalformedBodyError();
  }
}

export class PayloadTooLargeError extends Error {
  status: number;
  constructor() {
    super('Request body exceeds maximum allowed size (1MB)');
    this.name = 'PayloadTooLargeError';
    this.status = 413;
  }
}

export class MalformedBodyError extends Error {
  status: number;
  constructor() {
    super('Request body contains invalid JSON');
    this.name = 'MalformedBodyError';
    this.status = 400;
  }
}
