import type { NextApiRequest, NextApiResponse } from 'next'

function enc(s: string) { return encodeURIComponent(s) }

async function checkBezeq(city: string, street: string, num: string) {
  try {
    const url = 'https://www.bezeq.co.il/umbraco/surface/BfibreAddressCheck/CheckAddress?city=' + enc(city) + '&street=' + enc(street) + '&num=' + enc(num)
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'application/json,*/*', 'Referer': 'https://www.bezeq.co.il/', 'Origin': 'https://www.bezeq.co.il' },
      signal: AbortSignal.timeout(8000),
    })
    const text = await r.text()
    let available = false
    try {
      const json = JSON.parse(text)
      if (typeof json === 'boolean') available = json
      else if (typeof json === 'object' && json !== null) {
        available = !!(json.IsAvailable || json.isAvailable || json.Available || json.available || json.isFiberAvailable)
      }
    } catch { available = text.trim().toLowerCase() === 'true' }
    return { available, checked: true, url: 'https://www.bezeq.co.il/internetandphone/internet/bfiber_addresscheck/?city=' + enc(city) + '&street=' + enc(street) + '&num=' + enc(num) }
  } catch { return { available: false, checked: false, url: 'https://www.bezeq.co.il/internetandphone/internet/bfiber_addresscheck/?city=' + enc(city) + '&street=' + enc(street) + '&num=' + enc(num) } }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const city = (req.query.city as string) || ''
  const street = (req.query.street as string) || ''
  const num = (req.query.num as string) || ''
  if (!city || !street) return res.status(400).json({ error: 'Missing city or street' })
  
  const bezeq = await checkBezeq(city, street, num)
  res.setHeader('Cache-Control', 'no-store')
  res.json({
    city, street, num,
    bezeq_available: bezeq.available,
    bezeq_checked: bezeq.checked,
    providers: [
      { provider: 'bezeq', available: bezeq.available, url: bezeq.url },
      { provider: 'hot', available: null, url: 'https://www.hot.net.il/heb/internet/fiber-check/?city=' + enc(city) + '&street=' + enc(street) + '&house=' + enc(num) },
      { provider: 'cellcom', available: null, url: 'https://cellcom.co.il/sale/jet/internet_ktovet/?city=' + enc(city) + '&street=' + enc(street) + '&num=' + enc(num) },
      { provider: 'yes', available: null, url: 'https://www.yes.co.il/internet/fiber-address-check/?city=' + enc(city) + '&street=' + enc(street) + '&num=' + enc(num) },
    ]
  })
}