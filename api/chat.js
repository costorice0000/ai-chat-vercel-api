export default async function handler(req, res) {
    // 1. 強制跨域 Header，解決 GitHub Pages 連線問題
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. 處理預檢請求
    if (req.method === 'OPTIONS') return res.status(200).end();

    // 3. 確保只接受 POST 請求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "請使用 POST 方法發送訊息" });
    }

    // 4. 解析前端傳來的 message (相容字串與物件格式)
    let bodyData;
    try {
        bodyData = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: "無法解析資料格式" });
    }

    const userMessage = bodyData?.message;
    if (!userMessage) {
        return res.status(400).json({ error: "訊息內容不能為空" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // 5. 使用穩定版 v1 API 路徑，解決 v1beta 找不到模型的問題
        const googleUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(googleUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await googleRes.json();
        
        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        // 成功取得回覆
        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: "連線至 Google 失敗", details: error.message });
    }
}
