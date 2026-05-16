import { xpRange } from '../lib/levelling.js'
import { join } from 'path'

const defaultMenu = {
  before: `
✨🌌 🌟 🌌✨🌌 🌟 🌌✨
 ⭐  𝐏𝐀𝐍𝐃𝐈 - 𝐏𝐑𝐄𝐌𝐈𝐔𝐌  ⭐
✨🌌 🌟 🌌✨🌌 🌟 🌌✨

╭──────────────👤
│ 🧑‍🍳 𝐂𝐮𝐨𝐜𝐨: %name
│ 🏆 𝐑𝐚𝐧𝐤: %role
│ ⭐ 𝐒𝐭𝐚𝐭𝐮𝐬: Pasticcere Élite
╰──────────────🌾

🌟 *𝐈𝐍𝐆𝐑𝐄𝐃𝐈𝐄𝐍𝐓𝐈 𝐒𝐄𝐆𝐑𝐄𝐓𝐈 (𝐏𝐑𝐎):*
`.trimStart(),
  header: '╭─── [ %category ] ───✨',
  body: '│  👑  *%cmd*',
  footer: '╰───────────────────── 🍪\n',
  after: `_✨ Ricette esclusive sfornate con amore da BLOOD ✨_`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let tags = {
    'prem': 'INGREDIENTI PREMIUM'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let user = global.db.data.users[m.sender] || {}
    let { level = 0, role = 'User' } = user
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    // Filtraggio plugin premium (Invariato)
    let help = Object.values(global.plugins).filter(p => !p.disabled && p.tags && (p.tags.includes('premium') || p.tags.includes('prem') || p.tags.includes('premio'))).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before,
      defaultMenu.header.replace(/%category/g, tags['prem']),
      help.map(menu => menu.help.map(cmd => 
        defaultMenu.body.replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
      ).join('\n')).join('\n'),
      defaultMenu.footer,
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      name, level, role, uptime
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('⭐')

    // --- INVIO SOLO TESTO (IMMAGINE RIMOSSA) ---
    await conn.sendMessage(m.chat, {
      text: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🍪 𝐏𝐀𝐍𝐃𝐈𝐒𝐓𝐄𝐋𝐋𝐄 - 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 ⭐"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore nel modulo premium dell'impasto: ${e.message}`, m)
  }
}

handler.help = ['menupremium']
handler.tags = ['menu']
handler.command = ['menupremium', 'menuprem']

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
