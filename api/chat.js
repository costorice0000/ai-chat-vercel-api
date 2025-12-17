export default async function handler(req, res) {
    // 1. 設定跨域 Header，允許來自 GitHub Pages 的連線
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. 處理預檢請求 (Preflight)
    if (req.method === 'OPTIONS') return res.status(200).end();

    // 3. 解析前端訊息
    let bodyData;
    try {
        bodyData = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: "無法解析資料格式" });
    }

    const userMessage = bodyData?.message;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Vercel 找不到 API Key" });

    try {
        // 4. 【核心修正】改用 v1 穩定版路徑 + gemini-1.5-flash
        // 這是 Google 目前在全球最通用的路徑
        const googleUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(googleUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await googleRes.json();
        
        // 5. 檢查 Google 是否回報錯誤
        if (data.error) {
            return res.status(500).json({ 
                error: "Google 服務報錯", 
                details: data.error.message 
            });
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: "伺服器連線失敗", details: error.message });
    }
}
