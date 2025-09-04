import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractKnowledgeText = (kb) =>
  Array.isArray(kb)
    ? kb.map(item => item.text).join('\n\n')
    : typeof kb === 'string'
      ? kb
      : '';

   export const getChatResponse = async (
        message,
        chatHistory = [],
        userSystemPrompt = '',
        knowledgeBase = ''
      ) => {
        console.log("knowledgeBase", knowledgeBase);
        try {
          const defaultSystemPrompt = `
      You are a knowledgeable and helpful AI assistant.
      Always respond clearly, concisely, and professionally.
      If a knowledge base is provided, use it strictly to answer the question. If the answer is not in the knowledge base, say so.
          `.trim();
      
          const finalSystemPrompt = [defaultSystemPrompt, userSystemPrompt.trim()]
            .filter(Boolean)
            .join('\n\n');
      
          const knowledgeText = extractKnowledgeText(knowledgeBase);
      
          const mergedMessage = knowledgeText
            ? `${knowledgeText}\n\nUser Question:\n${message}`
            : message;
      
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: finalSystemPrompt,
          });
      
          const chatSession = model.startChat({
            history: chatHistory.map(msg => ({
              role: msg.role === 'bot' ? 'model' : msg.role,
              parts: [{ text: msg.content }],
            })),
          });
      
          const result = await chatSession.sendMessage(mergedMessage);
          const response = result.response;
      
          return response.text();
        } catch (error) {
          console.error('Gemini API Error:', error);
          return 'I apologize, but I encountered an error while processing your request. Please try again.';
        }
      };

