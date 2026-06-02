import fetch from 'node-fetch'
import { spawn } from 'child_process'
import sharp from 'sharp'
import { prepareWAMessageMedia } from '@itsliaaa/baileys'

/* ================= ANTI LOAD DOBEL ================= */
if (!global.autosholatLoaded) {
  global.autosholatLoaded = true
  console.log('✅ Autosholat loaded sekali')
}

/* ================= CONFIG ================= */
const DURASI_TUTUP = 5
const TOLERANSI = 60
const SOURCE_URL = 'https://kemenag.go.id/'

let cacheJadwal = {}
let sholatLock = {}
let audioCache = {}
let thumbnailBuffer = null
let thumbnailHQ = null

/* ================= LINK ================= */
const THUMBNAIL =
  'https://raw.githubusercontent.com/hamm-r/uploader/main/1780397442761-426.jpg'

const AUDIO_ADZAN = {
  Subuh: [
    'https://raw.githubusercontent.com/hamm-r/uploader/main/1778882820327-470.mp3'
  ],
  Default: [
    'https://raw.githubusercontent.com/hamm-r/uploader/main/1778882918734-987.mp3'
  ]
}

/* ================= TIME ================= */
function getNow() {
  return new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta'
    })
  )
}

function isJumat(now) {
  return now.getDay() === 5
}

function isBetweenJumat(now) {
  let h = now.getHours()
  return h >= 11 && h < 13
}

/* ================= FETCH BUFFER ================= */
async function fetchBuffer(url, timeout = 20000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: '*/*'
      }
    })

    if (!res.ok) throw new Error(`Fetch gagal ${res.status}`)

    const arr = await res.arrayBuffer()
    return Buffer.from(arr)
  } finally {
    clearTimeout(timer)
  }
}

/* ================= THUMBNAIL ================= */
async function getThumbnail() {
  try {
    if (thumbnailBuffer) return thumbnailBuffer

    let raw = await fetchBuffer(THUMBNAIL)

    let resized = await sharp(raw)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 90
      })
      .toBuffer()

    thumbnailBuffer = resized
    return resized
  } catch (e) {
    console.log('Thumbnail error:', e.message || e)
    return Buffer.alloc(0)
  }
}

async function getHighQualityThumbnail(conn) {
  try {
    if (thumbnailHQ) return thumbnailHQ

    let thumb = await getThumbnail()
    if (!thumb?.length) return null

    const { imageMessage } = await prepareWAMessageMedia(
      {
        image: thumb
      },
      {
        upload: conn.waUploadToServer,
        mediaTypeOverride: 'thumbnail-link'
      }
    )

    imageMessage.width = 1280
    imageMessage.height = 720

    thumbnailHQ = imageMessage
    return imageMessage
  } catch (e) {
    console.log('HQ Thumbnail error:', e.message || e)
    return null
  }
}

/* ================= CONVERT OPUS ================= */
async function convertBufferToOpus(input) {
  const chunks = []

  return await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-vn',
      '-c:a', 'libopus',
      '-b:a', '',
      '-vbr', 'on',
      '-compression_level', '10',
      '-f', 'opus',
      'pipe:1'
    ])

    ffmpeg.stdin.end(input)

    ffmpeg.stdout.on('data', chunk => chunks.push(chunk))
    ffmpeg.stderr.on('data', () => {})

    ffmpeg.on('close', code => {
      if (code !== 0) {
        return reject(new Error('FFmpeg gagal convert opus'))
      }

      resolve(Buffer.concat(chunks))
    })

    ffmpeg.on('error', reject)
  })
}

/* ================= GET AUDIO ================= */
async function getAudioAdzan(nama) {
  let urls =
    nama === 'Subuh'
      ? AUDIO_ADZAN.Subuh
      : AUDIO_ADZAN.Default

  for (let url of urls) {
    try {
      if (audioCache[url]) return audioCache[url]

      let raw = await fetchBuffer(url)

      if (!raw || raw.length < 1000) continue

      let opus = await convertBufferToOpus(raw)

      if (!opus || opus.length < 1000) continue

      audioCache[url] = opus
      return opus
    } catch (e) {
      console.log('Audio gagal:', e.message || e)
      continue
    }
  }

  return null
}

/* ================= JADWAL ================= */
async function getJadwal(kota = 'jakarta') {
  let today = getNow().toISOString().slice(0, 10)

  if (cacheJadwal[kota]?.date === today) {
    return cacheJadwal[kota].data
  }

  try {
    const cityMap = {
      jakarta: '1301',
      bandung: '1219',
      surabaya: '1631',
      yogyakarta: '1505',
      bekasi: '1204'
    }

    let id = cityMap[kota.toLowerCase()] || '1301'

    let url = `https://api.myquran.com/v2/sholat/jadwal/${id}/${today}`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!res.ok) throw new Error(`API jadwal gagal ${res.status}`)

    const json = await res.json()
    const d = json?.data?.jadwal

    if (!d) throw new Error('Data jadwal kosong')

    let hasil = {
      Fajr: d.subuh,
      Dhuhr: d.dzuhur,
      Asr: d.ashar,
      Maghrib: d.maghrib,
      Isha: d.isya
    }

    cacheJadwal[kota] = {
      date: today,
      data: hasil
    }

    return hasil
  } catch (e) {
    console.log('Error jadwal:', e.message || e)
    return null
  }
}

/* ================= AKURASI ================= */
function isNowMatch(waktu) {
  if (!waktu) return false

  let now = getNow()
  let [h, m] = waktu.split(':').map(Number)

  let target = new Date(now)
  target.setHours(h, m, 0, 0)

  let diff = (now - target) / 1000

  return diff >= 0 && diff <= TOLERANSI
}

/* ================= RESET ================= */
function resetDaily() {
  let today = getNow().toDateString()

  if (global.lastAutosholatReset !== today) {
    sholatLock = {}
    global.lastAutosholatReset = today
  }
}

/* ================= SEND PREVIEW ================= */
async function sendSholatPreview(conn, id, text) {
  let thumb = await getThumbnail()
  let highQualityThumbnail = await getHighQualityThumbnail(conn)
  let invisible = '\u200B'.repeat(400)

  return conn.sendMessage(id, {
    text: `${SOURCE_URL}${invisible}

${text}`,
    linkPreview: {
      'matched-text': SOURCE_URL,
      matchedText: SOURCE_URL,
      canonicalUrl: SOURCE_URL,
      title: '❀ ᴀɴʏᴀ ᴍᴅ ❀',
      description: 'Pengingat Sholat • Waku Waku 🕌',
      previewType: 0,
      jpegThumbnail: thumb,
      highQualityThumbnail,
      thumbnailUrl: THUMBNAIL,
      linkPreviewMetadata: {
        linkMediaDuration: 0,
        socialMediaPostType: 4
      }
    },
    favicon: {
      url: THUMBNAIL
    }
  }).catch(() => {})
}

/* ================= ENGINE ================= */
if (!global.autosholatInterval) {
  global.autosholatInterval = setInterval(async () => {
    try {
      resetDaily()

      for (let [id, chat] of Object.entries(global.db.data.chats || {})) {
        if (!chat.autosholat) continue

        let conn = global.conn
        if (!conn) continue

        let now = getNow()

        /* ========= MODE JUMAT ========= */
        if (isJumat(now)) {
          if (isBetweenJumat(now)) {
            if (!chat.jumatClosed) {
              try {
                await conn.groupSettingUpdate(id, 'announcement')
              } catch {}

              await sendSholatPreview(
                conn,
                id,
                `🕌 *Waktu Sholat Jumat*

Grup ditutup 11:00 - 13:00 WIB`
              )

              chat.jumatClosed = true
            }

            continue
          }

          if (chat.jumatClosed && now.getHours() >= 13) {
            try {
              await conn.groupSettingUpdate(id, 'not_announcement')
            } catch {}

            await conn.sendMessage(id, {
              text:
`✨ Grup dibuka kembali
Semoga ibadah diterima 🤲`
            }).catch(() => {})

            chat.jumatClosed = false
          }
        }

        /* ========= AUTO BUKA NORMAL ========= */
        if (chat.isClosed && Date.now() >= chat.tutupSampai) {
          try {
            await conn.groupSettingUpdate(id, 'not_announcement')
          } catch {}

          await conn.sendMessage(id, {
            text: '✨ Grup dibuka kembali'
          }).catch(() => {})

          chat.isClosed = false
        }

        let kota = chat.kota || 'jakarta'
        let jadwal = await getJadwal(kota)

        if (!jadwal) continue

        const sholatMap = {
          Subuh: jadwal.Fajr,
          Dzuhur: jadwal.Dhuhr,
          Ashar: jadwal.Asr,
          Maghrib: jadwal.Maghrib,
          Isya: jadwal.Isha
        }

        for (let [nama, waktu] of Object.entries(sholatMap)) {
          if (!isNowMatch(waktu)) continue

          let lockKey = `${id}-${nama}-${getNow().toDateString()}`
          if (sholatLock[lockKey]) continue

          sholatLock[lockKey] = true

          try {
            await conn.groupSettingUpdate(id, 'announcement')
          } catch {}

          chat.isClosed = true
          chat.tutupSampai = Date.now() + (DURASI_TUTUP * 60 * 1000)

          await sendSholatPreview(
            conn,
            id,
            `🕌 *Adzan ${nama}*

⏰ ${waktu}
📍 ${kota}

Mari tunaikan sholat 🤲
🚫 Grup ditutup ${DURASI_TUTUP} menit`
          )

          let buffer = await getAudioAdzan(nama)

          if (buffer) {
            await conn.sendMessage(id, {
              audio: buffer,
              mimetype: 'audio/ogg; codecs=opus',
              ptt: true
            }).catch(e => {
              console.log('Kirim audio gagal:', e.message || e)
            })
          } else {
            await conn.sendMessage(id, {
              text: '⚠️ Audio adzan gagal dimuat'
            }).catch(() => {})
          }
        }
      }
    } catch (e) {
      console.error('Autosholat error:', e.message || e)
    }
  }, 60 * 1000)
}

/* ================= ANTI BYPASS ================= */
export async function before(m, { isAdmin }) {
  let chat = global.db.data.chats[m.chat]

  if (!chat?.autosholat) return

  if ((chat.isClosed || chat.jumatClosed) && !isAdmin) {
    try {
      await m.delete()
    } catch {}
  }
}

/* ================= COMMAND ================= */
let handler = async (m, { args, command }) => {
  let chat = global.db.data.chats[m.chat]

  if (command === 'autosholat') {
    if (args[0] === 'on') {
      chat.autosholat = true
      return m.reply('🕌 Autosholat aktif')
    }

    if (args[0] === 'off') {
      chat.autosholat = false
      chat.isClosed = false
      chat.jumatClosed = false

      return m.reply('❌ Autosholat mati')
    }
  }

  if (command === 'setkota') {
    if (!args[0]) {
      return m.reply('Contoh:\n.setkota bandung')
    }

    chat.kota = args[0].toLowerCase()

    return m.reply(`📍 Kota di set ke ${chat.kota}`)
  }

  m.reply(
`.autosholat on/off
.setkota nama_kota`
  )
}

handler.command = /^(autosholat|setkota)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler