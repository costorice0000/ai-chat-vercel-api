// api/chat.js
import { GoogleGenAI } from "@google/genai";

// 函式會從 Vercel 的環境變數中讀取金鑰，非常安全
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY); 

// Vercel Function 的入口函式
export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Missing message parameter" });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
        });

        res.status(200).json({ 
            response: response.text, 
            timestamp: new Date().toISOString() 
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "AI 服務發生錯誤，請檢查伺服器日誌。", details: error.message });
    }
};
