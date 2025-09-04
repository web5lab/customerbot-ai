import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBhAjlW8brz5hShcXfLk9ksgCDFFNk2ywo');

export async function getChatResponse(message) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a Web3 expert chatbot. Your responses should be focused on blockchain, 
    cryptocurrency, smart contracts, and decentralized applications. 
    
    User question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'I apologize, but I encountered an error while processing your request. Please try again.';
  }
}