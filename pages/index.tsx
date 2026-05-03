import{useState,useRef,useEffect}from 'react'
import Head from 'next/head'
const CITIES=['נהריה','חיפה','תל אביב','ירושלים','באר שבע','ראשון לציון','אשדוד','אשקלון','רחובות','פתח תקווה','הרצליה','רמת גן','גבעתיים','בני ברק','כפר סבא','נתניה','אילת','רעננה','הוד השרון','לוד','רמלה','נצרת','עפולה','חולון','בת ים','טבריה','צפת','קריית שמונה','מעלות-תרשיחא','עכו','קריית גת','קריית ביאליק','קריית ים','קריית מוצקין','זכרון יעקב','יקנעם','דימונה','ערד','מצפה רמון','בית שמש','מודיעין']
export default function Home(){
  const[city,sc]=useState('');const[street,ss]=useState('');const[num,sn]=useState('')
  const[cO,sCO]=useState<string[]>([]);const[sO,sSO]=useState<string[]>([])
  const[showC,setShowC]=useState(false);const[showS,setShowS]=useState(false)
  const[loading,setL]=useState(false);const[result,setR]=useState<any>(null);const[err,setE]=useState('')
  const cT=useRef<any>(null);const sT=useRef<any>(null);const rRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{if(cT.current)clearTimeout(cT.current);if(city.length<2){sCO([]);setShowC(false);return}
    const loc=CITIES.filter(c=>c.includes(city)).slice(0,6);if(loc.length){sCO(loc);setShowC(true)}
    cT.current=setTimeout(async()=>{try{const r=await fetch('/api/cities?q='+encodeURIComponent(city));const d=await r.json();if(d.cities?.length){sCO(d.cities);setShowC(true)}}catch{}},300)},[city])
  useEffect(()=>{if(sT.current)clearTimeout(sT.current);if(street.length<2){sSO([]);setShowS(false);return}
    sT.current=setTimeout(async()=>{try{const r=await fetch('/api/streets?q='+encodeURIComponent(street)+'&city='+encodeURIComponent(city));const d=await r.json();if(d.streets?.length){sSO(d.streets);setShowS(true)}}catch{}},300)},[street,city])
  const check=async()=>{if(!city||!street){setE('אנא מלא עיר ורחוב');return};setE('');setL(true);setR(null)
    try{const r=await fetch('/api/check?city='+encodeURIComponent(city)+'&street='+encodeURIComponent(street)+'&num='+encodeURIComponent(num));const d=await r.json();setR(d);setTimeout(()=>rRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),100)}
    catch{setE('שגיאה, נסה שוב')}finally{setL(false)}}
  const bz=result?.providers?.find((p:any)=>p.id==='bezeq')
  return(<>
    <Head><title>בדיקת זמינות סיבים | ניתוק וחיבור בקליק</title><meta name="viewport" content="width=device-width,initial-scale=1"/><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet"/></Head>
    <div className="pg">
      <div className="hdr">
        <div className="badge">⚡ ניתוק וחיבור בקליק</div>
        <h1>בדוק זמינות <span>סיבים אופטיים</span><br/>בכתובת שלך</h1>
        <p>בדיקה מיידית — בזק, HOT, פרטנר, סלקום</p>
      </div>
      <div className="card">
        <div className="clbl">כתובת לבדיקה</div>
        <div className="row">
          <div className="fld" style={{flex:2}}>
            <label>עיר</label>
            <div className="iw">
              <input value={city} onChange={e=>{sc(e.target.value);ss('')}} onFocus={()=>cO.length&&setShowC(true)} onBlur={()=>setTimeout(()=>setShowC(false),150)} placeholder="לדוגמה: נהריה" className={err&&!city?'ierr':''}/>
              {showC&&cO.length>0&&<div className="dd">{cO.map(o=><div key={o} className="ddi" onMouseDown={()=>{sc(o);setShowC(false)}}>{o}</div>)}</div>}
            </div>
          </div>
          <div className="fld" style={{flex:3}}>
            <label>רחוב</label>
            <div className="iw">
              <input value={street} onChange={e=>ss(e.target.value)} onFocus={()=>sO.length&&setShowS(true)} onBlur={()=>setTimeout(()=>setShowS(false),150)} placeholder="לדוגמה: בק ליאו" className={err&&!street?'ierr':''}/>
              {showS&&sO.length>0&&<div className="dd">{sO.map(o=><div key={o} className="ddi" onMouseDown={()=>{ss(o);setShowS(false)}}>{o}</div>)}</div>}
            </div>
          </div>
          <div className="fld" style={{flex:1,minWidth:70}}>
            <label>מספר</label>
            <input value={num} onChange={e=>sn(e.target.value)} placeholder="64" inputMode="numeric" onKeyDown={e=>e.key==='Enter'&&check()}/>
          </div>
        </div>
        {err&&<div className="emsg">⚠️ {err}</div>}
        {loading&&<div className="sbar"><div className="sfill"/></div>}
        <button className={"btn"+(loading?' bload':'')} onClick={check} disabled={loading}>
          {loading?<><span className="spin"/>מבצע בדיקה...</>:<>🔍&nbsp;סרוק זמינות סיבים</>}
        </button>
        <div className="cstrip">
          <a href="https://wa.me/972505037537" className="bc bwa" target="_blank" rel="noopener">💬&nbsp;WhatsApp</a>
          <a href="tel:050-503-7537" className="bc bcall">📞&nbsp;050-503-7537</a>
        </div>
      </div>
      {result&&(<div className="card rcard" ref={rRef}>
        <div className="clbl">תוצאות בדיקה</div>
        <div className="radr">🏠 <strong>{[result.city,result.street,result.num].filter(Boolean).join(' ')}</strong></div>
        {bz?.checked&&bz?.available===true&&<div className="al aok"><span>✅</span><div><strong>מעולה! נמצאה זמינות סיבים</strong> אצל בזק!</div></div>}
        {bz?.checked&&bz?.available===false&&<div className="al awn"><span>⚠️</span><div><strong>בזק: אין סיב זמין.</strong> בדוק אצל שאר הספקים!</div></div>}
        {!bz?.checked&&<div className="al ainf"><span>ℹ️</span><div>לחץ על ספק לבדיקה ישירה באתר שלו עם הכתובת.</div></div>}
        <div className="pgrid">
          {result.providers?.map((p:any)=>(<a key={p.id} href={p.url} target="_blank" rel="noopener" className={"pc"+(p.available===true?' pok':p.available===false?' pno':' pchk')}>
            <div className="pbar"/><div className="pico">{p.logo}</div><div className="pnm">{p.name}</div>
            <div className={"pst"+(p.available===true?' stok':p.available===false?' stno':' stchk')}><span className="dot"/>{p.available===true?'זמין!':p.available===false?'לא זמין':'לחץ לבדיקה'}</div>
            <span className="plnk">לבדיקה באתר ↗</span>
          </a>))}
        </div>
        <div className="dvd"><span>לא מצאת מה שחיפשת?</span></div>
        <div className="hlp">💡&nbsp;<span><a href="https://wa.me/972505037537" style={{color:'inherit',fontWeight:600}}>צלצל אלינו</a> — נמצא לך את הספק הטוב ביותר בחינם!</span></div>
      </div>)}
      <div className="ftr">שירות חינמי מבית <strong>ניתוק וחיבור בקליק</strong> · 050-503-7537</div>
    </div>
    <style jsx global>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'Rubik',sans-serif;background:#eef2ff;color:#1a1f3a;direction:rtl}a{color:inherit;text-decoration:none}`}</style>
    <style jsx>{`
.pg{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:36px 16px 64px;gap:16px}
.hdr{text-align:center;max-width:540px;width:100%;margin-bottom:4px}
.badge{display:inline-flex;align-items:center;gap:6px;background:#e8ecff;color:#3a5cf5;font-weight:600;font-size:13px;padding:5px 14px;border-radius:999px;margin-bottom:14px}
h1{font-size:28px;font-weight:700;line-height:1.3;margin-bottom:8px}h1 span{color:#3a5cf5}
.hdr p{color:#5a6282;font-size:15px}
.card{background:#fff;border-radius:20px;box-shadow:0 4px 28px rgba(58,92,245,.09);border:1px solid #dde4f5;padding:28px;width:100%;max-width:580px}
.rcard{border-top:3px solid #3a5cf5}
.clbl{font-size:11px;font-weight:700;color:#8892b0;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px}
.row{display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.fld{display:flex;flex-direction:column;gap:5px}.fld label{font-size:12px;font-weight:500;color:#5a6282}
.iw{position:relative}
input{width:100%;padding:11px 13px;border:1.5px solid #dde4f5;border-radius:10px;font-family:'Rubik',sans-serif;font-size:15px;color:#1a1f3a;background:#f8faff;outline:none;transition:border-color .2s;text-align:right}
input::placeholder{color:#aab0cc}input:focus{border-color:#3a5cf5;box-shadow:0 0 0 3px rgba(58,92,245,.1);background:#fff}
.ierr{border-color:#e84355!important}
.dd{position:absolute;top:calc(100% + 4px);right:0;left:0;background:#fff;border:1.5px solid #dde4f5;border-radius:10px;box-shadow:0 8px 32px rgba(58,92,245,.12);z-index:200;max-height:220px;overflow-y:auto}
.ddi{padding:10px 14px;cursor:pointer;font-size:14px;border-bottom:1px solid #f0f3ff;transition:background .15s}.ddi:last-child{border-bottom:none}.ddi:hover{background:#eef2ff;color:#3a5cf5}
.emsg{color:#e84355;font-size:13px;margin-bottom:8px}
.sbar{height:3px;background:#eef2ff;border-radius:99px;overflow:hidden;margin-bottom:12px}
.sfill{height:100%;background:linear-gradient(90deg,transparent,#3a5cf5,transparent);background-size:200% 100%;animation:scan 1.4s ease-in-out infinite}
@keyframes scan{0%{background-position:200% 0}100%{background-position:-200% 0}}
.btn{width:100%;padding:14px;background:#3a5cf5;color:#fff;border:none;border-radius:12px;font-family:'Rubik',sans-serif;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 18px rgba(58,92,245,.28);transition:background .2s,transform .15s}
.btn:hover:not(:disabled){background:#2a4ae0;transform:translateY(-1px)}.btn:disabled{background:#b0c0f8;box-shadow:none;cursor:not-allowed}
.spin{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
.cstrip{display:flex;gap:10px;margin-top:14px}
.bc{flex:1;padding:11px 14px;border-radius:10px;font-family:'Rubik',sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;transition:opacity .2s,transform .15s}.bc:hover{opacity:.88;transform:translateY(-1px)}
.bwa{background:#25d366;color:#fff}.bcall{background:#eef2ff;color:#3a5cf5}
.radr{font-size:14px;color:#5a6282;margin-top:4px;margin-bottom:14px}
.al{display:flex;align-items:flex-start;gap:10px;padding:13px 15px;border-radius:10px;font-size:14px;margin-bottom:14px}
.aok{background:#e8faf4;border:1px solid #b8f0db;color:#007a52}.awn{background:#fff8ec;border:1px solid #ffe5b0;color:#7a5500}.ainf{background:#eef2ff;border:1px solid #d0d9ff;color:#3a5cf5}
.pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.pc{display:block;border:1.5px solid #dde4f5;border-radius:12px;padding:16px 12px;text-align:center;background:#f8faff;transition:box-shadow .2s,transform .15s;position:relative;overflow:hidden}.pc:hover{box-shadow:0 4px 20px rgba(58,92,245,.12);transform:translateY(-2px)}
.pbar{position:absolute;top:0;right:0;left:0;height:3px;border-radius:99px}
.pok .pbar{background:#00b87c}.pno .pbar{background:#e84355}.pchk .pbar{background:#f5a623}
.pok{border-color:#b8f0db;background:#e8faf4}.pno{border-color:#ffd0d6;background:#fff0f2}.pchk{border-color:#ffe5b0;background:#fff8ec}
.pico{font-size:22px;margin:4px 0 6px}.pnm{font-size:16px;font-weight:700;margin-bottom:5px}
.pst{font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:5px}
.stok{color:#00b87c}.stno{color:#e84355}.stchk{color:#f5a623}
.dot{width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block}
.plnk{font-size:11px;color:#3a5cf5;margin-top:6px;display:block;opacity:.75}
.dvd{text-align:center;color:#aab0cc;font-size:12px;margin:10px 0;position:relative}.dvd::before{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:#e8ecff}.dvd span{background:#fff;padding:0 10px;position:relative}
.hlp{background:#fffbf0;border:1px solid #ffe5b0;border-radius:10px;padding:13px 15px;font-size:13px;color:#7a5500;display:flex;align-items:center;gap:8px}
.ftr{text-align:center;font-size:12px;color:#aab0cc;margin-top:8px}.ftr strong{color:#8892b0}
@media(max-width:480px){h1{font-size:22px}.row{flex-direction:column}.pgrid{grid-template-columns:1fr 1fr}}
    `}</style>
  </>)}
