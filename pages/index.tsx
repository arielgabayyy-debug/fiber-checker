import { useState, useRef, useCallback } from 'react'
import Head from 'next/head'

const PROVIDERS = [
  { id: 'bezeq', label: 'בזק', icon: '📡', color: '#e84355',
    url: (c,s,n) => `https://www.bezeq.co.il/internetandphone/internet/bfiber_addresscheck/?city=${enc(c)}&street=${enc(s)}&num=${enc(n)}` },
  { id: 'hot', label: 'HOT', icon: '🔥', color: '#f5600a',
    url: (c,s,n) => `https://www.hot.net.il/heb/internet/fiber-check/?city=${enc(c)}&street=${enc(s)}&house=${enc(n)}` },
  { id: 'partner', label: 'פרטנר', icon: '🌐', color: '#1a5fb4',
    url: (c,s,n) => `https://www.partner.co.il/internet/fiber/?city=${enc(c)}&street=${enc(s)}&num=${enc(n)}` },
  { id: 'cellcom', label: 'סלקום', icon: '📶', color: '#00a651',
    url: (c,s,n) => `https://www.cellcom.co.il/sale/jet/internet_ktovet/?city=${enc(c)}&street=${enc(s)}&num=${enc(n)}` },
]
const enc = (s) => encodeURIComponent(s || '')

function useAC(apiPath, extra = {}) {
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(-1)
  const timer = useRef(null)

  const fetch_ = useCallback((val) => {
    if (!val || val.length < 2) { setItems([]); setOpen(false); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: val, ...extra })
        const r = await fetch(apiPath + '?' + params)
        const d = await r.json()
        const list = d.cities || d.streets || []
        setItems(list.slice(0, 8))
        setOpen(list.length > 0)
        setIdx(-1)
      } catch { setItems([]); setOpen(false) }
    }, 280)
  }, [apiPath, JSON.stringify(extra)])

  const onKey = (e, onSelect) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, items.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, -1)) }
    if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); onSelect(items[idx]); setOpen(false) }
    if (e.key === 'Escape') setOpen(false)
  }

  return { q, setQ: (v) => { setQ(v); fetch_(v) }, items, open, setOpen, idx, onKey }
}

export default function Home() {
  const city = useAC('/api/cities')
  const [cityVal, setCityVal] = useState('')
  const street = useAC('/api/streets', { city: cityVal })
  const [streetVal, setStreetVal] = useState('')
  const [num, setNum] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const selectCity = (v) => { setCityVal(v); city.setQ(v); city.setOpen(false); setStreetVal(''); street.setQ('') }
  const selectStreet = (v) => { setStreetVal(v); street.setQ(v); street.setOpen(false) }

  const check = async () => {
    if (!cityVal || !streetVal) return
    setLoading(true); setResult(null)
    try {
      const r = await fetch(`/api/check?city=${enc(cityVal)}&street=${enc(streetVal)}&num=${enc(num)}`)
      const d = await r.json()
      setResult(d)
    } catch { setResult({ error: true }) }
    finally { setLoading(false) }
  }

  const addr = [cityVal, streetVal, num].filter(Boolean).join(' ')

  return (
    <>
      <Head>
        <title>בדיקת זמינות סיבים | ניתוק וחיבור בקליק</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        <div className="wrap">
          {/* Header */}
          <div className="header">
            <div className="badge">⚡ ניתוק וחיבור בקליק</div>
            <h1>בדוק זמינות <span>סיבים</span><br/>בכתובת שלך</h1>
            <p>בדיקה מיידית אצל כל הספקים — בזק, HOT, פרטנר, סלקום</p>
          </div>

          {/* Search card */}
          <div className="card">
            <div className="label">כתובת לבדיקה</div>
            <div className="row">
              {/* City */}
              <div className="field" style={{flex:2}}>
                <label>עיר</label>
                <div className="ac-wrap">
                  <input
                    value={city.q}
                    onChange={e => { city.setQ(e.target.value); setCityVal(e.target.value) }}
                    onKeyDown={e => city.onKey(e, selectCity)}
                    onBlur={() => setTimeout(() => city.setOpen(false), 150)}
                    placeholder="נהריה, חיפה..."
                    className="inp"
                    autoComplete="off"
                  />
                  {city.open && (
                    <ul className="dd">
                      {city.items.map((item, i) => (
                        <li key={item} className={'ddi' + (i === city.idx ? ' active' : '')}
                          onMouseDown={() => selectCity(item)}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {/* Street */}
              <div className="field" style={{flex:2}}>
                <label>רחוב</label>
                <div className="ac-wrap">
                  <input
                    value={street.q}
                    onChange={e => { street.setQ(e.target.value); setStreetVal(e.target.value) }}
                    onKeyDown={e => street.onKey(e, selectStreet)}
                    onBlur={() => setTimeout(() => street.setOpen(false), 150)}
                    placeholder="בק ליאו..."
                    className="inp"
                    autoComplete="off"
                  />
                  {street.open && (
                    <ul className="dd">
                      {street.items.map((item, i) => (
                        <li key={item} className={'ddi' + (i === street.idx ? ' active' : '')}
                          onMouseDown={() => selectStreet(item)}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {/* Number */}
              <div className="field" style={{flex:'0 0 80px'}}>
                <label>מס׳</label>
                <input value={num} onChange={e => setNum(e.target.value)}
                  placeholder="64" className="inp" inputMode="numeric" />
              </div>
            </div>

            {loading && <div className="scan-bar"><div className="scan-fill" /></div>}

            <button className={'btn-check' + (loading ? ' loading' : '')} onClick={check} disabled={loading || !cityVal || !streetVal}>
              {loading ? <><span className="spin" />בודק...</> : <>🔍&nbsp; סרוק זמינות סיבים</>}
            </button>

            <div className="contact-row">
              <a href="https://wa.me/972505037537" className="btn-wa" target="_blank" rel="noopener">💬 WhatsApp</a>
              <a href="tel:050-503-7537" className="btn-call">📞 050-503-7537</a>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="card result-card">
              <div className="result-top">
                <div className="label">תוצאות</div>
                <div className="addr-line">{addr}</div>
              </div>

              {result.bezeq_available === true && (
                <div className="alert ok">✅ <strong>מעולה!</strong> יש זמינות סיבים בבזק בכתובת זו!</div>
              )}
              {result.bezeq_available === false && (
                <div className="alert no">❌ <strong>אין סיב</strong> אצל בזק — בדוק ספקים אחרים למטה</div>
              )}
              {result.bezeq_available === null && (
                <div className="alert info">🔍 לחץ על ספק לבדיקה ישירה באתר שלו</div>
              )}

              <div className="providers">
                {PROVIDERS.map(p => {
                  const av = result[p.id + '_available']
                  const cls = av === true ? 'pcard avail' : av === false ? 'pcard nope' : 'pcard pending'
                  return (
                    <a key={p.id} href={p.url(cityVal, streetVal, num)} target="_blank" rel="noopener" className={cls}>
                      <div className="p-bar" style={{background: p.color}} />
                      <div className="p-icon">{p.icon}</div>
                      <div className="p-name">{p.label}</div>
                      <div className={`p-status ${av === true ? 's-ok' : av === false ? 's-no' : 's-chk'}`}>
                        {av === true ? '✓ זמין' : av === false ? '✗ לא זמין' : 'לחץ לבדיקה ↗'}
                      </div>
                    </a>
                  )
                })}
              </div>

              <div className="help-box">
                💡 לא נורא! בדוק אצל שאר הספקים, או <a href="https://wa.me/972505037537" target="_blank" rel="noopener"><strong>צלצל אלינו</strong></a> — נמצא לך את הטוב ביותר.
              </div>
            </div>
          )}

          <div className="footer">שירות חינמי מבית <strong>ניתוק וחיבור בקליק</strong> · 050-503-7537</div>
        </div>
      </div>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Rubik',sans-serif;background:#eef2ff;color:#1a1f3a;min-height:100vh}
        .page{padding:32px 16px 60px;display:flex;justify-content:center}
        .wrap{width:100%;max-width:580px}
        .header{text-align:center;margin-bottom:28px}
        .badge{display:inline-flex;align-items:center;gap:6px;background:#e0e8ff;color:#3a5cf5;font-weight:600;font-size:13px;padding:5px 14px;border-radius:999px;margin-bottom:14px}
        h1{font-size:28px;font-weight:800;line-height:1.2;margin-bottom:8px} h1 span{color:#3a5cf5}
        .header p{color:#5a6282;font-size:15px}
        .card{background:#fff;border-radius:18px;box-shadow:0 4px 28px rgba(58,92,245,.09);border:1px solid #dde4f7;padding:26px;margin-bottom:14px}
        .label{font-size:11px;font-weight:700;color:#8892b0;letter-spacing:.9px;text-transform:uppercase;margin-bottom:12px}
        .row{display:flex;gap:10px;flex-wrap:wrap}
        .field{display:flex;flex-direction:column;position:relative}
        .field label{font-size:12px;font-weight:500;color:#5a6282;margin-bottom:5px}
        .inp{width:100%;padding:11px 13px;border:1.5px solid #dde4f7;border-radius:10px;font-family:'Rubik',sans-serif;font-size:15px;color:#1a1f3a;background:#f8faff;outline:none;transition:border-color .2s,box-shadow .2s;text-align:right}
        .inp::placeholder{color:#b0bcd8}
        .inp:focus{border-color:#3a5cf5;box-shadow:0 0 0 3px rgba(58,92,245,.1);background:#fff}
        .ac-wrap{position:relative}
        .dd{position:absolute;top:calc(100% + 4px);right:0;left:0;background:#fff;border:1.5px solid #dde4f7;border-radius:10px;box-shadow:0 8px 30px rgba(58,92,245,.13);z-index:999;max-height:200px;overflow-y:auto;list-style:none;padding:4px 0}
        .ddi{padding:9px 13px;cursor:pointer;font-size:14px;color:#1a1f3a;transition:background .12s}
        .ddi:hover,.ddi.active{background:#eef2ff;color:#3a5cf5}
        .scan-bar{height:3px;background:#eef2ff;border-radius:99px;margin:14px 0;overflow:hidden}
        .scan-fill{height:100%;width:40%;background:linear-gradient(90deg,transparent,#3a5cf5,transparent);animation:scan 1.2s ease-in-out infinite;border-radius:99px}
        @keyframes scan{0%{transform:translateX(250%)}100%{transform:translateX(-250%)}}
        .btn-check{width:100%;padding:14px;background:#3a5cf5;color:#fff;border:none;border-radius:10px;font-family:'Rubik',sans-serif;font-size:16px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .2s,transform .15s,box-shadow .2s;margin-top:8px;box-shadow:0 4px 18px rgba(58,92,245,.28)}
        .btn-check:hover:not(:disabled){background:#2a4ae0;box-shadow:0 6px 24px rgba(58,92,245,.38);transform:translateY(-1px)}
        .btn-check:disabled{background:#c0caf5;box-shadow:none;cursor:not-allowed}
        .spin{width:17px;height:17px;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
        @keyframes spin{to{transform:rotate(360deg)}}
        .contact-row{display:flex;gap:10px;margin-top:12px}
        .btn-wa{flex:1;padding:11px;background:#25d366;color:#fff;border:none;border-radius:10px;font-family:'Rubik',sans-serif;font-size:14px;font-weight:600;cursor:pointer;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;transition:opacity .2s}
        .btn-call{flex:1;padding:11px;background:#eef2ff;color:#3a5cf5;border:none;border-radius:10px;font-family:'Rubik',sans-serif;font-size:14px;font-weight:600;cursor:pointer;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;transition:opacity .2s}
        .btn-wa:hover,.btn-call:hover{opacity:.85}
        .result-card{margin-top:4px}
        .result-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
        .addr-line{font-size:14px;font-weight:600;color:#1a1f3a;background:#f0f4ff;padding:5px 12px;border-radius:8px}
        .alert{padding:12px 15px;border-radius:10px;font-size:14px;margin-bottom:14px}
        .alert.ok{background:#e8faf4;color:#007a52;border:1px solid #b8f0db}
        .alert.no{background:#fff0f2;color:#c0293a;border:1px solid #ffd0d6}
        .alert.info{background:#eef2ff;color:#3a5cf5;border:1px solid #d0d9ff}
        .providers{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
        .pcard{border:1.5px solid #dde4f7;border-radius:12px;padding:16px 12px;text-align:center;background:#f8faff;text-decoration:none;display:block;position:relative;overflow:hidden;transition:box-shadow .2s,transform .15s;cursor:pointer}
        .pcard:hover{box-shadow:0 6px 20px rgba(58,92,245,.12);transform:translateY(-2px)}
        .pcard.avail{border-color:#b8f0db;background:#e8faf4}
        .pcard.nope{border-color:#ffd0d6;background:#fff0f2}
        .pcard.pending{border-color:#d0d9ff;background:#eef2ff}
        .p-bar{height:3px;position:absolute;top:0;right:0;left:0;border-radius:99px}
        .p-icon{font-size:22px;margin:8px 0 6px}
        .p-name{font-size:15px;font-weight:700;color:#1a1f3a;margin-bottom:5px}
        .p-status{font-size:12px;font-weight:600}
        .s-ok{color:#00b87c} .s-no{color:#e84355} .s-chk{color:#3a5cf5}
        .help-box{background:#fffbf0;border:1px solid #ffe5b0;border-radius:10px;padding:13px 15px;font-size:13px;color:#7a5500}
        .help-box a{color:#e67e00}
        .footer{text-align:center;font-size:12px;color:#8892b0;margin-top:20px}
        .footer strong{color:#5a6282}
        @media(max-width:400px){.row{flex-wrap:wrap}.field[style*="flex:2"]{flex:1 1 120px!important}}
      `}</style>
    </>
  )
          }
