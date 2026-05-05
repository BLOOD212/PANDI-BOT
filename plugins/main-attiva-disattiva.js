import { createAIService } from './risposte-ai.js'; 

// Chiave Groq spezzata
const p1 = 'gsk_6VlRfuGRq3pG0';
const p2 = 'RAc8knZWGdyb3FYGlEn';
const p3 = '0Y9t8U4gg38EGlT';
const p4 = 'tikgA';

const botAI = createAIService(p1 + p2 + p3 + p4);

const PERM = { ADMIN: 'admin', OWNER: 'owner', sam: 'sam' };

const featureRegistry = [
  { key: 'bestemmiometro', store: 'chat', perm: PERM.ADMIN, name: '*🤬 Bestemmiometro*', desc: 'Rileva e conta le bestemmie' },
  { key: 'antidelete', store: 'chat', perm: PERM.ADMIN, name: '*🗑️ Antidelete*', desc: 'Recupera messaggi eliminati' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, name: '*🛑 Antispam*', desc: 'Protezione flood e spam' },
  { key: 'antisondaggi', store: 'chat', perm: PERM.ADMIN, name: '*📊 Anti-sondaggi*', desc: 'Blocca creazione sondaggi' },
  { key: 'antiparolacce', store: 'chat', perm: PERM.ADMIN, name: '*🧼 Filtro parolacce*', desc: 'Rimuove insulti' },
  { key: 'antiBot', store: 'chat', perm: PERM.ADMIN, name: '*🤖 Antibot*', desc: 'Rimuove bot esterni' },
  { key: 'antitrava', store: 'chat', perm: PERM.ADMIN, name: '*🧨 Antitrava*', desc: 'Blocca messaggi crash' },
  { key: 'antimedia', store: 'chat', perm: PERM.ADMIN, name: '*🖼️ Antimedia*', desc: 'Elimina foto/video' },
  { key: 'antioneview', store: 'chat', perm: PERM.ADMIN, name: '*👁️ Antiviewonce*', desc: 'Blocca visualizzazione singola' },
  { key: 'antitagall', store: 'chat', perm: PERM.ADMIN, name: '*🏷️ Anti-tagall*', desc: 'Blocca menzioni massa' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, name: '*🔞 Antiporno*', desc: 'Filtro contenuti NSFW' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, name: '*🚫 Antigore*', desc: 'Blocca contenuti splatter' },
  { key: 'modoadmin', store: 'chat', perm: PERM.ADMIN, name: '*🛡️ Soloadmin*', desc: 'Comandi solo admin' },
  { key: 'antivoip', store: 'chat', perm: PERM.ADMIN, name: '*📞 Antivoip*', desc: 'Blocca numeri stranieri' },
  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, name: '*🔗 Antilink*', desc: 'Blocca link WhatsApp' },
  { key: 'antiLinkUni', store: 'chat', perm: PERM.ADMIN, name: '*🌍 Antilink Uni*', desc: 'Blocca ogni URL' },
  { key: 'antiLink2', store: 'chat', perm: PERM.ADMIN, name: '*🌐 Antilinksocial*', desc: 'Blocca link social' },
  { key: 'antinuke', store: 'chat', perm: PERM.ADMIN, name: '*🛡️ Antinuke*', desc: 'Protezione anti-raid' },
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, name: '*👋 Welcome*', desc: 'Messaggio benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, name: '*🚪 Addio*', desc: 'Messaggio addio' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, name: '*🧠 Bot IA*', desc: 'Intelligenza Artificiale attiva' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, name: '*👀 Lettura*', desc: 'Auto-visualizzazione' },
  { key: 'registrazioni', store: 'bot', perm: PERM.OWNER, name: '*📛 Registrazione*', desc: 'Obbligo registrazione' }
];

const aliasMap = new Map();
featureRegistry.forEach(f => aliasMap.set(f.key.toLowerCase(), f));

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isSam }) => {
  const isEnable = ['enable', 'attiva', 'on', '1'].includes(command?.toLowerCase());
  global.db.data.chats = global.db.data.chats || {};
  global.db.data.settings = global.db.data.settings || {};
  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const botJid = conn.decodeJid(conn.user.jid);
  const botSettings = global.db.data.settings[botJid] || (global.db.data.settings[botJid] = {});

  if (args[0]) {
    let type = args[0].toLowerCase();
    const feat = aliasMap.get(type);
    if (!feat) return m.reply(`『 ❌ 』 Modulo *${type}* non trovato.`);
    
    // Controllo permessi
    if (feat.perm === PERM.OWNER && !isOwner && !isSam) return m.reply('『 ❌ 』 Accesso negato.');
    if (feat.perm === PERM.ADMIN && !isAdmin && !isOwner && !isSam) return m.reply('『 ❌ 』 Accesso negato.');
    
    const target = feat.store === 'bot' ? botSettings : chat;
    target[feat.key] = isEnable;
    return m.reply(`*〘 📡 BLD-SYSTEM 〙*\n\nModulo: ${feat.name}\nStato: *${isEnable ? 'ATTIVATO 🟢' : 'DISATTIVATO 🔴'}*`);
  }

  // Menu visualizzazione stati
  const getStatus = (f) => (f.store === 'bot' ? botSettings[f.key] : chat[f.key]) ? '🟢' : '🔴';
  let menu = `┎━━━━━━━━━━━━━━━━━━━━┑\n┃   ✧  *𝐁𝐋𝐃 - 𝐌𝐀𝐒𝐓𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋* ✧   ┃\n┖━━━━━━━━━━━━━━━━━━━━┙\n\n`;
  featureRegistry.forEach(f => {
      menu += `┇ ${getStatus(f)} ${f.name}\n┇ _${f.desc}_\n┇ ➤ *${usedPrefix}${command} ${f.key}*\n┇\n`;
  });
  menu += `_ʙʟᴅ-ʙᴏᴛ sᴇᴄᴜʀɪᴛʏ ɪɴᴛᴇʀꜰᴀᴄᴇ_`;
  return conn.sendMessage(m.chat, { text: menu }, { quoted: m });
};

// Logica AI automatica
handler.before = async function (m) {
  if (!m.text || m.fromMe || m.isBaileys) return;
  if (/^[.!#]/.test(m.text)) return; // Salta se è un comando
  
  const chat = global.db.data?.chats?.[m.chat];
  if (!chat?.ai) return; // Se il modulo AI non è attivo (🔴), esce

  // Trigger: risponde solo se scrivi "bot" nel messaggio
  if (!/\bbot\b/i.test(m.text)) return;

  try {
    // Effetto "sta scrivendo..."
    await this.sendPresenceUpdate('composing', m.chat);
    
    const reply = await botAI.generateReply({
      messageText: m.text,
      authorName: m.pushName || 'User',
      chatId: m.chat,
      authorId: m.sender
    });
    
    if (reply) return this.reply(m.chat, reply, m);
  } catch (e) {
    console.error('[ERRORE IA PLUGIN]:', e);
  }
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
