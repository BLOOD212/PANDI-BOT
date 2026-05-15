import { promises as fs } from 'fs'
import { join } from 'path'

const emojicategoria = {
  info: '✨',
  main: '🍪',
  sicurezza: '🌟'
}

let tags = {
  main: '🌟 `RICETTE PRINCIPALI` 🌟',
  sicurezza: '🌾 `PROTEZIONE FORNO` 🌾',
  info: '📜 `REGISTRO PASTICCERIA` 📜'
}

// ESTETICA TOTALMENTE RIVOLUZIONATA: PANDISTELLE STYLE 🍪✨
const defaultMenu = {
  testoInizio: `
╭━━━━━━━ ✨ 🌟 ✨ ━━━━━━━╮
      🍪  𝐏𝐀𝐍𝐃𝐈𝐒𝐓𝐄𝐋𝐋𝐄 - 𝐁𝐎𝐓  🍪
╰━━━━━━━ ✨ 🌟 ✨ ━━━━━━━╯

╔═════════════════════════╗
  🌾 » 𝐂𝐮𝐨𝐜𝐨: %name
  ⏰ » 𝐋𝐢𝐞𝐯𝐢𝐭𝐚𝐳𝐢𝐨𝐧𝐞: %uptime
  🍪 » 𝐁𝐢𝐬𝐜𝐨𝐭𝐭𝐢 𝐒𝐟𝐨𝐫𝐧𝐚𝐭𝐢: %totalreg
╚═════════════════════════╝

✨ *𝐈𝐋 𝐓𝐔𝐎 𝐑𝐈𝐂𝐄𝐓𝐓𝐀𝐑𝐈𝐎:*
`.trimStart(),

  header: '╭───  %category  ───🧱\n│',
  body: '├ ⭐  『%emoji』 %cmd',
  footer: '╰───────────────────────── 🍪\n',
  testoFine: `_✨ Cotto al punto giusto da BLOOD ✨_`,
}

const bldButtons = [
  { title: "🌾 PROTEZIONE", command: "attiva" },
  { title: "🎮 DIVERTIMENTO", command: "menugiochi" },
  { title: "🧠 ZUCCHERO IA", command: "menuia" },
  { title: "🧺 SACCO GRUPPO", command: "menugruppo" },
  { title: "📥 PRELEVA MEDIA", command: "menudownload" },
  { title: "🛠️ UTENSILI", command: "menustrumenti" },
  { title: "⭐ INGREDIENTI PRO", command: "menupremium" },
  { title: "💰 SALDOPREZZO", command: "menueuro" }
]

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let name = await conn.getName(m.sender) || 'Ospite'
    let uptime = clockString(process.uptime() * 1000)
    let totalreg = Object.keys(global.db.data.users).length

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p
    }))

    let menuTags = Object.keys(tags)

    let _text = [
      defaultMenu.testoInizio,
      ...menuTags.map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help
            .filter(menu => menu.tags.includes(tag))
            .map(menu => menu.help.map(h => 
              defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? h : _p + h)
                .replace(/%emoji/g, emojicategoria[tag])
            ).join('\n')),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.testoFine
    ].join('\n')

    let text = _text.replace(/%name/g, name)
                    .replace(/%uptime/g, uptime)
                    .replace(/%totalreg/g, totalreg)

    const buttons = bldButtons.map(btn => ({
      buttonId: _p + btn.command,
      buttonText: { displayText: btn.title },
      type: 1
    }))

    await conn.sendMessage(m.chat, {
      text: text.trim(),
      footer: "🍪 P A N D I S T E L L E  -  S Y S T E M",
      buttons: buttons,
      headerType: 1,
      viewOnce: true
    }, { quoted: m })

    await m.react('🍪')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore nell'impasto: ${e.message}`, m)
  }
}

handler.help = ['menu']
handler.command = ['menu', 'help']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
