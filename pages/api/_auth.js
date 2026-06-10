import crypto from 'crypto';

export function getExpectedToken() {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_PASS || 'dev';
  return crypto
    .createHmac('sha256', secret)
    .update(`${process.env.AUTH_USER || ''}:${process.env.AUTH_PASS || ''}`)
    .digest('hex');
}

export function isAuthenticated(req) {
  if (!process.env.AUTH_USER) return true;
  const raw = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)pm_token=([^;]+)/);
  return !!match && match[1] === getExpectedToken();
}
