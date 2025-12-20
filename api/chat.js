// api/chat.js
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const API_KEY = process.env.GEMINI_API_KEY;
  const { model, contents } = await req.json();

  // 使用穩定版 v1 通道，減少 v1beta 的不穩定限制
  const url = `https://generativelanguage.googleapis.com/v1/models/${model || 'gemini-2.0-flash'}:generateContent?key=${API_KEY}`;

  let attempts = 0;
  const maxAttempts = 2; // 若 429 則重試一次

  while (attempts < maxAttempts) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    // 遇到 429 執行自動等待
    if (response.status === 429 && attempts < maxAttempts - 1) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒
      continue;
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
