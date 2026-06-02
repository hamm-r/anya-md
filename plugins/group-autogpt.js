let handler = async (m, { conn, args, isAdmin, isOwner }) => {

  if (!m.isGroup) {
    return m.reply('Khusus grup.')
  }

  if (!isAdmin && !isOwner) {
    return m.reply('Fitur ini khusus admin grup.')
  }

  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }

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

    return m.reply(
`Waku waku~ 🤗

Auto Anya berhasil diaktifkan.`
    )
  }

  if (type === 'off') {
    chat.autogpt = false

    return m.reply(
`Hweh... 🥹

Auto Anya dimatikan dulu yaa.`
    )
  }

  m.reply('Pilih on / off')
}

handler.help = ['autogpt']
handler.tags = ['group']
handler.command = /^(autogpt|autoanya)$/i

handler.group = true
handler.admin = true

export default handler