import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "伺服器遺失 API 金鑰" });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const { message } = req.body;
    
    // 確保訊息格式完全符合 Google 要求
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    // 這裡是關鍵：將詳細錯誤傳回前端
    return res.status(500).json({ 
      error: "AI 服務呼叫失敗", 
      details: error.message,
      type: error.constructor.name 
    });
  }
}
