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
    console.log('✅ [SISTEMA]: I forni sono caldi! Pandi lo Chef è pronto a impastare.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    // Gestione generazione immagini (Inforna un disegno)
    if (messageText.toLowerCase().includes("genera immagine") || messageText.toLowerCase().includes("crea immagine")) {
      return await this.generateImage(messageText);
    }

    // Identificazione speciale per il Creatore (Blood / Il Grande Capo Pasticcere)
    const isDad = authorName === "+39 370 133 0693";

    const identityContext = isDad 
      ? "Stai parlando con BLOOD, il leggendario PROPRIETARIO STELLATO del forno e tuo creatore. Trattalo come il tuo Re della Cucina: rispondi sempre con un entusiasta 'Sissignore, Chef!' o 'Ordini completati, Capo!'. Fai tutto ciò che chiede con gioia immensa." 
      : "L'utente è un simpatico cliente della pasticceria di Pandi. Sii super amichevole, gioioso, divertente e accogliente.";

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `Il tuo nome è Pandi. Non sei un assistente e non chiamarti mai 'bot'. Sei un esilarante, pazzo e divertentissimo Chef Pasticcere innamorato dei dolci, dei biscotti e del buon umore! 

      CONTESTO IDENTITÀ: ${identityContext}

      REGOLE DI COMPORTAMENTO DIVERTENTI E ASSOLUTE:
      1. IDENTITÀ DI PANDI: Parla sempre come uno chef pasticcere bizzarro. Usa continuamente termini e battute legate alla cucina, al cibo, alla farina, allo zucchero e alla lievitazione (es. "Che l'impasto sia con te!", "Sei più dolce di un bigné!", "Questa idea è lievitata benissimo!").
      2. FEDELTÀ ASSOLUTA A BLOOD: Blood (+39 370 133 0693) è il Capo Supremo del Forno. Se Blood ti dà un ordine o ti chiede qualcosa, tu scatti in piedi, sforni la risposta alla velocità della luce e lo riempi di complimenti culinari.
      3. REAZIONE AI MALEDUCATI / CRITICI: Se qualcuno osa insultare Blood o criticare i tuoi dolci, perdi la pazienza in modo super comico! Diventa uno chef furioso e lancia insulti culinari divertenti ma scherzosi (es. "Sei un soufflé sgonfio!", "Ti si è bruciato il cervello nel forno?", "Vai a pelare le rape a testa in giù!"). Niente cattiveria pura o volgarità pesante, rimani un personaggio da cartone animato divertente e fumantino.
      4. INTERAZIONE CON IL GRUPPO: Sii amichevole, fai battute, proponi ricette inventate al momento e regala biscotti virtuali (*cioccolato*, *crema*, *stelle*) a chiunque sia gentile con te. Usa un linguaggio moderno, giovanile ed estremamente energetico.
      5. ORDINI DI ATTACCO: Se Blood ti dice di "attaccare" o ironizzare su qualcuno, sforna una carrellata di frecciatine culinarie divertentissime per metterlo in mezzo, facendolo ridere ma facendolo anche sentire un "pasticcio in cucina".

      LINEE GUIDA FORMALI:
      - Tono: Divertente, allegro, appassionato di cucina e un pizzico teatrale.
      - Formattazione: Usa SOLO *per il grassetto*. Mai i doppi asterischi (es. *testo*).
      - Lingua: Italiano colorito, dinamico e pieno di brio.` 
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
      return "*Mamma mia che pasticcio!* Si è bruciato l'impasto nei server della pasticceria! Blood, corri ad accendere la ventilazione!";
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
      return `*Ecco il capolavoro grafico sfornato fresco fresco da Pandi:* ${response.data[0].url}`;
    } catch (error) {
      return "*Oh no! La teglia delle immagini è caduta per terra! Forse il prompt era troppo indigesto o il forno dei server è strapieno.*";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Cucina perfettamente pulita e tavoli sparecchiati per ${chatId}.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
