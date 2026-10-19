import React, { useState } from 'react';
import { css } from '../lib/dc';

// Mobile replacement for wide tables: one compact card per row plus a "Ver más"
// bottom sheet with the full detail. Shown only below 768px (see .cards-only).

export interface CardBadge { label: React.ReactNode; bg: string; fg: string }
export interface CardAction { label: string; on: () => void; danger?: boolean; primary?: boolean }
export interface CardItem {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  value?: React.ReactNode;
  badge?: CardBadge;
  details: [string, React.ReactNode][];
  actions?: CardAction[];
}

const btn = (a: CardAction) => css(
  `flex:1;min-width:120px;height:48px;border-radius:999px;font:700 14px 'Barlow',sans-serif;cursor:pointer;` +
  (a.primary ? 'border:none;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff'
    : a.danger ? 'border:1.5px solid #F5C9C9;background:#fff;color:#B22A2A'
    : 'border:1.5px solid #E2D9DE;background:#fff;color:#1D1A1C'),
);

export default function CardList({ items, empty }: { items: CardItem[]; empty?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const cur = open != null ? items[open] : null;
  return (
    <div className="cards-only" style={css('flex-direction:column;gap:10px;padding:12px')}>
      {!items.length && empty && (
        <div style={css("padding:20px;text-align:center;font:600 14px 'Barlow',sans-serif;color:#716A6E")}>{empty}</div>
      )}
      {items.map((it, i) => (
        <div key={i} style={css('background:#fff;border:1px solid #EFE8EC;border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:8px')}>
          <div style={css('display:flex;justify-content:space-between;align-items:flex-start;gap:10px')}>
            <div style={css('min-width:0;display:flex;flex-direction:column;gap:2px')}>
              <div style={css("font:700 15px 'Barlow',sans-serif;color:#1D1A1C;overflow-wrap:anywhere")}>{it.title}</div>
              {it.subtitle != null && <div style={css("font:500 12.5px 'Barlow',sans-serif;color:#6B6468")}>{it.subtitle}</div>}
            </div>
            {it.value != null && <div style={css("flex:none;font:800 18px 'Barlow Condensed',sans-serif;color:#1D1A1C;text-align:right")}>{it.value}</div>}
          </div>
          <div style={css('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
            {it.badge
              ? <span style={css(`background:${it.badge.bg};color:${it.badge.fg};border-radius:999px;padding:3px 10px;font:700 11.5px 'Barlow',sans-serif`)}>{it.badge.label}</span>
              : <span />}
            <button onClick={() => setOpen(i)} style={css("border:none;background:none;padding:4px 0;cursor:pointer;color:#E4007C;font:700 13px 'Barlow',sans-serif;display:flex;align-items:center;gap:2px")}>
              Ver más<span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>expand_more</span>
            </button>
          </div>
        </div>
      ))}
      {cur && (
        <div onClick={() => setOpen(null)} style={css('position:fixed;inset:0;z-index:80;background:rgba(29,26,28,.45);display:flex;align-items:flex-end')}>
          <div onClick={e => e.stopPropagation()} style={css('width:100%;max-height:85vh;overflow:auto;background:#fff;border-radius:22px 22px 0 0;padding:10px 16px 24px;display:flex;flex-direction:column;gap:12px')}>
            <div style={css('width:44px;height:5px;border-radius:5px;background:#E2D9DE;align-self:center')} />
            <div style={css('display:flex;justify-content:space-between;align-items:flex-start;gap:10px')}>
              <div style={css('min-width:0')}>
                <div style={css("font:800 22px/1.1 'Barlow Condensed',sans-serif;text-transform:uppercase;overflow-wrap:anywhere")}>{cur.title}</div>
                {cur.subtitle != null && <div style={css("font:500 13px 'Barlow',sans-serif;color:#6B6468")}>{cur.subtitle}</div>}
              </div>
              <button onClick={() => setOpen(null)} aria-label="Cerrar" style={css("flex:none;width:40px;height:40px;border-radius:50%;border:none;background:#F3EEF1;cursor:pointer;font-family:'Material Symbols Rounded';font-size:20px")}>close</button>
            </div>
            <div style={css('display:flex;flex-direction:column')}>
              {cur.details.map(([k, v], j) => (
                <div key={j} style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #F3EDF0;font:500 14px 'Barlow',sans-serif")}>
                  <span style={css('color:#6B6468;flex:none')}>{k}</span>
                  <span style={css('font-weight:700;text-align:right;min-width:0;overflow-wrap:anywhere')}>{v}</span>
                </div>
              ))}
            </div>
            {!!cur.actions?.length && (
              <div style={css('display:flex;gap:8px;flex-wrap:wrap')}>
                {cur.actions.map((a, j) => (
                  <button key={j} onClick={() => { setOpen(null); a.on(); }} style={btn(a)}>{a.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
