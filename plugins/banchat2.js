<<<<<<< HEAD
let handler = async (m, { text }) => {
  if (!text) return m.reply('Masukkan ID grup!\nContoh: .banchat2 120363xxxxxx@g.us')

  let id = text.trim()

  if (!global.db.data.chats[id]) global.db.data.chats[id] = {}

  global.db.data.chats[id].isBanned = true

  m.reply(`Berhasil ban chat!\nID: ${id}`)
}

handler.help = ['banchat2 <idgc>']
handler.tags = ['owner']
handler.command = /^banchat2$/i
handler.owner = true

export default handler
=======
let handler = async (m) => {
	global.db.data.chats[m.chat].isBanned = true;
	m.reply('Done!');
};
handler.help = ['banchat2'];
handler.tags = ['owner'];
handler.command = /^(banchat2|bnc2)$/i;
handler.owner = true;

export default handler;
>>>>>>> 497aa13 (anya-md)
