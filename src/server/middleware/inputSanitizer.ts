// FEAT-0: XSS prevention and prompt injection protection

// Basic HTML entity escaping for XSS prevention
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// AI prompt injection prevention
// Removes common injection patterns from user input before sending to AI
const INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+(instructions?|prompts?)/gi,
  /you\s+are\s+now/gi,
  /system\s*:\s*/gi,
  /\[INST\]/gi,
  /<<SYS>>/gi,
  /forget\s+(everything|all|previous)/gi,
  /disregard\s+(previous|above|all)\s*(instructions?|prompts?)?/gi,
  /new\s+instructions?:/gi,
];

export function sanitizeForAI(input: string): string {
  let sanitized = input;
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  return sanitized.trim();
}

// General input sanitization
export function sanitizeInput(input: string): string {
  return sanitizeHtml(input).trim();
}
