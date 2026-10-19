// @ts-nocheck -- logic ported verbatim from the design prototype (dynamic JS objects)
/* Generated from design/Expreso Sofia.dc.html */
import React from 'react';
import SD from '../data/sofia';
import { css, pc } from '../lib/dc';
import Publico from './Publico';
import Admin from './Admin';
import Ventas from './Ventas';
import Staff from './Staff';
import { ConfirmHost, withConfirm } from './ui';


export default class Shell extends React.Component<any, any> {
  [key: string]: any;

  state = { panel: false, bar: false, email: '', pass: '', error: '', loading: false };
  componentDidMount() {
    const go = () => { if (SD) { this._u = SD.subscribe(() => this.forceUpdate()); this.forceUpdate(); } else this._t = setTimeout(go, 40); };
    go();
    this._rs = () => this.forceUpdate();
    window.addEventListener('resize', this._rs);
  }
  componentWillUnmount() { this._u && this._u(); clearTimeout(this._t); window.removeEventListener('resize', this._rs); }
  renderVals() {
    const st = SD ? SD.get() : { role: 'pasajero', device: 'mobile', scenario: {} };
    const role = st.role, device = window.innerWidth >= 900 ? 'desktop' : 'mobile';
    const setRole = (r) => SD && SD.set({ role: r });
    const sc = st.scenario || {};
    const setSc = (k, v) => SD.set(s => ({ scenario: Object.assign({}, s.scenario, { [k]: v }) }));
    const roleList = [['pasajero', 'Pasajero'], ['admin', 'Admin'], ['ventas', 'Ventas'], ['staff', 'Staff']];
    const accounts = [['Admin', 'admin@expresosofia.com.ar'], ['Ventas · Salta', 'ventas@expresosofia.com.ar'], ['Staff · Azafata', 'staff@expresosofia.com.ar']];
    const doLogin = () => {
      const e = this.state.email.trim().toLowerCase();
      if (!e || !this.state.pass) return this.setState({ error: 'Completá tu email y contraseña.' });
      this.setState({ loading: true, error: '' });
      setTimeout(() => {
        const u = SD.get().users.find(x => x.email === e);
        if (!u || this.state.pass.toLowerCase() !== 'sofia2026') return this.setState({ loading: false, error: 'El email o la contraseña no son correctos. Revisalos e intentá de nuevo.' });
        if (!u.activo) return this.setState({ loading: false, error: 'Tu usuario está desactivado. Consultá con administración.' });
        this.setState({ loading: false });
        setRole(u.rol === 'Administrador' ? 'admin' : u.rol === 'Vendedor' ? 'ventas' : 'staff');
      }, 900);
    };
    return {
      r: { pasajero: role === 'pasajero', admin: role === 'admin', ventas: role === 'ventas', staff: role === 'staff', login: role === 'login' }, device,
      barOpen: this.state.bar, openBar: () => this.setState({ bar: true }), closeBar: () => this.setState({ bar: false, panel: false }), roleLabel: (roleList.find(([k]) => k === role) || [null, 'Login'])[1],
      roles: roleList.map(([k, l]) => ({ label: l, on: () => { setRole(k); this.setState({ bar: false, panel: false }); }, bg: role === k ? 'linear-gradient(135deg,#C2006A,#E4007C)' : 'transparent', fg: role === k ? '#fff' : '#CFC6CA' })),
      panelOpen: this.state.panel, togglePanel: () => this.setState(s => ({ panel: !s.panel })), panelBg: this.state.panel ? '#E4007C' : '#3A3437',
      payOpts: [['aprobado', 'Aprobado'], ['pendiente', 'Pendiente'], ['rechazado', 'Rechazado']].map(([k, l]) => ({ label: l, on: () => setSc('pay', k), bg: sc.pay === k ? '#fff' : 'transparent', fg: sc.pay === k ? '#E4007C' : '#6B6468' })),
      toggles: [
        ['soldOut', 'Viaje agotado', 'Tartagal → Salta de esta madrugada sin lugares'],
        ['tripCancelled', 'Viaje cancelado por la empresa', 'Tartagal → Salta del lunes 19 (pasaje SOF-4KD72)'],
        ['expire', 'Reserva vencida', 'El contador de reserva arranca en 00:08']
      ].map(([k, l, d]) => ({ label: l, desc: d, on: () => setSc(k, !sc[k]), track: sc[k] ? '#E4007C' : '#D9D1D5', knob: sc[k] ? 19 : 3 })),
      goLogin: () => { setRole('login'); this.setState({ panel: false }); },
      resetDemo: withConfirm({ title: '¿Reiniciar la demo?', body: 'Se borran las compras, reprogramaciones, cancelaciones y check-ins que hiciste en esta sesión.', confirmLabel: 'Reiniciar demo', danger: true }, () => { SD.reset(); this.setState({ panel: false }); }),
      login: { email: this.state.email, pass: this.state.pass, error: this.state.error, loading: this.state.loading, btn: this.state.loading ? 'Ingresando…' : 'Ingresar' },
      setEmail: e => this.setState({ email: e.target.value, error: '' }), setPass: e => this.setState({ pass: e.target.value, error: '' }),
      doLogin: e => { e && e.preventDefault(); if (!this.state.loading) doLogin(); }, toPublic: () => setRole('pasajero'),
      demoAccounts: accounts.map(([l, em]) => ({ label: l, fill: () => this.setState({ email: em, pass: 'sofia2026', error: '' }) }))
    };
  }

  render() {
    const $: any = this.renderVals();
    return (<>

<div style={css("min-height:100vh;width:100%;position:relative")}>
  {!!($.r?.pasajero) && (<>
    <div style={css("height:100vh;height:100dvh;background:#fff")}>
      <Publico device={$.device} />
    </div>
  </>)}
  {!!($.r?.admin) && (<>
    <div><Admin /></div>
  </>)}
  {!!($.r?.ventas) && (<>
    <div><Ventas /></div>
  </>)}
  {!!($.r?.staff) && (<>
    <div style={css("height:100vh;height:100dvh;background:#F7F4F5")}>
      <div style={css("height:100%;max-width:760px;margin:0 auto;box-shadow:0 0 0 1px #EEE6EA")}><Staff /></div>
    </div>
  </>)}
  {!!($.r?.login) && (<>
    <div style={css("min-height:100vh;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));background:#fff")}>
      <div style={css("position:relative;min-height:320px;background:#2a0a1c url('/assets/hero.png') center 30%/cover no-repeat;display:flex;align-items:flex-end;padding:40px")}>
        <div style={css("position:absolute;inset:0;background:linear-gradient(180deg,rgba(29,26,28,.05) 30%,rgba(120,0,64,.85) 100%)")}></div>
        <div style={css("position:relative;color:#fff;display:flex;flex-direction:column;gap:8px;max-width:440px")}>
          <div style={css("font:400 34px/1.1 'Kaushan Script',cursive")}>Conectando personas, uniendo destinos</div>
          <div style={css("font:500 15px 'Barlow',sans-serif;opacity:.9")}>Acceso interno para administración, ventas y staff de viaje.</div>
        </div>
      </div>
      <div style={css("display:flex;align-items:center;justify-content:center;padding:48px 24px 120px")}>
        <div style={css("width:100%;max-width:380px;display:flex;flex-direction:column;gap:22px")}>
          <img src="/assets/logo.png" alt="Expreso Sofía" style={css("width:200px;align-self:flex-start")} />
          <div style={css("display:flex;flex-direction:column;gap:4px")}>
            <div style={css("font:800 34px/1 'Barlow Condensed',sans-serif;text-transform:uppercase")}>Ingresá a tu cuenta</div>
            <div style={css("font:500 14px 'Barlow',sans-serif;color:#6B6468")}>Te llevamos a tu panel según tu rol.</div>
          </div>
          <form onSubmit={$.doLogin} noValidate style={css("display:flex;flex-direction:column;gap:14px")}>
            <label style={css("display:flex;flex-direction:column;gap:6px;font:600 13px 'Barlow',sans-serif")}>Email
              <input type="email" name="email" autoComplete="username" spellCheck={false} value={$.login?.email} onChange={$.setEmail} placeholder="nombre@expresosofia.com.ar" style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:500 15px 'Barlow',sans-serif")} className={pc("focus", "border-color:#E4007C")} />
            </label>
            <label style={css("display:flex;flex-direction:column;gap:6px;font:600 13px 'Barlow',sans-serif")}>Contraseña
              <input type="password" name="password" autoComplete="current-password" value={$.login?.pass} onChange={$.setPass} placeholder="••••••••" style={css("height:48px;border:1.5px solid #E2D9DE;border-radius:12px;padding:0 12px;font:500 15px 'Barlow',sans-serif")} className={pc("focus", "border-color:#E4007C")} />
            </label>
            {!!($.login?.error) && (<>
              <div role="alert" style={css("background:#FBE3E3;color:#B22A2A;border-radius:10px;padding:10px 12px;font:600 13px 'Barlow',sans-serif")}>{$.login?.error}</div>
            </>)}
            <button type="submit" disabled={$.login?.loading} style={css("height:56px;border:none;border-radius:999px;background:linear-gradient(135deg,#C2006A,#E4007C);color:#fff;font:800 17px 'Barlow Condensed',sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 10px 24px -10px rgba(228,0,124,.7)")}>
              {!!($.login?.loading) && (<><span style={css("width:18px;height:18px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:sofspin .8s linear infinite")}></span></>)}
              {$.login?.btn}
            </button>
            <button type="button" onClick={$.toPublic} style={css("height:40px;border:none;background:none;padding:0 8px;cursor:pointer;color:#C2006A;font:600 13px 'Barlow',sans-serif;align-self:center")}>Volver al sitio público</button>
          </form>
          <div style={css("border-top:1px solid #EFE8EC;padding-top:16px;display:flex;flex-direction:column;gap:8px")}>
            <div style={css("font:600 11px 'Barlow',sans-serif;letter-spacing:.1em;color:#716A6E")}>CUENTAS DE DEMO (CONTRASEÑA: SOFIA2026)</div>
            <div style={css("display:flex;flex-wrap:wrap;gap:8px")}>
              {(Array.isArray($.demoAccounts) ? $.demoAccounts : []).map((a: any, $index: number) => (<React.Fragment key={$index}>
                <button onClick={a?.fill} style={css("border:1.5px solid #F3C4DD;background:#FDF2F8;color:#A3005A;border-radius:999px;height:40px;padding:0 14px;font:600 13px 'Barlow',sans-serif;cursor:pointer")}>{a?.label}</button>
              </React.Fragment>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>)}


  {!($.barOpen) && (
    <button onClick={$.openBar} title="Demo con datos ficticios · cambiar de módulo" aria-label="Abrir selector de módulos" className="demo-tab" style={css("position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:70;border:none;cursor:pointer;background:#1D1A1C;color:#fff;border-radius:12px 0 0 12px;padding:12px 7px;display:flex;flex-direction:column;align-items:center;gap:8px;box-shadow:0 10px 30px -10px rgba(0,0,0,.5)")}>
      <span style={css("width:8px;height:8px;border-radius:50%;background:#FF4FA0")}></span>
      <span className="demo-tab-label" style={css("writing-mode:vertical-rl;transform:rotate(180deg);font:800 12px 'Barlow',sans-serif;letter-spacing:.12em")}>DEMO · {$.roleLabel}</span>
      <span style={css("font-family:'Material Symbols Rounded';font-size:18px")}>chevron_left</span>
    </button>
  )}
  {!!($.barOpen) && (
  <div style={css("position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:70;display:flex;flex-direction:column;align-items:center;gap:10px;max-width:calc(100vw - 24px)")}>
    {!!($.panelOpen) && (<>
      <div className="demo-panel" style={css("width:340px;max-width:100%;background:#fff;border-radius:18px;box-shadow:0 20px 60px -15px rgba(0,0,0,.35),0 0 0 1px #EEE6EA;padding:16px;display:flex;flex-direction:column;gap:14px;max-height:calc(100vh - 110px);overflow:auto")}>
        <div style={css("display:flex;justify-content:space-between;align-items:center")}>
          <div style={css("font:800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.03em")}>Escenarios de demo</div>
          <button onClick={$.togglePanel} aria-label="Cerrar escenarios" style={css("border:none;background:#F3EEF1;border-radius:50%;width:40px;height:40px;cursor:pointer;font-family:'Material Symbols Rounded';font-size:20px")}>close</button>
        </div>
        <div style={css("display:flex;flex-direction:column;gap:6px")}>
          <div style={css("font:600 11px 'Barlow',sans-serif;letter-spacing:.1em;color:#716A6E")}>RESULTADO DEL PAGO MERCADOPAGO</div>
          <div style={css("display:flex;gap:4px;background:#F3EEF1;border-radius:999px;padding:3px")}>
            {(Array.isArray($.payOpts) ? $.payOpts : []).map((o: any, $index: number) => (<React.Fragment key={$index}>
              <button onClick={o?.on} style={css(`flex:1;height:40px;border:none;border-radius:999px;padding:0 6px;cursor:pointer;font:700 12px 'Barlow',sans-serif;background:${o?.bg ?? ''};color:${o?.fg ?? ''}`)}>{o?.label}</button>
            </React.Fragment>))}
          </div>
        </div>
        {(Array.isArray($.toggles) ? $.toggles : []).map((t: any, $index: number) => (<React.Fragment key={$index}>
          <button onClick={t?.on} style={css("display:flex;align-items:center;gap:12px;border:none;background:none;padding:0;cursor:pointer;text-align:left")}>
            <span style={css(`flex:none;width:40px;height:24px;border-radius:999px;background:${t?.track ?? ''};position:relative;transition:background .15s`)}><span style={css(`position:absolute;top:3px;left:${t?.knob ?? ''}px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:left .15s`)}></span></span>
            <span style={css("display:flex;flex-direction:column;gap:1px")}><span style={css("font:700 14px 'Barlow',sans-serif;color:#1D1A1C")}>{t?.label}</span><span style={css("font:500 12px 'Barlow',sans-serif;color:#6B6468")}>{t?.desc}</span></span>
          </button>
        </React.Fragment>))}
        <div style={css("display:flex;gap:8px;border-top:1px solid #F0E9ED;padding-top:12px")}>
          <button onClick={$.goLogin} style={css("flex:1;height:40px;border-radius:999px;border:1.5px solid #E4007C;background:#fff;color:#E4007C;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Ver login</button>
          <button onClick={$.resetDemo} style={css("flex:1;height:40px;border-radius:999px;border:none;background:#1D1A1C;color:#fff;font:700 13px 'Barlow',sans-serif;cursor:pointer")}>Reiniciar demo</button>
        </div>
      </div>
    </>)}
    <div className="demo-bar" style={css("display:flex;align-items:center;gap:6px;background:#1D1A1C;border-radius:999px;padding:5px;box-shadow:0 14px 40px -10px rgba(0,0,0,.5);flex-wrap:nowrap;justify-content:center;width:max-content;max-width:calc(100vw - 24px)")}>
      {(Array.isArray($.roles) ? $.roles : []).map((o: any, $index: number) => (<React.Fragment key={$index}>
        <button onClick={o?.on} style={css(`border:none;border-radius:999px;height:40px;padding:0 14px;cursor:pointer;font:700 13px 'Barlow',sans-serif;background:${o?.bg ?? ''};color:${o?.fg ?? ''}`)}>{o?.label}</button>
      </React.Fragment>))}
      <span style={css("width:1px;height:22px;background:#4A4447")}></span>
      <button onClick={$.togglePanel} style={css(`border:none;border-radius:999px;height:40px;padding:0 14px;cursor:pointer;font:700 12px 'Barlow',sans-serif;background:${$.panelBg ?? ''};color:#fff`)}>Escenarios</button>
      <button onClick={$.closeBar} aria-label="Cerrar selector" title="Ocultar" style={css("border:none;border-radius:50%;width:40px;height:40px;flex:none;cursor:pointer;background:#3A3437;color:#fff;font-family:'Material Symbols Rounded';font-size:20px;display:flex;align-items:center;justify-content:center")}>close</button>
    </div>
    <div style={css("background:rgba(29,26,28,.82);color:#fff;border-radius:999px;padding:4px 10px;font:600 11px 'Barlow',sans-serif;letter-spacing:.04em;order:-1")}>Demo con datos ficticios</div>
  </div>
  )}
</div>
<ConfirmHost />
</>);
  }
}
