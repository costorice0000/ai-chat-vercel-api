export default async function handler(req, res) {
    // 1. 設定跨域 Header，允許你的 GitHub Pages 連線
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. 處理預檢請求 (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. 關鍵修正：解析前端傳來的資料
    let bodyData;
    try {
        // 如果 req.body 已經是物件就直接用，如果是字串就解析它
        bodyData = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: "無法解析 JSON 資料格式" });
    }

    const message = bodyData?.message;
    if (!message) {
        return res.status(400).json({ error: "訊息內容不能為空" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // 4. 正式呼叫 Google API (使用 v1 穩定版網址)
        const googleRes = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }]
                })
            }
        );

        const data = await googleRes.json();
        
        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        // 成功取得 AI 回覆
        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiText });

    } catch (error) {
        return res.status(500).json({ error: "Google API 連線失敗", details: error.message });
    }
}
