import type { NextApiRequest, NextApiResponse } from 'next'

// Comprehensive fallback city list
const CITIES_IL = [
  'אבו גוש','אבו סנאן','אור יהודה','אור עקיבא','אילת','אלעד','אריאל','אשדוד','אשקלון',
  'באקה אל-גרביה','באר שבע','בית שאן','בית שמש','ביתר עילית','בני ברק','בת ים',
  'גבעת שמואל','גבעתיים','גדרה','גן יבנה','דימונה','הוד השרון','הרצליה','זכרון יעקב',
  'חדרה','חולון','חיפה','טבריה','טייבה','טירה','טירת כרמל','יבנה','יהוד-מונוסון',
  'יקנעם עילית','ירושלים','כפר יונה','כפר סבא','כפר קאסם','כרמיאל','לוד',
  'מודיעין-מכבים-רעות','מעלה אדומים','מעלות-תרשיחא','משהד','נהריה','נוף הגליל',
  'נס ציונה','נצרת','נצרת עילית','נשר','נתיבות','נתניה','סח'נין','עכו','עפולה',
  'עראבה','ערד','פתח תקווה','צפת','קלנסווה','קריית אונו','קריית אתא','קריית ביאליק',
  'קריית גת','קריית ים','קריית מוצקין','קריית מלאכי','קריית שמונה','רהט','רחובות',
  'רמלה','רמת גן','רמת השרון','רעננה','ראש העין','ראשון לציון','שפרעם','תל אביב - יפו',
  'תל אביב','יפו'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const q = (req.query.q as string || '').trim();
  if (!q || q.length < 2) return res.json({ cities: [] });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  // First: instant local filter
  const local = CITIES_IL.filter(c => c.includes(q)).slice(0, 8);

  // Then: try data.gov.il API
  try {
    const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&q=${encodeURIComponent(q)}&limit=12`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'FiberChecker/2.0' },
      signal: AbortSignal.timeout(4000)
    });
    const d = await r.json();
    const apiCities: string[] = [];
    if (d?.result?.records) {
      for (const rec of d.result.records) {
        const name = rec['שם_ישוב'] || rec['city_name'] || rec['CITY_NAME'] || '';
        const clean = name.trim();
        if (clean && !apiCities.includes(clean)) apiCities.push(clean);
      }
    }
    // Merge: API results + local fallback, deduplicated
    const merged = [...new Set([...apiCities, ...local])].slice(0, 8);
    return res.json({ cities: merged });
  } catch {
    // API failed → use local
    return res.json({ cities: local });
  }
      }
