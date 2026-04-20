
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

export const parseBulkExpenseText = async (text: string, customApiKey?: string): Promise<ParsedExpense[]> => {
  const apiKey = customApiKey || process.env.API_KEY;

  if (!apiKey) {
    console.error("Gemini AI not initialized. Missing API Key.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      You are a smart finance parser for Pakistani bank or microfinance screenshots.
      The input is OCR text from a screenshot containing one or more transaction lines.
      Extract each individual transaction and return a JSON array of objects.
      Each object must include:
      - amount (PKR number)
      - type (EXPENSE or INCOME)
      - category (one of Food, Transport, Bills, Shopping, Health, Education, Entertainment, Salary, Business, Transfer, Other)
      - description (short human-readable description)
      - bankName if available
      Only include real transaction entries. Do not wrap the result in extra text.

      Input text:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
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
      },
    });

    const result = JSON.parse(response.text || '[]');
    if (Array.isArray(result)) {
      return result as ParsedExpense[];
    }
    return [];
  } catch (error) {
    console.error("Error parsing bulk expense text with Gemini:", error);
    return [];
  }
};
