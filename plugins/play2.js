import yts from 'yt-search'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execPromise = promisify(exec)

function pickFile(tmpDir, id) {
  return fs.readdirSync(tmpDir).find(v => v.startsWith(String(id)))
}

let handler = async (m, { conn, text }) => {
  if (!text) throw 'Masukkan judul lagu!'

  await m.react('🕒')

  let search = await yts(text)
  let data = search.videos[0]
  if (!data) throw 'Lagu tidak ditemukan'

  let caption = `— play music —

❀ title :
${data.title}

❀ duration :
${data.timestamp}

❀ views :
${data.views.toLocaleString()}

❀ author :
${data.author.name}

❀ url :
${data.url}`

  await conn.sendMessage(m.chat, {
    image: { url: data.thumbnail },
    caption
  }, { quoted: m })

  let tmpDir = path.join(process.cwd(), 'tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  let id = Date.now()
  let output = path.join(tmpDir, `${id}.%(ext)s`)

  try {
    let cmd = [
      'yt-dlp',
      '--no-update',
      '--cookies', 'cookies.txt',
      '--extractor-args', '"youtube:player_client=android,ios"',
      '-f', '"bestaudio[ext=m4a]/bestaudio"',
      '--no-playlist',
      '-o', `"${output}"`,
      `"${data.url}"`
    ].join(' ')

    await execPromise(cmd, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 20
    })

    let result = pickFile(tmpDir, id)
    if (!result) throw 'File audio tidak ditemukan setelah download.'

    let filePath = path.join(tmpDir, result)

    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(filePath),
      mimetype: 'audio/mp4',
      ptt: false,
      fileName: `${data.title}.m4a`
    }, { quoted: m })

    fs.unlinkSync(filePath)

    await m.react('✅')

  } catch (e) {
    console.log(e)

    try {
      let cmd2 = [
        'yt-dlp',
        '--no-update',
        '--cookies', 'cookies.txt',
        '--extractor-args', '"youtube:player_client=android"',
        '-f', '"bestaudio[ext=m4a]/bestaudio/best"',
        '--no-playlist',
        '-o', `"${output}"`,
        `"${data.url}"`
      ].join(' ')

      await execPromise(cmd2, {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 20
      })

      let result = pickFile(tmpDir, id)
      if (!result) throw 'File audio tidak ditemukan setelah fallback.'

      let filePath = path.join(tmpDir, result)

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mp4',
        ptt: false,
        fileName: `${data.title}.m4a`
      }, { quoted: m })

      fs.unlinkSync(filePath)

      await m.react('✅')

    } catch (err) {
      console.log(err)
      await m.react('❌')

      throw `Gagal download audio.

${err.message || err}

Coba update yt-dlp:
pip install -U yt-dlp`
    }
  }
}

handler.help = ['play2']
handler.tags = ['downloader']
handler.command = /^(play2)$/i
handler.limit = true
handler.register = false

export default handler