import crypto from 'crypto';

export function getExpectedToken() {
  return crypto
    .createHmac('sha256', process.env.AUTH_PASS || 'dev')
    .update(process.env.AUTH_USER || '')
    .digest('hex');
}

export function isAuthenticated(req) {
  if (!process.env.AUTH_USER) return true;
  const raw = req.headers.cookie || '';
  const match = raw.match(/(?:^|;\s*)pm_token=([^;]+)/);
  return !!match && match[1] === getExpectedToken();
}
