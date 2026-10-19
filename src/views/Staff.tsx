// @ts-nocheck -- logic ported verbatim from the design prototype (dynamic JS objects)
/* Generated from design/Staff.dc.html */
import React from 'react';
import SD from '../data/sofia';
import { css, pc } from '../lib/dc';
import SeatMap from './SeatMap';
import { Toast, EmptyState, submitOnEnter } from './ui';
const MY_TRIPS = ['TV-2026-10-16', 'TI-2026-10-17', 'TV-2026-10-17'];

export default class Staff extends React.Component<any, any> {
  [key: string]: any;

  state = { view: 'list', tripId: 'TI-2026-10-17', tab: 'list', sheet: null, scan: null, code: '', toast: '' };
  componentDidMount() { const go = () => { if (SD) { this._u = SD.subscribe(() => this.forceUpdate()); this.forceUpdate(); } else this._t = setTimeout(go, 40); }; go(); }
  componentWillUnmount() { this._u && this._u(); clearTimeout(this._t); }
  toast(m) { this.setState({ toast: m }); clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: '' }), 2200); }
  renderVals() {
    if (!SD) return { v: { list: true }, trip: {}, scan: {}, sheet: {} };
    const s = this.state, st = SD.get(), ck = st.checkins || {};
    const setCk = (id, val) => SD.set(x => { const c = Object.assign({}, x.checkins); if (val) c[id] = val; else delete c[id]; return { checkins: c }; });
    const counts = (t) => { const tk = SD.ticketsOf(t); if (t.past) return { exp: tk.length, b: Math.max(0, tk.length - 2), n: Math.min(2, tk.length), tk }; return { exp: tk.length, b: tk.filter(k => ck[k.id] === 'abordo').length, n: tk.filter(k => ck[k.id] === 'noshow').length, tk }; };
    const trips = MY_TRIPS.map(id => { const t = SD.getTrip(id); const c = counts(t); const w = SD.when(t, SD.stopsOf(t.line, t.dir)[0]); const isNext = id === 'TI-2026-10-17';
      return { route: t.route, car: t.car, when: w.dateLong + ' · ' + w.time + ' hs', note: w.note, hasNote: !!w.note, pct: c.exp ? Math.round(c.b / c.exp * 100) : 0, count: c.b + ' / ' + c.exp,
        state: t.past ? 'Finalizado' : isNext ? 'Próximo · check-in abierto' : 'Programado', sBg: t.past ? '#F1ECEF' : isNext ? '#E4007C' : '#FDE6F2', sFg: t.past ? '#6B6468' : isNext ? '#fff' : '#A3005A',
        bd: isNext ? '#E4007C' : '#EFE8EC', op: t.past ? .7 : 1, on: () => this.setState({ view: 'trip', tripId: id, tab: 'list' }) }; });
    const t = SD.getTrip(s.tripId); const c = counts(t);
    const order = SD.stopsOf(t.line, t.dir);
    const stCol = k => ck[k.id] === 'abordo' ? ['#DDF3E8', '#147A52', 'Abordó'] : ck[k.id] === 'noshow' ? ['#FBE3E3', '#B22A2A', 'No vino'] : ['#FDE6F2', '#A3005A', 'Esperado'];
    const groups = order.map(stp => { const px = c.tk.filter(k => k.stop === stp).sort((a, b) => a.seat - b.seat); const done = px.length && px.every(k => ck[k.id]); return { stop: t.dir === 'ida' ? stp : 'Baja en ' + stp, time: SD.hm(t.dir === 'ida' ? SD.stopMin(t, stp) : SD.arrMin(t, stp)) + ' hs', count: px.filter(k => ck[k.id] === 'abordo').length + '/' + px.length, hBg: done ? '#DDF3E8' : '#FAF8F9', hFg: done ? '#147A52' : '#1D1A1C',
      pax: px.map(k => { const [sBg, sFg, state] = stCol(k); return { seat: k.seat, name: k.nombre + ' ' + k.apellido, dni: SD.dni(k.dni), cls: k.cud ? 'CUD' : k.cls === 'semi' ? 'Semicama' : 'Cama', sBg, sFg, state, on: () => this.setState({ sheet: k.id }) }; }), empty: !px.length, emptyText: t.dir === 'ida' ? 'Nadie sube en esta parada.' : 'Nadie baja en esta parada.' }; });
    const tab = s.tab;
    const trip = { route: t.route, when: SD.when(t, order[0]).full, car: t.car, boarded: c.b, expected: c.exp, noshow: c.n, pct: c.exp ? Math.round(c.b / c.exp * 100) : 0,
      tabList: () => this.setState({ tab: 'list' }), tabMap: () => this.setState({ tab: 'map' }), showList: tab === 'list', showMap: tab === 'map',
      lBg: tab === 'list' ? '#fff' : 'transparent', lFg: tab === 'list' ? '#1D1A1C' : '#CFC6CA', mBg: tab === 'map' ? '#fff' : 'transparent', mFg: tab === 'map' ? '#1D1A1C' : '#CFC6CA',
      groups, noPax: !c.tk.length, seats: SD.seatsFor(t), checkins: ck, seatTap: x => x.t && this.setState({ sheet: x.t.id }),
      download: () => this.toast('Nómina descargada (' + c.exp + ' pasajeros)') };
    // sheet
    const sk = s.sheet ? c.tk.find(k => k.id === s.sheet) : null;
    const sheet = sk ? { open: true, seat: sk.seat, name: sk.nombre + ' ' + sk.apellido, dni: SD.dni(sk.dni), stop: sk.stop, cls: sk.cud ? 'CUD' : sk.cls === 'semi' ? 'Semicama' : 'Cama', code: sk.code, state: stCol(sk)[2], canUndo: !!ck[sk.id],
      close: () => this.setState({ sheet: null }), halt: e => e.stopPropagation(), board: () => { setCk(sk.id, 'abordo'); this.setState({ sheet: null }); }, noshow: () => { setCk(sk.id, 'noshow'); this.setState({ sheet: null }); }, undo: () => { setCk(sk.id, null); this.setState({ sheet: null }); } } : { open: false };
    // scan
    const run = code => { const r = SD.validate(code, t.id); this.setState({ scan: Object.assign({ code }, r) }); };
    const online = st.purchases.filter(p => p.tripId === t.id && p.status === 'activo' && !ck[p.id]);
    const firstFree = online[0] || c.tk.find(k => !ck[k.id]);
    const used = c.tk.find(k => ck[k.id] === 'abordo');
    const other = SD.ticketsOf(SD.getTrip('OI-2026-10-17'))[0];
    const r = s.scan;
    const map = { valido: ['#1F9D6B', 'check_circle', 'Boleto válido', 'Corresponde a este viaje'], usado: ['#E59A0B', 'history', 'Boleto ya usado', 'Este pasajero ya abordó'], otro: ['#D33A3A', 'wrong_location', 'Boleto de otro viaje', ''], invalido: ['#D33A3A', 'error', 'Boleto no válido', 'No existe o fue cancelado/reprogramado'] };
    const m = r ? map[r.res] : null;
    const scan = { has: !!r, none: !r, bg: m && m[0], icon: m && m[1], title: m && m[2], sub: r && r.res === 'otro' ? r.trip.route + ' · ' + SD.dshort(r.trip.date) + ' ' + SD.hm(r.trip.depMin) + ' hs' : m && m[3],
      hasPax: !!(r && r.t), seat: r && r.t ? r.t.seat : '', name: r && r.t ? r.t.nombre + ' ' + r.t.apellido : '', dni: r && r.t ? SD.dni(r.t.dni) : '', stop: r && r.t ? 'sube en ' + r.t.stop : '',
      isValid: !!(r && r.res === 'valido'), board: () => { setCk(r.t.id, 'abordo'); this.toast('Abordó: ' + r.t.nombre + ' · asiento ' + r.t.seat); this.setState({ scan: null }); }, again: () => this.setState({ scan: null, code: '' }),
      sims: [['Boleto válido' + (online[0] ? ' (compra online)' : ''), '#4ADE9B', () => firstFree && run(firstFree.id)], ['Boleto ya usado', '#F5B841', () => { if (used) run(used.id); else if (firstFree) { setCk(firstFree.id, 'abordo'); setTimeout(() => run(firstFree.id), 0); } }], ['Boleto de otro viaje', '#FF6B6B', () => other && run(other.id)]].map(([label, dot, on]) => ({ label, dot, on })),
      code: s.code, onCode: e => this.setState({ code: e.target.value }), check: () => { const q = s.code.trim().toUpperCase(); const k = c.tk.find(x => x.code === q) || SD.allTickets().find(x => x.code === q); run(k ? k.id : q); } };
    return { v: { list: s.view === 'list', trip: s.view === 'trip', scan: s.view === 'scan' }, trips, trip, sheet, scan, toList: () => this.setState({ view: 'list' }), toTrip: () => this.setState({ view: 'trip', scan: null }), toScan: () => this.setState({ view: 'scan', scan: null, code: '' }), toast: s.toast };
  }

  render() {
    const $: any = this.renderVals();
    return (<>

<div style={css("position:relative;width:100%;height:100%;background:#F7F4F5;font-family:'Barlow',system-ui,sans-serif;color:#1D1A1C;overflow:hidden")}>
<div style={css("position:absolute;inset:0;overflow-y:auto")}>

  {!!($.v?.list) && (<>
    <div style={css("background:#1D1A1C;color:#fff;padding:22px 18px 22px;display:flex;flex-direction:column;gap:14px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:center")}><div style={css("background:#fff;border-radius:12px;padding:4px 8px;display:flex")}><img src="/assets/logo.png" alt="Expreso Sofía" style={css("height:34px")} /></div><span style={css("width:40px;height:40px;border-radius:50%;background:#E4007C;display:flex;align-items:center;justify-content:center;font:800 14px 'Barlow',sans-serif")}>MF</span></div>
      <div><div style={css("font:600 13px 'Barlow',sans-serif;color:#CFC6CA")}>Hola, Micaela · Azafata</div><div style={css("font:800 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;margin-top:4px")}>Tus viajes de hoy</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#CFC6CA;margin-top:4px")}>Viernes 16 de octubre · 20:30 hs</div></div>
    </div>
    <div style={css("padding:16px;display:flex;flex-direction:column;gap:12px")}>
      {(Array.isArray($.trips) ? $.trips : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
        <button onClick={t?.on} style={css(`background:#fff;border:2px solid ${t?.bd ?? ''};border-radius:18px;padding:16px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:10px;opacity:${t?.op ?? ''}`)}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}><span style={css(`border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif;background:${t?.sBg ?? ''};color:${t?.sFg ?? ''}`)}>{t?.state}</span><span style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Coche N° {t?.car}</span></div>
          <div style={css("font:800 24px/1 'Barlow Condensed',sans-serif;text-transform:uppercase;color:#1D1A1C")}>{t?.route}</div>
          <div style={css("font:600 14px 'Barlow',sans-serif;color:#1D1A1C")}>{t?.when}</div>
          {!!(t?.hasNote) && (<><div style={css("font:600 12.5px 'Barlow',sans-serif;color:#4B2C82")}>{t?.note}</div></>)}
          <div style={css("display:flex;align-items:center;gap:8px")}><span style={css("flex:1;height:8px;border-radius:8px;background:#F1ECEF;overflow:hidden")}><span style={css(`display:block;height:100%;width:${t?.pct ?? ''}%;background:#1F9D6B`)}></span></span><span style={css("font:700 13px 'Barlow',sans-serif;color:#1D1A1C")}>{t?.count}</span></div>
        </button>
      </React.Fragment>))}
    </div>
  </>)}

  {!!($.v?.trip) && (<>
    <div style={css("background:#1D1A1C;color:#fff;padding:20px 16px 16px;display:flex;flex-direction:column;gap:12px;position:sticky;top:0;z-index:5")}>
      <div style={css("display:flex;justify-content:space-between;align-items:center")}>
        <button onClick={$.toList} style={css("width:40px;height:40px;border-radius:50%;border:none;background:#3A3437;color:#fff;cursor:pointer;font-family:'Material Symbols Rounded';font-size:22px")}>arrow_back</button>
        <button onClick={$.trip?.download} style={css("height:40px;padding:0 14px;border-radius:999px;border:none;background:#3A3437;color:#fff;cursor:pointer;font:700 13px 'Barlow',sans-serif;display:flex;align-items:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>download</span>Nómina</button>
      </div>
      <div><div style={css("font:800 26px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.trip?.route}</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#CFC6CA;margin-top:3px")}>{$.trip?.when} · Coche N° {$.trip?.car}</div></div>
      <div style={css("display:flex;align-items:flex-end;gap:12px")}>
        <div><div style={css("font:900 40px/1 'Barlow Condensed',sans-serif")}><span style={css("color:#4ADE9B")}>{$.trip?.boarded}</span><span style={css("color:#A69CA1;font-size:26px")}> / {$.trip?.expected}</span></div><div style={css("font:600 12px 'Barlow',sans-serif;color:#CFC6CA")}>abordaron · {$.trip?.noshow} no se presentaron</div></div>
        <div style={css("flex:1;height:10px;border-radius:10px;background:#3A3437;overflow:hidden;margin-bottom:8px")}><div style={css(`height:100%;width:${$.trip?.pct ?? ''}%;background:#4ADE9B`)}></div></div>
      </div>
      <div style={css("display:flex;background:#2C2729;border-radius:12px;padding:4px")}>
        <button onClick={$.trip?.tabList} style={css(`flex:1;height:40px;border:none;border-radius:9px;cursor:pointer;font:700 13px 'Barlow',sans-serif;background:${$.trip?.lBg ?? ''};color:${$.trip?.lFg ?? ''}`)}>Pasajeros por parada</button>
        <button onClick={$.trip?.tabMap} style={css(`flex:1;height:40px;border:none;border-radius:9px;cursor:pointer;font:700 13px 'Barlow',sans-serif;background:${$.trip?.mBg ?? ''};color:${$.trip?.mFg ?? ''}`)}>Mapa de asientos</button>
      </div>
    </div>
    {!!($.trip?.showList) && (<>
      <div style={css("padding:12px 12px 110px;display:flex;flex-direction:column;gap:12px")}>
        {!!($.trip?.noPax) && <EmptyState boxed icon="group_off" title="Este viaje todavía no tiene pasajeros" text="Cuando se vendan pasajes vas a verlos acá, agrupados por parada." />}
        {!($.trip?.noPax) && (Array.isArray($.trip?.groups) ? $.trip?.groups : []).map((g: any, $index: number) => (<React.Fragment key={$index}>
          <div style={css("background:#fff;border-radius:16px;border:1px solid #EFE8EC;overflow:hidden")}>
            <div style={css(`padding:10px 14px;background:${g?.hBg ?? ''};display:flex;justify-content:space-between;align-items:center`)}><span style={css(`font:800 16px 'Barlow',sans-serif;color:${g?.hFg ?? ''}`)}>{g?.stop} · {g?.time}</span><span style={css(`font:700 12.5px 'Barlow',sans-serif;color:${g?.hFg ?? ''}`)}>{g?.count}</span></div>
            {(Array.isArray(g?.pax) ? g?.pax : []).map((p: any, $index: number) => (<React.Fragment key={$index}>
              <button onClick={p?.on} style={css("width:100%;border:none;border-top:1px solid #F3EDF0;background:#fff;padding:10px 14px;display:flex;align-items:center;gap:12px;cursor:pointer;text-align:left;min-height:56px")}>
                <span style={css(`width:38px;height:38px;flex:none;border-radius:10px;background:${p?.sBg ?? ''};color:${p?.sFg ?? ''};display:flex;align-items:center;justify-content:center;font:800 15px 'Barlow',sans-serif`)}>{p?.seat}</span>
                <span style={css("flex:1;min-width:0;display:flex;flex-direction:column")}><span style={css("font:700 15px 'Barlow',sans-serif;color:#1D1A1C")}>{p?.name}</span><span style={css("font:500 12.5px 'Barlow',sans-serif;color:#6B6468")}>DNI {p?.dni} · {p?.cls}</span></span>
                <span style={css(`font:700 11.5px 'Barlow',sans-serif;color:${p?.sFg ?? ''}`)}>{p?.state}</span>
              </button>
            </React.Fragment>))}
            {!!(g?.empty) && <div style={css("border-top:1px solid #F3EDF0;padding:14px;display:flex;align-items:center;gap:10px;font:500 13.5px 'Barlow',sans-serif;color:#716A6E")}><span aria-hidden="true" style={css("font-family:'Material Symbols Rounded';font-size:20px")}>person_off</span>{g?.emptyText}</div>}
          </div>
        </React.Fragment>))}
      </div>
    </>)}
    {!!($.trip?.showMap) && (<>
      <div style={css("padding:14px 12px 110px;display:flex;justify-content:center")}>
        <div><SeatMap seats={$.trip?.seats} checkins={$.trip?.checkins} onToggle={$.trip?.seatTap} mode="staff" layout="tabs" size="44" /></div>
      </div>
    </>)}
    <div style={css("position:sticky;bottom:0;padding:12px 16px 20px;background:linear-gradient(180deg,rgba(247,244,245,0),#F7F4F5 40%)")}>
      <button onClick={$.toScan} style={css("width:100%;height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 18px 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 12px 26px -10px rgba(228,0,124,.7)")}><span style={css("font-family:'Material Symbols Rounded';font-size:24px")}>qr_code_scanner</span>Escanear boleto</button>
    </div>
  </>)}

  {!!($.v?.scan) && (<>
    <div style={css("min-height:100%;background:#0E0C0D;color:#fff;display:flex;flex-direction:column")}>
      <div style={css("padding:20px 16px 12px;display:flex;justify-content:space-between;align-items:center")}><button onClick={$.toTrip} style={css("width:40px;height:40px;border-radius:50%;border:none;background:#2C2729;color:#fff;cursor:pointer;font-family:'Material Symbols Rounded';font-size:22px")}>close</button><span style={css("font:700 14px 'Barlow',sans-serif")}>Escaneá el QR del boleto</span><span style={css("width:40px")}></span></div>
      <div style={css("margin:8px 24px;aspect-ratio:1;border-radius:24px;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 40%,#3a3437 0%,#151213 70%)")}>
        <div style={css("position:absolute;inset:18%;border-radius:18px;box-shadow:0 0 0 2000px rgba(0,0,0,.35)")}></div>
        <div style={css("position:absolute;left:18%;top:18%;width:40px;height:40px;border-left:4px solid #FF4FA0;border-top:4px solid #FF4FA0;border-radius:14px 0 0 0")}></div>
        <div style={css("position:absolute;right:18%;top:18%;width:40px;height:40px;border-right:4px solid #FF4FA0;border-top:4px solid #FF4FA0;border-radius:0 14px 0 0")}></div>
        <div style={css("position:absolute;left:18%;bottom:18%;width:40px;height:40px;border-left:4px solid #FF4FA0;border-bottom:4px solid #FF4FA0;border-radius:0 0 0 14px")}></div>
        <div style={css("position:absolute;right:18%;bottom:18%;width:40px;height:40px;border-right:4px solid #FF4FA0;border-bottom:4px solid #FF4FA0;border-radius:0 0 14px 0")}></div>
        <div style={css("position:absolute;left:20%;right:20%;height:2px;background:#FF4FA0;box-shadow:0 0 12px #FF4FA0;animation:sofscan 2.4s ease-in-out infinite")}></div>
        <div style={css("position:absolute;left:0;right:0;bottom:12px;text-align:center;font:500 11px ui-monospace,Menlo,monospace;color:#A69CA1")}>cámara simulada</div>
      </div>
      {!!($.scan?.has) && (<>
        <div style={css("margin:12px 16px;background:#fff;color:#1D1A1C;border-radius:20px;overflow:hidden")}>
          <div style={css(`background:${$.scan?.bg ?? ''};color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px`)}><span style={css("font-family:'Material Symbols Rounded';font-size:30px")}>{$.scan?.icon}</span><div><div style={css("font:800 22px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.scan?.title}</div><div style={css("font:600 12.5px 'Barlow',sans-serif;opacity:.9")}>{$.scan?.sub}</div></div></div>
          {!!($.scan?.hasPax) && (<>
            <div style={css("padding:14px 16px;display:flex;align-items:center;gap:12px")}><span style={css("width:52px;height:52px;border-radius:12px;background:#FDE6F2;color:#E4007C;display:flex;align-items:center;justify-content:center;font:900 24px 'Barlow Condensed',sans-serif")}>{$.scan?.seat}</span><div><div style={css("font:800 17px 'Barlow',sans-serif")}>{$.scan?.name}</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>DNI {$.scan?.dni} · {$.scan?.stop}</div></div></div>
          </>)}
          <div style={css("padding:0 16px 16px;display:flex;gap:8px")}>
            {!!($.scan?.isValid) && (<><button onClick={$.scan?.board} style={css("flex:1;height:48px;border:none;border-radius:999px;background:#1F9D6B;color:#fff;font:800 16px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Confirmar abordaje</button></>)}
            <button onClick={$.scan?.again} style={css("flex:1;height:48px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#1D1A1C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Escanear otro</button>
          </div>
        </div>
      </>)}
      {!!($.scan?.none) && (<>
        <div style={css("padding:14px 16px 24px;display:flex;flex-direction:column;gap:8px")}>
          <div style={css("font:600 11px 'Barlow',sans-serif;letter-spacing:.1em;color:#A69CA1")}>SIMULAR LECTURA (DEMO)</div>
          {(Array.isArray($.scan?.sims) ? $.scan?.sims : []).map((x: any, $index: number) => (<React.Fragment key={$index}><button onClick={x?.on} style={css("height:48px;border:1.5px solid #3A3437;border-radius:14px;background:#1D1A1C;color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:10px;padding:0 14px")}><span style={css(`width:10px;height:10px;border-radius:50%;background:${x?.dot ?? ''}`)}></span>{x?.label}</button></React.Fragment>))}
          <div onKeyDown={submitOnEnter($.scan?.check)} style={css("display:flex;gap:8px;margin-top:6px")}><input aria-label="Código del boleto" autoComplete="off" spellCheck={false} value={$.scan?.code} onChange={$.scan?.onCode} placeholder="O ingresá el código: SOF-XXXXX" style={css("flex:1;min-width:0;height:48px;border-radius:12px;border:1.5px solid #3A3437;background:#151213;color:#fff;padding:0 12px;font:600 15px 'Barlow',sans-serif;text-transform:uppercase")} /><button onClick={$.scan?.check} style={css("height:48px;padding:0 16px;border:none;border-radius:14px;background:#E4007C;color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Validar</button></div>
        </div>
      </>)}
    </div>
  </>)}
</div>

{!!($.sheet?.open) && (<>
  <div onClick={$.sheet?.close} style={css("position:absolute;inset:0;z-index:20;background:rgba(29,26,28,.45);display:flex;align-items:flex-end")}>
    <div onClick={$.sheet?.halt} style={css("width:100%;background:#fff;border-radius:24px 24px 0 0;padding:10px 16px 26px;display:flex;flex-direction:column;gap:12px")}>
      <div style={css("width:40px;height:4px;border-radius:4px;background:#E2D9DE;align-self:center")}></div>
      <div style={css("display:flex;align-items:center;gap:12px")}><span style={css("width:52px;height:52px;border-radius:12px;background:#FDE6F2;color:#E4007C;display:flex;align-items:center;justify-content:center;font:900 24px 'Barlow Condensed',sans-serif")}>{$.sheet?.seat}</span><div><div style={css("font:800 18px 'Barlow',sans-serif")}>{$.sheet?.name}</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>DNI {$.sheet?.dni} · sube en {$.sheet?.stop} · {$.sheet?.cls}</div></div></div>
      <div style={css("font:600 13px 'Barlow',sans-serif;color:#6B6468")}>Estado: <strong style={css("color:#1D1A1C")}>{$.sheet?.state}</strong> · {$.sheet?.code}</div>
      <div style={css("display:flex;gap:8px")}>
        <button onClick={$.sheet?.board} style={css("flex:1;height:56px;border:none;border-radius:16px;background:#1F9D6B;color:#fff;font:800 15px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>how_to_reg</span>Abordó</button>
        <button onClick={$.sheet?.noshow} style={css("flex:1;height:56px;border:none;border-radius:16px;background:#FBE3E3;color:#B22A2A;font:800 15px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>person_off</span>No se presentó</button>
      </div>
      {!!($.sheet?.canUndo) && (<><button onClick={$.sheet?.undo} style={css("height:48px;border:none;background:none;color:#6B6468;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Deshacer</button></>)}
    </div>
  </div>
</>)}
<Toast msg={$.toast} />
</div>
</>);
  }
}
