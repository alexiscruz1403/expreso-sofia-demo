// @ts-nocheck -- logic ported verbatim from the design prototype (dynamic JS objects)
/* Generated from design/SeatMap.dc.html */
import React from 'react';
import SD from '../data/sofia';
import { css, pc } from '../lib/dc';



export default class SeatMap extends React.Component<any, any> {
  [key: string]: any;

  state = { floor: 'alta' };
  renderVals() {
    const p = this.props;
    const seats = p.seats || [];
    const sel = p.selected || [];
    const mode = p.mode || 'buy';
    const checkins = p.checkins || {};
    const size = p.size || 44;
    const stacked = p.layout === 'stacked';
    const floor = p.floor || this.state.floor;
    const C = {
      libre: ['#FFFFFF', '#D9CFD4', '#1D1A1C'],
      ocupado: ['#ECE7EA', '#ECE7EA', '#B3A9AE'],
      sel: ['#E4007C', '#E4007C', '#FFFFFF'],
      abordo: ['#DDF3E8', '#1F9D6B', '#147A52'],
      noshow: ['#FBE3E3', '#D33A3A', '#B22A2A'],
      pend: ['#FDE6F2', '#F08BBF', '#A3005A'],
      hold: ['#FFF4DB', '#E59A0B', '#9A6400']
    };
    const held = p.held || [];
    const cell = (s) => {
      if (!s) return { aisle: true, isSeat: false };
      let k = 'libre', cursor = 'pointer', title = 'Asiento ' + s.n + ' · libre';
      const isSel = sel.includes(s.n);
      if (s.status === 'ocupado') {
        if (mode === 'buy') { k = 'ocupado'; cursor = 'not-allowed'; title = 'Asiento ' + s.n + ' · ocupado'; }
        else if (mode === 'staff' && s.t) { const c = checkins[s.t.id]; k = c === 'abordo' ? 'abordo' : c === 'noshow' ? 'noshow' : 'pend'; title = s.n + ' · ' + s.t.nombre + ' ' + s.t.apellido + ' · ' + s.t.stop; }
        else { k = 'pend'; title = s.t ? s.n + ' · ' + s.t.nombre + ' ' + s.t.apellido + ' · sube en ' + s.t.stop : 'Asiento ' + s.n + ' · ocupado'; }
      }
      if (held.includes(s.n)) k = 'hold';
      if (isSel) k = 'sel';
      if (mode !== 'buy' && s.status !== 'ocupado' && !isSel) cursor = mode === 'pick' ? 'pointer' : 'default';
      const [bg, bd, fg] = C[k];
      return { isSeat: true, aisle: false, disabled: (mode === 'buy' || mode === 'pick') && s.status === 'ocupado', n: s.n, label: s.n, sub: s.cls === 'cama' ? 'CAMA' : '', bg, bd, fg, cursor, title,
        onClick: () => { if (p.onToggle && !(mode === 'buy' && s.status === 'ocupado') && !(mode === 'pick' && s.status === 'ocupado')) p.onToggle(s); } };
    };
    const up = seats.filter(s => s.n <= 48), lo = seats.filter(s => s.n > 48);
    const rowsAlta = [], rowsBaja = [];
    for (let r = 0; r < 12; r++) { const b = r * 4; const row = [cell(up[b]), cell(up[b + 1]), null, cell(up[b + 2]), cell(up[b + 3])].map(x => x || { aisle: true, isSeat: false }); row[2] = { aisle: true, isSeat: false, rowNum: r + 1 }; rowsAlta.push(row); }
    for (let r = 0; r < 4; r++) { const b = r * 3; rowsBaja.push([cell(lo[b]), cell(lo[b + 1]), { aisle: true, isSeat: false }, cell(lo[b + 2])]); }
    const freeAlta = up.filter(s => s.status === 'libre').length, freeBaja = lo.filter(s => s.status === 'libre').length;
    const legendBuy = [{ label: 'Libre', bg: C.libre[0], bd: C.libre[1] }, { label: 'Ocupado', bg: C.ocupado[0], bd: C.ocupado[1] }, { label: 'Tu selección', bg: C.sel[0], bd: C.sel[1] }];
    const legendStaff = [{ label: 'Esperado', bg: C.pend[0], bd: C.pend[1] }, { label: 'Abordó', bg: C.abordo[0], bd: C.abordo[1] }, { label: 'No se presentó', bg: C.noshow[0], bd: C.noshow[1] }, { label: 'Libre', bg: C.libre[0], bd: C.libre[1] }];
    const legendView = [{ label: 'Ocupado', bg: C.pend[0], bd: C.pend[1] }, { label: 'Libre', bg: C.libre[0], bd: C.libre[1] }, { label: 'Seleccionado', bg: C.sel[0], bd: C.sel[1] }];
    const on = ['#FFFFFF', '#E4007C'], off = ['transparent', '#6B6468'];
    return {
      size, gap: Math.round(size / 7), aisle: Math.round(size * 0.6), fs: size >= 40 ? 13 : 11,
      sizeCama: Math.round(size * 1.25), sizeCamaH: Math.round(size * 1.3),
      showTabs: !stacked, showAlta: stacked || floor === 'alta', showBaja: stacked || floor === 'baja',
      tabAltaBg: floor === 'alta' ? on[0] : off[0], tabAltaFg: floor === 'alta' ? on[1] : off[1],
      tabBajaBg: floor === 'baja' ? on[0] : off[0], tabBajaFg: floor === 'baja' ? on[1] : off[1],
      toAlta: () => { this.setState({ floor: 'alta' }); p.onFloor && p.onFloor('alta'); },
      toBaja: () => { this.setState({ floor: 'baja' }); p.onFloor && p.onFloor('baja'); },
      rowsAlta, rowsBaja, freeAlta: freeAlta + ' libres', freeBaja: freeBaja + ' libres',
      priceSemi: p.priceSemi ? '· ' + p.priceSemi : '', priceCama: p.priceCama ? '· ' + p.priceCama : '',
      showLegend: p.legend !== false, legend: mode === 'staff' ? legendStaff : mode === 'buy' ? legendBuy : legendView
    };
  }

  render() {
    const $: any = this.renderVals();
    return (<>
<div style={css("display:flex;flex-direction:column;gap:14px;font-family:'Barlow',system-ui,sans-serif;color:#1D1A1C;width:100%")}>
  {!!($.showTabs) && (<>
    <div style={css("display:flex;gap:4px;background:#F1ECEF;padding:4px;border-radius:16px;width:100%")}>
      <button onClick={$.toAlta} style={css(`flex:1;min-width:0;height:48px;border:none;cursor:pointer;padding:0 6px;border-radius:12px;background:${$.tabAltaBg ?? ''};color:${$.tabAltaFg ?? ''};display:flex;flex-direction:column;align-items:center;gap:1px`)}><span style={css("font:700 13px 'Barlow',sans-serif")}>Planta alta</span><span style={css("font:500 11.5px 'Barlow',sans-serif;opacity:.8")}>Semicama · {$.freeAlta}</span></button>
      <button onClick={$.toBaja} style={css(`flex:1;min-width:0;height:48px;border:none;cursor:pointer;padding:0 6px;border-radius:12px;background:${$.tabBajaBg ?? ''};color:${$.tabBajaFg ?? ''};display:flex;flex-direction:column;align-items:center;gap:1px`)}><span style={css("font:700 13px 'Barlow',sans-serif")}>Planta baja</span><span style={css("font:500 11.5px 'Barlow',sans-serif;opacity:.8")}>Cama · {$.freeBaja}</span></button>
    </div>
  </>)}
  <div style={css("display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start;justify-content:center")}>
    {!!($.showAlta) && (<>
      <div style={css("display:flex;flex-direction:column;gap:8px")}>
        <div style={css("font:700 12px 'Barlow',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#6B6468")}>Planta alta · 48 Semicama {$.priceSemi}</div>
        <div style={css(`background:#fff;border:2px solid #E6DEE2;border-radius:44px 44px 16px 16px;padding:18px 14px 14px;display:flex;flex-direction:column;gap:${$.gap ?? ''}px`)}>
          <div style={css("height:6px;border-radius:6px;background:linear-gradient(90deg,#E4007C,#FF5AA8);opacity:.35;margin:0 18px 6px")}></div>
          <div style={css("text-align:center;font:600 10px 'Barlow',sans-serif;letter-spacing:.14em;color:#716A6E;margin-bottom:4px")}>FRENTE</div>
          {(Array.isArray($.rowsAlta) ? $.rowsAlta : []).map((row: any, $index: number) => (<React.Fragment key={$index}>
            <div style={css(`display:flex;gap:${$.gap ?? ''}px;align-items:center`)}>
              {(Array.isArray(row) ? row : []).map((c: any, $index: number) => (<React.Fragment key={$index}>
                {!!(c?.isSeat) && (<>
                  <button title={c?.title} disabled={c?.disabled} onClick={c?.onClick} style={css(`width:${$.size ?? ''}px;height:${$.size ?? ''}px;border-radius:10px 10px 6px 6px;border:1.5px solid ${c?.bd ?? ''};background:${c?.bg ?? ''};color:${c?.fg ?? ''};font:700 ${$.fs ?? ''}px 'Barlow',sans-serif;cursor:${c?.cursor ?? ''};display:flex;align-items:center;justify-content:center;padding:0;position:relative;transition:transform .12s`)} className={pc("hover", "transform:translateY(-1px)")}>{c?.label}</button>
                </>)}
                {!!(c?.aisle) && (<>
                  <div style={css(`width:${$.aisle ?? ''}px;text-align:center;font:500 10px 'Barlow',sans-serif;color:#716A6E`)}>{c?.rowNum}</div>
                </>)}
              </React.Fragment>))}
            </div>
          </React.Fragment>))}
        </div>
      </div>
    </>)}
    {!!($.showBaja) && (<>
      <div style={css("display:flex;flex-direction:column;gap:8px")}>
        <div style={css("font:700 12px 'Barlow',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#6B6468")}>Planta baja · 12 Cama {$.priceCama}</div>
        <div style={css(`background:#fff;border:2px solid #E6DEE2;border-radius:44px 44px 16px 16px;padding:18px 14px 14px;display:flex;flex-direction:column;gap:${$.gap ?? ''}px`)}>
          <div style={css("display:flex;justify-content:space-between;font:600 10px 'Barlow',sans-serif;letter-spacing:.14em;color:#716A6E;margin-bottom:4px;padding:0 4px")}><span>CHOFER</span><span>FRENTE</span><span>ESCALERA</span></div>
          {(Array.isArray($.rowsBaja) ? $.rowsBaja : []).map((row: any, $index: number) => (<React.Fragment key={$index}>
            <div style={css(`display:flex;gap:${$.gap ?? ''}px;align-items:center`)}>
              {(Array.isArray(row) ? row : []).map((c: any, $index: number) => (<React.Fragment key={$index}>
                {!!(c?.isSeat) && (<>
                  <button title={c?.title} disabled={c?.disabled} onClick={c?.onClick} style={css(`width:${$.sizeCama ?? ''}px;height:${$.sizeCamaH ?? ''}px;border-radius:12px 12px 6px 6px;border:1.5px solid ${c?.bd ?? ''};background:${c?.bg ?? ''};color:${c?.fg ?? ''};font:700 ${$.fs ?? ''}px 'Barlow',sans-serif;cursor:${c?.cursor ?? ''};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0`)}>{c?.label}<span style={css("font:600 8px 'Barlow',sans-serif;letter-spacing:.06em")}>{c?.sub}</span></button>
                </>)}
                {!!(c?.aisle) && (<>
                  <div style={css(`width:${$.aisle ?? ''}px`)}></div>
                </>)}
              </React.Fragment>))}
            </div>
          </React.Fragment>))}
          <div style={css("margin-top:6px;border-top:1px dashed #E6DEE2;padding-top:8px;text-align:center;font:600 10px 'Barlow',sans-serif;letter-spacing:.14em;color:#716A6E")}>BAÑO · BODEGA</div>
        </div>
      </div>
    </>)}
  </div>
  {!!($.showLegend) && (<>
    <div style={css("display:flex;flex-wrap:wrap;gap:8px 16px;font:500 12px 'Barlow',sans-serif;color:#4A4447")}>
      {(Array.isArray($.legend) ? $.legend : []).map((l: any, $index: number) => (<React.Fragment key={$index}>
        <div style={css("display:flex;align-items:center;gap:6px")}><span style={css(`width:16px;height:16px;border-radius:5px;border:1.5px solid ${l?.bd ?? ''};background:${l?.bg ?? ''}`)}></span>{l?.label}</div>
      </React.Fragment>))}
    </div>
  </>)}
</div>
</>);
  }
}
