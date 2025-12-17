export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const apiKey = process.env.GEMINI_API_KEY;

    // --- 偵錯區：如果沒讀到 Key，直接報錯告訴我們 ---
    if (!apiKey) {
        return res.status(500).json({ error: "Vercel 環境變數中找不到 GEMINI_API_KEY" });
    }
    // --------------------------------------------

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
    }
    
    const userMessage = body?.message;

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await googleRes.json();
        
        if (data.error) {
            // 如果 Google 還是說無效，把詳細錯誤傳回前端
            return res.status(500).json({ 
                error: "Google 拒絕了這把鑰匙", 
                details: data.error.message 
            });
        }

        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiText });

    } catch (error) {
        return res.status(500).json({ error: "伺服器錯誤", details: error.message });
    }
}
