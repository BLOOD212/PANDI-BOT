import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'
import { fileURLToPath } from 'url'
import NodeCache from 'node-cache'

const __filename = fileURLToPath(import.meta.url)
const nameCache = new NodeCache({ stdTTL: 600 });
const groupMetaCache = new NodeCache({ stdTTL: 300 });
const errorThrottle = {};
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

export default async function (m, conn = { user: {} }) {
  if (!global.messageUpdateListenerSet) {
    conn.ev.on('messages.update', (updates) => {
      for (const update of updates) {
        if (update.update.message?.editedMessage) {
          console.log(chalk.bgHex('#4A2C11').hex('#FFD700').bold(' 🍪 PANDI-EDIT '), chalk.hex('#FFD700')('Un biscotto è stato ritoccato nel forno!'));
        }
      }
    })
    global.messageUpdateListenerSet = true
  }

  if (!m || m.key?.fromMe) return

  try {
    const senderJid = conn.decodeJid(m.sender)
    const chatJid = conn.decodeJid(m.chat || '')
    const botJid = conn.decodeJid(conn.user?.jid)
    if (!chatJid) return;

    let _name = nameCache.get(senderJid) || await conn.getName(senderJid) || '';
    nameCache.set(senderJid, _name);

    const sender = formatPhoneNumber(senderJid, _name)
    let chatName = nameCache.get(chatJid) || await conn.getName(chatJid) || 'Unknown';

    const isOwner = Array.isArray(global.owner) ? global.owner.map(([number]) => number).includes(senderJid.split('@')[0]) : global.owner === senderJid.split('@')[0]
    const isGroup = chatJid.endsWith('@g.us')
    const isAdmin = isGroup ? await checkAdmin(conn, chatJid, senderJid) : false
    const isPremium = global.prems?.includes(senderJid) || false
    const isBanned = global.DATABASE?.data?.users?.[senderJid]?.banned || false

    const user = global.DATABASE?.data?.users?.[senderJid] || { exp: '?', euro: '?' }

    // NUOVA ESTETICA: PANDISTELLE STYLE 🍪✨
    const c = {
      biscotto: chalk.hex('#4A2C11').bold,  // Marrone Cioccolato (Primario)
      oro: chalk.hex('#FFD700').bold,       // Giallo Oro / Stelline (Secondario)
      latte: chalk.hex('#FFFDD0'),          // Bianco Crema / Latte
      glassa: chalk.hex('#FFFFFF').bold,     // Bianco Candido
      panna: chalk.hex('#FFF8DC'),          // Sfondo chiaro per dettagli
      warn: chalk.hex('#FFA500').bold,      // Arancione Dorato
      err: chalk.hex('#D2691E').bold        // Marrone Bruciato (Errori)
    }

    // DESIGN DEI BORDI INTEGRATO A STELLINE
    const top = c.biscotto(' ✨ 🌟 🌟 ─────────  ') + c.oro('PANDISTELLE BOT') + c.biscotto('  ───────── 🌟 🌟 ✨')
    const mid = c.biscotto(' ───────────────────────────────────────────────────')
    const bot = c.biscotto(' 🌟 ✨ 🌟 ────────────────────────────────────────── 🍪')
    const L = c.biscotto(' │')

    // COSTRUZIONE DELLA SCHEDA INFORMAZIONI DOLCE & ORDINATA
    console.log('\n' + top)
    console.log(`${L} ${c.oro('🍪 CLIENT')}   ${c.latte('›')} ${c.glassa(sender)}`)
    console.log(`${L} ${c.oro('📬 SACCO')}    ${c.latte('›')} ${c.glassa(chatName)} ${isGroup ? c.oro('『FORNO/GRUPPO』') : c.biscotto('『RICETTA/PVT』')}`)
    console.log(`${L} ${c.oro('🌟 INFODOC')}  ${c.latte('›')} ${getUserStatus(isOwner, isAdmin, isPremium, isBanned, c)}`)
    console.log(`${L} ${c.oro('📦 FORMATO')}  ${c.latte('›')} ${c.latte(formatType(m))} ${getMessageFlags(m, c)}`)

    if (m.isCommand) {
      console.log(mid)
      console.log(`${L} ${c.warn('⚡ FORNATURA')} ${c.latte('›')} ${chalk.bgHex('#4A2C11').hex('#FFD700').bold(' ' + getCommand(m.text) + ' ')}`)
    }

    if (user.exp !== '?') {
      console.log(`${L} ${c.oro('✨ INGREDIENTI')} ${c.latte('›')} ${c.glassa(user.exp + ' Stelle XP')} ${c.biscotto('•')} ${c.glassa(user.euro + ' €')}`)
    }

    // SEZIONE MESSAGGIO
    const logText = await formatText(m, conn)
    if (logText?.trim()) {
      console.log(mid)
      console.log(`${L} ${c.oro('🌾 IMPASTO')}  ${c.latte('›')} ${logText}`)
    }

    logMessageSpecifics(m, c, L)
    console.log(bot)

  } catch (error) {
    throttleError('Errore nell\'impasto:', error.message, 5000);
  }
}

// --- LOGICA DI SUPPORTO ADATTATA ---

function getUserStatus(isOwner, isAdmin, isPremium, isBanned, c) {
  if (isBanned) return c.err('『 BISCOTTO BRUCIATO / BANNED 』')
  if (isOwner) return chalk.bgHex('#FFD700').hex('#4A2C11').bold(' 👑 CAPO PASTICCERE ')
  let s = []
  if (isAdmin) s.push(c.warn('AIUTO CUOCO'))
  if (isPremium) s.push(c.oro('GOLOSO PREMIUM'))
  return s.length ? s.join(chalk.hex('#4A2C11')(' | ')) : chalk.hex('#8B4513')('OSPITE')
}

function getColorScheme() { /* Mockup per compatibilità */ }

function formatPhoneNumber(jid, name) {
  const num = jid.split('@')[0].split(':')[0]
  return name ? `${name} ${chalk.hex('#8B4513')('('+num+')')}` : num
}

function formatTimestamp(ts) {
  return new Date(ts * 1000).toLocaleTimeString('it-IT')
}

function formatType(m) {
  return (m.mtype || 'msg').replace(/Message/gi, '').toUpperCase()
}

function getMessageFlags(m, c) {
  let f = []
  if (m.quoted) f.push(c.oro('↩ COPIATO'))
  if (m.forwarded) f.push(c.latte('➦ PASSATO'))
  return f.length ? chalk.hex('#4A2C11')('[') + f.join(' ') + chalk.hex('#4A2C11')(']') : ''
}

function getCommand(text) {
  return text ? text.split(/\s/)[0].toUpperCase() : ''
}

async function checkAdmin(conn, chatId, senderId) {
  try {
    const groupMeta = groupMetaCache.get(chatId) || await conn.groupMetadata(chatId)
    groupMetaCache.set(chatId, groupMeta)
    return groupMeta?.participants?.some(p => conn.decodeJid(p.id) === conn.decodeJid(senderId) && p.admin) || false
  } catch { return false }
}

function logMessageSpecifics(m, c, L) {
  const types = {
    imageMessage: '🖼️ DECORAZIONE FOTO',
    videoMessage: '🎥 ANIMAZIONE VIDEO',
    audioMessage: '🎵 DOLCE NOTA AUDIO',
    stickerMessage: '✨ ADESIVO DI GLASSA',
    documentMessage: '📄 RICETTA / DOC'
  }
  if (types[m.mtype]) console.log(`${L} ${c.oro('🎨 AGGIUNTA')}  ${c.latte('›')} ${c.glassa(types[m.mtype])}`)
}

async function formatText(m, conn) {
  let text = (m.text || m.caption || '').trim()
  if (!text) return ''
  return chalk.hex('#FFFDD0')(text.length > 100 ? text.slice(0, 100) + '...' : text)
}

function throttleError(message, error, delay) {
  console.error(chalk.hex('#D2691E')(message), error)
}

watchFile(__filename, () => {
  console.log(chalk.bgHex('#4A2C11').hex('#FFD700').bold(" ⚡ IL FORNO È PRONTO: MODALITÀ CROCCANTE ATTIVA ✨ "))
})
