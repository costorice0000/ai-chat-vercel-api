import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "遺失 API KEY" });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 改用更明確的模型路徑名稱
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { message } = req.body;
    
    // 使用最簡化的請求結構
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error("DEBUG ERROR:", error.message);
    // 回傳具體錯誤訊息到前端
    return res.status(500).json({ 
      error: "Google 拒絕連線", 
      details: error.message,
      suggestion: "請確認 Vercel Region 是否為 Singapore"
    });
  }
}
