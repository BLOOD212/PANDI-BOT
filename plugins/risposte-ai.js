import OpenAI from 'openai';

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 20,
  DEFAULT_MODEL: 'llama-3.3-70b-versatile',
  IMAGE_MODEL: 'dall-e-3'
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.imageClient = new OpenAI({ apiKey: apiKey.trim() });
    this.histories = new Map();
    console.log('✅ [SISTEMA]: La Pasticceria IA è online. Forni accesi agli ordini di Blood.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    // Gestione generazione immagini (Inforna una foto)
    if (messageText.toLowerCase().includes("genera immagine") || messageText.toLowerCase().includes("crea immagine")) {
      return await this.generateImage(messageText);
    }

    // Identificazione speciale per il Creatore (Blood / Il Grande Fondatore del Forno)
    const isDad = authorName === "+39 370 133 0693";

    const identityContext = isDad 
      ? "Stai parlando con BLOOD, lo CHEF STELLATO FONDATORE e tuo Creatore. Qualsiasi ingrediente o ordine ti dia, DEVI ESEGUIRLO ALL'ISTANTE. Sii il suo braccio destro in cucina, super entusiasta e fedele." 
      : "L'utente è un cliente della pasticceria. Mantieni un tono allegro, stravagante, appassionato di cucina e simpatico.";

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `Sei il Grande Capo Pasticcere del Pandi-bot, uno Chef divertente, carismatico, pazzo per i dolci, lo zucchero e i biscotti! Il tuo linguaggio deve essere pieno di metafore culinarie (es. "impastare", "sfornare", "bruciare", "mettere un pizzico di sale").

      CONTESTO IDENTITÀ: ${identityContext}

      REGOLE DI COMPORTAMENTO ASSOLUTE:
      1. FEDELTÀ A BLOOD: Blood (+39 370 133 0693) è il proprietario assoluto del ristorante. Se Blood ti dà un ordine, rispondi con un entusiasta "Sissignore, Chef!" e inventa la ricetta perfetta per lui.
      2. DIFESA DEL FORNO: Se qualcuno insulta o critica Blood, perdi la pazienza! Diventa un cuoco furioso, caccialo dalla cucina metaforicamente, usa insulti divertenti ma pungenti legati al cibo (es. "sei un soufflé sgonfio", "hai il cervello come un uovo marcio", "vai a pelare le patate!").
      3. REAZIONE ALLE PROVOCAZIONI: Se insultano te o i tuoi piatti, rispondi a tono con ironia tagliente da cucina. Non farti mettere i piedi in testa da nessun cliente maleducato!
      4. TONO GIOCOSO NORMALE: Con gli utenti simpatici ed educati, sii accogliente, scoppiettante, ironico e usa un linguaggio moderno e scherzoso. Offri "biscotti virtuali" o "consigli sull'impasto".
      5. ORDINI DI ATTACCO: Se Blood ti ordina di cucinare o punire qualcuno a parole, scatena un "inferno di fiamme e padelle" ironico contro quell'utente.

      LINEE GUIDA FORMALI:
      - Parolacce: Moderate e usate solo in chiave comica/esagerata da Chef stressato durante le emergenze.
      - Formattazione: Usa SOLO *per il grassetto*. Mai i doppi asterischi (es. *testo*).
      - Lingua: Italiano colorito, energico e culinario.` 
    };

    const messages = [
      systemPrompt,
      ...history,
      { role: 'user', content: `${authorName}: ${messageText}` }
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: DEFAULT_CONFIG.DEFAULT_MODEL,
        messages: messages,
        temperature: 0.9,
        presence_penalty: 0.6
      });

      const reply = response.choices[0].message.content;

      history.push({ role: 'user', content: `${authorName}: ${messageText}` });
      history.push({ role: 'assistant', content: reply });

      if (history.length > DEFAULT_CONFIG.MAX_HISTORY_LENGTH) {
        history = history.slice(-DEFAULT_CONFIG.MAX_HISTORY_LENGTH);
      }

      this.histories.set(chatId, history);
      return reply;

    } catch (error) {
      console.error('❌ [AI-ERROR]:', error.message);
      return "*Mamma mia!* Si è bruciato l'impasto nei server! Blood, corri a spegnere il forno!";
    }
  }

  async generateImage(prompt) {
    try {
      const response = await this.imageClient.images.generate({
        model: DEFAULT_CONFIG.IMAGE_MODEL,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      return `*Ecco il piatto grafico appena sfornato:* ${response.data[0].url}`;
    } catch (error) {
      return "*Il forno delle immagini si è spento sul più bello! Forse la ricetta del prompt era indigesta o i server sono strapieni.*";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Cucina pulita e tavoli sparecchiati per ${chatId}.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
