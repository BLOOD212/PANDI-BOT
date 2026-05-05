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
          { role: 'system', content: 'Sei il Bot di Blood.' },
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

// --- QUESTA PARTE SISTEMA L'ERRORE VERDE ---
let handler = m => m;
handler.all = async function (m) {
  // RIGA 35: Protezione totale contro il crash 'includes'
  if (!m || !m.text) return; 

  const text = (typeof m.text === 'string' ? m.text : '').toLowerCase();
  const botNumber = global.conn?.user?.jid?.split('@')[0];
  
  // Se il bot viene menzionato o se è una chat privata
  const isMentioned = botNumber && text.includes(botNumber);
  
  if (isMentioned || !m.isGroup) {
      // Qui il bot può elaborare la risposta
  }
}

export default handler;
