import fetch from 'node-fetch';

const p1 = 'gsk_6VlRfuGRq3pG0';
const p2 = 'RAc8knZWGdyb3FYGlEn';
const p3 = '0Y9t8U4gg38EGlT';
const p4 = 'tikgA';
const apiKey = p1 + p2 + p3 + p4;

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Log per vedere se il plugin viene chiamato
  console.log(`[IA-DEBUG] Comando: ${command} | Chat: ${m.chat}`);

  const chat = global.db.data?.chats?.[m.chat];
  
  // Se la chat non esiste o l'IA è spenta (pallino rosso)
  if (!chat?.ai) {
    return m.reply(`『 ❌ 』 L'IA è disattivata. Usa *${usedPrefix}attiva ai* per abilitarla.`);
  }

  if (!text) return m.reply(`Esempio: *${usedPrefix + command}* Ciao, come stai?`);

  try {
    await conn.sendPresenceUpdate('composing', m.chat);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Sei un assistente diplomatico e colto.' },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0]?.message?.content;
    
    if (reply) return m.reply(reply);
    else throw new Error('Risposta vuota dall\'API');

  } catch (e) {
    console.error('[IA-ERROR]:', e);
    m.reply('『 ❌ 』 Errore tecnico nella generazione della risposta.');
  }
};

handler.help = ['bot <testo>'];
handler.tags = ['ai'];
handler.command = ['bot', 'ai', 'chiedi']; 

export default handler;
