import type { NextApiRequest, NextApiResponse } from 'next'

const enc = (s: string) => encodeURIComponent(s || '')

async function checkBezeq(city: string, street: string, num: string) {
  const endpoints = [
    'https://www.bezeq.co.il/umbraco/Surface/FiberAddress/CheckAddress?cityName=' + enc(city) + '&streetName=' + enc(street) + '&houseNum=' + enc(num),
    'https://www.bezeq.co.il/umbraco/Api/FiberAddress/CheckAddress?city=' + enc(city) + '&street=' + enc(street) + '&num=' + enc(num),
  ]
  for (const url of endpoints) {
    try {
      const r = await fetch(url, {
        signal: AbortSignal.timeout(7000),
        headers: {
          'Referer': 'https://www.bezeq.co.il/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

const enc = (s: string) => encodeURIComponent(s || '')

async function checkBezeq(city: string, street: string, num: string) {
  const endpoints = [
    'https://www.bezeq.co.il/umbraco/Surface/FiberAddress/CheckAddress?cityName=' + enc(city) + '&streetName=' + enc(street) + '&houseNum=' + enc(num),
    'https://www.bezeq.co.il/umbraco/Api/FiberAddress/CheckAddress?city=' + enc(city) + '&street=' + enc(street) + '&num=' + enc(num),
  ]
  for (const url of endpoints) {
    try {
      const r = await fetch(url, {
        signal: AbortSignal.timeout(7000),
        headers: {
          'Referer': 'https://www.bezeq.co.il/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Origin': 'https://www.bezeq.co.il',
          'Accept-Language': 'he-IL,he;q=0.9',
        }
      })
      if (!r.ok) continue
      const text = await r.text()
      try {
        const json = JSON.parse(text)
        const keys = ['IsAvailable','isAvailable','Available','available','isFiberAvailable','FiberAvailable']
        for (const k of keys) {
          if (json[k] === true || json[k] === 'true') return { available: true, checked: true }
          if (json[k] === false || json[k] === 'false') return { available: false, checked: true }
        }
        if (json.data) {
          for (const k of keys) {
            if (json.data[k] === true) return { available: true, checked: true }
            if (json.data[k] === false) return { available: false, checked: true }
          }
        }
      } catch {
        const t = text.trim().toLowerCase()
        if (t === 'true' || t === '1') return { available: true, checked: true }
        if (t === 'false' || t === '0') return { available: false, checked: true }
      }
    } catch { continue }
  }
  return { available: null, checked: false }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const city = (req.query.city as string || '').trim()
  const street = (req.query.street as string || '').trim()
  const num = (req.query.num as string || '').trim()

  if (!city || !street) return res.status(400).json({ error: 'Missing city or street' })

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')

  const bezeq = await checkBezeq(city, street, num)

  return res.json({
    city, street, num,
    bezeq_available: bezeq.available,
    bezeq_checked: bezeq.checked,
    hot_available: null,
    partner_available: null,
    cellcom_available: null,
  })
              }
