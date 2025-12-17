import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "遺失 API 金鑰" });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 嘗試使用最基礎的 gemini-1.5-flash 名稱
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { message } = req.body;
    
    // 這裡加上一個簡單的超時機制設定
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });
    
    const response = await result.response;
    return res.status(200).json({ response: response.text() });
    
  } catch (error) {
    console.error("Gemini 詳細錯誤:", error);
    return res.status(500).json({ 
      error: "Google API 拒絕請求", 
      details: error.message 
    });
  }
}
