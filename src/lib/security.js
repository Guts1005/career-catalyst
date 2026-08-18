/**
 * ──────────────────────────────────────────────────────────────────
 * Career Catalyst — Security Utilities
 * Centralized input validation, sanitization, field whitelisting,
 * request size enforcement, and security event logging.
 * ──────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';

// ── Security Event Logger ─────────────────────────────────────────
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'security.log');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Log a security-relevant event to `logs/security.log`.
 * @param {'INFO'|'WARN'|'BLOCK'|'ERROR'} level
 * @param {string} event - Short event name (e.g. 'FIELD_TAMPERING')
 * @param {object} details - Contextual data
 */
export function logSecurityEvent(level, event, details = {}) {
  ensureLogDir();
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details,
  });
  try {
    fs.appendFileSync(LOG_FILE, entry + '\n');
  } catch {
    // Fail silently — logging should never crash the app
  }
}


// ── Input Sanitization ────────────────────────────────────────────

/**
 * Strip HTML tags and dangerous characters from a string value
 * before storing in SQLite.
 */
export function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Strip control chars
    .trim();
}

/**
 * Recursively sanitize all string values in an object.
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeObject(value);
    }
    return cleaned;
  }
  return obj;
}


// ── Field Whitelisting ────────────────────────────────────────────

/**
 * Allowed fields per API resource. Any field NOT in this list
 * will be silently stripped from the request body.
 */
const ALLOWED_FIELDS = {
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
 * @param {object} body - Raw request body
 * @param {string} resource - Resource name (key in ALLOWED_FIELDS)
 * @param {string} route - Route path for logging
 * @returns {object} Filtered body with only allowed fields
 */
export function whitelistFields(body, resource, route = '') {
  const allowed = ALLOWED_FIELDS[resource];
  if (!allowed || !body || typeof body !== 'object') return body;

  const filtered = {};
  const rejected = [];

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

  return filtered;
}


// ── Input Validation ──────────────────────────────────────────────

/**
 * Validate that required fields are present and non-empty.
 * @param {object} body
 * @param {string[]} requiredFields
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateRequired(body, requiredFields) {
  const missing = [];
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
 * @param {*} value
 * @param {string[]} allowed
 * @returns {boolean}
 */
export function validateEnum(value, allowed) {
  return allowed.includes(value);
}

/**
 * Validate that a numeric value is within bounds.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export function validateRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate max string length.
 * @param {string} value
 * @param {number} maxLen
 * @returns {boolean}
 */
export function validateLength(value, maxLen) {
  return typeof value === 'string' && value.length <= maxLen;
}


// ── Request Size Guard ────────────────────────────────────────────

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

/**
 * Parse and validate request body size.
 * Returns the parsed JSON body or throws if too large / invalid.
 * @param {Request} request
 * @returns {Promise<object>}
 */
export async function parseAndValidateBody(request) {
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
    return JSON.parse(text);
  } catch {
    logSecurityEvent('WARN', 'MALFORMED_JSON', { url: request.url });
    throw new MalformedBodyError();
  }
}

export class PayloadTooLargeError extends Error {
  constructor() {
    super('Request body exceeds maximum allowed size (1MB)');
    this.status = 413;
  }
}

export class MalformedBodyError extends Error {
  constructor() {
    super('Request body contains invalid JSON');
    this.status = 400;
  }
}
