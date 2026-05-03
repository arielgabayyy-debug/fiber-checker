import type { NextApiRequest, NextApiResponse } from 'next'

const CITIES = ['תל אביב','ירושלים','חיפה','ראשון לציון','פתח תקווה','אשדוד','נתניה','באר שבע','חולון','בני ברק','רמת גן','אשקלון','רחובות','בת ים','הרצליה','כפר סבא','מודיעין','חדרה','לוד','רמלה','עכו','נהריה','קריית גת','אילת','הוד השרון','גבעתיים','קריית ביאליק','קריית אתא','נצרת','אום אל פחם','אלעד','ביתר עילית','מעלה אדומים','טבריה','צפת','כרמיאל','יבנה','קריית מוצקין','גדרה','טירת כרמל','כפר יונה','אור יהודה','מגדל העמק','דימונה','עפולה','נס ציונה','רעננה','גן יבנה','יהוד','קריית שמונה','זכרון יעקב','ערד','מצפה רמון','אופקים','שדרות','קריית מלאכי','בית שאן','רהט','טייבה','כפר קאסם','סחנין','באקה אל-גרבייה','טמרה','מגאר','שפרעם','ירכא','כפר מנדא','ג׳לג׳וליה','כפר ברא','ערערה','נצרת עילית','מעלות תרשיחא','כרמיאל','אשקלון','גבעת שמואל','פתח תקווה','נהריה','חדרה','עפולה','בית שמש','רהט','ירוחם','נתיבות','אופקים','שדרות']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query
  if (!q || typeof q !== 'string') return res.status(400).json({ cities: [] })
  
  const q_str = q.trim()
  
  // Try data.gov.il first
  try {
    const url = 'https://data.gov.il/api/3/action/datastore_search?resource_id=d4901968-dad3-4845-a9b0-a57d027f11ab&q=' + encodeURIComponent(q_str) + '&limit=10'
    const r = await fetch(url, { 
      headers: { 'User-Agent': 'FiberChecker/1.0' }, 
      signal: AbortSignal.timeout(4000) 
    })
    const data = await r.json()
    const cities: string[] = []
    if (data?.result?.records && data.result.records.length > 0) {
      for (const rec of data.result.records) {
        const name = rec['שם_ישוב'] || rec['SHEM_YISHUV'] || rec['city_name'] || rec['name']
        if (name && typeof name === 'string') {
          const c = name.trim().replace(/\s+/g, ' ')
          if (c && !cities.includes(c) && c.length > 1) cities.push(c)
        }
      }
    }
    if (cities.length > 0) {
      res.setHeader('Cache-Control', 's-maxage=3600')
      return res.json({ cities: cities.slice(0, 8) })
    }
  } catch (e) {
    // fallback below
  }
  
  // Fallback - local list
  const filtered = CITIES.filter(c => c.includes(q_str)).slice(0, 8)
  res.setHeader('Cache-Control', 's-maxage=60')
  res.json({ cities: filtered })
}