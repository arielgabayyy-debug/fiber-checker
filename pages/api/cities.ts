import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query
  if (!q || typeof q !== 'string') return res.status(400).json({ cities: [] })
  try {
    const url = 'https://data.gov.il/api/3/action/datastore_search?resource_id=d4901968-dad3-4845-a9b0-a57d027f11ab&q=' + encodeURIComponent(q) + '&limit=10'
    const r = await fetch(url, { headers: { 'User-Agent': 'FiberChecker/1.0' }, signal: AbortSignal.timeout(5000) })
    const data = await r.json()
    const cities: string[] = []
    if (data?.result?.records) {
      for (const rec of data.result.records) {
        const name = rec['שם_ישוב'] || rec['SHEM_YISHUV'] || rec['city_name']
        if (name && typeof name === 'string') { const c = name.trim(); if (c && !cities.includes(c)) cities.push(c) }
      }
    }
    res.setHeader('Cache-Control', 's-maxage=3600')
    res.json({ cities })
  } catch {
    const major = ['תל אביב','ירושלים','חיפה','ראשון לציון','פתח תקווה','אשדוד','נתניה','באר שבע','חולון','בני ברק','רמת גן','אשקלון','רחובות','בת ים','הרצליה','כפר סבא','מודיעין','חדרה','לוד','רמלה','עכו','נהריה','קריית גת','אילת','הוד השרון','גבעתיים','נצרת','ביתר עילית','מעלה אדומים','טבריה','צפת','כרמיאל','יבנה','קריית מוצקין','דימונה','עפולה','נס ציונה','רעננה','יהוד','קריית שמונה','זכרון יעקב','ערד']
    res.json({ cities: major.filter(c => c.includes(q as string)).slice(0, 8) })
  }
}