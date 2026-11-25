// Sakuga VFX Studio Extensions: six additional anime-physics custom elements built on window.SakugaFX.
// Elements: <sakuga-like>, <sakuga-accordion>, <sakuga-stepper>, <sakuga-select>, <sakuga-copy>, <sakuga-chip-group>.
// Requires window.SakugaFX to be initialized first (loaded by any core Sakuga VFX script).
(() => {
  'use strict';
  const fx = window.SakugaFX;
  if (!fx) return;

  const {
    Spring,
    clamp,
    later,
    at,
    esc,
    squashy,
    puff,
    burst,
    shards,
    ring,
    splash,
    slash,
    lines,
    ticks,
    donut,
    wob,
    kira,
    sfx,
  } = fx;

  const getHollow = () => ({ col: fx.P.fill, edge: fx.P.ink });
  const getDotted = () => ({ dots: true, edge: fx.P.ink });

  // 1. <sakuga-like> — Heart button with spring pop, back-layer impact burst, accent ticks, and hollow ポン
  class SakugaLike extends fx.Base {
    static formAssociated = true;
    static delegates = true;
    static observedAttributes = ['liked', 'count', 'disabled'];
    static css = `
      button {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        height: 46px;
        padding: 0 18px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 15px;
        box-shadow: var(--sk-sh);
        cursor: pointer;
        user-select: none;
        will-change: transform;
        transition: background 120ms ease, color 120ms ease;
      }
      button:disabled { opacity: .5; cursor: not-allowed; }
      button[aria-pressed="true"] {
        background: var(--sk-acc);
        color: var(--sk-on-pri);
      }
      .heart {
        display: inline-flex;
        width: 20px;
        height: 20px;
        transform: scale(var(--hs, 1));
        will-change: transform;
      }
      svg {
        width: 100%;
        height: 100%;
        fill: transparent;
        stroke: currentColor;
        stroke-width: 2.3;
        stroke-linejoin: round;
        overflow: visible;
      }
      button[aria-pressed="true"] svg {
        fill: var(--sk-on-pri);
      }
      .num {
        font-variant-numeric: tabular-nums;
        min-width: 2ch;
        text-align: left;
      }
    `;

    get liked() {
      return this._liked ?? this.hasAttribute('liked');
    }
    set liked(v) {
      this._liked = !!v;
      if (this.b) this.syncUI();
    }
    get count() {
      return this._count ?? Math.max(0, parseInt(this.getAttribute('count') || '24', 10) || 0);
    }
    set count(v) {
      this._count = Math.max(0, Math.round(Number(v) || 0));
      if (this.b) this.syncUI();
    }
    get disabled() {
      return this.hasAttribute('disabled');
    }
    set disabled(v) {
      this.toggleAttribute('disabled', !!v);
    }

    render() {
      const label = esc(this.getAttribute('label') || 'Like');
      return `
        <button type="button" aria-pressed="false" aria-label="${label}"${this.disabled ? ' disabled' : ''}>
          <span class="heart" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 20.4l-1.35-1.24C5.4 14.36 2 11.27 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.77-3.4 6.86-8.65 11.67L12 20.4z"/></svg>
          </span>
          <span class="num"></span>
        </button>
      `;
    }

    syncUI() {
      this.b.setAttribute('aria-pressed', String(this._liked));
      this.numEl.textContent = String(this._count);
      this.b.disabled = this.disabled;
      this.internals?.setFormValue(this._liked ? String(this._count) : null);
    }

    setup() {
      this.b = this.$('button');
      this.numEl = this.$('.num');
      this._liked = this.hasAttribute('liked');
      this._count = Math.max(0, parseInt(this.getAttribute('count') || '24', 10) || 0);
      this.press = squashy(this.b, { low: 0.78, wide: 0.4 });
      this.heartSp = new Spring(1, 540, 11);
      this.back = this.backLayer();
      this.syncUI();

      this.b.addEventListener('click', () => {
        if (this.disabled) return;
        this._liked = !this._liked;
        this._count = Math.max(0, this._count + (this._liked ? 1 : -1));
        this.syncUI();

        const c = at(this.b);
        if (!this._liked) {
          this.heartSp.x = 0.85;
          puff(c.x, c.y, { size: 7, n: 3, vx: 0, vy: -10, life: 0.38 });
        } else {
          this.press.pop.x = 1.14;
          this.press.tilt.x = -5;
          this.heartSp.x = 0.35;
          burst(c.x, c.y, { r: 48, spikes: 12, life: 0.36, layer: this.back });
          ticks(c.x, c.y, { dir: -Math.PI / 2, n: 7, r: 32, len: 15, fan: 0.52, life: 0.48 });
          later(90, () => puff(c.x + 34, c.y - 22, { size: 9, n: 4, vx: 18, vy: -16, life: 0.62 }));
          later(180, () => kira(c.x - 28, c.y - 28, { r: 10, life: 0.6, col: fx.P.accent }));
          sfx('pon', c.x + 28, c.y - 54, { size: 78, rot: 0.08, life: 0.84, ...getHollow() });
        }
        this.emit('change', { liked: this._liked, count: this._count });
      });
    }

    attributeChangedCallback() {
      if (this.b) this.syncUI();
    }

    frame(dt) {
      this.press.step(dt);
      const hs = this.heartSp.step(dt);
      const still = Math.abs(hs - 1) < 0.002 && Math.abs(this.heartSp.v) < 0.02;
      if (still) {
        if (this._hsActive) {
          this._hsActive = false;
          this.b.style.removeProperty('--hs');
        }
      } else {
        this._hsActive = true;
        this.b.style.setProperty('--hs', Math.max(0.2, hs).toFixed(3));
      }
    }
  }
  fx.define('sakuga-like', SakugaLike);

  // 2. <sakuga-accordion> — Disclosure panel with slash reveal, speed lines, and シュッ
  class SakugaAccordion extends fx.Base {
    static delegates = true;
    static observedAttributes = ['open', 'summary'];
    static css = `
      :host { display: block; width: var(--sk-accordion-width, 280px); max-width: 100%; }
      .box {
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        box-shadow: var(--sk-sh);
        overflow: hidden;
        will-change: transform;
      }
      button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        width: 100%;
        padding: 13px 16px;
        border: 0;
        background: transparent;
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 14.5px;
        text-align: left;
        cursor: pointer;
      }
      .chev {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        will-change: transform;
      }
      .chev svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: var(--sk-ink);
        stroke-width: 2.6;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .panel {
        overflow: hidden;
        border-top: 0 solid transparent;
      }
      .panel.open {
        border-top: 2px solid var(--sk-soft);
      }
      .inner {
        padding: 12px 16px 15px;
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--sk-dim);
      }
    `;

    get open() {
      return !!this._open;
    }
    set open(v) {
      this._open = !!v;
      if (this.btn) this.sync(true);
    }

    render() {
      const summary = esc(this.getAttribute('summary') || 'Keyframe notes');
      return `
        <div class="box">
          <button type="button" aria-expanded="false">
            <span class="title">${summary}</span>
            <span class="chev" aria-hidden="true">
              <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </button>
          <div class="panel" role="region" hidden>
            <div class="inner"><slot></slot></div>
          </div>
        </div>
      `;
    }

    sync(quiet) {
      this.btn.setAttribute('aria-expanded', String(this._open));
      this.panel.classList.toggle('open', this._open);
      this.panel.hidden = !this._open;
      this.rotSp.to = this._open ? 180 : 0;
      if (quiet) this.rotSp.x = this.rotSp.to;
    }

    setup() {
      this.box = this.$('.box');
      this.btn = this.$('button');
      this.chev = this.$('.chev');
      this.panel = this.$('.panel');
      this._open = this.hasAttribute('open');
      this.rotSp = new Spring(this._open ? 180 : 0, 420, 18);
      this.squashSp = new Spring(1, 520, 15);
      this.sync(true);

      this.btn.addEventListener('click', () => {
        this._open = !this._open;
        this.sync(false);
        this.squashSp.x = this._open ? 0.92 : 1.06;

        const c = at(this.btn, 0.5, 1);
        if (this._open) {
          slash(c.x, c.y, { len: Math.min(180, c.w * 0.72), ang: -0.05, life: 0.36, thick: 12 });
          lines(c.x - 16, c.y + 8, { n: 6, dir: 0, len: 42, spread: 18, life: 0.28 });
          later(70, () => {
            puff(c.x - c.w * 0.36, c.y + 8, { size: 7, n: 3, vx: -18, vy: 8, life: 0.48 });
            puff(c.x + c.w * 0.36, c.y + 8, { size: 7, n: 3, vx: 18, vy: 8, life: 0.48 });
          });
          sfx('shu', c.x + c.w * 0.28, c.y - 38, { size: 68, rot: -0.1, life: 0.78, ...getHollow() });
        } else {
          wob(c.x + c.w * 0.42, c.y - 12, { dir: 1, r: 14, life: 0.38 });
          puff(c.x, c.y, { size: 6, n: 3, vx: 0, vy: -8, life: 0.35 });
        }
        this.emit('change', { open: this._open });
      });
    }

    attributeChangedCallback(name, _, val) {
      if (!this.btn) return;
      if (name === 'summary') this.$('.title').textContent = val || 'Keyframe notes';
      if (name === 'open') {
        this._open = this.hasAttribute('open');
        this.sync(true);
      }
    }

    frame(dt) {
      const r = this.rotSp.step(dt);
      const y = this.squashSp.step(dt);
      const rotStill = Math.abs(r - this.rotSp.to) < 0.05 && Math.abs(this.rotSp.v) < 0.1;
      if (!rotStill || this._lastRot !== this.rotSp.to) {
        const out = rotStill ? this.rotSp.to : r;
        this.chev.style.transform = out ? `rotate(${out.toFixed(1)}deg)` : '';
        if (rotStill) this._lastRot = this.rotSp.to;
      }
      const still = Math.abs(y - 1) < 0.001 && Math.abs(this.squashSp.v) < 0.01;
      if (!still || this._boxMoved) {
        this._boxMoved = !still;
        this.box.style.transform = still ? '' : `scale(${(1 + (1 - y) * 0.45).toFixed(3)}, ${y.toFixed(3)})`;
      }
    }
  }
  fx.define('sakuga-accordion', SakugaAccordion);

  // 3. <sakuga-stepper> — Numeric quantity stepper with spring number pop, カチッ ticks, and min/max wall bump
  class SakugaStepper extends fx.Base {
    static formAssociated = true;
    static delegates = true;
    static observedAttributes = ['value', 'min', 'max', 'step', 'disabled'];
    static css = `
      .wrap {
        display: inline-flex;
        align-items: center;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        box-shadow: var(--sk-sh);
        overflow: hidden;
        will-change: transform;
      }
      button {
        width: 44px;
        height: 44px;
        border: 0;
        background: transparent;
        color: var(--sk-ink);
        font-size: 20px;
        font-weight: 800;
        cursor: pointer;
        user-select: none;
        transition: background 120ms ease;
      }
      button:hover:not(:disabled) { background: rgba(143, 141, 247, 0.16); }
      button:disabled { opacity: .4; cursor: not-allowed; }
      .val {
        min-width: 54px;
        padding: 0 8px;
        text-align: center;
        font-weight: 800;
        font-size: 16px;
        font-variant-numeric: tabular-nums;
        border-left: 2px solid var(--sk-soft);
        border-right: 2px solid var(--sk-soft);
        line-height: 44px;
        will-change: transform;
        outline: none;
      }
    `;

    get min() {
      return Number(this.getAttribute('min') ?? 0);
    }
    get max() {
      return Number(this.getAttribute('max') ?? 10);
    }
    get stepVal() {
      return Math.max(1, Number(this.getAttribute('step') ?? 1) || 1);
    }
    get value() {
      return this._val ?? clamp(Number(this.getAttribute('value') ?? 1) || 0, this.min, this.max);
    }
    set value(n) {
      this._val = clamp(Number(n) || 0, this.min, this.max);
      if (this.valEl) this.syncUI();
    }
    get disabled() {
      return this.hasAttribute('disabled');
    }

    render() {
      const label = esc(this.getAttribute('label') || 'Quantity');
      return `
        <div class="wrap" role="group" aria-label="${label}">
          <button type="button" class="dec" aria-label="Decrease ${label}">−</button>
          <span class="val" role="spinbutton" tabindex="0" aria-label="${label}"></span>
          <button type="button" class="inc" aria-label="Increase ${label}">+</button>
        </div>
      `;
    }

    syncUI() {
      this.valEl.textContent = String(this._val);
      this.valEl.setAttribute('aria-valuemin', String(this.min));
      this.valEl.setAttribute('aria-valuemax', String(this.max));
      this.valEl.setAttribute('aria-valuenow', String(this._val));
      this.decBtn.disabled = this.disabled;
      this.incBtn.disabled = this.disabled;
      this.internals?.setFormValue(String(this._val));
    }

    nudge(dir) {
      if (this.disabled) return;
      const next = clamp(this._val + dir * this.stepVal, this.min, this.max);
      const hitLimit = next === this._val;
      const btn = dir > 0 ? this.incBtn : this.decBtn;
      const c = at(btn);

      if (hitLimit) {
        this.shiftSp.x = dir * 10;
        wob(c.x + dir * 20, c.y, { dir, r: 16, life: 0.42 });
        puff(c.x + dir * 12, c.y + 8, { size: 7, n: 3, vx: dir * 24, vy: -12, life: 0.45 });
        return;
      }

      this._val = next;
      this.syncUI();
      this.popSp.x = 1.42;
      this.tiltSp.x = dir * 12;
      this.shiftSp.x = dir * 4;

      ticks(c.x, c.y, { dir: dir > 0 ? -0.45 : -Math.PI + 0.45, n: 4, r: 18, len: 12, fan: 0.48, life: 0.36 });
      puff(c.x, c.y + 14, { size: 6, n: 3, vx: dir * 14, vy: -10, life: 0.4 });
      sfx('kachi', c.x + dir * 18, c.y - 44, { size: 62, rot: dir * 0.1, life: 0.65, ...getHollow() });
      this.emit('change', { value: this._val });
    }

    setup() {
      this.wrap = this.$('.wrap');
      this.decBtn = this.$('.dec');
      this.incBtn = this.$('.inc');
      this.valEl = this.$('.val');
      this._val = clamp(Number(this.getAttribute('value') ?? 1) || 0, this.min, this.max);
      this.popSp = new Spring(1, 560, 14);
      this.tiltSp = new Spring(0, 420, 13);
      this.shiftSp = new Spring(0, 480, 15);
      this.syncUI();

      this.decBtn.addEventListener('click', () => this.nudge(-1));
      this.incBtn.addEventListener('click', () => this.nudge(1));
      this.valEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.nudge(1);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          e.preventDefault();
          this.nudge(-1);
        }
      });
    }

    frame(dt) {
      const p = this.popSp.step(dt);
      const t = this.tiltSp.step(dt);
      const x = this.shiftSp.step(dt);
      const numStill = Math.abs(p - 1) < 0.002 && Math.abs(t) < 0.05;
      this.valEl.style.transform = numStill ? '' : `scale(${p.toFixed(3)}) rotate(${t.toFixed(1)}deg)`;
      const wrapStill = Math.abs(x) < 0.05 && Math.abs(this.shiftSp.v) < 0.1;
      this.wrap.style.transform = wrapStill ? '' : `translateX(${x.toFixed(1)}px)`;
    }
  }
  fx.define('sakuga-stepper', SakugaStepper);

  // 4. <sakuga-select> — Custom paper dropdown combobox with spring menu, crystal shards, and ズザッ commit
  class SakugaSelect extends fx.Base {
    static formAssociated = true;
    static fromChildren = true;
    static delegates = true;
    static css = `
      :host { position: relative; display: inline-block; width: var(--sk-select-width, 220px); }
      .trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        height: 44px;
        padding: 0 14px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 14.5px;
        box-shadow: var(--sk-sh);
        cursor: pointer;
        will-change: transform;
      }
      .arrow {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        transition: transform 150ms ease;
      }
      .trigger[aria-expanded="true"] .arrow { transform: rotate(180deg); }
      .menu {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + 10px);
        z-index: 40;
        padding: 6px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        box-shadow: var(--sk-sh);
        transform-origin: top center;
        will-change: transform;
      }
      .menu[hidden] { display: none; }
      .opt {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 8px 10px;
        border: 0;
        border-radius: 9px;
        background: transparent;
        color: var(--sk-ink);
        font-weight: 600;
        font-size: 14px;
        text-align: left;
        cursor: pointer;
      }
      .opt:hover, .opt:focus-visible { background: rgba(143, 141, 247, 0.18); outline: none; }
      .opt[aria-selected="true"] {
        background: var(--sk-pri);
        color: var(--sk-on-pri);
      }
    `;

    get value() {
      return this.opts?.[this.idx]?.value ?? '';
    }
    set value(v) {
      if (!this.opts) return;
      const found = this.opts.findIndex((o) => o.value === String(v));
      if (found >= 0) {
        this.idx = found;
        this.syncUI();
      }
    }

    render() {
      this.opts = [...this.querySelectorAll('option')].map((o) => ({
        value: o.getAttribute('value') ?? o.textContent.trim(),
        label: o.textContent.trim(),
        selected: o.hasAttribute('selected'),
      }));
      if (!this.opts.length) {
        this.opts = [
          { value: '12fps', label: 'Sakuga 12fps', selected: true },
          { value: '24fps', label: 'Full 24fps', selected: false },
        ];
      }
      this.idx = Math.max(0, this.opts.findIndex((o) => o.selected));
      const label = esc(this.getAttribute('label') || 'Select option');
      const items = this.opts
        .map(
          (o, i) =>
            `<button type="button" class="opt" role="option" data-i="${i}" aria-selected="${i === this.idx}">${esc(o.label)}</button>`
        )
        .join('');
      return `
        <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="${label}">
          <span class="cur">${esc(this.opts[this.idx].label)}</span>
          <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="menu" role="listbox" aria-label="${label}" hidden>${items}</div>
      `;
    }

    syncUI() {
      const current = this.opts[this.idx];
      this.curEl.textContent = current.label;
      this.optEls.forEach((el, i) => el.setAttribute('aria-selected', String(i === this.idx)));
      this.internals?.setFormValue(current.value);
    }

    setOpen(open, animate = true) {
      this._open = open;
      this.trigger.setAttribute('aria-expanded', String(open));
      this.menu.hidden = !open;
      if (open && animate) {
        this.menuSp.x = 0.72;
        this.menuSp.to = 1;
        const c = at(this.trigger, 0.5, 1);
        puff(c.x - 42, c.y + 8, { size: 6, n: 3, vx: -16, vy: 8, life: 0.42 });
        puff(c.x + 42, c.y + 8, { size: 6, n: 3, vx: 16, vy: 8, life: 0.42 });
        sfx('kachi', c.x + 64, c.y - 34, { size: 54, rot: -0.08, life: 0.55, ...getHollow() });
      }
    }

    setup() {
      this.trigger = this.$('.trigger');
      this.curEl = this.$('.cur');
      this.menu = this.$('.menu');
      this.optEls = this.$$('.opt');
      this._open = false;
      this.press = squashy(this.trigger, { low: 0.84, wide: 0.35 });
      this.menuSp = new Spring(1, 520, 16);
      this.syncUI();

      this.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setOpen(!this._open);
      });

      this.optEls.forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const changed = i !== this.idx;
          this.idx = i;
          this.syncUI();
          this.setOpen(false, false);
          this.press.pop.x = 1.12;
          const c = at(this.trigger);
          if (changed) {
            shards(c.x, c.y, { n: 6, speed: 170, size: 5, life: 0.6 });
            lines(c.x - 16, c.y, { n: 6, dir: Math.PI, len: 46, spread: 20, life: 0.3 });
            sfx('zuza', c.x + 54, c.y - 38, { size: 64, rot: -0.1, life: 0.78, ...getDotted() });
            this.emit('change', { index: i, value: this.opts[i].value, label: this.opts[i].label });
          }
          this.trigger.focus();
        });
      });

      this.onDocClick = (e) => {
        if (this._open && !this.contains(e.target)) this.setOpen(false, false);
      };
      this.onKey = (e) => {
        if (e.key === 'Escape' && this._open) {
          this.setOpen(false, false);
          this.trigger.focus();
        }
      };
      document.addEventListener('click', this.onDocClick);
      this.root.addEventListener('keydown', this.onKey);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener('click', this.onDocClick);
    }

    frame(dt) {
      this.press.step(dt);
      const ms = this.menuSp.step(dt);
      if (!this._open) return;
      const still = Math.abs(ms - 1) < 0.002 && Math.abs(this.menuSp.v) < 0.02;
      this.menu.style.transform = still ? '' : `scale(${(1 + (1 - ms) * 0.25).toFixed(3)}, ${ms.toFixed(3)})`;
    }
  }
  fx.define('sakuga-select', SakugaSelect);

  // 5. <sakuga-copy> — Clipboard copy button with icon spring flip, shards, kira sparkle, and カチッ
  class SakugaCopy extends fx.Base {
    static delegates = true;
    static css = `
      button {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        height: 44px;
        padding: 0 16px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 14.5px;
        box-shadow: var(--sk-sh);
        cursor: pointer;
        user-select: none;
        will-change: transform;
      }
      button.done {
        background: var(--sk-pri);
        color: var(--sk-on-pri);
      }
      .ico {
        width: 17px;
        height: 17px;
        display: inline-flex;
        will-change: transform;
      }
      svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.4;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .i-check { display: none; }
      button.done .i-copy { display: none; }
      button.done .i-check { display: block; }
    `;

    render() {
      const text = esc(this.getAttribute('label') || 'Copy snippet');
      return `
        <button type="button" aria-live="polite">
          <span class="ico" aria-hidden="true">
            <svg class="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <svg class="i-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span class="txt">${text}</span>
        </button>
      `;
    }

    setup() {
      this.b = this.$('button');
      this.ico = this.$('.ico');
      this.txt = this.$('.txt');
      this.defaultLabel = this.getAttribute('label') || 'Copy snippet';
      this._copySeq = 0;
      this.press = squashy(this.b, { low: 0.8, wide: 0.35 });
      this.icoSp = new Spring(1, 560, 12);
      this.back = this.backLayer();

      this.b.addEventListener('click', async () => {
        const payload = this.getAttribute('value') || 'npx shadcn add finktheartist/sakuga-vfx/button';
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(payload);
          }
        } catch {
          // Non-fatal in restricted contexts
        }

        const seq = ++this._copySeq;
        this.b.classList.add('done');
        this.txt.textContent = 'Copied!';
        this.press.pop.x = 1.12;
        this.icoSp.x = 0.25;

        const c = at(this.b);
        burst(c.x, c.y, { r: 38, spikes: 10, life: 0.32, layer: this.back });
        shards(c.x, c.y, { n: 6, speed: 185, size: 5, life: 0.62 });
        kira(c.x + c.w * 0.44, c.y - 22, { r: 10, life: 0.62, col: fx.P.accent });
        sfx('kachi', c.x + 36, c.y - 46, { size: 66, rot: -0.1, life: 0.78, ...getHollow() });

        this.emit('sakuga:copy', { value: payload });

        later(1600, () => {
          if (this._copySeq !== seq) return;
          this.b.classList.remove('done');
          this.txt.textContent = this.defaultLabel;
        });
      });
    }

    frame(dt) {
      this.press.step(dt);
      const s = this.icoSp.step(dt);
      const still = Math.abs(s - 1) < 0.002 && Math.abs(this.icoSp.v) < 0.02;
      this.ico.style.transform = still ? '' : `scale(${Math.max(0.2, s).toFixed(3)}) rotate(${((1 - s) * -28).toFixed(1)}deg)`;
    }
  }
  fx.define('sakuga-copy', SakugaCopy);

  // 6. <sakuga-chip-group> — Multi-select anime tag chips with individual springs, accent ticks, and ポン
  class SakugaChipGroup extends fx.Base {
    static formAssociated = true;
    static fromChildren = true;
    static css = `
      .group {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }
      button {
        height: 38px;
        padding: 0 15px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 999px;
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 13.5px;
        box-shadow: 4px 5px 0 var(--sk-soft);
        cursor: pointer;
        user-select: none;
        will-change: transform;
        transition: background 120ms ease, color 120ms ease;
      }
      button[aria-pressed="true"] {
        background: var(--sk-pri);
        color: var(--sk-on-pri);
      }
    `;

    get values() {
      return this.items ? this.items.filter((it) => it.selected).map((it) => it.value) : [];
    }

    render() {
      this.items = [...this.querySelectorAll('option')].map((o) => ({
        value: o.getAttribute('value') ?? o.textContent.trim(),
        label: o.textContent.trim(),
        selected: o.hasAttribute('selected'),
      }));
      if (!this.items.length) {
        this.items = [
          { value: 'smear', label: 'Smear', selected: true },
          { value: 'impact', label: 'Impact', selected: false },
          { value: 'cel', label: 'Cel Shade', selected: false },
        ];
      }
      const label = esc(this.getAttribute('label') || 'Effect tags');
      const btns = this.items
        .map(
          (it, i) =>
            `<button type="button" data-i="${i}" aria-pressed="${it.selected}">${esc(it.label)}</button>`
        )
        .join('');
      return `<div class="group" role="group" aria-label="${label}">${btns}</div>`;
    }

    syncForm() {
      this.internals?.setFormValue(this.values.join(','));
    }

    setup() {
      this.btns = this.$$('button');
      this.presses = this.btns.map((b) => squashy(b, { low: 0.78, wide: 0.35 }));
      this.back = this.backLayer();
      this.syncForm();

      this.btns.forEach((b, i) => {
        b.addEventListener('click', () => {
          const item = this.items[i];
          item.selected = !item.selected;
          b.setAttribute('aria-pressed', String(item.selected));
          this.syncForm();

          const c = at(b);
          if (item.selected) {
            this.presses[i].pop.x = 1.15;
            this.presses[i].tilt.x = (i % 2 ? 1 : -1) * 4;
            burst(c.x, c.y, { r: 34, spikes: 10, life: 0.32, layer: this.back });
            ticks(c.x, c.y, { dir: -Math.PI / 2, n: 5, r: 22, len: 12, fan: 0.55, life: 0.42 });
            puff(c.x, c.y + 12, { size: 6, n: 3, vx: 0, vy: -12, life: 0.44 });
            sfx('pon', c.x + 22, c.y - 42, { size: 64, rot: 0.06, life: 0.72, ...getHollow() });
          } else {
            puff(c.x, c.y, { size: 6, n: 2, vx: 0, vy: -8, life: 0.34 });
          }
          this.emit('change', { values: this.values, toggled: item.value, selected: item.selected });
        });
      });
    }

    frame(dt) {
      for (const p of this.presses) p.step(dt);
    }
  }
  fx.define('sakuga-chip-group', SakugaChipGroup);

  // 7. <sakuga-segmented> — 3-way segmented control with spring-gliding thumb, speed lines, and カチッ
  class SakugaSegmented extends fx.Base {
    static formAssociated = true;
    static fromChildren = true;
    static css = `
      .track {
        position: relative;
        display: inline-grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        padding: 4px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        box-shadow: var(--sk-sh);
        user-select: none;
      }
      .thumb {
        position: absolute;
        top: 4px;
        bottom: 4px;
        left: 0;
        border-radius: calc(var(--sk-r) - 4px);
        background: var(--sk-pri);
        will-change: transform, width;
        pointer-events: none;
      }
      button {
        position: relative;
        z-index: 1;
        height: 36px;
        padding: 0 14px;
        border: 0;
        background: transparent;
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 13.5px;
        cursor: pointer;
        white-space: nowrap;
        transition: color 120ms ease;
      }
      button[aria-checked="true"] {
        color: var(--sk-on-pri);
      }
    `;

    get value() {
      return this.opts?.[this.idx]?.value ?? '';
    }

    render() {
      this.opts = [...this.querySelectorAll('option')].map((o) => ({
        value: o.getAttribute('value') ?? o.textContent.trim(),
        label: o.textContent.trim(),
        selected: o.hasAttribute('selected'),
      }));
      if (!this.opts.length) {
        this.opts = [
          { value: '12fps', label: '12fps', selected: true },
          { value: '24fps', label: '24fps', selected: false },
          { value: 'smear', label: 'Smear', selected: false },
        ];
      }
      this.idx = Math.max(0, this.opts.findIndex((o) => o.selected));
      const label = esc(this.getAttribute('label') || 'Mode');
      const btns = this.opts
        .map(
          (o, i) =>
            `<button type="button" role="radio" tabindex="${i === this.idx ? 0 : -1}" aria-checked="${i === this.idx}" data-i="${i}">${esc(o.label)}</button>`
        )
        .join('');
      return `<div class="track" role="radiogroup" aria-label="${label}"><span class="thumb" aria-hidden="true"></span>${btns}</div>`;
    }

    measure(instant) {
      const btn = this.btns[this.idx];
      if (!btn) return;
      const x = btn.offsetLeft;
      const w = btn.offsetWidth;
      this.xSp.to = x;
      this.wSp.to = w;
      if (instant) {
        this.xSp.x = x;
        this.xSp.v = 0;
        this.wSp.x = w;
        this.wSp.v = 0;
        this.thumb.style.width = `${w}px`;
        this.thumb.style.transform = `translateX(${x}px)`;
      }
    }

    select(i) {
      if (i === this.idx || i < 0 || i >= this.opts.length) return;
      const dir = i > this.idx ? 1 : -1;
      this.idx = i;
      this.btns.forEach((b, k) => {
        b.setAttribute('aria-checked', String(k === i));
        b.tabIndex = k === i ? 0 : -1;
      });
      this.internals?.setFormValue(this.opts[i].value);
      this.measure(false);

      const c = at(this.btns[i]);
      lines(c.x - dir * 18, c.y, { n: 5, dir: dir > 0 ? Math.PI : 0, len: 34, spread: 16, life: 0.28 });
      puff(c.x, c.y + 16, { size: 6, n: 3, vx: -dir * 16, vy: -8, life: 0.42 });
      sfx('kachi', c.x + dir * 14, c.y - 40, { size: 58, rot: dir * 0.08, life: 0.64, ...getHollow() });
      this.emit('change', { index: i, value: this.opts[i].value, label: this.opts[i].label });
    }

    setup() {
      this.thumb = this.$('.thumb');
      this.btns = this.$$('button');
      this.xSp = new Spring(0, 520, 22);
      this.wSp = new Spring(60, 520, 24);
      this.internals?.setFormValue(this.opts[this.idx].value);
      requestAnimationFrame(() => this.measure(true));

      this.btns.forEach((b, i) => {
        b.addEventListener('click', () => this.select(i));
        b.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const next = (this.idx + 1) % this.opts.length;
            this.select(next);
            this.btns[next].focus();
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = (this.idx - 1 + this.opts.length) % this.opts.length;
            this.select(prev);
            this.btns[prev].focus();
          }
        });
      });
    }

    frame(dt) {
      const x = this.xSp.step(dt);
      const w = Math.max(16, this.wSp.step(dt));
      const settled =
        Math.abs(x - this.xSp.to) < 0.1 &&
        Math.abs(this.xSp.v) < 0.2 &&
        Math.abs(w - this.wSp.to) < 0.1 &&
        Math.abs(this.wSp.v) < 0.2;
      if (settled && this._thumbSettled) return;
      this._thumbSettled = settled;
      const stretch = settled ? 1 : 1 + clamp(Math.abs(this.xSp.v) / 1400, 0, 0.24);
      this.thumb.style.width = `${(settled ? this.wSp.to : w).toFixed(1)}px`;
      this.thumb.style.transform = settled
        ? `translateX(${this.xSp.to.toFixed(1)}px)`
        : `translateX(${x.toFixed(1)}px) scaleX(${stretch.toFixed(3)})`;
    }
  }
  fx.define('sakuga-segmented', SakugaSegmented);

  // 8. <sakuga-otp> — 4-box passcode / OTP input with per-digit pop, ticks, and completion burst + ドン!
  class SakugaOtp extends fx.Base {
    static formAssociated = true;
    static css = `
      .row {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      input {
        width: 46px;
        height: 52px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        box-shadow: var(--sk-sh);
        text-align: center;
        font-family: var(--sk-font-display, inherit);
        font-weight: 800;
        font-size: 20px;
        font-variant-numeric: tabular-nums;
        outline: none;
        will-change: transform;
        transition: border-color 120ms ease, background 120ms ease;
      }
      input:focus {
        border-color: var(--sk-pri);
        box-shadow: 0 0 0 3px var(--sk-soft);
      }
      input.filled {
        background: rgba(143, 141, 247, 0.14);
      }
    `;

    get value() {
      return this.inputs ? this.inputs.map((el) => el.value).join('') : '';
    }

    render() {
      const len = clamp(parseInt(this.getAttribute('length') || '4', 10) || 4, 3, 6);
      const label = esc(this.getAttribute('label') || 'Passcode');
      const cells = Array.from({ length: len }, (_, i) =>
        `<input type="text" inputmode="numeric" maxlength="1" autocomplete="one-time-code" aria-label="${label} digit ${i + 1}" data-i="${i}" />`
      ).join('');
      return `<div class="row" role="group" aria-label="${label}">${cells}</div>`;
    }

    syncForm() {
      const code = this.value;
      this.internals?.setFormValue(code);
      this.inputs.forEach((inp) => inp.classList.toggle('filled', inp.value.length > 0));
      return code;
    }

    celebrate() {
      const c = at(this.$('.row'));
      burst(c.x, c.y, { r: 62, spikes: 14, life: 0.44, layer: this.back });
      kira(c.x - c.w * 0.48, c.y - 24, { r: 11, life: 0.65, col: fx.P.accent });
      kira(c.x + c.w * 0.48, c.y - 24, { r: 11, life: 0.65, col: fx.P.line });
      sfx('don', c.x + 24, c.y - 54, { size: 78, rot: -0.07, life: 0.88 });
      this.emit('complete', { value: this.value });
    }

    setup() {
      this.inputs = this.$$('input');
      this.springs = this.inputs.map(() => new Spring(1, 560, 14));
      this.back = this.backLayer();

      this.inputs.forEach((inp, i) => {
        inp.addEventListener('input', (e) => {
          e.stopPropagation();
          const clean = inp.value.replace(/[^0-9a-zA-Z]/g, '').slice(-1).toUpperCase();
          inp.value = clean;
          const code = this.syncForm();
          const c = at(inp);
          this.emit('input', { value: code });
          if (clean) {
            this.springs[i].x = 1.24;
            ticks(c.x, c.y, { dir: -Math.PI / 2, n: 4, r: 22, len: 11, fan: 0.52, life: 0.36 });
            puff(c.x, c.y + 22, { size: 5, n: 2, vx: 0, vy: -10, life: 0.36 });
            if (i < this.inputs.length - 1) this.inputs[i + 1].focus();
            if (code.length === this.inputs.length) this.celebrate();
          }
        });

        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !inp.value && i > 0) {
            this.inputs[i - 1].value = '';
            this.inputs[i - 1].focus();
            this.springs[i - 1].x = 0.86;
            const c = at(this.inputs[i - 1]);
            puff(c.x, c.y, { size: 5, n: 2, vx: -12, vy: -8, life: 0.34 });
            this.emit('input', { value: this.syncForm() });
          }
        });

        inp.addEventListener('paste', (e) => {
          const text = (e.clipboardData?.getData('text') || '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
          if (!text) return;
          e.preventDefault();
          for (let k = 0; k < this.inputs.length; k++) {
            this.inputs[k].value = text[k] || '';
            if (text[k]) this.springs[k].x = 1.22;
          }
          const code = this.syncForm();
          this.emit('input', { value: code });
          if (code.length === this.inputs.length) this.celebrate();
        });
      });
    }

    frame(dt) {
      this.springs.forEach((sp, i) => {
        const s = sp.step(dt);
        const still = Math.abs(s - 1) < 0.002 && Math.abs(sp.v) < 0.02;
        this.inputs[i].style.transform = still ? '' : `scale(${s.toFixed(3)})`;
      });
    }
  }
  fx.define('sakuga-otp', SakugaOtp);

  // 9. <sakuga-hold> — Hold-to-confirm destructive action with charge bar, ゴゴゴゴ rumble, and shockwave ドン!
  class SakugaHold extends fx.Base {
    static delegates = true;
    static css = `
      button {
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-width: 176px;
        height: 46px;
        padding: 0 20px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 800;
        font-size: 14.5px;
        box-shadow: var(--sk-sh);
        cursor: pointer;
        user-select: none;
        will-change: transform;
      }
      .fill {
        position: absolute;
        inset: 0;
        background: var(--sk-acc);
        transform-origin: left center;
        transform: scaleX(0);
        pointer-events: none;
      }
      .lbl {
        position: relative;
        z-index: 1;
        transition: color 120ms ease;
      }
      button.charging .lbl,
      button.done .lbl {
        color: var(--sk-on-pri);
      }
      button.done {
        background: var(--sk-ink);
      }
    `;

    render() {
      const label = esc(this.getAttribute('label') || 'Hold to Purge');
      return `
        <button type="button" aria-live="polite">
          <span class="fill" aria-hidden="true"></span>
          <span class="lbl">${label}</span>
        </button>
      `;
    }

    startHold() {
      if (this._done || this._holding) return;
      this._holding = true;
      this._rumbleFired = false;
      this._puffAcc = 0;
      this.b.classList.add('charging');
    }

    cancelHold() {
      if (!this._holding) return;
      this._holding = false;
      this.b.classList.remove('charging');
      if (this._prog > 0.12 && !this._done) {
        const c = at(this.b);
        wob(c.x + c.w * 0.45, c.y, { dir: 1, r: 15, life: 0.4 });
        puff(c.x, c.y + 12, { size: 6, n: 3, vx: -16, vy: -10, life: 0.38 });
        this.emit('cancel', { progress: Number(this._prog.toFixed(2)) });
      }
    }

    finishHold() {
      this._holding = false;
      this._done = true;
      this._count += 1;
      const seq = ++this._seq;
      this.b.classList.remove('charging');
      this.b.classList.add('done');
      this.lbl.textContent = this.doneLabel;
      this.popSp.x = 1.18;

      const c = at(this.b);
      burst(c.x, c.y, { r: 64, spikes: 14, life: 0.44, layer: this.back });
      ring(c.x, c.y + 18, { rx: 68, ry: 20, life: 0.48, w: 3.5 });
      shards(c.x, c.y, { n: 8, speed: 210, size: 6, life: 0.68 });
      sfx('don', c.x + 28, c.y - 52, { size: 84, rot: -0.09, life: 0.9 });
      this.emit('confirm', { count: this._count });

      later(1600, () => {
        if (this._seq !== seq) return;
        this._done = false;
        this._prog = 0;
        this.b.classList.remove('done');
        this.fill.style.transform = 'scaleX(0)';
        this.lbl.textContent = this.defaultLabel;
      });
    }

    setup() {
      this.b = this.$('button');
      this.fill = this.$('.fill');
      this.lbl = this.$('.lbl');
      this.defaultLabel = this.getAttribute('label') || 'Hold to Purge';
      this.doneLabel = this.getAttribute('done-label') || 'Purged!';
      this.duration = Math.max(0.35, (Number(this.getAttribute('duration')) || 850) / 1000);
      this._holding = false;
      this._done = false;
      this._prog = 0;
      this._count = 0;
      this._seq = 0;
      this._puffAcc = 0;
      this._rumbleFired = false;
      this.popSp = new Spring(1, 520, 14);
      this.back = this.backLayer();

      this.b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.b.setPointerCapture?.(e.pointerId);
        this.startHold();
      });
      this.b.addEventListener('pointerup', () => this.cancelHold());
      this.b.addEventListener('pointercancel', () => this.cancelHold());
      this.b.addEventListener('keydown', (e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault();
          this.startHold();
        }
      });
      this.b.addEventListener('keyup', (e) => {
        if (e.key === ' ' || e.key === 'Enter') this.cancelHold();
      });
    }

    frame(dt) {
      if (this._holding) {
        this._prog = Math.min(1, this._prog + dt / this.duration);
        this.fill.style.transform = `scaleX(${this._prog.toFixed(3)})`;
        this._puffAcc += dt;
        if (this._puffAcc > 0.16) {
          this._puffAcc = 0;
          const c = at(this.b);
          puff(c.x - c.w * 0.45 + c.w * this._prog, c.y + 18, { size: 6, n: 2, vx: -14, vy: -12, life: 0.42 });
        }
        if (!this._rumbleFired && this._prog > 0.35) {
          this._rumbleFired = true;
          const c = at(this.b);
          sfx('gogo', c.x - 42, c.y - 46, { size: 58, rot: -0.06, life: 0.62, ...getHollow() });
        }
        const shake = this._prog * 2.6;
        const sx = (Math.random() - 0.5) * shake * 2;
        const sy = (Math.random() - 0.5) * shake * 2;
        this.b.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) scale(${(1 + this._prog * 0.04).toFixed(3)}, ${(1 - this._prog * 0.08).toFixed(3)})`;
        if (this._prog >= 1) this.finishHold();
        return;
      }

      if (!this._done && this._prog > 0) {
        this._prog = Math.max(0, this._prog - dt * 3.8);
        this.fill.style.transform = `scaleX(${this._prog.toFixed(3)})`;
      }
      const p = this.popSp.step(dt);
      const still = Math.abs(p - 1) < 0.002 && Math.abs(this.popSp.v) < 0.02;
      this.b.style.transform = still ? '' : `scale(${p.toFixed(3)})`;
    }
  }
  fx.define('sakuga-hold', SakugaHold);

  // 10. <sakuga-counter> — Combo / score counter with spring readout, kira ticks, and milestone ポン
  class SakugaCounter extends fx.Base {
    static css = `
      .wrap {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .readout {
        min-width: 82px;
        height: 46px;
        padding: 0 14px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        box-shadow: var(--sk-sh);
        font-family: var(--sk-font-display, inherit);
        font-weight: 800;
        font-size: 20px;
        font-variant-numeric: tabular-nums;
        cursor: pointer;
        will-change: transform;
      }
      .act {
        height: 46px;
        padding: 0 12px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-pri);
        color: var(--sk-on-pri);
        font-weight: 800;
        font-size: 13.5px;
        box-shadow: var(--sk-sh);
        cursor: pointer;
        will-change: transform;
      }
      .reset {
        height: 46px;
        width: 42px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 800;
        font-size: 16px;
        box-shadow: var(--sk-sh);
        cursor: pointer;
      }
    `;

    get value() {
      return this._val ?? 0;
    }

    render() {
      return `
        <div class="wrap" role="group" aria-label="Combo counter">
          <button type="button" class="readout" aria-label="Add 1 to combo"></button>
          <button type="button" class="act" aria-label="Add 10 to combo">+10</button>
          <button type="button" class="reset" aria-label="Reset combo">↺</button>
        </div>
      `;
    }

    syncUI() {
      this.readout.textContent = String(this._val).padStart(3, '0');
    }

    setValue(next) {
      this._val = Math.max(0, parseInt(String(next), 10) || 0);
      this.syncUI();
    }

    bump(delta) {
      const prev = this._val;
      this._val = Math.max(0, this._val + delta);
      this.syncUI();
      this.popSp.x = delta >= 10 ? 1.38 : 1.24;
      this.rotSp.x = (this._val % 2 ? 1 : -1) * (delta >= 10 ? 10 : 6);

      const c = at(this.readout);
      const crossedTen = Math.floor(this._val / 10) > Math.floor(prev / 10);
      if (delta >= 10 || crossedTen) {
        burst(c.x, c.y, { r: 46, spikes: 12, life: 0.36, layer: this.back });
        donut(c.x, c.y - 16, { r: 14, vx: 12, vy: -24, life: 0.55 });
        kira(c.x + 34, c.y - 24, { r: 10, life: 0.6, col: fx.P.accent });
        sfx('pon', c.x + 28, c.y - 52, { size: 74, rot: 0.08, life: 0.8, ...getHollow() });
      } else {
        ticks(c.x, c.y, { dir: -Math.PI / 2, n: 5, r: 26, len: 12, fan: 0.55, life: 0.38 });
        kira(c.x + 28, c.y - 20, { r: 8, life: 0.48, col: fx.P.accent });
      }
      this.emit('change', { value: this._val, delta });
    }

    setup() {
      this.readout = this.$('.readout');
      this.plusTen = this.$('.act');
      this.resetBtn = this.$('.reset');
      this._val = Math.max(0, parseInt(this.getAttribute('value') || '42', 10) || 0);
      this.popSp = new Spring(1, 560, 14);
      this.rotSp = new Spring(0, 440, 13);
      this.pressTen = squashy(this.plusTen, { low: 0.8, wide: 0.32 });
      this.back = this.backLayer();
      this.syncUI();

      this.readout.addEventListener('click', () => this.bump(1));
      this.plusTen.addEventListener('click', () => this.bump(10));
      this.resetBtn.addEventListener('click', () => {
        this._val = 0;
        this.syncUI();
        this.popSp.x = 0.82;
        const c = at(this.readout);
        puff(c.x, c.y, { size: 8, n: 4, vx: 0, vy: -14, life: 0.44 });
        this.emit('change', { value: 0, delta: 0 });
      });
    }

    frame(dt) {
      this.pressTen.step(dt);
      const s = this.popSp.step(dt);
      const r = this.rotSp.step(dt);
      const still = Math.abs(s - 1) < 0.002 && Math.abs(r) < 0.05;
      this.readout.style.transform = still ? '' : `scale(${s.toFixed(3)}) rotate(${r.toFixed(1)}deg)`;
    }
  }
  fx.define('sakuga-counter', SakugaCounter);

  // 11. <sakuga-bell> — Notification bell with spring swing, vibration arcs, and auto-refill badge
  class SakugaBell extends fx.Base {
    static delegates = true;
    static css = `
      button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 54px;
        height: 54px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        box-shadow: var(--sk-sh);
        cursor: pointer;
        will-change: transform;
      }
      .bell {
        display: inline-flex;
        width: 24px;
        height: 24px;
        transform-origin: 50% 18%;
        will-change: transform;
      }
      svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.3;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .badge {
        position: absolute;
        top: -9px;
        right: -9px;
        min-width: 24px;
        height: 24px;
        padding: 0 6px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 999px;
        background: var(--sk-acc);
        color: var(--sk-on-pri);
        font-weight: 800;
        font-size: 12px;
        line-height: 20px;
        text-align: center;
        font-variant-numeric: tabular-nums;
        will-change: transform;
      }
      .badge.zero { display: none; }
    `;

    render() {
      const label = esc(this.getAttribute('label') || 'Notifications');
      return `
        <button type="button" aria-label="${label}">
          <span class="bell" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </span>
          <span class="badge" aria-live="polite"></span>
        </button>
      `;
    }

    syncUI() {
      this.badge.textContent = String(this._unread);
      this.badge.classList.toggle('zero', this._unread <= 0);
      this.b.setAttribute('aria-label', `${this.labelText} (${this._unread} unread)`);
    }

    setCount(next, ping = false) {
      this._unread = Math.max(0, parseInt(String(next), 10) || 0);
      this.syncUI();
      if (ping && this._unread > 0) {
        this.ringSp.v = 620;
        this.badgeSp.x = 0.35;
      }
    }

    setup() {
      this.b = this.$('button');
      this.bellEl = this.$('.bell');
      this.badge = this.$('.badge');
      this.labelText = this.getAttribute('label') || 'Notifications';
      this.manualMode = this.hasAttribute('manual');
      this._unread = Math.max(0, parseInt(this.getAttribute('count') || (this.manualMode ? '0' : '3'), 10) || 0);
      this.press = squashy(this.b, { low: 0.82, wide: 0.34 });
      this.ringSp = new Spring(0, 620, 8);
      this.badgeSp = new Spring(1, 520, 12);
      this.back = this.backLayer();
      this.syncUI();

      this.b.addEventListener('click', () => {
        const c = at(this.b);
        this.ringSp.v = 950;
        if (this._unread > 0) {
          this._unread = 0;
          this.syncUI();
          wob(c.x - 32, c.y - 6, { dir: -1, r: 15, life: 0.44 });
          wob(c.x + 32, c.y - 6, { dir: 1, r: 15, life: 0.44 });
          kira(c.x + 24, c.y - 26, { r: 10, life: 0.56, col: fx.P.accent });
          sfx('kachi', c.x + 28, c.y - 48, { size: 64, rot: 0.1, life: 0.72, ...getHollow() });
          this.emit('change', { unread: 0, action: 'cleared' });
        } else if (this.manualMode) {
          wob(c.x - 28, c.y - 6, { dir: -1, r: 12, life: 0.36 });
          wob(c.x + 28, c.y - 6, { dir: 1, r: 12, life: 0.36 });
          this.emit('change', { unread: 0, action: 'open' });
        } else {
          this._unread = 3;
          this.syncUI();
          this.badgeSp.x = 0.2;
          burst(c.x, c.y, { r: 44, spikes: 10, life: 0.34, layer: this.back });
          sfx('pon', c.x + 28, c.y - 48, { size: 66, rot: -0.08, life: 0.72, ...getHollow() });
          this.emit('change', { unread: 3, action: 'refilled' });
        }
      });
    }

    frame(dt) {
      this.press.step(dt);
      const r = this.ringSp.step(dt);
      const bs = this.badgeSp.step(dt);
      this.bellEl.style.transform = Math.abs(r) < 0.08 && Math.abs(this.ringSp.v) < 0.2 ? '' : `rotate(${r.toFixed(1)}deg)`;
      const bStill = Math.abs(bs - 1) < 0.002 && Math.abs(this.badgeSp.v) < 0.02;
      this.badge.style.transform = bStill ? '' : `scale(${Math.max(0.2, bs).toFixed(3)})`;
    }
  }
  fx.define('sakuga-bell', SakugaBell);

  // 12. <sakuga-tags> — Dismissible anime tag list with shard pop, シュッ exit, and one-click restore
  class SakugaTags extends fx.Base {
    static formAssociated = true;
    static fromChildren = true;
    static css = `
      .wrap {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }
      .tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 10px 0 13px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 999px;
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 13px;
        box-shadow: 3px 4px 0 var(--sk-soft);
      }
      .x {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border: 0;
        border-radius: 999px;
        background: rgba(143, 141, 247, 0.22);
        color: var(--sk-ink);
        font-weight: 800;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
      }
      .x:hover {
        background: var(--sk-acc);
        color: var(--sk-on-pri);
      }
      .restore {
        height: 36px;
        padding: 0 13px;
        border: var(--sk-bw) dashed var(--sk-ink);
        border-radius: 999px;
        background: transparent;
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 12.5px;
        cursor: pointer;
      }
      .restore.hide { display: none; }
    `;

    get values() {
      return this.active ? this.active.map((it) => it.value) : [];
    }

    render() {
      this.initial = [...this.querySelectorAll('option')].map((o) => ({
        value: o.getAttribute('value') ?? o.textContent.trim(),
        label: o.textContent.trim(),
      }));
      if (!this.initial.length) {
        this.initial = [
          { value: 'keyframes', label: 'Keyframes' },
          { value: 'smear', label: 'Smear' },
          { value: 'sakuga', label: 'Sakuga' },
        ];
      }
      this.active = this.initial.map((it) => ({ ...it }));
      return `<div class="wrap" role="list" aria-label="${esc(this.getAttribute('label') || 'Active tags')}"></div>`;
    }

    drawList() {
      const chips = this.active
        .map(
          (it) =>
            `<span class="tag" role="listitem"><span>${esc(it.label)}</span><button type="button" class="x" data-v="${esc(it.value)}" aria-label="Remove ${esc(it.label)}">×</button></span>`
        )
        .join('');
      const showRestore = this.active.length < this.initial.length;
      this.wrap.innerHTML = `${chips}<button type="button" class="restore${showRestore ? '' : ' hide'}">+ Restore</button>`;
      this.internals?.setFormValue(this.values.join(','));

      this.wrap.querySelectorAll('.x').forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-v');
          const c = at(btn.closest('.tag'));
          shards(c.x, c.y, { n: 6, speed: 175, size: 5, life: 0.56 });
          puff(c.x, c.y, { size: 7, n: 3, vx: 0, vy: -14, life: 0.42 });
          sfx('shu', c.x + 20, c.y - 38, { size: 58, rot: -0.1, life: 0.68, ...getHollow() });
          this.active = this.active.filter((it) => it.value !== val);
          this.drawList();
          this.emit('change', { values: this.values, action: 'removed', tag: val });
        });
      });

      const restoreBtn = this.wrap.querySelector('.restore');
      restoreBtn?.addEventListener('click', () => {
        const c = at(restoreBtn);
        this.active = this.initial.map((it) => ({ ...it }));
        this.drawList();
        burst(c.x, c.y, { r: 36, spikes: 10, life: 0.34, layer: this.back });
        sfx('pon', c.x + 22, c.y - 42, { size: 64, rot: 0.08, life: 0.72, ...getHollow() });
        this.emit('change', { values: this.values, action: 'restored', tag: null });
      });
    }

    setup() {
      this.wrap = this.$('.wrap');
      this.back = this.backLayer();
      this.drawList();
    }
  }
  fx.define('sakuga-tags', SakugaTags);

  // 13. <sakuga-meter> — 5-level anime power gauge with escalating VFX & LV 5 ゴゴゴゴ overdrive
  class SakugaMeter extends fx.Base {
    static formAssociated = true;
    static css = `
      .wrap {
        display: inline-flex;
        align-items: flex-end;
        gap: 10px;
      }
      .bars {
        display: inline-flex;
        align-items: flex-end;
        gap: 7px;
        height: 46px;
      }
      button {
        width: 22px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 7px;
        background: var(--sk-card);
        box-shadow: 3px 3px 0 var(--sk-soft);
        cursor: pointer;
        transform-origin: bottom center;
        will-change: transform;
        transition: background 120ms ease;
      }
      button.on {
        background: var(--sk-pri);
      }
      button.max {
        background: var(--sk-acc);
      }
      .tag {
        min-width: 44px;
        font-weight: 800;
        font-size: 13px;
        color: var(--sk-ink);
        font-variant-numeric: tabular-nums;
      }
    `;

    get level() {
      return this._lv ?? 3;
    }

    render() {
      const label = esc(this.getAttribute('label') || 'Power level');
      const heights = [18, 25, 32, 39, 46];
      const bars = heights
        .map(
          (h, i) =>
            `<button type="button" role="radio" data-lv="${i + 1}" style="height:${h}px" aria-label="${label} level ${i + 1}" aria-checked="false"></button>`
        )
        .join('');
      return `<div class="wrap"><div class="bars" role="radiogroup" aria-label="${label}">${bars}</div><span class="tag" aria-live="polite"></span></div>`;
    }

    syncUI() {
      this.bars.forEach((b, i) => {
        const active = i < this._lv;
        b.classList.toggle('on', active && this._lv < 5);
        b.classList.toggle('max', active && this._lv === 5);
        b.setAttribute('aria-checked', String(i + 1 === this._lv));
      });
      this.tag.textContent = `LV ${this._lv}`;
      this.internals?.setFormValue(String(this._lv));
    }

    setLevel(lv) {
      this._lv = clamp(lv, 1, 5);
      this.syncUI();
      for (let i = 0; i < this._lv; i++) {
        later(i * 35, () => {
          this.springs[i].x = 1.32;
        });
      }
      const c = at(this.bars[this._lv - 1]);
      if (this._lv === 5) {
        burst(c.x, c.y, { r: 54, spikes: 14, life: 0.42, layer: this.back });
        ring(c.x, c.y + 20, { rx: 58, ry: 18, life: 0.48, w: 3 });
        sfx('gogo', c.x + 12, c.y - 52, { size: 70, rot: -0.06, life: 0.84, ...getHollow() });
      } else if (this._lv >= 3) {
        lines(c.x, c.y - 6, { n: 5, dir: -Math.PI / 2, len: 32, spread: 18, life: 0.3 });
        puff(c.x, c.y + 12, { size: 6, n: 3, vx: 0, vy: -14, life: 0.42 });
      } else {
        ticks(c.x, c.y, { dir: -Math.PI / 2, n: 4, r: 18, len: 10, fan: 0.5, life: 0.36 });
      }
      this.emit('change', { level: this._lv, max: 5 });
    }

    setup() {
      this.bars = this.$$('button');
      this.tag = this.$('.tag');
      this._lv = clamp(parseInt(this.getAttribute('value') || '3', 10) || 3, 1, 5);
      this.springs = this.bars.map(() => new Spring(1, 540, 14));
      this.back = this.backLayer();
      this.syncUI();

      this.bars.forEach((b, i) => {
        b.addEventListener('click', () => this.setLevel(i + 1));
      });
    }

    frame(dt) {
      this.springs.forEach((sp, i) => {
        const s = sp.step(dt);
        const still = Math.abs(s - 1) < 0.002 && Math.abs(sp.v) < 0.02;
        this.bars[i].style.transform = still ? '' : `scaleY(${s.toFixed(3)})`;
      });
    }
  }
  fx.define('sakuga-meter', SakugaMeter);

  // 14. <sakuga-card-toggle> — Selectable feature toggle card with diagonal slash, shards, and ズザッ
  class SakugaCardToggle extends fx.Base {
    static formAssociated = true;
    static delegates = true;
    static css = `
      button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        width: 248px;
        max-width: 100%;
        padding: 13px 15px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        box-shadow: var(--sk-sh);
        text-align: left;
        cursor: pointer;
        will-change: transform;
        transition: background 140ms ease;
      }
      button[aria-pressed="true"] {
        background: rgba(143, 141, 247, 0.16);
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .t { font-weight: 800; font-size: 14px; color: var(--sk-ink); }
      .d { font-weight: 500; font-size: 12px; color: var(--sk-dim); }
      .chk {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 999px;
        background: var(--sk-card);
        color: var(--sk-on-pri);
        will-change: transform;
      }
      button[aria-pressed="true"] .chk {
        background: var(--sk-pri);
      }
      .chk svg {
        width: 13px;
        height: 13px;
        fill: none;
        stroke: currentColor;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: 0;
        transition: opacity 120ms ease;
      }
      button[aria-pressed="true"] .chk svg { opacity: 1; }
    `;

    get checked() {
      return !!this._checked;
    }

    render() {
      const title = esc(this.getAttribute('title') || 'Impact Frames');
      const desc = esc(this.getAttribute('description') || '2-frame monochrome hit flash');
      return `
        <button type="button" aria-pressed="false">
          <span class="meta">
            <span class="t">${title}</span>
            <span class="d">${desc}</span>
          </span>
          <span class="chk" aria-hidden="true">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
        </button>
      `;
    }

    syncUI() {
      this.b.setAttribute('aria-pressed', String(this._checked));
      this.internals?.setFormValue(this._checked ? 'on' : null);
    }

    setup() {
      this.b = this.$('button');
      this.chk = this.$('.chk');
      this._checked = this.hasAttribute('checked');
      this.press = squashy(this.b, { low: 0.86, wide: 0.3 });
      this.chkSp = new Spring(1, 560, 12);
      this.syncUI();

      this.b.addEventListener('click', () => {
        this._checked = !this._checked;
        this.syncUI();
        const c = at(this.b);
        if (this._checked) {
          this.press.pop.x = 1.08;
          this.chkSp.x = 0.25;
          slash(c.x, c.y, { len: Math.min(180, c.w * 0.72), ang: -0.14, life: 0.36, thick: 12 });
          shards(c.x + c.w * 0.34, c.y, { n: 6, speed: 170, size: 5, life: 0.56 });
          sfx('zuza', c.x + 42, c.y - 44, { size: 62, rot: -0.08, life: 0.76, ...getDotted() });
        } else {
          puff(c.x, c.y, { size: 7, n: 3, vx: 0, vy: -10, life: 0.36 });
        }
        this.emit('change', { checked: this._checked });
      });
    }

    frame(dt) {
      this.press.step(dt);
      const s = this.chkSp.step(dt);
      const still = Math.abs(s - 1) < 0.002 && Math.abs(this.chkSp.v) < 0.02;
      this.chk.style.transform = still ? '' : `scale(${Math.max(0.2, s).toFixed(3)})`;
    }
  }
  fx.define('sakuga-card-toggle', SakugaCardToggle);

  // 15. <sakuga-fab> — Radial speed-dial FAB with spring spin and 3 popping mini actions
  class SakugaFab extends fx.Base {
    static css = `
      .wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .main {
        width: 52px;
        height: 52px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 999px;
        background: var(--sk-acc);
        color: var(--sk-on-pri);
        font-weight: 800;
        font-size: 26px;
        line-height: 1;
        box-shadow: var(--sk-sh);
        cursor: pointer;
        will-change: transform;
      }
      .plus {
        display: inline-block;
        will-change: transform;
      }
      .tray {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .tray.closed { display: none; }
      .mini {
        height: 38px;
        padding: 0 13px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 999px;
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 13px;
        box-shadow: 3px 4px 0 var(--sk-soft);
        cursor: pointer;
        will-change: transform;
      }
      .mini:hover {
        background: var(--sk-pri);
        color: var(--sk-on-pri);
      }
    `;

    render() {
      return `
        <div class="wrap">
          <button type="button" class="main" aria-expanded="false" aria-label="Toggle quick actions"><span class="plus">+</span></button>
          <div class="tray closed" role="menu" aria-label="Quick VFX actions">
            <button type="button" class="mini" role="menuitem" data-act="slash">Slash</button>
            <button type="button" class="mini" role="menuitem" data-act="spark">Spark</button>
            <button type="button" class="mini" role="menuitem" data-act="shatter">Shatter</button>
          </div>
        </div>
      `;
    }

    setOpen(open) {
      this._open = open;
      this.main.setAttribute('aria-expanded', String(open));
      this.tray.classList.toggle('closed', !open);
      this.rotSp.to = open ? 45 : 0;
      const c = at(this.main);
      if (open) {
        this.miniSps.forEach((sp, i) => {
          sp.x = 0.25;
          later(i * 45, () => { sp.v = 12; });
        });
        lines(c.x + 28, c.y, { n: 5, dir: 0, len: 38, spread: 18, life: 0.3 });
        sfx('shu', c.x + 42, c.y - 44, { size: 60, rot: -0.08, life: 0.68, ...getHollow() });
      } else {
        puff(c.x, c.y, { size: 6, n: 3, vx: 0, vy: -8, life: 0.34 });
      }
    }

    setup() {
      this.main = this.$('.main');
      this.plus = this.$('.plus');
      this.tray = this.$('.tray');
      this.minis = this.$$('.mini');
      this._open = false;
      this.press = squashy(this.main, { low: 0.8, wide: 0.36 });
      this.rotSp = new Spring(0, 520, 15);
      this.miniSps = this.minis.map(() => new Spring(1, 560, 14));
      this.back = this.backLayer();

      this.main.addEventListener('click', () => this.setOpen(!this._open));
      this.minis.forEach((btn) => {
        btn.addEventListener('click', () => {
          const act = btn.getAttribute('data-act') || 'slash';
          const c = at(btn);
          if (act === 'slash') {
            slash(c.x, c.y, { len: 130, ang: -0.35, life: 0.38, thick: 13 });
            sfx('shu', c.x + 22, c.y - 42, { size: 64, rot: -0.1, life: 0.72, ...getHollow() });
          } else if (act === 'spark') {
            burst(c.x, c.y, { r: 44, spikes: 12, life: 0.36, layer: this.back });
            kira(c.x, c.y - 24, { r: 12, life: 0.62, col: fx.P.accent });
            sfx('pon', c.x + 24, c.y - 44, { size: 64, rot: 0.08, life: 0.74, ...getHollow() });
          } else {
            shards(c.x, c.y, { n: 8, speed: 200, size: 6, life: 0.64 });
            sfx('zuza', c.x + 26, c.y - 44, { size: 64, rot: -0.08, life: 0.74, ...getDotted() });
          }
          this.setOpen(false);
          this.emit('action', { action: act });
        });
      });
    }

    frame(dt) {
      this.press.step(dt);
      const r = this.rotSp.step(dt);
      const rotStill = Math.abs(r - this.rotSp.to) < 0.05 && Math.abs(this.rotSp.v) < 0.1;
      if (!rotStill || this._lastFabRot !== this.rotSp.to) {
        const out = rotStill ? this.rotSp.to : r;
        this.plus.style.transform = out ? `rotate(${out.toFixed(1)}deg)` : '';
        if (rotStill) this._lastFabRot = this.rotSp.to;
      }
      if (!this._open) return;
      this.miniSps.forEach((sp, i) => {
        const s = sp.step(dt);
        const still = Math.abs(s - 1) < 0.002 && Math.abs(sp.v) < 0.02;
        this.minis[i].style.transform = still ? '' : `scale(${Math.max(0.2, s).toFixed(3)})`;
      });
    }
  }
  fx.define('sakuga-fab', SakugaFab);

  // 16. <sakuga-swatches> — Ink-rimmed cel-paint swatch picker with water splash & tinted kira
  class SakugaSwatches extends fx.Base {
    static formAssociated = true;
    static fromChildren = true;
    static css = `
      .wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .row {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      button {
        width: 34px;
        height: 34px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 999px;
        box-shadow: 3px 3px 0 var(--sk-soft);
        cursor: pointer;
        will-change: transform;
      }
      button[aria-checked="true"] {
        outline: 2.5px solid var(--sk-ink);
        outline-offset: 3px;
      }
      .lbl {
        font-size: 12.5px;
        font-weight: 700;
        color: var(--sk-dim);
      }
    `;

    get value() {
      return this.items?.[this.idx]?.value ?? '';
    }

    render() {
      this.items = [...this.querySelectorAll('option')].map((o) => ({
        value: o.getAttribute('value') || '#8f8df7',
        label: o.textContent.trim() || 'Color',
        selected: o.hasAttribute('selected'),
      }));
      if (!this.items.length) {
        this.items = [
          { value: '#8f8df7', label: 'Lavender', selected: true },
          { value: '#ff5fa8', label: 'Sakura', selected: false },
          { value: '#3b82f6', label: 'Cobalt', selected: false },
          { value: '#22c55e', label: 'Genga Mint', selected: false },
          { value: '#f59e0b', label: 'Shonen Amber', selected: false },
        ];
      }
      this.idx = Math.max(0, this.items.findIndex((it) => it.selected));
      const btns = this.items
        .map(
          (it, i) =>
            `<button type="button" role="radio" data-i="${i}" aria-label="${esc(it.label)}" aria-checked="${i === this.idx}" style="background:${esc(it.value)}"></button>`
        )
        .join('');
      return `
        <div class="wrap">
          <div class="row" role="radiogroup" aria-label="${esc(this.getAttribute('label') || 'Cel paint color')}">${btns}</div>
          <span class="lbl">${esc(this.items[this.idx].label)}</span>
        </div>
      `;
    }

    setup() {
      this.btns = this.$$('button');
      this.lbl = this.$('.lbl');
      this.springs = this.btns.map(() => new Spring(1, 560, 12));
      this.internals?.setFormValue(this.items[this.idx].value);

      this.btns.forEach((b, i) => {
        b.addEventListener('click', () => {
          this.idx = i;
          const item = this.items[i];
          this.btns.forEach((el, k) => el.setAttribute('aria-checked', String(k === i)));
          this.lbl.textContent = item.label;
          this.internals?.setFormValue(item.value);
          this.springs[i].x = 1.38;

          const c = at(b);
          splash(c.x, c.y + 4, { w: 42, h: 24, life: 0.44 });
          kira(c.x + 18, c.y - 20, { r: 10, life: 0.58, col: item.value });
          sfx('pon', c.x + 22, c.y - 44, { size: 62, rot: 0.08, life: 0.72, ...getHollow() });
          this.emit('change', { value: item.value, label: item.label });
        });
      });
    }

    frame(dt) {
      this.springs.forEach((sp, i) => {
        const s = sp.step(dt);
        const still = Math.abs(s - 1) < 0.002 && Math.abs(sp.v) < 0.02;
        this.btns[i].style.transform = still ? '' : `scale(${s.toFixed(3)})`;
      });
    }
  }
  fx.define('sakuga-swatches', SakugaSwatches);

  // 17. <sakuga-timer> — Interactive studio countdown ring with per-second ticks & finish burst ドン!
  class SakugaTimer extends fx.Base {
    static css = `
      .wrap {
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }
      .dial {
        position: relative;
        width: 64px;
        height: 64px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 999px;
        background: var(--sk-card);
        box-shadow: var(--sk-sh);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        will-change: transform;
      }
      svg {
        position: absolute;
        inset: 4px;
        width: calc(100% - 8px);
        height: calc(100% - 8px);
        transform: rotate(-90deg);
      }
      circle {
        fill: none;
        stroke-width: 5;
        stroke-linecap: round;
      }
      .bg { stroke: var(--sk-track); }
      .fg { stroke: var(--sk-pri); transition: stroke 120ms ease; }
      .dial.urgent .fg { stroke: var(--sk-acc); }
      .sec {
        position: relative;
        font-family: var(--sk-font-display, inherit);
        font-weight: 800;
        font-size: 16px;
        color: var(--sk-ink);
        font-variant-numeric: tabular-nums;
      }
      .ctrl {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .btn {
        height: 30px;
        padding: 0 12px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 9px;
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 12.5px;
        cursor: pointer;
      }
      .btn.go {
        background: var(--sk-pri);
        color: var(--sk-on-pri);
      }
    `;

    formatTime(sec) {
      const whole = Math.max(0, Math.ceil(sec));
      if (this.total >= 60 || whole >= 60) {
        const mins = Math.floor(whole / 60);
        const rem = whole % 60;
        return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
      }
      return `${String(whole).padStart(2, '0')}s`;
    }

    render() {
      const secs = clamp(parseInt(this.getAttribute('seconds') || '5', 10) || 5, 3, 3600);
      const initial = secs >= 60
        ? `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
        : `${String(secs).padStart(2, '0')}s`;
      return `
        <div class="wrap" role="group" aria-label="Countdown timer">
          <button type="button" class="dial" aria-label="Start or pause countdown">
            <svg viewBox="0 0 44 44" aria-hidden="true">
              <circle class="bg" cx="22" cy="22" r="18" />
              <circle class="fg" cx="22" cy="22" r="18" stroke-dasharray="113.1" stroke-dashoffset="0" />
            </svg>
            <span class="sec">${initial}</span>
          </button>
          <div class="ctrl">
            <button type="button" class="btn go">Start</button>
            <button type="button" class="btn rst">Reset</button>
          </div>
        </div>
      `;
    }

    syncUI() {
      const text = this.formatTime(this._rem);
      this.secEl.textContent = text;
      this.secEl.style.fontSize = text.length > 3 ? '12.5px' : '16px';
      const ratio = clamp(this._rem / this.total, 0, 1);
      this.fg.setAttribute('stroke-dashoffset', (113.1 * (1 - ratio)).toFixed(2));
      this.dial.classList.toggle('urgent', this._running && this._rem <= Math.min(10, Math.max(2, this.total * 0.15)));
      this.goBtn.textContent = this._running ? 'Pause' : this._rem <= 0 ? 'Replay' : 'Start';
    }

    setDuration(sec) {
      this._running = false;
      this.total = clamp(parseInt(String(sec), 10) || 5, 3, 3600);
      this._rem = this.total;
      this._lastWhole = this.total;
      this.syncUI();
      this.emit('state', { running: false, remaining: this.total });
    }

    toggle() {
      if (this._rem <= 0) this._rem = this.total;
      this._running = !this._running;
      this._lastWhole = Math.ceil(this._rem);
      this.popSp.x = 1.14;
      this.syncUI();
      this.emit('state', { running: this._running, remaining: Math.ceil(this._rem) });
    }

    reset() {
      this._running = false;
      this._rem = this.total;
      this._lastWhole = this.total;
      this.syncUI();
      const c = at(this.dial);
      puff(c.x, c.y, { size: 6, n: 3, vx: 0, vy: -10, life: 0.36 });
      this.emit('state', { running: false, remaining: this.total });
    }

    setup() {
      this.dial = this.$('.dial');
      this.fg = this.$('.fg');
      this.secEl = this.$('.sec');
      this.goBtn = this.$('.go');
      this.rstBtn = this.$('.rst');
      this.total = clamp(parseInt(this.getAttribute('seconds') || '5', 10) || 5, 3, 3600);
      this._rem = this.total;
      this._lastWhole = this.total;
      this._running = false;
      this.popSp = new Spring(1, 520, 14);
      this.back = this.backLayer();
      this.syncUI();

      this.dial.addEventListener('click', () => this.toggle());
      this.goBtn.addEventListener('click', () => this.toggle());
      this.rstBtn.addEventListener('click', () => this.reset());
    }

    frame(dt) {
      if (this._running) {
        this._rem = Math.max(0, this._rem - dt);
        const whole = Math.ceil(this._rem);
        if (whole < this._lastWhole && whole > 0) {
          this._lastWhole = whole;
          this.popSp.x = 1.15;
          const c = at(this.dial);
          ticks(c.x, c.y, { dir: -Math.PI / 2, n: 4, r: 34, len: 10, fan: 0.55, life: 0.32 });
          this.emit('tick', { remaining: whole });
        }
        if (this._rem <= 0) {
          this._running = false;
          this.popSp.x = 1.28;
          const c = at(this.dial);
          burst(c.x, c.y, { r: 54, spikes: 14, life: 0.42, layer: this.back });
          ring(c.x, c.y + 24, { rx: 56, ry: 18, life: 0.48, w: 3 });
          kira(c.x + 28, c.y - 26, { r: 11, life: 0.62, col: fx.P.accent });
          sfx('don', c.x + 26, c.y - 48, { size: 76, rot: -0.08, life: 0.88 });
          this.emit('complete', { seconds: this.total });
        }
        this.syncUI();
      }
      const s = this.popSp.step(dt);
      const still = Math.abs(s - 1) < 0.002 && Math.abs(this.popSp.v) < 0.02;
      this.dial.style.transform = still ? '' : `scale(${s.toFixed(3)})`;
    }
  }
  fx.define('sakuga-timer', SakugaTimer);

  // 18. <sakuga-split-button> — Dual-zone primary action + spring action picker menu
  class SakugaSplitButton extends fx.Base {
    static fromChildren = true;
    static css = `
      :host { position: relative; display: inline-block; }
      .group {
        display: inline-flex;
        align-items: stretch;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-pri);
        box-shadow: var(--sk-sh);
        overflow: hidden;
        will-change: transform;
      }
      .primary {
        height: 44px;
        padding: 0 16px;
        border: 0;
        background: transparent;
        color: var(--sk-on-pri);
        font-weight: 800;
        font-size: 14.5px;
        cursor: pointer;
        white-space: nowrap;
      }
      .caret {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        border: 0;
        border-left: var(--sk-bw) solid var(--sk-ink);
        background: rgba(29, 26, 74, 0.14);
        color: var(--sk-on-pri);
        cursor: pointer;
      }
      .caret svg {
        width: 15px;
        height: 15px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.8;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: transform 140ms ease;
      }
      .caret[aria-expanded="true"] svg { transform: rotate(180deg); }
      .menu {
        position: absolute;
        right: 0;
        top: calc(100% + 10px);
        min-width: 184px;
        z-index: 40;
        padding: 6px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        box-shadow: var(--sk-sh);
        transform-origin: top right;
        will-change: transform;
      }
      .menu[hidden] { display: none; }
      .opt {
        display: block;
        width: 100%;
        padding: 8px 10px;
        border: 0;
        border-radius: 9px;
        background: transparent;
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 13.5px;
        text-align: left;
        cursor: pointer;
      }
      .opt:hover { background: rgba(143, 141, 247, 0.18); }
      .opt[aria-selected="true"] { background: var(--sk-pri); color: var(--sk-on-pri); }
    `;

    render() {
      this.opts = [...this.querySelectorAll('option')].map((o) => ({
        value: o.getAttribute('value') ?? o.textContent.trim(),
        label: o.textContent.trim(),
        selected: o.hasAttribute('selected'),
      }));
      if (!this.opts.length) {
        this.opts = [
          { value: 'render', label: 'Render Cut', selected: true },
          { value: 'webm', label: 'Export WebM', selected: false },
          { value: 'svg', label: 'Copy Keyframes', selected: false },
        ];
      }
      this.idx = Math.max(0, this.opts.findIndex((o) => o.selected));
      const items = this.opts
        .map(
          (o, i) =>
            `<button type="button" class="opt" role="menuitemradio" data-i="${i}" aria-selected="${i === this.idx}">${esc(o.label)}</button>`
        )
        .join('');
      return `
        <div class="group">
          <button type="button" class="primary">${esc(this.opts[this.idx].label)}</button>
          <button type="button" class="caret" aria-haspopup="menu" aria-expanded="false" aria-label="Choose action">
            <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        <div class="menu" role="menu" hidden>${items}</div>
      `;
    }

    setOpen(open) {
      this._open = open;
      this.caret.setAttribute('aria-expanded', String(open));
      this.menu.hidden = !open;
      if (open) {
        this.menuSp.x = 0.72;
        const c = at(this.caret, 0.5, 1);
        puff(c.x, c.y + 8, { size: 6, n: 3, vx: 12, vy: 8, life: 0.4 });
        sfx('kachi', c.x + 26, c.y - 38, { size: 54, rot: 0.08, life: 0.58, ...getHollow() });
      }
    }

    setup() {
      this.group = this.$('.group');
      this.primary = this.$('.primary');
      this.caret = this.$('.caret');
      this.menu = this.$('.menu');
      this.optEls = this.$$('.opt');
      this._open = false;
      this.press = squashy(this.group, { low: 0.8, wide: 0.34 });
      this.menuSp = new Spring(1, 520, 16);
      this.back = this.backLayer();

      this.primary.addEventListener('click', () => {
        const cur = this.opts[this.idx];
        const c = at(this.group);
        this.press.pop.x = 1.14;
        burst(c.x, c.y, { r: 52, spikes: 12, life: 0.38, layer: this.back });
        puff(c.x - 44, c.y + 16, { size: 8, n: 3, vx: -20, vy: -8, life: 0.52 });
        puff(c.x + 44, c.y + 16, { size: 8, n: 3, vx: 20, vy: -8, life: 0.52 });
        sfx('don', c.x + 30, c.y - 50, { size: 76, rot: -0.08, life: 0.84 });
        this.emit('action', { action: cur.value, label: cur.label });
      });

      this.caret.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setOpen(!this._open);
      });

      this.optEls.forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.idx = i;
          const cur = this.opts[i];
          this.primary.textContent = cur.label;
          this.optEls.forEach((el, k) => el.setAttribute('aria-selected', String(k === i)));
          this.setOpen(false);
          const c = at(this.group);
          shards(c.x, c.y, { n: 6, speed: 175, size: 5, life: 0.56 });
          lines(c.x - 16, c.y, { n: 5, dir: Math.PI, len: 40, spread: 18, life: 0.28 });
          this.emit('change', { action: cur.value, label: cur.label });
        });
      });

      this.onDocClick = (e) => {
        if (this._open && !this.contains(e.target)) this.setOpen(false);
      };
      this.onKey = (e) => {
        if (e.key === 'Escape' && this._open) this.setOpen(false);
      };
      document.addEventListener('click', this.onDocClick);
      this.root.addEventListener('keydown', this.onKey);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener('click', this.onDocClick);
    }

    frame(dt) {
      this.press.step(dt);
      if (!this._open) return;
      const ms = this.menuSp.step(dt);
      const still = Math.abs(ms - 1) < 0.002 && Math.abs(this.menuSp.v) < 0.02;
      this.menu.style.transform = still ? '' : `scale(${(1 + (1 - ms) * 0.22).toFixed(3)}, ${ms.toFixed(3)})`;
    }
  }
  fx.define('sakuga-split-button', SakugaSplitButton);

  // Shared vector icons for <sakuga-action-button> and <sakuga-icon-button>
  const STUDIO_ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>',
    step: '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 5 15 12 5 19 5 5" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h8z"/></svg>',
  };

  // 19. <sakuga-action-button> — Compact cel-shaded icon+label button with speed lines, kira sparkle & シュッ
  class SakugaActionButton extends fx.Base {
    static delegates = true;
    static observedAttributes = ['variant', 'icon', 'size', 'disabled', 'label'];
    static css = `
      :host { display: inline-block; }
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        height: 40px;
        padding: 0 15px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 12px;
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 700;
        font-size: 13.5px;
        line-height: 1;
        letter-spacing: -0.01em;
        white-space: nowrap;
        box-shadow: 4px 5px 0 var(--sk-soft);
        cursor: pointer;
        user-select: none;
        will-change: transform;
        transition: background 120ms ease, color 120ms ease, filter 120ms ease;
      }
      button.sm {
        height: 34px;
        padding: 0 12px;
        font-size: 12.5px;
        border-radius: 10px;
        box-shadow: 3px 4px 0 var(--sk-soft);
      }
      button.md {
        height: 44px;
        padding: 0 18px;
        font-size: 14px;
        border-radius: 13px;
        box-shadow: 5px 6px 0 var(--sk-soft);
      }
      button.primary {
        background: var(--sk-pri);
        color: var(--sk-on-pri);
      }
      button.accent {
        background: var(--sk-acc);
        color: var(--sk-on-pri);
      }
      button:hover:not(:disabled) { filter: brightness(1.04); }
      button:focus-visible {
        outline: 2.5px solid var(--sk-acc);
        outline-offset: 3px;
      }
      button:disabled { opacity: 0.48; cursor: not-allowed; }
      .ico {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 15px;
        height: 15px;
        flex-shrink: 0;
        will-change: transform;
      }
      .ico.empty { display: none; }
      .ico svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.4;
        stroke-linecap: round;
        stroke-linejoin: round;
        overflow: visible;
      }
    `;

    get disabled() {
      return this.hasAttribute('disabled');
    }
    set disabled(v) {
      this.toggleAttribute('disabled', !!v);
    }

    render() {
      const iconName = this.getAttribute('icon') || '';
      const iconSvg = STUDIO_ICONS[iconName] || '';
      const variant = this.getAttribute('variant') || 'default';
      const size = this.getAttribute('size') || '';
      const ariaLabel = this.getAttribute('label');
      const cls = [variant !== 'default' ? variant : '', size].filter(Boolean).join(' ');
      return `
        <button type="button" class="${esc(cls)}"${ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ''}${this.disabled ? ' disabled' : ''}>
          <span class="ico${iconSvg ? '' : ' empty'}" aria-hidden="true">${iconSvg}</span>
          <span class="txt"><slot>Focus</slot></span>
        </button>
      `;
    }

    syncAttrs() {
      if (!this.b) return;
      const variant = this.getAttribute('variant') || 'default';
      const size = this.getAttribute('size') || '';
      this.b.className = [variant !== 'default' ? variant : '', size].filter(Boolean).join(' ');
      this.b.disabled = this.disabled;
      const ariaLabel = this.getAttribute('label');
      if (ariaLabel) this.b.setAttribute('aria-label', ariaLabel);
      else this.b.removeAttribute('aria-label');
      const iconName = this.getAttribute('icon') || '';
      const iconSvg = STUDIO_ICONS[iconName] || '';
      this.ico.innerHTML = iconSvg;
      this.ico.classList.toggle('empty', !iconSvg);
    }

    setup() {
      this.b = this.$('button');
      this.ico = this.$('.ico');
      this.press = squashy(this.b, { low: 0.78, wide: 0.34 });
      this.icoSp = new Spring(1, 560, 12);
      this.back = null;
      this.syncAttrs();

      this.b.addEventListener('click', (e) => {
        if (this.disabled) {
          e.stopImmediatePropagation();
          return;
        }
        const c = at(this.b);
        const variant = this.getAttribute('variant') || 'default';
        this.press.pop.x = 1.14;
        this.press.tilt.x = variant === 'accent' ? -4 : -2.5;
        this.icoSp.x = 1.42;

        if (variant === 'accent') {
          this.back ||= this.backLayer();
          burst(c.x, c.y, { r: 44, spikes: 12, life: 0.34, layer: this.back });
          lines(c.x + c.w * 0.45, c.y, { n: 5, dir: 0, len: 34, spread: 16, life: 0.28 });
          kira(c.x + c.w * 0.36, c.y - 20, { r: 10, life: 0.56, col: fx.P.accent });
          sfx('shu', c.x + 22, c.y - 44, { size: 64, rot: -0.08, life: 0.72, ...getHollow() });
        } else if (variant === 'primary') {
          this.back ||= this.backLayer();
          burst(c.x, c.y, { r: 42, spikes: 10, life: 0.32, layer: this.back });
          ticks(c.x, c.y - c.h * 0.4, { dir: -Math.PI / 2, n: 5, r: 14, len: 13, fan: 0.52, life: 0.38 });
          kira(c.x + c.w * 0.35, c.y - 18, { r: 9, life: 0.52, col: fx.P.accent });
          sfx('pon', c.x + 22, c.y - 42, { size: 60, rot: 0.06, life: 0.68, ...getHollow() });
        } else {
          ticks(c.x + c.w * 0.3, c.y - c.h * 0.35, { dir: -0.95, n: 4, r: 8, len: 13, fan: 0.42, life: 0.38 });
          puff(c.x - c.w * 0.35, c.y + 8, { size: 6, n: 3, vx: -14, vy: -8, life: 0.36 });
          sfx('kachi', c.x + 20, c.y - 40, { size: 54, rot: 0.08, life: 0.62, ...getHollow() });
        }
      });
    }

    attributeChangedCallback() {
      this.syncAttrs();
    }

    frame(dt) {
      this.press.step(dt);
      const s = this.icoSp.step(dt);
      const still = Math.abs(s - 1) < 0.002 && Math.abs(this.icoSp.v) < 0.02;
      if (still) {
        if (this._icoMoving) {
          this._icoMoving = false;
          this.ico.style.transform = '';
        }
      } else {
        this._icoMoving = true;
        this.ico.style.transform = `scale(${Math.max(0.3, s).toFixed(3)})`;
      }
    }
  }
  fx.define('sakuga-action-button', SakugaActionButton);

  // 20. <sakuga-icon-button> — Square cel-shaded icon button (default / danger) with shatter or crisp カチッ
  class SakugaIconButton extends fx.Base {
    static delegates = true;
    static observedAttributes = ['icon', 'tone', 'size', 'disabled', 'label'];
    static css = `
      :host { display: inline-block; }
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: 12px;
        background: var(--sk-card);
        color: var(--sk-ink);
        box-shadow: 4px 5px 0 var(--sk-soft);
        cursor: pointer;
        user-select: none;
        will-change: transform;
        transition: background 120ms ease, color 120ms ease;
      }
      button.sm {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        box-shadow: 3px 4px 0 var(--sk-soft);
      }
      button.danger:hover:not(:disabled) {
        background: var(--sk-acc);
        color: var(--sk-on-pri);
      }
      button:not(.danger):hover:not(:disabled) {
        background: var(--sk-pri);
        color: var(--sk-on-pri);
      }
      button:focus-visible {
        outline: 2.5px solid var(--sk-acc);
        outline-offset: 3px;
      }
      button:disabled { opacity: 0.45; cursor: not-allowed; }
      .ico {
        display: inline-flex;
        width: 17px;
        height: 17px;
        will-change: transform;
      }
      button.sm .ico { width: 15px; height: 15px; }
      svg {
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.4;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `;

    get disabled() {
      return this.hasAttribute('disabled');
    }
    set disabled(v) {
      this.toggleAttribute('disabled', !!v);
    }

    render() {
      const iconName = this.getAttribute('icon') || 'trash';
      const iconSvg = STUDIO_ICONS[iconName] || STUDIO_ICONS.trash;
      const tone = this.getAttribute('tone') || 'default';
      const size = this.getAttribute('size') || '';
      const label = esc(this.getAttribute('label') || iconName);
      const cls = [tone === 'danger' ? 'danger' : '', size].filter(Boolean).join(' ');
      return `
        <button type="button" class="${esc(cls)}" aria-label="${label}"${this.disabled ? ' disabled' : ''}>
          <span class="ico" aria-hidden="true">${iconSvg}</span>
        </button>
      `;
    }

    syncAttrs() {
      if (!this.b) return;
      const tone = this.getAttribute('tone') || 'default';
      const size = this.getAttribute('size') || '';
      this.b.className = [tone === 'danger' ? 'danger' : '', size].filter(Boolean).join(' ');
      this.b.disabled = this.disabled;
      const iconName = this.getAttribute('icon') || 'trash';
      this.b.setAttribute('aria-label', this.getAttribute('label') || iconName);
      this.ico.innerHTML = STUDIO_ICONS[iconName] || STUDIO_ICONS.trash;
    }

    setup() {
      this.b = this.$('button');
      this.ico = this.$('.ico');
      this.press = squashy(this.b, { low: 0.76, wide: 0.36 });
      this.rotSp = new Spring(0, 540, 12);
      this.syncAttrs();

      this.b.addEventListener('click', (e) => {
        if (this.disabled) {
          e.stopImmediatePropagation();
          return;
        }
        const c = at(this.b);
        const danger = this.getAttribute('tone') === 'danger';
        this.press.pop.x = 1.16;
        this.rotSp.x = danger ? -18 : 14;
        if (danger) {
          shards(c.x, c.y, { n: 7, speed: 185, size: 5.5, life: 0.56 });
          puff(c.x, c.y, { size: 7, n: 3, vx: 0, vy: -14, life: 0.42 });
          sfx('shu', c.x + 18, c.y - 38, { size: 58, rot: -0.1, life: 0.68, ...getHollow() });
        } else {
          ticks(c.x, c.y, { dir: -Math.PI / 2, n: 5, r: 20, len: 11, fan: 0.55, life: 0.36 });
          kira(c.x + 16, c.y - 16, { r: 8, life: 0.48, col: fx.P.accent });
          sfx('kachi', c.x + 18, c.y - 38, { size: 54, rot: 0.08, life: 0.62, ...getHollow() });
        }
      });
    }

    attributeChangedCallback() {
      this.syncAttrs();
    }

    frame(dt) {
      this.press.step(dt);
      const r = this.rotSp.step(dt);
      const still = Math.abs(r) < 0.08 && Math.abs(this.rotSp.v) < 0.2;
      if (still) {
        if (this._rotMoving) {
          this._rotMoving = false;
          this.ico.style.transform = '';
        }
      } else {
        this._rotMoving = true;
        this.ico.style.transform = `rotate(${r.toFixed(1)}deg)`;
      }
    }
  }
  fx.define('sakuga-icon-button', SakugaIconButton);

  // 21. <sakuga-textarea> — Multiline cel-shaded textarea with keystroke dust puffs & focus pop
  class SakugaTextarea extends fx.Base {
    static formAssociated = true;
    static delegates = true;
    static observedAttributes = ['placeholder', 'rows', 'disabled', 'maxlength', 'label'];
    static css = `
      :host { display: block; width: var(--sk-textarea-width, 100%); max-width: 100%; }
      .wrap {
        position: relative;
        will-change: transform;
      }
      textarea {
        display: block;
        width: 100%;
        box-sizing: border-box;
        padding: 11px 14px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        font-family: inherit;
        font-weight: 500;
        font-size: 14.5px;
        line-height: 1.5;
        box-shadow: var(--sk-sh);
        resize: vertical;
        outline: none;
        transition: border-color 140ms ease, box-shadow 140ms ease;
      }
      textarea::placeholder { color: var(--sk-dim); opacity: 0.78; }
      textarea:focus {
        border-color: var(--sk-pri);
        box-shadow: 6px 7px 0 var(--sk-acc);
      }
      textarea:disabled { opacity: 0.52; cursor: not-allowed; }
      .meta {
        display: flex;
        justify-content: flex-end;
        margin-top: 6px;
        font-size: 11.5px;
        font-weight: 700;
        color: var(--sk-dim);
        font-variant-numeric: tabular-nums;
      }
      .meta.hide { display: none; }
    `;

    get value() {
      return this.ta ? this.ta.value : (this.getAttribute('value') || '');
    }
    set value(v) {
      const next = v == null ? '' : String(v);
      if (this.ta && this.ta.value !== next) {
        this.ta.value = next;
      }
      this.internals?.setFormValue(next);
      this.syncCount();
    }

    focus() {
      this.ta?.focus();
    }

    render() {
      const rows = clamp(parseInt(this.getAttribute('rows') || '3', 10) || 3, 2, 14);
      const placeholder = esc(this.getAttribute('placeholder') || 'Write notes...');
      const label = esc(this.getAttribute('label') || 'Notes');
      const maxLen = this.getAttribute('maxlength');
      const disabled = this.hasAttribute('disabled') ? ' disabled' : '';
      return `
        <div class="wrap">
          <textarea rows="${rows}" placeholder="${placeholder}" aria-label="${label}"${maxLen ? ` maxlength="${esc(maxLen)}"` : ''}${disabled}></textarea>
          <div class="meta${maxLen ? '' : ' hide'}" aria-live="polite"></div>
        </div>
      `;
    }

    syncCount() {
      if (!this.meta || !this.ta) return;
      const maxLen = this.getAttribute('maxlength');
      if (!maxLen) {
        this.meta.classList.add('hide');
        return;
      }
      this.meta.classList.remove('hide');
      this.meta.textContent = `${this.ta.value.length} / ${maxLen}`;
    }

    setup() {
      this.wrap = this.$('.wrap');
      this.ta = this.$('textarea');
      this.meta = this.$('.meta');
      this.popSp = new Spring(1, 520, 16);
      this._lastPuff = 0;

      const initVal = this.getAttribute('value');
      if (initVal !== null) this.ta.value = initVal;
      this.internals?.setFormValue(this.ta.value);
      this.syncCount();

      this.ta.addEventListener('focus', () => {
        this.popSp.x = 1.03;
        const c = at(this.ta, 1, 0);
        ticks(c.x - 10, c.y + 4, { dir: -0.95, n: 3, r: 6, len: 12, fan: 0.42, life: 0.36 });
      });

      this.ta.addEventListener('input', () => {
        this.internals?.setFormValue(this.ta.value);
        this.syncCount();
        const now = performance.now();
        if (now - this._lastPuff > 65) {
          this._lastPuff = now;
          const r = this.ta.getBoundingClientRect();
          const linesCount = this.ta.value.split('\n').length;
          const approxY = Math.min(r.bottom - 14, r.top + 20 + Math.min(linesCount - 1, 4) * 20);
          const approxX = Math.min(r.right - 20, r.left + 20 + ((this.ta.selectionStart || 0) % 36) * 7.2);
          puff(approxX + scrollX, approxY + scrollY, {
            size: 5.5,
            n: 2,
            vx: 10,
            vy: -14,
            life: 0.36,
          });
        }
        this.emit('input', { value: this.ta.value });
      });

      this.ta.addEventListener('change', () => {
        this.emit('change', { value: this.ta.value });
      });
    }

    attributeChangedCallback() {
      if (!this.ta) return;
      const rows = this.getAttribute('rows');
      if (rows) this.ta.rows = clamp(parseInt(rows, 10) || 3, 2, 14);
      const ph = this.getAttribute('placeholder');
      if (ph !== null) this.ta.placeholder = ph;
      const lbl = this.getAttribute('label');
      if (lbl !== null) this.ta.setAttribute('aria-label', lbl);
      this.ta.disabled = this.hasAttribute('disabled');
      const maxLen = this.getAttribute('maxlength');
      if (maxLen) this.ta.setAttribute('maxlength', maxLen);
      else this.ta.removeAttribute('maxlength');
      this.syncCount();
    }

    frame(dt) {
      const s = this.popSp.step(dt);
      const still = Math.abs(s - 1) < 0.001 && Math.abs(this.popSp.v) < 0.02;
      if (still) {
        if (this._popMoving) {
          this._popMoving = false;
          this.wrap.style.transform = '';
        }
      } else {
        this._popMoving = true;
        this.wrap.style.transform = `scale(${s.toFixed(4)})`;
      }
    }
  }
  fx.define('sakuga-textarea', SakugaTextarea);

  // 22. <sakuga-nav> — Clean single-line typographic nav bar with velocity-stretched spring cel underline
  class SakugaNav extends fx.Base {
    static fromChildren = true;
    static observedAttributes = ['value'];
    static css = `
      :host { display: inline-block; max-width: 100%; }
      nav {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 24px;
        padding-bottom: 6px;
      }
      button {
        position: relative;
        padding: 4px 2px;
        border: 0;
        background: transparent;
        color: var(--sk-dim);
        font-family: inherit;
        font-weight: 600;
        font-size: 14px;
        line-height: 1.2;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        transition: color 140ms ease;
      }
      button:hover { color: var(--sk-ink); }
      button[aria-current="page"] { color: var(--sk-ink); font-weight: 700; }
      button:focus-visible {
        outline: 2.5px solid var(--sk-acc);
        outline-offset: 4px;
        border-radius: 4px;
      }
      .bar {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 4px;
        border-radius: 999px;
        background: var(--sk-acc);
        border: 1.5px solid var(--sk-ink);
        box-sizing: border-box;
        pointer-events: none;
        transform-origin: left center;
        will-change: transform, width;
      }
    `;

    get value() {
      return this.items?.[this.idx]?.value ?? '';
    }
    set value(v) {
      if (!this.items) return;
      const nextIdx = this.items.findIndex((it) => it.value === v);
      if (nextIdx >= 0 && nextIdx !== this.idx) {
        this.selectIndex(nextIdx, false);
      }
    }

    render() {
      this.items = [...this.querySelectorAll('option')].map((o) => ({
        value: o.getAttribute('value') ?? o.textContent.trim(),
        label: o.textContent.trim(),
        selected: o.hasAttribute('selected'),
      }));
      if (!this.items.length) {
        this.items = [
          { value: 'tasks', label: 'Tasks', selected: true },
          { value: 'focus', label: 'Focus', selected: false },
          { value: 'summary', label: 'Summary', selected: false },
          { value: 'components', label: 'Components', selected: false },
        ];
      }
      const attrVal = this.getAttribute('value');
      const byAttr = attrVal ? this.items.findIndex((it) => it.value === attrVal) : -1;
      const bySel = this.items.findIndex((it) => it.selected);
      this.idx = byAttr >= 0 ? byAttr : Math.max(0, bySel);
      const label = esc(this.getAttribute('label') || 'Primary navigation');
      const btns = this.items
        .map(
          (it, i) =>
            `<button type="button" data-i="${i}"${i === this.idx ? ' aria-current="page"' : ''}>${esc(it.label)}</button>`
        )
        .join('');
      return `<nav aria-label="${label}">${btns}<span class="bar" aria-hidden="true"></span></nav>`;
    }

    measure(index) {
      const btn = this.btns?.[index];
      if (!btn) return { x: 0, w: 32 };
      return { x: btn.offsetLeft, w: Math.max(16, btn.offsetWidth) };
    }

    selectIndex(i, fireVfx = true) {
      if (!this.btns || i < 0 || i >= this.btns.length) return;
      const prev = this.idx;
      this.idx = i;
      this.btns.forEach((b, k) => {
        if (k === i) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
      });
      const m = this.measure(i);
      this.xSp.to = m.x;
      this.wSp.to = m.w;
      if (fireVfx && prev !== i) {
        const c = at(this.btns[i], 0.5, 1);
        const dir = i > prev ? 0 : Math.PI;
        lines(c.x, c.y + 2, { n: 4, dir, len: 24, spread: 8, life: 0.24 });
        ticks(c.x, c.y + 4, { dir: -Math.PI / 2, n: 3, r: 8, len: 10, fan: 0.45, life: 0.34 });
        sfx('kachi', c.x + 14, c.y - 34, { size: 46, rot: 0.06, life: 0.52, ...getHollow() });
      }
    }

    setup() {
      this.nav = this.$('nav');
      this.btns = this.$$('button');
      this.bar = this.$('.bar');
      const init = this.measure(this.idx);
      this.xSp = new Spring(init.x, 520, 24);
      this.wSp = new Spring(init.w, 520, 24);
      this.bar.style.transform = `translateX(${init.x}px)`;
      this.bar.style.width = `${init.w}px`;

      // Re-measure after fonts settle
      later(120, () => {
        const m = this.measure(this.idx);
        this.xSp.x = this.xSp.to = m.x;
        this.wSp.x = this.wSp.to = m.w;
        this.bar.style.transform = `translateX(${m.x}px)`;
        this.bar.style.width = `${m.w}px`;
      });

      this.btns.forEach((b, i) => {
        b.addEventListener('click', () => {
          const item = this.items[i];
          this.selectIndex(i, true);
          this.emit('change', { index: i, value: item.value, label: item.label });
        });
      });

      this.nav.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next = (this.idx + (e.key === 'ArrowRight' ? 1 : -1) + this.btns.length) % this.btns.length;
        this.btns[next].focus();
        const item = this.items[next];
        this.selectIndex(next, true);
        this.emit('change', { index: next, value: item.value, label: item.label });
      });
    }

    attributeChangedCallback(name, _oldVal, newVal) {
      if (name === 'value' && newVal && this.items) {
        const nextIdx = this.items.findIndex((it) => it.value === newVal);
        if (nextIdx >= 0 && nextIdx !== this.idx) {
          this.selectIndex(nextIdx, true);
        }
      }
    }

    frame(dt) {
      const x = this.xSp.step(dt);
      const w = this.wSp.step(dt);
      const still =
        Math.abs(x - this.xSp.to) < 0.05 &&
        Math.abs(this.xSp.v) < 0.15 &&
        Math.abs(w - this.wSp.to) < 0.05 &&
        Math.abs(this.wSp.v) < 0.15;
      if (still) {
        if (this._barMoving) {
          this._barMoving = false;
          this.bar.style.transform = `translateX(${this.xSp.to.toFixed(2)}px)`;
          this.bar.style.width = `${Math.max(12, this.wSp.to).toFixed(2)}px`;
        }
        return;
      }
      this._barMoving = true;
      const velStretch = clamp(Math.abs(this.xSp.v) * 0.0005, 0, 0.35);
      this.bar.style.transform = `translateX(${x.toFixed(2)}px) scaleX(${(1 + velStretch).toFixed(3)})`;
      this.bar.style.width = `${Math.max(12, w).toFixed(2)}px`;
    }
  }
  fx.define('sakuga-nav', SakugaNav);

  // 23. <sakuga-alert> — Cel-shaded impact alert banner with spring pop & optional shard dismiss
  class SakugaAlert extends fx.Base {
    static observedAttributes = ['tone', 'title', 'dismissible'];
    static css = `
      :host { display: block; max-width: 100%; }
      .box {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 15px;
        border: var(--sk-bw) solid var(--sk-ink);
        border-radius: var(--sk-r);
        background: var(--sk-card);
        color: var(--sk-ink);
        box-shadow: 4px 5px 0 var(--sk-soft);
        will-change: transform;
      }
      .box.danger {
        box-shadow: 4px 5px 0 var(--sk-acc);
      }
      .box.success {
        box-shadow: 4px 5px 0 var(--sk-pri);
      }
      .lead {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        min-width: 0;
        flex: 1;
      }
      .mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        border: 2.4px solid var(--sk-ink);
        border-radius: 999px;
        background: var(--sk-pri);
        color: var(--sk-on-pri);
        font-weight: 800;
        font-size: 13px;
        line-height: 1;
        margin-top: 1px;
      }
      .box.danger .mark { background: var(--sk-acc); }
      .box.warning .mark { background: var(--sk-soft); color: var(--sk-ink); }
      .copy {
        min-width: 0;
        flex: 1;
      }
      .title {
        font-weight: 800;
        font-size: 13.5px;
        color: var(--sk-ink);
        margin-bottom: 2px;
      }
      .title.hide { display: none; }
      .msg {
        font-size: 13px;
        line-height: 1.45;
        font-weight: 600;
        color: var(--sk-ink);
      }
      .close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        flex-shrink: 0;
        border: 2.2px solid var(--sk-ink);
        border-radius: 8px;
        background: var(--sk-card);
        color: var(--sk-ink);
        font-weight: 800;
        font-size: 14px;
        line-height: 1;
        cursor: pointer;
      }
      .close:hover {
        background: var(--sk-acc);
        color: var(--sk-on-pri);
      }
      .close.hide { display: none; }
    `;

    render() {
      const tone = this.getAttribute('tone') || 'info';
      const title = this.getAttribute('title') || '';
      const dismissible = this.hasAttribute('dismissible');
      const glyph = tone === 'danger' ? '!' : tone === 'success' ? '✓' : tone === 'warning' ? '!' : 'i';
      return `
        <div class="box ${esc(tone)}" role="alert">
          <div class="lead">
            <span class="mark" aria-hidden="true">${glyph}</span>
            <div class="copy">
              <div class="title${title ? '' : ' hide'}">${esc(title)}</div>
              <div class="msg"><slot>Check your input before continuing.</slot></div>
            </div>
          </div>
          <button type="button" class="close${dismissible ? '' : ' hide'}" aria-label="Dismiss alert">×</button>
        </div>
      `;
    }

    setup() {
      this.box = this.$('.box');
      this.closeBtn = this.$('.close');
      this.popSp = new Spring(0.86, 540, 14);
      this.popSp.to = 1;

      later(30, () => {
        if (!this.isConnected) return;
        const c = at(this.box);
        const tone = this.getAttribute('tone') || 'info';
        if (tone === 'danger') {
          ticks(c.x - c.w * 0.42, c.y - 10, { dir: -2.2, n: 4, r: 6, len: 12, fan: 0.45, life: 0.36 });
        } else {
          puff(c.x - c.w * 0.4, c.y, { size: 6, n: 2, vx: -12, vy: -8, life: 0.32 });
        }
      });

      this.closeBtn.addEventListener('click', () => {
        const c = at(this.closeBtn);
        shards(c.x, c.y, { n: 6, speed: 170, size: 5, life: 0.52 });
        sfx('shu', c.x + 14, c.y - 34, { size: 52, rot: -0.08, life: 0.62, ...getHollow() });
        this.emit('dismiss', { tone: this.getAttribute('tone') || 'info' });
      });
    }

    frame(dt) {
      const s = this.popSp.step(dt);
      const still = Math.abs(s - 1) < 0.002 && Math.abs(this.popSp.v) < 0.02;
      if (still) {
        if (this._popMoving) {
          this._popMoving = false;
          this.box.style.transform = '';
        }
      } else {
        this._popMoving = true;
        this.box.style.transform = `scale(${s.toFixed(3)})`;
      }
    }
  }
  fx.define('sakuga-alert', SakugaAlert);
})();
