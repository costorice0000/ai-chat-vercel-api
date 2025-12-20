// api/chat.js
// 使用 Vercel Edge Runtime 以獲得最快的響應速度
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 1. 只允許 POST 請求
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. 從 Vercel 環境變數讀取 API Key
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: '後端未設定 API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. 解析前端傳來的資料
    const { model, contents } = await req.json();

    // 4. 設定 Google Gemini API 的請求地址
    // 使用 v1beta 版本以支援最新的 2.0 模型
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-3.0-flash'}:generateContent?key=${API_KEY}`;

    // 5. 發送請求到 Google
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    // 6. 將 Google 的回傳結果轉發給前端
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // 允許跨網域存取
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: '後端發生錯誤: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
