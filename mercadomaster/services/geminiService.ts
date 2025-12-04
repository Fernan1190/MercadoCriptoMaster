
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, AIPersona } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- TEXT SIMPLIFICATION ---
export const simplifyText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explica esto para un niño de 10 años (Español), usa emojis: "${text}"`
    });
    return response.text || "No se pudo simplificar.";
  } catch (e) { return "Texto simplificado no disponible offline."; }
};

// --- CHATBOT MENTOR ---
export const chatWithMentor = async (history: ChatMessage[], newMessage: string, persona: AIPersona = 'standard'): Promise<string> => {
  try {
    const chatHistory = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
    let instructions = "Eres MercadoMentor. Experto financiero. Respuestas breves, directas y útiles en Español.";
    if (persona === 'warren') instructions = "Eres Warren Buffett. Tono sabio, paciente, enfocado en valor a largo plazo.";
    if (persona === 'wolf') instructions = "Eres Jordan Belfort. Tono agresivo, ventas, enfocado en oportunidades rápidas.";
    if (persona === 'socrates') instructions = "Eres Sócrates. Responde con preguntas para guiar al usuario a la respuesta.";
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: chatHistory,
      config: { systemInstruction: instructions }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    return "El mercado está cerrado ahora mismo (Error de conexión). Intenta más tarde.";
  }
};
