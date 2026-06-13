<<<<<<< HEAD
import os from 'os'

let handler = async (m, { conn }) => {
  try {
    let uptime = process.uptime()
    let hours = Math.floor(uptime / 3600)
    let minutes = Math.floor((uptime % 3600) / 60)
    let seconds = Math.floor(uptime % 60)

    let caption = `
⏱ *Runtime Bot*
${hours} jam ${minutes} menit ${seconds} detik

🖥 *System*
OS      : ${os.platform()}
Arch    : ${os.arch()}
RAM     : ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB
`.trim()

    await conn.sendMessage(
      m.chat,
      { text: caption },
      { quoted: global.fkontak || m }
    )

  } catch (e) {
    m.reply('Terjadi error.')
  }
}

handler.help = ['runtime']
handler.tags = ['info']
handler.command = ['runtime']
=======
import sharp from 'sharp'

let handler = async (m, { conn }) => {
  if (!global.bootTime) global.bootTime = Date.now()

  async function getThumb(input) {
    try {
      let buffer

      if (Buffer.isBuffer(input)) {
        buffer = input
      } else if (typeof input === 'string' && /^https?:\/\//i.test(input)) {
        let res = await fetch(input)
        buffer = Buffer.from(await res.arrayBuffer())
      } else {
        let res = await fetch('https://u.pone.rs/arpqzmrr.jpg')
        buffer = Buffer.from(await res.arrayBuffer())
      }

      return await sharp(buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer()
    } catch (e) {
      return Buffer.alloc(0)
    }
  }

  const thumb = await getThumb(global.thumb)

  const runtime = Math.floor((Date.now() - global.bootTime) / 1000)
  const days = Math.floor(runtime / 86400)
  const hours = Math.floor((runtime % 86400) / 3600)
  const minutes = Math.floor((runtime % 3600) / 60)
  const seconds = runtime % 60

  const runtimeText = [
    days ? `${days} Hari` : '',
    hours ? `${hours} Jam` : '',
    minutes ? `${minutes} Menit` : '',
    `${seconds} Detik`
  ].filter(Boolean).join(' ')

  const mode = global.opts && global.opts.self ? 'SELF' : 'PUBLIC'

  const totalUsers = global.db && global.db.data && global.db.data.users
    ? Object.keys(global.db.data.users).length
    : 0

  const totalChats = global.db && global.db.data && global.db.data.chats
    ? Object.keys(global.db.data.chats).length
    : 0

  const start = Date.now()
  const ping = Date.now() - start

  await conn.relayMessage(m.chat, {
    buttonsMessage: {
      locationMessage: {
        degreesLatitude: 0,
        degreesLongitude: 0,
        name: global.wm || '❀ ᴀɴʏᴀ ᴍᴅ ❀',
        address: global.ownername || 'Hamm',
        jpegThumbnail: thumb
      },

      contentText:
`🌸 「 ANYA SYSTEM STATUS 」 🌸

🤖 Bot     : ${global.wm || 'Anya MD'}
📡 Mode    : ${mode}
⚡ Ping    : ${ping} ms
⏳ Runtime : ${runtimeText}
👥 Users   : ${totalUsers}
💬 Chats   : ${totalChats}
✅ Status  : Online

✨ Anya masih aktif dan siap membantu~`,

      footerText: global.wm || '❀ ᴀɴʏᴀ ᴍᴅ ❀',

      buttons: [
        {
          buttonId: '.menu',
          buttonText: {
            displayText: '📋 Menu'
          },
          type: 1
        },
        {
          buttonId: '.owner',
          buttonText: {
            displayText: '👑 Owner'
          },
          type: 1
        }
      ],

      headerType: 6
    }
  }, {})
}

handler.help = ['statusbot', 'botinfo', 'infobot', 'runtime', 'alive']
handler.tags = ['info']
handler.command = /^(statusbot|botinfo|infobot|runtime|alive)$/i
>>>>>>> 497aa13 (anya-md)

export default handler