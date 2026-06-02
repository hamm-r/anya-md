import os from 'os'

let handler = async (m, { conn, text }) => {

  const formatUptime = (sec) => {
    const d = Math.floor(sec / 86400)
    const h = Math.floor((sec % 86400) / 3600)
    const min = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)

    if (d) return `${d}d ${h}h`
    if (h) return `${h}h ${min}m`
    if (min) return `${min}m ${s}s`
    return `${s}s`
  }

  const serverUptime = formatUptime(os.uptime())
  const botUptime = formatUptime(process.uptime())

  const total = os.totalmem()
  const free = os.freemem()
  const used = total - free

  const format = b =>
    b >= 1e9 ? (b/1e9).toFixed(2)+' GB' :
    b >= 1e6 ? (b/1e6).toFixed(2)+' MB' :
    b >= 1e3 ? (b/1e3).toFixed(2)+' KB' : b+' B'

  const cpuModel = os.cpus()[0].model
  const cpuCore = os.cpus().length
  const platform = os.platform()
  const arch = os.arch()
  const nodeVer = process.version
  const ping = Math.floor(Math.random() * 20) + 10

  let title = text || '🎌 アニメ SYSTEM STATUS 🎌'

  // generator vote besar
  const bigVote = () => {
    const r = Math.random()
    if (r < 0.4) return Math.floor(Math.random()*90000)+10000      // 10K–99K
    if (r < 0.8) return Math.floor(Math.random()*900000)+100000    // 100K–999K
    return Math.floor(Math.random()*9000000)+1000000               // 1M+
  }

  const stats = [
    `⏱️ Server : ${serverUptime}`,
    `✨ Bot : ${botUptime}`,
    `📶 Ping : ${ping} ms`,
    `🧠 CPU : ${cpuCore} Core`,
    `⚙️ Engine : ${cpuModel}`,
    `💾 RAM Used : ${format(used)}`,
    `🟢 RAM Free : ${format(free)}`,
    `📊 RAM Total : ${format(total)}`,
    `💻 Platform : ${platform}`,
    `🧬 Arch : ${arch}`,
    `🟩 Node : ${nodeVer}`
  ]

  const content = {
    pollResultSnapshotMessage: {
      pollVotes: stats.map(v => ({
        optionName: v,
        optionVoteCount: bigVote()
      })),
      name: title,
      contextInfo: {
        forwardingScore: 127,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363395114168746@newsletter",
          serverMessageId: 0,
          newsletterName: "YTTA"
        },
        forwardOrigin: 0
      },
      pollType: 0
    }
  }

  await conn.relayMessage(m.chat, content, {})
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^ping$/i
handler.limit = false

export default handler