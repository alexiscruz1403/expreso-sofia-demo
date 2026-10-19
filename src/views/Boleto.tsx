// @ts-nocheck -- logic ported verbatim from the design prototype (dynamic JS objects)
/* Generated from design/Boleto.dc.html */
import React from 'react';
import SD from '../data/sofia';
import { css, pc } from '../lib/dc';



export default function Boleto(props: any) {
  const $: any = props;
  return (<>
<div style={css("width:100%;max-width:400px;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px -18px rgba(120,0,64,.35),0 0 0 1px #F0E8EC;font-family:'Barlow',system-ui,sans-serif;color:#1D1A1C")}>
  <div style={css("background:linear-gradient(135deg,#C2006A 0%,#E4007C 100%);padding:16px 18px 18px;display:flex;align-items:center;justify-content:space-between;gap:10px")}>
    <div style={css("background:#fff;border-radius:14px;padding:6px 10px;display:flex")}><img src="/assets/logo.png" alt="Expreso Sofía" style={css("height:42px;display:block")} /></div>
    <div style={css("text-align:right;color:#fff")}>
      <div style={css("font:600 10px 'Barlow',sans-serif;letter-spacing:.14em;opacity:.9")}>BOLETO VIRTUAL</div>
      <div style={css("font:800 22px/1 'Barlow Condensed',sans-serif;letter-spacing:.04em;margin-top:3px")}>{$.t?.code}</div>
    </div>
  </div>
  <div style={css("padding:18px;display:flex;flex-direction:column;gap:14px")}>
    <div style={css("display:flex;justify-content:space-between;gap:12px;align-items:flex-start")}>
      <div style={css("min-width:0")}>
        <div style={css("font:600 11px 'Barlow',sans-serif;color:#716A6E;letter-spacing:.06em;text-transform:uppercase")}>{$.t?.line}</div>
        <div style={css("font:800 26px/1.05 'Barlow Condensed',sans-serif;text-transform:uppercase;margin-top:2px;text-wrap:balance")}>{$.t?.route}</div>
        <div style={css("font:600 15px 'Barlow',sans-serif;margin-top:6px")}>{$.t?.date}</div>
        <div style={css("font:800 34px/1 'Barlow Condensed',sans-serif;color:#E4007C;margin-top:2px")}>{$.t?.time} hs</div>
        <div style={css("font:500 12px 'Barlow',sans-serif;color:#6B6468;margin-top:3px")}>{$.t?.note}</div>
      </div>
      <div style={css("flex:none;width:112px;height:112px;padding:6px;border:1.5px solid #EDE5E9;border-radius:12px;display:grid;grid-template-columns:repeat(25,1fr);grid-template-rows:repeat(25,1fr)")}>
        {(Array.isArray($.t?.qr) ? $.t?.qr : []).map((q: any, $index: number) => (<React.Fragment key={$index}><div style={css(`background:${q ?? ''}`)}></div></React.Fragment>))}
      </div>
    </div>
    <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;padding:14px;background:#F8F5F6;border-radius:14px")}>
      <div style={css("grid-column:1 / -1")}><div style={css("font:600 10px 'Barlow',sans-serif;color:#716A6E;letter-spacing:.08em")}>PASAJERO</div><div style={css("font:700 16px 'Barlow',sans-serif")}>{$.t?.name}</div><div style={css("font:500 13px 'Barlow',sans-serif;color:#4A4447")}>DNI {$.t?.dni}</div></div>
      <div><div style={css("font:600 10px 'Barlow',sans-serif;color:#716A6E;letter-spacing:.08em")}>ASCENSO</div><div style={css("font:700 14px 'Barlow',sans-serif")}>{$.t?.boardStop}</div><div style={css("font:500 12px 'Barlow',sans-serif;color:#4A4447")}>{$.t?.time} hs</div></div>
      <div><div style={css("font:600 10px 'Barlow',sans-serif;color:#716A6E;letter-spacing:.08em")}>DESTINO</div><div style={css("font:700 14px 'Barlow',sans-serif")}>{$.t?.dest}</div><div style={css("font:500 12px 'Barlow',sans-serif;color:#4A4447")}>aprox. {$.t?.arr} hs</div></div>
      <div><div style={css("font:600 10px 'Barlow',sans-serif;color:#716A6E;letter-spacing:.08em")}>PISO · CLASE</div><div style={css("font:700 14px 'Barlow',sans-serif")}>{$.t?.floor}</div><div style={css("font:500 12px 'Barlow',sans-serif;color:#4A4447")}>{$.t?.cls}</div></div>
      <div style={css("display:flex;gap:14px")}>
        <div><div style={css("font:600 10px 'Barlow',sans-serif;color:#716A6E;letter-spacing:.08em")}>ASIENTO</div><div style={css("font:800 28px/1 'Barlow Condensed',sans-serif;color:#E4007C")}>{$.t?.seat}</div></div>
        <div><div style={css("font:600 10px 'Barlow',sans-serif;color:#716A6E;letter-spacing:.08em")}>COCHE</div><div style={css("font:800 28px/1 'Barlow Condensed',sans-serif")}>{$.t?.car}</div></div>
      </div>
    </div>
    <div style={css("position:relative;height:0;border-top:2px dashed #EDE5E9;margin:2px -18px")}></div>
    <div style={css("display:flex;justify-content:space-between;align-items:center;gap:10px")}>
      <div style={css("font:600 12px 'Barlow',sans-serif;color:#6B6468")}>Total abonado</div>
      <div style={css("font:800 24px 'Barlow Condensed',sans-serif")}>{$.t?.price}</div>
    </div>
    <div style={css("font:500 11.5px/1.45 'Barlow',sans-serif;color:#6B6468")}>Incluye: {$.t?.services}</div>
    <div style={css("font:500 11.5px/1.45 'Barlow',sans-serif;color:#6B6468")}><strong>Equipaje:</strong> una valija y/o bolso en bodega + una mochila dentro del coche.{$.t?.rt ? ' Ida y vuelta: no admite devolución ni cambios; válido 14 días corridos desde la emisión.' : ''}</div>
    <div style={css("display:flex;align-items:center;gap:10px;background:#FDE6F2;color:#A3005A;border-radius:12px;padding:10px 12px;font:700 13px 'Barlow',sans-serif")}><span style={css("width:22px;height:22px;flex:none;border-radius:50%;background:#E4007C;color:#fff;display:flex;align-items:center;justify-content:center;font:800 13px 'Barlow',sans-serif")}>!</span>Presentate 15 minutos antes con tu DNI.</div>
  </div>
</div>
</>);
}
