export default async function handler(req, res) {
    // 1. 設定跨域 Header，允許來自 GitHub Pages 的連線
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. 處理瀏覽器的預檢請求 (Preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. 確保只接受 POST 請求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "請使用 POST 方法發送訊息" });
    }

    // 4. 解析前端傳來的資料，確保 message 存在
    let bodyData;
    try {
        bodyData = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: "無法解析 JSON 資料格式" });
    }

    const userMessage = bodyData?.message;
    if (!userMessage) {
        return res.status(400).json({ error: "訊息內容不能為空" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // 5. 呼叫 Google API：使用最穩定的 gemini-pro 模型
        // 使用 v1beta 搭配 gemini-pro 是目前相容性最高的組合
        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(googleUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await googleRes.json();
        
        // 檢查 Google 是否回報錯誤
        if (data.error) {
            return res.status(500).json({ 
                error: "Google API 服務報錯", 
                details: data.error.message 
            });
        }

        // 6. 成功取得回覆並傳回前端
        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        // 捕捉網路連線或伺服器內部的意外錯誤
        return res.status(500).json({ 
            error: "伺服器連線失敗", 
            details: error.message 
        });
    }
}
