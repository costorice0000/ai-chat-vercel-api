// api/chat.js
export const config = {
  runtime: 'edge', // 確保在 Vercel Edge Runtime 運行
};

export default async function handler(req) {
  // 1. 檢查請求方法
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: '後端未設定 API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { model, contents } = await req.json();

    // 2. 支援 2.0 的通道：使用 v1beta
    // 預設模型設為 2.0 Flash 實驗版
    const targetModel = model || 'gemini-2.0-flash-exp';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${API_KEY}`;

    let response;
    let attempts = 0;
    const maxAttempts = 2; // 針對 429 錯誤自動重試一次

    while (attempts < maxAttempts) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      // 3. 解決 429 錯誤的核心邏輯
      if (response.status === 429 && attempts < maxAttempts - 1) {
        attempts++;
        // 等待 2 秒讓配額冷卻
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      break;
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: '後端發生錯誤: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
