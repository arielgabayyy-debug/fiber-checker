import { useState, useRef, useEffect, useCallback } from 'react'
import Head from 'next/head'

const PROVIDERS = {
  bezeq: { label: 'Bezeq', color: '#3b82f6' },
  hot: { label: 'HOT', color: '#ef4444' },
  cellcom: { label: 'סלקום', color: '#a855f7' },
  yes: { label: 'yes', color: '#60a5fa' },
}

function useAC(apiPath) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(-1)
  const timer = useRef(null)

  const doFetch = useCallback((q, extra) => {
    if (!q || q.length < 1) { setItems([]); setOpen(false); return }
    const params = new URLSearchParams({ q, ...(extra || {}) })
    fetch(apiPath + '?' + params)
      .then(r => r.json())
      .then(data => {
        const list = data.cities || data.streets || []
        setItems(list)
        setOpen(list.length > 0)
        setIdx(-1)
      })
      .catch(() => { setItems([]); setOpen(false) })
  }, [apiPath])

  const onChange = (val, extra) => {
    setQuery(val)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => doFetch(val, extra), 200)
  }

  const onKeyDown = (e, onSelect) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); onSelect(items[idx]); setOpen(false) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return { query, setQuery, items, open, setOpen, idx, onChange, onKeyDown }
}

export default function Home() {
  const city = useAC('/api/cities')
  const street = useAC('/api/streets')
  const [num, setNum] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [cityErr, setCityErr] = useState(false)
  const [streetErr, setStreetErr] = useState(false)
  const resultsRef = useRef(null)
  const streetRef = useRef(null)

  useEffect(() => {
    street.setQuery('')
    street.setOpen(false)
  }, [city.query]) // eslint-disable-line

  const check = async () => {
    let hasErr = false
    if (!city.query.trim()) { setCityErr(true); hasErr = true; setTimeout(() => setCityErr(false), 1500) }
    if (!street.query.trim()) { setStreetErr(true); hasErr = true; setTimeout(() => setStreetErr(false), 1500) }
    if (hasErr) return
    setLoading(true); setResult(null); setError('')
    try {
      const p = new URLSearchParams({ city: city.query.trim(), street: street.query.trim(), num: num.trim() })
      const r = await fetch('/api/check?' + p)
      const data = await r.json()
      setResult(data)
      setTimeout(() => resultsRef.current && resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
    } catch (e) {
      setError('שגיאת חיבור — נסה שוב')
    } finally {
      setLoading(false)
    }
  }

  const selCity = (v) => { city.setQuery(v); city.setOpen(false); if (streetRef.current) streetRef.current.focus() }
  const selStreet = (v) => { street.setQuery(v); street.setOpen(false) }

  const S = {
    page: { minHeight: '100vh', position: 'relative' },
    blob1: { position: 'fixed', top: -200, right: -200, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,245,160,0.05) 0%,transparent 70%)', pointerEvents: 'none' },
    blob2: { position: 'fixed', bottom: -150, left: -150, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,142,247,0.06) 0%,transparent 70%)', pointerEvents: 'none' },
    wrap: { maxWidth: 600, margin: '0 auto', padding: '32px 16px 60px', position: 'relative', zIndex: 1 },
    badge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: 100, padding: '5px 14px', fontSize: 10, fontWeight: 700, color: '#00f5a0', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 },
    dot: { width: 6, height: 6, borderRadius: '50%', background: '#00f5a0', display: 'inline-block' },
    h1: { fontFamily: 'Orbitron,monospace', fontSize: 'clamp(24px,5vw,36px)', fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 10 },
    sub: { fontSize: 15, color: '#6b7a9e', fontWeight: 300 },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 },
    statNum: { fontFamily: 'Orbitron,monospace', fontSize: 20, fontWeight: 900, color: '#00f5a0', textShadow: '0 0 20px rgba(0,245,160,0.4)', marginBottom: 4 },
    statLbl: { fontSize: 11, color: '#6b7a9e', fontWeight: 600 },
    lbl: { fontSize: 10, fontWeight: 700, color: '#6b7a9e', letterSpacing: 2, textTransform: 'uppercase', display: 'block', marginBottom: 8 },
    addrRow: { display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10 },
    numInput: { textAlign: 'center' },
    quickRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
    callBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 13, textDecoration: 'none', background: 'rgba(255,59,107,.08)', border: '1px solid rgba(255,59,107,.22)', color: '#ff3b6b', fontSize: 14, fontWeight: 700 },
    waBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 13, textDecoration: 'none', background: 'rgba(37,211,102,.08)', border: '1px solid rgba(37,211,102,.22)', color: '#25d366', fontSize: 14, fontWeight: 700 },
    divRow: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
    divLine: { flex: 1, height: 1, background: '#1a2035' },
    divTxt: { fontSize: 11, color: '#2d3a55', fontWeight: 700, letterSpacing: 1 },
    pgrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 },
    note: { padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, border: '1px solid rgba(79,142,247,.15)', background: 'rgba(79,142,247,.04)' },
  }

  return (
    <>
      <Head><title>בדיקת זמינות סיבים | ניתוק וחיבור בקליק</title></Head>
      <div className="grid-bg" style={S.page}>
        <div style={S.blob1}/>
        <div style={S.blob2}/>
        <div style={S.wrap}>
          <div style={{ textAlign: 'center', paddingBottom: 36 }}>
            <div style={S.badge}><span className="animate-blink" style={S.dot}/>FIBER DETECTOR</div>
            <h1 style={S.h1}>יש <span className="text-glow-green" style={{ color: '#00f5a0' }}>סיב</span> בכתובת שלך?</h1>
            <p style={S.sub}>בדיקה אמיתית ומיידית אצל כל הספקים — חינם</p>
          </div>

          <div style={S.stats}>
            {[{n:'4',l:'ספקים נבדקים'},{n:'⚡',l:'תוצאה מיידית'},{n:'100%',l:'חינמי לחלוטין'}].map((s,i) => (
              <div key={i} className="fiber-card" style={{ padding: '16px 12px', textAlign: 'center' }}>
                <div style={S.statNum}>{s.n}</div>
                <div style={S.statLbl}>{s.l}</div>
              </div>
            ))}
          </div>

          <div className="fiber-card" style={{ padding: '28px 24px', marginBottom: 14, position: 'relative' }}>
            {loading && <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}><div className="scan-line"/></div>}

            <div style={{ marginBottom: 16 }}>
              <label style={S.lbl}>עיר</label>
              <div style={{ position: 'relative' }}>
                <input className={'fiber-input' + (cityErr ? ' error' : '')} placeholder="הקלד שם עיר..." value={city.query} autoComplete="off"
                  onChange={e => city.onChange(e.target.value)}
                  onKeyDown={e => city.onKeyDown(e, selCity)}
                  onBlur={() => setTimeout(() => city.setOpen(false), 150)}
                  onFocus={() => city.items.length > 0 && city.setOpen(true)} />
                {city.open && city.items.length > 0 && (
                  <div className="ac-dropdown">
                    {city.items.map((item, i) => (
                      <div key={item} className={'ac-item' + (i === city.idx ? ' active' : '')} onMouseDown={() => selCity(item)}>
                        <span style={{ fontSize: 12, opacity: .5 }}>📍</span>{item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={S.lbl}>כתובת</label>
              <div style={S.addrRow}>
                <div style={{ position: 'relative' }}>
                  <input ref={streetRef} className={'fiber-input' + (streetErr ? ' error' : '')} placeholder="שם הרחוב" value={street.query} autoComplete="off"
                    onChange={e => street.onChange(e.target.value, city.query ? { city: city.query } : {})}
                    onKeyDown={e => street.onKeyDown(e, selStreet)}
                    onBlur={() => setTimeout(() => street.setOpen(false), 150)}
                    onFocus={() => street.items.length > 0 && street.setOpen(true)} />
                  {street.open && street.items.length > 0 && (
                    <div className="ac-dropdown">
                      {street.items.map((item, i) => (
                        <div key={item} className={'ac-item' + (i === street.idx ? ' active' : '')} onMouseDown={() => selStreet(item)}>
                          <span style={{ fontSize: 12, opacity: .5 }}>🛣️</span>{item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input className="fiber-input" placeholder="מס׳" value={num} onChange={e => setNum(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} style={S.numInput} />
              </div>
            </div>

            <button className="btn-primary" onClick={check} disabled={loading}>
              {loading
                ? <><span className="animate-spin" style={{ width: 18, height: 18, border: '2.5px solid rgba(2,26,14,.3)', borderTopColor: '#021a0e', borderRadius: '50%', display: 'inline-block' }} />סורק...</>
                : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.2"/><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>סרוק זמינות סיבים</>
              }
            </button>
            {error && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,59,107,.08)', border: '1px solid rgba(255,59,107,.2)', color: '#ff3b6b', fontSize: 13, textAlign: 'center' }}>{error}</div>}
          </div>

          <div style={S.quickRow}>
            <a href="tel:0505037537" style={S.callBtn}>📞 050-503-7537</a>
            <a href="https://wa.me/9720505037537" target="_blank" rel="noopener noreferrer" style={S.waBtn}>💬 WhatsApp</a>
          </div>

          {result && (
            <div ref={resultsRef} className="animate-result">
              {result.bezeq_checked && (
                <div className="fiber-card" style={{ padding: '24px', marginBottom: 16, border: result.bezeq_available ? '1.5px solid rgba(0,245,160,.3)' : '1.5px solid rgba(255,59,107,.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0, background: result.bezeq_available ? 'rgba(0,245,160,.1)' : 'rgba(255,59,107,.1)', border: result.bezeq_available ? '2px solid rgba(0,245,160,.3)' : '2px solid rgba(255,59,107,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                      {result.bezeq_available ? '✅' : '❌'}
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: result.bezeq_available ? '#00f5a0' : '#ff3b6b', marginBottom: 4 }}>
                        {result.bezeq_available ? 'יש סיב אופטי!' : 'אין סיב בכתובת זו'}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7a9e' }}>
                        {result.city}{result.street && ', ' + result.street}{result.num && ' ' + result.num} &bull; נבדק ב-Bezeq
                      </div>
                    </div>
                  </div>
                  {!result.bezeq_available && (
                    <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,59,107,.06)', border: '1px solid rgba(255,59,107,.15)', fontSize: 13, color: '#6b7a9e', lineHeight: 1.6 }}>
                      💡 <strong style={{ color: '#e2e8f0' }}>לא נורא!</strong> בדוק אצל שאר הספקים למטה, או <a href="tel:0505037537" style={{ color: '#00f5a0', textDecoration: 'none' }}>צלצל אלינו</a>.
                    </div>
                  )}
                </div>
              )}
              <div className="fiber-card" style={{ padding: '20px 20px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7a9e', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  בדוק ישירות אצל הספק<div style={{ flex: 1, height: 1, background: '#1a2035' }} />
                </div>
                {result.providers && result.providers.map(p => (
                  <a key={p.provider} href={p.url} target="_blank" rel="noopener noreferrer" className="provider-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: PROVIDERS[p.provider] ? PROVIDERS[p.provider].color : '#fff' }}>
                        {PROVIDERS[p.provider] ? PROVIDERS[p.provider].label : p.provider}
                      </span>
                      <span style={{ fontSize: 12, color: '#6b7a9e' }}>
                        {p.provider === 'bezeq' && p.available !== null ? (p.available ? '✅ זמין' : '❌ לא זמין') : 'לחץ לבדיקה'}
                      </span>
                    </div>
                    <div className="arrow">→</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!result && (
            <>
              <div style={S.divRow}>
                <div style={S.divLine}/><span style={S.divTxt}>בחר ספק ספציפי</span><div style={S.divLine}/>
              </div>
              <div style={S.pgrid}>
                {[
                  { k: 'bezeq', url: 'https://www.bezeq.co.il/internetandphone/internet/bfiber_addresscheck/' },
                  { k: 'hot', url: 'https://www.hot.net.il/heb/internet/fiber-check/' },
                  { k: 'cellcom', url: 'https://cellcom.co.il/sale/jet/internet_ktovet/' },
                  { k: 'yes', url: 'https://www.yes.co.il/internet/fiber-address-check/' },
                ].map(({ k, url }) => (
                  <a key={k} href={url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 8px', background: '#0f1422', borderRadius: 14, border: '1px solid #1a2035', textDecoration: 'none' }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: PROVIDERS[k].color }}>{PROVIDERS[k].label}</span>
                  </a>
                ))}
              </div>
            </>
          )}

          <div className="fiber-card" style={S.note}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🎉</span>
            <p style={{ fontSize: 13, color: '#6b7a9e', lineHeight: 1.7, margin: 0 }}>
              מצאת חבילה? <strong style={{ color: '#93c5fd' }}>ניתוק וחיבור בקליק</strong> מטפלים בניתוק ובחיבור — חינם!{' '}
              <a href="tel:0505037537" style={{ color: '#00f5a0', textDecoration: 'none', fontWeight: 700 }}>📞 050-503-7537</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}