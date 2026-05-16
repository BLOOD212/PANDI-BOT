import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

const defaultMenu = {
  before: `
✨🌌 🌟 🌌✨🌌 🌟 🌌✨
 🧺  𝐏𝐀𝐍𝐃𝐈 - 𝐆𝐑𝐔𝐏𝐏𝐎  🧺
✨🌌 🌟 🌌✨🌌 🌟 🌌✨

╭──────────────👤
│ 🧑‍🍳 𝐂𝐮𝐨𝐜𝐨: %name
│ 🎖️ 𝐑𝐮𝐨𝐥𝐨: %role
│ 🌾 𝐒𝐭𝐚𝐭𝐮𝐬: %prems
╰──────────────👑

🌟 *𝐈𝐋 𝐓𝐔𝐎 𝐒𝐀𝐂𝐂𝐎 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄:*
`.trimStart(),
  header: '╭─── [ %category ] ───✨',
  body: '│  👥  *%cmd*',
  footer: '╰───────────────────── 🍪\n',
  after: `_✨ Controllo del gruppo sfornato da BLOOD ✨_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'gruppo': 'GESTIONE SACCO'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let d = new Date(new Date().getTime() + 3600000)
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    let user = global.db.data.users[m.sender] || {}
    let { level, role = 'Utente' } = user
    let prems = user.premiumTime > 0 ? '𝐏𝐫𝐞𝐦𝐢𝐮𝐦' : '𝐒𝐭𝐚𝐧𝐝𝐚𝐫𝐝'

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body.replace(/%cmd/g, menu.prefix ? help : _p + help)
                .trim()
            }).join('\n')
          }),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      name, level, role, prems, uptime,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('🧺')

    // --- INVIO SOLO TESTO (IMMAGINE RIMOSSA) ---
    await conn.sendMessage(m.chat, {
      text: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🍪 𝐏𝐀𝐍𝐃𝐈𝐒𝐓𝐄𝐋𝐋𝐄 - 𝐆𝐑𝐎𝐔𝐏 🧺"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore nel modulo gruppo: ${e.message}`, m)
  }
}

handler.help = ['menugruppo']
handler.tags = ['menu']
handler.command = ['menugruppo', 'menugp', 'menuadmin']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
