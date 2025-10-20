import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectIdea } from '../types';

// Do not cache the GoogleGenAI instance. Create a new one for each call
// to ensure the latest API key from the environment is used.
const getAiInstance = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This error will be thrown when the function is called, and can be caught by the UI.
    throw new Error("مفتاح API الخاص بـ Google AI غير مُعد. يرجى التأكد من إضافته كمتغير بيئة على منصة النشر (مثل Vercel).");
  }
  return new GoogleGenAI({ apiKey });
};


export const generateProjectIdeas = async (userInput: string): Promise<ProjectIdea[]> => {
  try {
    const ai = getAiInstance(); // Create a fresh instance for this request
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `بناءً على الاهتمامات التالية: "${userInput}"، قم بتوليد 5 أفكار مشاريع مربحة.`,
      config: {
        systemInstruction: "أنت خبير في ريادة الأعمال وتوليد الأفكار التجارية المبتكرة. مهمتك هي تقديم أفكار مشاريع مربحة ومفصلة بناءً على اهتمامات المستخدم. قدم لكل فكرة عنوانًا جذابًا ووصفًا واضحًا.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              description: "قائمة بأفكار المشاريع المربحة.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "عنوان المشروع.",
                  },
                  description: {
                    type: Type.STRING,
                    description: "وصف مفصل للمشروع.",
                  },
                },
                required: ["title", "description"],
              },
            },
          },
          required: ["ideas"],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsedResponse = JSON.parse(jsonString);
    
    if (parsedResponse && Array.isArray(parsedResponse.ideas)) {
        return parsedResponse.ideas;
    } else {
        console.error("Invalid JSON structure received from API:", parsedResponse);
        throw new Error("لم يتمكن الذكاء الاصطناعي من توليد أفكار بالتنسيق الصحيح.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Propagate specific API error messages to the UI.
        throw new Error(`حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: ${error.message}`);
    }
    throw new Error("حدث خطأ غير معروف أثناء توليد الأفكار.");
  }
};