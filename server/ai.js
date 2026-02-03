import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Debugging
console.log("🔑 API Key Status:", process.env.GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌");

let model = null;
if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // 👇 USING THE LATEST STANDARD MODEL
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    console.log("🤖 Gemini Model: Ready (gemini-1.5-flash)");
  } catch (error) {
    console.error("❌ Model Init Failed:", error.message);
  }
}

const FALLBACK_RESPONSES = {
  "protein": "Protein is crucial! Aim for 1.6g to 2.2g per kg of body weight.",
  "creatine": "Creatine Monohydrate (5g/day) helps with strength and recovery.",
  "pain": "Sharp pain? STOP. Dull soreness? That's normal (DOMS). Keep moving lightly.",
  "sore": "Soreness is normal! Sleep well and eat protein to recover.",
  "diet": "Consistency is key! Stick to whole foods and hit your protein goal.",
  "kcal": "If you crossed your limit, don't worry! Just get back on track tomorrow. One meal won't ruin progress.",
  "default": "I'm currently offline. Please check the server console for API errors."
};

export async function getAIResponse(userMessage) {
  if (model) {
    try {
      const prompt = `You are an elite fitness coach for 'BaseLayer'. 
      Keep answers short (under 50 words), motivating, and factual.
      User asks: "${userMessage}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("❌ AI Generation Error:", error.message); 
    }
  }

  // Fallback Logic
  const lowerMsg = userMessage.toLowerCase().trim();
  
  if (lowerMsg === 'hi' || lowerMsg === 'hello' || lowerMsg === 'hey') {
    return "Hey! I'm your BaseLayer Coach. Ask me about your diet, workout, or form!";
  }

  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lowerMsg.includes(key)) return response;
  }
  
  return FALLBACK_RESPONSES["default"];
}