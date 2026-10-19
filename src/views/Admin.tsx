// @ts-nocheck -- logic ported verbatim from the design prototype (dynamic JS objects)
/* Generated from design/Admin.dc.html */
import React from 'react';
import SD from '../data/sofia';
import { css, pc } from '../lib/dc';
import SeatMap from './SeatMap';
import CardList from './CardList';
import { Toast, EmptyState, submitOnEnter, withConfirm } from './ui';

export default class Admin extends React.Component<any, any> {
  [key: string]: any;

  state = { sec: 'dashboard', prevSec: 'dashboard', tripId: null, seatSel: null, week: 0, modal: null, form: {}, pf: { period: 'Últimos 7 días', line: 'Todas', channel: 'Todos', status: 'Todos' }, cf: 'Todas', rf: 'Todos', stopsEdit: null, toast: '' };
  componentDidMount() { const go = () => { if (SD) { this._u = SD.subscribe(() => this.forceUpdate()); this.forceUpdate(); } else this._t = setTimeout(go, 40); }; go(); }
  componentWillUnmount() { this._u && this._u(); clearTimeout(this._t); }
  toast(m) { this.setState({ toast: m }); clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toast: '' }), 2600); }
  openTrip(id) { this.setState(s => ({ sec: 'detalle', prevSec: s.sec === 'detalle' ? s.prevSec : s.sec, tripId: id, seatSel: null })); window.scrollTo(0, 0); }
  renderVals() {
    if (!SD) return { sec: { dashboard: true }, modal: {}, form: {} };
    const s = this.state, st = SD.get(), money = SD.money, NOW = SD.NOW;
    const items = [['dashboard', 'dashboard', 'Dashboard'], ['viajes', 'calendar_month', 'Horarios y viajes'], ['lineas', 'route', 'Líneas y localidades'], ['tarifas', 'sell', 'Tarifas y promos'], ['unidades', 'directions_bus', 'Unidades'], ['pagos', 'payments', 'Historial de pagos'], ['cambios', 'event_repeat', 'Reprog. y cancelaciones'], ['usuarios', 'group', 'Usuarios internos']];
    const active = s.sec === 'detalle' ? 'viajes' : s.sec;
    const menu = items.map(([k, icon, label]) => ({ icon, label, bg: active === k ? '#E4007C' : 'transparent', fg: active === k ? '#fff' : '#CFC6CA', ic: active === k ? '#fff' : '#A69CA1', on: () => this.setState({ sec: k, nav: false }) }));
    const titles = { dashboard: 'Dashboard', viajes: 'Horarios y viajes', detalle: 'Detalle de viaje', lineas: 'Líneas y localidades', tarifas: 'Tarifas y promociones', unidades: 'Unidades', pagos: 'Historial de pagos', cambios: 'Reprogramaciones y cancelaciones', usuarios: 'Usuarios internos' };
    const sec = {}; Object.keys(titles).forEach(k => sec[k] = s.sec === k);
    const pays = SD.payments();
    const ok = pays.filter(p => p.status !== 'rechazado');
    const today = ok.filter(p => SD.sameDay(p.date, NOW));
    const month = ok.filter(p => new Date(p.date).getMonth() === 9);
    const sumA = a => a.reduce((x, p) => x + p.amount, 0);
    const paxN = a => a.reduce((x, p) => x + p.pax, 0);
    const trips = SD.monthTrips();
    const next = trips.filter(t => t.dep > NOW).sort((a, b) => a.dep - b.dep);
    const next8 = next.slice(0, 8);
    const avg7 = (() => { const n = next.filter(t => t.dep - NOW < 7 * 864e5 && !t.cancelled); return n.length ? Math.round(n.reduce((a, t) => a + SD.avail(t).pct, 0) / n.length) : 0; })();
    const pending = ok.filter(p => p.status === 'pendiente').length;
    const kpis = [
      { label: 'Ventas de hoy', value: money(sumA(today)), sub: paxN(today) + ' pasajes vendidos', subFg: '#147A52' },
      { label: 'Ventas de octubre', value: money(sumA(month)), sub: paxN(month) + ' pasajes · mes del aniversario', subFg: '#6B6468' },
      { label: 'Ocupación próximos 7 días', value: avg7 + '%', sub: next.filter(t => t.dep - NOW < 7 * 864e5).length + ' viajes programados', subFg: '#6B6468' },
      { label: 'Pagos pendientes', value: String(pending), sub: 'Efectivo en Rapipago / Pago Fácil', subFg: pending ? '#8A5A00' : '#6B6468' }
    ];
    const occBars = next8.map(t => { const a = SD.avail(t); return { pct: a.pct, h: Math.max(4, a.pct), bg: t.cancelled ? '#D9D1D5' : t.line === 'T' ? 'linear-gradient(180deg,#FF4FA0,#E4007C)' : '#1D1A1C', l1: SD.dshort(t.date).slice(0, 6), l2: SD.hm(t.depMin) + (t.dir === 'ida' ? ' ↑' : ' ↓'), title: t.route + ' · ' + SD.dshort(t.date), on: () => this.openTrip(t.id) }; });
    const chCols = { Online: '#E4007C', Mostrador: '#1D1A1C', WhatsApp: '#25D366' };
    const mTot = sumA(month) || 1;
    const channels = ['Online', 'Mostrador', 'WhatsApp'].map(c => { const a = month.filter(p => p.channel === c); return { name: c, color: chCols[c], amount: money(sumA(a)), pct: Math.round(sumA(a) / mTot * 100), count: paxN(a) }; });
    const alerts = [];
    next.filter(t => t.dep - NOW < 4 * 864e5).forEach(t => { const a = SD.avail(t); if (t.cancelled) return; if (a.pct >= 88) alerts.push({ icon: 'local_fire_department', text: 'Casi lleno: ' + t.route + ' · ' + SD.dshort(t.date) + ' ' + SD.hm(t.depMin) + ' (' + a.total + ' libres)', bg: '#FDE6F2', fg: '#A3005A', on: () => this.openTrip(t.id) }); else if (a.pct <= 25) alerts.push({ icon: 'trending_down', text: 'Pocos pasajeros: ' + t.route + ' · ' + SD.dshort(t.date) + ' (' + a.occ + ' de 60)', bg: '#FFF4DB', fg: '#8A5A00', on: () => this.openTrip(t.id) }); });
    st.cancelledTrips.concat(st.scenario.tripCancelled ? [SD.SCEN_CANCEL] : []).forEach(id => { const t = SD.getTrip(id); alerts.push({ icon: 'block', text: 'Cancelado: ' + t.route + ' · ' + SD.dshort(t.date) + ' — pasajeros notificados', bg: '#FBE3E3', fg: '#8E1F1F', on: () => this.openTrip(id) }); });
    const upcoming = next8.map(t => { const a = SD.avail(t); return { date: SD.dshort(t.date), time: SD.hm(t.depMin), route: t.route, car: t.car, azafata: t.crew.azafata, pct: a.pct, occ: t.cancelled ? 'Cancelado' : a.occ + '/60', barBg: a.pct >= 88 ? '#E4007C' : a.pct <= 25 ? '#E59A0B' : '#1D1A1C', on: () => this.openTrip(t.id) }; });
    // week
    const mon = SD.addDays('2026-10-12', s.week * 7);
    const wdays = Array.from({ length: 7 }, (_, i) => SD.addDays(mon, i));
    const week = { label: SD.parse(wdays[0]).getDate() + ' – ' + SD.parse(wdays[6]).getDate() + ' ' + SD.MON[SD.parse(wdays[6]).getMonth()],
      prev: () => this.setState({ week: s.week - 1 }), next: () => this.setState({ week: s.week + 1 }),
      days: wdays.map(d => { const dt = SD.parse(d); const isToday = d === SD.TODAY; return { dow: SD.DOWS[dt.getDay()], num: dt.getDate(), sunday: dt.getDay() === 0, bg: isToday ? '#FDF2F8' : '#fff', numFg: isToday ? '#E4007C' : '#1D1A1C',
        trips: SD.tripsOn(d).sort((a, b) => a.depMin - b.depMin).map(t => { const a = SD.avail(t); const tag = t.cancelled ? 'Cancelado' : t.blocked ? 'Venta bloqueada' : t.special ? 'Especial' : t.past ? 'Finalizado' : ''; return { time: SD.hm(t.depMin), route: t.dir === 'ida' ? t.lineShort + '→Salta' : 'Salta→' + t.lineShort, car: t.car, occ: a.occ + '/60', color: t.line === 'T' ? '#E4007C' : '#1D1A1C', bg: t.cancelled ? '#FBE3E3' : '#F8F5F6', op: t.past ? .6 : 1, hasTag: !!tag, tag, tagFg: t.cancelled ? '#B22A2A' : t.blocked ? '#8A5A00' : '#6B6468', on: () => this.openTrip(t.id) }; }) }; }) };
    // trip detail
    let trip = { seats: [], groups: [] };
    if (s.tripId) {
      const t = SD.getTrip(s.tripId); const seats = SD.seatsFor(t); const a = SD.avail(t); const tks = SD.ticketsOf(t);
      const order = SD.stopsOf(t.line, t.dir);
      const groups = order.map(stp => { const px = tks.filter(k => k.stop === stp).sort((x, y) => x.seat - y.seat); return { stop: t.dir === 'ida' ? stp : 'Baja en ' + stp, time: SD.hm(t.dir === 'ida' ? SD.stopMin(t, stp) : SD.arrMin(t, stp)), count: px.length + ' pasajeros', pax: px.map(k => ({ seat: k.seat, name: k.nombre + ' ' + k.apellido, dni: SD.dni(k.dni), channel: k.channel, cls: k.cud ? 'CUD' : k.cls === 'semi' ? 'Semicama' : 'Cama', hl: s.seatSel === k.seat ? '#FDE6F2' : 'transparent' })) }; }).filter(g => g.pax.length);
      trip = { line: t.lineName, special: t.special, blocked: t.blocked, cancelled: t.cancelled, route: t.route, when: SD.when(t, order[0]).full, car: t.car, chofer: t.crew.chofer, azafata: t.crew.azafata,
        occ: a.occ, free: a.total, revenue: money(tks.reduce((x, k) => x + k.price, 0)), seats, sel: s.seatSel ? [s.seatSel] : [], pickSeat: x => this.setState({ seatSel: x.n }),
        groups, noPax: !groups.length, canCancel: !t.cancelled && !t.past,
        export: () => this.toast('Nómina exportada: ' + tks.length + ' pasajeros (PDF / Excel)'),
        blockLabel: t.blocked ? 'Habilitar venta' : 'Bloquear venta',
        toggleBlock: () => SD.set(x => ({ blockedTrips: t.blocked ? x.blockedTrips.filter(i => i !== t.id) : x.blockedTrips.concat([t.id]) })),
        openCancel: () => this.setState({ modal: 'cancel', form: { reason: 'Corte de ruta', msg: 'Hola, te avisamos desde Expreso Sofía que el viaje ' + t.route + ' del ' + SD.dlong(t.date) + ' fue cancelado. Podés reprogramar sin cargo o pedir el reembolso total desde Mis pasajes. Disculpá las molestias.', email: true, wa: true, done: false, n: tks.length } }) };
    }
    // lineas
    const stopsOfL = L => (st.stopsEdit && st.stopsEdit[L]) || SD.LINES[L].stops.map(x => ({ name: x[0], min: x[1] }));
    const lineas = ['T', 'O'].map(L => { const l = SD.LINES[L]; const stops = (st.stopsEdit && st.stopsEdit[L]) || l.stops.map(x => ({ name: x[0], min: x[1] }));
      return { name: l.name, sub: 'Lunes a sábado · Sale ' + SD.hm(l.stops[0][1]) + ' hs · Vuelta desde Salta ' + SD.hm(l.vDep) + ' hs',
        add: () => this.setState({ modal: 'parada', form: { L, idx: -1, name: '', time: '', pos: String(stops.length + 1) } }),
        stops: stops.map((x, i) => ({ ord: i + 1, name: x.name, time: SD.hm(x.min), branch: SD.STOP_BRANCH[x.name] || '—', edit: () => this.setState({ modal: 'parada', form: { L, idx: i, name: x.name, time: SD.hm(x.min), pos: String(i + 1) } }), del: () => this.setState({ modal: 'confirm', form: { kind: 'parada', L, idx: i, label: x.name + ' (' + l.name + ')' } }) })) }; });
    // tarifas
    const setFare = (L, c, k, v) => { const n = parseInt(String(v).replace(/\D/g, ''), 10) || 0; SD.set(x => { const f = JSON.parse(JSON.stringify(x.fares)); f[L][c][k] = n; return { fares: f }; }); };
    const fares = [['T', 'semi'], ['T', 'cama'], ['O', 'semi'], ['O', 'cama']].map(([L, c]) => { const f = st.fares[L][c]; return { label: SD.LINES[L].name + ' · ' + (c === 'semi' ? 'Semicama' : 'Cama'), ida: f.ida.toLocaleString('es-AR'), iv: f.iv.toLocaleString('es-AR'), saving: money(f.ida * 2 - f.iv), where: c === 'semi' ? 'Planta alta' : 'Planta baja', onIda: e => setFare(L, c, 'ida', e.target.value), onIv: e => setFare(L, c, 'iv', e.target.value) }; });
    const promos = st.promos.map(p => ({ name: p.name, desc: p.desc, vig: SD.parse(p.from).getDate() + '/' + (SD.parse(p.from).getMonth() + 1) + ' al ' + SD.parse(p.to).getDate() + '/' + (SD.parse(p.to).getMonth() + 1), pct: p.pct ? p.pct + '% off' : 'Tarifa combinada', track: p.active ? '#E4007C' : '#D9D1D5', knob: p.active ? 19 : 3, state: p.active ? 'Activa' : 'Pausada', toggle: () => SD.set(x => ({ promos: x.promos.map(q => q.id === p.id ? Object.assign({}, q, { active: !q.active }) : q) })) }));
    // unidades
    const units = st.units.slice().sort((a, b) => a.n - b.n).map(u => ({ n: u.n, line: SD.LINES[u.line].name, plate: u.plate, pos: u.pos, status: u.status, sBg: u.status === 'En servicio' ? '#DDF3E8' : '#FFF4DB', sFg: u.status === 'En servicio' ? '#147A52' : '#8A5A00',
      edit: () => this.setState({ modal: 'unit', form: { id: u.id, n: String(u.n), plate: u.plate, line: u.line, status: u.status } }),
      del: () => this.setState({ modal: 'confirm', form: { kind: 'unit', id: u.id, label: 'Coche N° ' + u.n + ' · ' + u.plate } }) }));
    // pagos
    const pf = s.pf;
    const setPf = (k, v) => this.setState({ pf: Object.assign({}, pf, { [k]: v }) });
    const per = { 'Hoy': 1, 'Últimos 7 días': 7, 'Octubre': 31 };
    const fp = pays.filter(p => (NOW - p.date) < per[pf.period] * 864e5 && (pf.period !== 'Hoy' || SD.sameDay(p.date, NOW)) && (pf.line === 'Todas' || p.line === pf.line) && (pf.channel === 'Todos' || p.channel === pf.channel) && (pf.status === 'Todos' || p.status === pf.status.toLowerCase()));
    const stCol = { aprobado: ['#DDF3E8', '#147A52', 'Aprobado'], pendiente: ['#FFF4DB', '#8A5A00', 'Pendiente'], rechazado: ['#FBE3E3', '#B22A2A', 'Rechazado'] };
    const payRows = fp.slice(0, 30).map(p => ({ date: SD.fmtDate(p.date), code: p.code, payer: p.payer + (p.pax > 1 ? ' +' + (p.pax - 1) : ''), line: p.line.replace('Línea ', ''), channel: p.channel, method: p.method, status: stCol[p.status][2], sBg: stCol[p.status][0], sFg: stCol[p.status][1], amount: money(p.amount), bg: p.tickets.some(t => !t.gen) && p.channel === 'Online' ? '#FFFBFD' : '#fff', on: () => this.setState({ modal: 'pay', form: { code: p.code, date: p.date } }) }));
    const payFilters = [['period', 'Período', ['Hoy', 'Últimos 7 días', 'Octubre']], ['line', 'Línea', ['Todas', 'Línea Tartagal', 'Línea Orán']], ['channel', 'Canal', ['Todos', 'Online', 'Mostrador', 'WhatsApp']], ['status', 'Estado', ['Todos', 'Aprobado', 'Pendiente', 'Rechazado']]].map(([k, label, options]) => ({ label, options, value: pf[k], on: e => setPf(k, e.target.value) }));
    const payStats = { count: fp.length + ' pagos', total: money(sumA(fp.filter(p => p.status !== 'rechazado'))), showing: 'Mostrando ' + Math.min(30, fp.length) + ' de ' + fp.length + ' · ordenado por fecha' };
    const pd = s.modal === 'pay' ? pays.find(p => p.code === s.form.code && p.date === s.form.date) : null;
    const payDetail = pd ? { rows: [['Código', pd.code], ['Fecha', SD.fmtDate(pd.date) + ' hs'], ['Pagador', pd.payer], ['DNI', SD.dni(pd.dni)], ['Canal', pd.channel], ['Medio', pd.method], ['Sucursal', pd.branch], ['Vendedor', pd.seller], ['Estado', stCol[pd.status][2]], ['Monto', money(pd.amount)]].map(([k, v]) => ({ k, v })), tickets: pd.tickets.map(t => { const v = SD.view(t); return { name: v.name, route: v.route, date: SD.dshort(SD.getTrip(t.tripId).date), seat: t.seat, price: v.price }; }), none: !pd.tickets.length } : { rows: [], tickets: [] };
    // cambios
    const tCol = { 'Reprogramación': ['#EEF0FF', '#3C3F9E'], 'Cancelación': ['#FBE3E3', '#B22A2A'], 'Viaje cancelado': ['#1D1A1C', '#fff'] };
    const chgFilters = ['Todas', 'Reprogramación', 'Cancelación', 'Viaje cancelado'].map(f => ({ label: f, bg: s.cf === f ? '#1D1A1C' : '#fff', fg: s.cf === f ? '#fff' : '#1D1A1C', bd: s.cf === f ? '#1D1A1C' : '#E2D9DE', on: () => this.setState({ cf: f }) }));
    const chgRows = st.changes.filter(c => s.cf === 'Todas' || c.type === s.cf).map(c => ({ date: SD.fmtDate(c.date), code: c.code, pax: c.pax, type: c.type, tBg: tCol[c.type][0], tFg: tCol[c.type][1], from: c.from, to: c.to, reason: c.reason, fee: c.fee ? money(c.fee) : '—', refund: c.refund ? money(c.refund) : '—', user: c.user + ' · ' + c.branch }));
    // usuarios
    const setUser = (id, p) => SD.set(x => ({ users: x.users.map(u => u.id === id ? Object.assign({}, u, p) : u) }));
    const roleFilters = ['Todos', 'Administrador', 'Vendedor', 'Staff de viaje'].map(f => ({ label: f, bg: s.rf === f ? '#1D1A1C' : '#fff', fg: s.rf === f ? '#fff' : '#1D1A1C', bd: s.rf === f ? '#1D1A1C' : '#E2D9DE', on: () => this.setState({ rf: f }) }));
    const userRows = st.users.filter(u => s.rf === 'Todos' || u.rol === s.rf).map(u => ({ nombre: u.nombre + (u.puesto ? ' · ' + u.puesto : ''), email: u.email, rol: u.rol, sucursal: u.sucursal, ini: u.nombre.split(' ').map(w => w[0]).join('').slice(0, 2), op: u.activo ? 1 : .55, track: u.activo ? '#1F9D6B' : '#D9D1D5', knob: u.activo ? 19 : 3, state: u.activo ? 'Activo' : 'Inactivo', toggle: () => setUser(u.id, { activo: !u.activo }), onRol: e => setUser(u.id, { rol: e.target.value }), onSuc: e => setUser(u.id, { sucursal: e.target.value }) }));
    const branchNames = SD.BRANCHES.map(b => b.name);
    // modal + forms
    const f = s.form || {};
    const setF = p => this.setState({ form: Object.assign({}, this.state.form, p) });
    const titlesM = { cancel: 'Cancelar viaje completo', create: 'Crear viaje', parada: f.idx === -1 ? 'Nueva parada' : 'Editar parada', promo: 'Nueva promoción', user: 'Nuevo usuario', pay: 'Detalle del pago', unit: f.id ? 'Editar coche' : 'Nuevo coche', confirm: f.kind === 'unit' ? 'Eliminar coche' : 'Eliminar parada' };
    const close = () => this.setState({ modal: null });
    const people = st.users.filter(u => u.rol === 'Staff de viaje');
    const modal = { open: !!s.modal, title: titlesM[s.modal] || '', close, isCancel: s.modal === 'cancel', isCreate: s.modal === 'create', isSimple: ['parada', 'promo', 'user', 'unit'].includes(s.modal), isPay: s.modal === 'pay', isConfirm: s.modal === 'confirm', confirmText: s.modal === 'confirm' ? '¿Seguro que querés eliminar ' + f.label + '? Esta acción no se puede deshacer.' : '',
      cancelDone: !!f.done, cancelForm: !f.done, paxCount: (f.n || 0) + ' pasajeros', cancelWarn: 'Se cancelará ' + (trip.route || '') + ' (' + (trip.when || '') + '). Hay ' + (f.n || 0) + ' pasajeros con pasaje: se les ofrecerá reprogramar sin cargo o reembolso total.', doneText: 'Enviamos el aviso a ' + (f.n || 0) + ' pasajeros' + (f.email && f.wa ? ' por email y WhatsApp' : f.email ? ' por email' : f.wa ? ' por WhatsApp' : '') + '. El viaje quedó cancelado en el sitio y en ventas.' };
    const sel = (label, key, options) => ({ label, isSel: true, isDate: false, value: f[key], options, on: e => setF({ [key]: e.target.value }) });
    const form = {
      reason: f.reason, msg: f.msg, onReason: e => setF({ reason: e.target.value }), onMsg: e => setF({ msg: e.target.value }),
      emailBg: f.email ? '#E4007C' : '#fff', emailMark: f.email ? 'check' : '', waBg: f.wa ? '#E4007C' : '#fff', waMark: f.wa ? 'check' : '', tEmail: () => setF({ email: !f.email }), tWa: () => setF({ wa: !f.wa }),
      confirmDelete: () => { if (f.kind === 'parada') { const cur = stopsOfL(f.L).filter((_, i) => i !== f.idx); SD.set(x => ({ stopsEdit: Object.assign({}, x.stopsEdit, { [f.L]: cur }) })); this.toast('Parada eliminada'); } else { SD.set(x => ({ units: x.units.filter(u => u.id !== f.id) })); this.toast('Coche eliminado de la flota'); } this.setState({ modal: null }); },
      confirmCancel: withConfirm({ title: '¿Cancelar el viaje?', body: 'Se cancelará ' + (trip.route || '') + ' (' + (trip.when || '') + ') y se avisará a ' + (f.n || 0) + ' pasajeros.', confirmLabel: 'Cancelar viaje', cancelLabel: 'No cancelar', danger: true }, () => { SD.cancelTrip(s.tripId, f.reason, 'Ramón Saravia'); setF({ done: true }); }),
      regBg: f.kind !== 'esp' ? '#fff' : 'transparent', regFg: f.kind !== 'esp' ? '#E4007C' : '#6B6468', espBg: f.kind === 'esp' ? '#fff' : 'transparent', espFg: f.kind === 'esp' ? '#E4007C' : '#6B6468',
      reg: () => setF({ kind: 'reg' }), esp: () => setF({ kind: 'esp' }),
      fields: [sel('Línea', 'L', [{ v: 'T', l: 'Línea Tartagal' }, { v: 'O', l: 'Línea Orán' }]), sel('Sentido', 'dir', [{ v: 'ida', l: 'Hacia Salta (madrugada)' }, { v: 'vuelta', l: 'Desde Salta (tarde)' }]), { label: 'Fecha', isDate: true, isSel: false, value: f.date, on: e => setF({ date: e.target.value }) }, sel('Coche', 'car', st.units.map(u => ({ v: String(u.n), l: 'Coche N° ' + u.n }))), sel('Chofer', 'chofer', people.filter(u => u.puesto === 'Chofer').map(u => ({ v: u.nombre, l: u.nombre }))), sel('Azafata', 'azafata', people.filter(u => u.puesto === 'Azafata').map(u => ({ v: u.nombre, l: u.nombre })))],
      err: f.err || '',
      create: () => { if (!f.date) return setF({ err: 'Elegí una fecha.' }); const exists = SD.tripsOn(f.date).find(t => t.line === f.L && t.dir === f.dir); if (exists) return setF({ err: 'Ya existe ese viaje para la fecha. Podés abrirlo desde el calendario.' }); SD.set(x => ({ specialTrips: x.specialTrips.concat([{ line: f.L, dir: f.dir, date: f.date }]) })); this.setState({ modal: null }); this.toast('Viaje creado y habilitado para la venta'); },
      simple: s.modal === 'parada' ? [{ label: 'Nombre de la parada', key: 'name' }, { label: 'Hora de paso (hh:mm)', key: 'time', ph: '01:10' }, { label: 'Orden en el recorrido', key: 'pos', type: 'number' }].map(x => ({ label: x.label, isInput: true, isSel: false, type: x.type || 'text', ph: x.ph || '', value: f[x.key] || '', on: e => setF({ [x.key]: e.target.value }) }))
        : s.modal === 'promo' ? [{ label: 'Nombre', key: 'name', ph: 'Ej. Día de la Madre' }, { label: 'Descuento (%)', key: 'pct', type: 'number' }, { label: 'Desde', key: 'from', type: 'date' }, { label: 'Hasta', key: 'to', type: 'date' }].map(x => ({ label: x.label, isInput: true, isSel: false, type: x.type || 'text', ph: x.ph || '', value: f[x.key] || '', on: e => setF({ [x.key]: e.target.value }) }))
        : s.modal === 'unit' ? [{ label: 'Número de coche', key: 'n', type: 'number', ph: 'Ej. 24' }, { label: 'Patente', key: 'plate', ph: 'AB 123 CD' }].map(x => ({ label: x.label, isInput: true, isSel: false, type: x.type || 'text', ph: x.ph || '', value: f[x.key] || '', on: e => setF({ [x.key]: e.target.value, err: '' }) })).concat([{ label: 'Línea asignada', isSel: true, isInput: false, value: f.line, options: [{ v: 'T', l: 'Línea Tartagal' }, { v: 'O', l: 'Línea Orán' }], on: e => setF({ line: e.target.value }) }, { label: 'Estado', isSel: true, isInput: false, value: f.status, options: ['En servicio', 'En taller', 'Fuera de servicio'].map(v => ({ v, l: v })), on: e => setF({ status: e.target.value }) }])
        : s.modal === 'user' ? [{ label: 'Nombre y apellido', key: 'nombre' }, { label: 'Email', key: 'email', type: 'email' }].map(x => ({ label: x.label, isInput: true, isSel: false, type: x.type || 'text', ph: '', value: f[x.key] || '', on: e => setF({ [x.key]: e.target.value }) })).concat([{ label: 'Rol', isSel: true, isInput: false, value: f.rol, options: ['Vendedor', 'Staff de viaje', 'Administrador'], on: e => setF({ rol: e.target.value }) }, { label: 'Sucursal', isSel: true, isInput: false, value: f.sucursal, options: branchNames, on: e => setF({ sucursal: e.target.value }) }]) : [],
      save: () => {
        if (s.modal === 'parada') { const L = f.L; const cur = stopsOfL(L).slice(); const [hh, mm] = String(f.time || '00:00').split(':').map(Number); const item = { name: f.name || 'Nueva parada', min: (hh || 0) * 60 + (mm || 0) }; if (f.idx >= 0) cur.splice(f.idx, 1); cur.splice(Math.max(0, Math.min(cur.length, (parseInt(f.pos, 10) || cur.length + 1) - 1)), 0, item); SD.set(x => ({ stopsEdit: Object.assign({}, x.stopsEdit, { [L]: cur }) })); this.setState({ modal: null }); this.toast('Parada guardada'); }
        if (s.modal === 'unit') { const n = parseInt(f.n, 10); if (!n) return setF({ err: 'Ingresá el número de coche.' }); if (st.units.some(u => u.n === n && u.id !== f.id)) return setF({ err: 'Ya existe un coche con ese número.' }); const data = { n, plate: (f.plate || '').toUpperCase() || 'Sin patente', line: f.line || 'T', status: f.status || 'En servicio' }; SD.set(x => ({ units: f.id ? x.units.map(u => u.id === f.id ? Object.assign({}, u, data) : u) : x.units.concat([Object.assign({ id: 'c' + Date.now(), pos: ['0% 0%', '100% 0%', '0% 100%', '100% 100%'][x.units.length % 4] }, data)]) })); this.setState({ modal: null }); this.toast(f.id ? 'Coche actualizado' : 'Coche agregado a la flota'); }
        if (s.modal === 'promo') { SD.set(x => ({ promos: x.promos.concat([{ id: 'p' + Date.now(), name: f.name || 'Promoción', desc: (f.pct || 0) + '% off en pasajes online', lines: 'Ambas', from: f.from || SD.TODAY, to: f.to || SD.addDays(SD.TODAY, 15), pct: parseInt(f.pct, 10) || 0, active: true }]) })); this.setState({ modal: null }); this.toast('Promoción creada'); }
        if (s.modal === 'user') { SD.set(x => ({ users: x.users.concat([{ id: 'u' + Date.now(), nombre: f.nombre || 'Nuevo usuario', email: f.email || 'nuevo@expresosofia.com.ar', rol: f.rol || 'Vendedor', sucursal: f.sucursal || 'Salta Capital', activo: true }]) })); this.setState({ modal: null }); this.toast('Usuario creado. Le enviamos un email para activar la cuenta.'); }
      }
    };
    return { menu, navOpen: !!s.nav, toggleNav: () => this.setState({ nav: !s.nav }), closeNav: () => this.setState({ nav: false }), title: titles[s.sec], sec, kpis, occBars, channels, alerts: alerts.slice(0, 5), upcoming, week, trip, back: () => this.setState({ sec: s.prevSec || 'viajes' }),
      openCreate: () => this.setState({ modal: 'create', form: { kind: 'esp', L: 'T', dir: 'vuelta', date: '2026-10-25', car: '22', chofer: 'Sergio Ibarra', azafata: 'Micaela Flores' } }),
      lineas, fares, promos, openPromo: () => this.setState({ modal: 'promo', form: {} }), units, openUnit: () => this.setState({ modal: 'unit', form: { n: '', plate: '', line: 'T', status: 'En servicio' } }),
      payFilters, payRows, payStats, payEmpty: !fp.length, resetPf: () => this.setState({ pf: { period: 'Octubre', line: 'Todas', channel: 'Todos', status: 'Todos' } }), chgEmpty: !chgRows.length, chgAll: () => this.setState({ cf: 'Todas' }), userEmpty: !userRows.length, userAll: () => this.setState({ rf: 'Todos' }), saveFares: () => this.toast('Tarifas guardadas'), payDetail, chgFilters, chgRows, roleFilters, userRows, branchNames, openUser: () => this.setState({ modal: 'user', form: { rol: 'Vendedor', sucursal: 'Salta Capital' } }),
      modal, form, stop: e => e.stopPropagation(), toast: s.toast };
  }

  render() {
    const $: any = this.renderVals();
    return (<>

<div style={css("display:flex;min-height:100vh;background:#F7F4F5;font-family:'Barlow',system-ui,sans-serif;color:#1D1A1C")}>
  {!!($.navOpen) && (<div className="adm-backdrop mob-only" onClick={$.closeNav} />)}
  <aside className={'adm-aside' + ($.navOpen ? ' open' : '')} style={css("width:236px;flex:none;background:#1D1A1C;color:#CFC6CA;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;padding:16px 12px;gap:4px;overflow-y:auto")}>
    <div style={css("background:#fff;border-radius:14px;padding:8px 10px;margin:0 4px 14px;display:flex;justify-content:center")}><img src="/assets/logo.png" alt="Expreso Sofía" style={css("height:46px")} /></div>
    <div style={css("font:700 10.5px 'Barlow',sans-serif;letter-spacing:.14em;color:#A69CA1;padding:6px 10px")}>ADMINISTRACIÓN</div>
    {(Array.isArray($.menu) ? $.menu : []).map((m: any, $index: number) => (<React.Fragment key={$index}>
      <button onClick={m?.on} style={css(`display:flex;align-items:center;gap:10px;border:none;cursor:pointer;height:40px;flex:none;padding:0 12px;border-radius:10px;background:${m?.bg ?? ''};color:${m?.fg ?? ''};font:600 14px 'Barlow',sans-serif;text-align:left`)}><span style={css(`font-family:'Material Symbols Rounded';font-size:20px;color:${m?.ic ?? ''}`)}>{m?.icon}</span>{m?.label}</button>
    </React.Fragment>))}
    <div style={css("margin-top:auto;border-top:1px solid #3A3437;padding:12px 10px 70px;display:flex;align-items:center;gap:10px")}>
      <span style={css("width:34px;height:34px;border-radius:50%;background:#E4007C;color:#fff;display:flex;align-items:center;justify-content:center;font:800 13px 'Barlow',sans-serif")}>RS</span>
      <div style={css("min-width:0")}><div style={css("font:700 13px 'Barlow',sans-serif;color:#fff")}>Ramón Saravia</div><div style={css("font:500 12px 'Barlow',sans-serif")}>Administrador</div></div>
    </div>
  </aside>

  <main style={css("flex:1;min-width:0;display:flex;flex-direction:column")}>
    <div className="r-pad" style={css("height:64px;flex:none;background:#fff;border-bottom:1px solid #EFE8EC;display:flex;align-items:center;justify-content:space-between;padding:0 28px;gap:16px;position:sticky;top:0;z-index:5")}>
      <div style={css("display:flex;align-items:center;gap:10px;min-width:0")}>
        <button className="mob-only" onClick={$.toggleNav} aria-label="Abrir menú" style={css("width:40px;height:40px;flex:none;border:none;border-radius:10px;background:#F3EEF1;color:#1D1A1C;cursor:pointer;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:22px")}>menu</button>
        <div style={css("font:800 24px 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{$.title}</div>
      </div>
      <div className="r-badgegap desk-only" style={css("display:flex;align-items:center;gap:14px;font:600 13px 'Barlow',sans-serif;color:#6B6468")}><span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>calendar_today</span>Viernes 16 de octubre · 20:30 hs</div>
    </div>
    <div className="r-pad" style={css("padding:24px 28px 100px;display:flex;flex-direction:column;gap:20px;max-width:1400px;width:100%")}>

      
      {!!($.sec?.dashboard) && (<>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px")}>
          {(Array.isArray($.kpis) ? $.kpis : []).map((k: any, $index: number) => (<React.Fragment key={$index}>
            <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:4px")}>
              <div style={css("font:600 12.5px 'Barlow',sans-serif;color:#6B6468")}>{k?.label}</div>
              <div style={css("font:800 32px/1.05 'Barlow Condensed',sans-serif")}>{k?.value}</div>
              <div style={css(`font:600 12px 'Barlow',sans-serif;color:${k?.subFg ?? ''}`)}>{k?.sub}</div>
            </div>
          </React.Fragment>))}
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:14px")}>
          <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:14px")}>
            <div style={css("display:flex;justify-content:space-between;align-items:center")}><div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Ocupación por viaje</div><div style={css("font:600 12px 'Barlow',sans-serif;color:#716A6E")}>Próximos viajes · 60 butacas</div></div>
            <div style={css("display:flex;align-items:flex-end;gap:10px;height:200px;border-bottom:1px solid #EFE8EC;padding-bottom:0")}>
              {(Array.isArray($.occBars) ? $.occBars : []).map((b: any, $index: number) => (<React.Fragment key={$index}>
                <button onClick={b?.on} title={b?.title} style={css("flex:1;min-width:0;height:100%;border:none;background:none;padding:0;cursor:pointer;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px")}>
                  <span style={css("font:700 12px 'Barlow',sans-serif;color:#4A4447")}>{b?.pct}%</span>
                  <span style={css(`width:100%;max-width:44px;height:${b?.h ?? ''}%;border-radius:8px 8px 0 0;background:${b?.bg ?? ''}`)}></span>
                </button>
              </React.Fragment>))}
            </div>
            <div style={css("display:flex;gap:10px")}>
              {(Array.isArray($.occBars) ? $.occBars : []).map((b: any, $index: number) => (<React.Fragment key={$index}><div style={css("flex:1;min-width:0;text-align:center;font:600 11px/1.25 'Barlow',sans-serif;color:#6B6468")}>{b?.l1}<br /><span style={css("color:#1D1A1C")}>{b?.l2}</span></div></React.Fragment>))}
            </div>
            <div style={css("display:flex;gap:16px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}><span style={css("display:flex;align-items:center;gap:6px")}><span style={css("width:12px;height:12px;border-radius:3px;background:#E4007C")}></span>Línea Tartagal</span><span style={css("display:flex;align-items:center;gap:6px")}><span style={css("width:12px;height:12px;border-radius:3px;background:#1D1A1C")}></span>Línea Orán</span></div>
          </div>
          <div style={css("display:flex;flex-direction:column;gap:14px")}>
            <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:12px")}>
              <div style={css("display:flex;justify-content:space-between;align-items:center")}><div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Ventas por canal</div><div style={css("font:600 12px 'Barlow',sans-serif;color:#716A6E")}>Octubre</div></div>
              <div style={css("display:flex;height:16px;border-radius:999px;overflow:hidden")}>
                {(Array.isArray($.channels) ? $.channels : []).map((c: any, $index: number) => (<React.Fragment key={$index}><span style={css(`width:${c?.pct ?? ''}%;background:${c?.color ?? ''}`)}></span></React.Fragment>))}
              </div>
              {(Array.isArray($.channels) ? $.channels : []).map((c: any, $index: number) => (<React.Fragment key={$index}>
                <div style={css("display:flex;justify-content:space-between;align-items:center;font:600 14px 'Barlow',sans-serif")}><span style={css("display:flex;align-items:center;gap:8px")}><span style={css(`width:10px;height:10px;border-radius:50%;background:${c?.color ?? ''}`)}></span>{c?.name}</span><span><strong>{c?.amount}</strong>{" "}<span style={css("color:#716A6E;font-weight:500")}>· {c?.pct}% · {c?.count} pasajes</span></span></div>
              </React.Fragment>))}
            </div>
            <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px")}>
              <div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Alertas</div>
              {(Array.isArray($.alerts) ? $.alerts : []).map((a: any, $index: number) => (<React.Fragment key={$index}>
                <button onClick={a?.on} style={css(`display:flex;gap:10px;align-items:center;border:none;border-radius:12px;padding:10px 12px;background:${a?.bg ?? ''};color:${a?.fg ?? ''};cursor:pointer;text-align:left;font:600 13.5px 'Barlow',sans-serif`)}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>{a?.icon}</span><span style={css("flex:1")}>{a?.text}</span><span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>chevron_right</span></button>
              </React.Fragment>))}
            </div>
          </div>
        </div>
        <div className="r-card" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
          <div style={css("padding:16px 18px;font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Próximos viajes</div>
          <div className="r-row" style={css("display:grid;grid-template-columns:1.4fr 1.2fr .6fr 1fr 1.6fr 110px;padding:10px 18px;background:#FAF8F9;font:700 11px 'Barlow',sans-serif;letter-spacing:.08em;color:#716A6E;text-transform:uppercase;gap:10px")}><span>Salida</span><span>Recorrido</span><span>Coche</span><span>Azafata</span><span>Ocupación</span><span></span></div>
          {(Array.isArray($.upcoming) ? $.upcoming : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
            <div className="r-row" style={css("display:grid;grid-template-columns:1.4fr 1.2fr .6fr 1fr 1.6fr 110px;padding:12px 18px;border-top:1px solid #F3EDF0;align-items:center;gap:10px;font:500 14px 'Barlow',sans-serif")}>
              <span><strong>{t?.date}</strong> · {t?.time} hs</span><span>{t?.route}</span><span>N° {t?.car}</span><span>{t?.azafata}</span>
              <span style={css("display:flex;align-items:center;gap:8px")}><span style={css("flex:1;height:8px;border-radius:8px;background:#F1ECEF;overflow:hidden")}><span style={css(`display:block;height:100%;width:${t?.pct ?? ''}%;background:${t?.barBg ?? ''}`)}></span></span><span style={css("font:700 13px 'Barlow',sans-serif;width:70px")}>{t?.occ}</span></span>
              <button onClick={t?.on} style={css("height:40px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;font:700 12.5px 'Barlow',sans-serif;cursor:pointer;color:#1D1A1C")}>Ver detalle</button>
            </div>
          </React.Fragment>))}
          <CardList items={($.upcoming || []).map((t: any) => ({ title: t.route, subtitle: t.date + ' · ' + t.time + ' hs', value: t.occ, details: [['Salida', t.date + ' · ' + t.time + ' hs'], ['Recorrido', t.route], ['Coche', 'N° ' + t.car], ['Azafata', t.azafata], ['Ocupación', t.occ + ' (' + t.pct + '%)']], actions: [{ label: 'Ver detalle del viaje', on: t.on, primary: true }] }))} />
        </div>
      </>)}

      
      {!!($.sec?.viajes) && (<>
        <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap")}>
          <div style={css("display:flex;align-items:center;gap:8px")}>
            <button onClick={$.week?.prev} style={css("width:40px;height:40px;border-radius:50%;border:1.5px solid #E2D9DE;background:#fff;cursor:pointer;font-family:'Material Symbols Rounded';font-size:20px")}>chevron_left</button>
            <div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase;min-width:220px;text-align:center")}>{$.week?.label}</div>
            <button onClick={$.week?.next} style={css("width:40px;height:40px;border-radius:50%;border:1.5px solid #E2D9DE;background:#fff;cursor:pointer;font-family:'Material Symbols Rounded';font-size:20px")}>chevron_right</button>
          </div>
          <button onClick={$.openCreate} style={css("height:48px;padding:0 18px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 15px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>add</span>Crear viaje</button>
        </div>
        <div className="r-week" style={css("display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px")}>
          {(Array.isArray($.week?.days) ? $.week?.days : []).map((d: any, $index: number) => (<React.Fragment key={$index}>
            <div style={css(`background:${d?.bg ?? ''};border:1px solid #EFE8EC;border-radius:14px;padding:10px;display:flex;flex-direction:column;gap:8px;min-height:340px`)}>
              <div style={css("display:flex;justify-content:space-between;align-items:baseline")}><span style={css("font:700 12px 'Barlow',sans-serif;text-transform:uppercase;color:#6B6468")}>{d?.dow}</span><span style={css(`font:800 22px 'Barlow Condensed',sans-serif;color:${d?.numFg ?? ''}`)}>{d?.num}</span></div>
              {!!(d?.sunday) && (<><span style={css("align-self:flex-start;background:#1D1A1C;color:#fff;border-radius:999px;padding:3px 8px;font:700 10.5px 'Barlow',sans-serif")}>Especiales</span></>)}
              {!(d?.trips || []).length && <EmptyState icon="event_busy" title="Sin viajes" text={d?.sunday ? 'Podés crear un viaje especial.' : undefined} />}
              {(Array.isArray(d?.trips) ? d?.trips : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
                <button onClick={t?.on} style={css(`border:none;border-left:4px solid ${t?.color ?? ''};background:${t?.bg ?? ''};border-radius:8px;padding:8px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:3px;opacity:${t?.op ?? ''}`)}>
                  <span style={css("font:800 15px 'Barlow Condensed',sans-serif;color:#1D1A1C")}>{t?.time} · {t?.route}</span>
                  <span style={css("font:500 11.5px 'Barlow',sans-serif;color:#6B6468")}>Coche {t?.car} · {t?.occ}</span>
                  {!!(t?.hasTag) && (<><span style={css(`font:700 10.5px 'Barlow',sans-serif;color:${t?.tagFg ?? ''}`)}>{t?.tag}</span></>)}
                </button>
              </React.Fragment>))}
            </div>
          </React.Fragment>))}
        </div>
      </>)}

      
      {!!($.sec?.detalle) && (<>
        <button onClick={$.back} style={css("align-self:flex-start;border:none;background:none;padding:0;cursor:pointer;display:flex;align-items:center;gap:4px;font:600 14px 'Barlow',sans-serif;color:#E4007C")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>arrow_back</span>Volver</button>
        {!!($.trip?.cancelled) && (<><div style={css("background:#FBE3E3;color:#8E1F1F;border-radius:14px;padding:12px 16px;font:700 14px 'Barlow',sans-serif;display:flex;gap:8px;align-items:center")}><span style={css("font-family:'Material Symbols Rounded';font-size:20px")}>block</span>Viaje cancelado por la empresa. Se avisó a los pasajeros por email y WhatsApp.</div></>)}
        <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:18px;display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:space-between")}>
          <div style={css("display:flex;flex-direction:column;gap:4px")}>
            <div style={css("display:flex;gap:6px")}><span style={css("background:#FDE6F2;color:#A3005A;border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif")}>{$.trip?.line}</span>{!!($.trip?.special) && (<><span style={css("background:#1D1A1C;color:#fff;border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif")}>Especial</span></>)}{!!($.trip?.blocked) && (<><span style={css("background:#FFF4DB;color:#8A5A00;border-radius:999px;padding:4px 10px;font:700 12px 'Barlow',sans-serif")}>Venta bloqueada</span></>)}</div>
            <div style={css("font:800 30px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.trip?.route}</div>
            <div style={css("font:600 14px 'Barlow',sans-serif;color:#4A4447")}>{$.trip?.when}</div>
            <div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>Coche N° {$.trip?.car} · Choferes: {$.trip?.chofer} · Azafata: {$.trip?.azafata}</div>
          </div>
          <div style={css("display:flex;gap:18px;align-items:center")}>
            <div style={css("text-align:center")}><div style={css("font:800 34px/1 'Barlow Condensed',sans-serif")}>{$.trip?.occ}</div><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>ocupados</div></div>
            <div style={css("text-align:center")}><div style={css("font:800 34px/1 'Barlow Condensed',sans-serif;color:#147A52")}>{$.trip?.free}</div><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>libres</div></div>
            <div style={css("text-align:center")}><div style={css("font:800 34px/1 'Barlow Condensed',sans-serif;color:#E4007C")}>{$.trip?.revenue}</div><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>recaudado</div></div>
          </div>
          <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
            <button onClick={$.trip?.export} style={css("height:40px;padding:0 14px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;font:700 13px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;color:#1D1A1C")}><span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>download</span>Exportar nómina</button>
            <button onClick={$.trip?.toggleBlock} style={css("height:40px;padding:0 14px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;font:700 13px 'Barlow',sans-serif;cursor:pointer;color:#1D1A1C")}>{$.trip?.blockLabel}</button>
            {!!($.trip?.canCancel) && (<><button onClick={$.trip?.openCancel} style={css("height:40px;padding:0 14px;border:none;border-radius:999px;background:#D33A3A;color:#fff;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Cancelar viaje</button></>)}
          </div>
        </div>
        <div style={css("display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap")}>
          <div className="r-shrink" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;padding:18px;flex:0 0 auto")}>
            <div><SeatMap seats={$.trip?.seats} selected={$.trip?.sel} onToggle={$.trip?.pickSeat} mode="view" layout="stacked" size="34" /></div>
          </div>
          <div className="r-card" style={css("flex:1 1 420px;background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
            <div style={css("padding:16px 18px;display:flex;justify-content:space-between;align-items:center")}><div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Pasajeros por parada</div><div style={css("font:600 12px 'Barlow',sans-serif;color:#716A6E")}>En orden de recorrido</div></div>
            {(Array.isArray($.trip?.groups) ? $.trip?.groups : []).map((g: any, $index: number) => (<React.Fragment key={$index}>
              <div style={css("border-top:1px solid #F3EDF0")}>
                <div style={css("padding:10px 18px;background:#FAF8F9;display:flex;justify-content:space-between;font:700 13px 'Barlow',sans-serif")}><span>{g?.stop} · {g?.time} hs</span><span style={css("color:#E4007C")}>{g?.count}</span></div>
                {(Array.isArray(g?.pax) ? g?.pax : []).map((p: any, $index: number) => (<React.Fragment key={$index}>
                  <div style={css(`display:grid;grid-template-columns:44px minmax(0,1.6fr) minmax(0,1fr);gap:10px;padding:8px 18px;border-top:1px solid #F7F2F4;font:500 13.5px 'Barlow',sans-serif;align-items:center;background:${p?.hl ?? ''}`)}>
                    <span style={css("font:800 15px 'Barlow Condensed',sans-serif;color:#E4007C")}>{p?.seat}</span><span style={css("font-weight:600")}>{p?.name}</span><span style={css("color:#6B6468")}>DNI {p?.dni}</span>
                  </div>
                </React.Fragment>))}
              </div>
            </React.Fragment>))}
            {!!($.trip?.noPax) && <EmptyState icon="group_off" title="Todavía no hay pasajeros en este viaje" text="Cuando se vendan pasajes vas a verlos acá, agrupados por parada." />}
          </div>
        </div>
      </>)}

      
      {!!($.sec?.lineas) && (<>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:16px")}>
          {(Array.isArray($.lineas) ? $.lineas : []).map((l: any, $index: number) => (<React.Fragment key={$index}>
            <div className="r-card" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
              <div style={css("padding:16px 18px;display:flex;justify-content:space-between;align-items:center;gap:10px")}>
                <div><div style={css("font:800 22px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{l?.name}</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>{l?.sub}</div></div>
                <button onClick={l?.add} style={css("height:40px;padding:0 14px;border:1.5px solid #E4007C;border-radius:999px;background:#fff;color:#E4007C;font:700 13px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:4px")}><span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>add</span>Agregar parada</button>
              </div>
              <div className="r-row" style={css("display:grid;grid-template-columns:50px 1.4fr 1fr 1.4fr 150px;gap:10px;padding:9px 18px;background:#FAF8F9;font:700 11px 'Barlow',sans-serif;letter-spacing:.08em;color:#716A6E;text-transform:uppercase")}><span>Orden</span><span>Parada</span><span>Hora de paso</span><span>Sucursal</span><span></span></div>
              {(Array.isArray(l?.stops) ? l?.stops : []).map((s: any, $index: number) => (<React.Fragment key={$index}>
                <div className="r-row" style={css("display:grid;grid-template-columns:50px 1.4fr 1fr 1.4fr 150px;gap:10px;padding:10px 18px;border-top:1px solid #F3EDF0;align-items:center;font:500 14px 'Barlow',sans-serif")}>
                  <span style={css("width:26px;height:26px;border-radius:50%;background:#FDE6F2;color:#A3005A;display:flex;align-items:center;justify-content:center;font:800 12px 'Barlow',sans-serif")}>{s?.ord}</span>
                  <span style={css("font-weight:700")}>{s?.name}</span><span>{s?.time} hs</span><span style={css("color:#6B6468")}>{s?.branch}</span>
                  <span style={css("display:flex;gap:12px;justify-self:end")}><button onClick={s?.edit} style={css("border:none;background:none;padding:0;color:#E4007C;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Editar</button><button onClick={s?.del} style={css("border:none;background:none;padding:0;color:#B22A2A;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Eliminar</button></span>
                </div>
              </React.Fragment>))}
              <CardList items={(l?.stops || []).map((x: any) => ({ title: x.ord + '. ' + x.name, subtitle: x.time + ' hs · ' + x.branch, details: [['Orden', x.ord], ['Parada', x.name], ['Hora de paso', x.time + ' hs'], ['Sucursal', x.branch]], actions: [{ label: 'Editar', on: x.edit }, { label: 'Eliminar', on: x.del, danger: true }] })).concat([{ title: '★ Salta · Terminal', subtitle: '06:30 hs (llegada) · Salta Capital', details: [['Parada', 'Salta · Terminal'], ['Hora', '06:30 hs (llegada)'], ['Sucursal', 'Salta Capital']] }])} />
              <div className="r-row" style={css("display:grid;grid-template-columns:50px 1.4fr 1fr 1.4fr 150px;gap:10px;padding:10px 18px;border-top:1px solid #F3EDF0;align-items:center;font:700 14px 'Barlow',sans-serif;background:#FDF6FA")}><span style={css("width:26px;height:26px;border-radius:50%;background:#E4007C;color:#fff;display:flex;align-items:center;justify-content:center;font:800 12px 'Barlow',sans-serif")}>★</span><span>Salta · Terminal</span><span>06:30 hs (llegada)</span><span style={css("color:#6B6468;font-weight:500")}>Salta Capital</span><span></span></div>
            </div>
          </React.Fragment>))}
        </div>
      </>)}

      
      {!!($.sec?.tarifas) && (<>
        <div onKeyDown={submitOnEnter($.saveFares)} className="r-card" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
          <div style={css("padding:16px 18px;display:flex;justify-content:space-between;align-items:center")}><div><div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Tarifas vigentes</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>Tarifa única por línea, sin importar la parada. Los cambios se reflejan al instante en el sitio y en ventas.</div></div></div>
          <div className="r-row" style={css("display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr 1fr;gap:12px;padding:9px 18px;background:#FAF8F9;font:700 11px 'Barlow',sans-serif;letter-spacing:.08em;color:#716A6E;text-transform:uppercase")}><span>Línea · Clase</span><span>Ida</span><span>Ida y vuelta</span><span>Ahorro i/v</span><span>Ubicación</span></div>
          {(Array.isArray($.fares) ? $.fares : []).map((f: any, $index: number) => (<React.Fragment key={$index}>
            <div className="r-row" style={css("display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr 1fr;gap:12px;padding:10px 18px;border-top:1px solid #F3EDF0;align-items:center;font:500 14px 'Barlow',sans-serif")}>
              <span style={css("font-weight:700")}>{f?.label}</span>
              <label style={css("display:flex;align-items:center;gap:4px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;height:48px;max-width:150px")}><span style={css("color:#716A6E")}>$</span><input value={f?.ida} onChange={f?.onIda} inputMode="numeric" style={css("border:none;width:100%;font:700 15px 'Barlow',sans-serif")} /></label>
              <label style={css("display:flex;align-items:center;gap:4px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;height:48px;max-width:150px")}><span style={css("color:#716A6E")}>$</span><input value={f?.iv} onChange={f?.onIv} inputMode="numeric" style={css("border:none;width:100%;font:700 15px 'Barlow',sans-serif")} /></label>
              <span style={css("color:#147A52;font-weight:700")}>{f?.saving}</span><span style={css("color:#6B6468")}>{f?.where}</span>
            </div>
          </React.Fragment>))}
          <CardList items={($.fares || []).map((x: any) => ({ title: x.label, subtitle: x.where, value: '$' + x.ida, details: [['Ida', <input value={x.ida} onChange={x.onIda} inputMode="numeric" style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;max-width:200px;width:130px;text-align:right")} />], ['Ida y vuelta', <input value={x.iv} onChange={x.onIv} inputMode="numeric" style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;max-width:200px;width:130px;text-align:right")} />], ['Ahorro i/v', x.saving], ['Ubicación', x.where]] }))} />
        </div>
        <div className="r-card" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
          <div style={css("padding:16px 18px;display:flex;justify-content:space-between;align-items:center")}><div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Promociones</div><button onClick={$.openPromo} style={css("height:40px;padding:0 14px;border:1.5px solid #E4007C;border-radius:999px;background:#fff;color:#E4007C;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Nueva promoción</button></div>
          {(Array.isArray($.promos) ? $.promos : []).map((p: any, $index: number) => (<React.Fragment key={$index}>
            <div className="r-row" style={css("display:grid;grid-template-columns:1.6fr 1fr 1fr 120px;gap:12px;padding:12px 18px;border-top:1px solid #F3EDF0;align-items:center;font:500 14px 'Barlow',sans-serif")}>
              <div><div style={css("font-weight:700")}>{p?.name}</div><div style={css("color:#6B6468;font-size:13px")}>{p?.desc}</div></div>
              <span>{p?.vig}</span><span>{p?.pct}</span>
              <button onClick={p?.toggle} style={css("display:flex;align-items:center;gap:8px;border:none;background:none;cursor:pointer;font:700 13px 'Barlow',sans-serif;color:#1D1A1C;justify-self:end")}><span style={css(`width:40px;height:24px;border-radius:999px;background:${p?.track ?? ''};position:relative`)}><span style={css(`position:absolute;top:3px;left:${p?.knob ?? ''}px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25)`)}></span></span>{p?.state}</button>
            </div>
          </React.Fragment>))}
          <CardList items={($.promos || []).map((p: any) => ({ title: p.name, subtitle: p.vig, badge: { label: p.state, bg: p.state === 'Activa' ? '#DDF3E8' : '#F1ECEF', fg: p.state === 'Activa' ? '#147A52' : '#6B6468' }, details: [['Descripción', p.desc], ['Vigencia', p.vig], ['Descuento', p.pct], ['Estado', p.state]], actions: [{ label: p.state === 'Activa' ? 'Pausar promoción' : 'Activar promoción', on: p.toggle }] }))} />
        </div>
      </>)}

      
      {!!($.sec?.unidades) && (<>
        <div style={css("display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap")}>
          <div style={css("font:500 14px 'Barlow',sans-serif;color:#4A4447")}>Flota de doble piso · 48 Semicama + 12 Cama por coche</div>
          <button onClick={$.openUnit} style={css("height:40px;padding:0 16px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:700 13.5px 'Barlow',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px")}><span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>add</span>Agregar coche</button>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr));gap:14px")}>
          {(Array.isArray($.units) ? $.units : []).map((u: any, $index: number) => (<React.Fragment key={$index}>
            <div style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden;display:flex;flex-direction:column")}>
              <div style={css(`height:120px;width:100%;background:url('/assets/fleet.png') ${u?.pos ?? ''}/220% auto no-repeat`)}></div>
              <div style={css("padding:14px 16px;display:flex;flex-direction:column;gap:4px;flex:1")}>
                <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}><span style={css("font:900 26px 'Barlow Condensed',sans-serif;color:#1D1A1C")}>Coche N° {u?.n}</span><span style={css(`background:${u?.sBg};color:${u?.sFg};border-radius:999px;padding:3px 9px;font:700 11.5px 'Barlow',sans-serif;white-space:nowrap`)}>{u?.status}</span></div>
                <span style={css("font:500 13px 'Barlow',sans-serif;color:#4A4447")}>{u?.line} · Patente {u?.plate}</span>
                <span style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>Doble piso · 48 Semicama + 12 Cama</span>
                <div style={css("display:flex;gap:8px;margin-top:10px")}>
                  <button onClick={u?.edit} style={css("flex:1;height:40px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#1D1A1C;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Editar</button>
                  <button onClick={u?.del} style={css("flex:1;height:40px;border:1.5px solid #F5C9C9;border-radius:999px;background:#fff;color:#B22A2A;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Eliminar</button>
                </div>
              </div>
            </div>
          </React.Fragment>))}
        </div>
        {!($.units || []).length && <EmptyState boxed icon="directions_bus" title="No hay coches cargados" text="Agregá el primer coche para asignarlo a una línea." action={{ label: 'Agregar coche', on: $.openUnit }} />}
      </>)}

      
      {!!($.sec?.pagos) && (<>
        <div style={css("display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end")}>
          {(Array.isArray($.payFilters) ? $.payFilters : []).map((f: any, $index: number) => (<React.Fragment key={$index}>
            <label style={css("display:flex;flex-direction:column;gap:4px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{f?.label}
              <select value={f?.value} onChange={f?.on} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;min-width:150px;color:#1D1A1C")}>{(Array.isArray(f?.options) ? f?.options : []).map((o: any, $index: number) => (<React.Fragment key={$index}><option value={o?.v ?? o}>{o?.l ?? o}</option></React.Fragment>))}</select>
            </label>
          </React.Fragment>))}
          <div style={css("margin-left:auto;text-align:right")}><div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{$.payStats?.count}</div><div style={css("font:800 26px 'Barlow Condensed',sans-serif")}>{$.payStats?.total}</div></div>
        </div>
        <div className="r-card" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
          <div className="r-row" style={css("display:grid;grid-template-columns:110px 100px 1.4fr 1fr .9fr 1.4fr 100px 100px;gap:10px;padding:10px 18px;background:#FAF8F9;font:700 11px 'Barlow',sans-serif;letter-spacing:.08em;color:#716A6E;text-transform:uppercase")}><span>Fecha</span><span>Código</span><span>Pasajero</span><span>Línea</span><span>Canal</span><span>Medio</span><span>Estado</span><span style={css("text-align:right")}>Monto</span></div>
          {(Array.isArray($.payRows) ? $.payRows : []).map((p: any, $index: number) => (<React.Fragment key={$index}>
            <button onClick={p?.on} className="r-row" style={css(`width:100%;display:grid;grid-template-columns:110px 100px 1.4fr 1fr .9fr 1.4fr 100px 100px;gap:10px;padding:10px 18px;border:none;border-top:1px solid #F3EDF0;background:${p?.bg ?? ''};align-items:center;font:500 13.5px 'Barlow',sans-serif;text-align:left;cursor:pointer;color:#1D1A1C`)}>
              <span style={css("color:#6B6468")}>{p?.date}</span><span style={css("font-weight:700")}>{p?.code}</span><span>{p?.payer}</span><span>{p?.line}</span><span>{p?.channel}</span><span style={css("color:#6B6468")}>{p?.method}</span>
              <span><span style={css(`border-radius:999px;padding:3px 9px;font:700 11.5px 'Barlow',sans-serif;background:${p?.sBg ?? ''};color:${p?.sFg ?? ''}`)}>{p?.status}</span></span><span style={css("text-align:right;font-weight:700")}>{p?.amount}</span>
            </button>
          </React.Fragment>))}
          <CardList items={($.payRows || []).map((p: any) => ({ title: p.payer, subtitle: p.date + ' · ' + p.code, value: p.amount, badge: { label: p.status, bg: p.sBg, fg: p.sFg }, details: [['Fecha', p.date], ['Código', p.code], ['Pasajero', p.payer], ['Línea', p.line], ['Canal', p.channel], ['Medio', p.method], ['Estado', p.status], ['Monto', p.amount]], actions: [{ label: 'Ver pasajes del pago', on: p.on, primary: true }] }))} />
          {!!($.payEmpty) && <EmptyState icon="filter_alt_off" title="No hay pagos con esos filtros" text="Probá con otro período, línea, canal o estado." action={{ label: 'Ver todos los pagos de octubre', on: $.resetPf }} />}
          <div style={css("padding:12px 18px;border-top:1px solid #F3EDF0;font:600 12.5px 'Barlow',sans-serif;color:#716A6E")}>{$.payStats?.showing}</div>
        </div>
      </>)}

      
      {!!($.sec?.cambios) && (<>
        <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
          {(Array.isArray($.chgFilters) ? $.chgFilters : []).map((f: any, $index: number) => (<React.Fragment key={$index}><button onClick={f?.on} style={css(`height:40px;padding:0 14px;border-radius:999px;border:1.5px solid ${f?.bd ?? ''};background:${f?.bg ?? ''};color:${f?.fg ?? ''};font:700 13px 'Barlow',sans-serif;cursor:pointer`)}>{f?.label}</button></React.Fragment>))}
        </div>
        <div className="r-card" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
          <div className="r-row" style={css("display:grid;grid-template-columns:100px 100px 1.2fr 1fr 1.2fr 1.1fr 1.4fr 90px 90px 1fr;gap:10px;padding:10px 18px;background:#FAF8F9;font:700 11px 'Barlow',sans-serif;letter-spacing:.06em;color:#716A6E;text-transform:uppercase")}><span>Fecha</span><span>Código</span><span>Pasajero</span><span>Tipo</span><span>Viaje original</span><span>Nuevo viaje</span><span>Motivo</span><span>Cargo</span><span>Reembolso</span><span>Usuario</span></div>
          {(Array.isArray($.chgRows) ? $.chgRows : []).map((c: any, $index: number) => (<React.Fragment key={$index}>
            <div className="r-row" style={css("display:grid;grid-template-columns:100px 100px 1.2fr 1fr 1.2fr 1.1fr 1.4fr 90px 90px 1fr;gap:10px;padding:10px 18px;border-top:1px solid #F3EDF0;align-items:center;font:500 13px 'Barlow',sans-serif")}>
              <span style={css("color:#6B6468")}>{c?.date}</span><span style={css("font-weight:700")}>{c?.code}</span><span>{c?.pax}</span><span><span style={css(`border-radius:999px;padding:3px 9px;font:700 11.5px 'Barlow',sans-serif;background:${c?.tBg ?? ''};color:${c?.tFg ?? ''}`)}>{c?.type}</span></span><span>{c?.from}</span><span>{c?.to}</span><span style={css("color:#6B6468")}>{c?.reason}</span><span>{c?.fee}</span><span style={css("color:#147A52;font-weight:700")}>{c?.refund}</span><span style={css("color:#6B6468")}>{c?.user}</span>
            </div>
          </React.Fragment>))}
          <CardList items={($.chgRows || []).map((c: any) => ({ title: c.pax, subtitle: c.date + ' · ' + c.code, badge: { label: c.type, bg: c.tBg, fg: c.tFg }, value: c.refund !== '—' ? c.refund : c.fee, details: [['Fecha', c.date], ['Código', c.code], ['Pasajero', c.pax], ['Tipo', c.type], ['Viaje original', c.from], ['Nuevo viaje', c.to], ['Motivo', c.reason], ['Cargo', c.fee], ['Reembolso', c.refund], ['Usuario', c.user]] }))} />
          {!!($.chgEmpty) && <EmptyState icon="filter_alt_off" title="No hay movimientos de este tipo" text="Todavía no se registraron cambios con ese filtro." action={{ label: 'Ver todos', on: $.chgAll }} />}
        </div>
      </>)}

      
      {!!($.sec?.usuarios) && (<>
        <div style={css("display:flex;justify-content:space-between;align-items:center;gap:10px")}>
          <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>{(Array.isArray($.roleFilters) ? $.roleFilters : []).map((f: any, $index: number) => (<React.Fragment key={$index}><button onClick={f?.on} style={css(`height:40px;padding:0 14px;border-radius:999px;border:1.5px solid ${f?.bd ?? ''};background:${f?.bg ?? ''};color:${f?.fg ?? ''};font:700 13px 'Barlow',sans-serif;cursor:pointer`)}>{f?.label}</button></React.Fragment>))}</div>
          <button onClick={$.openUser} style={css("height:40px;padding:0 16px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 14px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Nuevo usuario</button>
        </div>
        <div className="r-card" style={css("background:#fff;border:1px solid #EFE8EC;border-radius:16px;overflow:hidden")}>
          <div className="r-row" style={css("display:grid;grid-template-columns:1.4fr 1.8fr 1.2fr 1.2fr 120px;gap:12px;padding:10px 18px;background:#FAF8F9;font:700 11px 'Barlow',sans-serif;letter-spacing:.08em;color:#716A6E;text-transform:uppercase")}><span>Nombre</span><span>Email</span><span>Rol</span><span>Sucursal</span><span>Estado</span></div>
          {(Array.isArray($.userRows) ? $.userRows : []).map((u: any, $index: number) => (<React.Fragment key={$index}>
            <div className="r-row" style={css(`display:grid;grid-template-columns:1.4fr 1.8fr 1.2fr 1.2fr 120px;gap:12px;padding:10px 18px;border-top:1px solid #F3EDF0;align-items:center;font:500 14px 'Barlow',sans-serif;opacity:${u?.op ?? ''}`)}>
              <span style={css("display:flex;align-items:center;gap:10px")}><span style={css("width:32px;height:32px;border-radius:50%;background:#FDE6F2;color:#A3005A;display:flex;align-items:center;justify-content:center;font:800 12px 'Barlow',sans-serif")}>{u?.ini}</span><span style={css("font-weight:700")}>{u?.nombre}</span></span>
              <span style={css("color:#6B6468")}>{u?.email}</span>
              <select value={u?.rol} onChange={u?.onRol} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}><option value="Administrador">Administrador</option><option value="Vendedor">Vendedor</option><option value="Staff de viaje">Staff de viaje</option></select>
              <select value={u?.sucursal} onChange={u?.onSuc} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}>{(Array.isArray($.branchNames) ? $.branchNames : []).map((b: any, $index: number) => (<React.Fragment key={$index}><option value={b}>{b}</option></React.Fragment>))}</select>
              <button onClick={u?.toggle} style={css("display:flex;align-items:center;gap:8px;border:none;background:none;cursor:pointer;font:700 13px 'Barlow',sans-serif;color:#1D1A1C")}><span style={css(`width:40px;height:24px;border-radius:999px;background:${u?.track ?? ''};position:relative`)}><span style={css(`position:absolute;top:3px;left:${u?.knob ?? ''}px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25)`)}></span></span>{u?.state}</button>
            </div>
          </React.Fragment>))}
          <CardList items={($.userRows || []).map((u: any) => ({ title: u.nombre, subtitle: u.email, badge: { label: u.state, bg: u.state === 'Activo' ? '#DDF3E8' : '#F1ECEF', fg: u.state === 'Activo' ? '#147A52' : '#6B6468' }, details: [['Email', u.email], ['Rol', <select value={u.rol} onChange={u.onRol} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;max-width:200px")}>{['Administrador', 'Vendedor', 'Staff de viaje'].map(o => <option key={o} value={o}>{o}</option>)}</select>], ['Sucursal', <select value={u.sucursal} onChange={u.onSuc} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C;max-width:200px")}>{($.branchNames || []).map((o: string) => <option key={o} value={o}>{o}</option>)}</select>], ['Estado', u.state]], actions: [{ label: u.state === 'Activo' ? 'Desactivar usuario' : 'Activar usuario', on: u.toggle, danger: u.state === 'Activo' }] }))} />
          {!!($.userEmpty) && <EmptyState icon="person_search" title="No hay usuarios con ese rol" text="Creá un usuario nuevo o mirá la lista completa." action={{ label: 'Ver todos', on: $.userAll }} />}
        </div>
      </>)}
    </div>
  </main>

  {!!($.modal?.open) && (<>
    <div onClick={$.modal?.close} style={css("position:fixed;inset:0;z-index:50;background:rgba(29,26,28,.5);display:flex;align-items:center;justify-content:center;padding:20px")}>
      <div onClick={$.stop} style={css("width:100%;max-width:520px;max-height:calc(100vh - 40px);overflow:auto;background:#fff;border-radius:20px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);display:flex;flex-direction:column")}>
        <div style={css("padding:18px 20px;border-bottom:1px solid #F0E9ED;display:flex;justify-content:space-between;align-items:center")}><div style={css("font:800 22px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>{$.modal?.title}</div><button onClick={$.modal?.close} style={css("width:40px;height:40px;border-radius:50%;border:none;background:#F3EEF1;cursor:pointer;font:700 16px 'Barlow',sans-serif")}>×</button></div>
        <div onKeyDown={submitOnEnter($.modal?.isCreate ? $.form?.create : $.modal?.isSimple ? $.form?.save : $.modal?.isCancel && $.modal?.cancelForm ? $.form?.confirmCancel : undefined)} style={css("padding:18px 20px;display:flex;flex-direction:column;gap:12px")}>
          {!!($.modal?.isCancel) && (<>
            {!!($.modal?.cancelDone) && (<>
              <div style={css("display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:10px 0")}><span style={css("width:56px;height:56px;border-radius:50%;background:#DDF3E8;color:#1F9D6B;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:30px")}>mark_email_read</span><div style={css("font:800 20px 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Viaje cancelado</div><div style={css("font:500 14px 'Barlow',sans-serif;color:#4A4447")}>{$.modal?.doneText}</div></div>
            </>)}
            {!!($.modal?.cancelForm) && (<>
              <div style={css("background:#FBE3E3;color:#8E1F1F;border-radius:12px;padding:12px;font:600 13.5px/1.5 'Barlow',sans-serif")}>{$.modal?.cancelWarn}</div>
              <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Motivo<select value={$.form?.reason} onChange={$.form?.onReason} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}><option>Corte de ruta</option><option>Desperfecto mecánico</option><option>Condiciones climáticas</option><option>Baja demanda</option><option>Otro</option></select></label>
              <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Mensaje a los pasajeros<textarea value={$.form?.msg} onChange={$.form?.onMsg} rows="4" style={css("border:1.5px solid #E2D9DE;border-radius:12px;padding:10px;font:500 15px/1.45 'Barlow',sans-serif;resize:vertical;color:#1D1A1C")}></textarea></label>
              <div style={css("display:flex;gap:16px")}>
                <button onClick={$.form?.tEmail} style={css("display:flex;align-items:center;gap:8px;border:none;background:none;cursor:pointer;font:600 14px 'Barlow',sans-serif;color:#1D1A1C")}><span style={css(`width:20px;height:20px;border-radius:5px;border:2px solid #E4007C;background:${$.form?.emailBg ?? ''};color:#fff;font-family:'Material Symbols Rounded';font-size:15px;display:flex;align-items:center;justify-content:center`)}>{$.form?.emailMark}</span>Avisar por email</button>
                <button onClick={$.form?.tWa} style={css("display:flex;align-items:center;gap:8px;border:none;background:none;cursor:pointer;font:600 14px 'Barlow',sans-serif;color:#1D1A1C")}><span style={css(`width:20px;height:20px;border-radius:5px;border:2px solid #E4007C;background:${$.form?.waBg ?? ''};color:#fff;font-family:'Material Symbols Rounded';font-size:15px;display:flex;align-items:center;justify-content:center`)}>{$.form?.waMark}</span>Avisar por WhatsApp</button>
              </div>
              <button onClick={$.form?.confirmCancel} style={css("height:48px;border:none;border-radius:999px;background:#D33A3A;color:#fff;font:800 15px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Cancelar viaje y avisar a {$.modal?.paxCount}</button>
            </>)}
          </>)}
          {!!($.modal?.isCreate) && (<>
            <div style={css("display:flex;background:#F3EEF1;border-radius:999px;padding:4px")}><button onClick={$.form?.reg} style={css(`flex:1;height:40px;border:none;border-radius:999px;cursor:pointer;font:700 13px 'Barlow',sans-serif;background:${$.form?.regBg ?? ''};color:${$.form?.regFg ?? ''}`)}>Regular</button><button onClick={$.form?.esp} style={css(`flex:1;height:40px;border:none;border-radius:999px;cursor:pointer;font:700 13px 'Barlow',sans-serif;background:${$.form?.espBg ?? ''};color:${$.form?.espFg ?? ''}`)}>Especial (domingo / feriado)</button></div>
            <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px")}>
              {(Array.isArray($.form?.fields) ? $.form?.fields : []).map((f: any, $index: number) => (<React.Fragment key={$index}>
                <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{f?.label}
                  {!!(f?.isDate) && (<><input type="date" value={f?.value} onChange={f?.on} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;color:#1D1A1C")} /></>)}
                  {!!(f?.isSel) && (<><select value={f?.value} onChange={f?.on} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}>{(Array.isArray(f?.options) ? f?.options : []).map((o: any, $index: number) => (<React.Fragment key={$index}><option value={o?.v}>{o?.l}</option></React.Fragment>))}</select></>)}
                </label>
              </React.Fragment>))}
            </div>
            {!!($.form?.err) && (<><div style={css("background:#FFF4DB;color:#8A5A00;border-radius:10px;padding:10px;font:600 13px 'Barlow',sans-serif")}>{$.form?.err}</div></>)}
            <button onClick={$.form?.create} style={css("height:48px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 15px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Crear viaje y habilitar venta</button>
          </>)}
          {!!($.modal?.isSimple) && (<>
            {(Array.isArray($.form?.simple) ? $.form?.simple : []).map((f: any, $index: number) => (<React.Fragment key={$index}>
              <label style={css("display:flex;flex-direction:column;gap:5px;font:600 12px 'Barlow',sans-serif;color:#6B6468")}>{f?.label}
                {!!(f?.isSel) && (<><select value={f?.value} onChange={f?.on} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;background:#fff;color:#1D1A1C")}>{(Array.isArray(f?.options) ? f?.options : []).map((o: any, $index: number) => (<React.Fragment key={$index}><option value={o?.v ?? o}>{o?.l ?? o}</option></React.Fragment>))}</select></>)}
                {!!(f?.isInput) && (<><input type={f?.type} value={f?.value} onChange={f?.on} placeholder={f?.ph} style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:600 15px 'Barlow',sans-serif;color:#1D1A1C")} /></>)}
              </label>
            </React.Fragment>))}
            {!!($.form?.err) && (<div style={css("background:#FFF4DB;color:#8A5A00;border-radius:10px;padding:10px;font:600 13px 'Barlow',sans-serif")}>{$.form?.err}</div>)}
            <button onClick={$.form?.save} style={css("height:48px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 15px 'Barlow Condensed',sans-serif;letter-spacing:.05em;text-transform:uppercase;cursor:pointer")}>Guardar</button>
          </>)}
          {!!($.modal?.isConfirm) && (<>
            <div style={css("font:500 14.5px/1.5 'Barlow',sans-serif;color:#4A4447")}>{$.modal?.confirmText}</div>
            <div style={css("display:flex;gap:10px")}>
              <button onClick={$.modal?.close} style={css("flex:1;height:48px;border:1.5px solid #E2D9DE;border-radius:999px;background:#fff;color:#1D1A1C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Cancelar</button>
              <button onClick={$.form?.confirmDelete} style={css("flex:1;height:48px;border:none;border-radius:999px;background:#D33A3A;color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>Eliminar</button>
            </div>
          </>)}
          {!!($.modal?.isPay) && (<>
            <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;font:500 14px 'Barlow',sans-serif")}>
              {(Array.isArray($.payDetail?.rows) ? $.payDetail?.rows : []).map((r: any, $index: number) => (<React.Fragment key={$index}><div><div style={css("font:600 11px 'Barlow',sans-serif;letter-spacing:.08em;color:#716A6E;text-transform:uppercase")}>{r?.k}</div><div style={css("font-weight:700")}>{r?.v}</div></div></React.Fragment>))}
            </div>
            <div style={css("font:700 13px 'Barlow',sans-serif;margin-top:6px")}>Pasajes</div>
            {(Array.isArray($.payDetail?.tickets) ? $.payDetail?.tickets : []).map((t: any, $index: number) => (<React.Fragment key={$index}><div style={css("display:flex;justify-content:space-between;gap:8px;padding:8px 10px;background:#F8F5F6;border-radius:10px;font:500 13px 'Barlow',sans-serif")}><span>{t?.name} · {t?.route} · {t?.date} · Asiento {t?.seat}</span><strong>{t?.price}</strong></div></React.Fragment>))}
            {!!($.payDetail?.none) && (<><div style={css("font:500 13px 'Barlow',sans-serif;color:#716A6E")}>Pago rechazado: no se emitieron pasajes.</div></>)}
          </>)}
        </div>
      </div>
    </div>
  </>)}
  <Toast msg={$.toast} />
</div>
</>);
  }
}
