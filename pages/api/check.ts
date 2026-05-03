import type { NextApiRequest, NextApiResponse } from 'next'

const enc = (s: string) => encodeURIComponent(s || '')

async function checkBezeq(city: string, street: string, num: string) {
  // נסה מספר endpoints של בזק
  const urls = [
    `https://www.bezeq.co.il/umbraco/Surface/FiberAddress/CheckAddress?cityName=${enc(city)}&streetName=${enc(street)}&houseNum=${enc(num)}`,
    `https://www.bezeq.co.il/umbraco/Api/FiberAddress/CheckFiberAvailability?cityName=${enc(city)}&streetName=${enc(street)}&houseNum=${enc(num)}`,
    `https://selfservice.bezeq.co.il/api/FiberAvailability?city=${enc(city)}&street=${enc(street)}&houseNumber=${enc(num)}`,
  ]
  
  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.bezeq.co.il/',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
          'Origin': 'https://www.bezeq.co.il',
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: AbortSignal.timeout(8000),
      })
      
      if (!r.ok) continue
      
      const text = await r.text()
      if (!text) continue
      
      try {
        const json = JSON.parse(text)
        // בדוק כל שדה אפשרי
        const checks = ['IsAvailable','isAvailable','Available','available','isFiberAvailable','FiberAvailable','IsFiber','result','Result','success','Success']
        for (const k of checks) {
          if (json[k] === true || json[k] === 'true' || json[k] === 1) return { available: true, checked: true }
          if (json[k] === false || json[k] === 'false' || json[k] === 0) return { available: false, checked: true }
        }
        // בדוק nested
        if (json.Data) {
          for (const k of checks) {
            if (json.Data[k] === true) return { available: true, checked: true }
            if (json.Data[k] === false) return { available: false, checked: true }
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
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')

  const city   = ((req.query.city   as string) || '').trim()
  const street = ((req.query.street as string) || '').trim()
  const num    = ((req.query.num    as string) || '').trim()

  if (!city || !street) return res.status(400).json({ error: 'Missing params' })

  const bezeq = await checkBezeq(city, street, num)

  res.json({
    city, street, num,
    bezeq_available: bezeq.available,
    bezeq_checked: bezeq.checked,
    providers: [
      { id:'bezeq',   name:'בזק',    logo:'📡', available: bezeq.available, checked: bezeq.checked,
        url:`https://www.bezeq.co.il/internetandphone/internet/bfiber_addresscheck/?city=${enc(city)}&street=${enc(street)}&num=${enc(num)}` },
      { id:'hot',     name:'HOT',    logo:'🔥', available: null, checked: false,
        url:`https://www.hot.net.il/heb/internet/fiber-check/?city=${enc(city)}&street=${enc(street)}&house=${enc(num)}` },
      { id:'partner', name:'פרטנר', logo:'🌐', available: null, checked: false,
        url:`https://www.partner.co.il/internet/fiber/?city=${enc(city)}&street=${enc(street)}&num=${enc(num)}` },
      { id:'cellcom', name:'סלקום', logo:'📶', available: null, checked: false,
        url:`https://www.cellcom.co.il/sale/jet/internet_ktovet/?city=${enc(city)}&street=${enc(street)}&num=${enc(num)}` },
    ]
  })
}
