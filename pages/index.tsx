import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'

const CITIES = ['נהריה','חיפה','תל אביב','ירושלים','באר שבע','ראשון לציון','אשדוד','אשקלון','רחובות','פתח תקווה','הרצליה','רמת גן','גבעתיים','בני ברק','כפר סבא','נתניה','אילת','רעננה','הוד השרון','לוד','רמלה','נצרת','עפולה','חולון','בת ים','טבריה','צפת','קריית שמונה','מעלות-תרשיחא','עכו','קריית גת','קריית ביאליק','קריית ים','קריית מוצקין','זכרון יעקב','יקנעם','דימונה','ערד','מצפה רמון','בית שמש','מודיעין']

const PROVIDERS = [
  { id:'bezeq', name:'בזק', color:'#e84355', bg:'#fff5f6', border:'#ffd0d6', icon:'📡' },
  { id:'hot', name:'HOT', color:'#ff6b35', bg:'#fff8f5', border:'#ffd5c2', icon:'🔥' },
  { id:'cellcom', name:'סלקום', color:'#00a651', bg:'#f0fdf4', border:'#bbf7d0', icon:'📶' },
  { id:'partner', name:'פרטנר', color:'#1a5fb4', bg:'#eff6ff', border:'#bfdbfe', icon:'🌐' },
]

interface Result { city: string; street: string; num: string; providers: {id:string;name:string;logo:string;available:boolean|null;checked:boolean;url:string}[] }

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
  const cT = useRef<any>(null)
  const sT = useRef<any>(null)
  const rRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cT.current) clearTimeout(cT.current)
    if (city.length < 2) { setCityOpts([]); setShowCity(false); return }
    const loc = CITIES.filter(c => c.includes(city)).slice(0, 6)
    if (loc.length) { setCityOpts(loc); setShowCity(true) }
    cT.current = setTimeout(async () => {
      try { const r = await fetch('/api/cities?q=' + encodeURIComponent(city)); const d = await r.json(); if (d.cities?.length) { setCityOpts(d.cities); setShowCity(true) } } catch (_) {}
    }, 300)
  }, [city])

  useEffect(() => {
    if (sT.current) clearTimeout(sT.current)
    if (street.length < 2) { setStreetOpts([]); setShowStreet(false); return }
    sT.current = setTimeout(async () => {
      try { const r = await fetch('/api/streets?q=' + encodeURIComponent(street) + '&city=' + encodeURIComponent(city)); const d = await r.json(); if (d.streets?.length) { setStreetOpts(d.streets); setShowStreet(true) } } catch (_) {}
    }, 300)
  }, [street, city])

  const check = async () => {
    if (!city || !street) { setErr('אנא מלא עיר ורחוב'); return }
    setErr(''); setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/check?city=' + encodeURIComponent(city) + '&street=' + encodeURIComponent(street) + '&num=' + encodeURIComponent(num))
      const d = await r.json(); setResult(d)
      setTimeout(() => rRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (_) { setErr('שגיאה, נסה שוב') }
    finally { setLoading(false) }
  }

  return (
    <>
      <Head>
        <title>בדיקת זמינות סיבים אופטיים | ניתוק וחיבור בקליק</title>
        <meta name="description" content="בדוק זמינות סיבים אופטיים בכתובתך אצל בזק, HOT, פרטנר וסלקום" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        {/* Hero Header */}
        <header className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <div className="brand-pill">⚡ ניתוק וחיבור בקליק</div>
            <h1 className="hero-title">
              בדוק זמינות <span className="gradient-text">סיבים אופטיים</span>
              <br />בכתובת שלך
            </h1>
            <p className="hero-sub">בדיקה מיידית ומקצועית אצל כל הספקים — בזק, HOT, פרטנר וסלקום</p>
            <div className="stats-row">
              <div className="stat"><span className="stat-num">4</span><span className="stat-lbl">ספקים</span></div>
              <div className="stat-div" />
              <div className="stat"><span className="stat-num">חינם</span><span className="stat-lbl">100%</span></div>
              <div className="stat-div" />
              <div className="stat"><span className="stat-num">מיידי</span><span className="stat-lbl">תוצאה</span></div>
            </div>
          </div>
        </header>

        {/* Search Card */}
        <main className="main-wrap">
          <div className="search-card">
            <div className="card-header">
              <div className="card-icon">🔍</div>
              <div>
                <h2 className="card-title">הזן כתובת לבדיקה</h2>
                <p className="card-desc">מלא עיר, רחוב ומספר בית לבדיקת זמינות</p>
              </div>
            </div>

            <div className="fields-row">
              <div className="field field-city">
                <label>עיר</label>
                <div className="input-wrap">
                  <input value={city} onChange={e => { setCity(e.target.value); setStreet('') }}
                    onFocus={() => cityOpts.length && setShowCity(true)}
                    onBlur={() => setTimeout(() => setShowCity(false), 150)}
                    placeholder="לדוגמה: נהריה"
                    className={'inp' + (err && !city ? ' inp-err' : '')} />
                  {showCity && cityOpts.length > 0 && (
                    <ul className="dropdown">
                      {cityOpts.map(o => <li key={o} onMouseDown={() => { setCity(o); setShowCity(false) }}>{o}</li>)}
                    </ul>
                  )}
                </div>
              </div>
              <div className="field field-street">
                <label>רחוב</label>
                <div className="input-wrap">
                  <input value={street} onChange={e => setStreet(e.target.value)}
                    onFocus={() => streetOpts.length && setShowStreet(true)}
                    onBlur={() => setTimeout(() => setShowStreet(false), 150)}
                    placeholder="לדוגמה: בק ליאו"
                    className={'inp' + (err && !street ? ' inp-err' : '')} />
                  {showStreet && streetOpts.length > 0 && (
                    <ul className="dropdown">
                      {streetOpts.map(o => <li key={o} onMouseDown={() => { setStreet(o); setShowStreet(false) }}>{o}</li>)}
                    </ul>
                  )}
                </div>
              </div>
              <div className="field field-num">
                <label>מס׳</label>
                <input value={num} onChange={e => setNum(e.target.value)} placeholder="64"
                  inputMode="numeric" className="inp" onKeyDown={e => e.key === 'Enter' && check()} />
              </div>
            </div>

            {err && <div className="err-msg"><span>⚠️</span> {err}</div>}

            <button className={'check-btn' + (loading ? ' loading' : '')} onClick={check} disabled={loading}>
              {loading ? <><span className="spinner" /> בודק זמינות...</> : <><span>🔍</span> סרוק זמינות סיבים</>}
            </button>

            <div className="contact-bar">
              <a href="https://wa.me/972505037537" className="contact-btn whatsapp" target="_blank" rel="noopener">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.139.563 4.147 1.547 5.885L0 24l6.335-1.524A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.368l-.357-.214-3.758.904.942-3.656-.234-.375A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
                WhatsApp
              </a>
              <a href="tel:050-503-7537" className="contact-btn phone">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                050-503-7537
              </a>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="results-wrap" ref={rRef}>
              <div className="results-header">
                <div className="results-address">
                  <span className="address-icon">📍</span>
                  <strong>{[result.city, result.street, result.num].filter(Boolean).join(' ')}</strong>
                </div>
                <div className="results-tip">לחץ על ספק לבדיקה ישירה באתר שלו</div>
              </div>

              <div className="providers-grid">
                {PROVIDERS.map(prov => {
                  const data = result.providers?.find(p => p.id === prov.id)
                  return (
                    <a key={prov.id} href={data?.url || '#'} target="_blank" rel="noopener"
                      className="provider-card"
                      style={{ '--pcolor': prov.color, '--pbg': prov.bg, '--pborder': prov.border } as any}>
                      <div className="prov-accent" />
                      <div className="prov-icon">{prov.icon}</div>
                      <div className="prov-name">{prov.name}</div>
                      <div className="prov-action">
                        <span>בדוק זמינות</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                      </div>
                    </a>
                  )
                })}
              </div>

              <div className="help-banner">
                <div className="help-icon">💬</div>
                <div className="help-text">
                  <strong>צריך עזרה בבחירת ספק?</strong>
                  <span>נשמח לייעץ בחינם — <a href="tel:050-503-7537">050-503-7537</a> או <a href="https://wa.me/972505037537" target="_blank" rel="noopener">WhatsApp</a></span>
                </div>
              </div>
            </div>
          )}

          {/* Speed Test Section */}
          <div className="speedtest-section">
            <div className="speedtest-card">
              <div className="speedtest-header">
                <div className="speedtest-icon">⚡</div>
                <div>
                  <h3 className="speedtest-title">בדיקת מהירות גלישה</h3>
                  <p className="speedtest-desc">Speedtest by Ookla — הבדיקה המהימנה בישראל</p>
                </div>
              </div>
              <div className="speedtest-info">
                <div className="info-item"><span>🎯</span> דיוק גבוה</div>
                <div className="info-item"><span>🌍</span> שרתים מקומיים</div>
                <div className="info-item"><span>📊</span> מהירות הורדה ועלייה</div>
                <div className="info-item"><span>📡</span> Ping ואיכות חיבור</div>
              </div>
              <a href="https://www.speedtest.net" target="_blank" rel="noopener" className="speedtest-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                התחל בדיקת מהירות
              </a>
              <p className="speedtest-note">* הבדיקה תיפתח באתר Speedtest.net בחלון חדש</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>שירות חינמי מבית <strong>ניתוק וחיבור בקליק</strong> · <a href="tel:050-503-7537">050-503-7537</a></p>
        </footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
        html { scroll-behavior: smooth }
        body { font-family: 'Rubik', sans-serif; background: #f0f4ff; color: #1a1f3a; direction: rtl; min-height: 100vh }
        a { text-decoration: none; color: inherit }
        button { font-family: 'Rubik', sans-serif }
      `}</style>

      <style jsx>{`
        .page { min-height: 100vh; display: flex; flex-direction: column }

        /* Hero */
        .hero { position: relative; overflow: hidden; background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 50%, #1e3a5f 100%); color: #fff; padding: 60px 24px 80px; text-align: center }
        .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 50%, rgba(58,92,245,.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,179,237,.15) 0%, transparent 50%); pointer-events: none }
        .hero-content { position: relative; max-width: 640px; margin: 0 auto }
        .brand-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); color: #e2e8f0; font-size: 13px; font-weight: 500; padding: 6px 16px; border-radius: 999px; margin-bottom: 20px; backdrop-filter: blur(8px) }
        .hero-title { font-size: clamp(28px, 6vw, 44px); font-weight: 800; line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.5px }
        .gradient-text { background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text }
        .hero-sub { color: #94a3b8; font-size: 16px; font-weight: 400; margin-bottom: 32px; line-height: 1.6 }
        .stats-row { display: flex; align-items: center; justify-content: center; gap: 0 }
        .stat { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 0 24px }
        .stat-num { font-size: 22px; font-weight: 700; color: #fff }
        .stat-lbl { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px }
        .stat-div { width: 1px; height: 32px; background: rgba(255,255,255,.15) }

        /* Main */
        .main-wrap { flex: 1; max-width: 680px; width: 100%; margin: -32px auto 0; padding: 0 16px 48px; display: flex; flex-direction: column; gap: 20px }

        /* Search Card */
        .search-card { background: #fff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,.12); padding: 32px; border: 1px solid rgba(58,92,245,.08) }
        .card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px }
        .card-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #3a5cf5, #6366f1); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0 }
        .card-title { font-size: 20px; font-weight: 700; color: #1a1f3a; margin-bottom: 2px }
        .card-desc { font-size: 13px; color: #64748b }

        /* Fields */
        .fields-row { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap }
        .field { display: flex; flex-direction: column; gap: 6px }
        .field-city { flex: 2; min-width: 120px }
        .field-street { flex: 3; min-width: 160px }
        .field-num { flex: 1; min-width: 70px }
        .field label { font-size: 12px; font-weight: 600; color: #475569; letter-spacing: 0.3px }
        .input-wrap { position: relative }
        .inp { width: 100%; padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 12px; font-family: 'Rubik', sans-serif; font-size: 15px; color: #1a1f3a; background: #f8faff; outline: none; transition: all .2s; text-align: right }
        .inp::placeholder { color: #94a3b8 }
        .inp:focus { border-color: #3a5cf5; background: #fff; box-shadow: 0 0 0 4px rgba(58,92,245,.08) }
        .inp-err { border-color: #f87171 !important }

        /* Dropdown */
        .dropdown { position: absolute; top: calc(100% + 4px); right: 0; left: 0; background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.12); z-index: 100; overflow: hidden; list-style: none }
        .dropdown li { padding: 11px 14px; cursor: pointer; font-size: 14px; color: #1a1f3a; transition: background .15s; border-bottom: 1px solid #f1f5f9 }
        .dropdown li:last-child { border-bottom: none }
        .dropdown li:hover { background: #f0f4ff; color: #3a5cf5; font-weight: 500 }

        /* Error */
        .err-msg { display: flex; align-items: center; gap: 6px; color: #ef4444; font-size: 13px; margin-bottom: 12px; padding: 10px 14px; background: #fef2f2; border-radius: 10px; border: 1px solid #fecaca }

        /* Check Button */
        .check-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #3a5cf5, #6366f1); color: #fff; border: none; border-radius: 14px; font-size: 17px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 24px rgba(58,92,245,.35); transition: all .2s; letter-spacing: 0.2px }
        .check-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(58,92,245,.45) }
        .check-btn:active:not(:disabled) { transform: translateY(0) }
        .check-btn:disabled { background: #c7d2fe; box-shadow: none; cursor: not-allowed }
        .check-btn.loading { background: #4f46e5 }
        .spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block }
        @keyframes spin { to { transform: rotate(360deg) } }

        /* Contact Bar */
        .contact-bar { display: flex; gap: 10px; margin-top: 14px }
        .contact-btn { flex: 1; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .2s; border: 2px solid transparent }
        .contact-btn:hover { transform: translateY(-1px) }
        .whatsapp { background: #dcfce7; color: #15803d; border-color: #86efac }
        .whatsapp:hover { background: #25d366; color: #fff; border-color: #25d366 }
        .phone { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe }
        .phone:hover { background: #3a5cf5; color: #fff; border-color: #3a5cf5 }

        /* Results */
        .results-wrap { background: #fff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,.1); overflow: hidden; border: 1px solid rgba(58,92,245,.08) }
        .results-header { padding: 20px 24px 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: linear-gradient(135deg, #f8faff, #f0f4ff) }
        .results-address { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: #1a1f3a }
        .address-icon { font-size: 20px }
        .results-tip { font-size: 12px; color: #64748b; background: #fff; padding: 4px 12px; border-radius: 999px; border: 1px solid #e2e8f0 }
        .providers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .provider-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 28px 20px; text-align: center; border: 1px solid var(--pborder); background: var(--pbg); cursor: pointer; transition: all .2s; position: relative; overflow: hidden }
        .provider-card:hover { transform: scale(1.02); z-index: 1; box-shadow: 0 8px 24px rgba(0,0,0,.12); border-radius: 4px }
        .prov-accent { position: absolute; top: 0; right: 0; left: 0; height: 4px; background: var(--pcolor); border-radius: 0 }
        .prov-icon { font-size: 36px; margin-bottom: 4px }
        .prov-name { font-size: 20px; font-weight: 700; color: #1a1f3a }
        .prov-action { display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; color: var(--pcolor); background: white; padding: 5px 12px; border-radius: 999px; border: 1.5px solid var(--pborder); transition: all .2s }
        .provider-card:hover .prov-action { background: var(--pcolor); color: white; border-color: var(--pcolor) }
        .help-banner { margin: 16px; padding: 16px 20px; background: linear-gradient(135deg, #eff6ff, #f0f4ff); border: 1px solid #bfdbfe; border-radius: 14px; display: flex; align-items: center; gap: 14px }
        .help-icon { font-size: 28px; flex-shrink: 0 }
        .help-text { display: flex; flex-direction: column; gap: 3px }
        .help-text strong { font-size: 14px; color: #1e3a8a }
        .help-text span { font-size: 13px; color: #3730a3 }
        .help-text a { color: #3a5cf5; font-weight: 600; text-decoration: underline }

        /* Speed Test */
        .speedtest-section { }
        .speedtest-card { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #172554 100%); border-radius: 24px; padding: 32px; color: #fff; position: relative; overflow: hidden }
        .speedtest-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,.2) 0%, transparent 50%); pointer-events: none }
        .speedtest-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; position: relative }
        .speedtest-icon { width: 52px; height: 52px; background: linear-gradient(135deg, #6366f1, #3b82f6); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0 }
        .speedtest-title { font-size: 20px; font-weight: 700; margin-bottom: 4px }
        .speedtest-desc { font-size: 13px; color: #94a3b8 }
        .speedtest-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; position: relative }
        .info-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #cbd5e1; background: rgba(255,255,255,.07); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,.1) }
        .speedtest-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 16px; background: linear-gradient(135deg, #6366f1, #3b82f6); color: #fff; border-radius: 14px; font-size: 16px; font-weight: 700; transition: all .2s; box-shadow: 0 8px 24px rgba(99,102,241,.4); position: relative }
        .speedtest-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(99,102,241,.5) }
        .speedtest-note { font-size: 11px; color: #64748b; text-align: center; margin-top: 10px; position: relative }

        /* Footer */
        .footer { background: #1a1f3a; color: #64748b; text-align: center; padding: 20px 24px; font-size: 13px }
        .footer strong { color: #94a3b8 }
        .footer a { color: #3a5cf5 }

        @media (max-width: 520px) {
          .hero { padding: 40px 16px 64px }
          .stats-row { gap: 0 }
          .stat { padding: 0 16px }
          .search-card { padding: 20px 16px }
          .fields-row { flex-direction: column }
          .field-city, .field-street, .field-num { flex: unset; width: 100% }
          .providers-grid { grid-template-columns: 1fr 1fr }
          .speedtest-info { grid-template-columns: 1fr 1fr }
        }
      `}</style>
    </>
  )
      }
