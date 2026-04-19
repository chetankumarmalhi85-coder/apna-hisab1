
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedExpense } from "../types";

export const parseExpenseText = async (text: string, customApiKey?: string): Promise<ParsedExpense | null> => {
  const apiKey = customApiKey || process.env.API_KEY;

  if (!apiKey) {
    console.error("Gemini AI not initialized. Missing API Key.");
    return null;
  }

  // We create a new instance to ensure we use the latest key provided
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      You are a smart finance tracker parser for Pakistan. 
      Analyze the following text (spoken phrase or bank SMS) and extract the financial details.
      
      Rules:
      1. Detect the amount (in PKR).
      2. Determine if it is an 'EXPENSE' (spent/paid/debit) or 'INCOME' (received/credited/salary).
      3. Categorize it. 
         - Expenses: 'Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Education', 'Entertainment'.
         - Income: 'Salary', 'Business'.
         - Neutral: 'Transfer', 'Other'.
      4. Create a short description (e.g., "Lunch at Dhaba", "Salary Received").
      5. Extract bank name if present.
      
      Input text: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ["EXPENSE", "INCOME"] },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            bankName: { type: Type.STRING },
          },
          required: ["amount", "type", "category", "description"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    
    // Validate output
    if (result.amount && result.category) {
      return result as ParsedExpense;
    }
    return null;

  } catch (error) {
    console.error("Error parsing expense with Gemini:", error);
    return null;
  }
};
