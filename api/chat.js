import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "伺服器環境變數 GEMINI_API_KEY 未設定" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // 使用 flash 模型通常反應最快且限制較少
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { message } = req.body;
    
    // 設定超時保護
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error("Gemini Error Detail:", error);
    // 回傳具體的錯誤訊息到前端，方便我們除錯
    return res.status(500).json({ 
      error: "AI 服務呼叫失敗", 
      message: error.message 
    });
  }
}
