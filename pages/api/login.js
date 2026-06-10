import { getExpectedToken } from './_auth';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { id, password } = req.body || {};
  if (id === process.env.AUTH_USER && password === process.env.AUTH_PASS) {
    res.setHeader('Set-Cookie', `pm_token=${getExpectedToken()}; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800`);
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
}
