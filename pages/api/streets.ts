import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query.q as string || '').trim()
  const city = (req.query.city as string || '').trim()
  if (!q || q.length < 2) return res.json({ streets: [] })

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate')

  const RESOURCE_ID = 'a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3'

  const extractStreets = (records: any[]): string[] => {
    const out: string[] = []
    for (const rec of records) {
      const name = rec['שם_רחוב'] || rec['STREET_NAME'] || rec['street_name'] || ''
      const clean = name.trim()
      if (clean && !out.includes(clean)) out.push(clean)
    }
    return out
  }

  try {
    const filter = city ? JSON.stringify({ CITY_NAME: city }) : null
    const url1 = 'https://data.gov.il/api/3/action/datastore_search?resource_id=' + RESOURCE_ID
      + '&q=' + encodeURIComponent(q)
      + (filter ? '&filters=' + encodeURIComponent(filter) : '')
      + '&limit=15'
    const r1 = await fetch(url1, { headers: { 'User-Agent': 'FiberChecker/2.0' }, signal: AbortSignal.timeout(5000) })
    const d1 = await r1.json()
    let streets = extractStreets(d1?.result?.records || [])

    if (streets.length === 0 && city) {
      const url2 = 'https://data.gov.il/api/3/action/datastore_search?resource_id=' + RESOURCE_ID
        + '&q=' + encodeURIComponent(q) + '&limit=15'
      const r2 = await fetch(url2, { headers: { 'User-Agent': 'FiberChecker/2.0' }, signal: AbortSignal.timeout(5000) })
      const d2 = await r2.json()
      streets = extractStreets(d2?.result?.records || [])
    }

    return res.json({ streets: streets.slice(0, 8) })
  } catch {
    return res.json({ streets: [] })
  }
}
