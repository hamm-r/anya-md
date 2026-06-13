/* 
<<<<<<< HEAD
fitur: fesnuk downloader
cr: https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
skrep: https://whatsapp.com/channel/0029Vap84RE8KMqfYnd0V41A/3625
*/

import axios from 'axios'
import *as cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} <link video Facebook>`
  
  try {
    m.reply('wett...')
    
    const r = await axios.post('https://v3.fdownloader.net/api/ajaxSearch',
      new URLSearchParams({
        q: text,
        lang: 'en',
        web: 'fdownloader.net',
        v: 'v2',
        w: ''
      }).toString(),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          origin: 'https://fdownloader.net',
          referer: 'https://fdownloader.net/',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10)'
        }
      }
    )

    const $ = cheerio.load(r.data.data)
    
    const duration = $('.content p').first().text().trim() || null
    const thumbnail = $('.thumbnail img').attr('src') || null
    const videos = $('.download-link-fb').map((_, el) => ({
      quality: $(el).attr('title')?.replace('Download ', '') || '',
      url: $(el).attr('href')
    })).get()

    if (!videos || videos.length === 0) {
      throw new Error('Tidak ada video ditemukan')
    }

    const selectedVideo = videos.find(v => v.quality.includes('720p')) || videos[0]
    
    await conn.sendMessage(m.chat, {
      video: { url: selectedVideo.url },
      caption: `*Facebook Downloader*\n\n📹 Durasi: ${duration}\n📊 Kualitas: ${selectedVideo.quality}`,
      mimetype: 'video/mp4'
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error:', e)
    m.reply('🚨 Error: ' + (e.message || e))
  }
}

handler.help = ['facebook', 'fbdl', 'fb']
handler.tags = ['downloader']
handler.command = /^(facebook|fbdl|fb)$/i
handler.limit = true

export default handler
=======
Downloader Facebook
Source Scrape : https://whatsapp.com/channel/0029VbBJKfE0gcfCAJZEVh3R/125
*/
import axios from "axios";

async function getToken() {
  const url = "https://fbdownloader.to/id";
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const regex = /k_exp="(.*?)".*?k_token="(.*?)"/s;
  const match = html.match(regex);
  if (!match) throw new Error("Token tidak ditemukan");

  return {
    k_exp: match[1],
    k_token: match[2]
  };
}

async function fbDownloader(fbUrl) {
  const { k_exp, k_token } = await getToken();

  const payload = new URLSearchParams({
    k_exp,
    k_token,
    p: "home",
    q: fbUrl,
    lang: "id",
    v: "v2",
    W: ""
  });

  const { data } = await axios.post("https://fbdownloader.to/api/ajaxSearch", payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "Mozilla/5.0",
      "X-Requested-With": "XMLHttpRequest",
      "Origin": "https://fbdownloader.to",
      "Referer": "https://fbdownloader.to/id"
    }
  });

  if (!data || !data.data) throw new Error("Gagal mengambil data video");

  const html = data.data;
  const results = [];

  const rowRegex = /<td class="video-quality">(.*?)<\/td>[\s\S]*?(?:href="(.*?)"|data-videourl="(.*?)")/g;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const quality = match[1].trim();
    const url = match[2] || match[3];
    if (quality && url) results.push({ quality, url });
  }

  return results;
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Masukkan link Facebook terlebih dahulu, contoh:\n.fb https://facebook.com/...");

  try {
    const results = await fbDownloader(text);
    if (!results.length) return m.reply(" Tidak ada video ditemukan.");

    const videoUrl = results[0].url;

    const { data: buffer } = await axios.get(videoUrl, { responseType: 'arraybuffer' });

    await conn.sendMessage(m.chat, { video: buffer, caption: ` Download dari Facebook\nKualitas: ${results[0].quality}` }, { quoted: m });
  } catch (e) {
    m.reply(" Gagal mengunduh video: " + e.message);
  }
};

handler.help = ['facebook <link>'];
handler.tags = ['downloader'];
handler.command = /^fb|facebook|fbdl$/i;
handler.limit = true;
export default handler;
>>>>>>> 497aa13 (anya-md)
