import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. 設定 CORS (讓 GitHub Pages 可以連過來)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. 檢查 API Key 是否存在
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "伺服器遺失 GEMINI_API_KEY" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { message } = req.body;
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return res.status(200).json({ response: response.text() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "AI 服務暫時無法運作", details: error.message });
  }
}
