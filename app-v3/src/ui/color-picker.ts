export type ColorPickerOptions = {
  label: string;
  value: string;
  onChange: (color: string) => void;
};

export type ColorPickerControl = HTMLElement & {
  setValue: (color: string) => void;
};

// Canvas sizes
const SB = 220;   // SB square / HS rect
const HUE_BAR = 14;
const WHEEL = 250;
const WHEEL_OUTER = 118;
const WHEEL_INNER = 88;

const PALETTE_KEY = 'webdraft-color-palette';

export function createColorPicker(options: ColorPickerOptions): ColorPickerControl {
  let hsv = hexToHsv(options.value);
  let currentHex = normalizeHex(options.value);
  let oldColor = currentHex;
  let activeTab = 0;
  let rangeMax = 255; // 0..100 or 0..255
  let popup: HTMLElement | null = null;
  let backdrop: HTMLElement | null = null;

  // --- Swatch row ---
  const wrapper = document.createElement('div');
  wrapper.className = 'color-picker';

  const swatch = document.createElement('span');
  swatch.className = 'color-picker__swatch';
  swatch.style.backgroundColor = currentHex;

  const labelEl = document.createElement('span');
  labelEl.textContent = options.label;

  wrapper.append(swatch, labelEl);
  wrapper.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (popup) { closePopup(); } else { openPopup(); }
  });

  // ------------------------------------------------------------------ open/close

  function isTouchDevice(): boolean {
    return window.matchMedia('(pointer: coarse)').matches;
  }

  function openPopup() {
    oldColor = currentHex;

    popup = document.createElement('div');
    popup.className = 'cp-popup';

    const handle = document.createElement('div');
    handle.className = 'cp-drag-handle';
    handle.innerHTML = `<span class="cp-drag-grip">⠿</span>`;

    const top = buildTopBar();
    const middle = document.createElement('div');
    middle.className = 'cp-middle';

    const left = document.createElement('div');
    left.className = 'cp-left';
    left.append(buildTabIcons(), buildTabContent());

    const right = buildRightPanel();
    middle.append(left, right);

    const bottom = buildBottom();

    popup.append(handle, top, middle, bottom);

    if (isTouchDevice()) {
      backdrop = document.createElement('div');
      backdrop.className = 'cp-backdrop';
      backdrop.addEventListener('pointerdown', () => closePopup());
      document.body.append(backdrop);
      popup.classList.add('cp-popup--mobile');
    } else {
      makeDraggable(handle, popup);
    }

    document.body.append(popup);
    positionPopup();
    switchTab(activeTab, left.querySelector('.cp-tab-content')!);

    document.addEventListener('pointerdown', onOutsideClick);
    document.addEventListener('keydown', onEscape);
  }

  function closePopup() {
    popup?.remove();
    backdrop?.remove();
    popup = null;
    backdrop = null;
    document.removeEventListener('pointerdown', onOutsideClick);
    document.removeEventListener('keydown', onEscape);
  }

  function onOutsideClick(e: PointerEvent) {
    if (popup && !popup.contains(e.target as Node) && !wrapper.contains(e.target as Node) && e.target !== backdrop) {
      closePopup();
    }
  }

  function onEscape(e: KeyboardEvent) {
    if (e.key === 'Escape') closePopup();
  }

  function positionPopup() {
    if (!popup) return;
    if (isTouchDevice()) return; // mobile is centered via CSS
    const rect = wrapper.getBoundingClientRect();
    const pw = popup.offsetWidth || 510;
    const ph = popup.offsetHeight || 340;
    let left = rect.right + 8;
    let top = rect.top;
    if (left + pw > window.innerWidth) left = rect.left - pw - 8;
    if (left < 8) left = 8;
    if (top + ph > window.innerHeight) top = window.innerHeight - ph - 8;
    if (top < 8) top = 8;
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  }

  function makeDraggable(handle: HTMLElement, target: HTMLElement) {
    let dragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(target.style.left, 10) || 0;
      startTop  = parseInt(target.style.top, 10)  || 0;
      e.stopPropagation();
    });

    handle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const newLeft = Math.max(0, Math.min(window.innerWidth  - target.offsetWidth,  startLeft + e.clientX - startX));
      const newTop  = Math.max(0, Math.min(window.innerHeight - target.offsetHeight, startTop  + e.clientY - startY));
      target.style.left = `${newLeft}px`;
      target.style.top  = `${newTop}px`;
    });

    handle.addEventListener('pointerup', () => { dragging = false; });
  }

  // ------------------------------------------------------------------ top bar

  function buildTopBar(): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'cp-topbar';

    const rangeGroup = document.createElement('div');
    rangeGroup.className = 'cp-btn-group';
    const btn100 = makeToggleBtn('0..100', rangeMax === 100, () => { rangeMax = 100; syncRangeButtons(); syncRightPanel(); });
    const btn255 = makeToggleBtn('0..255', rangeMax === 255, () => { rangeMax = 255; syncRangeButtons(); syncRightPanel(); });

    rangeGroup.append(btn100, btn255);
    bar.append(rangeGroup);

    function syncRangeButtons() {
      btn100.classList.toggle('is-active', rangeMax === 100);
      btn255.classList.toggle('is-active', rangeMax === 255);
    }

    return bar;
  }

  // ------------------------------------------------------------------ tab icons

  const TAB_ICONS = [
    // HSV square
    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="3" width="11" height="11" rx="1"/>
      <rect x="16" y="3" width="2" height="11" rx="1" fill="currentColor" stroke="none"/>
    </svg>`,
    // Color wheel
    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="10" cy="10" r="7"/>
      <circle cx="10" cy="10" r="4"/>
    </svg>`,
    // HS rectangle
    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="4" width="13" height="12" rx="1"/>
      <rect x="17" y="4" width="2" height="12" rx="1" fill="currentColor" stroke="none"/>
    </svg>`,
    // CMYK sliders
    `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="3" y1="6" x2="17" y2="6"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/>
      <line x1="3" y1="10" x2="17" y2="10"/><circle cx="13" cy="10" r="2" fill="currentColor" stroke="none"/>
      <line x1="3" y1="14" x2="17" y2="14"/><circle cx="7" cy="14" r="2" fill="currentColor" stroke="none"/>
    </svg>`,
  ];

  function buildTabIcons(): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'cp-tabs';
    TAB_ICONS.forEach((svg, i) => {
      const btn = document.createElement('button');
      btn.className = 'cp-tab-btn' + (i === activeTab ? ' is-active' : '');
      btn.innerHTML = svg;
      btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
      btn.addEventListener('click', () => {
        activeTab = i;
        bar.querySelectorAll('.cp-tab-btn').forEach((b, j) => b.classList.toggle('is-active', j === i));
        const content = popup!.querySelector('.cp-tab-content') as HTMLElement;
        switchTab(i, content);
      });
      bar.append(btn);
    });
    return bar;
  }

  function buildTabContent(): HTMLElement {
    const content = document.createElement('div');
    content.className = 'cp-tab-content';
    return content;
  }

  function switchTab(tab: number, content: HTMLElement) {
    content.innerHTML = '';
    if (tab === 0) content.append(buildHsvTab());
    else if (tab === 1) content.append(buildWheelTab());
    else if (tab === 2) content.append(buildHsRectTab());
    else content.append(buildCmykTab());
  }

  // ------------------------------------------------------------------ Tab 1: HSV square + bar

  function buildHsvTab(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'cp-hsv-wrap';

    const sbCanvas = document.createElement('canvas');
    sbCanvas.className = 'cp-canvas';
    sbCanvas.width = SB;
    sbCanvas.height = SB;

    const hueCanvas = document.createElement('canvas');
    hueCanvas.className = 'cp-hue-bar';
    hueCanvas.width = HUE_BAR;
    hueCanvas.height = SB;

    wrap.append(sbCanvas, hueCanvas);

    drawSb(sbCanvas);
    drawHueBar(hueCanvas);
    bindSbDrag(sbCanvas);
    bindHueBarDrag(hueCanvas, sbCanvas);

    return wrap;
  }

  function drawSb(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = `hsl(${hsv.h}, 100%, 50%)`;
    ctx.fillRect(0, 0, W, H);
    const wg = ctx.createLinearGradient(0, 0, W, 0);
    wg.addColorStop(0, 'rgba(255,255,255,1)');
    wg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, 'rgba(0,0,0,0)');
    bg.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const cx = hsv.s * W, cy = (1 - hsv.v) * H;
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  function drawHueBar(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    ['#f00','#ff0','#0f0','#0ff','#00f','#f0f','#f00'].forEach((c, i) => g.addColorStop(i / 6, c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const cy = (hsv.h / 360) * H;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, cy - 2, W, 4);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, cy - 1, W, 2);
  }

  function bindSbDrag(canvas: HTMLCanvasElement) {
    let down = false;
    canvas.addEventListener('pointerdown', (e) => { down = true; canvas.setPointerCapture(e.pointerId); pick(e); });
    canvas.addEventListener('pointermove', (e) => { if (down) pick(e); });
    canvas.addEventListener('pointerup', () => { down = false; });
    function pick(e: PointerEvent) {
      const r = canvas.getBoundingClientRect();
      const s = clamp01((e.clientX - r.left) / SB);
      const v = clamp01(1 - (e.clientY - r.top) / SB);
      hsv = {h: hsv.h, s, v};
      applyHsv();
      drawSb(canvas);
    }
  }

  function bindHueBarDrag(hueCanvas: HTMLCanvasElement, sbCanvas: HTMLCanvasElement) {
    let down = false;
    hueCanvas.addEventListener('pointerdown', (e) => { down = true; hueCanvas.setPointerCapture(e.pointerId); pick(e); });
    hueCanvas.addEventListener('pointermove', (e) => { if (down) pick(e); });
    hueCanvas.addEventListener('pointerup', () => { down = false; });
    function pick(e: PointerEvent) {
      const r = hueCanvas.getBoundingClientRect();
      hsv = {h: clamp(((e.clientY - r.top) / SB) * 360, 0, 360), s: hsv.s, v: hsv.v};
      applyHsv();
      drawSb(sbCanvas);
      drawHueBar(hueCanvas);
    }
  }

  // ------------------------------------------------------------------ Tab 2: Color wheel

  function buildWheelTab(): HTMLElement {
    const canvas = document.createElement('canvas');
    canvas.className = 'cp-wheel';
    canvas.width = WHEEL;
    canvas.height = WHEEL;
    drawWheel(canvas);
    bindWheelDrag(canvas);
    return canvas;
  }

  function drawWheel(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    const cx = WHEEL / 2, cy = WHEEL / 2;
    ctx.clearRect(0, 0, WHEEL, WHEEL);

    // 1. Triangle first (via offscreen canvas so transparent pixels don't overwrite)
    const tri = triangleVertices(cx, cy, hsv.h);
    drawTriangle(ctx, tri);

    // 2. Hue ring on top, clipped to annulus (no destination-out needed)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, WHEEL_OUTER, 0, Math.PI * 2, false);
    ctx.arc(cx, cy, WHEEL_INNER, 0, Math.PI * 2, true);
    ctx.clip('evenodd');
    for (let a = 0; a < 360; a++) {
      const s1 = (a - 0.5) * Math.PI / 180;
      const s2 = (a + 1.5) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, WHEEL_OUTER, s1, s2);
      ctx.closePath();
      ctx.fillStyle = `hsl(${a}, 100%, 50%)`;
      ctx.fill();
    }
    ctx.restore();

    // Ring cursor
    const ra = (hsv.h - 90) * Math.PI / 180;
    const rm = (WHEEL_OUTER + WHEEL_INNER) / 2;
    const rx = cx + rm * Math.cos(ra), ry = cy + rm * Math.sin(ra);
    ctx.beginPath(); ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.stroke();

    // Triangle cursor
    const {vHue, vBlack, vWhite} = tri;
    const px = hsv.v * (hsv.s * vHue.x + (1 - hsv.s) * vWhite.x) + (1 - hsv.v) * vBlack.x;
    const py = hsv.v * (hsv.s * vHue.y + (1 - hsv.s) * vWhite.y) + (1 - hsv.v) * vBlack.y;
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  type Vec2 = {x: number; y: number};
  type TriVerts = {vHue: Vec2; vBlack: Vec2; vWhite: Vec2};

  function triangleVertices(cx: number, cy: number, hue: number): TriVerts {
    const r = WHEEL_INNER - 4;
    const angle = (hue - 90) * Math.PI / 180;
    const vHue  = {x: cx + r * Math.cos(angle),              y: cy + r * Math.sin(angle)};
    const vBlack= {x: cx + r * Math.cos(angle + (2 * Math.PI / 3)), y: cy + r * Math.sin(angle + (2 * Math.PI / 3))};
    const vWhite= {x: cx + r * Math.cos(angle - (2 * Math.PI / 3)), y: cy + r * Math.sin(angle - (2 * Math.PI / 3))};
    return {vHue, vBlack, vWhite};
  }

  function drawTriangle(ctx: CanvasRenderingContext2D, {vHue, vBlack, vWhite}: TriVerts) {
    const [r, g, b] = hsvToRgb(hsv.h, 1, 1);
    const bounds = {
      minX: Math.floor(Math.min(vHue.x, vBlack.x, vWhite.x)),
      minY: Math.floor(Math.min(vHue.y, vBlack.y, vWhite.y)),
      maxX: Math.ceil(Math.max(vHue.x, vBlack.x, vWhite.x)),
      maxY: Math.ceil(Math.max(vHue.y, vBlack.y, vWhite.y)),
    };
    const W = bounds.maxX - bounds.minX + 1;
    const H = bounds.maxY - bounds.minY + 1;

    // Render into offscreen canvas so transparent pixels don't overwrite the main canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const off = offscreen.getContext('2d')!;
    const img = off.createImageData(W, H);

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const cx2 = bounds.minX + px, cy2 = bounds.minY + py;
        const {w0, w1, w2} = bary({x: cx2, y: cy2}, vHue, vBlack, vWhite);
        if (w0 < -0.01 || w1 < -0.01 || w2 < -0.01) continue;
        const wh = clamp01(w0), wb = clamp01(w1), ww = clamp01(w2);
        void wb;
        const idx = (py * W + px) * 4;
        img.data[idx]   = Math.round(wh * r + ww * 255);
        img.data[idx+1] = Math.round(wh * g + ww * 255);
        img.data[idx+2] = Math.round(wh * b + ww * 255);
        img.data[idx+3] = 255;
      }
    }
    off.putImageData(img, 0, 0);
    ctx.drawImage(offscreen, bounds.minX, bounds.minY);
  }

  function bary(p: Vec2, a: Vec2, b: Vec2, c: Vec2) {
    const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    const w0 = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / denom;
    const w1 = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / denom;
    return {w0, w1, w2: 1 - w0 - w1};
  }

  function bindWheelDrag(canvas: HTMLCanvasElement) {
    let down = false;
    let mode: 'ring' | 'tri' | null = null;
    const cx = WHEEL / 2, cy = WHEEL / 2;

    canvas.addEventListener('pointerdown', (e) => {
      down = true; canvas.setPointerCapture(e.pointerId);
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left - cx, py = e.clientY - r.top - cy;
      const dist = Math.sqrt(px * px + py * py);
      mode = dist >= WHEEL_INNER ? 'ring' : 'tri';
      pick(e);
    });
    canvas.addEventListener('pointermove', (e) => { if (down) pick(e); });
    canvas.addEventListener('pointerup', () => { down = false; mode = null; });

    function pick(e: PointerEvent) {
      const r = canvas.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      if (mode === 'ring') {
        const angle = Math.atan2(py - cy, px - cx) * 180 / Math.PI + 90;
        hsv = {h: (angle + 360) % 360, s: hsv.s, v: hsv.v};
      } else if (mode === 'tri') {
        const tri = triangleVertices(cx, cy, hsv.h);
        const {w0, w1, w2} = bary({x: px, y: py}, tri.vHue, tri.vBlack, tri.vWhite);
        const wh = clamp01(w0), wb = clamp01(w1), ww = clamp01(w2);
        const sum = wh + wb + ww;
        const nhue = wh / sum, nblack = wb / sum, nwhite = ww / sum;
        const v = clamp01(nhue + nwhite);
        const s = v > 0 ? clamp01(nhue / v) : 0;
        hsv = {h: hsv.h, s, v};
      }
      applyHsv();
      drawWheel(canvas);
    }
  }

  // ------------------------------------------------------------------ Tab 3: HS rect + V bar

  function buildHsRectTab(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'cp-hsv-wrap';

    const hsCanvas = document.createElement('canvas');
    hsCanvas.className = 'cp-canvas';
    hsCanvas.width = SB;
    hsCanvas.height = SB;

    const vCanvas = document.createElement('canvas');
    vCanvas.className = 'cp-hue-bar';
    vCanvas.width = HUE_BAR;
    vCanvas.height = SB;

    wrap.append(hsCanvas, vCanvas);
    drawHsRect(hsCanvas);
    drawVBar(vCanvas);
    bindHsRectDrag(hsCanvas);
    bindVBarDrag(vCanvas, hsCanvas);

    return wrap;
  }

  function drawHsRect(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const img = ctx.createImageData(W, H);

    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const h = (px / W) * 360;
        const s = 1 - py / H;
        const [r, g, b] = hsvToRgb(h, s, hsv.v);
        const idx = (py * W + px) * 4;
        img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    const cx = (hsv.h / 360) * W, cy = (1 - hsv.s) * H;
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  function drawVBar(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#fff'); g.addColorStop(1, '#000');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const cy = (1 - hsv.v) * H;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, cy - 2, W, 4);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, cy - 1, W, 2);
  }

  function bindHsRectDrag(canvas: HTMLCanvasElement) {
    let down = false;
    canvas.addEventListener('pointerdown', (e) => { down = true; canvas.setPointerCapture(e.pointerId); pick(e); });
    canvas.addEventListener('pointermove', (e) => { if (down) pick(e); });
    canvas.addEventListener('pointerup', () => { down = false; });
    function pick(e: PointerEvent) {
      const r = canvas.getBoundingClientRect();
      const h = clamp(((e.clientX - r.left) / SB) * 360, 0, 360);
      const s = clamp01(1 - (e.clientY - r.top) / SB);
      hsv = {h, s, v: hsv.v};
      applyHsv();
      drawHsRect(canvas);
    }
  }

  function bindVBarDrag(vCanvas: HTMLCanvasElement, hsCanvas: HTMLCanvasElement) {
    let down = false;
    vCanvas.addEventListener('pointerdown', (e) => { down = true; vCanvas.setPointerCapture(e.pointerId); pick(e); });
    vCanvas.addEventListener('pointermove', (e) => { if (down) pick(e); });
    vCanvas.addEventListener('pointerup', () => { down = false; });
    function pick(e: PointerEvent) {
      const r = vCanvas.getBoundingClientRect();
      hsv = {h: hsv.h, s: hsv.s, v: clamp01(1 - (e.clientY - r.top) / SB)};
      applyHsv();
      drawHsRect(hsCanvas);
      drawVBar(vCanvas);
    }
  }

  // ------------------------------------------------------------------ Tab 4: CMYK sliders

  function buildCmykTab(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'cp-cmyk-wrap';

    const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
    let {c, m, y, k} = rgbToCmyk(r, g, b);

    const sliders: HTMLElement[] = [];

    function rebuild() {
      const [r2, g2, b2] = cmykToRgb(c, m, y, k);
      const [h, s, v] = rgbToHsv(r2, g2, b2);
      hsv = {h, s, v};
      applyHsv();
      // refresh slider backgrounds
      updateCmykBgs();
    }

    function updateCmykBgs() {
      const [r2, g2, b2] = hsvToRgb(hsv.h, hsv.s, hsv.v);
      const cmyk2 = rgbToCmyk(r2, g2, b2);
      c = cmyk2.c; m = cmyk2.m; y = cmyk2.y; k = cmyk2.k;

      const entries: [string, number, (v: number) => void][] = [
        ['C', c, (v) => { c = v; rebuild(); }],
        ['M', m, (v) => { m = v; rebuild(); }],
        ['Y', y, (v) => { y = v; rebuild(); }],
        ['K', k, (v) => { k = v; rebuild(); }],
      ];
      sliders.forEach((row, i) => {
        const [, val,] = entries[i];
        const inp = row.querySelector('input[type=range]') as HTMLInputElement;
        const num = row.querySelector('.cp-cmyk-val') as HTMLInputElement;
        if (inp) inp.value = String(Math.round(val));
        if (num) num.value = String(Math.round(val));
      });
    }

    const entries: [string, number, (v: number) => void][] = [
      ['C', c, (v) => { c = v; rebuild(); }],
      ['M', m, (v) => { m = v; rebuild(); }],
      ['Y', y, (v) => { y = v; rebuild(); }],
      ['K', k, (v) => { k = v; rebuild(); }],
    ];

    for (const [label, val, onChange] of entries) {
      const row = document.createElement('div');
      row.className = 'cp-cmyk-row';

      const lbl = document.createElement('span');
      lbl.className = 'cp-cmyk-label';
      lbl.textContent = label;

      const track = document.createElement('input');
      track.type = 'range';
      track.min = '0'; track.max = '100'; track.step = '1';
      track.value = String(Math.round(val));
      track.className = 'cp-cmyk-track';

      const num = document.createElement('input');
      num.type = 'number';
      num.min = '0'; num.max = '100';
      num.value = String(Math.round(val));
      num.className = 'cp-cmyk-val cp-field-input';

      const minus = makeIconBtn('−', () => { track.value = String(Math.max(0, +track.value - 1)); onChange(+track.value); num.value = track.value; });
      const plus  = makeIconBtn('+', () => { track.value = String(Math.min(100, +track.value + 1)); onChange(+track.value); num.value = track.value; });

      track.addEventListener('input', () => { onChange(+track.value); num.value = track.value; });
      num.addEventListener('input', () => { const v = clamp(+num.value, 0, 100); onChange(v); track.value = String(v); });
      num.addEventListener('pointerdown', (e) => e.stopPropagation());

      row.append(lbl, track, num, minus, plus);
      sliders.push(row);
      wrap.append(row);
    }

    return wrap;
  }

  // ------------------------------------------------------------------ Right panel

  let rgbSliderEls: {label: string; input: HTMLInputElement; valEl: HTMLElement}[] = [];
  let hexInputEl: HTMLInputElement | null = null;
  let swatchNewEl: HTMLElement | null = null;
  let swatchOldEl: HTMLElement | null = null;
  let currentBarEl: HTMLElement | null = null;

  function buildRightPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'cp-right';

    // RGB sliders
    const channels = ['R', 'G', 'B'];
    rgbSliderEls = channels.map((ch) => {
      const row = document.createElement('div');
      row.className = 'cp-ch-row';
      const lbl = document.createElement('span');
      lbl.className = 'cp-ch-label';
      lbl.textContent = ch;
      const inp = document.createElement('input');
      inp.type = 'range';
      inp.min = '0'; inp.max = '255'; inp.step = '1';
      inp.className = 'cp-ch-slider';
      const val = document.createElement('span');
      val.className = 'cp-ch-val';
      const minus = makeIconBtn('−', () => { inp.value = String(Math.max(0, +inp.value - 1)); onRgbSlider(); });
      const plus  = makeIconBtn('+', () => { inp.value = String(Math.min(255, +inp.value + 1)); onRgbSlider(); });
      inp.addEventListener('input', onRgbSlider);
      row.append(lbl, inp, val, minus, plus);
      panel.append(row);
      return {label: ch, input: inp, valEl: val};
    });

    function onRgbSlider() {
      const r = +rgbSliderEls[0].input.value;
      const g = +rgbSliderEls[1].input.value;
      const b = +rgbSliderEls[2].input.value;
      const [h, s, v] = rgbToHsv(r, g, b);
      hsv = {h, s, v};
      applyHsvSilentSliders();
    }

    // Hex row
    const hexRow = document.createElement('div');
    hexRow.className = 'cp-hex-row';
    const hexLbl = document.createElement('span');
    hexLbl.className = 'cp-ch-label';
    hexLbl.textContent = '#';
    hexInputEl = document.createElement('input');
    hexInputEl.type = 'text';
    hexInputEl.className = 'cp-hex-input cp-field-input';
    hexInputEl.maxLength = 7;
    hexInputEl.value = currentHex;
    hexInputEl.spellcheck = false;
    hexInputEl.addEventListener('input', () => {
      const parsed = hexToRgb(hexInputEl!.value);
      if (parsed) {
        const [h, s, v] = rgbToHsv(...parsed);
        hsv = {h, s, v};
        applyHsvSilentHex();
      }
    });
    hexInputEl.addEventListener('pointerdown', (e) => e.stopPropagation());
    hexInputEl.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });
    hexRow.append(hexLbl, hexInputEl);
    panel.append(hexRow);

    // Swatches palette
    panel.append(buildPalette());

    syncRightPanel();
    return panel;
  }

  function syncRightPanel() {
    if (!popup) return;
    const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
    rgbSliderEls.forEach(({input, valEl}, i) => {
      const val = [r, g, b][i];
      const displayed = rangeMax === 100 ? Math.round((val / 255) * 100) : val;
      input.value = String(val);
      valEl.textContent = String(displayed);
      // Gradient background
      const others = [r, g, b].slice();
      const lo = others.map((v2, j) => j === i ? 0 : v2);
      const hi = others.map((v2, j) => j === i ? 255 : v2);
      input.style.setProperty('--grad-from', `rgb(${lo.join(',')})`);
      input.style.setProperty('--grad-to',   `rgb(${hi.join(',')})`);
    });
    if (hexInputEl) hexInputEl.value = currentHex;
    if (swatchNewEl) swatchNewEl.style.backgroundColor = currentHex;
    if (currentBarEl) currentBarEl.style.backgroundColor = currentHex;
    updateActiveTabCanvas();
  }

  function updateActiveTabCanvas() {
    if (!popup) return;
    const content = popup.querySelector('.cp-tab-content') as HTMLElement | null;
    if (!content) return;
    if (activeTab === 0) {
      const sb = content.querySelector('.cp-canvas') as HTMLCanvasElement | null;
      const hb = content.querySelector('.cp-hue-bar') as HTMLCanvasElement | null;
      if (sb) drawSb(sb);
      if (hb) drawHueBar(hb);
    } else if (activeTab === 1) {
      const wh = content.querySelector('.cp-wheel') as HTMLCanvasElement | null;
      if (wh) drawWheel(wh);
    } else if (activeTab === 2) {
      const hs = content.querySelector('.cp-canvas') as HTMLCanvasElement | null;
      const vb = content.querySelector('.cp-hue-bar') as HTMLCanvasElement | null;
      if (hs) drawHsRect(hs);
      if (vb) drawVBar(vb);
    }
  }

  function buildPalette(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'cp-palette';

    const addBtn = document.createElement('button');
    addBtn.className = 'cp-palette-add';
    addBtn.textContent = '+';
    addBtn.title = 'Add current color';
    addBtn.addEventListener('click', () => {
      const palette = loadPalette();
      if (!palette.includes(currentHex)) {
        palette.unshift(currentHex);
        if (palette.length > 24) palette.pop();
        savePalette(palette);
      }
      renderSwatches();
    });
    addBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    wrap.append(addBtn);

    const grid = document.createElement('div');
    grid.className = 'cp-palette-grid';
    wrap.append(grid);

    function renderSwatches() {
      grid.innerHTML = '';
      loadPalette().forEach((hex) => {
        const sw = document.createElement('button');
        sw.className = 'cp-palette-swatch';
        sw.style.backgroundColor = hex;
        sw.title = hex;
        sw.addEventListener('pointerdown', (e) => e.stopPropagation());
        sw.addEventListener('click', () => {
          const parsed = hexToRgb(hex);
          if (!parsed) return;
          const [h, s, v] = rgbToHsv(...parsed);
          hsv = {h, s, v};
          currentHex = hex;
          applyColor();
        });
        grid.append(sw);
      });
    }
    renderSwatches();
    return wrap;
  }

  // ------------------------------------------------------------------ Bottom bar

  function buildBottom(): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'cp-bottom-bar';

    const make = (label: string, color: string, isOld: boolean) => {
      const row = document.createElement('div');
      row.className = 'cp-color-row';
      const lbl = document.createElement('span');
      lbl.className = 'cp-color-row-label';
      lbl.textContent = label;
      const strip = document.createElement('div');
      strip.className = 'cp-color-strip' + (isOld ? ' cp-color-strip--old' : '');
      strip.style.backgroundColor = color;
      if (isOld) {
        strip.title = 'Click to restore previous color';
        strip.addEventListener('pointerdown', (e) => e.stopPropagation());
        strip.addEventListener('click', () => {
          const parsed = hexToRgb(oldColor);
          if (!parsed) return;
          const [h, s, v] = rgbToHsv(...parsed);
          hsv = {h, s, v};
          currentHex = oldColor;
          applyColor();
        });
      } else {
        currentBarEl = strip;
      }
      row.append(lbl, strip);
      return row;
    };

    bar.append(make('New:', currentHex, false));
    bar.append(make('Previous:', oldColor, true));
    return bar;
  }

  // ------------------------------------------------------------------ Apply helpers

  function applyHsv() {
    const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
    currentHex = rgbToHex(r, g, b);
    swatch.style.backgroundColor = currentHex;
    options.onChange(currentHex);
    syncRightPanel();
  }

  function applyHsvSilentSliders() {
    const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
    currentHex = rgbToHex(r, g, b);
    swatch.style.backgroundColor = currentHex;
    options.onChange(currentHex);
    if (hexInputEl) hexInputEl.value = currentHex;
    if (swatchNewEl) swatchNewEl.style.backgroundColor = currentHex;
    if (currentBarEl) currentBarEl.style.backgroundColor = currentHex;
    // update slider gradients only
    const vals = [r, g, b];
    rgbSliderEls.forEach(({valEl}, i) => {
      const displayed = rangeMax === 100 ? Math.round((vals[i] / 255) * 100) : vals[i];
      valEl.textContent = String(displayed);
      const lo = vals.map((v2, j) => j === i ? 0 : v2);
      const hi = vals.map((v2, j) => j === i ? 255 : v2);
      rgbSliderEls[i].input.style.setProperty('--grad-from', `rgb(${lo.join(',')})`);
      rgbSliderEls[i].input.style.setProperty('--grad-to',   `rgb(${hi.join(',')})`);
    });
    updateActiveTabCanvas();
  }

  function applyHsvSilentHex() {
    const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
    currentHex = rgbToHex(r, g, b);
    swatch.style.backgroundColor = currentHex;
    options.onChange(currentHex);
    // update sliders + canvas but not hex input
    const vals = [r, g, b];
    rgbSliderEls.forEach(({input, valEl}, i) => {
      input.value = String(vals[i]);
      const displayed = rangeMax === 100 ? Math.round((vals[i] / 255) * 100) : vals[i];
      valEl.textContent = String(displayed);
      const lo = vals.map((v2, j) => j === i ? 0 : v2);
      const hi = vals.map((v2, j) => j === i ? 255 : v2);
      input.style.setProperty('--grad-from', `rgb(${lo.join(',')})`);
      input.style.setProperty('--grad-to',   `rgb(${hi.join(',')})`);
    });
    if (swatchNewEl) swatchNewEl.style.backgroundColor = currentHex;
    if (currentBarEl) currentBarEl.style.backgroundColor = currentHex;
    updateActiveTabCanvas();
  }

  function applyColor() {
    swatch.style.backgroundColor = currentHex;
    options.onChange(currentHex);
    syncRightPanel();
  }

  // ------------------------------------------------------------------ Misc helpers

  function makeToggleBtn(label: string, active: boolean, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'cp-toggle-btn' + (active ? ' is-active' : '');
    btn.textContent = label;
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    btn.addEventListener('click', onClick);
    return btn;
  }

  function makeIconBtn(label: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'cp-icon-btn';
    btn.textContent = label;
    btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    btn.addEventListener('click', onClick);
    return btn;
  }

  return Object.assign(wrapper, {
    setValue(color: string) {
      const parsed = hexToRgb(color);
      if (!parsed) return;
      const [h, s, v] = rgbToHsv(...parsed);
      hsv = {h, s, v};
      currentHex = rgbToHex(...parsed);
      swatch.style.backgroundColor = currentHex;
      if (popup) syncRightPanel();
    },
  });
}

// -------------------------------------------------------------------- Palette storage

function loadPalette(): string[] {
  try { return JSON.parse(localStorage.getItem(PALETTE_KEY) ?? '[]'); } catch { return []; }
}

function savePalette(palette: string[]) {
  localStorage.setItem(PALETTE_KEY, JSON.stringify(palette));
}

// -------------------------------------------------------------------- Color math

type Hsv = {h: number; s: number; v: number};

function hexToHsv(hex: string): Hsv {
  const rgb = hexToRgb(hex);
  if (!rgb) return {h: 0, s: 0, v: 1};
  const [h, s, v] = rgbToHsv(...rgb);
  return {h, s, v};
}

function normalizeHex(hex: string): string {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHex(...rgb) : '#000000';
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), delta = max - min;
  let h = 0;
  if (delta > 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return [h, max === 0 ? 0 : delta / max, max];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else              { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToCmyk(r: number, g: number, b: number): {c: number; m: number; y: number; k: number} {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return {c: 0, m: 0, y: 0, k: 100};
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  const cn = c / 100, mn = m / 100, yn = y / 100, kn = k / 100;
  return [
    Math.round(255 * (1 - cn) * (1 - kn)),
    Math.round(255 * (1 - mn) * (1 - kn)),
    Math.round(255 * (1 - yn) * (1 - kn)),
  ];
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function clamp01(v: number) { return clamp(v, 0, 1); }
