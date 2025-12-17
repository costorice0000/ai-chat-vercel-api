export default async function handler(req, res) {
    // 1. 設置跨域 Header (讓 GitHub Pages 可以連通)
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 2. 解析前端傳來的訊息
    let bodyData;
    try {
        bodyData = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: "無法解析資料格式" });
    }

    const userMessage = bodyData?.message;
    if (!userMessage) return res.status(400).json({ error: "訊息內容不能為空" });

    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // 3. 【關鍵】直接使用 Google API 的穩定網址，避開所有 SDK 導致的 404
        const googleUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(googleUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await googleRes.json();
        
        // 如果 Google 返回錯誤訊息
        if (data.error) {
            return res.status(500).json({ error: "Google API 報錯", details: data.error.message });
        }

        // 4. 回傳 AI 的回答
        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: "伺服器連線失敗", details: error.message });
    }
}
