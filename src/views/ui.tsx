import React, { useEffect, useRef, useState } from 'react';
import { css } from '../lib/dc';

// Shared UI primitives used by every view: toast, empty state, confirm dialog
// and the Enter-to-submit helper for forms.

/** Toast: always 50px above the bottom edge. The live region stays mounted so messages are announced. */
export function Toast({ msg }: { msg?: string }) {
  return (
    <div role="status" aria-live="polite" style={css('position:fixed;left:50%;bottom:50px;transform:translateX(-50%);z-index:95;pointer-events:none;width:max-content;max-width:calc(100vw - 32px)')}>
      {msg ? <div style={css("background:#1D1A1C;color:#fff;border-radius:999px;padding:10px 18px;font:600 13px 'Barlow',sans-serif;box-shadow:0 10px 30px -10px rgba(0,0,0,.5);text-align:center")}>{msg}</div> : null}
    </div>
  );
}

/** Empty state: icon, title, hint and an optional way out. `boxed` draws its own card. */
export function EmptyState({ icon = 'search_off', title, text, action, boxed }: {
  icon?: string; title: string; text?: React.ReactNode; action?: { label: string; on: () => void }; boxed?: boolean;
}) {
  return (
    <div style={css('display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:28px 20px;' + (boxed ? 'background:#fff;border:1.5px dashed #E2D9DE;border-radius:16px' : ''))}>
      <span aria-hidden="true" style={css("width:48px;height:48px;border-radius:50%;background:#F3EEF1;color:#716A6E;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:26px")}>{icon}</span>
      <div style={css("font:700 15px 'Barlow',sans-serif;color:#1D1A1C")}>{title}</div>
      {text != null && <div style={css("font:500 13.5px/1.45 'Barlow',sans-serif;color:#716A6E;max-width:360px")}>{text}</div>}
      {action && <button type="button" onClick={action.on} style={css("margin-top:4px;height:40px;padding:0 16px;border-radius:999px;border:1.5px solid #E4007C;background:#fff;color:#C2006A;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>{action.label}</button>}
    </div>
  );
}

/** Calls `fn` when Enter is pressed in a text field or select inside the container. */
export const submitOnEnter = (fn?: () => void) => (e: React.KeyboardEvent) => {
  const t = e.target as HTMLElement;
  if (e.key !== 'Enter' || e.nativeEvent.isComposing || !fn) return;
  if (t.tagName === 'INPUT' || t.tagName === 'SELECT') { e.preventDefault(); fn(); }
};

export interface ConfirmOptions { title: string; body?: React.ReactNode; confirmLabel: string; cancelLabel?: string; danger?: boolean }
type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };
let pushConfirm: ((p: Pending) => void) | null = null;

/** Asks the user to confirm an action that cannot be undone. Resolves true when confirmed. */
export function confirmAction(o: ConfirmOptions): Promise<boolean> {
  return new Promise(resolve => (pushConfirm ? pushConfirm({ ...o, resolve }) : resolve(window.confirm(o.title))));
}

/** Runs `fn` only after the user confirms. */
export const withConfirm = (o: ConfirmOptions, fn: () => void) => () => { confirmAction(o).then(ok => ok && fn()); };

/** Mount once (Shell). Renders the pending confirmation as an accessible alert dialog. */
export function ConfirmHost() {
  const [cur, setCur] = useState<Pending | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    pushConfirm = p => { prevFocus.current = document.activeElement as HTMLElement; setCur(p); };
    return () => { pushConfirm = null; };
  }, []);

  const done = (ok: boolean) => {
    cur?.resolve(ok);
    setCur(null);
    prevFocus.current?.focus?.();
  };

  useEffect(() => {
    if (!cur) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); done(false); }
      if (e.key === 'Tab') {
        e.preventDefault();
        (document.activeElement === cancelRef.current ? okRef.current : cancelRef.current)?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (!cur) return null;
  return (
    <div onClick={() => done(false)} style={css('position:fixed;inset:0;z-index:100;background:rgba(29,26,28,.5);display:flex;align-items:center;justify-content:center;padding:20px;overscroll-behavior:contain')}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby={cur.body != null ? 'confirm-body' : undefined} onClick={e => e.stopPropagation()}
        style={css('width:100%;max-width:420px;background:#fff;border-radius:20px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);padding:20px;display:flex;flex-direction:column;gap:12px')}>
        <div id="confirm-title" style={css("font:800 22px/1.1 'Barlow Condensed',sans-serif;text-transform:uppercase;color:#1D1A1C")}>{cur.title}</div>
        {cur.body != null && <div id="confirm-body" style={css("font:500 14px/1.5 'Barlow',sans-serif;color:#4A4447")}>{cur.body}</div>}
        <div style={css('font:600 13px \'Barlow\',sans-serif;color:#8E1F1F')}>Esta acción no se puede deshacer.</div>
        <div style={css('display:flex;gap:8px;flex-wrap:wrap;margin-top:4px')}>
          <button ref={cancelRef} type="button" onClick={() => done(false)} style={css("flex:1;min-width:140px;height:48px;border-radius:999px;border:1.5px solid #E2D9DE;background:#fff;color:#1D1A1C;font:700 14px 'Barlow',sans-serif;cursor:pointer")}>{cur.cancelLabel || 'Volver'}</button>
          <button ref={okRef} type="button" onClick={() => done(true)} style={css(`flex:1;min-width:140px;height:48px;border-radius:999px;border:none;color:#fff;font:700 14px 'Barlow',sans-serif;cursor:pointer;background:${cur.danger ? '#B22A2A' : 'linear-gradient(135deg,#C2006A,#E4007C)'}`)}>{cur.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export interface Page<T> { rows: T[]; page: number; pages: number; total: number; from: number; to: number; go: (n: number) => void }

/** Slices `items` into pages of `size`. The page resets to the first one when `sig` (the active filters) changes. */
export function paginate<T>(items: T[], saved: { n: number; sig: string } | undefined, sig: string, go: (n: number, sig: string) => void, size = 10): Page<T> {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const n = saved && saved.sig === sig ? Math.min(saved.n, pages - 1) : 0;
  return { rows: items.slice(n * size, n * size + size), page: n, pages, total: items.length, from: items.length ? n * size + 1 : 0, to: Math.min(items.length, n * size + size), go: k => go(k, sig) };
}

/** "Mostrando 1–10 de N" plus previous/next and page buttons. Renders nothing when everything fits in one page. */
export function Pager({ pg, noun = 'resultados' }: { pg?: Page<unknown>; noun?: string }) {
  if (!pg || pg.pages <= 1) return null;
  const n = pg.page, last = pg.pages - 1;
  const nums = Array.from(new Set([0, n - 1, n, n + 1, last])).filter(i => i >= 0 && i <= last).sort((a, b) => a - b);
  const items: (number | string)[] = [];
  nums.forEach((i, k) => { if (k && i - nums[k - 1] > 1) items.push('gap' + i); items.push(i); });
  const btn = (on: boolean) => css(`min-width:40px;height:40px;padding:0 8px;border-radius:999px;border:1.5px solid ${on ? '#1D1A1C' : '#E2D9DE'};background:${on ? '#1D1A1C' : '#fff'};color:${on ? '#fff' : '#1D1A1C'};font:700 14px 'Barlow',sans-serif;cursor:pointer;font-variant-numeric:tabular-nums`);
  const arrow = (dis: boolean) => css(`width:40px;height:40px;border-radius:50%;border:1.5px solid #E2D9DE;background:#fff;color:#1D1A1C;cursor:${dis ? 'default' : 'pointer'};opacity:${dis ? .4 : 1};font-family:'Material Symbols Rounded';font-size:22px;display:flex;align-items:center;justify-content:center`);
  return (
    <nav aria-label="Paginación" style={css('display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap')}>
      <span style={css("font:600 13px 'Barlow',sans-serif;color:#716A6E;font-variant-numeric:tabular-nums")}>Mostrando {pg.from}–{pg.to} de {pg.total.toLocaleString('es-AR')} {noun}</span>
      <div style={css('display:flex;gap:4px;align-items:center')}>
        <button type="button" aria-label="Página anterior" disabled={n === 0} onClick={() => pg.go(n - 1)} style={arrow(n === 0)}>chevron_left</button>
        {items.map(i => typeof i === 'string'
          ? <span key={i} aria-hidden="true" style={css("width:20px;text-align:center;color:#716A6E;font:700 14px 'Barlow',sans-serif")}>…</span>
          : <button key={i} type="button" aria-label={'Página ' + (i + 1)} aria-current={i === n ? 'page' : undefined} onClick={() => pg.go(i)} style={btn(i === n)}>{i + 1}</button>)}
        <button type="button" aria-label="Página siguiente" disabled={n === last} onClick={() => pg.go(n + 1)} style={arrow(n === last)}>chevron_right</button>
      </div>
    </nav>
  );
}
