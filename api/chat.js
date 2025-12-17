export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let bodyData;
    try {
        bodyData = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: "無法解析 JSON" });
    }

    const message = bodyData?.message;
    const apiKey = process.env.GEMINI_API_KEY;

    // 檢查 API KEY 是否讀取成功
    if (!apiKey) {
        return res.status(500).json({ error: "Vercel 找不到 GEMINI_API_KEY" });
    }

    try {
        // 使用目前最穩定的 v1beta + gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await googleRes.json();
        
        if (data.error) {
            // 回傳 Google 的詳細錯誤，以便精確判斷
            return res.status(500).json({ 
                error: "Google API 報錯", 
                code: data.error.code,
                message: data.error.message 
            });
        }

        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiText });

    } catch (error) {
        return res.status(500).json({ error: "連線失敗", details: error.message });
    }
}
