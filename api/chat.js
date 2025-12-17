export default async function handler(req, res) {
    // 處理 CORS 與 Preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { message } = req.body;
        // 使用 .trim() 確保 Key 前後沒有空白
        const apiKey = (process.env.GEMINI_API_KEY || "").trim();

        if (!apiKey) {
            return res.status(500).json({ error: "環境變數 GEMINI_API_KEY 遺失或未讀取成功。" });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            // 如果 Google 依然報錯，將錯誤詳細回傳以便偵錯
            return res.status(response.status).json({ error: data.error.message });
        }

        return res.status(200).json({ response: data.candidates[0].content.parts[0].text });
    } catch (error) {
        return res.status(500).json({ error: "伺服器內部發生錯誤：" + error.message });
    }
}
