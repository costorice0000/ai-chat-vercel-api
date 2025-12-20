export const config = { runtime: 'edge' };

// 輔助函式：延遲執行
const delay = (ms) => new Promise(res => setTimeout(res, ms));

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const API_KEY = process.env.GEMINI_API_KEY;
  const { model, contents } = await req.json();

  // 1. 使用穩定版 v1 接口，減少 v1beta 的不穩定配額限制
  const url = `https://generativelanguage.googleapis.com/v1/models/${model || 'gemini-1.5-flash'}:generateContent?key=${API_KEY}`;

  let attempts = 0;
  const maxAttempts = 3; // 最多重試 3 次

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      // 2. 如果遇到 429
      if (response.status === 429) {
        attempts++;
        console.warn(`遇到 429 錯誤，正在進行第 ${attempts} 次重試...`);
        // 每次失敗就多等 2 秒再試 (指數退避)
        await delay(2000 * attempts);
        continue; 
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      if (attempts >= maxAttempts - 1) {
        return new Response(JSON.stringify({ error: "重試次數過多，Google API 暫時鎖定" }), { status: 429 });
      }
      attempts++;
    }
  }
}
