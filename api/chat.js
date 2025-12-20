export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const API_KEY = process.env.GEMINI_API_KEY;
  const { model, contents } = await req.json();

  // 💡 關鍵改動：將 /v1/ 改為 /v1beta/ 以支援 2.0 模型
  // 同時確保預設模型代碼正確
  const targetModel = model || 'gemini-2.0-flash-exp'; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${API_KEY}`;

  let attempts = 0;
  const maxAttempts = 2; 

  while (attempts < maxAttempts) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    // 處理 429 錯誤：如果遇到限制則等待 2 秒後重試
    if (response.status === 429 && attempts < maxAttempts - 1) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      continue;
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
