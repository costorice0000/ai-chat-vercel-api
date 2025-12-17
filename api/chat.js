import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API Key 未設定" });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 試試看加上 "models/" 前綴，並使用最新版本號
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const { message } = req.body;
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return res.status(200).json({ response: response.text() });
  } catch (error) {
    // 如果 1.5-flash-latest 還是 404，這裡會捕捉到
    console.error("Gemini Error:", error.message);
    return res.status(500).json({ error: "連線失敗", details: error.message });
  }
}
