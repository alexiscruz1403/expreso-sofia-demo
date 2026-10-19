// @ts-nocheck -- logic ported verbatim from the design prototype (dynamic JS objects)
/* Generated from design/Publico.dc.html */
import React from 'react';
import SD from '../data/sofia';
import { css, pc } from '../lib/dc';
import SeatMap from './SeatMap';
import Boleto from './Boleto';
import { Toast, EmptyState, submitOnEnter, confirmAction } from './ui';
const HOLD = ['datos', 'resumen', 'mp', 'rechazado'];
const BAGGAGE = 'Podés llevar una valija y/o bolso en bodega + una mochila dentro del coche.';
const RT_RULES = 'El pasaje ida y vuelta no admite devolución, no permite cambios ni reutilización y tiene una validez de 14 días corridos desde la emisión.';
const POLICY_ROWS = [['Más de 48 h antes de la salida', '10%'], ['Entre 24 y 48 h antes', '20%'], ['Dentro de las 24 h previas', '30%']];
const FAQ = [
  ['¿Cuánto equipaje puedo llevar?', BAGGAGE + ' Si viajás con más bultos, avisanos en la sucursal antes de subir.'],
  ['¿Puedo cancelar o cambiar mi pasaje?', 'Sí. La retención depende de la anticipación: más de 48 h antes de la salida, 10%; entre 24 y 48 h, 20%; dentro de las 24 h previas, 30%. Los cambios se pueden pedir hasta 3 h antes de la salida. Los pasajes pagados con tarjeta de crédito no admiten devolución bajo ningún término.'],
  ['¿Qué condiciones tiene el pasaje ida y vuelta?', RT_RULES],
  ['¿Pueden viajar menores solos?', 'Los menores de 18 años que viajan sin sus padres necesitan la autorización de viaje correspondiente y su DNI. Consultá en sucursal antes de comprar.'],
  ['¿Puedo viajar con mi mascota?', 'Solo se permiten perros guía o de asistencia. Para otras mascotas consultanos por WhatsApp.'],
  ['¿Cómo saco un pasaje con CUD?', 'Marcá la opción CUD en los datos del pasajero y presentá el certificado original y tu DNI en cualquier sucursal antes de viajar. El pasaje del titular no tiene costo.'],
  ['¿Qué pasa si pierdo el colectivo?', 'Escribinos lo antes posible por WhatsApp. Según disponibilidad podemos reprogramarte para el próximo viaje con el cargo de reprogramación.']
];

export default class Publico extends React.Component<any, any> {
  [key: string]: any;

  state = { screen: 'home', q: { origin: 'Tartagal', dest: 'Salta', date: '2026-10-17', rt: false, ret: '2026-10-19', pax: 1 }, leg: 'a', stop: null, sel: { a: null, b: null }, seats: { a: [], b: [] }, loading: false, pax: [], contact: { email: '', wa: '' }, errors: {}, tried: false, holdUntil: 0, now: Date.now(), method: 'debito', net: 'Rapipago', paying: false, lastCode: null, confTab: 'boleto', lk: { code: '', id: '', loading: false, error: '' }, lkRes: null, curId: null, rp: { date: null, tripId: null, seat: null, step: 1 }, rpDone: null, cxAck: false, cxDone: null, faq: -1, branch: 0, menu: false, toast: '' };
  scrollRef = React.createRef();
  lineasRef = React.createRef();
  componentDidMount() {
    const go = () => { if (SD) { this._u = SD.subscribe(() => this.forceUpdate()); this.forceUpdate(); } else this._t = setTimeout(go, 40); };
    go();
    this._i = setInterval(() => {
      const s = this.state;
      if (s.holdUntil && HOLD.includes(s.screen)) {
        if (Date.now() >= s.holdUntil) { this.setState({ holdUntil: 0, screen: 'vencido', paying: false }); this.top(); }
        else this.setState({ now: Date.now() });
      }
    }, 1000);
  }
  componentWillUnmount() { this._u && this._u(); clearTimeout(this._t); clearInterval(this._i); }
  top() { const el = this.scrollRef.current; if (el) el.scrollTop = 0; }
  go(screen, extra) { this.setState(Object.assign({ screen, menu: false }, extra || {})); setTimeout(() => this.top(), 0); }
  toast(m) { this.setState({ toast: m }); clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: '' }), 2600); }
  load() { this.setState({ loading: true }); clearTimeout(this._lt); this._lt = setTimeout(() => this.setState({ loading: false }), 650); }
  setQ(p) { this.setState(s => ({ q: Object.assign({}, s.q, p) })); }
  renderVals() {
    if (!SD) return { s: { home: true }, isMob: true, search: {}, urgency: {}, nav: {}, act: {} };
    const s = this.state, st = SD.get(), q = s.q, money = SD.money;
    const isDesk = this.props.device === 'desktop';
    const T = SD.LINES.T, O = SD.LINES.O;
    const allStops = Array.from(new Set(T.stops.map(x => x[0]).concat(O.stops.map(x => x[0]))));
    const fromSalta = q.origin === 'Salta';
    const baseStop = fromSalta ? q.dest : q.origin;
    const stop = s.stop || baseStop;
    const legDir = { a: fromSalta ? 'vuelta' : 'ida', b: fromSalta ? 'ida' : 'vuelta' };
    const legDate = { a: q.date, b: q.ret };
    const legTrips = (leg, date, dir) => SD.tripsOn(date).filter(t => t.dir === (dir || legDir[leg]) && SD.stopsOf(t.line, t.dir).includes(stop));
    const sc = st.scenario || {};
    const nav = {
      home: () => this.go('home'), mis: () => this.go('mis'), contacto: () => this.go('contacto'),
      lineas: () => { this.go('home'); setTimeout(() => { const el = this.lineasRef.current, sc = this.scrollRef.current; if (el && sc) sc.scrollTop = el.offsetTop - 70; }, 60); },
      menu: () => this.setState(x => ({ menu: !x.menu })), login: () => SD.set({ role: 'login' }),
      searchTop: () => this.go('home'),
      backResults: () => this.go('results'), backDatos: () => this.go('datos'), backResumen: () => this.go('resumen'), detalle: () => this.go('detalle')
    };
    const act = {
      wa: () => this.toast('Se abriría WhatsApp con el 3878-804506'), ig: () => this.toast('Se abriría Instagram de Expreso Sofía'), fb: () => this.toast('Se abriría Facebook de Expreso Sofía'),
      pdf: () => this.toast('Descargando boleto en PDF…'), mail: () => this.toast('Boleto enviado a ' + (s.contact.email || 'tu email')), share: () => this.toast('Se abriría WhatsApp para compartir el boleto')
    };
    // urgency
    const tT = SD.getTrip(SD.TONIGHT_T), aT = SD.avail(tT), aO = SD.avail(SD.getTrip(SD.TONIGHT_O));
    const urgency = {
      show: s.screen === 'home',
      text: aT.total > 0 ? 'Quedan ' + aT.total + ' lugares para esta madrugada, Línea Tartagal · Sáb 17, 00:00 hs' : 'Línea Tartagal agotada para esta madrugada · Quedan ' + aO.total + ' lugares en Línea Orán',
      on: () => { this.setState({ q: Object.assign({}, q, { origin: aT.total > 0 ? 'Tartagal' : 'Orán', dest: 'Salta', date: '2026-10-17', rt: false }), stop: null, leg: 'a', sel: { a: null, b: null }, seats: { a: [], b: [] } }); this.go('results'); this.load(); }
    };
    // search
    const origins = ['Salta'].concat(allStops);
    const dests = fromSalta ? allStops : ['Salta'];
    const on = '#fff', off = 'transparent';
    const qDow = SD.parse(q.date).getDay();
    const w0 = SD.when(SD.mkTrip(T.stops.find(x => x[0] === baseStop) ? 'T' : 'O', legDir.a, q.date), baseStop);
    const rtMax = SD.addDays(SD.TODAY, SD.RT_VALID_DAYS);
    const search = {
      origins, dests, origin: q.origin, dest: q.dest, date: q.date, ret: q.ret, rt: q.rt, pax: q.pax, min: SD.TODAY, max: q.rt ? rtMax : SD.addDays(SD.TODAY, 60), retMax: rtMax, rtRules: RT_RULES,
      idaBg: q.rt ? off : on, idaFg: q.rt ? '#6B6468' : '#E4007C', rtBg: q.rt ? on : off, rtFg: q.rt ? '#E4007C' : '#6B6468',
      setIda: () => this.setQ({ rt: false }), setRt: () => { const d = q.date > rtMax ? SD.TODAY : q.date; const r = q.ret < d ? SD.addDays(d, 2) : q.ret; this.setQ({ rt: true, date: d, ret: r > rtMax ? rtMax : r }); },
      onOrigin: e => { const o = e.target.value; this.setQ(o === 'Salta' ? { origin: o, dest: q.origin === 'Salta' ? 'Tartagal' : q.origin } : { origin: o, dest: 'Salta' }); this.setState({ stop: null }); },
      onDest: e => { this.setQ({ dest: e.target.value }); this.setState({ stop: null }); },
      swap: () => { this.setQ({ origin: q.dest, dest: q.origin }); this.setState({ stop: null }); },
      onDate: e => { const d = e.target.value || q.date; const r = q.ret < d ? SD.addDays(d, 2) : q.ret; this.setQ({ date: d, ret: q.rt && r > rtMax ? rtMax : r }); },
      onRet: e => this.setQ({ ret: e.target.value || q.ret }),
      paxMinus: () => this.setQ({ pax: Math.max(1, q.pax - 1) }), paxPlus: () => this.setQ({ pax: Math.min(5, q.pax + 1) }),
      hint: legDir.a === 'ida' ? (qDow === 0 ? 'Los domingos no hay salidas regulares hacia Salta.' : 'Desde ' + baseStop + ': ' + w0.full + '.') : 'Desde Salta salís a la tarde: ' + (baseStop && T.vStops[baseStop] && !O.vStops[baseStop] ? '16:30' : O.vStops[baseStop] && !T.vStops[baseStop] ? '18:00' : '16:30 o 18:00') + ' hs.',
      submit: () => { this.setState({ leg: 'a', stop: null, sel: { a: null, b: null }, seats: { a: [], b: [] }, holdUntil: 0 }); this.go('results'); this.load(); }
    };
    const lineCards = [T, O].map(l => ({ name: l.name, dep: SD.hm(l.stops[0][1]), back: 'Salta → ' + l.short + ' ' + SD.hm(l.vDep) + ' hs', from: money(st.fares[l.id].semi.ida),
      stops: l.stops.map((x, i) => ({ name: x[0], time: SD.hm(x[1]), lineTop: i === 0 ? 'transparent' : '#F3C4DD', lineBot: '#F3C4DD' })) }));
    const services = [['wifi', 'Wi-Fi satelital Starlink'], ['free_breakfast', 'Desayuno y merienda'], ['ac_unit', 'Aire acondicionado y calefacción'], ['usb', 'Cargador USB en cada butaca'], ['support_agent', 'Atención personalizada por azafata']].map(([icon, label]) => ({ icon, label }));
    // results
    const leg = s.leg;
    const dateForLeg = legDate[leg];
    const days = (leg, cur, onPick, minDate, dir, stp) => Array.from({ length: 14 }, (_, i) => {
      const d = SD.addDays(SD.TODAY, i); const ts = (stp ? SD.tripsOn(d).filter(t => t.dir === dir && SD.stopsOf(t.line, t.dir).includes(stp)) : legTrips(leg, d, dir)).filter(t => !t.past);
      const dis = ts.length === 0 || (minDate && d < minDate) || (q.rt && !stp && d > rtMax); const special = ts.some(t => t.special); const isSel = d === cur;
      const dt = SD.parse(d);
      return { dow: SD.DOWS[dt.getDay()], day: dt.getDate(), tag: dis ? (i === 0 && legTrips(leg, d, dir).length && !stp ? 'Ya salió' : 'Sin servicio') : special ? 'Especial' : (i === 0 ? 'Hoy' : ''), disabled: !!dis, op: dis ? .45 : 1, cursor: dis ? 'not-allowed' : 'pointer',
        bg: isSel ? '#E4007C' : '#fff', fg: isSel ? '#fff' : '#1D1A1C', bd: isSel ? '#E4007C' : special ? '#1D1A1C' : '#EDE5E9', tagFg: isSel ? '#fff' : special ? '#1D1A1C' : '#716A6E', on: () => !dis && onPick(d) };
    });
    const linesForStop = [T, O].filter(l => l.stops.some(x => x[0] === baseStop));
    const stopChoices = Array.from(new Set([].concat(...linesForStop.map(l => l.stops.map(x => x[0])))));
    const cardOf = (t, k) => {
      const a = SD.avail(t), w = SD.when(t, stop), soldOut = a.total === 0;
      const f = st.fares[t.line]; const blocked = t.cancelled || t.past || soldOut || t.blocked;
      const pill = (n, lbl) => n > 0 ? [lbl + ': ' + n + (n === 1 ? ' libre' : ' libres'), n <= 3 ? '#FDE6F2' : '#F1F7F3', n <= 3 ? '#A3005A' : '#147A52'] : [lbl + ': agotado', '#F1ECEF', '#716A6E'];
      const [semi, semiBg, semiFg] = pill(a.semi, 'Semicama'), [cama, camaBg, camaFg] = pill(a.cama, 'Cama');
      return { line: t.lineName, special: t.special, few: !blocked && a.total <= 8, fewLabel: '¡Quedan ' + a.total + '!', car: 'Coche N° ' + t.car,
        from: t.dir === 'ida' ? stop : 'Salta', to: t.dir === 'ida' ? 'Salta' : stop, date: w.date, time: w.time, arr: w.arr, hasNote: !!w.note, when: w.full,
        semi, semiBg, semiFg, cama, camaBg, camaFg, priceLabel: q.rt ? 'Ida y vuelta desde' : 'Desde', price: q.rt ? money(f.semi.iv) : money(f.semi.ida),
        ok: !blocked, blocked, op: blocked ? .7 : 1, status: t.cancelled ? 'Cancelado' : t.blocked ? 'No disponible' : t.past ? 'Ya salió' : 'Agotado',
        onPick: () => { this.setState(x => ({ sel: Object.assign({}, x.sel, { [k]: t.id }), seats: Object.assign({}, x.seats, { [k]: [] }) })); this.go('seats'); } };
    };
    const tripsNow = legTrips(leg, dateForLeg);
    const res = {
      rt: q.rt, stepLabel: q.rt ? (leg === 'a' ? 'PASO 1 DE 2 · IDA' : 'PASO 2 DE 2 · VUELTA') : 'SOLO IDA',
      title: leg === 'a' ? q.origin + ' → ' + q.dest : q.dest + ' → ' + q.origin,
      sub: SD.dlong(dateForLeg) + ' · ' + q.pax + (q.pax > 1 ? ' pasajeros' : ' pasajero'),
      s1: 'Ida' + (s.sel.a ? ' · ' + SD.dshort(SD.getTrip(s.sel.a).date) : ''), s2: 'Vuelta' + (s.sel.b ? ' · ' + SD.dshort(SD.getTrip(s.sel.b).date) : ''),
      s1bg: leg === 'a' ? '#FDE6F2' : '#fff', s1fg: '#1D1A1C', s1dot: s.sel.a && leg === 'b' ? '#1F9D6B' : '#E4007C',
      s2bg: leg === 'b' ? '#FDE6F2' : '#fff', s2fg: leg === 'b' ? '#1D1A1C' : '#716A6E', s2dot: leg === 'b' ? '#E4007C' : '#CFC6CA',
      days: days(leg, dateForLeg, d => { this.setQ(leg === 'a' ? { date: d, ret: q.ret < d ? SD.addDays(d, 2) : q.ret } : { ret: d }); this.load(); }, leg === 'b' ? q.date : null),
      stopLabel: legDir[leg] === 'ida' ? 'Subís en (actualiza el horario)' : 'Bajás en',
      stops: stopChoices.map(n => ({ name: n, bg: n === stop ? '#1D1A1C' : '#fff', fg: n === stop ? '#fff' : '#1D1A1C', bd: n === stop ? '#1D1A1C' : '#E2D9DE', on: () => { this.setQ(fromSalta ? { dest: n } : { origin: n }); this.setState({ stop: null }); } })),
      cards: tripsNow.map(t => cardOf(t, leg)), showList: !s.loading && tripsNow.length > 0, empty: !s.loading && tripsNow.length === 0,
      next: () => { for (let i = 1; i < 10; i++) { const d = SD.addDays(dateForLeg, i); if (legTrips(leg, d).length) { this.setQ(leg === 'a' ? { date: d, ret: q.ret < d ? SD.addDays(d, 2) : q.ret } : { ret: d }); this.load(); break; } } }
    };
    // seats
    const curTripId = s.sel[leg];
    const curTrip = curTripId ? SD.getTrip(curTripId) : null;
    const chosen = s.seats[leg] || [];
    const fareOf = (tr, cls) => st.fares[tr.line][cls].ida;
    const seat = { layout: isDesk ? 'stacked' : 'tabs' };
    if (curTrip) {
      const w = SD.when(curTrip, stop);
      Object.assign(seat, {
        step: (q.rt ? (leg === 'a' ? 'IDA · ' : 'VUELTA · ') : '') + curTrip.lineName.toUpperCase() + ' · COCHE N° ' + curTrip.car,
        need: q.pax > 1 ? q.pax + ' asientos' : 'tu asiento', trip: (curTrip.dir === 'ida' ? stop + ' → Salta' : 'Salta → ' + stop) + ' · ' + w.full,
        seats: SD.seatsFor(curTrip), selected: chosen.map(x => x.n), pSemi: money(fareOf(curTrip, 'semi')), pCama: money(fareOf(curTrip, 'cama')),
        toggle: (x) => { const cur = this.state.seats[leg] || []; let nx; if (cur.find(c => c.n === x.n)) nx = cur.filter(c => c.n !== x.n); else { nx = cur.concat([{ n: x.n, cls: x.cls, cud: x.cud }]); if (nx.length > q.pax) nx = nx.slice(1); } this.setState(z => ({ seats: Object.assign({}, z.seats, { [leg]: nx }) })); },
        list: chosen.map(x => ({ n: x.n, cls: x.cud ? 'Cama · reservado CUD' : x.cls === 'semi' ? 'Semicama' : 'Cama', floor: x.n <= 48 ? 'Planta alta' : 'Planta baja', price: money(fareOf(curTrip, x.cls)) })),
        none: chosen.length === 0, cudNote: chosen.some(x => x.cud), count: chosen.length + ' de ' + q.pax + (q.pax > 1 ? ' asientos elegidos' : ' asiento elegido'),
        total: money(chosen.reduce((a, x) => a + fareOf(curTrip, x.cls), 0)), notReady: chosen.length !== q.pax, btnBg: chosen.length === q.pax ? 'linear-gradient(135deg,#C2006A,#E4007C)' : '#D9D1D5',
        nextLabel: q.rt && leg === 'a' ? 'Elegir vuelta' : 'Continuar',
        next: () => {
          if (chosen.length !== q.pax) return;
          if (q.rt && leg === 'a') { this.setState({ leg: 'b' }); this.go('results'); this.load(); return; }
          const pax = Array.from({ length: q.pax }, (_, k) => this.state.pax[k] || { nombre: '', apellido: '', dni: '', nac: '', cud: false, stop });
          const sa = this.state.seats.a || [];
          pax.forEach((p, k) => { if (sa[k] && sa[k].cud) p.cud = true; });
          this.go('datos', { pax, tried: false, now: Date.now(), holdUntil: this.state.holdUntil || Date.now() + (sc.expire ? 8000 : 600000) });
        }
      });
    }
    // prices
    const legs = q.rt ? ['a', 'b'] : ['a'];
    const legTrip = k => s.sel[k] ? SD.getTrip(s.sel[k]) : null;
    const priceFor = (k, i) => {
      const p = s.pax[i] || {}; if (p.cud) return 0;
      const tr = legTrip(k), x = (s.seats[k] || [])[i]; if (!tr || !x) return 0;
      if (!q.rt) return fareOf(tr, x.cls);
      const ta = legTrip('a'), tb = legTrip('b'), xa = s.seats.a[i], xb = s.seats.b[i];
      if (!ta || !tb || !xa || !xb) return fareOf(tr, x.cls);
      return Math.round((st.fares[ta.line][xa.cls].iv + st.fares[tb.line][xb.cls].iv) / 4) * (1) * 1 + (k === 'a' ? 0 : 0) || 0;
    };
    const legPrice = (k, i) => { if (!q.rt) return priceFor(k, i); const p = s.pax[i] || {}; if (p.cud) return 0; const ta = legTrip('a'), tb = legTrip('b'), xa = s.seats.a[i], xb = s.seats.b[i]; if (!ta || !tb || !xa || !xb) return 0; const tot = (st.fares[ta.line][xa.cls].iv + st.fares[tb.line][xb.cls].iv) / 2; return k === 'a' ? Math.round(tot / 2) : tot - Math.round(tot / 2); };
    let total = 0, idaSum = 0;
    for (let i = 0; i < q.pax; i++) legs.forEach(k => { total += legPrice(k, i); const tr = legTrip(k), x = (s.seats[k] || [])[i]; if (tr && x && !(s.pax[i] || {}).cud) idaSum += fareOf(tr, x.cls); });
    const saving = q.rt ? idaSum - total : 0;
    // hold
    const rem = Math.max(0, s.holdUntil - s.now);
    const mm = String(Math.floor(rem / 60000)).padStart(2, '0'), ss = String(Math.floor(rem / 1000) % 60).padStart(2, '0');
    const hold = { show: !!s.holdUntil && HOLD.includes(s.screen) && s.screen !== 'mp', label: q.pax > 1 ? 'Tus asientos están reservados por' : 'Tu asiento está reservado por', time: mm + ':' + ss, bg: rem < 60000 ? '#D33A3A' : '#1D1A1C' };
    // datos
    const lineA = legTrip('a');
    const boardLine = (legTrip(legDir.a === 'ida' ? 'a' : 'b') || lineA);
    const stopOpts = boardLine ? SD.stopsOf(boardLine.line, 'ida').map(n => ({ v: n, l: n + ' · ' + SD.hm(SD.stopMin(SD.mkTrip(boardLine.line, 'ida', boardLine.date), n)) + ' hs' })) : [];
    const err = s.tried ? s.errors : {};
    const setP = (i, k, v) => this.setState(x => { const pax = x.pax.slice(); pax[i] = Object.assign({}, pax[i], { [k]: v }); return { pax }; });
    const hasIda = legs.some(k => legDir[k] === 'ida');
    const paxForms = s.pax.map((p, i) => {
      const fld = (key, label, type, ph, mode) => ({ key, label, type, ph, mode: mode || 'text', value: p[key] || '', isInput: true, isSelect: false, err: err[i + '.' + key] || '', bd: err[i + '.' + key] ? '#D33A3A' : '#E2D9DE', on: e => setP(i, key, e.target.value) });
      const seatsTxt = legs.map(k => ((s.seats[k] || [])[i] ? (q.rt ? (k === 'a' ? 'Ida ' : 'Vuelta ') : 'Asiento ') + (s.seats[k][i].n) : '')).filter(Boolean).join(' · ');
      return { num: i + 1, seats: seatsTxt,
        fields: [fld('nombre', 'Nombre', 'text', 'Como figura en el DNI'), fld('apellido', 'Apellido', 'text', ''), fld('dni', 'DNI', 'text', 'Sin puntos', 'numeric'), fld('nac', 'Fecha de nacimiento', 'date', '')],
        toggleCud: () => setP(i, 'cud', !p.cud), cudBd: p.cud ? '#2E6BD8' : '#E2D9DE', cudBg: p.cud ? '#EAF1FD' : '#fff', cudBox: p.cud ? '#2E6BD8' : '#fff', cudMark: p.cud ? 'check' : '' };
    });
    const contact = { email: s.contact.email, wa: s.contact.wa, emailErr: err.email || '', waErr: err.wa || '', emailBd: err.email ? '#D33A3A' : '#E2D9DE', waBd: err.wa ? '#D33A3A' : '#E2D9DE',
      onEmail: e => this.setState({ contact: Object.assign({}, s.contact, { email: e.target.value }) }), onWa: e => this.setState({ contact: Object.assign({}, s.contact, { wa: e.target.value }) }) };
    const validate = () => {
      const e = {};
      s.pax.forEach((p, i) => { if (!p.nombre.trim()) e[i + '.nombre'] = 'Completá el nombre'; if (!p.apellido.trim()) e[i + '.apellido'] = 'Completá el apellido'; if (!/^\d{7,8}$/.test(String(p.dni).replace(/\D/g, ''))) e[i + '.dni'] = 'Ingresá un DNI válido (7 u 8 números)'; if (!p.nac) e[i + '.nac'] = 'Indicá la fecha de nacimiento'; });
      if (!/^\S+@\S+\.\S+$/.test(s.contact.email)) e.email = 'Ingresá un email válido'; if (String(s.contact.wa).replace(/\D/g, '').length < 8) e.wa = 'Ingresá un número de WhatsApp';
      return e;
    };
    const sample = [['Lucía', 'Fernández', '32456789', '1987-03-14'], ['Matías', 'Choque', '38112450', '1994-08-02'], ['Rosa', 'Alancay', '27901334', '1979-11-20'], ['Franco', 'Villagra', '41220876', '1998-05-09'], ['Abril', 'Tolaba', '45330112', '2004-01-30']];
    // summary
    const sumLegs = legs.filter(k => legTrip(k)).map(k => { const tr = legTrip(k); const w = SD.when(tr, stop);
      return { kind: q.rt ? (k === 'a' ? 'Ida' : 'Vuelta') : 'Solo ida', line: tr.lineName, car: 'Coche N° ' + tr.car, route: tr.dir === 'ida' ? stop + ' → Salta' : 'Salta → ' + stop, when: w.full,
        rows: (s.seats[k] || []).map((x, i) => ({ name: ((s.pax[i] || {}).nombre || 'Pasajero ' + (i + 1)), seat: x.n, cls: '(' + (x.cls === 'semi' ? 'Semicama' : 'Cama') + ')', price: (s.pax[i] || {}).cud ? 'CUD $0' : money(legPrice(k, i)) })) }; });
    const tripSum = legs.filter(k => legTrip(k)).map(k => { const tr = legTrip(k); const w = SD.when(tr, stop); const ida = tr.dir === 'ida';
      return { kind: q.rt ? (k === 'a' ? 'Ida' : 'Vuelta') : 'Solo ida', line: tr.lineName + ' · Coche N° ' + tr.car, from: ida ? stop : 'Salta (Terminal)', to: ida ? 'Salta (Terminal)' : stop,
        date: w.dateLong, dep: w.time, arr: w.arr, note: w.note, hasNote: !!w.note, seats: (s.seats[k] || []).map(x => x.n).join(', '), short: (ida ? stop + ' → Salta' : 'Salta → ' + stop) + ' · ' + w.date + ' · ' + w.time + ' → ' + w.arr + ' hs' }; });
    const sum = { legs: sumLegs, rt: q.rt, rtRules: RT_RULES, policy: POLICY_ROWS.map(([when, pct]) => ({ when, pct })), baggage: BAGGAGE, total: money(total), hasSaving: saving > 0, saving: 'Ahorrás ' + money(saving) + ' comprando ida y vuelta', contact: [s.contact.email, s.contact.wa].filter(Boolean).join(' · ') };
    // mp
    const methods = [['debito', 'credit_card', 'Tarjeta de débito', 'Visa Débito, Mastercard Débito, Maestro, Cabal'], ['credito', 'credit_card', 'Tarjeta de crédito', 'Visa, Mastercard, Naranja, Cabal · sin devolución'], ['cuenta', 'account_balance_wallet', 'Dinero en cuenta', 'Pagá con tu saldo de MercadoPago'], ['efectivo', 'payments', 'Efectivo', 'En Rapipago o Pago Fácil']];
    const finalize = (res) => {
      const legsP = legs.map(k => ({ tripId: s.sel[k], seats: s.seats[k], prices: s.pax.map((_, i) => legPrice(k, i)) }));
      const pax = s.pax.map(p => Object.assign({}, p, { stop }));
      const mlabel = s.method === 'credito' ? 'MercadoPago · Tarjeta de crédito' : s.method === 'debito' ? 'MercadoPago · Tarjeta de débito' : s.method === 'cuenta' ? 'MercadoPago · Dinero en cuenta' : 'MercadoPago · Efectivo (' + s.net + ')';
      const r = SD.purchase({ legs: legsP, pax, channel: 'Online', branch: 'Web', seller: '—', method: mlabel, payStatus: res, email: s.contact.email, wa: s.contact.wa, rt: q.rt });
      this.go(res === 'aprobado' ? 'ok' : 'pendiente', { lastCode: r.code, holdUntil: 0, paying: false, confTab: 'boleto' });
    };
    const mp = {
      items: legs.length * q.pax + (legs.length * q.pax > 1 ? ' pasajes' : ' pasaje'), holder: ((s.pax[0] || {}).nombre + ' ' + (s.pax[0] || {}).apellido).toUpperCase(),
      methods: methods.map(([k, icon, label, desc]) => ({ icon, label, desc, bd: s.method === k ? '#00A6E6' : '#E1E8EE', dot: s.method === k ? '#00A6E6' : '#fff', on: () => this.setState({ method: k }) })),
      isCard: s.method === 'credito' || s.method === 'debito', isCredit: s.method === 'credito', trip: tripSum.map(x => x.kind + ': ' + x.short).join(' · '), isCash: s.method === 'efectivo', isAccount: s.method === 'cuenta',
      nets: ['Rapipago', 'Pago Fácil'].map(n => ({ label: n, bd: s.net === n ? '#00A6E6' : '#E1E8EE', on: () => this.setState({ net: n }) })),
      btn: s.paying ? 'Procesando pago…' : s.method === 'efectivo' ? 'Generar código de pago' : 'Pagar ' + money(total),
      pay: () => { if (s.paying) return; this.setState({ paying: true }); setTimeout(() => { const res = this.state.method === 'efectivo' ? 'pendiente' : (SD.get().scenario.pay === 'pendiente' ? 'pendiente' : SD.get().scenario.pay); if (res === 'rechazado') this.go('rechazado', { paying: false }); else finalize(res); }, 1400); }
    };
    // confirmation
    const confT = s.lastCode ? st.purchases.filter(p => p.code === s.lastCode).map(SD.view) : [];
    const tab = s.confTab;
    const conf = { code: s.lastCode || '', email: s.contact.email || 'tu email', first: (s.pax[0] || {}).nombre || '', tickets: confT, subject: 'Tu pasaje ' + (confT[0] ? confT[0].route : '') + ' · ' + (s.lastCode || ''),
      total: money(confT.reduce((a, t) => a + (st.purchases.find(p => p.id === t.id) || {}).price, 0)), net: s.net.toUpperCase(), payCode: s.lastCode ? String(SD.hash(s.lastCode)).padEnd(10, '7').slice(0, 10).replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3') : '',
      showBoleto: tab === 'boleto', showEmail: tab === 'email', bBg: tab === 'boleto' ? '#fff' : 'transparent', bFg: tab === 'boleto' ? '#E4007C' : '#6B6468', eBg: tab === 'email' ? '#fff' : 'transparent', eFg: tab === 'email' ? '#E4007C' : '#6B6468',
      tabBoleto: () => this.setState({ confTab: 'boleto' }), tabEmail: () => this.setState({ confTab: 'email' }) };
    // lookup
    const statusOf = (t) => { const tr = SD.getTrip(t.tripId); if (t.status === 'cancelado') return ['Cancelado', '#F1ECEF', '#6B6468']; if (t.status === 'reprogramado') return ['Reprogramado', '#F1ECEF', '#6B6468']; if (tr.cancelled) return ['Viaje cancelado', '#FBE3E3', '#B22A2A']; if (t.payStatus === 'pendiente') return ['Pendiente de pago', '#FFF4DB', '#8A5A00']; if (tr.past) return ['Usado', '#F1ECEF', '#6B6468']; return ['Activo', '#DDF3E8', '#147A52']; };
    const lkList = s.lkRes ? SD.lookup(s.lkRes.code, s.lkRes.id) : [];
    const lk = { code: s.lk.code, id: s.lk.id, loading: s.lk.loading, error: s.lk.error,
      onCode: e => this.setState({ lk: Object.assign({}, s.lk, { code: e.target.value, error: '' }) }), onId: e => this.setState({ lk: Object.assign({}, s.lk, { id: e.target.value, error: '' }) }),
      demo1: () => this.setState({ lk: { code: 'SOF-4KD72', id: '32456789', loading: false, error: '' } }), demo2: () => this.setState({ lk: { code: 'SOF-9XR31', id: '38112450', loading: false, error: '' } }),
      submit: () => { if (!s.lk.code.trim() || !s.lk.id.trim()) return this.setState({ lk: Object.assign({}, s.lk, { error: 'Completá el código de reserva y tu DNI o email.' }) });
        this.setState({ lk: Object.assign({}, s.lk, { loading: true, error: '' }), lkRes: null });
        setTimeout(() => { const r = SD.lookup(this.state.lk.code, this.state.lk.id); if (!r.length) this.setState({ lk: Object.assign({}, this.state.lk, { loading: false, error: 'No encontramos un pasaje con esos datos. Revisá el código (está en tu email) y el DNI.' }) });
          else if (r.length === 1) { this.setState({ lk: Object.assign({}, this.state.lk, { loading: false }), lkRes: { code: this.state.lk.code, id: this.state.lk.id }, curId: r[0].id }); this.go('detalle'); }
          else this.setState({ lk: Object.assign({}, this.state.lk, { loading: false }), lkRes: { code: this.state.lk.code, id: this.state.lk.id } }); }, 800); },
      results: lkList.map(t => { const v = SD.view(t); const [sLabel, sBg, sFg] = statusOf(t); return Object.assign({}, v, { sLabel, sBg, sFg, open: () => this.go('detalle', { curId: t.id }) }); }) };
    // detail
    const cur = s.curId ? SD.allTickets().find(t => t.id === s.curId) : null;
    const curT = cur ? SD.applyOv(cur) : null;
    const curTrip2 = curT ? SD.getTrip(curT.tripId) : null;
    const det = curT ? { v: SD.view(curT), companyCancel: curTrip2.cancelled && curT.status === 'activo', inactive: curT.status !== 'activo' || curTrip2.past,
      inactiveText: curT.status === 'cancelado' ? 'Este pasaje está cancelado.' : curT.status === 'reprogramado' ? 'Este pasaje fue reprogramado. Buscá el nuevo boleto con el mismo código.' : 'Este viaje ya se realizó.',
      canAct: curT.status === 'activo' && !curTrip2.past && (!curT.rt || curTrip2.cancelled), isRt: !!curT.rt && curT.status === 'activo' && !curTrip2.past && !curTrip2.cancelled, rtRules: RT_RULES,
      credit: SD.isCredit(curT) && !curTrip2.cancelled, baggage: BAGGAGE,
      reprog: () => this.go('rp', { rp: { date: null, tripId: null, seat: null, step: 1 } }), cancel: () => this.go('cx', { cxAck: false }) } : { v: {} };
    // reprog
    let rp = {};
    if (curT && (s.screen === 'rp')) {
      const gate = SD.reprogQuote(curT, curTrip2, curT.cls);
      const rpDate = s.rp.date || SD.addDays(curTrip2.date, 1);
      const rpStop = curT.stop;
      const rpTrips = SD.tripsOn(rpDate).filter(t => t.dir === curTrip2.dir && SD.stopsOf(t.line, t.dir).includes(rpStop) && t.id !== curTrip2.id && !t.past && !t.cancelled);
      const nt = s.rp.tripId ? SD.getTrip(s.rp.tripId) : null;
      const quote = nt && s.rp.seat ? SD.reprogQuote(curT, nt, s.rp.seat.cls) : null;
      const step = s.rp.step;
      const setRp = p => this.setState(x => ({ rp: Object.assign({}, x.rp, p) }));
      const hrs = Math.floor(gate.hours);
      rp = { code: curT.code, title: gate.allowed ? 'Cambiá la fecha de tu viaje' : 'Reprogramación no disponible',
        blocked: !gate.allowed, open: gate.allowed, blockedTitle: gate.reason === 'rt' ? 'Los pasajes ida y vuelta no admiten cambios' : 'Ya pasó el plazo para reprogramar',
        blockedText: gate.reason === 'rt' ? RT_RULES : 'Tu viaje sale en ' + Math.max(0, hrs) + ' h y el cambio solo se puede pedir hasta 3 h antes de la salida. Escribinos por WhatsApp y te ayudamos según disponibilidad.',
        policy: gate.free ? 'Como la empresa canceló tu viaje, la reprogramación no tiene cargo.' : 'Podés reprogramar hasta 3 h antes de la salida (te quedan ' + hrs + ' h). Retención: 10% con más de 48 h de anticipación, 20% entre 24 y 48 h y 30% dentro de las 24 h previas, más la diferencia si la nueva tarifa es mayor.',
        steps: [1, 2, 3].map(n => n <= step ? '#E4007C' : '#EDE5E9'), step1: step === 1, step2: step === 2, step3: step === 3,
        days: days('a', rpDate, d => setRp({ date: d, tripId: null, seat: null }), SD.TODAY, curTrip2.dir, rpStop),
        trips: rpTrips.map(t => { const a = SD.avail(t), w = SD.when(t, rpStop); return { line: t.lineName, date: w.date, time: w.time, when: w.note, semi: 'Semicama: ' + a.semi, cama: 'Cama: ' + a.cama, disabled: a.total === 0, op: a.total === 0 ? .5 : 1, onPick: () => setRp({ tripId: t.id, seat: null, step: 2 }) }; }),
        noTrips: rpTrips.length === 0,
        tripLabel: nt ? SD.when(nt, rpStop).date + ' ' + SD.when(nt, rpStop).time + ' hs' : '', back1: () => setRp({ step: 1 }),
        seats: nt ? SD.seatsFor(nt) : [], selected: s.rp.seat ? [s.rp.seat.n] : [], toggle: x => setRp({ seat: { n: x.n, cls: x.cls } }),
        seatLabel: s.rp.seat ? 'Asiento ' + s.rp.seat.n + ' · ' + (s.rp.seat.cls === 'semi' ? 'Semicama' : 'Cama') : 'Elegí un asiento en el plano', noSeat: !s.rp.seat, nextBg: s.rp.seat ? 'linear-gradient(135deg,#C2006A,#E4007C)' : '#D9D1D5',
        toStep3: () => s.rp.seat && setRp({ step: 3 }),
        oldWhen: SD.when(curTrip2, rpStop).date + ' · ' + SD.when(curTrip2, rpStop).time + ' hs', oldSeat: 'Asiento ' + curT.seat + ' · ' + (curT.cls === 'semi' ? 'Semicama' : 'Cama'),
        newWhen: nt ? SD.when(nt, rpStop).date + ' · ' + SD.when(nt, rpStop).time + ' hs' : '', newSeat: s.rp.seat ? 'Asiento ' + s.rp.seat.n + ' · ' + (s.rp.seat.cls === 'semi' ? 'Semicama' : 'Cama') + ' · Coche N° ' + nt.car : '',
        feeLabel: quote && !quote.free ? 'Retención por reprogramación (' + quote.ret + '%)' : 'Retención por reprogramación', fee: quote ? money(quote.fee) : '', diff: quote ? money(quote.diff) : '', total: quote ? money(quote.total) : '',
        confirmLabel: s.paying ? 'Procesando…' : quote && quote.total > 0 ? 'Pagar ' + money(quote.total) + ' y confirmar' : 'Confirmar reprogramación',
        confirm: () => { if (s.paying) return; confirmAction({ title: '¿Confirmar el cambio de fecha?', body: 'Tu pasaje ' + curT.code + ' pasa al ' + SD.when(nt, rpStop).date + ' · ' + SD.when(nt, rpStop).time + ' hs, asiento ' + s.rp.seat.n + (quote && quote.total > 0 ? '. A pagar: ' + money(quote.total) : '') + '. El boleto anterior queda anulado.', confirmLabel: quote && quote.total > 0 ? 'Pagar y confirmar' : 'Confirmar cambio', cancelLabel: 'Volver' }).then(ok => { if (!ok) return; this.setState({ paying: true }); setTimeout(() => { const n = SD.reprogram(curT, s.rp.tripId, s.rp.seat, { channel: 'Online', branch: 'Web', user: 'Pasajero', reason: 'A pedido del pasajero' }); this.go('rpOk', { paying: false, rpDone: n.id }); }, 1100); }); } };
    }
    const rpOkT = s.rpDone ? st.purchases.find(p => p.id === s.rpDone) : null;
    // cancel
    let cx = {};
    if (curT && s.screen === 'cx') {
      const qx = SD.cancelQuote(curT); const h = Math.floor(qx.hours);
      const tier = qx.company ? -1 : h >= 48 ? 0 : h >= 24 ? 1 : 2;
      const why = { credito: ['Pasaje pagado con tarjeta de crédito', 'Los pasajes abonados con tarjeta de crédito no admiten devolución bajo ningún término. Si necesitás viajar otro día, podés reprogramarlo hasta 3 h antes de la salida.'], rt: ['Pasaje ida y vuelta', RT_RULES], past: ['El viaje ya salió', 'Este pasaje ya no se puede cancelar.'] }[qx.reason] || ['', ''];
      cx = { code: curT.code, blocked: !qx.allowed, open: qx.allowed, blockedTitle: why[0], blockedText: why[1], canReprog: qx.reason === 'credito', reprog: () => this.go('rp', { rp: { date: null, tripId: null, seat: null, step: 1 } }),
        rules: POLICY_ROWS.map((r, i) => ({ when: r[0], pct: 'Retención ' + r[1], bg: i === tier ? '#FDE6F2' : '#F8F5F6', fg: i === tier ? '#A3005A' : '#4A4447' })),
        feeLabel: 'Retención (' + (qx.company ? 0 : qx.ret) + '%)',
        hoursText: qx.company ? 'La empresa canceló este viaje: te devolvemos el 100%.' : 'Tu viaje sale en ' + Math.max(0, h) + ' h.',
        trip: SD.view(curT).route + ' · ' + SD.view(curT).date + ' ' + SD.view(curT).time + ' hs · Asiento ' + curT.seat,
        paid: money(curT.price), fee: money(qx.fee), refund: money(qx.refund), where: curT.channel === 'Online' ? 'Reintegro al medio de pago original en MercadoPago, en 5 a 10 días hábiles.' : 'Reintegro en la sucursal donde compraste.',
        ackBg: s.cxAck ? '#D33A3A' : '#fff', ackMark: s.cxAck ? 'check' : '', toggleAck: () => this.setState({ cxAck: !s.cxAck }), noAck: !s.cxAck, btnBg: s.cxAck ? '#D33A3A' : '#D9D1D5',
        confirm: () => { if (!s.cxAck) return; const r = SD.cancelTicket(curT, { channel: 'Online', branch: 'Web', user: 'Pasajero' }); this.go('cxOk', { cxDone: { refund: money(r.refund), dest: curT.channel === 'Online' ? 'MercadoPago' : 'Sucursal' } }); } };
    }
    // contact
    const branches = SD.BRANCHES.map((b, i) => Object.assign({}, b, { bd: i === s.branch ? '#E4007C' : '#F0E9ED', on: () => this.setState({ branch: i }), wa: e => { e.stopPropagation(); this.toast('Se abriría WhatsApp con ' + b.name + ' (' + b.tel + ')'); }, call: e => { e.stopPropagation(); this.toast('Llamando a ' + b.tel + '…'); } }));
    const faq = FAQ.map(([qq, a], i) => ({ q: qq, a, open: s.faq === i, icon: s.faq === i ? 'remove' : 'add', on: () => this.setState({ faq: s.faq === i ? -1 : i }) }));
    const flow = ['seats', 'datos', 'resumen', 'mp'];
    const screens = ['home', 'results', 'seats', 'datos', 'resumen', 'mp', 'ok', 'pendiente', 'rechazado', 'vencido', 'mis', 'detalle', 'rp', 'rpOk', 'cx', 'cxOk', 'contacto'];
    const sObj = {}; screens.forEach(k => sObj[k] = s.screen === k);
    return {
      s: sObj, isDesk, isMob: !isDesk, scrollRef: this.scrollRef, lineasRef: this.lineasRef, menuOpen: s.menu && !isDesk, menuIcon: s.menu ? 'close' : 'menu',
      heroImg: isDesk ? '/assets/hero.png' : '/assets/hero-m.png', heroPos: isDesk ? 'center 35%/cover' : 'center top/100% auto', heroPad: isDesk ? '72px 32px 56px' : '170px 16px 24px', heroFs: isDesk ? 76 : 46, scriptFs: isDesk ? 34 : 24,
      nav, act, urgency, search, lineCards, services, res, loading: s.loading, seat, hold, paxForms, contact, sum, tripSum, mp, paying: s.paying, conf, lk, det, rp, rpOk: rpOkT ? SD.view(rpOkT) : {}, cx, cxOk: s.cxDone || {},
      fill: () => this.setState(x => ({ pax: x.pax.map((p, i) => Object.assign({}, p, { nombre: sample[i][0], apellido: sample[i][1], dni: sample[i][2], nac: sample[i][3] })), contact: { email: 'lucia.fernandez@gmail.com', wa: '3873-512233' } })),
      toResumen: () => { const e = validate(); if (Object.keys(e).length) { this.setState({ errors: e, tried: true }); this.toast('Revisá los datos marcados en rojo'); return; } this.go('resumen', { errors: {}, tried: false }); },
      toMp: () => this.go('mp', { paying: false }),
      restart: () => { this.setState({ sel: { a: null, b: null }, seats: { a: [], b: [] }, leg: 'a' }); this.go('results'); this.load(); },
      branches, branchSel: SD.BRANCHES[s.branch], faq, toast: s.toast,
      showFooter: !flow.includes(s.screen), showFab: !flow.includes(s.screen), fabBottom: 20
    };
  }

  render() {
    const $: any = this.renderVals();
    return (<>

<div style={css("position:relative;width:100%;height:100%;background:#F7F4F5;font-family:'Barlow',system-ui,sans-serif;color:#1D1A1C;overflow:hidden")}>
<div ref={$.scrollRef} className="pub-scroll" style={css("position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column")}>

  {!!($.urgency?.show) && (<>
    <button onClick={$.urgency?.on} style={css("width:100%;border:none;cursor:pointer;background:#1D1A1C;color:#fff;padding:9px 16px;display:flex;align-items:center;justify-content:center;gap:8px;font:600 13px 'Barlow',sans-serif;text-align:left")}>
      <span style={css("width:8px;height:8px;border-radius:50%;background:#FF4FA0;flex:none;animation:sofpulse 1.4s infinite")}></span>
      <span>{$.urgency?.text}</span>
      <span style={css("font-family:'Material Symbols Rounded';font-size:18px;color:#FF4FA0")}>arrow_forward</span>
    </button>
  </>)}

  <header style={css("position:sticky;top:0;z-index:20;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-bottom:1px solid #F0E8EC")}>
    <div style={css("max-width:1120px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px")}>
      <button onClick={$.nav?.home} style={css("border:none;background:none;padding:0;cursor:pointer;display:flex")}><img src="/assets/logo.png" alt="Expreso Sofía" style={css("height:44px;display:block")} /></button>
      {!!($.isDesk) && (<>
        <nav style={css("display:flex;align-items:center;gap:6px")}>
          <button onClick={$.nav?.home} style={css("border:none;background:none;cursor:pointer;height:40px;padding:0 14px;font:600 15px 'Barlow',sans-serif;color:#1D1A1C")}>Inicio</button>
          <button onClick={$.nav?.lineas} style={css("border:none;background:none;cursor:pointer;height:40px;padding:0 14px;font:600 15px 'Barlow',sans-serif;color:#1D1A1C")}>Líneas y horarios</button>
          <button onClick={$.nav?.contacto} style={css("border:none;background:none;cursor:pointer;height:40px;padding:0 14px;font:600 15px 'Barlow',sans-serif;color:#1D1A1C")}>Contacto</button>
          <button onClick={$.nav?.mis} style={css("height:40px;padding:0 18px;border:1.5px solid #E4007C;border-radius:999px;background:#fff;color:#E4007C;font:700 14px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>confirmation_number</span>Mis pasajes</button>
        </nav>
      </>)}
      {!!($.isMob) && (<>
        <div style={css("display:flex;align-items:center;gap:4px")}>
          <button onClick={$.nav?.mis} style={css("height:48px;padding:0 12px;border:none;border-radius:999px;background:#FDE6F2;color:#A3005A;font:700 13px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:4px")}><span style={css("font-family:'Material Symbols Rounded';font-size:19px")}>confirmation_number</span>Mis pasajes</button>
          <button onClick={$.nav?.menu} style={css("width:48px;height:48px;border:none;background:none;cursor:pointer;font-family:'Material Symbols Rounded';font-size:26px;color:#1D1A1C")}>{$.menuIcon}</button>
        </div>
      </>)}
    </div>
    {!!($.menuOpen) && (<>
      <div style={css("display:flex;flex-direction:column;padding:4px 16px 14px;gap:2px;border-top:1px solid #F0E8EC")}>
        <button onClick={$.nav?.home} style={css("border:none;background:none;text-align:left;height:48px;padding:0 4px;font:600 16px 'Barlow',sans-serif;cursor:pointer;color:#1D1A1C")}>Inicio</button>
        <button onClick={$.nav?.lineas} style={css("border:none;background:none;text-align:left;height:48px;padding:0 4px;font:600 16px 'Barlow',sans-serif;cursor:pointer;color:#1D1A1C")}>Líneas y horarios</button>
        <button onClick={$.nav?.mis} style={css("border:none;background:none;text-align:left;height:48px;padding:0 4px;font:600 16px 'Barlow',sans-serif;cursor:pointer;color:#1D1A1C")}>Mis pasajes</button>
        <button onClick={$.nav?.contacto} style={css("border:none;background:none;text-align:left;height:48px;padding:0 4px;font:600 16px 'Barlow',sans-serif;cursor:pointer;color:#1D1A1C")}>Contacto y sucursales</button>
        <button onClick={$.nav?.login} style={css("border:none;background:none;text-align:left;height:48px;padding:0 4px;font:600 14px 'Barlow',sans-serif;cursor:pointer;color:#716A6E")}>Acceso interno</button>
      </div>
    </>)}
  </header>

  {!!($.hold?.show) && (<>
    <div style={css("position:sticky;top:65px;z-index:15")}>
    <div style={css(`background:${$.hold?.bg ?? ''};color:#fff;padding:9px 16px;display:flex;align-items:center;justify-content:center;gap:8px;font:600 14px 'Barlow',sans-serif`)}>
      <span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>timer</span>{$.hold?.label} <strong style={css("font:800 18px 'Barlow Condensed',sans-serif;letter-spacing:.04em")}>{$.hold?.time}</strong>
    </div>
    {!!($.s?.datos && $.isMob) && (<div style={css("background:#FDF2F8;border-bottom:1px solid #F7CFE3;padding:7px 16px;display:flex;flex-direction:column;gap:2px")}>
      {($.tripSum || []).map((l: any, k: number) => (<div key={k} style={css("font:700 12.5px 'Barlow',sans-serif;color:#5C0033;display:flex;gap:6px;align-items:center")}><span style={css("font-family:'Material Symbols Rounded';font-size:16px;color:#E4007C")}>directions_bus</span>{l.short}</div>))}
    </div>)}
    </div>
  </>)}

  
  {!!($.s?.home) && (<>
    <section style={css(`position:relative;background:#3a0a24 url('${$.heroImg ?? ''}') ${$.heroPos ?? ''} no-repeat`)}>
      <div style={css("position:absolute;inset:0;background:linear-gradient(180deg,rgba(29,10,20,.25) 0%,rgba(110,0,58,.55) 55%,rgba(247,244,245,1) 100%)")}></div>
      <div style={css(`position:relative;max-width:1120px;margin:0 auto;padding:${$.heroPad ?? ''};display:flex;flex-wrap:wrap;gap:24px;align-items:flex-end;justify-content:space-between`)}>
        <div style={css("flex:1 1 320px;min-width:0;color:#fff;display:flex;flex-direction:column;gap:10px;padding-bottom:8px")}>
          <div style={css("align-self:flex-start;background:#E4007C;color:#fff;border-radius:999px;padding:6px 12px;font:700 12px 'Barlow',sans-serif;letter-spacing:.06em")}>LUNES A SÁBADO · SALIDAS DE MADRUGADA</div>
          <h1 style={css(`margin:0;font:900 ${$.heroFs ?? ''}px/0.92 'Barlow Condensed',sans-serif;text-transform:uppercase;text-shadow:0 2px 24px rgba(0,0,0,.35);text-wrap:balance`)}>Pasajes a Salta desde Tartagal y Orán</h1>
          <div style={css(`font:400 ${$.scriptFs ?? ''}px/1.15 'Kaushan Script',cursive;text-shadow:0 2px 16px rgba(0,0,0,.4)`)}>Viajá cómodo, seguro y al mejor precio</div>
        </div>
        <div onKeyDown={submitOnEnter($.search?.submit)} style={css("flex:1 1 340px;max-width:440px;background:#fff;border-radius:22px;padding:16px;box-shadow:0 24px 60px -20px rgba(80,0,40,.5);display:flex;flex-direction:column;gap:12px")}>
          <div style={css("display:flex;background:#F3EEF1;border-radius:999px;padding:4px")}>
            <button onClick={$.search?.setIda} style={css(`flex:1;height:40px;border:none;border-radius:999px;cursor:pointer;font:700 14px 'Barlow',sans-serif;background:${$.search?.idaBg ?? ''};color:${$.search?.idaFg ?? ''}`)}>Solo ida</button>
            <button onClick={$.search?.setRt} style={css(`flex:1;height:40px;border:none;border-radius:999px;cursor:pointer;font:700 14px 'Barlow',sans-serif;background:${$.search?.rtBg ?? ''};color:${$.search?.rtFg ?? ''}`)}>Ida y vuelta</button>
          </div>
          <div style={css("display:grid;grid-template-columns:minmax(0,1fr) 40px minmax(0,1fr);gap:8px;align-items:end")}>
            <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Origen
              <select value={$.search?.origin} onChange={$.search?.onOrigin} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;width:100%")}>
                {(Array.isArray($.search?.origins) ? $.search?.origins : []).map((o: any, $index: number) => (<React.Fragment key={$index}><option value={o}>{o}</option></React.Fragment>))}
              </select>
            </label>
            <button onClick={$.search?.swap} title="Invertir" style={css("width:40px;height:48px;border:none;border-radius:12px;background:#FDE6F2;color:#E4007C;cursor:pointer;font-family:'Material Symbols Rounded';font-size:22px")}>swap_horiz</button>
            <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Destino
              <select value={$.search?.dest} onChange={$.search?.onDest} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;width:100%")}>
                {(Array.isArray($.search?.dests) ? $.search?.dests : []).map((o: any, $index: number) => (<React.Fragment key={$index}><option value={o}>{o}</option></React.Fragment>))}
              </select>
            </label>
          </div>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px")}>
            <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Fecha de viaje
              <input type="date" value={$.search?.date} min={$.search?.min} max={$.search?.max} onChange={$.search?.onDate} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;width:100%")} />
            </label>
            {!!($.search?.rt) && (<>
              <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Fecha de vuelta
                <input type="date" value={$.search?.ret} min={$.search?.date} max={$.search?.retMax} onChange={$.search?.onRet} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;width:100%")} />
              </label>
            </>)}
            <div style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Pasajeros
              <div style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;display:flex;align-items:center;justify-content:space-between;padding:0 4px")}>
                <button onClick={$.search?.paxMinus} style={css("width:40px;height:40px;border:none;border-radius:10px;background:#F3EEF1;cursor:pointer;font:700 18px 'Barlow',sans-serif;color:#1D1A1C")}>−</button>
                <span style={css("font:700 16px 'Barlow',sans-serif;color:#1D1A1C")}>{$.search?.pax}</span>
                <button onClick={$.search?.paxPlus} style={css("width:40px;height:40px;border:none;border-radius:10px;background:#F3EEF1;cursor:pointer;font:700 18px 'Barlow',sans-serif;color:#1D1A1C")}>+</button>
              </div>
            </div>
          </div>
          <div style={css("font:500 12.5px 'Barlow',sans-serif;color:#6B6468;display:flex;gap:6px;align-items:flex-start")}><span style={css("font-family:'Material Symbols Rounded';font-size:17px;color:#E4007C")}>dark_mode</span>{$.search?.hint}</div>
          {!!($.search?.rt) && (<div style={css("font:600 12.5px/1.45 'Barlow',sans-serif;color:#8A5A00;background:#FFF4DB;border-radius:10px;padding:8px 10px;display:flex;gap:6px;align-items:flex-start")}><span style={css("font-family:'Material Symbols Rounded';font-size:17px")}>info</span>{$.search?.rtRules}</div>)}
          <button onClick={$.search?.submit} style={css("height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 18px 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;box-shadow:0 10px 24px -10px rgba(228,0,124,.7);display:flex;align-items:center;justify-content:center;gap:8px")}><span style={css("font-family:'Material Symbols Rounded';font-size:22px")}>search</span>Buscar pasajes</button>
        </div>
      </div>
    </section>

    <div style={css("max-width:1120px;margin:0 auto;padding:20px 16px 48px;display:flex;flex-direction:column;gap:40px")}>
      <section style={css("position:relative;border-radius:24px;overflow:hidden;background:linear-gradient(135deg,#B8005F 0%,#E4007C 55%,#FF5AA8 100%);color:#fff;display:flex;flex-wrap:wrap")}>
        <div style={css("flex:1 1 300px;padding:24px;display:flex;flex-direction:column;gap:10px;justify-content:center")}>
          <div style={css("align-self:flex-start;background:#fff;color:#E4007C;border-radius:999px;padding:6px 12px;font:800 13px 'Barlow',sans-serif")}>12 de Octubre</div>
          <div style={css("font:900 44px/0.9 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Primer aniversario</div>
          <div style={css("font:400 24px/1.15 'Kaushan Script',cursive")}>Si hoy estamos acá, es gracias a vos.</div>
          <div style={css("font:500 15px/1.45 'Barlow',sans-serif;max-width:420px")}>Octubre es el mes de nuestro primer aniversario. Gracias por acompañarnos en este primer año. Se vienen muchas sorpresas, ¡así que preparate!</div>
          <button onClick={$.nav?.searchTop} style={css("align-self:flex-start;margin-top:6px;height:48px;padding:0 20px;border:none;border-radius:999px;background:#fff;color:#E4007C;font:800 15px 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer")}>Reservá tu próximo viaje</button>
        </div>
        <div style={css("flex:1 1 300px;min-height:200px;background:url('/assets/fleet.png') center/cover no-repeat")}></div>
      </section>

      <section ref={$.lineasRef} style={css("display:flex;flex-direction:column;gap:16px")}>
        <div style={css("display:flex;flex-direction:column;gap:4px")}>
          <div style={css("font:700 12px 'Barlow',sans-serif;letter-spacing:.12em;color:#E4007C")}>LÍNEAS Y RECORRIDOS</div>
          <h2 style={css("margin:0;font:800 32px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Dos líneas, de lunes a sábado</h2>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px")}>
          {(Array.isArray($.lineCards) ? $.lineCards : []).map((l: any, $index: number) => (<React.Fragment key={$index}>
            <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;box-shadow:0 8px 24px -16px rgba(80,0,40,.25);overflow:hidden;display:flex;flex-direction:column")}>
              <div style={css("background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;gap:10px")}>
                <div style={css("font:800 24px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{l?.name}</div>
                <div style={css("background:#fff;color:#E4007C;border-radius:999px;padding:5px 10px;font:800 13px 'Barlow',sans-serif")}>Sale {l?.dep} hs</div>
              </div>
              <div style={css("padding:16px 18px;display:flex;flex-direction:column")}>
                {(Array.isArray(l?.stops) ? l?.stops : []).map((st: any, $index: number) => (<React.Fragment key={$index}>
                  <div style={css("display:flex;align-items:center;gap:12px;min-height:34px")}>
                    <div style={css("width:14px;display:flex;flex-direction:column;align-items:center;align-self:stretch")}><div style={css(`flex:1;width:2px;background:${st?.lineTop ?? ''}`)}></div><div style={css("width:12px;height:12px;border-radius:50%;border:3px solid #E4007C;background:#fff;flex:none")}></div><div style={css(`flex:1;width:2px;background:${st?.lineBot ?? ''}`)}></div></div>
                    <div style={css("flex:1;font:600 15px 'Barlow',sans-serif")}>{st?.name}</div>
                    <div style={css("font:700 15px 'Barlow Condensed',sans-serif;color:#4A4447;font-size:17px")}>{st?.time} hs</div>
                  </div>
                </React.Fragment>))}
                <div style={css("display:flex;align-items:center;gap:12px;min-height:34px")}>
                  <div style={css("width:14px;display:flex;flex-direction:column;align-items:center;align-self:stretch")}><div style={css("flex:1;width:2px;background:#F3C4DD")}></div><div style={css("width:14px;height:14px;border-radius:50%;background:#E4007C;flex:none")}></div><div style={css("flex:1")}></div></div>
                  <div style={css("flex:1;font:800 15px 'Barlow',sans-serif")}>Salta · Terminal</div>
                  <div style={css("font:700 17px 'Barlow Condensed',sans-serif;color:#E4007C")}>aprox. 06:30 hs</div>
                </div>
              </div>
              <div style={css("margin-top:auto;border-top:1px solid #F3EDF0;padding:12px 18px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font:600 13px 'Barlow',sans-serif;color:#4A4447")}>
                <span>Vuelta: {l?.back}</span><span style={css("color:#E4007C")}>Desde {l?.from}</span>
              </div>
            </div>
          </React.Fragment>))}
        </div>
        <div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>Tarifa única por línea: pagás lo mismo subas en la parada que subas. Domingos: viajes especiales desde Salta.</div>
      </section>

      <section style={css("display:flex;flex-direction:column;gap:16px")}>
        <div style={css("display:flex;flex-direction:column;gap:4px")}>
          <div style={css("font:700 12px 'Barlow',sans-serif;letter-spacing:.12em;color:#E4007C")}>A BORDO</div>
          <h2 style={css("margin:0;font:800 32px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Todo incluido en tu pasaje</h2>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px")}>
          {(Array.isArray($.services) ? $.services : []).map((sv: any, $index: number) => (<React.Fragment key={$index}>
            <div style={css("background:#fff;border-radius:16px;border:1px solid #F0E9ED;padding:16px 14px;display:flex;flex-direction:column;align-items:flex-start;gap:10px")}>
              <div style={css("width:46px;height:46px;border-radius:50%;background:#E4007C;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:24px")}>{sv?.icon}</div>
              <div style={css("font:700 14px/1.25 'Barlow',sans-serif")}>{sv?.label}</div>
            </div>
          </React.Fragment>))}
        </div>
      </section>

      <section style={css("display:flex;flex-direction:column;gap:16px")}>
        <div style={css("display:flex;flex-direction:column;gap:4px")}>
          <div style={css("font:700 12px 'Barlow',sans-serif;letter-spacing:.12em;color:#E4007C")}>ELEGÍ TU BUTACA</div>
          <h2 style={css("margin:0;font:800 32px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Semicama o Cama</h2>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:16px")}>
          <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:20px;display:flex;flex-direction:column;gap:14px")}>
            <div style={css("display:flex;justify-content:space-between;align-items:flex-start;gap:10px")}><div><div style={css("font:900 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Semicama</div><div style={css("font:600 13px 'Barlow',sans-serif;color:#6B6468;margin-top:4px")}>Planta alta · 48 butacas · filas 2+2</div></div><span style={css("font-family:'Material Symbols Rounded';font-size:34px;color:#E4007C")}>airline_seat_recline_normal</span></div>
            <div style={css("display:flex;gap:8px")}>
              <div style={css("flex:1;background:#F8F5F6;border-radius:14px;padding:10px 12px")}><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Sólo ida</div><div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;color:#E4007C")}>$20.000</div></div>
              <div style={css("flex:1;background:#F8F5F6;border-radius:14px;padding:10px 12px")}><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Ida y vuelta</div><div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;color:#E4007C")}>desde $32.000</div></div>
            </div>
            <div style={css("font:500 14px/1.5 'Barlow',sans-serif;color:#4A4447")}>Vista panorámica desde arriba. La opción más elegida para viajar de noche.</div>
          </div>
          <div style={css("background:#1D1A1C;color:#fff;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:14px")}>
            <div style={css("display:flex;justify-content:space-between;align-items:flex-start;gap:10px")}><div><div style={css("font:900 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Cama</div><div style={css("font:600 13px 'Barlow',sans-serif;color:#CFC6CA;margin-top:4px")}>Planta baja · 12 butacas · filas 2+1</div></div><span style={css("font-family:'Material Symbols Rounded';font-size:34px;color:#FF4FA0")}>airline_seat_flat</span></div>
            <div style={css("display:flex;gap:8px")}>
              <div style={css("flex:1;background:#2C2729;border-radius:14px;padding:10px 12px")}><div style={css("font:600 12px 'Barlow',sans-serif;color:#CFC6CA")}>Sólo ida</div><div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;color:#FF4FA0")}>$25.000</div></div>
              <div style={css("flex:1;background:#2C2729;border-radius:14px;padding:10px 12px")}><div style={css("font:600 12px 'Barlow',sans-serif;color:#CFC6CA")}>Ida y vuelta</div><div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;color:#FF4FA0")}>desde $40.000</div></div>
            </div>
            <div style={css("font:500 14px/1.5 'Barlow',sans-serif;color:#E6DFE2")}>Butacas más anchas y con más espacio entre filas. Solo 12 lugares por viaje.</div>
          </div>
        </div>
      </section>

      <section style={css("display:flex;flex-wrap:wrap;gap:20px;align-items:center;background:#fff;border-radius:24px;border:1px solid #F0E9ED;overflow:hidden")}>
        <div style={css("flex:1 1 280px;min-height:240px;align-self:stretch;background:url('/assets/salta.png') center/cover no-repeat")}></div>
        <div style={css("flex:1 1 300px;padding:24px;display:flex;flex-direction:column;gap:10px")}>
          <div style={css("font:700 12px 'Barlow',sans-serif;letter-spacing:.12em;color:#E4007C")}>UNA EMPRESA FAMILIAR</div>
          <div style={css("font:400 28px/1.15 'Kaushan Script',cursive;color:#E4007C")}>Más que un destino, compartimos historias</div>
          <div style={css("font:500 15px/1.55 'Barlow',sans-serif;color:#4A4447")}>Hace un año empezamos a unir el norte de Salta con la capital. Cada viaje lo atendemos como en casa, con azafata a bordo y la atención de siempre en cada sucursal.</div>
          <div style={css("font:700 15px 'Barlow',sans-serif")}>Somos un servicio para la gente y vinimos para quedarnos.</div>
        </div>
      </section>

      <section style={css("display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;background:#1D1A1C;color:#fff;border-radius:24px;padding:22px")}>
        <div style={css("display:flex;flex-direction:column;gap:4px;flex:1 1 240px")}>
          <div style={css("font:800 26px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>¿Dudas o consultas?</div>
          <div style={css("font:500 14px 'Barlow',sans-serif;color:#CFC6CA")}>Escribinos y te respondemos al toque.</div>
        </div>
        <div style={css("display:flex;flex-wrap:wrap;gap:8px")}>
          <button onClick={$.act?.wa} style={css("height:48px;padding:0 18px;border:none;border-radius:999px;background:#25D366;color:#0B3B1E;font:800 15px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>chat</span>WhatsApp 3878-804506</button>
          <button onClick={$.act?.ig} style={css("height:48px;padding:0 16px;border:1.5px solid #4A4447;border-radius:999px;background:transparent;color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Instagram</button>
          <button onClick={$.act?.fb} style={css("height:48px;padding:0 16px;border:1.5px solid #4A4447;border-radius:999px;background:transparent;color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Facebook</button>
        </div>
      </section>
    </div>
  </>)}

  
  {!!($.s?.results) && (<>
    <div style={css("max-width:880px;margin:0 auto;padding:16px 16px 48px;display:flex;flex-direction:column;gap:16px")}>
      <div style={css("display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap")}>
        <div style={css("display:flex;flex-direction:column;gap:2px;min-width:0")}>
          <div style={css("font:600 12px 'Barlow',sans-serif;color:#E4007C;letter-spacing:.08em")}>{$.res?.stepLabel}</div>
          <div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.res?.title}</div>
          <div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>{$.res?.sub}</div>
        </div>
        <button onClick={$.nav?.home} style={css("height:40px;padding:0 14px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;font:700 13px 'Barlow',sans-serif;cursor:pointer;color:#1D1A1C")}>Modificar búsqueda</button>
      </div>
      {!!($.res?.rt) && (<>
        <div style={css("display:flex;gap:8px")}>
          <div style={css(`flex:1;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;background:${$.res?.s1bg ?? ''};color:${$.res?.s1fg ?? ''};font:700 13px 'Barlow',sans-serif`)}><span style={css(`width:24px;height:24px;border-radius:50%;background:${$.res?.s1dot ?? ''};color:#fff;display:flex;align-items:center;justify-content:center;font:800 12px 'Barlow',sans-serif`)}>1</span>{$.res?.s1}</div>
          <div style={css(`flex:1;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;background:${$.res?.s2bg ?? ''};color:${$.res?.s2fg ?? ''};font:700 13px 'Barlow',sans-serif`)}><span style={css(`width:24px;height:24px;border-radius:50%;background:${$.res?.s2dot ?? ''};color:#fff;display:flex;align-items:center;justify-content:center;font:800 12px 'Barlow',sans-serif`)}>2</span>{$.res?.s2}</div>
        </div>
      </>)}
      <div style={css("display:flex;gap:8px;overflow-x:auto;padding:2px 0 6px;margin:0 -16px;padding-left:16px;padding-right:16px")}>
        {(Array.isArray($.res?.days) ? $.res?.days : []).map((d: any, $index: number) => (<React.Fragment key={$index}>
          <button onClick={d?.on} disabled={d?.disabled} style={css(`flex:none;width:66px;padding:8px 4px;border-radius:14px;border:1.5px solid ${d?.bd ?? ''};background:${d?.bg ?? ''};color:${d?.fg ?? ''};cursor:${d?.cursor ?? ''};display:flex;flex-direction:column;align-items:center;gap:1px;opacity:${d?.op ?? ''}`)}>
            <span style={css("font:600 11px 'Barlow',sans-serif;text-transform:uppercase")}>{d?.dow}</span>
            <span style={css("font:800 22px/1.1 'Barlow Condensed',sans-serif")}>{d?.day}</span>
            <span style={css(`font:700 9.5px 'Barlow',sans-serif;letter-spacing:.02em;color:${d?.tagFg ?? ''}`)}>{d?.tag}</span>
          </button>
        </React.Fragment>))}
      </div>
      <div style={css("display:flex;flex-direction:column;gap:8px")}>
        <div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{$.res?.stopLabel}</div>
        <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
          {(Array.isArray($.res?.stops) ? $.res?.stops : []).map((c: any, $index: number) => (<React.Fragment key={$index}>
            <button onClick={c?.on} style={css(`height:40px;padding:0 12px;border-radius:999px;border:1.5px solid ${c?.bd ?? ''};background:${c?.bg ?? ''};color:${c?.fg ?? ''};font:600 13px 'Barlow',sans-serif;cursor:pointer`)}>{c?.name}</button>
          </React.Fragment>))}
        </div>
      </div>
      {!!($.loading) && (<>
        <div style={css("display:flex;flex-direction:column;gap:12px")}>
          <div style={css("height:170px;border-radius:20px;background:linear-gradient(90deg,#EFE9EC,#F7F3F5,#EFE9EC);animation:sofpulse 1.2s infinite")}></div>
          <div style={css("height:170px;border-radius:20px;background:linear-gradient(90deg,#EFE9EC,#F7F3F5,#EFE9EC);animation:sofpulse 1.2s infinite")}></div>
        </div>
      </>)}
      {!!($.res?.showList) && (<>
        <div style={css("display:flex;flex-direction:column;gap:12px")}>
          {(Array.isArray($.res?.cards) ? $.res?.cards : []).map((c: any, $index: number) => (<React.Fragment key={$index}>
            <div style={css(`background:#fff;border-radius:20px;border:1px solid #F0E9ED;box-shadow:0 8px 24px -16px rgba(80,0,40,.25);padding:16px;display:flex;flex-direction:column;gap:14px;opacity:${c?.op ?? ''}`)}>
              <div style={css("display:flex;gap:6px;flex-wrap:wrap;align-items:center")}>
                <span style={css("background:#FDE6F2;color:#A3005A;border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif")}>{c?.line}</span>
                {!!(c?.special) && (<><span style={css("background:#1D1A1C;color:#fff;border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif")}>Viaje especial</span></>)}
                {!!(c?.few) && (<><span style={css("background:#E4007C;color:#fff;border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif")}>{c?.fewLabel}</span></>)}
                <span style={css("margin-left:auto;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{c?.car}</span>
              </div>
              <div style={css("display:flex;align-items:center;gap:12px")}>
                <div style={css("min-width:0")}>
                  <div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{c?.from} · {c?.date}</div>
                  <div style={css("font:800 36px/1 'Barlow Condensed',sans-serif")}>{c?.time} <span style={css("font-size:18px")}>hs</span></div>
                </div>
                <div style={css("flex:1;height:2px;background:repeating-linear-gradient(90deg,#E4007C 0 6px,transparent 6px 11px);min-width:24px")}></div>
                <div style={css("text-align:right;min-width:0")}>
                  <div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{c?.to}</div>
                  <div style={css("font:800 24px/1 'Barlow Condensed',sans-serif;color:#4A4447")}>{c?.arr} <span style={css("font-size:14px")}>hs aprox.</span></div>
                </div>
              </div>
              {!!(c?.hasNote) && (<>
                <div style={css("display:flex;align-items:center;gap:8px;background:#F4EFFA;color:#4B2C82;border-radius:12px;padding:8px 10px;font:600 13px 'Barlow',sans-serif")}><span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>dark_mode</span>{c?.when}</div>
              </>)}
              <div style={css("display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                <span style={css(`border-radius:999px;padding:6px 10px;font:700 12.5px 'Barlow',sans-serif;background:${c?.semiBg ?? ''};color:${c?.semiFg ?? ''}`)}>{c?.semi}</span>
                <span style={css(`border-radius:999px;padding:6px 10px;font:700 12.5px 'Barlow',sans-serif;background:${c?.camaBg ?? ''};color:${c?.camaFg ?? ''}`)}>{c?.cama}</span>
              </div>
              <div style={css("display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid #F3EDF0;padding-top:12px")}>
                <div><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{c?.priceLabel}</div><div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;color:#E4007C")}>{c?.price}</div></div>
                {!!(c?.ok) && (<>
                  <button onClick={c?.onPick} style={css("height:48px;padding:0 20px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 16px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Elegir asientos</button>
                </>)}
                {!!(c?.blocked) && (<>
                  <span style={css("height:48px;padding:0 16px;border-radius:999px;background:#F1ECEF;color:#716A6E;font:800 15px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;display:flex;align-items:center")}>{c?.status}</span>
                </>)}
              </div>
            </div>
          </React.Fragment>))}
        </div>
      </>)}
      {!!($.res?.empty) && <EmptyState boxed icon="event_busy" title="No hay viajes para esta fecha" text="Los domingos solo salen viajes especiales desde Salta. Probá con otra fecha o escribinos por WhatsApp." action={{ label: 'Ver el próximo día con servicio', on: $.res?.next }} />}
    </div>
  </>)}

  
  {!!($.s?.seats) && (<>
    <div style={css("max-width:980px;margin:0 auto;padding:16px 16px 0;display:flex;flex-direction:column;gap:16px")}>
      <button onClick={$.nav?.backResults} style={css("align-self:flex-start;border:none;background:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;font:600 14px 'Barlow',sans-serif;color:#E4007C")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>arrow_back</span>Cambiar viaje</button>
      <div style={css("display:flex;flex-direction:column;gap:2px")}>
        <div style={css("font:600 12px 'Barlow',sans-serif;color:#E4007C;letter-spacing:.08em")}>{$.seat?.step}</div>
        <div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Elegí {$.seat?.need}</div>
        <div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>{$.seat?.trip}</div>
      </div>
      <div style={css("display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start")}>
        <div style={css("flex:1 1 320px;min-width:0;background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;justify-content:center")}>
          <div><SeatMap seats={$.seat?.seats} selected={$.seat?.selected} onToggle={$.seat?.toggle} mode="buy" layout={$.seat?.layout} priceSemi={$.seat?.pSemi} priceCama={$.seat?.pCama} /></div>
        </div>
        <div style={css("flex:1 1 260px;display:flex;flex-direction:column;gap:12px")}>
          <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:10px")}>
            <div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Tus asientos</div>
            {!!($.seat?.none) && (<>
              <div style={css("font:500 14px 'Barlow',sans-serif;color:#716A6E")}>Tocá una butaca libre en el plano.</div>
            </>)}
            {(Array.isArray($.seat?.list) ? $.seat?.list : []).map((x: any, $index: number) => (<React.Fragment key={$index}>
              <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-top:1px solid #F3EDF0")}>
                <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("width:34px;height:34px;border-radius:9px;background:#E4007C;color:#fff;display:flex;align-items:center;justify-content:center;font:800 15px 'Barlow',sans-serif")}>{x?.n}</span><div><div style={css("font:700 14px 'Barlow',sans-serif")}>{x?.cls}</div><div style={css("font:500 12px 'Barlow',sans-serif;color:#6B6468")}>{x?.floor}</div></div></div>
                <div style={css("font:800 18px 'Barlow Condensed',sans-serif")}>{x?.price}</div>
              </div>
            </React.Fragment>))}
            {!!($.seat?.cudNote) && (<>
              <div style={css("background:#EAF1FD;color:#1F4E9E;border-radius:12px;padding:10px;font:500 12.5px/1.45 'Barlow',sans-serif")}>Elegiste un asiento reservado para pasajeros con discapacidad. Vas a tener que indicar el CUD en los datos del pasajero.</div>
            </>)}
          </div>
        </div>
      </div>
    </div>
    <div style={css("position:sticky;bottom:0;z-index:10;margin-top:16px;background:#fff;border-top:1px solid #F0E8EC;box-shadow:0 -10px 30px -20px rgba(80,0,40,.4)")}>
      <div style={css("max-width:980px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px")}>
        <div><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{$.seat?.count}</div><div style={css("font:800 26px/1 'Barlow Condensed',sans-serif")}>{$.seat?.total}</div></div>
        <button onClick={$.seat?.next} disabled={$.seat?.notReady} style={css(`height:56px;padding:0 22px;border:none;border-radius:999px;background:${$.seat?.btnBg ?? ''};color:#fff;font:800 17px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer`)}>{$.seat?.nextLabel}</button>
      </div>
    </div>
  </>)}

  
  {!!($.s?.datos) && (<>
    <div className="r-stack" style={css("max-width:1100px;margin:0 auto;padding:16px 16px 0;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:20px;align-items:start")}>
    <aside className="r-first" style={css("grid-column:2;grid-row:1;position:sticky;top:120px;display:flex;flex-direction:column;gap:12px")}>
      <div style={css("background:#fff;border-radius:20px;border:2px solid #F7CFE3;padding:16px;display:flex;flex-direction:column;gap:14px")}>
        <div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.02em")}>Tu pasaje</div>
        {($.tripSum || []).map((l: any, k: number) => (<div key={k} style={css("display:flex;flex-direction:column;gap:10px;" + (k ? 'border-top:1px dashed #EDE5E9;padding-top:12px' : ''))}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}><span style={css("background:#E4007C;color:#fff;border-radius:999px;padding:3px 10px;font:700 12px 'Barlow',sans-serif")}>{l.kind}</span><span style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{l.line}</span></div>
          <div style={css("display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:8px;align-items:start")}>
            <div><div style={css("font:700 10.5px 'Barlow',sans-serif;letter-spacing:.1em;color:#716A6E")}>ORIGEN · SALIDA</div><div style={css("font:700 15px 'Barlow',sans-serif")}>{l.from}</div><div style={css("font:800 26px/1 'Barlow Condensed',sans-serif;color:#E4007C")}>{l.dep} hs</div></div>
            <span style={css("font-family:'Material Symbols Rounded';font-size:22px;color:#E4007C;margin-top:18px")}>arrow_forward</span>
            <div style={css("text-align:right")}><div style={css("font:700 10.5px 'Barlow',sans-serif;letter-spacing:.1em;color:#716A6E")}>DESTINO · LLEGADA</div><div style={css("font:700 15px 'Barlow',sans-serif")}>{l.to}</div><div style={css("font:800 26px/1 'Barlow Condensed',sans-serif")}>{l.arr} hs</div><div style={css("font:500 11px 'Barlow',sans-serif;color:#6B6468")}>aprox.</div></div>
          </div>
          <div style={css("font:600 14px 'Barlow',sans-serif")}>{l.date}</div>
          {!!l.hasNote && (<div style={css("align-self:flex-start;font:600 12.5px 'Barlow',sans-serif;color:#4B2C82;background:#F1ECFA;border-radius:10px;padding:6px 10px")}>{l.note}</div>)}
          <div style={css("font:500 13px 'Barlow',sans-serif;color:#4A4447")}>Asiento{l.seats.includes(',') ? 's' : ''}: <strong>{l.seats}</strong></div>
        </div>))}
      </div>
      <div style={css("background:#fff;border-radius:16px;border:1px solid #F0E9ED;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;font:500 13px/1.45 'Barlow',sans-serif;color:#4A4447")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px;color:#E4007C")}>luggage</span><span><strong>Equipaje:</strong> {$.sum?.baggage}</span></div>
    </aside>
    <div onKeyDown={submitOnEnter($.toResumen)} className="r-auto" style={css("grid-column:1;grid-row:1;display:flex;flex-direction:column;gap:16px;min-width:0")}>
      <div style={css("display:flex;justify-content:space-between;align-items:flex-end;gap:10px;flex-wrap:wrap")}>
        <div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>¿Quiénes viajan?</div>
        <button onClick={$.fill} style={css("border:none;background:none;padding:0;cursor:pointer;font:600 13px 'Barlow',sans-serif;color:#E4007C;text-decoration:underline")}>Completar con datos de ejemplo</button>
      </div>
      {(Array.isArray($.paxForms) ? $.paxForms : []).map((p: any, $index: number) => (<React.Fragment key={$index}>
        <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:12px")}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap")}>
            <div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Pasajero {p?.num}</div>
            <div style={css("background:#FDE6F2;color:#A3005A;border-radius:999px;padding:5px 10px;font:700 12px 'Barlow',sans-serif")}>{p?.seats}</div>
          </div>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:10px")}>
            {(Array.isArray(p?.fields) ? p?.fields : []).map((f: any, $index: number) => (<React.Fragment key={$index}>
              <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{f?.label}
                {!!(f?.isInput) && (<>
                  <input type={f?.type} inputMode={f?.mode} value={f?.value} placeholder={f?.ph} onChange={f?.on} style={css(`height:48px;border:1.5px solid ${f?.bd ?? ''};border-radius:12px;padding:0 12px;font:500 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;width:100%`)} />
                </>)}
                {!!(f?.isSelect) && (<>
                  <select value={f?.value} onChange={f?.on} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:500 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;width:100%")}>
                    {(Array.isArray(f?.options) ? f?.options : []).map((o: any, $index: number) => (<React.Fragment key={$index}><option value={o?.v}>{o?.l}</option></React.Fragment>))}
                  </select>
                </>)}
                {!!(f?.err) && (<><span style={css("color:#D33A3A;font:600 12px 'Barlow',sans-serif")}>{f?.err}</span></>)}
              </label>
            </React.Fragment>))}
          </div>
          <button onClick={p?.toggleCud} style={css(`display:flex;gap:10px;align-items:flex-start;border:1.5px solid ${p?.cudBd ?? ''};background:${p?.cudBg ?? ''};border-radius:14px;padding:12px;cursor:pointer;text-align:left`)}>
            <span style={css(`flex:none;width:22px;height:22px;border-radius:6px;border:2px solid #2E6BD8;background:${p?.cudBox ?? ''};color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:16px`)}>{p?.cudMark}</span>
            <span style={css("display:flex;flex-direction:column;gap:3px")}><span style={css("font:700 14px 'Barlow',sans-serif;color:#1D1A1C")}>Viajo con Certificado Único de Discapacidad (CUD)</span><span style={css("font:500 12.5px/1.45 'Barlow',sans-serif;color:#4A4447")}>El pasaje del titular no tiene costo. Se valida en sucursal presentando el CUD original y el DNI antes de viajar; si no se valida, la reserva se libera.</span></span>
          </button>
        </div>
      </React.Fragment>))}
      <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:12px")}>
        <div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Datos de contacto</div>
        <div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>Te enviamos el boleto por email y avisos del viaje por WhatsApp.</div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:10px")}>
          <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Email
            <input type="email" value={$.contact?.email} onChange={$.contact?.onEmail} placeholder="tunombre@gmail.com" style={css(`height:48px;border:1.5px solid ${$.contact?.emailBd ?? ''};border-radius:12px;padding:0 12px;font:500 15px 'Barlow',sans-serif;width:100%`)} />
            {!!($.contact?.emailErr) && (<><span style={css("color:#D33A3A;font:600 12px 'Barlow',sans-serif")}>{$.contact?.emailErr}</span></>)}
          </label>
          <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>WhatsApp
            <input type="tel" value={$.contact?.wa} onChange={$.contact?.onWa} placeholder="3878-000000" style={css(`height:48px;border:1.5px solid ${$.contact?.waBd ?? ''};border-radius:12px;padding:0 12px;font:500 15px 'Barlow',sans-serif;width:100%`)} />
            {!!($.contact?.waErr) && (<><span style={css("color:#D33A3A;font:600 12px 'Barlow',sans-serif")}>{$.contact?.waErr}</span></>)}
          </label>
        </div>
      </div>
    </div>
    </div>
    <div style={css("position:sticky;bottom:0;z-index:10;margin-top:16px;background:#fff;border-top:1px solid #F0E8EC")}>
      <div style={css("max-width:1100px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px")}>
        <div><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Total</div><div style={css("font:800 26px/1 'Barlow Condensed',sans-serif")}>{$.sum?.total}</div></div>
        <button onClick={$.toResumen} style={css("height:56px;padding:0 22px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 17px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Continuar al pago</button>
      </div>
    </div>
  </>)}

  
  {!!($.s?.resumen) && (<>
    <div style={css("max-width:640px;margin:0 auto;padding:16px 16px 48px;display:flex;flex-direction:column;gap:16px")}>
      <button onClick={$.nav?.backDatos} style={css("align-self:flex-start;border:none;background:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;font:600 14px 'Barlow',sans-serif;color:#E4007C")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>arrow_back</span>Editar pasajeros</button>
      <div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Resumen de tu compra</div>
      {(Array.isArray($.sum?.legs) ? $.sum?.legs : []).map((l: any, $index: number) => (<React.Fragment key={$index}>
        <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:10px")}>
          <div style={css("display:flex;justify-content:space-between;gap:8px;align-items:center")}><span style={css("background:#E4007C;color:#fff;border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif")}>{l?.kind}</span><span style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{l?.line} · {l?.car}</span></div>
          <div style={css("font:800 22px/1.05 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{l?.route}</div>
          <div style={css("font:600 14px/1.4 'Barlow',sans-serif")}>{l?.when}</div>
          <div style={css("display:flex;flex-direction:column;gap:6px;border-top:1px solid #F3EDF0;padding-top:10px")}>
            {(Array.isArray(l?.rows) ? l?.rows : []).map((r: any, $index: number) => (<React.Fragment key={$index}>
              <div style={css("display:flex;justify-content:space-between;gap:8px;font:500 14px 'Barlow',sans-serif")}><span>{r?.name} · Asiento {r?.seat} {r?.cls}</span><strong>{r?.price}</strong></div>
            </React.Fragment>))}
          </div>
        </div>
      </React.Fragment>))}
      <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:8px")}>
        {!!($.sum?.hasSaving) && (<>
          <div style={css("display:flex;align-items:center;gap:8px;background:#DDF3E8;color:#147A52;border-radius:12px;padding:10px 12px;font:700 14px 'Barlow',sans-serif")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>savings</span>{$.sum?.saving}</div>
        </>)}
        <div style={css("display:flex;justify-content:space-between;align-items:baseline;gap:8px")}><span style={css("font:600 15px 'Barlow',sans-serif")}>Total a pagar</span><span style={css("font:900 36px 'Barlow Condensed',sans-serif;color:#E4007C")}>{$.sum?.total}</span></div>
        <div style={css("font:500 12.5px 'Barlow',sans-serif;color:#6B6468")}>Contacto: {$.sum?.contact}</div>
      </div>
      <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:8px;font:500 13px/1.5 'Barlow',sans-serif;color:#4A4447")}>
        <div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase;color:#1D1A1C")}>Condiciones del pasaje</div>
        {!!($.sum?.rt) && (<div style={css("background:#FFF4DB;color:#8A5A00;border-radius:10px;padding:8px 10px;font-weight:600")}>{$.sum?.rtRules}</div>)}
        {!($.sum?.rt) && (<>
          <div>Cancelaciones y reprogramaciones, con retención según la anticipación:</div>
          {($.sum?.policy || []).map((r: any, k: number) => (<div key={k} style={css("display:flex;justify-content:space-between;gap:8px;padding:6px 10px;background:#F8F5F6;border-radius:8px;font-weight:600")}><span>{r.when}</span><span>Retención {r.pct}</span></div>))}
          <div>Los cambios se pueden pedir hasta 3 h antes de la salida. Los pasajes pagados con tarjeta de crédito no admiten devolución bajo ningún término.</div>
        </>)}
        <div><strong>Equipaje:</strong> {$.sum?.baggage}</div>
      </div>
      <button onClick={$.toMp} style={css("height:56px;border:none;border-radius:14px;background:#00A6E6;color:#fff;font:800 17px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 10px 24px -12px rgba(0,120,190,.7)")}><span style={css("font-family:'Material Symbols Rounded';font-size:22px")}>lock</span>Pagar con MercadoPago</button>
      <div style={css("font:500 12px 'Barlow',sans-serif;color:#716A6E;text-align:center")}>Tarjeta, dinero en cuenta o efectivo en Rapipago / Pago Fácil.</div>
    </div>
  </>)}

  
  {!!($.s?.mp) && (<>
    <div style={css("min-height:100%;background:#EEF3F7")}>
      <div style={css("background:#00A6E6;color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px")}>
        <div style={css("font:800 17px 'Barlow',sans-serif")}>MercadoPago <span style={css("font:500 12px 'Barlow',sans-serif;opacity:.85")}>· checkout simulado</span></div>
        <button onClick={$.nav?.backResumen} style={css("border:none;background:rgba(255,255,255,.2);color:#fff;border-radius:999px;height:40px;padding:0 12px;font:700 12px 'Barlow',sans-serif;cursor:pointer")}>Volver</button>
      </div>
      <div style={css("max-width:520px;margin:0 auto;padding:16px;display:flex;flex-direction:column;gap:12px")}>
        <div style={css("background:#fff;border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:8px")}>
          <div><div style={css("font:500 12px 'Barlow',sans-serif;color:#5B6670")}>Expreso Sofía · {$.mp?.items}</div><div style={css("font:800 28px 'Barlow',sans-serif;color:#1D2A33")}>{$.sum?.total}</div><div style={css("font:600 12px/1.4 'Barlow',sans-serif;color:#1D2A33;margin-top:2px")}>{$.mp?.trip}</div></div>
          <img src="/assets/logo.png" alt="" style={css("height:36px")} />
        </div>
        <div style={css("font:700 15px 'Barlow',sans-serif;color:#1D2A33;margin-top:4px")}>¿Cómo querés pagar?</div>
        {(Array.isArray($.mp?.methods) ? $.mp?.methods : []).map((m: any, $index: number) => (<React.Fragment key={$index}>
          <button onClick={m?.on} style={css(`background:#fff;border-radius:14px;padding:14px 16px;border:2px solid ${m?.bd ?? ''};display:flex;align-items:center;gap:12px;cursor:pointer;text-align:left`)}>
            <span style={css("width:40px;height:40px;border-radius:50%;background:#E6F6FD;color:#0089C2;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:22px")}>{m?.icon}</span>
            <span style={css("flex:1;display:flex;flex-direction:column")}><span style={css("font:700 15px 'Barlow',sans-serif;color:#1D2A33")}>{m?.label}</span><span style={css("font:500 12.5px 'Barlow',sans-serif;color:#5B6670")}>{m?.desc}</span></span>
            <span style={css(`width:20px;height:20px;border-radius:50%;border:2px solid ${m?.bd ?? ''};background:${m?.dot ?? ''}`)}></span>
          </button>
        </React.Fragment>))}
        {!!($.mp?.isCredit) && (<div style={css("background:#FFF4DB;color:#8A5A00;border-radius:12px;padding:10px 12px;font:600 13px/1.45 'Barlow',sans-serif")}>Los pasajes pagados con tarjeta de crédito no admiten devolución bajo ningún término.</div>)}
        {!!($.mp?.isCard) && (<>
          <div onKeyDown={submitOnEnter($.mp?.pay)} style={css("background:#fff;border-radius:14px;padding:14px 16px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px")}>
            <label style={css("grid-column:1 / -1;display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#5B6670")}>Número de tarjeta<input value="4509 9535 6623 3704" readOnly style={css("height:48px;width:100%;min-width:0;border:1.5px solid #D5DEE5;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;letter-spacing:.06em")} /></label>
            <label style={css("grid-column:1 / -1;display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#5B6670")}>Nombre del titular<input value={$.mp?.holder} readOnly style={css("height:48px;width:100%;min-width:0;border:1.5px solid #D5DEE5;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif")} /></label>
            <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#5B6670")}>Vencimiento<input value="11/29" readOnly style={css("height:48px;width:100%;min-width:0;border:1.5px solid #D5DEE5;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif")} /></label>
            <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#5B6670")}>Código de seguridad<input value="123" readOnly style={css("height:48px;width:100%;min-width:0;border:1.5px solid #D5DEE5;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif")} /></label>
            <label style={css("grid-column:1 / -1;display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#5B6670")}>Cuotas<select style={css("height:48px;width:100%;min-width:0;border:1.5px solid #D5DEE5;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff")}><option>1 cuota de {$.sum?.total}</option><option>3 cuotas</option><option>6 cuotas</option></select></label>
          </div>
        </>)}
        {!!($.mp?.isCash) && (<>
          <div style={css("background:#fff;border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:10px")}>
            <div style={css("display:flex;gap:8px")}>
              {(Array.isArray($.mp?.nets) ? $.mp?.nets : []).map((n: any, $index: number) => (<React.Fragment key={$index}>
                <button onClick={n?.on} style={css(`flex:1;height:48px;border-radius:10px;border:2px solid ${n?.bd ?? ''};background:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer;color:#1D2A33`)}>{n?.label}</button>
              </React.Fragment>))}
            </div>
            <div style={css("font:500 12.5px/1.45 'Barlow',sans-serif;color:#5B6670")}>Te damos un código para pagar en efectivo. Tus asientos quedan reservados hasta que se acredite el pago (plazo: 2 horas).</div>
          </div>
        </>)}
        {!!($.mp?.isAccount) && (<>
          <div style={css("background:#fff;border-radius:14px;padding:14px 16px;font:500 13.5px 'Barlow',sans-serif;color:#1D2A33")}>Disponible en tu cuenta: <strong>$148.320,50</strong></div>
        </>)}
        <button onClick={$.mp?.pay} style={css("height:56px;border:none;border-radius:12px;background:#00A6E6;color:#fff;font:800 17px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:4px")}>
          {!!($.paying) && (<><span style={css("width:20px;height:20px;border:3px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:sofspin .8s linear infinite")}></span></>)}
          {$.mp?.btn}
        </button>
      </div>
    </div>
  </>)}

  
  {!!($.s?.ok) && (<>
    <div style={css("max-width:880px;margin:0 auto;padding:20px 16px 48px;display:flex;flex-direction:column;gap:18px;align-items:center")}>
      <div style={css("width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:42px;box-shadow:0 14px 30px -12px rgba(228,0,124,.7)")}>check</div>
      <div style={css("text-align:center;display:flex;flex-direction:column;gap:6px")}>
        <div style={css("font:400 30px/1.1 'Kaushan Script',cursive;color:#E4007C")}>¡Listo, ya tenés tu pasaje!</div>
        <div style={css("font:500 14px 'Barlow',sans-serif;color:#4A4447")}>Pago aprobado. Te enviamos el boleto a <strong>{$.conf?.email}</strong>.</div>
      </div>
      <div style={css("background:#fff;border-radius:18px;border:1px solid #F0E9ED;padding:12px 18px;text-align:center")}><div style={css("font:600 11px 'Barlow',sans-serif;letter-spacing:.12em;color:#716A6E")}>CÓDIGO DE RESERVA</div><div style={css("font:900 34px/1.1 'Barlow Condensed',sans-serif;letter-spacing:.06em")}>{$.conf?.code}</div></div>
      <div style={css("display:flex;flex-wrap:wrap;gap:8px;justify-content:center")}>
        <button onClick={$.act?.pdf} style={css("height:48px;padding:0 16px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:19px")}>download</span>Descargar PDF</button>
        <button onClick={$.act?.mail} style={css("height:48px;padding:0 16px;border:1.5px solid #E4007C;border-radius:999px;background:#fff;color:#E4007C;font:700 14px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:19px")}>mail</span>Enviar por email</button>
        <button onClick={$.act?.share} style={css("height:48px;padding:0 16px;border:none;border-radius:999px;background:#25D366;color:#0B3B1E;font:700 14px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:19px")}>share</span>Compartir por WhatsApp</button>
      </div>
      <div style={css("display:flex;background:#EFE9EC;border-radius:999px;padding:4px")}>
        <button onClick={$.conf?.tabBoleto} style={css(`height:40px;padding:0 16px;border:none;border-radius:999px;cursor:pointer;font:700 13px 'Barlow',sans-serif;background:${$.conf?.bBg ?? ''};color:${$.conf?.bFg ?? ''}`)}>Boleto virtual</button>
        <button onClick={$.conf?.tabEmail} style={css(`height:40px;padding:0 16px;border:none;border-radius:999px;cursor:pointer;font:700 13px 'Barlow',sans-serif;background:${$.conf?.eBg ?? ''};color:${$.conf?.eFg ?? ''}`)}>Email de confirmación</button>
      </div>
      {!!($.conf?.showBoleto) && (<>
        <div style={css("display:flex;flex-wrap:wrap;gap:20px;justify-content:center;width:100%")}>
          {(Array.isArray($.conf?.tickets) ? $.conf?.tickets : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
            <div><Boleto t={t} /></div>
          </React.Fragment>))}
        </div>
      </>)}
      {!!($.conf?.showEmail) && (<>
        <div style={css("width:100%;max-width:620px;background:#fff;border-radius:16px;border:1px solid #E6DEE2;overflow:hidden;box-shadow:0 18px 50px -24px rgba(0,0,0,.3)")}>
          <div style={css("padding:12px 16px;border-bottom:1px solid #EFE8EC;display:flex;flex-direction:column;gap:4px;font:500 13px 'Barlow',sans-serif;color:#4A4447;background:#FAF8F9")}>
            <div><strong style={css("color:#1D1A1C")}>De:</strong> Expreso Sofía &lt;pasajes@expresosofia.com.ar&gt;</div>
            <div><strong style={css("color:#1D1A1C")}>Para:</strong> {$.conf?.email}</div>
            <div><strong style={css("color:#1D1A1C")}>Asunto:</strong> {$.conf?.subject}</div>
          </div>
          <div style={css("background:linear-gradient(135deg,#C2006A,#E4007C);padding:22px;text-align:center")}><div style={css("display:inline-flex;background:#fff;border-radius:14px;padding:8px 14px")}><img src="/assets/logo.png" alt="Expreso Sofía" style={css("height:52px")} /></div></div>
          <div style={css("padding:22px;display:flex;flex-direction:column;gap:14px;font:500 15px/1.55 'Barlow',sans-serif;color:#1D1A1C")}>
            <div style={css("font:800 24px/1.1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>¡Hola {$.conf?.first}! Tu pasaje está confirmado</div>
            <div>Gracias por viajar con nosotros. Abajo tenés el resumen y adjuntamos tu boleto en PDF. Mostralo desde el celular o impreso al subir.</div>
            <div style={css("background:#F8F5F6;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px")}>
              <div style={css("display:flex;justify-content:space-between;gap:8px")}><span style={css("color:#6B6468")}>Reserva</span><strong>{$.conf?.code}</strong></div>
              {(Array.isArray($.conf?.tickets) ? $.conf?.tickets : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
                <div style={css("display:flex;justify-content:space-between;gap:8px;border-top:1px solid #EDE5E9;padding-top:8px;font-size:14px")}><span>{t?.name} · {t?.route}<br /><span style={css("color:#6B6468")}>{t?.date}, {t?.time} hs · Asiento {t?.seat} ({t?.cls})</span></span><strong>{t?.price}</strong></div>
              </React.Fragment>))}
            </div>
            <div style={css("display:flex;align-items:center;gap:10px;border:1.5px solid #EDE5E9;border-radius:12px;padding:10px 12px;align-self:flex-start")}><span style={css("width:36px;height:36px;border-radius:8px;background:#D33A3A;color:#fff;display:flex;align-items:center;justify-content:center;font:800 11px 'Barlow',sans-serif")}>PDF</span><div><div style={css("font:700 14px 'Barlow',sans-serif")}>Boleto-{$.conf?.code}.pdf</div><div style={css("font:500 12px 'Barlow',sans-serif;color:#6B6468")}>142 KB</div></div></div>
            <div style={css("background:#FDE6F2;color:#A3005A;border-radius:12px;padding:12px;font:700 14px 'Barlow',sans-serif")}>Presentate 15 minutos antes en tu parada con tu DNI.</div>
            <div style={css("font-size:13px;color:#6B6468")}>¿Necesitás cambiar algo? Entrá a Mis pasajes con tu código y DNI, o escribinos al 3878-804506.</div>
            <div style={css("font:400 20px 'Kaushan Script',cursive;color:#E4007C;text-align:center;padding-top:6px")}>Conectando personas, uniendo destinos</div>
          </div>
        </div>
      </>)}
      <button onClick={$.nav?.mis} style={css("border:none;background:none;cursor:pointer;font:700 14px 'Barlow',sans-serif;color:#E4007C;text-decoration:underline")}>Ver en Mis pasajes</button>
    </div>
  </>)}

  {!!($.s?.pendiente) && (<>
    <div style={css("max-width:560px;margin:0 auto;padding:24px 16px 48px;display:flex;flex-direction:column;gap:16px")}>
      <div style={css("width:68px;height:68px;border-radius:50%;background:#FFF4DB;color:#E59A0B;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:38px;align-self:center")}>schedule</div>
      <div style={css("text-align:center")}><div style={css("font:800 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Pago pendiente</div><div style={css("font:500 14px 'Barlow',sans-serif;color:#4A4447;margin-top:6px")}>Tus asientos están reservados hasta que pagues en efectivo.</div></div>
      <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:18px;display:flex;flex-direction:column;gap:12px")}>
        <div style={css("display:flex;justify-content:space-between;gap:8px")}><span style={css("font:600 13px 'Barlow',sans-serif;color:#6B6468")}>Reserva</span><strong style={css("font:800 18px 'Barlow Condensed',sans-serif")}>{$.conf?.code}</strong></div>
        <div style={css("display:flex;justify-content:space-between;gap:8px")}><span style={css("font:600 13px 'Barlow',sans-serif;color:#6B6468")}>Monto</span><strong style={css("font:800 18px 'Barlow Condensed',sans-serif")}>{$.conf?.total}</strong></div>
        <div style={css("background:#F8F5F6;border-radius:14px;padding:14px;text-align:center")}><div style={css("font:600 11px 'Barlow',sans-serif;letter-spacing:.12em;color:#716A6E")}>CÓDIGO PARA PAGAR EN {$.conf?.net}</div><div style={css("font:800 30px 'Barlow Condensed',sans-serif;letter-spacing:.1em")}>{$.conf?.payCode}</div></div>
        <div style={css("display:flex;align-items:center;gap:8px;background:#FFF4DB;color:#8A5A00;border-radius:12px;padding:10px 12px;font:700 13.5px 'Barlow',sans-serif")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>timer</span>Pagá antes de hoy a las 22:30 hs. Si no, se liberan los asientos.</div>
        <ol style={css("margin:0;padding-left:18px;font:500 14px/1.6 'Barlow',sans-serif;color:#4A4447")}><li>Acercate a cualquier {$.conf?.net}.</li><li>Decí que pagás un cobro de MercadoPago y mostrá el código.</li><li>Cuando se acredite te llega el boleto por email y WhatsApp.</li></ol>
      </div>
      <button onClick={$.act?.share} style={css("height:48px;border:1.5px solid #E4007C;border-radius:999px;background:#fff;color:#E4007C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Enviarme el código por WhatsApp</button>
      <button onClick={$.nav?.home} style={css("border:none;background:none;cursor:pointer;font:700 14px 'Barlow',sans-serif;color:#6B6468")}>Volver al inicio</button>
    </div>
  </>)}

  {!!($.s?.rechazado) && (<>
    <div style={css("max-width:520px;margin:0 auto;padding:24px 16px 48px;display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center")}>
      <div style={css("width:68px;height:68px;border-radius:50%;background:#FBE3E3;color:#D33A3A;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:38px")}>close</div>
      <div style={css("font:800 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>El pago fue rechazado</div>
      <div style={css("font:500 14px/1.55 'Barlow',sans-serif;color:#4A4447;max-width:380px")}>MercadoPago no pudo procesar el pago. Puede ser por fondos insuficientes o datos de la tarjeta. Tus asientos siguen reservados mientras corre el contador.</div>
      <div style={css("display:flex;flex-direction:column;gap:8px;width:100%;max-width:340px")}>
        <button onClick={$.toMp} style={css("height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 17px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Reintentar el pago</button>
        <button onClick={$.act?.wa} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#1D1A1C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Pedir ayuda por WhatsApp</button>
      </div>
    </div>
  </>)}

  {!!($.s?.vencido) && (<>
    <div style={css("max-width:520px;margin:0 auto;padding:24px 16px 48px;display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center")}>
      <div style={css("width:68px;height:68px;border-radius:50%;background:#F1ECEF;color:#6B6468;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:38px")}>timer_off</div>
      <div style={css("font:800 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Se venció el tiempo de reserva</div>
      <div style={css("font:500 14px/1.55 'Barlow',sans-serif;color:#4A4447;max-width:380px")}>Pasaron los 10 minutos y liberamos los asientos para otros pasajeros. No se hizo ningún cobro. Podés volver a elegirlos si siguen libres.</div>
      <button onClick={$.restart} style={css("height:56px;padding:0 24px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 17px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Volver a buscar</button>
    </div>
  </>)}

  
  {!!($.s?.mis) && (<>
    <div style={css("max-width:640px;margin:0 auto;padding:20px 16px 48px;display:flex;flex-direction:column;gap:16px")}>
      <div><div style={css("font:600 12px 'Barlow',sans-serif;color:#E4007C;letter-spacing:.08em")}>SIN CUENTA, SIN VUELTAS</div><div style={css("font:800 32px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Mis pasajes</div></div>
      <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:12px")}>
        <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Código de reserva<input value={$.lk?.code} onChange={$.lk?.onCode} onKeyDown={submitOnEnter($.lk?.submit)} autoComplete="off" spellCheck={false} autoCapitalize="characters" placeholder="SOF-XXXXX" style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:700 15px 'Barlow',sans-serif;text-transform:uppercase;letter-spacing:.06em")} /></label>
        <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>DNI o email del pasajero<input value={$.lk?.id} onChange={$.lk?.onId} onKeyDown={submitOnEnter($.lk?.submit)} spellCheck={false} placeholder="32456789" style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:500 15px 'Barlow',sans-serif")} /></label>
        {!!($.lk?.error) && (<><div style={css("background:#FBE3E3;color:#B22A2A;border-radius:10px;padding:10px 12px;font:600 13px 'Barlow',sans-serif")}>{$.lk?.error}</div></>)}
        <button onClick={$.lk?.submit} style={css("height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 17px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px")}>
          {!!($.lk?.loading) && (<><span style={css("width:18px;height:18px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:sofspin .8s linear infinite")}></span></>)}Consultar</button>
        <div style={css("font:500 12.5px 'Barlow',sans-serif;color:#716A6E")}>Para la demo probá <button onClick={$.lk?.demo1} style={css("border:none;background:none;padding:0;color:#E4007C;font:700 12.5px 'Barlow',sans-serif;cursor:pointer;text-decoration:underline")}>SOF-4KD72 + 32456789</button> (reprogramable) o <button onClick={$.lk?.demo2} style={css("border:none;background:none;padding:0;color:#E4007C;font:700 12.5px 'Barlow',sans-serif;cursor:pointer;text-decoration:underline")}>SOF-9XR31 + 38112450</button> (sale en menos de 24 h).</div>
      </div>
      {(Array.isArray($.lk?.results) ? $.lk?.results : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
        <button onClick={t?.open} style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:8px;cursor:pointer;text-align:left;width:100%")}>
          <div style={css("display:flex;justify-content:space-between;gap:8px;align-items:center;width:100%")}><span style={css("font:700 12px 'Barlow',sans-serif;color:#6B6468")}>{t?.line} · {t?.code}</span><span style={css(`border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif;background:${t?.sBg ?? ''};color:${t?.sFg ?? ''}`)}>{t?.sLabel}</span></div>
          <div style={css("font:800 22px/1.05 'Barlow Condensed',sans-serif;text-transform:uppercase;color:#1D1A1C")}>{t?.route}</div>
          <div style={css("font:600 14px 'Barlow',sans-serif;color:#1D1A1C")}>{t?.date} · {t?.time} hs · Asiento {t?.seat}</div>
          <div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>{t?.name} · DNI {t?.dni}</div>
        </button>
      </React.Fragment>))}
    </div>
  </>)}

  {!!($.s?.detalle) && (<>
    <div style={css("max-width:880px;margin:0 auto;padding:16px 16px 48px;display:flex;flex-direction:column;gap:16px")}>
      <button onClick={$.nav?.mis} style={css("align-self:flex-start;border:none;background:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;font:600 14px 'Barlow',sans-serif;color:#E4007C")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>arrow_back</span>Mis pasajes</button>
      {!!($.det?.companyCancel) && (<>
        <div style={css("background:#FBE3E3;color:#8E1F1F;border-radius:16px;padding:14px;display:flex;gap:10px;align-items:flex-start")}><span style={css("font-family:'Material Symbols Rounded';font-size:24px")}>report</span><div><div style={css("font:800 16px 'Barlow',sans-serif")}>La empresa canceló este viaje</div><div style={css("font:500 13.5px/1.5 'Barlow',sans-serif")}>Lo sentimos. Podés reprogramar sin cargo o pedir el reembolso total de lo que pagaste.</div></div></div>
      </>)}
      {!!($.det?.inactive) && (<>
        <div style={css("background:#F1ECEF;color:#4A4447;border-radius:16px;padding:14px;font:600 14px 'Barlow',sans-serif")}>{$.det?.inactiveText}</div>
      </>)}
      <div style={css("display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;justify-content:center")}>
        <div><Boleto t={$.det?.v} /></div>
        <div style={css("flex:1 1 260px;display:flex;flex-direction:column;gap:10px")}>
          <div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>¿Necesitás un cambio?</div>
          {!!($.det?.canAct) && (<>
            <button onClick={$.det?.reprog} style={css("height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 16px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>event_repeat</span>Reprogramar</button>
            <button onClick={$.det?.cancel} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#B22A2A;font:700 15px 'Barlow',sans-serif;cursor:pointer")}>Cancelar pasaje</button>
          </>)}
          <button onClick={$.act?.pdf} style={css("height:48px;border:none;border-radius:999px;background:#F1ECEF;color:#1D1A1C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Descargar PDF</button>
          {!!($.det?.isRt) && (<div style={css("background:#FFF4DB;color:#8A5A00;border-radius:12px;padding:10px 12px;font:600 13px/1.45 'Barlow',sans-serif")}>{$.det?.rtRules}</div>)}
          {!!($.det?.credit) && (<div style={css("background:#FFF4DB;color:#8A5A00;border-radius:12px;padding:10px 12px;font:600 13px/1.45 'Barlow',sans-serif")}>Pagado con tarjeta de crédito: no admite devolución bajo ningún término. Podés reprogramarlo hasta 3 h antes de la salida.</div>)}
          <div style={css("font:500 12.5px/1.5 'Barlow',sans-serif;color:#6B6468")}>Cancelación y reprogramación con retención del 10% (más de 48 h antes de la salida), 20% (entre 24 y 48 h) o 30% (dentro de las 24 h previas). Los cambios se piden hasta 3 h antes de la salida.</div>
          <div style={css("font:500 12.5px/1.5 'Barlow',sans-serif;color:#6B6468")}><strong>Equipaje:</strong> {$.det?.baggage}</div>
        </div>
      </div>
    </div>
  </>)}

  
  {!!($.s?.rp) && (<>
    <div style={css("max-width:880px;margin:0 auto;padding:16px 16px 48px;display:flex;flex-direction:column;gap:16px")}>
      <button onClick={$.nav?.detalle} style={css("align-self:flex-start;border:none;background:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;font:600 14px 'Barlow',sans-serif;color:#E4007C")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>arrow_back</span>Volver al pasaje</button>
      <div><div style={css("font:600 12px 'Barlow',sans-serif;color:#E4007C;letter-spacing:.08em")}>REPROGRAMAR · {$.rp?.code}</div><div style={css("font:800 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.rp?.title}</div></div>
      {!!($.rp?.blocked) && (<>
        <div style={css("background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:24px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center")}>
          <span style={css("width:60px;height:60px;border-radius:50%;background:#F1ECEF;color:#6B6468;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:30px")}>lock_clock</span>
          <div style={css("font:800 22px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.rp?.blockedTitle}</div>
          <div style={css("font:500 14px/1.55 'Barlow',sans-serif;color:#4A4447;max-width:400px")}>{$.rp?.blockedText}</div>
          <button onClick={$.act?.wa} style={css("height:48px;padding:0 20px;border:none;border-radius:999px;background:#25D366;color:#0B3B1E;font:800 15px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>chat</span>Escribinos por WhatsApp</button>
        </div>
      </>)}
      {!!($.rp?.open) && (<>
        <div style={css("background:#FDF2F8;border:1px solid #F7CFE3;border-radius:16px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;font:500 13.5px/1.5 'Barlow',sans-serif;color:#5C0033")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px;color:#E4007C")}>policy</span><span>{$.rp?.policy}</span></div>
        <div style={css("display:flex;gap:6px")}>
          {(Array.isArray($.rp?.steps) ? $.rp?.steps : []).map((x: any, $index: number) => (<React.Fragment key={$index}><div style={css(`flex:1;height:5px;border-radius:5px;background:${x ?? ''}`)}></div></React.Fragment>))}
        </div>
        {!!($.rp?.step1) && (<>
          <div style={css("font:700 15px 'Barlow',sans-serif")}>1. Elegí la nueva fecha y viaje</div>
          <div style={css("display:flex;gap:8px;overflow-x:auto;padding-bottom:6px")}>
            {(Array.isArray($.rp?.days) ? $.rp?.days : []).map((d: any, $index: number) => (<React.Fragment key={$index}>
              <button onClick={d?.on} disabled={d?.disabled} style={css(`flex:none;width:66px;padding:8px 4px;border-radius:14px;border:1.5px solid ${d?.bd ?? ''};background:${d?.bg ?? ''};color:${d?.fg ?? ''};cursor:${d?.cursor ?? ''};display:flex;flex-direction:column;align-items:center;gap:1px;opacity:${d?.op ?? ''}`)}><span style={css("font:600 11px 'Barlow',sans-serif;text-transform:uppercase")}>{d?.dow}</span><span style={css("font:800 22px/1.1 'Barlow Condensed',sans-serif")}>{d?.day}</span><span style={css(`font:700 9.5px 'Barlow',sans-serif;color:${d?.tagFg ?? ''}`)}>{d?.tag}</span></button>
            </React.Fragment>))}
          </div>
          {(Array.isArray($.rp?.trips) ? $.rp?.trips : []).map((c: any, $index: number) => (<React.Fragment key={$index}>
            <button onClick={c?.onPick} disabled={c?.disabled} style={css(`background:#fff;border-radius:18px;border:1.5px solid #F0E9ED;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;text-align:left;opacity:${c?.op ?? ''}`)}>
              <div><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{c?.line} · {c?.date}</div><div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;color:#1D1A1C")}>{c?.time} hs</div><div style={css("font:500 12.5px 'Barlow',sans-serif;color:#4B2C82")}>{c?.when}</div></div>
              <div style={css("text-align:right;font:700 12.5px/1.6 'Barlow',sans-serif;color:#4A4447")}>{c?.semi}<br />{c?.cama}</div>
            </button>
          </React.Fragment>))}
          {!!($.rp?.noTrips) && <EmptyState boxed icon="event_busy" title="No hay viajes disponibles ese día" text="Probá con otra fecha." />}
        </>)}
        {!!($.rp?.step2) && (<>
          <div style={css("display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap")}><div style={css("font:700 15px 'Barlow',sans-serif")}>2. Elegí tu nuevo asiento · {$.rp?.tripLabel}</div><button onClick={$.rp?.back1} style={css("border:none;background:none;color:#E4007C;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Cambiar viaje</button></div>
          <div style={css("display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start")}>
            <div style={css("flex:1 1 320px;background:#fff;border-radius:20px;border:1px solid #F0E9ED;padding:16px;display:flex;justify-content:center")}>
              <div><SeatMap seats={$.rp?.seats} selected={$.rp?.selected} onToggle={$.rp?.toggle} mode="buy" layout={$.seat?.layout} /></div>
            </div>
            <div style={css("flex:1 1 240px;display:flex;flex-direction:column;gap:10px")}>
              <div style={css("background:#fff;border-radius:16px;border:1px solid #F0E9ED;padding:14px;font:600 14px 'Barlow',sans-serif")}>{$.rp?.seatLabel}</div>
              <button onClick={$.rp?.toStep3} disabled={$.rp?.noSeat} style={css(`height:56px;border:none;border-radius:999px;background:${$.rp?.nextBg ?? ''};color:#fff;font:800 16px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer`)}>Ver resumen</button>
            </div>
          </div>
        </>)}
        {!!($.rp?.step3) && (<>
          <div style={css("font:700 15px 'Barlow',sans-serif")}>3. Confirmá el cambio</div>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px")}>
            <div style={css("background:#F1ECEF;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:4px")}><div style={css("font:700 11px 'Barlow',sans-serif;letter-spacing:.1em;color:#6B6468")}>VIAJE ACTUAL</div><div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase;text-decoration:line-through;color:#6B6468")}>{$.rp?.oldWhen}</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>{$.rp?.oldSeat}</div></div>
            <div style={css("background:#fff;border:2px solid #E4007C;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:4px")}><div style={css("font:700 11px 'Barlow',sans-serif;letter-spacing:.1em;color:#E4007C")}>NUEVO VIAJE</div><div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.rp?.newWhen}</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#4A4447")}>{$.rp?.newSeat}</div></div>
          </div>
          <div style={css("background:#fff;border-radius:18px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:8px;font:500 14px 'Barlow',sans-serif")}>
            <div style={css("display:flex;justify-content:space-between")}><span>{$.rp?.feeLabel}</span><strong>{$.rp?.fee}</strong></div>
            <div style={css("display:flex;justify-content:space-between")}><span>Diferencia de tarifa</span><strong>{$.rp?.diff}</strong></div>
            <div style={css("display:flex;justify-content:space-between;border-top:1px solid #F3EDF0;padding-top:8px;align-items:baseline")}><span style={css("font-weight:700")}>Total a pagar</span><strong style={css("font:900 30px 'Barlow Condensed',sans-serif;color:#E4007C")}>{$.rp?.total}</strong></div>
          </div>
          <button onClick={$.rp?.confirm} style={css("height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 17px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px")}>{!!($.paying) && (<><span style={css("width:18px;height:18px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:sofspin .8s linear infinite")}></span></>)}{$.rp?.confirmLabel}</button>
        </>)}
      </>)}
    </div>
  </>)}

  {!!($.s?.rpOk) && (<>
    <div style={css("max-width:640px;margin:0 auto;padding:20px 16px 48px;display:flex;flex-direction:column;gap:16px;align-items:center")}>
      <div style={css("width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:38px")}>event_available</div>
      <div style={css("font:400 28px 'Kaushan Script',cursive;color:#E4007C;text-align:center")}>¡Listo, reprogramaste tu viaje!</div>
      <div style={css("font:500 14px 'Barlow',sans-serif;color:#4A4447;text-align:center")}>Este es tu nuevo boleto. El anterior quedó sin efecto.</div>
      <div style={css("width:100%;display:flex;justify-content:center")}><Boleto t={$.rpOk} /></div>
      <button onClick={$.act?.pdf} style={css("height:48px;padding:0 18px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Descargar nuevo boleto</button>
    </div>
  </>)}

  
  {!!($.s?.cx) && (<>
    <div style={css("max-width:600px;margin:0 auto;padding:16px 16px 48px;display:flex;flex-direction:column;gap:16px")}>
      <button onClick={$.nav?.detalle} style={css("align-self:flex-start;border:none;background:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;font:600 14px 'Barlow',sans-serif;color:#E4007C")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>arrow_back</span>Volver al pasaje</button>
      <div><div style={css("font:600 12px 'Barlow',sans-serif;color:#E4007C;letter-spacing:.08em")}>CANCELAR · {$.cx?.code}</div><div style={css("font:800 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Cancelar pasaje</div></div>
      <div style={css("background:#fff;border-radius:18px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:8px")}>
        <div style={css("font:700 14px 'Barlow',sans-serif")}>Política de cancelación</div>
        {(Array.isArray($.cx?.rules) ? $.cx?.rules : []).map((r: any, $index: number) => (<React.Fragment key={$index}>
          <div style={css(`display:flex;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:10px;background:${r?.bg ?? ''};font:600 13.5px 'Barlow',sans-serif;color:${r?.fg ?? ''}`)}><span>{r?.when}</span><span>{r?.pct}</span></div>
        </React.Fragment>))}
        <div style={css("font:500 12.5px 'Barlow',sans-serif;color:#6B6468")}>{$.cx?.hoursText}</div>
      </div>
      {!!($.cx?.blocked) && (<>
        <div style={css("background:#fff;border-radius:18px;border:1px solid #F0E9ED;padding:20px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center")}>
          <div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.cx?.blockedTitle}</div>
          <div style={css("font:500 14px/1.5 'Barlow',sans-serif;color:#4A4447")}>{$.cx?.blockedText}</div>
          {!!($.cx?.canReprog) && (<button onClick={$.cx?.reprog} style={css("height:48px;padding:0 18px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 15px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Reprogramar pasaje</button>)}
          <button onClick={$.act?.wa} style={css("height:48px;padding:0 18px;border:none;border-radius:999px;background:#25D366;color:#0B3B1E;font:800 15px 'Barlow',sans-serif;cursor:pointer")}>Escribinos por WhatsApp</button>
        </div>
      </>)}
      {!!($.cx?.open) && (<>
        <div style={css("background:#fff;border-radius:18px;border:1px solid #F0E9ED;padding:16px;display:flex;flex-direction:column;gap:8px;font:500 14px 'Barlow',sans-serif")}>
          <div style={css("font:700 14px 'Barlow',sans-serif")}>{$.cx?.trip}</div>
          <div style={css("display:flex;justify-content:space-between")}><span>Pagaste</span><strong>{$.cx?.paid}</strong></div>
          <div style={css("display:flex;justify-content:space-between")}><span>{$.cx?.feeLabel}</span><strong>{$.cx?.fee}</strong></div>
          <div style={css("display:flex;justify-content:space-between;border-top:1px solid #F3EDF0;padding-top:8px;align-items:baseline")}><span style={css("font-weight:700")}>Te devolvemos</span><strong style={css("font:900 30px 'Barlow Condensed',sans-serif;color:#147A52")}>{$.cx?.refund}</strong></div>
          <div style={css("font:500 12.5px 'Barlow',sans-serif;color:#6B6468")}>{$.cx?.where}</div>
        </div>
        <button onClick={$.cx?.toggleAck} style={css("display:flex;gap:10px;align-items:flex-start;border:none;background:none;padding:0;cursor:pointer;text-align:left")}>
          <span style={css(`flex:none;width:22px;height:22px;border-radius:6px;border:2px solid #D33A3A;background:${$.cx?.ackBg ?? ''};color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:16px`)}>{$.cx?.ackMark}</span>
          <span style={css("font:600 14px/1.45 'Barlow',sans-serif;color:#1D1A1C")}>Entiendo que el pasaje se cancela, el asiento se libera y no se puede deshacer.</span>
        </button>
        <button onClick={$.cx?.confirm} disabled={$.cx?.noAck} style={css(`height:56px;border:none;border-radius:999px;background:${$.cx?.btnBg ?? ''};color:#fff;font:800 17px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer`)}>Confirmar cancelación</button>
      </>)}
    </div>
  </>)}

  {!!($.s?.cxOk) && (<>
    <div style={css("max-width:520px;margin:0 auto;padding:24px 16px 48px;display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center")}>
      <div style={css("width:68px;height:68px;border-radius:50%;background:#DDF3E8;color:#1F9D6B;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:38px")}>task_alt</div>
      <div style={css("font:800 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Tu pasaje fue cancelado</div>
      <div style={css("background:#fff;border-radius:18px;border:1px solid #F0E9ED;padding:16px;width:100%;display:flex;flex-direction:column;gap:6px;font:500 14px 'Barlow',sans-serif")}>
        <div style={css("display:flex;justify-content:space-between")}><span>Reintegro</span><strong style={css("color:#147A52")}>{$.cxOk?.refund}</strong></div>
        <div style={css("display:flex;justify-content:space-between")}><span>Destino</span><strong>{$.cxOk?.dest}</strong></div>
        <div style={css("display:flex;justify-content:space-between")}><span>Plazo</span><strong>5 a 10 días hábiles</strong></div>
      </div>
      <div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>Te enviamos el comprobante por email. ¡Te esperamos en tu próximo viaje!</div>
      <button onClick={$.nav?.home} style={css("height:48px;padding:0 20px;border:1.5px solid #E4007C;border-radius:999px;background:#fff;color:#E4007C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Volver al inicio</button>
    </div>
  </>)}

  
  {!!($.s?.contacto) && (<>
    <div style={css("max-width:1040px;margin:0 auto;padding:20px 16px 48px;display:flex;flex-direction:column;gap:24px")}>
      <div><div style={css("font:600 12px 'Barlow',sans-serif;color:#E4007C;letter-spacing:.08em")}>CONTACTO</div><div style={css("font:800 32px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Estamos cerca tuyo</div></div>
      <div style={css("background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;border-radius:22px;padding:20px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between")}>
        <div><div style={css("font:600 13px 'Barlow',sans-serif;opacity:.9")}>Consultas y reservas</div><div style={css("font:900 34px/1 'Barlow Condensed',sans-serif")}>3878-804506</div><div style={css("font:500 13px 'Barlow',sans-serif;opacity:.9")}>También: 3878-242321</div></div>
        <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
          <button onClick={$.act?.wa} style={css("height:48px;padding:0 18px;border:none;border-radius:999px;background:#fff;color:#E4007C;font:800 15px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>chat</span>Escribir por WhatsApp</button>
          <button onClick={$.act?.ig} style={css("height:48px;padding:0 16px;border:1.5px solid rgba(255,255,255,.6);border-radius:999px;background:transparent;color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Instagram</button>
          <button onClick={$.act?.fb} style={css("height:48px;padding:0 16px;border:1.5px solid rgba(255,255,255,.6);border-radius:999px;background:transparent;color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Facebook</button>
        </div>
      </div>
      <div style={css("display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start")}>
        <div style={css("flex:1 1 320px;display:flex;flex-direction:column;gap:8px")}>
          <div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Sucursales</div>
          {(Array.isArray($.branches) ? $.branches : []).map((b: any, $index: number) => (<React.Fragment key={$index}>
            <div onClick={b?.on} style={css(`background:#fff;border-radius:16px;border:1.5px solid ${b?.bd ?? ''};padding:12px 14px;display:flex;flex-direction:column;gap:6px;cursor:pointer`)}>
              <div style={css("display:flex;justify-content:space-between;gap:8px;align-items:center")}><div style={css("font:800 16px 'Barlow',sans-serif")}>{b?.name}</div><div style={css("font:700 15px 'Barlow Condensed',sans-serif;color:#E4007C;font-size:17px")}>{b?.tel}</div></div>
              <div style={css("font:500 13px 'Barlow',sans-serif;color:#4A4447")}>{b?.addr}</div>
              <div style={css("font:500 12px 'Barlow',sans-serif;color:#716A6E")}>{b?.hours}</div>
              <div style={css("display:flex;gap:6px;margin-top:2px")}>
                <button onClick={b?.wa} style={css("height:40px;padding:0 12px;border:none;border-radius:999px;background:#E9FBF0;color:#147A3E;font:700 12.5px 'Barlow',sans-serif;cursor:pointer")}>WhatsApp</button>
                <button onClick={b?.call} style={css("height:40px;padding:0 12px;border:none;border-radius:999px;background:#F1ECEF;color:#1D1A1C;font:700 12.5px 'Barlow',sans-serif;cursor:pointer")}>Llamar</button>
              </div>
            </div>
          </React.Fragment>))}
        </div>
        <div style={css("flex:1 1 320px;position:sticky;top:80px;display:flex;flex-direction:column;gap:8px")}>
          <div style={css("height:300px;border-radius:20px;border:1px solid #E6DEE2;background:repeating-linear-gradient(135deg,#F3EEF1 0 12px,#ECE6E9 12px 24px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;position:relative")}>
            <span style={css("width:44px;height:44px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#E4007C;box-shadow:0 8px 16px -6px rgba(228,0,124,.6)")}></span>
            <span style={css("font:500 12px ui-monospace,Menlo,monospace;color:#6B6468;margin-top:10px")}>mapa · {$.branchSel?.name}</span>
            <span style={css("font:500 12px ui-monospace,Menlo,monospace;color:#716A6E")}>{$.branchSel?.addr}</span>
          </div>
        </div>
      </div>
      <div style={css("display:flex;flex-direction:column;gap:8px")}>
        <div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Preguntas frecuentes</div>
        {(Array.isArray($.faq) ? $.faq : []).map((f: any, $index: number) => (<React.Fragment key={$index}>
          <div style={css("background:#fff;border-radius:16px;border:1px solid #F0E9ED;overflow:hidden")}>
            <button onClick={f?.on} style={css("width:100%;border:none;background:none;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;text-align:left;font:700 15px 'Barlow',sans-serif;color:#1D1A1C")}>{f?.q}<span style={css("font-family:'Material Symbols Rounded';font-size:22px;color:#E4007C")}>{f?.icon}</span></button>
            {!!(f?.open) && (<><div style={css("padding:0 16px 14px;font:500 14px/1.55 'Barlow',sans-serif;color:#4A4447")}>{f?.a}</div></>)}
          </div>
        </React.Fragment>))}
      </div>
    </div>
  </>)}

  {!!($.showFooter) && (<>
    <footer style={css("margin-top:auto;background:#1D1A1C;color:#CFC6CA;padding:28px 16px 90px")}>
      <div style={css("max-width:1120px;margin:0 auto;display:flex;flex-wrap:wrap;gap:20px;justify-content:space-between;align-items:flex-start")}>
        <div style={css("display:flex;flex-direction:column;gap:8px;max-width:320px")}>
          <div style={css("background:#fff;border-radius:14px;padding:6px 10px;align-self:flex-start")}><img src="/assets/logo.png" alt="Expreso Sofía" style={css("height:40px;display:block")} /></div>
          <div style={css("font:400 20px 'Kaushan Script',cursive;color:#FF4FA0")}>Conectando personas, uniendo destinos</div>
        </div>
        <div style={css("display:flex;flex-direction:column;gap:6px;font:500 14px 'Barlow',sans-serif")}>
          <button onClick={$.nav?.mis} style={css("border:none;background:none;padding:0;color:#CFC6CA;text-align:left;cursor:pointer;font:500 14px 'Barlow',sans-serif")}>Mis pasajes</button>
          <button onClick={$.nav?.contacto} style={css("border:none;background:none;padding:0;color:#CFC6CA;text-align:left;cursor:pointer;font:500 14px 'Barlow',sans-serif")}>Sucursales y contacto</button>
          <button onClick={$.nav?.login} style={css("border:none;background:none;padding:0;color:#716A6E;text-align:left;cursor:pointer;font:500 14px 'Barlow',sans-serif")}>Acceso interno</button>
        </div>
      </div>
    </footer>
  </>)}
</div>

{!!($.showFab) && (<>
  <button onClick={$.act?.wa} title="WhatsApp" style={css(`position:absolute;right:16px;bottom:${$.fabBottom ?? ''}px;z-index:30;width:56px;height:56px;border-radius:50%;border:none;background:#25D366;color:#fff;box-shadow:0 12px 26px -8px rgba(0,0,0,.4);cursor:pointer;font-family:'Material Symbols Rounded';font-size:28px`)}>chat</button>
</>)}
<Toast msg={$.toast} />
</div>
</>);
  }
}
