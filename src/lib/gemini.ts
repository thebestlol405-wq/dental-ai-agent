import { GoogleGenerativeAI, ModelParams } from "@google/generative-ai";

const MODELS = ["gemini-3.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

let cachedWorkingModel: string | null = null;

export async function getWorkingModel(apiKey: string, params?: Partial<ModelParams>) {
  const genAI = new GoogleGenerativeAI(apiKey);

  if (cachedWorkingModel) {
    try {
      return genAI.getGenerativeModel({ ...params, model: cachedWorkingModel });
    } catch (e) {
      cachedWorkingModel = null;
    }
  }

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Quick test with minimal tokens
      await model.generateContent({ contents: [{ role: 'user', parts: [{ text: '.' }] }], generationConfig: { maxOutputTokens: 1 } });
      console.log(`Verified working model: ${modelName}`);
      cachedWorkingModel = modelName;
      return genAI.getGenerativeModel({ ...params, model: modelName });
    } catch (e) {
      console.warn(`Model ${modelName} failed, trying next...`);
    }
  }

  return genAI.getGenerativeModel({ ...params, model: MODELS[0] });
}
