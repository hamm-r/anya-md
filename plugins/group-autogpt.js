let handler = async (m, { conn, args, isAdmin, isOwner }) => {
<<<<<<< HEAD

  if (!m.isGroup) {
    return m.reply('Khusus grup.')
  }

  if (!isAdmin && !isOwner) {
    return m.reply('Fitur ini khusus admin grup.')
  }

  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }

=======
  if (!m.isGroup) return m.reply('Khusus grup.')

  // Admin grup ATAU owner bot boleh akses
  if (!isAdmin && !isOwner) {
    return m.reply('Fitur ini khusus admin grup atau owner bot.')
  }

  global.db.data.chats[m.chat] ??= {}
>>>>>>> 497aa13 (anya-md)
  let chat = global.db.data.chats[m.chat]

  if (!args[0]) {
    return m.reply(
`*AUTO ANYA*

Contoh:
.autogpt on
.autogpt off`
    )
  }

  let type = args[0].toLowerCase()

  if (type === 'on') {
    chat.autogpt = true
<<<<<<< HEAD

=======
>>>>>>> 497aa13 (anya-md)
    return m.reply(
`Waku waku~ 🤗

Auto Anya berhasil diaktifkan.`
    )
  }

  if (type === 'off') {
    chat.autogpt = false
<<<<<<< HEAD

=======
>>>>>>> 497aa13 (anya-md)
    return m.reply(
`Hweh... 🥹

Auto Anya dimatikan dulu yaa.`
    )
  }

<<<<<<< HEAD
  m.reply('Pilih on / off')
=======
  return m.reply('Pilih on / off')
>>>>>>> 497aa13 (anya-md)
}

handler.help = ['autogpt']
handler.tags = ['group']
handler.command = /^(autogpt|autoanya)$/i

handler.group = true
<<<<<<< HEAD
handler.admin = true
=======
// Jangan pakai handler.admin = true
// Biar owner bot tetap bisa akses walaupun bukan admin grup
>>>>>>> 497aa13 (anya-md)

export default handler