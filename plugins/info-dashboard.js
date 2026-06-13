<<<<<<< HEAD
import sharp from 'sharp'
import { prepareWAMessageMedia } from '@itsliaaa/baileys'

const THUMB_URL = 'https://telegra.ph/file/cf4f28ed3b9ebdfb30adc.png'
const URL_B = 'https://github.com/hamm-r'

let handler = async (m, { conn }) => {
  let stats = Object.entries(global.db.data.stats || {})
    .map(([key, val]) => {
      let name = Array.isArray(global.plugins[key]?.help)
        ? global.plugins[key].help.join(' , ')
        : global.plugins[key]?.help || key

      if (/exec/i.test(name)) return null
      return { name, ...val }
    })
    .filter(Boolean)
    .sort((a, b) => (b.total || 0) - (a.total || 0))

  let handlers = stats
    .slice(0, 50)
    .map(({ name, total = 0, last = 0, success = 0, lastSuccess = 0 }, i) => {
      return `*${i + 1}.* *${name}*
• *Hits* : ${total}
• *Success* : ${success}
• *Last Used* : ${last ? getTime(last) : '-'}
• *Last Success* : ${lastSuccess ? formatTime(lastSuccess) : '-'}`
    })
    .join('\n\n')

  if (!handlers) handlers = 'Belum ada data dashboard.'

  const caption = `乂 *D A S H B O A R D*

${handlers}`

  const thumb = await getThumbUrl(THUMB_URL)
  const highQualityThumbnail = await createHighQualityThumbnail(conn, thumb)
  const invisible = '\u200B'.repeat(400)

  await conn.sendMessage(
    m.chat,
    {
      text: `${URL_B}${invisible}

${caption}`,
      linkPreview: {
        'matched-text': URL_B,
        matchedText: URL_B,
        canonicalUrl: URL_B,
        title: '❀ ᴀɴʏᴀ ᴍᴅ ❀',
        description: 'Dashboard Command Stats ✨',
        previewType: 0,
        jpegThumbnail: thumb,
        highQualityThumbnail,
        thumbnailUrl: THUMB_URL,
        linkPreviewMetadata: {
          linkMediaDuration: 0,
          socialMediaPostType: 4
        }
      },
      favicon: {
        url: THUMB_URL
      }
    },
    {
      quoted: global.fmeta || m
    }
  )
}

handler.help = ['dashboard']
handler.command = ['dashboard', 'dash']
handler.tags = ['info']

export default handler

async function getThumbUrl(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Gagal ambil thumbnail')

    const raw = Buffer.from(await res.arrayBuffer())

    return await sharp(raw)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer()
  } catch (e) {
    console.error('Thumb Error:', e)
    return Buffer.alloc(0)
  }
}

async function createHighQualityThumbnail(conn, thumb) {
  try {
    if (!thumb?.length) return null

    const { imageMessage } = await prepareWAMessageMedia(
      { image: thumb },
      {
        upload: conn.waUploadToServer,
        mediaTypeOverride: 'thumbnail-link'
      }
    )

    imageMessage.width = 1280
    imageMessage.height = 720

    return imageMessage
  } catch (e) {
    console.error('HQ Thumb Error:', e)
    return null
  }
}

function formatTime(time) {
  if (!time) return '-'

  const date = new Date(time)
  if (isNaN(date)) return '-'

  const month = getMonthName(date.getMonth())
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}

function getMonthName(month) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  return months[month] || '-'
}

function getTime(ms) {
  if (!ms) return '-'

  const now = parseMs(Date.now() - ms)

  if (now.days) return `${now.days} days ago`
  if (now.hours) return `${now.hours} hours ago`
  if (now.minutes) return `${now.minutes} minutes ago`

  return 'a few seconds ago'
}

function parseMs(ms) {
  if (typeof ms !== 'number') {
    throw new Error('Parameters must be filled with numbers')
  }

  return {
    days: Math.trunc(ms / 86400000),
    hours: Math.trunc(ms / 3600000) % 24,
    minutes: Math.trunc(ms / 60000) % 60,
    seconds: Math.trunc(ms / 1000) % 60,
    milliseconds: Math.trunc(ms) % 1000,
    microseconds: Math.trunc(ms * 1000) % 1000,
    nanoseconds: Math.trunc(ms * 1000000) % 1000
  }
}
=======
import { createCanvas, loadImage } from '@napi-rs/canvas'
import os from 'os'
import moment from 'moment-timezone'

const BG_URL = 'https://raw.githubusercontent.com/hamm-r/uploader/main/1781161929894-460.jpg'

const W = 1280
const H = 720

function formatBytes(bytes = 0) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (!bytes) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

function formatUptime(sec = 0) {
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Gagal ambil asset ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function card(ctx, x, y, w, h) {
  ctx.save()
  ctx.fillStyle = 'rgba(20, 20, 30, 0.58)'
  rr(ctx, x, y, w, h, 26)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

function text(ctx, str, x, y, size, weight = '', alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#ffffff'
  ctx.font = `${weight} ${size}px Arial`
  ctx.fillText(String(str), x, y)
  ctx.restore()
}

function progress(ctx, x, y, w, h, percent) {
  percent = Math.max(0, Math.min(100, percent))

  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  rr(ctx, x, y, w, h, h / 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  rr(ctx, x, y, (w * percent) / 100, h, h / 2)
  ctx.fill()
}

function stat(ctx, x, y, title, value, sub) {
  card(ctx, x, y, 360, 120)

  text(ctx, title, x + 26, y + 38, 20, 'bold', 0.6)
  text(ctx, value, x + 26, y + 82, 34, 'bold')
  text(ctx, sub, x + 26, y + 108, 18, '', 0.55)
}

async function makeDashboard(conn) {
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  const bg = await loadImage(await fetchBuffer(BG_URL))
  ctx.drawImage(bg, 0, 0, W, H)

  ctx.fillStyle = 'rgba(0,0,0,0.62)'
  ctx.fillRect(0, 0, W, H)

  const users = Object.keys(global.db?.data?.users || {}).length
  const chats = Object.keys(global.db?.data?.chats || {}).length
  const plugins = Object.values(global.plugins || {}).filter(v => !v.disabled).length

  const totalRam = os.totalmem()
  const freeRam = os.freemem()
  const usedRam = totalRam - freeRam
  const ramPercent = Math.round((usedRam / totalRam) * 100)

  const cpus = os.cpus()
  const cores = cpus.length
  const cpuModel = cpus[0]?.model || 'Unknown CPU'
  const cpuLoad = os.loadavg()[0]
  const cpuPercent = Math.min(100, Math.round((cpuLoad / cores) * 100))

  const botName = conn.user?.name || 'Anya MD'
  const time = moment().tz('Asia/Jakarta').format('DD MMM YYYY • HH:mm WIB')

  card(ctx, 60, 50, 1160, 120)

  text(ctx, 'ANYA MD', 95, 105, 46, 'bold')
  text(ctx, 'Premium Bot Dashboard', 98, 138, 22, '', 0.65)

  text(ctx, 'ONLINE', 1090, 92, 20, 'bold', 0.85)
  text(ctx, time, 905, 135, 20, '', 0.65)

  stat(ctx, 60, 205, 'UPTIME', formatUptime(process.uptime()), botName)
  stat(ctx, 460, 205, 'USERS', users, `${chats} chats`)
  stat(ctx, 860, 205, 'PLUGINS', plugins, 'active modules')

  card(ctx, 60, 365, 560, 150)
  text(ctx, 'RAM USAGE', 95, 410, 22, 'bold', 0.6)
  text(ctx, `${ramPercent}%`, 95, 462, 42, 'bold')
  text(ctx, `${formatBytes(usedRam)} / ${formatBytes(totalRam)}`, 195, 462, 22, '', 0.65)
  progress(ctx, 95, 485, 460, 16, ramPercent)
  text(ctx, `Bot process: ${formatBytes(process.memoryUsage().rss)}`, 95, 535, 18, '', 0.55)

  card(ctx, 660, 365, 560, 150)
  text(ctx, 'CPU INFO', 695, 410, 22, 'bold', 0.6)
  text(ctx, `${cpuPercent}%`, 695, 462, 42, 'bold')
  text(ctx, `${cores} Core • Load ${cpuLoad.toFixed(2)}`, 795, 462, 22, '', 0.65)
  progress(ctx, 695, 485, 460, 16, cpuPercent)
  text(ctx, cpuModel.slice(0, 48), 695, 535, 18, '', 0.55)

  card(ctx, 60, 560, 1160, 90)
  text(ctx, 'SYSTEM', 95, 605, 22, 'bold', 0.6)
  text(ctx, `${os.type()} • ${os.platform()} ${os.arch()} • Node ${process.version}`, 95, 635, 24)

  text(ctx, '© Anya MD by Hamm', 60, 695, 18, '', 0.45)

  return canvas.toBuffer('image/png')
}

let handler = async (m, { conn }) => {
  try {
    await m.react?.('🕐')

    const buffer = await makeDashboard(conn)

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: '乂 *ANYA DASHBOARD*'
      },
      { quoted: m }
    )

    await m.react?.('✅')
  } catch (e) {
    console.error(e)
    await m.react?.('❌')
    m.reply(`Error dashboard:\n${e.message}`)
  }
}

handler.help = ['dashboard']
handler.tags = ['info']
handler.command = /^(dashboard|dash|statusbot|ping)$/i

export default handler
>>>>>>> 497aa13 (anya-md)
