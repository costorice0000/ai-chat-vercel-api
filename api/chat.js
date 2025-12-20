// api/chat.js
export const config = {
  runtime: 'edge', // 確保使用 Edge Runtime 以支援快速響應
};

export default async function handler(req) {
  // 只處理 POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: '環境變數 GEMINI_API_KEY 未設定' }), { status: 500 });
  }

  try {
    const { model, contents } = await req.json();

    // 💡 支援 2.0 的 v1beta 通道
    // 預設模型建議加上 -exp 確保 2.0 運作正常
    const targetModel = model || 'gemini-2.0-flash-exp';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${API_KEY}`;

    let response;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      // 如果遇到 429 則自動等待並重試
      if (response.status === 429 && attempts < maxAttempts - 1) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      break; 
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server Error: ' + error.message }), { status: 500 });
  }
}
