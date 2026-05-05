export async function before(m, { isOwner, isRowner, isMods }) {
    if (m.fromMe) return !0;
    if (m.isGroup) return !1;
    if (!m.message) return !0;

    // MODIFICA QUI: Aggiungiamo il controllo "m.text ?" prima di .includes
    // Se m.text non esiste, il bot ignora il controllo invece di crashare
    const text = m.text || ""; 
    if (text.includes('sasso') || text.includes('carta') || text.includes('forbici')) return !0; 

    const varebot = global.db.data.settings[this.user.jid] || {};
    
    // Controllo sicurezza: assicurati che antiprivato sia attivo
    if (varebot.antiprivato && !isOwner && !isRowner && !isMods) {
      await this.updateBlockStatus(m.chat, 'block');
    }
    return !1;
}
