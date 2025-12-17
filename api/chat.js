export default async function handler(req, res) {
    // 1. 設置跨域 Header
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 2. 解析前端傳來的訊息
    let bodyData;
    try {
        bodyData = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: "無法解析 JSON" });
    }

    const message = bodyData?.message;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "Vercel 找不到 API Key" });
    }

    try {
        // 3. 【核心修正】換成絕對存在的 gemini-pro 模型
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await googleRes.json();
        
        if (data.error) {
            return res.status(500).json({ 
                error: "Google 服務報錯", 
                message: data.error.message 
            });
        }

        // 4. 成功取得 AI 回覆
        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiText });

    } catch (error) {
        return res.status(500).json({ error: "連線失敗", details: error.message });
    }
}
