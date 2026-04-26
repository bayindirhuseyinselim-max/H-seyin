import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CACHE_KEY = 'birthday_poem_cache';

export async function generateBirthdayPoem(name: string) {
  // Try to load from cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { poem, timestamp, cachedName } = JSON.parse(cached);
      // Cache valid for 24 hours and if name matches
      if (cachedName === name && Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return poem;
      }
    }
  } catch (e) {
    console.warn("Cache read error:", e);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Betül isimli bir kız için çok romantik, duygusal ve anlamlı bir doğum günü şiiri yaz. 
      Onun ne kadar özel olduğunu, doğum gününün hayatına getirdiği güzelliği anlat. 
      Dil: Türkçe. Çıktı sadece şiir olsun.`,
    });
    
    const poem = response.text || "Nice mutlu yaşlara, her günün huzurla dolsun. İyi ki varsın Betül!";
    
    // Save to cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        poem,
        timestamp: Date.now(),
        cachedName: name
      }));
    } catch (e) {
      console.warn("Cache write error:", e);
    }

    return poem;
  } catch (error) {
    console.error("Gemini Error:", error);
    // If it's a 429 or any error, return a fallback but don't cache it (so we can try again later)
    return "Yıllar geçse de eskimeyen, her gün daha da güzelleşen bir aşkla bağlıyım sana. Doğum günün kutlu olsun, kalbimin prensesi Betül!";
  }
}
