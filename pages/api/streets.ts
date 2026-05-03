import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { city, q } = req.query
  if (!q || typeof q !== 'string') return res.json({ streets: [] })
  try {
    const cityParam = typeof city === 'string' ? city : ''
    const url = 'https://data.gov.il/api/3/action/datastore_search?resource_id=a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3&q=' + encodeURIComponent(cityParam + ' ' + q) + '&limit=10'
    const r = await fetch(url, { headers: { 'User-Agent': 'FiberChecker/1.0' }, signal: AbortSignal.timeout(5000) })
    const data = await r.json()
    const streets: string[] = []
    if (data?.result?.records) {
      for (const rec of data.result.records) {
        const name = rec['STREET_NAME'] || rec['שם_רחוב']
        if (name && typeof name === 'string') { const s = name.trim(); if (s && !streets.includes(s)) streets.push(s) }
      }
    }
    res.setHeader('Cache-Control', 's-maxage=3600')
    res.json({ streets: streets.slice(0, 8) })
  } catch {
    res.json({ streets: [] })
  }
}