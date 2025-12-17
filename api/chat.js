export default async function handler(req, res) {
    // 1. 強制跨域 Header，允許 GitHub Pages 呼叫
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. 處理瀏覽器的預檢請求 (Preflight)
    if (req.method === 'OPTIONS') return res.status(200).end();

    // 3. 檢查是否為 POST 方法 (從 Logs 看到曾有 GET 請求導致 400)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "請使用 POST 方法發送訊息" });
    }

    // 4. 強制手動解析 Body (解決 image_af35a4 報錯)
    let message;
    try {
        const body = (typeof req.body === 'string') ? JSON.parse(req.body) : req.body;
        message = body?.message;
    } catch (e) {
        return res.status(400).json({ error: "無法解析 JSON 數據" });
    }

    if (!message) {
        return res.status(400).json({ error: "訊息內容不能為空" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // 5. 手動呼叫 Google API，避開 SDK 在不同版本的 404 問題
        // 使用 v1 穩定版，解決 image_af9399 提到的 v1beta 找不到模型問題
        const googleUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const googleRes = await fetch(googleUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await googleRes.json();
        
        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: "連線至 Google 失敗", details: error.message });
    }
}
