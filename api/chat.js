import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing API Key" });

  try {
    // 【重點】在這裡強制指定使用 v1 版本，不要用預設的 v1beta
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 改用明確的模型對接方式
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: "v1" } // 強制切換 API 版本
    );

    const { message } = req.body;
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return res.status(200).json({ response: response.text() });
  } catch (error) {
    console.error("DEBUG ERROR:", error.message);
    return res.status(500).json({ 
      error: "API 連線失敗", 
      details: error.message 
    });
  }
}
