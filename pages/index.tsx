import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'

const CITIES = ['נהריה','חיפה','תל אביב','ירושלים','באר שבע','ראשון לציון','אשדוד','אשקלון','רחובות','פתח תקווה','הרצליה','רמת גן','גבעתיים','בני ברק','כפר סבא','נתניה','אילת','רעננה','הוד השרון','לוד','רמלה','נצרת','עפולה','חולון','בת ים','טבריה','צפת','קריית שמונה','מעלות-תרשיחא','עכו','קריית גת','קריית ביאליק','קריית ים','קריית מוצקין','זכרון יעקב','יקנעם','דימונה','ערד','מצפה רמון','בית שמש','מודיעין']

interface Provider { id: string; name: string; logo: string; available: boolean | null; checked: boolean; url: string }
interface Result { city: string; street: string; num: string; providers: Provider[] }

export default function Home() {
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [num, setNum] = useState('')
  const [cityOpts, setCityOpts] = useState<string[]>([])
  const [streetOpts, setStreetOpts] = useState<string[]>([])
  const [showCity, setShowCity] = useState(false)
  const [showStreet, setShowStreet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [err, setErr] = useState('')
  const cT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cT.current) clearTimeout(cT.current)
    if (city.length < 2) { setCityOpts([]); setShowCity(false); return }
    const loc = CITIES.filter(c => c.includes(city)).slice(0, 6)
    if (loc.length) { setCityOpts(loc); setShowCity(true) }
    cT.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/cities?q=' + encodeURIComponent(city))
        const d = await r.json()
        if (d.cities?.length) { setCityOpts(d.cities); setShowCity(true) }
      } catch (_) { /* noop */ }
    }, 300)
  }, [city])

  useEffect(() => {
    if (sT.current) clearTimeout(sT.current)
    if (street.length < 2) { setStreetOpts([]); setShowStreet(false); return }
    sT.current = setTimeout(async () => {
      try {
        const r = await fetch('/api/streets?q=' + encodeURIComponent(street) + '&city=' + encodeURIComponent(city))
        const d = await r.json()
        if (d.streets?.length) { setStreetOpts(d.streets); setShowStreet(true) }
      } catch (_) { /* noop */ }
    }, 300)
  }, [street, city])

  const check = async () => {
    if (!city || !street) { setErr('אנא מלא עיר ורחוב'); return }
    setErr(''); setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/check?city=' + encodeURIComponent(city) + '&street=' + encodeURIComponent(street) + '&num=' + encodeURIComponent(num))
      const d = await r.json()
      setResult(d)
      setTimeout(() => rRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (_) { setErr('שגיאה, נסה שוב') }
    finally { setLoading(false) }
  }

  return (
    <>
      <Head>
        <title>בדיקת זמינות סיבים | ניתוק וחיבור בקליק</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="pg">
        <div className="hdr">
          <div className="badge">⚡ ניתוק וחיבור בקליק</div>
          <h1>בדוק זמינות <span className="blue">סיבים אופטיים</span><br />בכתובת שלך</h1>
          <p className="sub">מלא את הכתובת ובדוק ישירות אצל כל הספקים</p>
        </div>

        <div className="card">
          <div className="clbl">כתובת לבדיקה</div>
          <div className="row">
            <div className="fld fld2">
              <label>עיר</label>
              <div className="iw">
                <input value={city} onChange={e => { setCity(e.target.value); setStreet('') }}
                  onFocus={() => cityOpts.length && setShowCity(true)}
                  onBlur={() => setTimeout(() => setShowCity(false), 150)}
                  placeholder="לדוגמה: נהריה"
                  className={err && !city ? 'inp ierr' : 'inp'} />
                {showCity && cityOpts.length > 0 && (
                  <div className="dd">
                    {cityOpts.map(o => <div key={o} className="ddi" onMouseDown={() => { setCity(o); setShowCity(false) }}>{o}</div>)}
                  </div>
                )}
              </div>
            </div>
            <div className="fld fld3">
              <label>רחוב</label>
              <div className="iw">
                <input value={street} onChange={e => setStreet(e.target.value)}
                  onFocus={() => streetOpts.length && setShowStreet(true)}
                  onBlur={() => setTimeout(() => setShowStreet(false), 150)}
                  placeholder="לדוגמה: בק ליאו"
                  className={err && !street ? 'inp ierr' : 'inp'} />
                {showStreet && streetOpts.length > 0 && (
                  <div className="dd">
                    {streetOpts.map(o => <div key={o} className="ddi" onMouseDown={() => { setStreet(o); setShowStreet(false) }}>{o}</div>)}
                  </div>
                )}
              </div>
            </div>
            <div className="fld fld1">
              <label>מספר</label>
              <input value={num} onChange={e => setNum(e.target.value)}
                placeholder="64" inputMode="numeric"
                className="inp"
                onKeyDown={e => e.key === 'Enter' && check()} />
            </div>
          </div>

          {err && <div className="emsg">⚠️ {err}</div>}
          {loading && <div className="sbar"><div className="sfill" /></div>}

          <button className={loading ? 'btn bload' : 'btn'} onClick={check} disabled={loading}>
            {loading ? <><span className="spin" />מחפש...</> : <>🔍&nbsp;סרוק זמינות סיבים</>}
          </button>

          <div className="cstrip">
            <a href="https://wa.me/972505037537" className="bc bwa" target="_blank" rel="noopener">💬&nbsp;WhatsApp</a>
            <a href="tel:050-503-7537" className="bc bcall">📞&nbsp;050-503-7537</a>
          </div>
        </div>

        {result && (
          <div className="card rcard" ref={rRef}>
            <div className="clbl">תוצאות עבור {result.city}, {result.street} {result.num}</div>
            <div className="info-box">
              <span>💡</span>
              <p>לחץ על כפתור כל ספק כדי לבדוק זמינות סיבים בכתובתך ישירות באתר שלו — הכתובת כבר ממולאת!</p>
            </div>
            <div className="pgrid">
              {result.providers?.map(p => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener" className="pc">
                  <div className="pico">{p.logo}</div>
                  <div className="pnm">{p.name}</div>
                  <div className="pcheck">בדוק באתר ↗</div>
                </a>
              ))}
            </div>
            <div className="dvd"><span>צריך עזרה?</span></div>
            <div className="hlp">📞&nbsp;<span>התקשר אלינו בחינם — <a href="tel:050-503-7537" style={{ color: 'inherit', fontWeight: 600 }}>050-503-7537</a> — נבדוק בשבילך ונחבר לספק הטוב ביותר!</span></div>
          </div>
        )}

        <div className="ftr">שירות חינמי מבית <strong>ניתוק וחיבור בקליק</strong> · 050-503-7537</div>
      </div>
    </>
  )
        }
