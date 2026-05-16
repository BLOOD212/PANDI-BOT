import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'
import { promises } from 'fs'
import { join } from 'path'

const defaultMenu = {
  before: `
✨🌌 🌟 🌌✨🌌 🌟 🌌✨
 👑  𝐏𝐀𝐍𝐃𝐈 - 𝐂𝐑𝐄𝐀𝐓𝐎𝐑  👑
✨🌌 🌟 🌌✨🌌 🌟 🌌✨

╭──────────────👤
│ 🧑‍🍳 𝐅𝐨𝐧𝐝𝐚𝐭𝐨𝐫𝐞: %name
│ ⚙️ 𝐌𝐨𝐝𝐚𝐥𝐢𝐭𝐚̀: %mode
│ 🖥️ 𝐏𝐢𝐚𝐭𝐭𝐚𝐟𝐨𝐫𝐦𝐚: %platform
╰──────────────🌾

🌟 *𝐈𝐋 𝐒𝐀𝐂𝐂𝐎 𝐒𝐄𝐆𝐑𝐄𝐓𝐎 𝐃𝐄𝐋 𝐅𝐎𝐍𝐃𝐀𝐓𝐎𝐑𝐄:*
`.trimStart(),
  header: '╭─── [ %category ] ───✨',
  body: '│  👨‍💻  *%cmd*',
  footer: '╰───────────────────── 🍪\n',
  after: `_✨ Pannello di controllo assoluto sfornato da BLOOD ✨_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'creatore': 'GESTIONE CENTRALIZZATA'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let mode = global.opts['self'] ? 'Privato' : 'Pubblico'
    let platform = os.platform()

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
      name, uptime, mode, platform,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('👑')

    // --- INVIO SOLO TESTO (IMMAGINE/VIDEO CONFERMATI ASSENTI) ---
    await conn.sendMessage(m.chat, {
      text: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🍪 𝐏𝐀𝐍𝐃𝐈𝐒𝐓𝐄𝐋𝐋𝐄 - 𝐂𝐑𝐄𝐀𝐓𝐎𝐑 👑"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore nel modulo creatore dell'impasto: ${e.message}`, m)
  }
}

handler.help = ['menucreatore']
handler.tags = ['menu']
handler.command = ['menuowner', 'menucreatore', 'owner']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
