export default async function handler(req, res) {
    // 處理 CORS 跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message } = req.body;
    // 使用 trim() 確保沒有換行符或空格
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey || apiKey.length < 10) {
        return res.status(500).json({ error: "伺服器未讀取到有效的 GEMINI_API_KEY，請檢查 Vercel 設定。" });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            // 直接回傳 Google 的錯誤內容以便偵錯
            return res.status(500).json({ error: "Google API 報錯: " + data.error.message });
        }

        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiText });
    } catch (error) {
        return res.status(500).json({ error: "連線至 AI 伺服器失敗。" });
    }
}
