export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

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
        // 【關鍵修正】將模型名稱換成最通用的 gemini-1.5-flash-latest 或 gemini-pro
        const googleUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(googleUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await googleRes.json();
        
        if (data.error) {
            // 如果連 latest 都找不到，我們嘗試回傳更具體的錯誤
            return res.status(500).json({ error: "Google 拒絕請求", details: data.error.message });
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: "伺服器連線失敗", details: error.message });
    }
}
