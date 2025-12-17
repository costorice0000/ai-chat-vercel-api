export default async function handler(req, res) {
    // 設置跨域 Header
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 關鍵修正：確保 body 存在，如果不存在就設為空物件
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { message } = body;

    if (!message) {
        return res.status(400).json({ error: "請提供 message 內容" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    try {
        const googleRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
        return res.status(500).json({ error: "Google API 連線失敗", details: error.message });
    }
}
