import { xpRange } from '../lib/levelling.js'
import { join } from 'path'

const emojicategoria = {
  iatesto: '📝',
  iaaudio: '🎧',
  iaimmagini: '🖼️'
}

let tags = {
  'iatesto': 'IA TESTO',
  'iaaudio': 'IA AUDIO',
  'iaimmagini': 'IA IMMAGINI'
}

const defaultMenu = {
  before: `
✨🌌 🌟 🌌✨🌌 🌟 🌌✨
 🧠  𝐏𝐀𝐍𝐃𝐈 - 𝐙𝐔𝐂𝐂𝐇𝐄𝐑𝐎 𝐈𝐀  🧠
✨🌌 🌟 🌌✨🌌 🌟 🌌✨

╭──────────────👤
│ 🧑‍🍳 𝐂𝐮𝐨𝐜𝐨: %name
│ 🏆 𝐋𝐢𝐯𝐞𝐥𝐥𝐨: %level
│ ⏰ 𝐋𝐢𝐞𝐯𝐢𝐭𝐚𝐳𝐢𝐨𝐧𝐞: %uptime
│ 🍪 𝐒𝐟𝐨𝐫𝐧𝐚𝐭𝐢: %totalreg
╰──────────────🌾

🌟 *𝐈𝐋 𝐓𝐔𝐎 𝐌𝐈𝐗𝐄𝐑 𝐍𝐄𝐔𝐑𝐀𝐋𝐄:*
`.trimStart(),
  header: '╭─── [ %category ] ───✨',
  body: '│ %emoji  *%cmd*',
  footer: '╰───────────────────── 🍪\n',
  after: `_✨ Algoritmi intelligenti sfornati con cura da BLOOD ✨_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let { level = 0, role = 'User' } = global.db.data.users[m.sender] || {}
    let name = await conn.getName(m.sender) || 'Utente'
    let uptime = clockString(process.uptime() * 1000)
    let totalreg = Object.keys(global.db.data.users).length

    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags)
      .filter(plugin => ['iatesto', 'iaaudio', 'iaimmagini'].some(t => plugin.tags.includes(t)))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? p => plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin
      }))

    // Patch di sicurezza per mappare correttamente gli array in help
    help.forEach(plugin => {
      plugin.help = Array.isArray(plugin.help) ? plugin.help : [plugin.help]
    })

    let menuTags = Object.keys(tags)
    let _text = [
      defaultMenu.before,
      ...menuTags.map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(cmd => {
              return defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
                .replace(/%emoji/g, emojicategoria[tag] || '🧠')
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
      name, level, uptime, totalreg
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('🧠')

    // --- INVIO SOLO TESTO (IMMAGINE COMPLETAMENTE RIMOSSA) ---
    await conn.sendMessage(m.chat, {
      text: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🍪 𝐏𝐀𝐍𝐃𝐈𝐒𝐓𝐄𝐋𝐋𝐄 - 𝐈𝐍𝐓𝐄𝐋𝐋𝐈𝐆𝐄𝐍𝐂𝐄 🧠"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore nel modulo IA dell'impasto: ${e.message}`, m)
  }
}

handler.help = ['menuia']
handler.tags = ['menu']
handler.command = ['menuia', 'menuai']

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
