import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GEMINI_API_KEY;
  
  // 診斷：如果沒抓到 Key，直接回報
  if (!apiKey) {
    return res.status(500).json({ error: "Vercel 沒抓到 GEMINI_API_KEY，請檢查 Environment Variables" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const { message } = req.body;
    
    // 使用最基礎的格式發送
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return res.status(200).json({ response: response.text() });
  } catch (error) {
    console.error("詳細錯誤內容:", error);
    return res.status(500).json({ 
      error: "Google 伺服器回傳錯誤", 
      message: error.message,
      stack: error.stack // 這能幫我們看到是哪一行出錯
    });
  }
}
