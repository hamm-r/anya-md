let handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    await m.react('🎧')

    const input = m.quoted ? m.quoted.text : text
    if (!input) {
      return m.reply(
        `Contoh:\n` +
        `${usedPrefix + command} https://vt.tiktok.com/xxxx\n` +
        `${usedPrefix + command} dj jedag jedug`
      )
    }

    const regex = /(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/
    let url = input.match(regex)?.[0]
    let data

    // === GET DATA ===
    if (url) {
      let res = await (await fetch(`https://www.tikwm.com/api/?url=${url}`)).json()
      if (!res?.data) return m.reply('❌ Gagal mengambil data TikTok.')
      data = res.data
    } else {
      let search = await (
        await fetch(
          `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(input)}&count=1&cursor=0&web=1`
        )
      ).json()

      let video = search?.data?.videos?.[0]
      if (!video) return m.reply(`❌ Hasil tidak ditemukan untuk "${input}"`)

      let res = await (
        await fetch(
          `https://www.tikwm.com/api/?url=https://www.tiktok.com/@${video.author.unique_id}/video/${video.video_id}`
        )
      ).json()

      if (!res?.data) return m.reply('❌ Gagal mengambil data hasil search.')
      data = res.data
    }

    if (!data.music_info?.play) {
      return m.reply('❌ Audio tidak ditemukan.')
    }

    // === FORMAT TEXT ===
    const caption = `🎧 *TIKTOK MP3*

> *Judul*: ${data.title || '-'}
> *Uploader*: ${data.author.nickname || data.author.unique_id}
> *Durasi*: ${formatDuration(data.duration)}
> *Views*: ${formatNumber(data.play_count)}`

    let thumb =
      data.cover ||
      data.origin_cover ||
      data.ai_dynamic_cover ||
      data.music_info?.cover

    // === SEND AUDIO ===
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: data.music_info.play },
        mimetype: 'audio/mpeg',
        fileName: `${data.title || 'tiktok'}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: data.title || 'TikTok Audio',
            body: data.author.nickname || data.author.unique_id,
            thumbnailUrl: thumb,
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: false
          }
        }
      },
      { quoted: m }
    )

    await m.reply(caption)

  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.help = ['ttmp3', 'ttmusic']
handler.tags = ['downloader']
handler.command = /^(ttmp3|ttmusic)$/i
handler.limit = true

export default handler

// === UTIL ===
function formatNumber(num = 0) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'jt'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

function formatDuration(sec = 0) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}