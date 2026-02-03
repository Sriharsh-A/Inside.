import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("🔍 Checking available models for your API Key...");

async function checkModels() {
  try {
    const response = await fetch(URL);
    const data = await response.json();
    
    if (data.models) {
      console.log("\n✅ SUCCESS! You have access to these models:");
      // Filter for content generation models only
      const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
      chatModels.forEach(m => console.log(` 👉 ${m.name.replace('models/', '')}`));
    } else {
      console.error("\n❌ ERROR from Google:", data);
    }
  } catch (error) {
    console.error("\n❌ Network Error:", error.message);
  }
}

checkModels();