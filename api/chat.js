export default async function handler(req, res) {
  // 設定 CORS Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 處理 Preflight 請求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 強制檢查必須是 POST [解決 image_ae4d3d.png 的 405 錯誤]
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "請使用 POST 方法發送訊息" });
  }

  // 解析訊息
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }
  
  const userMessage = body?.message;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!userMessage) {
    return res.status(400).json({ error: "未收到 message 欄位" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const googleRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await googleRes.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ response: aiText });

  } catch (error) {
    return res.status(500).json({ error: "伺服器內部錯誤", details: error.message });
  }
}
