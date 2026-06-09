// GAS_URL은 서버에서만 읽힙니다 — 클라이언트에 노출되지 않습니다.
export default async function handler(req, res) {
  const gasUrl = process.env.GAS_URL;
  if (!gasUrl) return res.status(500).json({ error: 'GAS_URL이 설정되지 않았습니다.' });

  try {
    let gasRes;
    if (req.method === 'GET') {
      const action = req.query.action || 'getTasks';
      gasRes = await fetch(`${gasUrl}?action=${encodeURIComponent(action)}`, {
        redirect: 'follow',
        headers: { 'Accept': 'application/json' },
      });
    } else {
      gasRes = await fetch(gasUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain', 'Accept': 'application/json' },
        body: JSON.stringify(req.body),
      });
    }
    const text = await gasRes.text();
    try {
      res.status(200).json(JSON.parse(text));
    } catch {
      res.status(502).json({ error: 'GAS 응답이 JSON이 아닙니다.', raw: text.slice(0, 500) });
    }
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
