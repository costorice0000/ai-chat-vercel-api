export default async function handler(req, res) {
    // 解決跨域問題
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // 這是你在 Vercel 設定的名稱

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
            return res.status(500).json({ error: data.error.message });
        }

        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiText });
    } catch (error) {
        return res.status(500).json({ error: "伺服器內部錯誤" });
    }
}
