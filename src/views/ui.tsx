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
