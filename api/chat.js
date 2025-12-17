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

    try {
        // 【核心修正】切換至 v1 穩定版路徑，並使用 gemini-1.5-flash-latest
        // 這是目前 Google 官方推薦最不容易報 404 的組合
        const googleUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(googleUrl, {
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
                details: data.error.message 
            });
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: "伺服器連線失敗", details: error.message });
    }
}
