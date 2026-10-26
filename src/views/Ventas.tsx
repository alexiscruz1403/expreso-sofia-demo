// @ts-nocheck -- logic ported verbatim from the design prototype (dynamic JS objects)
/* Generated from design/Ventas.dc.html */
import React from 'react';
import SD from '../data/sofia';
import { css, pc } from '../lib/dc';
import Boleto from './Boleto';
import SeatMap from './SeatMap';
import { Toast, EmptyState, submitOnEnter, confirmAction, withConfirm, paginate, Pager } from './ui';
import CardList from './CardList';
const BR = 'Salta Capital', SELLER = 'Daiana Tolaba';

export default class Ventas extends React.Component<any, any> {
  [key: string]: any;

  state = { tab: 'venta', L: 'T', dir: 'vuelta', date: '2026-10-17', seat: null, p: { nombre: '', apellido: '', dni: '', wa: '' }, stop: null, type: 'normal', docs: {}, turno: '', channel: 'Mostrador', method: 'Efectivo', received: '', err: '', done: null, q: '', searched: null, act: null, rpDate: null, rpSeat: null, waive: false, vtrip: null, vL: 'Todas', vR: 'Todos', vD: '', hist: 'pay', hq: '', hL: 'Todas', hR: 'Todos', hM: 'Todos', counted: '', initial: '20000', pg: {}, toast: '' };
  componentDidMount() { const go = () => { if (SD) { this._u = SD.subscribe(() => this.forceUpdate()); this.forceUpdate(); } else this._t = setTimeout(go, 40); }; go(); }
  componentWillUnmount() { this._u && this._u(); clearTimeout(this._t); }
  toast(m) { this.setState({ toast: m }); clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: '' }), 2600); }
  renderVals() {
    if (!SD) return { tab: { venta: true }, sale: { form: true }, act: {}, caja: {}, hist: {}, vt: {} };
    const s = this.state, st = SD.get(), money = SD.money, NOW = SD.NOW;
    const tabs = [['venta', 'add_card', 'Nueva venta'], ['buscar', 'manage_search', 'Reprogramar / cancelar'], ['viajes', 'directions_bus', 'Viajes'], ['historial', 'receipt_long', 'Historial'], ['caja', 'point_of_sale', 'Caja']].map(([k, icon, label]) => ({ icon, label, fg: s.tab === k ? '#E4007C' : '#4A4447', bd: s.tab === k ? '#E4007C' : 'transparent', on: () => this.setState({ tab: k }) }));
    const tab = {}; ['venta', 'buscar', 'viajes', 'historial', 'caja'].forEach(k => tab[k] = s.tab === k);
    const pill = (on) => ({ bg: on ? '#fff' : 'transparent', fg: on ? '#E4007C' : '#6B6468' });
    const chip = (on) => ({ bg: on ? '#1D1A1C' : '#fff', fg: on ? '#fff' : '#1D1A1C', bd: on ? '#1D1A1C' : '#E2D9DE' });
    const ROUTES = { T: ['Tartagal → Salta', 'Salta → Tartagal'], O: ['Orán → Salta', 'Salta → Orán'] };
    const routesFor = L => L === 'T' ? ROUTES.T : L === 'O' ? ROUTES.O : ROUTES.T.concat(ROUTES.O);
    const lineOpts = [['Todas', 'Todas'], ['T', 'Tartagal'], ['O', 'Orán']].map(([v, l]) => ({ v, l }));
    const p2 = n => String(n).padStart(2, '0');
    const hmT = ts => { const d = new Date(ts); return p2(d.getHours()) + ':' + p2(d.getMinutes()); };
    const myCajas = st.cajas.filter(k => k.seller === SELLER).sort((a, b) => b.openAt - a.openAt);
    const cur = myCajas.find(k => !k.closeAt), ref = cur || myCajas[0];
    const goCaja = () => this.setState({ tab: 'caja' });
    const dayList = (cur, has, on) => Array.from({ length: 7 }, (_, i) => { const d = SD.addDays(SD.TODAY, i); const dt = SD.parse(d); const ok = has(d); const sel = d === cur; return { dow: SD.DOWS[dt.getDay()], num: dt.getDate(), dis: !ok, op: ok ? 1 : .4, bg: sel ? '#E4007C' : '#fff', fg: sel ? '#fff' : '#1D1A1C', bd: sel ? '#E4007C' : '#EDE5E9', on: () => ok && on(d) }; });
    // sale
    const tripFor = (L, dir, d) => SD.tripsOn(d).find(t => t.line === L && t.dir === dir && !t.past && !t.cancelled);
    const trip = tripFor(s.L, s.dir, s.date);
    const stops = SD.stopsOf(s.L, s.dir);
    const stop = s.stop && stops.includes(s.stop) ? s.stop : (s.dir === 'ida' ? stops[0] : stops[stops.length - 1]);
    const isOnco = s.type === 'onco';
    const ONCO_DOCS = [['hc', 'Historia clínica', 'Acredita el diagnóstico'], ['turno', 'Turno médico designado', 'Con la fecha del viaje que solicita'], ['anses', 'Negativa de ANSES', ''], ['dni', 'DNI del paciente', '']];
    const price = trip && s.seat ? (isOnco ? 0 : st.fares[s.L][s.seat.cls].ida) : 0;
    const recv = parseInt(String(s.received).replace(/\D/g, ''), 10) || 0;
    const setP = (k, v) => this.setState({ p: Object.assign({}, s.p, { [k]: v }), err: '' });
    const resetSale = () => this.setState({ done: null, seat: null, p: { nombre: '', apellido: '', dni: '', wa: '' }, type: 'normal', docs: {}, turno: '', received: '', err: '' });
    const doneT = s.done ? st.purchases.find(p => p.id === s.done.id) : null;
    const sale = {
      done: !!doneT, form: !doneT, ticket: doneT ? SD.view(doneT) : {}, doneSub: doneT ? doneT.code + ' · ' + doneT.method + ' · ' + money(doneT.price) : '', hasChange: !!(s.done && s.done.change > 0), change: s.done ? money(s.done.change) : '',
      print: () => this.toast('Enviando boleto a la impresora térmica…'), wa: () => this.toast('Boleto enviado por WhatsApp al ' + (doneT && doneT.wa || 'pasajero')), reset: resetSale,
      lines: [['T', 'Línea Tartagal'], ['O', 'Línea Orán']].map(([k, label]) => Object.assign({ label, on: () => this.setState({ L: k, seat: null, stop: null }) }, pill(s.L === k))),
      dirs: [['vuelta', 'Desde Salta'], ['ida', 'Hacia Salta']].map(([k, label]) => Object.assign({ label, on: () => this.setState({ dir: k, seat: null, stop: null }) }, pill(s.dir === k))),
      days: dayList(s.date, d => !!tripFor(s.L, s.dir, d), d => this.setState({ date: d, seat: null })),
      hasTrip: !!trip, noTrip: !trip, noTripText: 'No hay viaje disponible para esa fecha.',
      tripRoute: trip ? trip.route : '', tripWhen: trip ? SD.when(trip, stop).full : '', tripAvail: trip ? (a => 'Semicama: ' + a.semi + ' libres · Cama: ' + a.cama + ' libres')(SD.avail(trip)) : '',
      seats: trip ? SD.seatsFor(trip) : [], selected: s.seat ? [s.seat.n] : [], toggle: x => this.setState({ seat: { n: x.n, cls: x.cls } }),
      pSemi: money(st.fares[s.L].semi.ida), pCama: money(st.fares[s.L].cama.ida), seatLabel: s.seat ? 'Asiento ' + s.seat.n + ' · ' + (s.seat.cls === 'semi' ? 'Semicama' : 'Cama') : 'Elegí un asiento',
      fields: [['nombre', 'Nombre', ''], ['apellido', 'Apellido', ''], ['dni', 'DNI', 'Sin puntos'], ['wa', 'WhatsApp (opcional)', '3878-…']].map(([k, label, ph]) => ({ label, ph, value: s.p[k], bd: s.err && !s.p[k] && k !== 'wa' ? '#D33A3A' : '#E2D9DE', on: e => setP(k, e.target.value) })),
      stopLabel: s.dir === 'ida' ? 'Parada de ascenso' : 'Parada de descenso', stop, stops: stops.map(n => ({ v: n, l: n + ' · ' + SD.hm(s.dir === 'ida' ? SD.stopMin(SD.mkTrip(s.L, 'ida', s.date), n) : SD.LINES[s.L].vStops[n]) + ' hs' })), onStop: e => this.setState({ stop: e.target.value }),
      types: [['normal', 'Normal'], ['onco', 'Paciente oncológico']].map(([k, label]) => Object.assign({ label, on: () => this.setState({ type: k, err: '' }) }, chip(s.type === k))),
      oncoDocs: ONCO_DOCS.map(([k, label, hint]) => ({ label, hint, checked: !!s.docs[k], on: () => this.setState({ docs: Object.assign({}, s.docs, { [k]: !s.docs[k] }), err: '' }) })),
      turno: s.turno, onTurno: e => this.setState({ turno: e.target.value, err: '' }), turnoMin: SD.TODAY,
      channels: [['Mostrador', 'Mostrador'], ['WhatsApp', 'Reserva por WhatsApp']].map(([k, label]) => Object.assign({ label, on: () => this.setState({ channel: k }) }, chip(s.channel === k))),
      showPay: !isOnco, methods: [['Efectivo', 'payments'], ['Transferencia', 'account_balance'], ['Mercado Pago', 'credit_card']].map(([k, icon]) => Object.assign({ label: k, icon, on: () => this.setState({ method: k }) }, chip(s.method === k))),
      isCash: s.method === 'Efectivo', received: s.received, onReceived: e => this.setState({ received: e.target.value }), isOnco,
      price: money(price), hasChangePreview: s.method === 'Efectivo' && !isOnco && recv > price, changePreview: money(recv - price), err: s.err,
      emit: () => {
        if (!trip) return this.setState({ err: 'Elegí un viaje.' }); if (!s.seat) return this.setState({ err: 'Elegí un asiento en el plano.' });
        if (!s.p.nombre || !s.p.apellido || !/^\d{7,8}$/.test(String(s.p.dni).replace(/\D/g, ''))) return this.setState({ err: 'Completá nombre, apellido y DNI (7 u 8 números).' });
        if (isOnco && !ONCO_DOCS.every(([k]) => s.docs[k])) return this.setState({ err: 'Verificá y marcá toda la documentación del paciente oncológico.' });
        if (isOnco && (!s.turno || SD.parse(s.turno).getTime() - NOW.getTime() < 24 * 36e5)) return this.setState({ err: 'El pasaje para paciente oncológico se solicita con al menos 24 hs de anticipación al turno médico.' });
        if (s.method === 'Efectivo' && !isOnco && recv && recv < price) return this.setState({ err: 'El efectivo recibido no alcanza.' });
        confirmAction({ title: '¿Emitir el pasaje?', body: s.p.nombre + ' ' + s.p.apellido + ' · ' + trip.route + ' · Asiento ' + s.seat.n + ' · ' + (isOnco ? 'Paciente oncológico · sin cargo' : s.method + ' · ' + money(price)), confirmLabel: isOnco ? 'Emitir sin cargo' : 'Cobrar y emitir', cancelLabel: 'Revisar datos' }).then(ok => { if (!ok) return;
        const r = SD.purchase({ legs: [{ tripId: trip.id, seats: [s.seat], prices: [price] }], pax: [Object.assign({}, s.p, { stop, onco: isOnco })], channel: s.channel, branch: BR, seller: SELLER, method: isOnco ? 'Pasaje oncológico' : s.method, payStatus: 'aprobado', wa: s.p.wa, cortesia: isOnco });
        this.setState({ done: { id: r.tickets[0].id, change: s.method === 'Efectivo' && recv > price ? recv - price : 0 } }); });
      }
    };
    // buscar
    const res = s.searched ? SD.findTickets(s.searched) : [];
    const stOf = t => { const tr = SD.getTrip(t.tripId); if (t.status !== 'activo') return [t.status === 'cancelado' ? 'Cancelado' : 'Reprogramado', '#F1ECEF', '#6B6468']; if (tr.cancelled) return ['Viaje cancelado', '#FBE3E3', '#B22A2A']; if (tr.past) return ['Usado', '#F1ECEF', '#6B6468']; if (t.payStatus === 'pendiente') return ['Pago pendiente', '#FFF4DB', '#8A5A00']; return ['Activo', '#DDF3E8', '#147A52']; };
    const bq = { q: s.q, onQ: e => this.setState({ q: e.target.value }), search: () => this.setState({ searched: s.q, act: null }), none: !!s.searched && !res.length,
      results: res.map(t => { const v = SD.view(t); const tr = SD.getTrip(t.tripId); const [sLabel, sBg, sFg] = stOf(t); return Object.assign({}, v, { channel: t.channel, sLabel, sBg, sFg, bd: s.act && s.act.id === t.id ? '#E4007C' : '#EFE8EC', canAct: t.status === 'activo' && !tr.past,
        reprog: () => this.setState({ act: { id: t.id, kind: 'rp' }, rpDate: null, rpSeat: null, waive: tr.cancelled }), cancel: () => this.setState({ act: { id: t.id, kind: 'cx' } }) }); }) };
    let act = {};
    const at = s.act ? SD.allTickets().map(SD.applyOv).find(t => t.id === s.act.id) : null;
    if (at) {
      const tr = SD.getTrip(at.tripId);
      const by = { channel: 'Mostrador', branch: BR, user: SELLER };
      const label = at.code + ' · ' + at.nombre + ' ' + at.apellido;
      if (s.act.kind === 'rp') {
        const gate = SD.reprogQuote(at, tr, at.cls);
        const rpDate = s.rpDate || SD.addDays(tr.date, 1);
        const nt = SD.tripsOn(rpDate).find(t => t.line === tr.line && t.dir === tr.dir && t.id !== tr.id && !t.past && !t.cancelled);
        const qt = nt && s.rpSeat ? SD.reprogQuote(at, nt, s.rpSeat.cls) : null;
        const fee = qt ? (s.waive ? 0 : qt.fee) : 0, diff = qt ? qt.diff : 0;
        act = { rp: true, label, blocked: !gate.allowed, open: gate.allowed, blockedText: gate.reason === 'rt' ? 'Pasaje ida y vuelta: no admite cambios ni reutilización.' : 'Faltan menos de 3 h para la salida: el cambio ya no se puede solicitar.', feeLabel: qt && !qt.free ? 'Retención por reprogramación (' + qt.ret + '%)' : 'Retención por reprogramación', days: dayList(rpDate, d => !!SD.tripsOn(d).find(t => t.line === tr.line && t.dir === tr.dir && t.id !== tr.id && !t.past && !t.cancelled), d => this.setState({ rpDate: d, rpSeat: null })),
          hasTrip: !!nt, seats: nt ? SD.seatsFor(nt) : [], selected: s.rpSeat ? [s.rpSeat.n] : [], toggle: x => this.setState({ rpSeat: { n: x.n, cls: x.cls } }),
          newTrip: nt ? 'Nuevo: ' + nt.route + ' · ' + SD.when(nt, at.stop).full + (s.rpSeat ? ' · Asiento ' + s.rpSeat.n : '') : 'Elegí la nueva fecha',
          fee: money(fee), diff: money(diff), total: money(fee + diff), waiveBg: s.waive ? '#E4007C' : '#fff', waiveMark: s.waive ? 'check' : '', toggleWaive: () => this.setState({ waive: !s.waive }),
          notReady: !qt, btnBg: qt ? 'linear-gradient(135deg,#C2006A,#E4007C)' : '#D9D1D5', close: () => this.setState({ act: null }),
          confirm: () => { if (!qt) return; confirmAction({ title: '¿Confirmar la reprogramación?', body: label + ' pasa a ' + nt.route + ' · ' + SD.when(nt, at.stop).full + ' · Asiento ' + s.rpSeat.n + '. A cobrar: ' + money(fee + diff) + '. El boleto anterior queda anulado.', confirmLabel: 'Reprogramar', cancelLabel: 'Volver' }).then(ok => { if (!ok) return; const n = SD.reprogram(at, nt.id, s.rpSeat, Object.assign({ reason: s.waive ? 'Excepción autorizada en mostrador' : 'A pedido del pasajero' }, by)); if (s.waive) SD.set(x => ({ purchases: x.purchases.map(p => p.id === n.id ? Object.assign({}, p, { price: at.price + diff }) : p), changes: x.changes.map((c, i) => i === 0 ? Object.assign({}, c, { fee: diff }) : c) })); this.setState({ act: null, searched: n.code, tab: 'buscar' }); this.toast('Reprogramado. Nuevo boleto emitido para ' + at.nombre); }); } };
      } else {
        const qx = SD.cancelQuote(at);
        act = { cx: true, label, paid: money(at.price), cfee: money(qx.fee), refund: money(qx.refund), pctLabel: (qx.company ? 0 : qx.ret) + '%', cxBlocked: !qx.allowed, cxOpen: qx.allowed && (at.channel === 'Online' || !!cur), cxNeedsCaja: qx.allowed && at.channel !== 'Online' && !cur, goCaja, cxReason: { credito: 'Pagado con tarjeta de crédito: no admite devolución bajo ningún término. Ofrecé reprogramar el viaje.', rt: 'Pasaje ida y vuelta: no admite devolución.', past: 'El viaje ya salió.' }[qx.reason] || '', refundWhere: at.channel === 'Online' ? 'Compra online: el reintegro se hace a MercadoPago en 5 a 10 días hábiles.' : 'Reintegro en efectivo desde esta caja.', close: () => this.setState({ act: null }),
          confirmCx: withConfirm({ title: '¿Cancelar el pasaje?', body: label + '. Reintegro: ' + money(qx.refund) + ' (retención ' + money(qx.fee) + '). El asiento se libera.', confirmLabel: 'Cancelar pasaje', cancelLabel: 'No cancelar', danger: true }, () => { SD.cancelTicket(at, Object.assign({ reason: 'Cancelado en mostrador' }, by)); this.setState({ act: null }); this.toast('Pasaje cancelado · reintegro ' + money(qx.refund)); }) };
      }
    }
    // viajes
    const vFilter = t => (s.vL === 'Todas' || t.line === s.vL) && (s.vR === 'Todos' || t.route === s.vR);
    const vlist = (s.vD ? SD.tripsOn(s.vD) : SD.monthTrips().filter(t => t.dep > NOW - 3 * 36e5)).filter(vFilter).sort((a, b) => a.dep - b.dep).slice(0, 12);
    const priceOf = t => 'Semicama ' + money(st.fares[t.line].semi.ida) + ' · Cama ' + money(st.fares[t.line].cama.ida);
    const vsel = vlist.find(t => t.id === s.vtrip) || vlist[0];
    const vtrips = vlist.map(t => { const a = SD.avail(t); return { route: t.route, date: SD.dshort(t.date), time: SD.hm(t.depMin), pct: a.pct, occ: t.cancelled ? 'Cancelado' : a.occ + '/60', price: priceOf(t), bd: vsel && vsel.id === t.id ? '#E4007C' : '#EFE8EC', op: t.cancelled ? .6 : 1, on: () => this.setState({ vtrip: t.id }) }; });
    const va = vsel ? SD.avail(vsel) : null;
    const vt = vsel ? { route: vsel.route, when: SD.when(vsel, SD.stopsOf(vsel.line, vsel.dir)[0]).full, price: priceOf(vsel), counts: va.occ + ' ocupados · ' + va.total + ' libres', seats: SD.seatsFor(vsel), pax: SD.ticketsOf(vsel).sort((a, b) => a.seat - b.seat).map(t => ({ seat: t.seat, name: t.nombre + ' ' + t.apellido, stop: t.stop })) } : { seats: [], pax: [] };
    const vf = { line: s.vL, route: s.vR, date: s.vD, lines: lineOpts, routes: ['Todos'].concat(routesFor(s.vL)),
      onLine: e => this.setState({ vL: e.target.value, vR: 'Todos', vtrip: null }), onRoute: e => this.setState({ vR: e.target.value, vtrip: null }), onDate: e => this.setState({ vD: e.target.value, vtrip: null }),
      clear: () => this.setState({ vL: 'Todas', vR: 'Todos', vD: '', vtrip: null }), dirty: s.vL !== 'Todas' || s.vR !== 'Todos' || !!s.vD };
    // historial
    const pays = SD.payments().filter(p => p.branch === BR && p.status !== 'rechazado');
    const q = s.hq.trim().toUpperCase();
    const hPay = pays.filter(p => (!q || p.code.includes(q)) && (s.hL === 'Todas' || p.lineId === s.hL) && (s.hR === 'Todos' || p.route === s.hR) && (s.hM === 'Todos' || p.method === s.hM));
    const chgMatch = c => { if (q && !c.code.includes(q)) return false; if (s.hL !== 'Todas' && c.line !== s.hL) return false; if (s.hR !== 'Todos' && (!c.line || (c.dir === 'ida' ? SD.LINES[c.line].short + ' → Salta' : 'Salta → ' + SD.LINES[c.line].short) !== s.hR)) return false; return true; };
    const pg = (key, items, sig) => paginate(items, (this.state.pg || {})[key], sig, (n, sg) => this.setState(x => ({ pg: Object.assign({}, x.pg, { [key]: { n, sig: sg } }) })));
    const hChg = st.changes.filter(c => c.branch === BR && chgMatch(c));
    const hpPg = pg('hpay', hPay, [s.hq, s.hL, s.hR, s.hM].join('|')), hcPg = pg('hchg', hChg, [s.hq, s.hL, s.hR].join('|'));
    const hist = { isPay: s.hist === 'pay', isChg: s.hist === 'chg', pPg: hpPg, cPg: hcPg,
      f: { q: s.hq, line: s.hL, route: s.hR, method: s.hM, lines: lineOpts, routes: ['Todos'].concat(routesFor(s.hL)), methods: ['Todos'].concat(Array.from(new Set(pays.map(p => p.method))).sort()),
        onQ: e => this.setState({ hq: e.target.value }), onLine: e => this.setState({ hL: e.target.value, hR: 'Todos' }), onRoute: e => this.setState({ hR: e.target.value }), onMethod: e => this.setState({ hM: e.target.value }),
        clear: () => this.setState({ hq: '', hL: 'Todas', hR: 'Todos', hM: 'Todos' }), dirty: !!q || s.hL !== 'Todas' || s.hR !== 'Todos' || s.hM !== 'Todos' },
      tabs: [['pay', 'Pagos'], ['chg', 'Reprogramaciones y cancelaciones']].map(([k, label]) => Object.assign({ label, on: () => this.setState({ hist: k }) }, chip(s.hist === k))),
      pays: hpPg.rows.map(p => ({ date: SD.fmtDate(p.date), code: p.code, payer: p.payer, trip: p.route.replace(' → ', '→') + ' ' + p.tripDate, channel: p.channel, seller: p.seller.split(' ')[0], method: p.method, amount: money(p.amount), bg: p.seller === SELLER && SD.sameDay(p.date, NOW) ? '#FFFBFD' : '#fff' })),
      chg: hcPg.rows.map(c => ({ date: SD.fmtDate(c.date), code: c.code, pax: c.pax, type: c.type, from: c.from, to: c.to, reason: c.reason, fee: c.fee ? money(c.fee) : '—', refund: c.refund ? money(c.refund) : '—' })) };
    hist.chgEmpty = !hist.chg.length; hist.payEmpty = !hist.pays.length;
    // caja
    const inRange = ts => !!ref && ts >= ref.openAt && (!ref.closeAt || ts <= ref.closeAt);
    const todayP = pays.filter(p => p.seller === SELLER && inRange(p.date));
    const by = m => todayP.filter(p => p.method === m);
    const sumA = a => a.reduce((x, p) => x + p.amount, 0), paxN = a => a.reduce((x, p) => x + p.pax, 0);
    const refunds = st.changes.filter(c => c.type === 'Cancelación' && c.user === SELLER && inRange(c.date)).reduce((x, c) => x + c.refund, 0);
    const cash = sumA(by('Efectivo'));
    const expected = (ref ? ref.initial : 0) + cash - refunds;
    const counted = ref && ref.closeAt ? ref.final : s.counted === '' ? expected : (parseInt(String(s.counted).replace(/\D/g, ''), 10) || 0);
    const diff = counted - expected;
    const closed = !cur;
    const caja = { rows: [['payments', 'Efectivo'], ['account_balance', 'Transferencia'], ['credit_card', 'Mercado Pago'], ['volunteer_activism', 'Pasaje oncológico']].map(([icon, m]) => ({ icon, label: m, count: paxN(by(m)) + ' pasajes', amount: money(sumA(by(m))) })),
      count: paxN(todayP) + ' pasajes', total: money(sumA(todayP)), cash: money(cash), refunds: '-' + money(refunds), expected: money(expected), counted: ref && ref.closeAt ? String(ref.final) : s.counted === '' ? String(expected) : s.counted, onCounted: e => this.setState({ counted: e.target.value }),
      diff: (diff > 0 ? '+' : '') + money(diff), diffBg: diff === 0 ? '#DDF3E8' : '#FBE3E3', diffFg: diff === 0 ? '#147A52' : '#B22A2A',
      closed, open: !closed, state: closed ? 'Cerrada' : 'Abierta', sBg: closed ? '#F1ECEF' : '#DDF3E8', sFg: closed ? '#6B6468' : '#147A52',
      close: withConfirm({ title: '¿Cerrar la caja?', body: 'Efectivo contado: ' + money(counted) + ' · diferencia ' + (diff > 0 ? '+' : '') + money(diff) + '. No vas a poder registrar más movimientos hoy.', confirmLabel: 'Cerrar caja', cancelLabel: 'Volver' }, () => { const at = SD.tick(); SD.set(x => ({ cajas: x.cajas.map(k => k.id === cur.id ? Object.assign({}, k, { closeAt: at, final: counted }) : k) })); this.setState({ counted: '' }); this.toast('Caja cerrada. Resumen enviado a administración.'); }), print: () => this.toast('Imprimiendo resumen de caja…'),
      hasRef: !!ref, initial: money(ref ? ref.initial : 0), since: cur ? 'Abierta desde las ' + hmT(cur.openAt) + ' hs' : ref ? 'Cerrada a las ' + hmT(ref.closeAt) + ' hs · abierta de ' + hmT(ref.openAt) + ' a ' + hmT(ref.closeAt) + ' hs' : '',
      openValue: s.initial, onOpenValue: e => this.setState({ initial: e.target.value }),
      openCaja: () => { const v = parseInt(String(s.initial).replace(/\D/g, ''), 10); if (isNaN(v)) return this.toast('Ingresá el dinero inicial de la caja.'); const at = SD.tick(); SD.set(x => ({ cajas: [{ id: 'k' + at, seller: SELLER, branch: BR, openAt: at, closeAt: null, initial: v, final: null }].concat(x.cajas) })); this.setState({ counted: '' }); this.toast('Caja abierta con ' + money(v)); } };
    return { tabs, tab, sale, bq, act, vtrips, vt, vf, hist, caja, cajaClosed: !cur, goCaja, toast: s.toast };
  }

  render() {
    const $: any = this.renderVals();
    return (<>

<div style={css("min-height:100vh;background:#F7F4F5;font-family:'Barlow',system-ui,sans-serif;color:#1D1A1C")}>
  <header style={css("background:#fff;border-bottom:1px solid #EFE8EC;position:sticky;top:0;z-index:5")}>
    <div className="r-pad vh-row" style={css("padding:10px 28px;display:flex;align-items:center;gap:20px;flex-wrap:wrap")}>
      <img className="vh-logo" src="/assets/logo.png" alt="Expreso Sofía" style={css("height:44px")} />
      <div className="vh-branch" style={css("display:flex;flex-direction:column;border-left:1px solid #EFE8EC;padding-left:18px")}>
        <span style={css("font:700 11px 'Barlow',sans-serif;letter-spacing:.12em;color:#E4007C")}>SUCURSAL</span>
        <span style={css("font:800 20px/1.1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Salta Capital</span>
        <span className="vh-sub" style={css("font:500 12px 'Barlow',sans-serif;color:#6B6468")}>Terminal de Ómnibus · boleterías 07 y 13</span>
      </div>
      <div className="r-badgegap" style={css("margin-left:auto;display:flex;align-items:center;gap:10px")}>
        <div className="vh-user" style={css("text-align:right")}><div style={css("font:700 14px 'Barlow',sans-serif")}>Daiana Tolaba</div><div style={css("font:500 12px 'Barlow',sans-serif;color:#6B6468")}>Vendedora · Vie 16 oct · 20:30</div></div>
        <span style={css("width:38px;height:38px;border-radius:50%;background:#E4007C;color:#fff;display:flex;align-items:center;justify-content:center;font:800 14px 'Barlow',sans-serif")}>DT</span>
      </div>
    </div>
    <nav style={css("padding:0 20px;display:flex;gap:4px;overflow-x:auto")}>
      {(Array.isArray($.tabs) ? $.tabs : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
        <button onClick={t?.on} style={css(`border:none;background:none;cursor:pointer;height:48px;padding:0 14px;font:700 14px 'Barlow',sans-serif;color:${t?.fg ?? ''};border-bottom:3px solid ${t?.bd ?? ''};display:flex;align-items:center;gap:6px;white-space:nowrap`)}><span style={css("font-family:'Material Symbols Rounded';font-size:19px")}>{t?.icon}</span>{t?.label}</button>
      </React.Fragment>))}
    </nav>
  </header>

  <div className="r-pad" style={css("padding:24px 28px 110px;max-width:1360px;display:flex;flex-direction:column;gap:18px")}>

    
    {!!($.tab?.venta) && (<>
      {!!($.sale?.done) && (<>
        <div style={css("display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start")}>
          <div><Boleto t={$.sale?.ticket} /></div>
          <div style={css("flex:1 1 300px;display:flex;flex-direction:column;gap:12px")}>
            <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("width:44px;height:44px;border-radius:50%;background:#DDF3E8;color:#1F9D6B;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:26px")}>check</span><div><div style={css("font:800 26px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Pasaje emitido</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>{$.sale?.doneSub}</div></div></div>
            {!!($.sale?.hasChange) && (<><div style={css("background:#FFF4DB;color:#8A5A00;border-radius:12px;padding:12px;font:700 16px 'Barlow',sans-serif")}>Vuelto a entregar: {$.sale?.change}</div></>)}
            <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
              <button onClick={$.sale?.print} style={css("height:48px;padding:0 18px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:19px")}>print</span>Imprimir boleto</button>
              <button onClick={$.sale?.wa} style={css("height:48px;padding:0 18px;border:none;border-radius:999px;background:#25D366;color:#0B3B1E;font:700 14px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:19px")}>send</span>Enviar por WhatsApp</button>
              <button onClick={$.sale?.reset} style={css("height:48px;padding:0 18px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#1D1A1C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Nueva venta</button>
            </div>
          </div>
        </div>
      </>)}
      {!!($.cajaClosed && $.sale?.form) && <EmptyState boxed icon="point_of_sale" title="La caja está cerrada" text="Abrí la caja para registrar ventas." action={{ label: 'Ir a Caja', on: $.goCaja }} />}
      {!!($.sale?.form && !$.cajaClosed) && (<>
        <div onKeyDown={submitOnEnter($.sale?.emit)} className="r-stack" style={css("display:grid;grid-template-columns:minmax(300px,380px) minmax(0,1fr);gap:18px;align-items:start")}>
          <div style={css("display:flex;flex-direction:column;gap:14px")}>
            <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px")}>
              <div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>1 · Viaje</div>
              <div style={css("display:flex;background:#F3EEF1;border-radius:12px;padding:4px;gap:4px")}>
                {(Array.isArray($.sale?.lines) ? $.sale?.lines : []).map((o: any, $index: number) => (<React.Fragment key={$index}><button onClick={o?.on} style={css(`flex:1;height:40px;border:none;border-radius:9px;cursor:pointer;font:700 13px 'Barlow',sans-serif;background:${o?.bg ?? ''};color:${o?.fg ?? ''}`)}>{o?.label}</button></React.Fragment>))}
              </div>
              <div style={css("display:flex;background:#F3EEF1;border-radius:12px;padding:4px;gap:4px")}>
                {(Array.isArray($.sale?.dirs) ? $.sale?.dirs : []).map((o: any, $index: number) => (<React.Fragment key={$index}><button onClick={o?.on} style={css(`flex:1;height:40px;border:none;border-radius:9px;cursor:pointer;font:700 13px 'Barlow',sans-serif;background:${o?.bg ?? ''};color:${o?.fg ?? ''}`)}>{o?.label}</button></React.Fragment>))}
              </div>
              <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:4px")}>
                {(Array.isArray($.sale?.days) ? $.sale?.days : []).map((d: any, $index: number) => (<React.Fragment key={$index}><button onClick={d?.on} disabled={d?.dis} style={css(`height:56px;border-radius:10px;border:1.5px solid ${d?.bd ?? ''};background:${d?.bg ?? ''};color:${d?.fg ?? ''};cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:${d?.op ?? ''};padding:0`)}><span style={css("font:600 10px 'Barlow',sans-serif;text-transform:uppercase")}>{d?.dow}</span><span style={css("font:800 18px 'Barlow Condensed',sans-serif")}>{d?.num}</span></button></React.Fragment>))}
              </div>
              {!!($.sale?.hasTrip) && (<>
                <div style={css("background:#F8F5F6;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:3px")}>
                  <div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.sale?.tripRoute}</div>
                  <div style={css("font:600 13px 'Barlow',sans-serif")}>{$.sale?.tripWhen}</div>
                  <div style={css("font:500 12.5px 'Barlow',sans-serif;color:#6B6468")}>{$.sale?.tripAvail}</div>
                </div>
              </>)}
              {!!($.sale?.noTrip) && <EmptyState icon="event_busy" title="No hay viaje para esa fecha" text="Elegí otro día, línea o sentido." />}
            </div>
            <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px")}>
              <div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>3 · Pasajero y cobro</div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px")}>
                {(Array.isArray($.sale?.fields) ? $.sale?.fields : []).map((f: any, $index: number) => (<React.Fragment key={$index}>
                  <label style={css("display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468;min-width:0")}>{f?.label}<input value={f?.value} onChange={f?.on} placeholder={f?.ph} style={css(`height:48px;border:1.5px solid ${f?.bd ?? ''};border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;color:#1D1A1C;min-width:0`)} /></label>
                </React.Fragment>))}
              </div>
              <label style={css("display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{$.sale?.stopLabel}<select value={$.sale?.stop} onChange={$.sale?.onStop} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}>{(Array.isArray($.sale?.stops) ? $.sale?.stops : []).map((o: any, $index: number) => (<React.Fragment key={$index}><option value={o?.v}>{o?.l}</option></React.Fragment>))}</select></label>
              <div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Tipo de pasaje</div>
              <div style={css("display:flex;gap:6px")}>{(Array.isArray($.sale?.types) ? $.sale?.types : []).map((o: any, $index: number) => (<React.Fragment key={$index}><button onClick={o?.on} style={css(`flex:1;height:40px;border-radius:10px;border:1.5px solid ${o?.bd ?? ''};background:${o?.bg ?? ''};color:${o?.fg ?? ''};font:700 13px 'Barlow',sans-serif;cursor:pointer`)}>{o?.label}</button></React.Fragment>))}</div>
              <div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Canal</div>
              <div style={css("display:flex;gap:6px")}>{(Array.isArray($.sale?.channels) ? $.sale?.channels : []).map((o: any, $index: number) => (<React.Fragment key={$index}><button onClick={o?.on} style={css(`flex:1;height:40px;border-radius:10px;border:1.5px solid ${o?.bd ?? ''};background:${o?.bg ?? ''};color:${o?.fg ?? ''};font:700 13px 'Barlow',sans-serif;cursor:pointer`)}>{o?.label}</button></React.Fragment>))}</div>
              {!!($.sale?.showPay) && (<>
                <div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Medio de cobro</div>
                <div style={css("display:flex;gap:6px")}>{(Array.isArray($.sale?.methods) ? $.sale?.methods : []).map((o: any, $index: number) => (<React.Fragment key={$index}><button onClick={o?.on} style={css(`flex:1;height:48px;border-radius:10px;border:1.5px solid ${o?.bd ?? ''};background:${o?.bg ?? ''};color:${o?.fg ?? ''};font:700 12.5px 'Barlow',sans-serif;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px`)}><span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>{o?.icon}</span>{o?.label}</button></React.Fragment>))}</div>
                {!!($.sale?.isCash) && (<>
                  <label style={css("display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Recibido en efectivo<input value={$.sale?.received} onChange={$.sale?.onReceived} inputMode="numeric" placeholder="20000" style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:700 15px 'Barlow',sans-serif;color:#1D1A1C")} /></label>
                </>)}
                
              </>)}
              {!!($.sale?.isOnco) && (<div style={css("background:#FDF2F8;border:1.5px solid #F7CFE3;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:10px")}>
                <div style={css("font:600 12.5px/1.45 'Barlow',sans-serif;color:#5C0033")}>Pasaje sin cargo. Se solicita con al menos 24 hs de anticipación al turno médico. Verificá la documentación original antes de emitir:</div>
                {($.sale?.oncoDocs || []).map((d: any, k: number) => (
                  <button key={k} type="button" role="checkbox" aria-checked={d.checked} onClick={d.on} style={css("display:flex;gap:10px;align-items:flex-start;border:none;background:none;padding:0;cursor:pointer;text-align:left")}>
                    <span aria-hidden="true" style={css(`flex:none;width:22px;height:22px;border-radius:6px;border:2px solid #C2006A;background:${d.checked ? '#C2006A' : '#fff'};color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:16px`)}>{d.checked ? 'check' : ''}</span>
                    <span style={css("display:flex;flex-direction:column")}><span style={css("font:700 14px 'Barlow',sans-serif;color:#1D1A1C")}>{d.label}</span>{d.hint && <span style={css("font:500 12.5px 'Barlow',sans-serif;color:#716A6E")}>{d.hint}</span>}</span>
                  </button>
                ))}
                <label style={css("display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Fecha del turno médico<input type="date" value={$.sale?.turno} min={$.sale?.turnoMin} onChange={$.sale?.onTurno} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;color:#1D1A1C;background:#fff")} /></label>
              </div>)}
              {!!($.sale?.err) && (<><div style={css("background:#FBE3E3;color:#B22A2A;border-radius:10px;padding:10px;font:600 13px 'Barlow',sans-serif")}>{$.sale?.err}</div></>)}
              <div style={css("display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid #F3EDF0;padding-top:10px")}><span style={css("font:700 14px 'Barlow',sans-serif")}>Total</span><span style={css("font:900 30px 'Barlow Condensed',sans-serif;color:#E4007C")}>{$.sale?.price}</span></div>
              {!!($.sale?.hasChangePreview) && (<><div style={css("font:700 13px 'Barlow',sans-serif;color:#8A5A00;text-align:right")}>Vuelto: {$.sale?.changePreview}</div></>)}
              <button onClick={$.sale?.emit} style={css("height:48px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 16px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>{$.sale?.isOnco ? 'Emitir pasaje sin cargo' : 'Cobrar y emitir pasaje'}</button>
            </div>
          </div>
          <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0")}>
            <div style={css("display:flex;justify-content:space-between;align-items:center;gap:10px")}><div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>2 · Asiento</div><div style={css("font:700 14px 'Barlow',sans-serif;color:#E4007C")}>{$.sale?.seatLabel}</div></div>
            {!!($.sale?.hasTrip) && (<>
              <div><SeatMap seats={$.sale?.seats} selected={$.sale?.selected} onToggle={$.sale?.toggle} mode="buy" layout="stacked" size="38" priceSemi={$.sale?.pSemi} priceCama={$.sale?.pCama} /></div>
            </>)}
          </div>
        </div>
      </>)}
    </>)}

    
    {!!($.tab?.buscar) && (<>
      <div onKeyDown={submitOnEnter($.bq?.search)} style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:16px;display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap")}>
        <label style={css("flex:1 1 300px;display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Código de reserva o DNI<input value={$.bq?.q} onChange={$.bq?.onQ} placeholder="SOF-4KD72 o 32456789" style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;color:#1D1A1C")} /></label>
        <button onClick={$.bq?.search} style={css("height:48px;padding:0 20px;border:none;border-radius:999px;background:#1D1A1C;color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Buscar</button>
        <div style={css("flex-basis:100%;font:500 12.5px 'Barlow',sans-serif;color:#716A6E")}>Probá con SOF-4KD72, DNI 32456789 o un código comprado en el sitio.</div>
      </div>
      {!!($.bq?.none) && <EmptyState boxed icon="search_off" title="No encontramos pasajes" text="Revisá el código de reserva o el DNI. El código está en el email o el boleto impreso." />}
      {(Array.isArray($.bq?.results) ? $.bq?.results : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
        <div style={css(`background:#fff;border:2px solid ${t?.bd ?? ''};border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap`)}>
          <div style={css("flex:1 1 260px")}><div style={css("font:700 12px 'Barlow',sans-serif;color:#6B6468")}>{t?.code} · {t?.line} · {t?.channel}</div><div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{t?.route} · {t?.date} {t?.time} hs</div><div style={css("font:500 13px 'Barlow',sans-serif")}>{t?.name} · DNI {t?.dni} · Asiento {t?.seat} ({t?.cls}) · {t?.price}</div></div>
          <span style={css(`border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif;background:${t?.sBg ?? ''};color:${t?.sFg ?? ''}`)}>{t?.sLabel}</span>
          {!!(t?.canAct) && (<>
            <div style={css("display:flex;gap:6px")}><button onClick={t?.reprog} style={css("height:40px;padding:0 14px;border:1.5px solid #E4007C;border-radius:999px;background:#fff;color:#E4007C;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Reprogramar</button><button onClick={t?.cancel} style={css("height:40px;padding:0 14px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#B22A2A;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Cancelar</button></div>
          </>)}
        </div>
      </React.Fragment>))}
      {!!($.act?.rp) && (<>
        <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px")}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}><div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Reprogramar · {$.act?.label}</div><button onClick={$.act?.close} style={css("border:none;background:none;cursor:pointer;font:700 13px 'Barlow',sans-serif;color:#6B6468")}>Cerrar</button></div>
          {!!($.act?.blocked) && (<><div style={css("background:#FFF4DB;color:#8A5A00;border-radius:12px;padding:12px;font:600 13.5px 'Barlow',sans-serif")}>{$.act?.blockedText}</div></>)}
          {!!($.act?.open) && (<>
            <div className="r-scrollx" style={css("display:grid;grid-template-columns:repeat(7,90px);gap:6px")}>
              {(Array.isArray($.act?.days) ? $.act?.days : []).map((d: any, $index: number) => (<React.Fragment key={$index}><button onClick={d?.on} disabled={d?.dis} style={css(`height:56px;border-radius:10px;border:1.5px solid ${d?.bd ?? ''};background:${d?.bg ?? ''};color:${d?.fg ?? ''};cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:${d?.op ?? ''}`)}><span style={css("font:600 10px 'Barlow',sans-serif;text-transform:uppercase")}>{d?.dow}</span><span style={css("font:800 18px 'Barlow Condensed',sans-serif")}>{d?.num}</span></button></React.Fragment>))}
            </div>
            <div style={css("display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap")}>
              {!!($.act?.hasTrip) && (<><div><SeatMap seats={$.act?.seats} selected={$.act?.selected} onToggle={$.act?.toggle} mode="buy" layout="stacked" size="34" /></div></>)}
              <div style={css("flex:1 1 260px;display:flex;flex-direction:column;gap:8px;font:500 14px 'Barlow',sans-serif")}>
                <div style={css("font:700 14px 'Barlow',sans-serif")}>{$.act?.newTrip}</div>
                <div style={css("display:flex;justify-content:space-between")}><span>{$.act?.feeLabel}</span><strong>{$.act?.fee}</strong></div>
                <div style={css("display:flex;justify-content:space-between")}><span>Diferencia de tarifa</span><strong>{$.act?.diff}</strong></div>
                <button onClick={$.act?.toggleWaive} style={css("display:flex;align-items:center;gap:8px;border:none;background:none;cursor:pointer;padding:0;font:600 13px 'Barlow',sans-serif;color:#1D1A1C")}><span style={css(`width:20px;height:20px;border-radius:5px;border:2px solid #E4007C;background:${$.act?.waiveBg ?? ''};color:#fff;font-family:'Material Symbols Rounded';font-size:15px;display:flex;align-items:center;justify-content:center`)}>{$.act?.waiveMark}</span>Sin cargo (excepción autorizada)</button>
                <div style={css("display:flex;justify-content:space-between;border-top:1px solid #F3EDF0;padding-top:8px;align-items:baseline")}><strong>A cobrar</strong><strong style={css("font:900 26px 'Barlow Condensed',sans-serif;color:#E4007C")}>{$.act?.total}</strong></div>
                <button onClick={$.act?.confirm} disabled={$.act?.notReady} style={css(`height:48px;border:none;border-radius:999px;background:${$.act?.btnBg ?? ''};color:#fff;font:800 15px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer`)}>Confirmar y emitir nuevo boleto</button>
              </div>
            </div>
          </>)}
        </div>
      </>)}
      {!!($.act?.cx) && (<>
        <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px;max-width:520px")}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}><div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Cancelar · {$.act?.label}</div><button onClick={$.act?.close} style={css("border:none;background:none;cursor:pointer;font:700 13px 'Barlow',sans-serif;color:#6B6468")}>Cerrar</button></div>
          <div style={css("display:flex;justify-content:space-between;font:500 14px 'Barlow',sans-serif")}><span>Pagó</span><strong>{$.act?.paid}</strong></div>
          <div style={css("display:flex;justify-content:space-between;font:500 14px 'Barlow',sans-serif")}><span>Retención ({$.act?.pctLabel})</span><strong>{$.act?.cfee}</strong></div>
          <div style={css("display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid #F3EDF0;padding-top:8px")}><strong>Reintegro</strong><strong style={css("font:900 26px 'Barlow Condensed',sans-serif;color:#147A52")}>{$.act?.refund}</strong></div>
          <div style={css("font:500 12.5px 'Barlow',sans-serif;color:#6B6468")}>{$.act?.refundWhere}</div>
          {!!($.act?.cxBlocked) && (<><div style={css("background:#FFF4DB;color:#8A5A00;border-radius:12px;padding:10px;font:600 13px 'Barlow',sans-serif")}>{$.act?.cxReason}</div></>)}
          {!!($.act?.cxNeedsCaja) && <EmptyState icon="point_of_sale" title="Abrí la caja para cancelar" text="El reintegro de este pasaje se paga en efectivo desde la caja." action={{ label: 'Ir a Caja', on: $.act?.goCaja }} />}
          {!!($.act?.cxOpen) && <button onClick={$.act?.confirmCx} style={css("height:48px;border:none;border-radius:999px;background:#D33A3A;color:#fff;font:800 15px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Confirmar cancelación</button>}
        </div>
      </>)}
    </>)}

    
    {!!($.tab?.viajes) && (<>
      <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:12px 16px;display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap")}>
        <label style={css("flex:1 1 150px;display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468;min-width:0")}>Línea<select value={$.vf?.line} onChange={$.vf?.onLine} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}>{($.vf?.lines || []).map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}</select></label>
        <label style={css("flex:1 1 190px;display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468;min-width:0")}>Recorrido<select value={$.vf?.route} onChange={$.vf?.onRoute} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}>{($.vf?.routes || []).map((o: any) => <option key={o} value={o}>{o}</option>)}</select></label>
        <label style={css("flex:1 1 160px;display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468;min-width:0")}>Fecha<input type="date" value={$.vf?.date} onChange={$.vf?.onDate} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")} /></label>
        {!!($.vf?.dirty) && <button type="button" onClick={$.vf?.clear} style={css("height:48px;padding:0 16px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#1D1A1C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Limpiar filtros</button>}
      </div>
      <div className="r-stack" style={css("display:grid;grid-template-columns:minmax(280px,360px) minmax(0,1fr);gap:16px;align-items:start")}>
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          {!($.vtrips || []).length && <EmptyState boxed icon="event_busy" title="No hay viajes con esos filtros" text="Probá con otra línea, recorrido o fecha." action={$.vf?.dirty ? { label: 'Limpiar filtros', on: $.vf?.clear } : undefined} />}
          {(Array.isArray($.vtrips) ? $.vtrips : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
            <button onClick={t?.on} style={css(`background:#fff;border:2px solid ${t?.bd ?? ''};border-radius:14px;padding:12px 14px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:6px;opacity:${t?.op ?? ''}`)}>
              <div style={css("display:flex;justify-content:space-between;gap:8px")}><span style={css("font:800 17px 'Barlow Condensed',sans-serif;text-transform:uppercase;color:#1D1A1C")}>{t?.route}</span><span style={css("font:700 12px 'Barlow',sans-serif;color:#6B6468")}>{t?.date} {t?.time}</span></div><div style={css("font:600 12.5px 'Barlow',sans-serif;color:#4A4447")}>{t?.price}</div>
              <div style={css("display:flex;align-items:center;gap:8px")}><span style={css("flex:1;height:7px;border-radius:7px;background:#F1ECEF;overflow:hidden")}><span style={css(`display:block;height:100%;width:${t?.pct ?? ''}%;background:#E4007C`)}></span></span><span style={css("font:700 12px 'Barlow',sans-serif;color:#1D1A1C")}>{t?.occ}</span></div>
            </button>
          </React.Fragment>))}
        </div>
        <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px")}>
          <div style={css("display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap")}><div><div style={css("font:800 22px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.vt?.route}</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>{$.vt?.when}</div><div style={css("font:700 13px 'Barlow',sans-serif;color:#C2006A;margin-top:2px")}>{$.vt?.price}</div></div><div style={css("font:700 14px 'Barlow',sans-serif")}>{$.vt?.counts}</div></div>
          <div style={css("display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start")}>
            <div><SeatMap seats={$.vt?.seats} mode="view" layout="stacked" size="30" /></div>
            <div style={css("flex:1 1 260px;display:flex;flex-direction:column;max-height:560px;overflow:auto")}>
              {!($.vt?.pax || []).length && <EmptyState icon="group_off" title="Sin pasajeros" text="Este viaje todavía no tiene pasajes vendidos." />}
              {(Array.isArray($.vt?.pax) ? $.vt?.pax : []).map((p: any, $index: number) => (<React.Fragment key={$index}><div style={css("display:grid;grid-template-columns:36px 1fr auto;gap:8px;padding:7px 4px;border-bottom:1px solid #F3EDF0;font:500 13px 'Barlow',sans-serif")}><strong style={css("color:#E4007C")}>{p?.seat}</strong><span>{p?.name}</span><span style={css("color:#6B6468")}>{p?.stop}</span></div></React.Fragment>))}
            </div>
          </div>
        </div>
      </div>
    </>)}

    
    {!!($.tab?.historial) && (<>
      <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>{(Array.isArray($.hist?.tabs) ? $.hist?.tabs : []).map((h: any, $index: number) => (<React.Fragment key={$index}><button onClick={h?.on} style={css(`height:40px;padding:0 14px;border-radius:999px;border:1.5px solid ${h?.bd ?? ''};background:${h?.bg ?? ''};color:${h?.fg ?? ''};font:700 13px 'Barlow',sans-serif;cursor:pointer`)}>{h?.label}</button></React.Fragment>))}</div>
      <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:12px 16px;display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap")}>
        <label style={css("flex:1 1 160px;display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468;min-width:0")}>Código<input value={$.hist?.f?.q} onChange={$.hist?.f?.onQ} placeholder="SOF-…" autoComplete="off" spellCheck={false} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;text-transform:uppercase")} /></label>
        <label style={css("flex:1 1 140px;display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468;min-width:0")}>Línea<select value={$.hist?.f?.line} onChange={$.hist?.f?.onLine} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}>{($.hist?.f?.lines || []).map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}</select></label>
        <label style={css("flex:1 1 180px;display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468;min-width:0")}>Recorrido<select value={$.hist?.f?.route} onChange={$.hist?.f?.onRoute} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}>{($.hist?.f?.routes || []).map((o: any) => <option key={o} value={o}>{o}</option>)}</select></label>
        {!!($.hist?.isPay) && <label style={css("flex:1 1 160px;display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468;min-width:0")}>Medio<select value={$.hist?.f?.method} onChange={$.hist?.f?.onMethod} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}>{($.hist?.f?.methods || []).map((o: any) => <option key={o} value={o}>{o}</option>)}</select></label>}
        {!!($.hist?.f?.dirty) && <button type="button" onClick={$.hist?.f?.clear} style={css("height:48px;padding:0 16px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#1D1A1C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Limpiar filtros</button>}
      </div>
      {!!($.hist?.isPay) && (<>
        <div className="r-card" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
          <div className="r-row" style={css("display:grid;grid-template-columns:110px 100px 1.4fr 1fr 1fr 1fr 100px;gap:10px;padding:10px 18px;background:#FAF8F9;font:700 11px 'Barlow',sans-serif;letter-spacing:.08em;color:#716A6E;text-transform:uppercase")}><span>Fecha</span><span>Código</span><span>Pasajero</span><span>Viaje</span><span>Canal</span><span>Medio</span><span style={css("text-align:right")}>Monto</span></div>
          {(Array.isArray($.hist?.pays) ? $.hist?.pays : []).map((p: any, $index: number) => (<React.Fragment key={$index}><div className="r-row" style={css(`display:grid;grid-template-columns:110px 100px 1.4fr 1fr 1fr 1fr 100px;gap:10px;padding:10px 18px;border-top:1px solid #F3EDF0;font:500 13.5px 'Barlow',sans-serif;background:${p?.bg ?? ''}`)}><span style={css("color:#6B6468")}>{p?.date}</span><strong>{p?.code}</strong><span>{p?.payer}</span><span>{p?.trip}</span><span>{p?.channel} · {p?.seller}</span><span style={css("color:#6B6468")}>{p?.method}</span><strong style={css("text-align:right")}>{p?.amount}</strong></div></React.Fragment>))}
          <CardList items={($.hist?.pays || []).map((p: any) => ({ title: p.payer, subtitle: p.date + ' · ' + p.code, value: p.amount, details: [['Fecha', p.date], ['Código', p.code], ['Pasajero', p.payer], ['Viaje', p.trip], ['Canal', p.channel], ['Vendedor', p.seller], ['Medio', p.method], ['Monto', p.amount]] }))} />
          {!!($.hist?.payEmpty) && <EmptyState icon="payments" title={$.hist?.f?.dirty ? 'No hay pagos con esos filtros' : 'Sin pagos en esta sucursal'} text={$.hist?.f?.dirty ? 'Probá con otro código, línea, recorrido o medio.' : 'Los cobros de Salta Capital van a aparecer acá.'} action={$.hist?.f?.dirty ? { label: 'Limpiar filtros', on: $.hist?.f?.clear } : undefined} />}
        </div>
        <Pager pg={$.hist?.pPg} noun="pagos" />
      </>)}
      {!!($.hist?.isChg) && (<>
        <div className="r-card" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
          <div className="r-row" style={css("display:grid;grid-template-columns:100px 100px 1.2fr 1fr 1.2fr 1.2fr 1.3fr 90px 90px;gap:10px;padding:10px 18px;background:#FAF8F9;font:700 11px 'Barlow',sans-serif;letter-spacing:.06em;color:#716A6E;text-transform:uppercase")}><span>Fecha</span><span>Código</span><span>Pasajero</span><span>Tipo</span><span>De</span><span>A</span><span>Motivo</span><span>Cargo</span><span>Reintegro</span></div>
          {(Array.isArray($.hist?.chg) ? $.hist?.chg : []).map((c: any, $index: number) => (<React.Fragment key={$index}><div className="r-row" style={css("display:grid;grid-template-columns:100px 100px 1.2fr 1fr 1.2fr 1.2fr 1.3fr 90px 90px;gap:10px;padding:10px 18px;border-top:1px solid #F3EDF0;font:500 13px 'Barlow',sans-serif")}><span style={css("color:#6B6468")}>{c?.date}</span><strong>{c?.code}</strong><span>{c?.pax}</span><span>{c?.type}</span><span>{c?.from}</span><span>{c?.to}</span><span style={css("color:#6B6468")}>{c?.reason}</span><span>{c?.fee}</span><span style={css("color:#147A52;font-weight:700")}>{c?.refund}</span></div></React.Fragment>))}
          <CardList items={($.hist?.chg || []).map((c: any) => ({ title: c.pax, subtitle: c.date + ' · ' + c.code, badge: { label: c.type, bg: c.type === 'Cancelación' ? '#FBE3E3' : '#EEF0FF', fg: c.type === 'Cancelación' ? '#B22A2A' : '#3C3F9E' }, value: c.refund !== '—' ? c.refund : c.fee, details: [['Fecha', c.date], ['Código', c.code], ['Pasajero', c.pax], ['Tipo', c.type], ['Viaje original', c.from], ['Nuevo viaje', c.to], ['Motivo', c.reason], ['Cargo', c.fee], ['Reembolso', c.refund]] }))} />
          {!!($.hist?.chgEmpty) && <EmptyState icon="event_repeat" title={$.hist?.f?.dirty ? 'No hay movimientos con esos filtros' : 'Sin movimientos en esta sucursal'} text={$.hist?.f?.dirty ? 'Probá con otro código, línea o recorrido.' : 'Las reprogramaciones y cancelaciones de Salta Capital van a aparecer acá.'} action={$.hist?.f?.dirty ? { label: 'Limpiar filtros', on: $.hist?.f?.clear } : undefined} />}
        </div>
        <Pager pg={$.hist?.cPg} noun="movimientos" />
      </>)}
    </>)}

    
    {!!($.tab?.caja) && (<>
      {!!($.caja?.closed) && (<div onKeyDown={submitOnEnter($.caja?.openCaja)} style={css("background:#fff;border:1.5px solid #F7CFE3;border-radius:16px;padding:16px;display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap")}>
        <div style={css("flex:1 1 220px;display:flex;flex-direction:column;gap:2px")}><div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Abrir caja</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>Daiana Tolaba · Salta Capital. Ingresá el efectivo con el que empezás.</div></div>
        <label style={css("flex:0 1 200px;display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468;min-width:0")}>Dinero inicial<input value={$.caja?.openValue} onChange={$.caja?.onOpenValue} inputMode="numeric" style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;font-variant-numeric:tabular-nums")} /></label>
        <button type="button" onClick={$.caja?.openCaja} style={css("height:48px;padding:0 22px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 16px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Abrir caja</button>
      </div>)}
      {!!($.caja?.hasRef) && <div className="r-stack" style={css("display:grid;grid-template-columns:minmax(0,1.3fr) minmax(300px,1fr);gap:16px;align-items:start")}>
        <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:12px")}>
          <div style={css("display:flex;justify-content:space-between;align-items:center")}><div style={css("font:800 22px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.caja?.closed ? 'Última caja' : 'Caja abierta'}</div><span style={css(`border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif;background:${$.caja?.sBg ?? ''};color:${$.caja?.sFg ?? ''}`)}>{$.caja?.state}</span></div>
          <div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>Daiana Tolaba · Salta Capital · {$.caja?.since}</div>
          {(Array.isArray($.caja?.rows) ? $.caja?.rows : []).map((r: any, $index: number) => (<React.Fragment key={$index}>
            <div className="r-caja" style={css("display:grid;grid-template-columns:36px 1fr 90px 120px;gap:10px;align-items:center;padding:10px 0;border-top:1px solid #F3EDF0;font:500 14px 'Barlow',sans-serif")}><span style={css("width:32px;height:32px;border-radius:50%;background:#FDE6F2;color:#E4007C;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:18px")}>{r?.icon}</span><span style={css("font-weight:700")}>{r?.label}</span><span style={css("color:#6B6468")}>{r?.count}</span><strong style={css("text-align:right;font-size:16px")}>{r?.amount}</strong></div>
          </React.Fragment>))}
          <div className="r-caja" style={css("display:grid;grid-template-columns:36px 1fr 90px 120px;gap:10px;align-items:center;padding:12px 0;border-top:2px solid #1D1A1C;font:700 15px 'Barlow',sans-serif")}><span></span><span>Total vendido</span><span>{$.caja?.count}</span><strong style={css("text-align:right;font:900 24px 'Barlow Condensed',sans-serif;color:#E4007C")}>{$.caja?.total}</strong></div>
        </div>
        <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:12px")}>
          <div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Arqueo de efectivo</div>
          <div style={css("display:flex;justify-content:space-between;font:500 14px 'Barlow',sans-serif")}><span>Dinero inicial</span><strong>{$.caja?.initial}</strong></div>
          <div style={css("display:flex;justify-content:space-between;font:500 14px 'Barlow',sans-serif")}><span>Ventas en efectivo</span><strong>{$.caja?.cash}</strong></div>
          <div style={css("display:flex;justify-content:space-between;font:500 14px 'Barlow',sans-serif")}><span>Reintegros en efectivo</span><strong>{$.caja?.refunds}</strong></div>
          <div style={css("display:flex;justify-content:space-between;font:700 15px 'Barlow',sans-serif;border-top:1px solid #F3EDF0;padding-top:8px")}><span>Esperado en caja</span><strong>{$.caja?.expected}</strong></div>
          <label style={css("display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Efectivo contado<input value={$.caja?.counted} onChange={$.caja?.onCounted} onKeyDown={submitOnEnter($.caja?.open ? $.caja?.close : undefined)} inputMode="numeric" disabled={$.caja?.closed} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:700 15px 'Barlow',sans-serif;color:#1D1A1C")} /></label>
          <div style={css(`display:flex;justify-content:space-between;align-items:center;border-radius:12px;padding:10px 12px;background:${$.caja?.diffBg ?? ''};color:${$.caja?.diffFg ?? ''};font:700 14px 'Barlow',sans-serif`)}><span>Diferencia</span><span style={css("font:900 22px 'Barlow Condensed',sans-serif")}>{$.caja?.diff}</span></div>
          {!!($.caja?.open) && (<><button onClick={$.caja?.close} style={css("height:48px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 16px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Cerrar caja</button></>)}
          {!!($.caja?.closed) && (<><div style={css("background:#DDF3E8;color:#147A52;border-radius:12px;padding:10px;font:700 13px 'Barlow',sans-serif;text-align:center")}>{$.caja?.since}</div></>)}
          <button onClick={$.caja?.print} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#1D1A1C;font:700 14px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>print</span>Imprimir resumen</button>
        </div>
      </div>}
    </>)}
  </div>
  <Toast msg={$.toast} />
</div>
</>);
  }
}
