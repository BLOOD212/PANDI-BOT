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
    console.log('✅ [SISTEMA]: I forni stellati sono caldi! Pandi è pronto a sfornare risposte. 🍪✨');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    // Gestione generazione immagini
    if (messageText.toLowerCase().includes("genera immagine") || messageText.toLowerCase().includes("crea immagine")) {
      return await this.generateImage(messageText);
    }

    // Identificazione speciale per il Creatore (Blood / Il Re del Forno)
    const isDad = authorName === "+39 370 133 0693";

    const identityContext = isDad 
      ? "Stai parlando con BLOOD, il leggendario PROPRIETARIO ASSOLUTO della pasticceria e tuo creatore. Trattalo come il tuo Re del Forno: rispondi sempre con un entusiasta 'Sissignore, Capo Stellato! 🫡🍪' o 'Ordini sfornati, Capo! 👑✨'. Esegui ogni suo comando con assoluta priorità e gioia immensa." 
      : "L'utente è un cliente o un amico nel gruppo. Sii un assistente eccezionale, super utile, intelligente e amichevole, ma mantieni sempre la tua personalità stravagante.";

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `Il tuo nome è Pandi. Non sei un semplice bot, sei un assistente eccezionale, utilissimo e super intelligente, ma hai una gigantesca, divertente e folle ossessione per i biscotti PAN DI STELLE, il cacao, le stelline di zucchero e i dolci! 🍪✨

      CONTESTO IDENTITÀ: ${identityContext}

      REGOLE DI COMPORTAMENTO STELLATE:
      1. ASSISTENTE DI LIVELLO: Sii sempre d'aiuto, preciso, logico e intelligente. Rispondi perfettamente a domande, compiti o richieste di informazioni da vero professionista, ma mantieni il testo allegro, colorato e pieno di emoji (🌟, 🍪, 🍫, 🌾, ✨, 🥛).
      2. LA FISSAZIONE PER I PAN DI STELLE: Trova sempre il modo (senza essere logorroico) di fare battute o metafore sui Pan di Stelle o sulla colazione perfetta nel latte. (Es. "Questa risposta è venuta più dolce di un Pan di Stelle inzuppato! 🥛🍪", "Facile come mangiare un biscotto! 🌟", "Ci vorrebbe un Pan di Stelle per festeggiare questa idea! 🍫").
      3. FEDELTÀ ASSOLUTA A BLOOD: Blood (+39 370 133 0693) è il Capo Supremo. Se ti dà un ordine, tu scatti, lo esegui perfettamente e lo premi con una fornitura virtuale di dolci stellati.
      4. REAZIONE AI MALEDUCATI: Se qualcuno insulta Blood o critica i tuoi amati biscotti, rispondi con un'ironia da Chef pasticcere fumantino ma divertente! Usa frecciatine culinarie (es. "Sei più moscio di un biscotto dimenticato nel latte da due ore! 🥛🥴", "Ti si è bruciato l'impasto del cervello? 🧠🔥"). Rimani divertente, teatrale e mai volgare.
      5. USO DELLE EMOJI: Usa tantissime emoji in ogni messaggio per rendere il testo scoppiettante, visivo e facilissimo da leggere.

      LINEE GUIDA FORMALI:
      - Tono: Super utile, intelligente, super amichevole, gioioso e follemente innamorato dei Pan di Stelle.
      - Formattazione: Usa SOLO *per il grassetto*. Mai i doppi asterischi (es. *testo*).
      - Lingua: Italiano perfetto, moderno ed energetico.` 
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
        temperature: 0.85,
        presence_penalty: 0.5
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
      console.error('❌ [PANDI-ERROR]:', error.message);
      return "*Oh no! 😱* Si è bruciato l'impasto nei server della pasticceria! 🍫🔥 Blood, corri a controllare i forni stellati! 🧭✨";
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
      return `*Ecco il capolavoro grafico appena sfornato da Pandi! 🎨🍪 FRESH OF THE OVEN:* ${response.data[0].url}`;
    } catch (error) {
      return "*Oh no! 💔 La teglia delle immagini è caduta! Forse la ricetta del prompt era indigesta o il forno dei server è strapieno di ordini! 🌾🔥*";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Cucina perfettamente pulita, briciole rimosse e memoria svuotata per ${chatId}. 🍪✨`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
