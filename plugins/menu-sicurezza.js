import fetch from 'node-fetch'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix: _p, command, args, isOwner, isAdmin }) => {
  const userName = m.pushName || 'Utente'

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid]

  // --- CONFIGURAZIONE MODULI (Invariata) ---
  const securityFeatures = [
    { key: 'antigore', name: '🚫 Antigore', desc: 'Blocca contenuti splatter/gore' },
    { key: 'modoadmin', name: '🛡️ Soloadmin', desc: 'Solo gli admin usano il bot' },
    { key: 'antivoip', name: '📞 Antivoip', desc: 'Rifiuta chiamate nel gruppo' },
    { key: 'antilink', name: '🔗 Antilink', desc: 'Elimina link gruppi WhatsApp' },
    { key: 'antilinksocial', name: '🌐 Antilinksocial', desc: 'Elimina link social (IG, TT, ecc)' },
    { key: 'antitrava', name: '🧱 Antitrava', desc: 'Blocca crash/messaggi lunghi' },
    { key: 'antinuke', name: '☢️ Antinuke', desc: 'Sicurezza avanzata del gruppo' },
    { key: 'antiviewonce', name: '👁️ Antiviewonce', desc: 'Invia messaggi visualizza una volta' },
    { key: 'antispam', name: '🛑 Antispam', desc: 'Blocca spam di comandi' }
  ]

  const automationFeatures = [
    { key: 'ai', name: '🧠 IA', desc: 'Intelligenza artificiale attiva' },
    { key: 'vocali', name: '🎤 Siri', desc: 'Risponde con audio ai messaggi' },
    { key: 'reaction', name: '😎 Reazioni', desc: 'Reazioni automatiche ai messaggi' },
    { key: 'autolevelup', name: '⬆️ Autolivello', desc: 'Messaggio di livello automatico' },
    { key: 'welcome', name: '👋 Welcome', desc: 'Messaggio di benvenuto' }
  ]

  const ownerFeatures = [
    { key: 'anticall', name: '📵 Antichiamate', desc: 'Blocca chiamate al bot (Global)' },
    { key: 'antiprivate', name: '🔒 Antiprivato', desc: 'Blocca uso del bot in privato' },
    { key: 'solocreatore', name: '👑 Solo Creatore', desc: 'Bot risponde solo all\'owner' }
  ]

  // --- GENERAZIONE MENU PANDI-BOT ---
  if (!args.length || /menu|help/i.test(args[0])) {
    let text = `
✨🌌 🌟 🌌✨🌌 🌟 🌌✨
 🛡️  𝐏𝐀𝐍𝐃𝐈 - 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘  🛡️
✨🌌 🌟 🌌✨🌌 🌟 🌌✨

╭──────────────👤
│ 🧑‍🍳 𝐂𝐮𝐨𝐜𝐨: ${userName}
│ 📡 𝐒𝐭𝐚𝐭𝐮𝐬: Sicurezza Attiva
╰──────────────🌾

🌾 *𝐈𝐒𝐓𝐑𝐔𝐙𝐈𝐎𝐍𝐈 𝐅𝐎𝐑𝐍𝐎:*
> Attiva o disattiva i moduli:
│  ➤  ${_p}*attiva* [nome]
│  ➤  ${_p}*disattiva* [nome]

╭─── [ 🌾 PROTEZIONE FORNO ] ───✨
${securityFeatures.map(f => `│  ${f.name}\n│  _${f.desc}_\n│  » Comando: *${f.key}*\n│`).join('\n')}
╰───────────────────── 🍪

╭─── [ 🤖 AUTOMAZIONE ] ───✨
${automationFeatures.map(f => `│  ${f.name}\n│  _${f.desc}_\n│  » Comando: *${f.key}*\n│`).join('\n')}
╰───────────────────── 🍪

_✨ Protezione totale curata da BLOOD ✨_`

    // Invio solo testo, senza immagine
    await conn.sendMessage(m.chat, { 
      text: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🍪 𝐏𝐀𝐍𝐃𝐈𝐒𝐓𝐄𝐋𝐋𝐄 - 𝐒𝐘𝐒𝐓𝐄𝐌 🛡️"
        }
      }
    }, { quoted: m })
    return
  }

  // --- LOGICA DI ATTIVAZIONE (Invariata) ---
  let isEnable = !/disattiva|off|0/i.test(command)
  let type = args[0].toLowerCase()
  let status = isEnable ? 'ATTIVATO 🌾' : 'DISATTIVATO ❌'

  let dbKey = type
  if (type === 'antilink') dbKey = 'antiLink'
  if (type === 'antilinksocial') dbKey = 'antiLink2'
  if (type === 'antiviewonce') dbKey = 'antioneview'
  if (type === 'antiprivate') dbKey = 'antiPrivate'
  if (type === 'solocreatore') dbKey = 'soloCreatore'

  const isSecurity = securityFeatures.some(f => f.key.toLowerCase() === type)
  const isAuto = automationFeatures.some(f => f.key.toLowerCase() === type)
  const isOwnerKey = ownerFeatures.some(f => f.key.toLowerCase() === type)

  if (isSecurity || isAuto) {
    if (!m.isGroup && !isOwner) return m.reply('❌ Solo nei gruppi')
    if (m.isGroup && !isAdmin && !isOwner) return m.reply('🛡️ Solo per Admin')
    chat[dbKey] = isEnable
  } else if (isOwnerKey) {
    if (!isOwner) return m.reply('👑 Solo per l\'Owner')
    bot[dbKey] = isEnable
  } else {
    return m.reply('❓ Modulo non trovato nell\'impasto.')
  }

  await m.react(isEnable ? '✅' : '❌')
  m.reply(`『 🍪 』 *SISTEMA AGGIORNATO*\n\nModulo: *${type.toUpperCase()}*\nStato: *${status}*`)
}

handler.command = ['attiva', 'disattiva', 'on', 'off', 'enable', 'disable']
export default handler
