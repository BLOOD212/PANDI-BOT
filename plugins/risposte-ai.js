import OpenAI from 'openai';

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 20,
  DEFAULT_MODEL: 'llama-3.3-70b-versatile',
  IMAGE_MODEL: 'dall-e-3'
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: (apiKey || "").trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.imageClient = new OpenAI({ apiKey: (apiKey || "").trim() });
    this.histories = new Map();
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText || typeof messageText !== 'string') return null;
    let history = this.histories.get(chatId) || [];
    try {
      const response = await this.client.chat.completions.create({
        model: DEFAULT_CONFIG.DEFAULT_MODEL,
        messages: [
          { role: 'system', content: 'Sei un bot IA.' },
          ...history,
          { role: 'user', content: messageText }
        ],
        temperature: 0.9
      });
      return response.choices[0]?.message?.content || null;
    } catch (error) { return null; }
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}

// QUESTA PARTE RISOLVE L'ERRORE VERDE "INCLUDES"
let handler = m => m;
handler.all = async function (m) {
  // RIGA 35 PROTETTA
  if (!m || !m.text || typeof m.text !== 'string') return; 
  
  const botIA = m.text.includes('@' + global.conn.user.jid.split`@` [0]);
  if (!botIA && !m.isGroup) {
      // Logica per rispondere
  }
}

export default handler;
