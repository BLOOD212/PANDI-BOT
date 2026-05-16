import { promises } from 'fs'
import { join } from 'path'

const defmenu = {
  before: `
✨🌌 🌟 🌌✨🌌 🌟 🌌✨
 🛠️  𝐏𝐀𝐍𝐃𝐈 - 𝐔𝐓𝐄𝐍𝐒𝐈𝐋𝐈  🛠️
✨🌌 🌟 🌌✨🌌 🌟 🌌✨

╭──────────────👤
│ 🧑‍🍳 𝐂𝐮𝐨cu: %name
│ 🧺 𝐒𝐞𝐭𝐭𝐨𝐫𝐞: Utensili & Attrezzi
╰──────────────🌾

🌟 *𝐈𝐋 𝐓𝐔𝐎 𝐂𝐀𝐑𝐑𝐄𝐋𝐋𝐎 𝐃𝐀 𝐋𝐀𝐕𝐎𝐑𝐎:*
`.trimStart(),
  header: '╭─── [ %category ] ───✨',
  body: '│  🛠️  %cmd',
  footer: '╰───────────────────── 🍪\n',
  after: `_✨ Utensili pronti all'uso selezionati da BLOOD ✨_`.trimEnd()
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let tags = {
    'strumenti': 'STRUMENTI PASTICCERIA'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let name = await conn.getName(m.sender) || 'Ospite'

    // Filtro plugin per la categoria strumenti (Invariato)
    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('strumenti'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin,
      }))

    // Costruzione del testo
    let _text = [
      defmenu.before.replace(/%name/g, name),
      defmenu.header.replace(/%category/g, tags['strumenti']),
      help.map(menu => menu.help.map(cmd => 
        defmenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
      ).join('\n')).join('\n'),
      defmenu.footer,
      defmenu.after
    ].join('\n')

    let fake = global.fake || {};

    await m.react('🛠️')

    // --- INVIO SOLO TESTO (IMMAGINE RIMOSSA) ---
    await conn.sendMessage(m.chat, {
      text: _text.trim(),
      contextInfo: {
        ...fake.contextInfo,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          ...fake.contextInfo?.forwardedNewsletterMessageInfo,
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🍪 𝐏𝐀𝐍𝐃𝐈𝐒𝐓𝐄𝐋𝐋𝐄 - 𝐓𝐎𝐎𝐋𝐒 🛠️"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore nel modulo utensili: ${e.message}`, m)
  }
}

handler.help = ['menustrumenti']
handler.tags = ['menu']
handler.command = ['menutools', 'menustrumenti']

export default handler
