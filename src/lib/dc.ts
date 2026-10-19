import type { CSSProperties } from 'react';

// Helpers that let the design's inline CSS strings be used as-is in JSX.

const styleCache = new Map<string, CSSProperties>();

/** Converts an inline CSS declaration string into a React style object (memoized). */
export function css(str: string): CSSProperties {
  let o = styleCache.get(str);
  if (o) return o;
  const out: Record<string, string> = {};
  for (const decl of str.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop) continue;
    out[prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
  }
  o = out as CSSProperties;
  if (styleCache.size > 5000) styleCache.clear();
  styleCache.set(str, o);
  return o;
}

const pseudoCache = new Map<string, string>();
let sheet: CSSStyleSheet | null = null;

/** Registers pseudo-class styles (e.g. hover/focus) and returns the class name to apply. */
export function pc(...pairs: string[]): string {
  const key = pairs.join('|');
  let cls = pseudoCache.get(key);
  if (cls) return cls;
  cls = 'dcp' + pseudoCache.size;
  pseudoCache.set(key, cls);
  if (!sheet) {
    const el = document.createElement('style');
    document.head.appendChild(el);
    sheet = el.sheet;
  }
  for (let i = 0; i < pairs.length; i += 2) {
    const decls = pairs[i + 1].split(';').filter(d => d.trim()).map(d => d.trim() + ' !important').join(';');
    sheet!.insertRule(`.${cls}:${pairs[i]}{${decls}}`, sheet!.cssRules.length);
  }
  return cls;
}
