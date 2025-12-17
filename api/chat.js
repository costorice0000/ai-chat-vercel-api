export default async function handler(req, res) {
    // 設置跨域 Header (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 處理預檢請求
    if (req.method === 'OPTIONS') return res.status(200).end();

    let message;
    try {
        // 關鍵修正：相容處理 Vercel 可能傳進來的字串或物件格式
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        message = body?.message;
    } catch (e) {
        return res.status(400).json({ error: "無法解析 JSON 數據" });
    }

    if (!message) {
        return res.status(400).json({ error: "訊息內容不能為空" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // 使用最穩定的 v1 版本路徑
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

        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiText });

    } catch (error) {
        return res.status(500).json({ error: "連線至 Google 失敗", details: error.message });
    }
}
