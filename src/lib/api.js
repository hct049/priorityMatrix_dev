// Apps Script 백엔드 호출. URL은 환경변수(REACT_APP_API_URL).
// text/plain: Apps Script가 CORS preflight를 처리하지 않으므로 단순요청으로 보냄 (배포 index.html과 동일).
const API_URL = process.env.REACT_APP_API_URL || "";

export async function apiGet(action) {
  const r = await fetch(`${API_URL}?action=${action}`);
  return r.json();
}

export async function apiPost(body) {
  const r = await fetch(API_URL, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  });
  return r.json();
}
