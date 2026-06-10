import { isAuthenticated } from './_auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'UNAUTHORIZED' });

  const pat = process.env.GH_PAT;
  if (!pat) return res.status(500).json({ ok: false, error: 'GH_PAT 환경변수가 설정되지 않았습니다.' });

  // Vercel이 주입하는 환경변수로 현재 배포된 레포 자동 감지, 또는 직접 지정
  const owner = process.env.GH_OWNER || process.env.VERCEL_GIT_REPO_OWNER;
  const repo = process.env.GH_REPO || process.env.VERCEL_GIT_REPO_SLUG;

  if (!owner || !repo) {
    return res.status(500).json({ ok: false, error: 'GH_OWNER / GH_REPO 환경변수가 설정되지 않았습니다.' });
  }

  try {
    const r = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/sync-upstream.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      }
    );

    if (r.status === 204 || r.ok) {
      return res.status(200).json({ ok: true });
    }
    const text = await r.text();
    return res.status(500).json({ ok: false, error: text });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
