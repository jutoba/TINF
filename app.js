/* Interfaz: navegación, widgets (calculadoras), práctica, exámenes, teoría. */
(function () {
  'use strict';
  const TI = window.TI, C = window.CONTENT;
  const fmt = TI.fmt;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('tinf:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('tinf:' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };
  let uidN = 0; const uid = p => (p || 'w') + (++uidN);

  /* ---------- Piezas comunes ---------- */
  const cw = (code, D) => {
    if (code === null || code === undefined) return '<span class="cw empty">—</span>';
    if (code === '') return '<span class="cw empty">(nada)</span>';
    return '<span class="cw">' + [...code].map(ch => ch === '0' ? '0' : `<span class="d${ch === '1' ? 1 : 2}">${ch}</span>`).join('') + '</span>';
  };
  const kv = items => '<div class="kv">' + items.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('') + '</div>';
  const tbl = (head, rows, cls = '') => `<div class="tbl-wrap"><table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => (typeof c === 'object' && c !== null && 'h' in c) ? `<td class="${c.c || ''}">${c.h}</td>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const num = (x, d = 4) => ({ h: fmt(x, d), c: 'num' });
  const pct = x => fmt(100 * x, 1) + ' %';
  const fracOrDec = f => { const s = f.toString(); return s.includes('/') && s.length <= 9 ? `${s} <span class="muted">(${fmt(f.num(), 4)})</span>` : fmt(f.num(), 4); };
  const pill = (txt, k) => `<span class="pill ${k}">${txt}</span>`;
  const errBox = e => `<div class="err">${esc(e.message || e)}</div>`;

  /* ---------- Desarrollo: fórmula + sustitución + resultado (MathJax) ---------- */
  const S = String.raw;
  const tx = (x, d = 4) => fmt(x, d).replace(/,/g, '{,}');
  const ftx = (f, d = 4) => { if (!(f instanceof TI.Frac)) return tx(f, d); const s = f.toString(); if (!s.includes('/')) return s; const [a, b] = s.split('/');
    let dd = BigInt(b); while (dd % 2n === 0n) dd /= 2n; let k5 = 0; while (dd % 5n === 0n) { dd /= 5n; k5++; } if (dd === 1n && k5 > 0) return tx(f.num(), 6); return s.length <= 9 ? S`\tfrac{${a}}{${b}}` : tx(f.num(), d); };
  const logT = base => (base === 'e' ? S`\ln` : S`\log_{${base}}`);
  // a = b1 + b2 + … (salta de línea cada `per` términos) = … = resultado
  const eqTex = (lhs, steps, per = 4) => {
    const body = steps.map(st => {
      if (!Array.isArray(st)) return st;
      return st.map((t, i) => (i === 0 ? '' : i % per === 0 ? S` \\ &\quad + ` : ' + ') + t).join('') || '0';
    });
    return S`\[ \begin{aligned} ${lhs} &= ${body.join(S` \\ &= `)} \end{aligned} \]`;
  };
  const dev = (title, parts) => `<div class="dev"><span class="lbl">${title}</span>${parts.join('')}</div>`;
  const P = t => `<p class="small">${t}</p>`;
  // Entropía desarrollada de una lista de probabilidades (Frac o número)
  function hTex(lhs, probs, base = '2', d = 4) {
    const b = base === 'e' ? Math.E : Number(base);
    const nz = probs.map(q => [q, q instanceof TI.Frac ? q.num() : q]).filter(([, v]) => v > 1e-12);
    const H = nz.reduce((s, [, v]) => s - v * Math.log(v) / Math.log(b), 0);
    if (nz.length === 1) return { tex: S`\[ ${lhs} = 1\cdot${logT(base)} 1 = 0 \]`, H: 0 };
    return { tex: eqTex(lhs, [nz.map(([q]) => S`${ftx(q)}\,${logT(base)}\frac{1}{${ftx(q)}}`), nz.map(([, v]) => tx(-v * Math.log(v) / Math.log(b))), [S`\mathbf{${tx(H)}}`]]), H };
  }
  const lTex = (lhs, p, ls) => { const L = p.reduce((s, q, i) => s + (ls[i] == null ? 0 : (q instanceof TI.Frac ? q.num() : q) * ls[i]), 0); return { tex: eqTex(lhs, [p.map((q, i) => ls[i] == null ? null : S`${ftx(q)}\cdot ${ls[i]}`).filter(Boolean), [S`\mathbf{${tx(L)}}`]], 5), L }; };
  // Desarrollo común a los códigos de fuente sin memoria
  // why: ⌈·⌉ añade <1 símbolo por palabra (Shannon, y Huffman/Fano no son peores); SFE usa ⌈·⌉+1 → cota +2
  const BOUND_WHY = {
    1: S`Es la cota del <b>primer teorema de Shannon</b> (codificación sin ruido). Izquierda: ningún código unívocamente decodificable baja de la entropía (sale de Kraft). Derecha: el código de Shannon usa \(l_i=\lceil\log_D\frac1{p_i}\rceil\lt\log_D\frac1{p_i}+1\); multiplicando por \(p_i\) y sumando, \(\bar L\lt H_D+1\). Huffman es óptimo, así que nunca es peor que Shannon y cumple la misma cota. Fano también la cumple.`,
    2: S`Izquierda: ningún código unívocamente decodificable baja de la entropía (Kraft). Derecha: SFE usa \(l_i=\lceil\log_2\frac1{p_i}\rceil+1\), un bit más que Shannon, así que su cota es \(H+2\), no \(H+1\). Por ejemplo, en las diapositivas sale \(H=1{,}75\) y \(\bar L=2{,}75\).`
  };
  function codeDev(probs, lengths, D, extra = 1) {
    const p = probs.map(q => (q instanceof TI.Frac ? q.num() : q));
    const ul = D === 2 ? 'sb' : D === 3 ? 'st' : 's.' + D;
    const l = lTex(S`\bar L`, probs, lengths); const h = hTex(S`H_{${D}}(X)`, probs, String(D));
    const parts = [P(S`Longitud media: \(\bar L=\sum_i p_i\,l_i\) (probabilidad por longitud de su palabra).`), l.tex, P(`Entropía de la fuente en la misma base que el código: \\(H_{${D}}(X)=\\sum_i p_i\\log_{${D}}\\frac1{p_i}\\).`), h.tex,
      P(S`Eficiencia: \(\eta=H_D(X)/\bar L\).`), S`\[ \eta=\frac{${tx(h.H)}}{${tx(l.L)}}=${tx(100 * h.H / l.L, 1)}\,\% \]`];
    if (D !== 2) parts.push(P(S`Para comparar con un código binario, pasa la longitud a bits:`), S`\[ \bar L\cdot\log_2 ${D}=${tx(l.L)}\cdot${tx(Math.log2(D))}=${tx(l.L * Math.log2(D))}\ \text{sb/mensaje} \]`);
    parts.push(P(`Unidades: \\(\\bar L\\) en ${ul}/mensaje.`), P(`Comprobación: \\(H_${D}\\le\\bar L\\lt H_${D}+${extra}\\) → ${fmt(h.H, 3)} ≤ ${fmt(l.L, 3)} &lt; ${fmt(h.H + extra, 3)}.`), `<p class="small muted">${BOUND_WHY[extra]}</p>`);
    return dev('Desarrollo: fórmulas y sustitución', parts);
  }

  function readProbs(text) {
    const fr = TI.parseList(text);
    if (!fr.length) throw new Error('Escribe al menos una probabilidad.');
    if (fr.some(f => f.n < 0n)) throw new Error('Las probabilidades no pueden ser negativas.');
    const { probs, sum, wasNormalized } = TI.normalize(fr);
    const note = wasNormalized ? `<div class="note">Las probabilidades sumaban ${fmt(sum.num(), 4)}. Las he normalizado (dividiendo entre la suma), como cuando el enunciado dice "proporcionales a".</div>` : '';
    return { fr: probs, p: probs.map(f => f.num()), note };
  }
  const readLabels = (text, n) => TI.parseLabels(text, n).map(s => s.slice(0, 8));

  function typeset(el) {
    if (window.MathJax && MathJax.typesetPromise) { MathJax.typesetClear && MathJax.typesetClear([el]); MathJax.typesetPromise([el]).catch(() => {}); }
  }
  window.__typeset = () => typeset($('#view'));

  /* ---------- Diagramas ---------- */
  function vennSVG() {
    return `<div class="diagram"><svg viewBox="0 0 440 210" width="440" role="img" aria-label="Diagrama de Venn de entropías">
      <circle cx="170" cy="112" r="78" style="fill:var(--accent-soft);fill-opacity:.55;stroke:var(--accent);stroke-width:2"/>
      <circle cx="270" cy="112" r="78" style="fill:var(--bit-soft);fill-opacity:.55;stroke:var(--bit);stroke-width:2"/>
      <text x="135" y="117" text-anchor="middle" style="fill:var(--ink);font-size:13px">H(X/Y)</text>
      <text x="220" y="117" text-anchor="middle" style="fill:var(--ink);font-size:13px;font-weight:600">I(X;Y)</text>
      <text x="305" y="117" text-anchor="middle" style="fill:var(--ink);font-size:13px">H(Y/X)</text>
      <text x="95" y="30" text-anchor="middle" style="fill:var(--accent);font-size:13px;font-weight:600">H(X)</text>
      <text x="345" y="30" text-anchor="middle" style="fill:var(--bit);font-size:13px;font-weight:600">H(Y)</text>
      <text x="220" y="22" text-anchor="middle" style="fill:var(--muted);font-size:12px">H(X,Y) = toda la unión</text>
    </svg></div>`;
  }
  function codesetsSVG() {
    const rings = [['Todos los códigos', 200, 0], ['No singulares', 160, 1], ['Unívocamente descodificables', 118, 2], ['Prefijo (instantáneos)', 70, 3]];
    return `<div class="diagram"><svg viewBox="0 0 520 260" width="520" role="img" aria-label="Inclusión de clases de códigos">
      ${rings.map(([t, r, k]) => `<ellipse cx="260" cy="${132 + k * 14}" rx="${r * 1.2}" ry="${r * 0.6}" style="fill:${k === 3 ? 'var(--accent-soft)' : 'none'};stroke:${k === 3 ? 'var(--accent)' : 'var(--muted)'};stroke-width:1.5"/>
        <text x="260" y="${132 + k * 14 - r * 0.6 + 18}" text-anchor="middle" style="fill:${k === 3 ? 'var(--accent)' : 'var(--ink)'};font-size:12.5px">${t}</text>`).join('')}
    </svg></div>`;
  }
  function markovSVG(M, labels) {
    const n = M.length; const P = M.map(r => r.map(x => x.num()));
    const W = 460, H = n <= 2 ? 220 : 380, cx = W / 2, cy = H / 2 + (n === 3 ? 14 : 0), R = n <= 2 ? 120 : 125, rn = 24;
    const pos = labels.map((_, i) => {
      if (n === 2) return [cx + (i === 0 ? -R : R), cy];
      if (n === 4) { const q = [[-1, -1], [1, -1], [1, 1], [-1, 1]][i]; return [cx + q[0] * R * 0.78, cy + q[1] * R * 0.62]; }
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    });
    let out = '';
    const lbl = (x, y, t) => `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" style="fill:var(--bit);font-size:12px;font-weight:600;paint-order:stroke;stroke:var(--surface);stroke-width:4px;stroke-linejoin:round">${t}</text>`;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (P[i][j] <= 1e-12) continue;
      const t = M[i][j].toString().length <= 6 ? M[i][j].toString() : fmt(P[i][j], 3);
      const [x1, y1] = pos[i], [x2, y2] = pos[j];
      if (i === j) {
        const dx = x1 - cx, dy = y1 - cy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
        const bx = x1 + ux * rn, by = y1 + uy * rn;
        const px = -uy, py = ux;
        const a1x = bx + px * 9, a1y = by + py * 9, a2x = bx - px * 9, a2y = by - py * 9;
        const c1x = a1x + ux * 48 + px * 22, c1y = a1y + uy * 48 + py * 22, c2x = a2x + ux * 48 - px * 22, c2y = a2y + uy * 48 - py * 22;
        out += `<path d="M${a1x.toFixed(1)},${a1y.toFixed(1)} C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${a2x.toFixed(1)},${a2y.toFixed(1)}" style="fill:none;stroke:var(--muted);stroke-width:1.5" marker-end="url(#ah)"/>`;
        out += lbl(bx + ux * 50, by + uy * 50, t);
        continue;
      }
      const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, nx = -uy, ny = ux;
      const both = P[j][i] > 1e-12; const off = both ? 26 : 10;
      const mx = (x1 + x2) / 2 + nx * off, my = (y1 + y2) / 2 + ny * off;
      // puntos de salida/llegada en el borde
      const s = [x1 + ux * rn + nx * (both ? 6 : 0), y1 + uy * rn + ny * (both ? 6 : 0)];
      const e = [x2 - ux * (rn + 3) + nx * (both ? 6 : 0), y2 - uy * (rn + 3) + ny * (both ? 6 : 0)];
      out += `<path d="M${s[0].toFixed(1)},${s[1].toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${e[0].toFixed(1)},${e[1].toFixed(1)}" style="fill:none;stroke:var(--muted);stroke-width:1.5" marker-end="url(#ah)"/>`;
      const lx = 0.25 * s[0] + 0.5 * mx + 0.25 * e[0], ly = 0.25 * s[1] + 0.5 * my + 0.25 * e[1];
      out += lbl(lx, ly, t);
    }
    pos.forEach(([x, y], i) => {
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rn}" style="fill:var(--surface);stroke:var(--accent);stroke-width:2"/><text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle" style="fill:var(--ink);font-size:15px;font-weight:600">${esc(labels[i])}</text>`;
    });
    return `<div class="diagram"><svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Diagrama de estados">
      <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--muted)"/></marker></defs>${out}</svg></div>`;
  }

  /* ---------- Renderizadores (puros: estado -> HTML) ---------- */
  const R = {};

  R.entropia = st => {
    const { fr, p, note } = readProbs(st.probs);
    const labels = readLabels(st.labels, p.length);
    const base = st.base === 'e' ? Math.E : Number(st.base || 2);
    const unit = st.base === 'e' ? 'nats' : base === 2 ? 'bits' : base === 3 ? 'trits' : base === 10 ? 'dits' : 'unidades';
    const H = TI.H(p, base), H2 = TI.H(p, 2);
    const rows = p.map((q, i) => [esc(labels[i]), num(q), num(q > 0 ? TI.info(q, base) : 0), num(q > 0 ? -q * TI.log(q, base) : 0)]);
    let extra = '';
    if (st.q && st.q.trim()) {
      try {
        const qd = readProbs(st.q).p;
        if (qd.length !== p.length) throw new Error('q debe tener tantos valores como p.');
        const bad = p.some((x, i) => x > 0 && qd[i] <= 0);
        extra = kv([['D(p‖q)', bad ? '∞' : fmt(TI.kl(p, qd), 4) + ' bits'], ['D(q‖p)', qd.some((x, i) => x > 0 && p[i] <= 0) ? '∞' : fmt(TI.kl(qd, p), 4) + ' bits']]);
      } catch (e) { extra = errBox(e); }
    }
    const bs = st.base || '2';
    const ht = hTex('H(X)', fr, bs);
    const devH = dev('Desarrollo: fórmula y sustitución', [
      P(`Fórmula: \\(H(X)=\\sum_i p_i\\,${logT(bs)}\\frac1{p_i}\\) (cada mensaje aporta su probabilidad por su información \\(${logT(bs)}\\frac1{p_i}\\); los de probabilidad 0 no cuentan).`),
      P('Sustituyo cada probabilidad, calculo cada término y sumo:'), ht.tex,
      P(`Resultado en ${unit}.`) + (bs === '2' ? S`\[ H_3(X)=\frac{H_2(X)}{\log_2 3}=\frac{${tx(H2)}}{1{,}585}=${tx(TI.H(p, 3))}\ \text{trits} \]` : S`\[ H_2(X)=H(X)\cdot\log_2 ${bs === 'e' ? 'e' : bs}=${tx(H2)}\ \text{bits} \]`),
      P(`Máximo posible con ${p.length} mensajes: \\(${logT(bs)} ${p.length}=${tx(TI.log(p.length, base))}\\) (si fueran equiprobables).`)]);
    return note + tbl(['x', 'p(x)', `log(1/p) [${unit}]`, 'p·log(1/p)'], rows) +
      kv([[`H(X) en ${unit}`, fmt(H, 4)], ['H(X) en bits', fmt(H2, 4)], ['Máximo log|X|', fmt(TI.log(p.length, base), 4) + ' ' + unit], ['H / Hmáx', pct(H2 / Math.log2(p.length || 1))]]) + devH + extra;
  };

  R.conjunta = st => {
    const M = TI.parseMatrix(st.matrix, false);
    const cols = M[0].length; M.forEach((r, i) => { if (r.length !== cols) throw new Error(`La fila ${i + 1} tiene otro número de columnas.`); });
    const flat = M.flat(); const tot = flat.reduce((a, b) => a.add(b), new TI.Frac(0n));
    const note = tot.eq(new TI.Frac(1n)) ? '' : `<div class="note">La tabla suma ${fmt(tot.num(), 4)}; la normalizo.</div>`;
    const Mn = M.map(r => r.map(x => x.div(tot)));
    const j = TI.joint(Mn);
    const head = ['X \\ Y', ...Mn[0].map((_, k) => 'y' + (k + 1)), 'p(x)', 'H(Y/X=x)'];
    const rows = Mn.map((r, i) => ['x' + (i + 1), ...r.map(v => ({ h: v.toString(), c: 'num' })), num(j.px[i]), num(j.px[i] > 0 ? TI.H(r.map(v => v.num() / j.px[i])) : 0)]);
    rows.push(['p(y)', ...j.py.map(v => num(v)), '', '']);
    const px = Mn.map(r => r.reduce((a, b) => a.add(b), new TI.Frac(0n))), py = Mn[0].map((_, k) => Mn.reduce((a, r) => a.add(r[k]), new TI.Frac(0n)));
    const devJ = dev('Desarrollo: fórmulas y sustitución', [
      P(S`<b>1. Marginales</b>: \(p(x)=\sum_y p(x,y)\) (suma de cada fila) y \(p(y)=\sum_x p(x,y)\) (suma de cada columna).`),
      S`\[ p(x)=(${px.map(f => ftx(f)).join(';\ ')}),\qquad p(y)=(${py.map(f => ftx(f)).join(';\ ')}) \]`,
      P(S`<b>2. Entropías de las marginales</b>: \(H(X)=\sum p(x)\log_2\frac1{p(x)}\).`), hTex('H(X)', px).tex, hTex('H(Y)', py).tex,
      P(S`<b>3. Entropía conjunta</b>: la misma fórmula con todas las casillas de la tabla.`), hTex('H(X,Y)', Mn.flat()).tex,
      P(S`<b>4. Condicionales</b> por la regla de la cadena \(H(X,Y)=H(X)+H(Y/X)\):`),
      S`\[ \begin{aligned} H(Y/X) &= H(X,Y)-H(X)=${tx(j.HXY)}-${tx(j.HX)}=${tx(j.HYgX)} \\ H(X/Y) &= H(X,Y)-H(Y)=${tx(j.HXY)}-${tx(j.HY)}=${tx(j.HXgY)} \end{aligned} \]`,
      P(S`<b>5. Información mutua</b>: \(I(X;Y)=H(X)+H(Y)-H(X,Y)\).`),
      S`\[ I(X;Y)=${tx(j.HX)}+${tx(j.HY)}-${tx(j.HXY)}=\mathbf{${tx(j.I)}}\ \text{bits} \]`]);
    return note + tbl(head, rows) + kv([['H(X)', fmt(j.HX, 4)], ['H(Y)', fmt(j.HY, 4)], ['H(X,Y)', fmt(j.HXY, 4)], ['H(Y/X)', fmt(j.HYgX, 4)], ['H(X/Y)', fmt(j.HXgY, 4)], ['I(X;Y)', fmt(j.I, 4)]]) + devJ;
  };

  R.huffman = st => {
    const { fr, p, note } = readProbs(st.probs);
    const D = Number(st.d || 2);
    const labels = readLabels(st.labels, p.length);
    const h = TI.huffman(fr, D, { labels, tie: st.tie || 'abajo' });
    const codes = st.canon ? TI.canonical(h.lengths, D) : h.codes;
    // tabla de reducción
    const stages = h.stages.filter(s => !s.final);
    let table = '';
    if (stages.length) {
      const nrows = stages[0].items.length;
      const head = ['C(x)', 'x', 'p(x)', ...stages.slice(1).map((_, k) => 'p' + "'".repeat(k + 1))];
      const leafCode = {};
      h.stages[0].items.forEach(it => { leafCode[it.uid] = h.nodeCode[it.uid]; });
      let rows = '';
      for (let r = 0; r < nrows; r++) {
        const it0 = stages[0].items[r];
        const leafIdx = labels.indexOf(it0.label);
        const code = it0.ghost ? h.nodeCode[it0.uid] : (st.canon && leafIdx >= 0 ? codes[leafIdx] : h.nodeCode[it0.uid]);
        rows += `<tr><td>${cw(code, D)}</td><td class="${it0.ghost ? 'ghost' : ''}">${esc(it0.label)}${it0.ghost ? ' (fantasma)' : ''}</td>`;
        stages.forEach((sg, k) => {
          const it = sg.items[r];
          if (!it) { rows += '<td></td>'; return; }
          const mi = sg.merged.indexOf(it.uid);
          const isNew = k > 0 && stages[k - 1].newUid === it.uid;
          const cls = [mi >= 0 ? 'mrg' : '', isNew ? 'new' : '', it.ghost ? 'ghost' : ''].join(' ');
          rows += `<td class="${cls}">${fmt(it.p, 4)}${mi >= 0 ? `<span class="dg">${mi.toString(D)}</span>` : ''}${st.back !== false && !st.canon ? `<span class="pc">${h.nodeCode[it.uid] || '·'}</span>` : ''}</td>`;
        });
        rows += '</tr>';
      }
      table = `<div class="tbl-wrap"><table class="huff"><thead><tr>${head.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
        <p class="small muted">En azul, los ${D} elementos que se agrupan en cada columna, con el dígito que reciben. La barra marca dónde se coloca el grupo en la columna siguiente. Debajo de cada probabilidad, la palabra que acaba teniendo ese nodo (vuelta atrás).</p>`;
    }
    const H = TI.H(p, D), Hb = TI.H(p, 2);
    const L = p.reduce((s, q, i) => s + (codes[i] === null ? 0 : q * codes[i].length), 0);
    const unit = TI.unitName(D), su = TI.symName(D);
    const res = tbl(['x', 'p(x)', 'palabra', 'l(x)'], p.map((q, i) => [esc(labels[i]), num(q), cw(codes[i], D), codes[i] === null ? '—' : codes[i].length]));
    const ghostTxt = D > 2 ? `<p class="small">${h.ghosts ? `Con N = ${p.filter(x => x > 0).length} mensajes, (N−1) mod (D−1) = ${(p.filter(x => x > 0).length - 1) % (D - 1)} ≠ 0: añado <b>${h.ghosts} fantasma${h.ghosts > 1 ? 's' : ''}</b> con probabilidad 0 para llegar a ${p.filter(x => x > 0).length + h.ghosts}.` : `Con N = ${p.filter(x => x > 0).length} mensajes, (N−1) mod (D−1) = 0: no hace falta fantasma.`}</p>` : '';
    const kraft = TI.kraft(codes.filter(c => c !== null).map(c => c.length), D);
    return note + ghostTxt + table + res + kv([[`L (${su}/mensaje)`, fmt(L, 4)], [`H${D === 2 ? '' : '_' + D}(X) (${unit})`, fmt(H, 4)], ['Eficiencia η', pct(H / L)], ...(D !== 2 ? [['L en sb/mensaje', fmt(L * Math.log2(D), 4)]] : [['H en trits', fmt(TI.H(p, 3), 4)]]), ['Kraft Σ D^-l', fmt(kraft, 4)]]) +
      (p.length > 1 && p.filter(x => x > 0).length === 1 ? '<p class="small">Solo hay un mensaje posible: no hace falta enviar nada (0 símbolos).</p>' : codeDev(fr, codes.map(c => (c === null ? null : c.length)), D));
  };

  R.fano = st => {
    const { fr, p, note } = readProbs(st.probs);
    const labels = readLabels(st.labels, p.length);
    const f = TI.fano(fr, { labels, sort: !!st.sort, tie: st.tie });
    const steps = f.splits.map(s => {
      const cumTxt = s.cum.map((c, k) => (k + 1 === s.cut ? `<b>${fmt(c, 3)}</b>` : fmt(c, 3))).join(' · ');
      return `<li><div><span>Grupo <b>{${s.group.map(esc).join(', ')}}</b>${s.prefix ? ` (prefijo ${cw(s.prefix)})` : ''}, suma ${fmt(s.tot, 3)}, mitad ${fmt(s.tot / 2, 3)}.</span>
        <span class="small muted">Acumuladas: ${cumTxt}</span>
        <span>Corte: ${cw(s.prefix + '0')} ← {${s.left.map(esc).join(', ')}} (${fmt(s.pl, 3)}) · ${cw(s.prefix + '1')} ← {${s.right.map(esc).join(', ')}} (${fmt(s.pr, 3)})</span></div></li>`;
    }).join('');
    const H = TI.H(p);
    const tr = TI.trim(f.codes);
    return note + (st.sort ? '<div class="note">Con los mensajes reordenados por probabilidad el código ya no es alfabético.</div>' : '') +
      `<ol class="steps">${steps}</ol>` +
      tbl(['x', 'p(x)', 'palabra', 'l(x)'], f.order.map(i => [esc(labels[i]), num(p[i]), cw(f.codes[i]), f.lengths[i]])) +
      kv([['L (sb/mensaje)', fmt(f.L, 4)], ['H(X) (bits)', fmt(H, 4)], ['Eficiencia η', pct(H / f.L)], ['Kraft', fmt(TI.kraft(f.lengths), 4)]]) +
      (tr.changes.length ? `<p class="small">Se puede recortar: ${tr.changes.map(c => `${cw(c.from)}→${cw(c.to)}`).join(', ')}.</p>` : '<p class="small muted">Código completo (Kraft = 1): no se puede recortar.</p>') +
      (f.ambiguous ? '<p class="small muted">Hay un empate al elegir algún corte: el otro corte también sería válido.</p>' : '') + codeDev(fr, f.lengths, 2);
  };

  R.shannon = st => {
    const { fr, p, note } = readProbs(st.probs);
    const D = Number(st.d || 2);
    const labels = readLabels(st.labels, p.length);
    const s = TI.shannon(fr, D, { labels });
    const rows = s.rows.map(r => [esc(r.label), num(r.p), num(r.info, 3), r.l, { h: fracOrDec(r.Ffrac), c: 'num' }, { h: '0,' + r.code + '…', c: 'num' }, cw(r.code, D)]);
    const H = TI.H(p, D); const k = TI.kraft(s.lengths, D);
    return note + tbl(['x', 'p', `log${D === 2 ? '₂' : '_' + D}(1/p)`, 'l = ⌈·⌉', 'F (acum. anterior)', `F en base ${D}`, 'palabra'], rows) +
      kv([[`L (${TI.symName(D)}/mensaje)`, fmt(s.L, 4)], [`H (${TI.unitName(D)})`, fmt(H, 4)], ['Eficiencia η', pct(H / s.L)], ['Kraft', fmt(k, 4)]]) +
      `<p class="small muted">Cumple H ≤ L < H + 1: ${fmt(H, 3)} ≤ ${fmt(s.L, 3)} < ${fmt(H + 1, 3)}.${k < 1 - 1e-9 ? ' Kraft < 1: sobran ramas y se puede recortar.' : ''}</p>` +
      dev('Longitudes de Shannon', [P(`Fórmula: \\(l_i=\\left\\lceil ${logT(String(D))}\\frac1{p_i}\\right\\rceil\\) (redondeo hacia arriba). Con la calculadora: \\(${logT(String(D))}x=\\ln x/\\ln ${D}\\).`),
        S`\[ \begin{aligned} ` + s.rows.map(r => S`l_{\text{${esc(r.label)}}} &= \left\lceil ${logT(String(D))}\frac{1}{${ftx(fr[labels.indexOf(r.label)] || r.p)}}\right\rceil = \lceil ${tx(r.info, 3)}\rceil = ${r.l}`).join(S` \\ `) + S` \end{aligned} \]`,
        P(S`La palabra son los primeros \(l_i\) dígitos de la acumulada \(F_i=\sum_{j\lt i}p_j\) (con los mensajes ordenados de más a menos probable) escrita en base ` + D + '.')]) +
      codeDev(fr, s.lengths, D);
  };

  R.sfe = st => {
    const { fr, p, note } = readProbs(st.probs);
    const labels = readLabels(st.labels, p.length);
    const s = TI.sfe(fr, { labels });
    const rows = s.rows.map(r => [esc(r.label), num(r.p), num(r.F), num(r.Fbar), { h: '0,' + `<b>${r.bin.slice(0, r.l)}</b>${r.bin.slice(r.l)}${r.exact ? '' : '…'}`, c: 'num' }, r.l, cw(r.code)]);
    const H = TI.H(p); const tr = TI.trim(s.codes);
    const Lt = p.reduce((a, q, i) => a + q * tr.codes[i].length, 0);
    return note + tbl(['x', 'p', 'F', 'F̄ = F_ant + p/2', 'F̄ en binario', 'l = ⌈log 1/p⌉+1', 'palabra'], rows) +
      kv([['L (sb/mensaje)', fmt(s.L, 4)], ['H (bits)', fmt(H, 4)], ['Eficiencia η', pct(H / s.L)], ['L recortado', fmt(Lt, 4)]]) +
      `<p class="small">Recortado: ${tr.codes.map((c, i) => `${esc(labels[i])}=${cw(c)}`).join(' · ')}</p>` +
      dev('Fórmulas de SFE', [P(S`\(\bar F(x)=\sum_{t\lt x}p(t)+\tfrac{p(x)}2\) (acumulada de los anteriores más la mitad del propio) y \(l(x)=\lceil\log_2\frac1{p(x)}\rceil+1\).`),
        S`\[ \begin{aligned} ` + s.rows.map(r => S`\bar F_{\text{${esc(r.label)}}} &= ${tx(r.F)}+\tfrac{${tx(r.p)}}{2}=${tx(r.Fbar)}, & l_{\text{${esc(r.label)}}} &= \lceil\log_2\tfrac{1}{${tx(r.p)}}\rceil+1=${r.l}`).join(S` \\ `) + S` \end{aligned} \]`]) +
      codeDev(fr, s.codes.map(c => c.length), 2, 2);
  };

  R.trim = st => {
    const { fr, p, note } = readProbs(st.probs);
    const labels = readLabels(st.labels, p.length);
    const base = st.method === 'sfe' ? TI.sfe(fr, { labels }) : TI.shannon(fr, 2, { labels });
    const tr = TI.trim(base.codes);
    const L0 = p.reduce((a, q, i) => a + q * base.codes[i].length, 0), L1 = p.reduce((a, q, i) => a + q * tr.codes[i].length, 0);
    return note + tbl(['x', 'p', 'original', 'recortado'], p.map((q, i) => [esc(labels[i]), num(q), cw(base.codes[i]), cw(tr.codes[i])])) +
      kv([['L original', fmt(L0, 4)], ['L recortado', fmt(L1, 4)], ['Kraft original', fmt(TI.kraft(base.codes.map(c => c.length)), 4)], ['Kraft recortado', fmt(TI.kraft(tr.codes.map(c => c.length)), 4)]]) +
      (tr.changes.length ? `<p class="small">Pasos (de la palabra más larga a la más corta, mientras siga siendo prefijo): ${tr.changes.map(c => `${cw(c.from)}→${cw(c.to)}`).join(', ')}.</p>` : '<p class="small">No se puede recortar nada.</p>');
  };

  R.kraftcodes = st => {
    const codes = String(st.codes || '').trim().split(/[\s,;]+/).filter(Boolean);
    if (!codes.length) throw new Error('Escribe las palabras código separadas por espacios.');
    const D = Math.max(2, ...codes.join('').split('').map(c => parseInt(c, 36) + 1));
    const cls = TI.classifyCode(codes);
    const names = { singular: ['Singular', 'no'], nosingular: ['No singular, pero no UD', 'mid'], ud: ['Unívocamente descodificable (no prefijo)', 'info'], prefijo: ['Prefijo (instantáneo)', 'ok'] };
    const sp = TI.sardinas(codes);
    const k = TI.kraft(codes.map(c => c.length), D);
    let spTxt = '';
    if (cls !== 'singular') {
      spTxt = sp.sets.length ? tbl(['Conjunto', 'Sufijos colgantes'], sp.sets.map((s, i) => [`C${i + 1}`, s.map(w => cw(w, D)).join(' ')])) : '<p class="small">C₁ está vacío: ninguna palabra es prefijo de otra.</p>';
      spTxt += `<p class="small">${sp.ud ? 'Ningún conjunto contiene una palabra del código → es UD.' : `El sufijo ${cw(sp.culprit, D)} es una palabra del código → no es UD.`}</p>`;
    } else spTxt = '<p class="small">Hay palabras repetidas: dos mensajes comparten palabra.</p>';
    return `<div class="row">${pill(names[cls][0], names[cls][1])} <span class="small muted">alfabético ${D}-ario detectado</span></div>` +
      kv([['Σ D^-l (Kraft)', fmt(k, 4)], ['¿Cumple Kraft?', k <= 1 + 1e-12 ? 'sí' : 'no'], ['Palabras', codes.length]]) + spTxt;
  };

  R.kraftlens = st => {
    const ls = String(st.lengths || '').trim().split(/[\s,;]+/).filter(Boolean).map(x => parseInt(x, 10));
    if (!ls.length || ls.some(x => !(x >= 1))) throw new Error('Escribe longitudes enteras ≥ 1.');
    const D = Number(st.d || 2);
    const fr = ls.map(l => new TI.Frac(1n, BigInt(D) ** BigInt(l))).reduce((a, b) => a.add(b), new TI.Frac(0n));
    const ok = fr.cmp(new TI.Frac(1n)) <= 0;
    const codes = ok ? TI.canonical(ls, D) : null;
    return dev('Desigualdad de Kraft', [P(S`Existe un código prefijo con esas longitudes si y solo si \(\sum_i D^{-l_i}\le1\).`), S`\[ \sum_i ${D}^{-l_i}=` + ls.map(l => S`${D}^{-${l}}`).join('+') + S`=${ftx(fr)}${fr.toString().includes('/') ? S`=${tx(fr.num())}` : ''}\ ${ok ? S`\le` : '>'}\ 1 \]`]) + kv([['Σ D^-l', `${fr.toString()} = ${fmt(fr.num(), 4)}`], ['¿Existe código prefijo?', ok ? 'sí' : 'no'], ['¿Completo (= 1)?', fr.eq(new TI.Frac(1n)) ? 'sí' : 'no']]) +
      (ok ? `<p class="small">Un código prefijo con esas longitudes (canónico): ${codes.map(c => cw(c, D)).join(' ')}</p>` : '<p class="small">Las longitudes son demasiado cortas: ningún código prefijo (ni UD, por McMillan) puede tenerlas.</p>') +
      (ok && !fr.eq(new TI.Frac(1n)) && D === 2 ? '<p class="small muted">Como sobra hueco en el árbol, alguna palabra se puede acortar: un código binario con estas longitudes no es óptimo para ninguna distribución.</p>' : '');
  };

  R.binexp = st => {
    const f = TI.Frac.parse(st.frac);
    if (f.cmp(new TI.Frac(0n)) < 0 || f.cmp(new TI.Frac(1n)) >= 0) throw new Error('Escribe un número entre 0 y 1 (sin incluir el 1).');
    const D = Number(st.d || 2), n = Math.min(24, Math.max(1, parseInt(st.digits, 10) || 8));
    let x = f; const rows = []; let out = '';
    for (let i = 1; i <= n; i++) {
      const y = x.mul(new TI.Frac(BigInt(D)));
      const d = y.n / y.d; const rest = y.sub(new TI.Frac(d));
      rows.push([i, `${fmt(x.num(), 6)} × ${D} = ${fmt(y.num(), 6)}`, { h: `<b>${d}</b>`, c: 'num' }, num(rest.num(), 6)]);
      out += d.toString(D); x = rest; if (x.isZero()) break;
    }
    return tbl(['paso', 'multiplico', 'dígito', 'me queda'], rows) + `<p>Resultado: <span class="cw">0,${out}</span>${x.isZero() ? ' (exacto)' : '…'}</p>`;
  };

  R.diagram = st => {
    const M = TI.parseMatrix(st.matrix); const labels = readLabels(st.labels, M.length);
    return markovSVG(M, labels);
  };

  function justify(M, labels, cls) {
    const out = [];
    out.push('<b>Homogénea</b>: la matriz Π no depende del instante n.');
    if (cls.irreducible) out.push('<b>Irreducible</b>: desde cualquier estado se puede llegar a cualquier otro (el diagrama está conectado en ambos sentidos).');
    else {
      out.push(`<b>Reducible</b>: clases ${cls.classes.map(c => '{' + c.map(i => labels[i]).join(',') + '}').join(', ')}.` + (cls.transient.length ? ` Estados transitorios: ${cls.transient.map(i => labels[i]).join(', ')}.` : ''));
    }
    if (cls.irreducible) {
      const loops = cls.selfLoops.map((b, i) => (b ? i : -1)).filter(i => i >= 0);
      if (cls.period === 1) out.push(loops.length ? `<b>Aperiódica</b>: ${labels[loops[0]]} tiene auto-lazo (P${labels[loops[0]]}${labels[loops[0]]} = ${M[loops[0]][loops[0]].toString()} > 0), así que se puede volver en 1 salto y el MCD es 1.` : '<b>Aperiódica</b>: hay caminos de vuelta de longitudes con MCD 1.');
      else out.push(`<b>Periódica de periodo ${cls.period}</b>: solo se vuelve a un estado en múltiplos de ${cls.period} saltos.`);
    }
    return out;
  }

  R.markov = st => {
    const M = TI.parseMatrix(st.matrix); const n = M.length;
    const labels = readLabels(st.labels, n);
    const bad = TI.checkStochastic(M);
    if (bad.length) throw new Error(`Cada fila debe sumar 1. ${bad.map(b => `Fila ${labels[b.row]}: suma ${fmt(b.sum.num(), 4)}`).join('; ')}.`);
    const mode = st.mode || 'todo';
    const mk = TI.markov(M, { labels, tie: st.tie || 'abajo' });
    let html = '';
    if (mode !== 'codigos') html += markovSVG(M, labels);
    const just = justify(M, labels, mk.cls);
    const conv = mk.cls.irreducible && mk.cls.period === 1;
    html += `<div class="row">${pill('H', 'info')} ${pill(mk.cls.irreducible ? 'Irreducible' : 'Reducible', mk.cls.irreducible ? 'ok' : 'no')} ${mk.cls.irreducible ? pill(mk.cls.period === 1 ? 'Aperiódica' : 'Periodo ' + mk.cls.period, mk.cls.period === 1 ? 'ok' : 'mid') : ''} ${pill(conv ? 'Converge' : 'No converge para toda μ(1)', conv ? 'ok' : 'no')}</div>`;
    if (mode !== 'codigos') html += `<ul class="small">${just.map(j => `<li>${j}</li>`).join('')}</ul>`;
    if (mk.mu) {
      html += `<h4>Distribución estacionaria</h4>` + tbl(labels, [mk.mu.map(f => ({ h: fracOrDec(f), c: 'num' }))]);
      if (mode !== 'codigos') {
        const eqs = labels.map((lj, j) => `μ${lj} = ${labels.map((li, i) => (M[i][j].isZero() ? null : `${M[i][j].toString()}·μ${li}`)).filter(Boolean).join(' + ') || '0'}`);
        html += `<details><summary>Ver el sistema de ecuaciones (columnas de Π)</summary><div class="body"><p class="mono small">${eqs.join('<br>')}<br>${labels.map(l => 'μ' + l).join(' + ')} = 1</p><p class="small">Tacha una de las ${n} primeras (son dependientes) y resuelve con la de la suma.</p></div></details>`;
      }
    } else html += '<div class="note">La distribución estacionaria no es única (la cadena es reducible).</div>';
    if (mode !== 'codigos') {
      const k = Number(st.pow || 16);
      const Pk = TI.matPow(M, k);
      html += `<details><summary>Π elevada a n (¿filas iguales? → converge)</summary><div class="body"><div class="row"><label class="small" for="${st._id}-pow">n =</label><select id="${st._id}-pow" data-k="pow" style="width:auto">${[1, 2, 4, 8, 16, 32].map(v => `<option ${v === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>` +
        tbl(['', ...labels], Pk.map((r, i) => [labels[i], ...r.map(v => num(v, 3))])) + '</div></details>';
    }
    if (mk.mu && mode !== 'clasificar') {
      const rowsH = mk.rowsH;
      html += '<h4>Tasa de entropía y códigos</h4>';
      html += tbl(['Desde', ...labels.map(l => '→ ' + l), 'H(fila)', 'L fila', 'μ'], M.map((r, i) => [labels[i], ...r.map((_, j) => cw(mk.rowCodes[i].codes[j])), num(rowsH[i]), num(mk.Lrows[i]), num(mk.muN[i])]));
      const Ls = mk.stateCode.L;
      html += kv([['Tasa H(𝒳) = Σ μᵢ·H(fila)', fmt(mk.rate, 4) + ' bits'], ['H(μE) símbolo aislado', fmt(mk.Hmu, 4) + ' bits'], ['L por transiciones Σ μᵢ·Lᵢ', fmt(mk.Ltrans, 4)], ['L por estados (Huffman sobre μE)', fmt(Ls, 4)], ['Ahorro transiciones vs estados', pct(1 - mk.Ltrans / Ls)], ['Exceso sobre la tasa', pct(mk.Ltrans / mk.rate - 1)]]);
      const lb = l => S`\text{${esc(l)}}`;
      html += dev('Desarrollo: fórmulas y sustitución', [
        P(S`<b>1. Entropía de cada fila</b> (incertidumbre del salto desde ese estado): \(H(\text{fila } i)=\sum_j P_{ij}\log_2\frac1{P_{ij}}\).`),
        ...M.map((r, i) => hTex(S`H(\text{fila } ${lb(labels[i])})`, r).tex),
        P(S`<b>2. Tasa de entropía</b>: media de las filas pesada con la distribución estacionaria, \(H(\mathcal X)=\sum_i\mu_i\,H(\text{fila } i)\).`),
        eqTex(S`H(\mathcal X)`, [labels.map((l, i) => S`${ftx(mk.mu[i])}\cdot ${tx(rowsH[i])}`), [S`\mathbf{${tx(mk.rate)}}\ \text{bits/símbolo}`]]),
        P(S`<b>3. Símbolo aislado</b> (lo que se gana como mucho codificando por estados): \(H(\vec\mu_E)\).`),
        hTex(S`H(\vec\mu_E)`, mk.mu).tex,
        P(S`<b>4. Longitud por transiciones</b>: cada fila tiene su Huffman, \(\bar L_i=\sum_j P_{ij}\,l_{ij}\), y se pesan con \(\mu_i\).`),
        ...M.map((r, i) => lTex(S`\bar L_{${lb(labels[i])}}`, r, mk.rowCodes[i].codes.map(c => (c === null ? null : c.length))).tex),
        eqTex(S`\bar L`, [labels.map((l, i) => S`${ftx(mk.mu[i])}\cdot ${tx(mk.Lrows[i])}`), [S`\mathbf{${tx(mk.Ltrans)}}\ \text{sb/símbolo}`]]),
        S`\[ \text{Exceso sobre la tasa}=\frac{\bar L-H(\mathcal X)}{H(\mathcal X)}=\frac{${tx(mk.Ltrans)}-${tx(mk.rate)}}{${tx(mk.rate)}}=${tx(100 * (mk.Ltrans / mk.rate - 1), 2)}\,\% \]`]);
      html += `<p class="small">Código por estados: ${labels.map((l, i) => `${l}=${cw(mk.stateCode.codes[i])}`).join(' · ')}. ${mk.Lrows.some((L, i) => L - rowsH[i] > 0.15 && mk.muN[i] > 0.15) ? 'Alguna fila queda lejos de su entropía (probabilidades no diádicas o ráfagas largas): ahí RLE puede mejorar.' : ''}</p>`;
      // codificar cadena
      const fixedLen = Math.ceil(Math.log2(n));
      const first = labels.map((_, i) => i.toString(2).padStart(fixedLen, '0'));
      const seqRaw = String(st.seq || '').trim();
      const seq = labels.every(l => l === l.toUpperCase()) ? seqRaw.toUpperCase() : seqRaw;
      html += `<div class="form"><div class="field span"><label for="${st._id}-seq">Codificar una cadena (primer símbolo con código fijo de ${fixedLen} bits: ${labels.map((l, i) => `${l}=${first[i]}`).join(', ')})</label><input type="text" class="mono" id="${st._id}-seq" data-k="seq" value="${esc(seq)}" placeholder="p. ej. ${labels.join('')}${labels[0]}"></div></div>`;
      if (seq) {
        try {
          const parts = TI.encodeTransitions(seq.replace(/\s+/g, ''), labels, mk.rowCodes, first);
          html += `<p class="bits-out">${parts.map(pt => `<span class="seg" title="${pt.from ? pt.from + '→' + pt.to : 'inicio ' + pt.to}">${pt.code || '∅'}</span>`).join('')}</p>
            <p class="small muted">${parts.map(pt => pt.from ? `${pt.from}→${pt.to}: ${pt.code || '(nada)'}` : `${pt.to}: ${pt.code}`).join(' · ')} · Total ${parts.reduce((a, b) => a + b.code.length, 0)} bits para ${parts.length} símbolos.</p>`;
        } catch (e) { html += errBox(e); }
      }
    }
    return html;
  };

  R.rle = st => {
    let opts;
    if (st.lr && String(st.lr).trim()) { const LR = TI.Frac.parse(st.lr).num(); if (!(LR > 1)) throw new Error('La longitud media de ráfaga debe ser mayor que 1.'); opts = { LR }; }
    else throw new Error('Escribe la longitud media de ráfaga.');
    const mo = parseInt(st.m, 10); if (mo >= 1) opts.m = mo;
    if (st.sub === 'fijo') opts.fixed = true;
    const r = TI.rle(opts);
    let html = kv([['p = (L_R − 1)/L_R', fmt(r.p, 4)], ['−1/log₂ p', fmt(r.kreal, 3)], ['m elegido', r.m], ['p^m', fmt(r.pm, 4)]]);
    html += `<p class="small">Candidatos: ${r.cands.map(c => `m = ${c.m} → p^m = ${fmt(c.pm, 4)}`).join(' · ')}. Me quedo con el más cercano a 0,5${mo >= 1 ? ' (o el que hayas fijado)' : ''}.</p>`;
    html += '<h4>Código del subgrupo (resto r)</h4>' + tbl(['r', 'P(r) = p^r(1−p)/(1−p^m)', 'palabra'], r.subP.map((q, i) => [i, num(q), cw(r.subCodes[i])]));
    html += kv([['L preámbulo = 1/(1−p^m)', fmt(r.LG, 4)], ['L subgrupo', fmt(r.LSG, 4)], ['L_RLE (bits/ráfaga)', fmt(r.Lrun, 4)], ['bits/símbolo = L_RLE/L_R', fmt(r.perSym, 4)], ['Entropía del salto H(p)', fmt(r.Hp, 4)], ['Exceso', pct(r.perSym / r.Hp - 1)]]);
    const pmS = S`p^{${r.m}}`;
    html += dev('Desarrollo: fórmulas y sustitución', [
      P(S`<b>1. Probabilidad de repetición</b>: la longitud de ráfaga es geométrica con media \(L_R=\frac1{1-p}\), así que \(p=\frac{L_R-1}{L_R}\).`),
      S`\[ p=\frac{${tx(r.LR)}-1}{${tx(r.LR)}}=${tx(r.p)} \]`,
      P(S`<b>2. Elegir m</b> con \(p^m\approx\tfrac12\): \(m\approx-\frac1{\log_2 p}=-\frac{\ln 2}{\ln p}=${tx(r.kreal, 3)}\). Pruebo los enteros de alrededor: ` + r.cands.map(c => S`\(p^{${c.m}}=${tx(c.pm)}\)`).join(', ') + S` → \(m=${r.m}\).`),
      P(S`<b>3. Preámbulo</b> \(1^k0\) con \(k=\lfloor\frac{l-1}{m}\rfloor\): longitud media \(L_G=\frac1{1-p^m}\).`),
      S`\[ L_G=\frac{1}{1-${pmS}}=\frac{1}{1-${tx(r.pm)}}=${tx(r.LG)} \]`,
      P(S`<b>4. Resto</b> \(r=(l-1)\bmod m\): ` + (st.sub === 'fijo' ? S`con \(\lceil\log_2 ${r.m}\rceil\) bits fijos.` : S`con un Huffman de los \(m\) restos, \(L_{SG}=\sum_r P(r)\,l(r)\).`)),
      r.m === 1 ? S`\[ L_{SG}=0 \]` : st.sub === 'fijo' ? S`\[ L_{SG}=\lceil\log_2 ${r.m}\rceil=${tx(r.LSG)} \]` : lTex('L_{SG}', r.subP, r.subCodes.map(c => c.length)).tex,
      P(S`<b>5. Total</b>: bits por ráfaga y, dividiendo entre la longitud media, bits por símbolo. Se compara con la entropía del salto \(H(p)\).`),
      S`\[ \begin{aligned} L_{RLE} &= L_G+L_{SG}=${tx(r.LG)}+${tx(r.LSG)}=${tx(r.Lrun)}\ \text{bits/ráfaga} \\ \frac{L_{RLE}}{L_R} &= \frac{${tx(r.Lrun)}}{${tx(r.LR)}}=\mathbf{${tx(r.perSym)}}\ \text{bits/símbolo} \\ H(p) &= ${tx(r.p)}\log_2\tfrac1{${tx(r.p)}}+${tx(1 - r.p)}\log_2\tfrac1{${tx(1 - r.p)}}=${tx(r.Hp)} \end{aligned} \]`]);
    html += `<p class="small muted">Si tras la ráfaga hay que indicar cuál de dos símbolos equiprobables sigue, suma 1 bit por ráfaga: (${fmt(r.Lrun, 3)} + 1)/${fmt(r.LR, 3)} = ${fmt((r.Lrun + 1) / r.LR, 4)} bits/símbolo.</p>`;
    html += '<h4>Tabla de longitudes</h4>' + tbl(['l', 'P(l)', 'k = ⌊(l−1)/m⌋', 'r', 'preámbulo', 'resto', 'palabra'], r.table.slice(0, Math.min(r.table.length, Math.max(2 * r.m + 2, 8))).map(t => [t.l, num(t.p), t.k, t.r, cw(t.pre), cw(t.sub), cw(t.code)]));
    const l = parseInt(st.l, 10);
    html += `<div class="form"><div class="field"><label for="${st._id}-l">Codificar una ráfaga de longitud l</label><input type="number" min="1" id="${st._id}-l" data-k="l" value="${l >= 1 ? l : ''}" placeholder="p. ej. 5"></div></div>`;
    if (l >= 1) { const k = Math.floor((l - 1) / r.m), rr = (l - 1) % r.m; html += `<p>l = ${l}: k = ⌊${l - 1}/${r.m}⌋ = ${k}, r = ${l - 1} mod ${r.m} = ${rr} → preámbulo ${cw('1'.repeat(k) + '0')} + resto ${cw(r.subCodes[rr])} = ${cw(TI.rleCode(l, r.m, r.subCodes))}</p>`; }
    return html;
  };

  /* ---------- Formularios de los widgets ---------- */
  const fld = (id, k, label, val, o = {}) => {
    const v = val === undefined || val === null ? '' : val;
    if (o.type === 'select') return `<div class="field${o.span ? ' span' : ''}"><label for="${id}-${k}">${label}</label><select id="${id}-${k}" data-k="${k}">${o.opts.map(([ov, ol]) => `<option value="${ov}" ${String(ov) === String(v) ? 'selected' : ''}>${ol}</option>`).join('')}</select></div>`;
    if (o.type === 'check') return `<div class="field"><label class="check" for="${id}-${k}"><input type="checkbox" id="${id}-${k}" data-k="${k}" ${v ? 'checked' : ''}> ${label}</label></div>`;
    if (o.type === 'area') return `<div class="field span"><label for="${id}-${k}">${label}</label><textarea id="${id}-${k}" data-k="${k}" spellcheck="false">${esc(v)}</textarea></div>`;
    return `<div class="field${o.span ? ' span' : ''}"><label for="${id}-${k}">${label}</label><input type="text" class="${o.mono ? 'mono' : ''}" id="${id}-${k}" data-k="${k}" value="${esc(v)}" placeholder="${esc(o.ph || '')}" autocomplete="off" spellcheck="false"></div>`;
  };
  const probsFields = (id, st) => fld(id, 'probs', 'Probabilidades (separadas por espacios; vale 0,25 o 1/4)', st.probs, { span: true, mono: true }) + fld(id, 'labels', 'Nombres de los mensajes (opcional)', st.labels, { mono: true });

  const WIDGETS = {
    entropia: { title: 'Entropía de una fuente', form: (id, st) => probsFields(id, st) + fld(id, 'base', 'Unidad', st.base || '2', { type: 'select', opts: [['2', 'bits (log₂)'], ['3', 'trits (log₃)'], ['e', 'nats (ln)'], ['10', 'dits (log₁₀)']] }) + fld(id, 'q', 'q para D(p‖q) (opcional)', st.q, { mono: true }) },
    conjunta: { title: 'Entropía conjunta e información mutua', form: (id, st) => fld(id, 'matrix', 'Tabla p(x,y): una fila por valor de X (también vale separar filas con ;)', (st.matrix || '').split(';').map(s => s.trim()).join('\n'), { type: 'area' }) },
    huffman: { title: 'Huffman', form: (id, st) => probsFields(id, st) + fld(id, 'd', 'Alfabeto del código', st.d || '2', { type: 'select', opts: [['2', 'Binario (D=2)'], ['3', 'Ternario (D=3)'], ['4', 'Cuaternario (D=4)']] }) + fld(id, 'tie', 'Empates (grado de libertad)', st.tie || 'abajo', { type: 'select', opts: [['abajo', 'Grupo debajo del empate'], ['arriba', 'Grupo encima del empate']] }) + fld(id, 'canon', 'Forma canónica', st.canon, { type: 'check' }) },
    fano: { title: 'Fano', form: (id, st) => probsFields(id, st) + fld(id, 'sort', 'Ordenar antes por probabilidad (deja de ser alfabético)', st.sort, { type: 'check' }) + fld(id, 'tie', 'Si dos cortes empatan', st.tie || 'arriba', { type: 'select', opts: [['arriba', 'cortar lo antes posible'], ['abajo', 'cortar lo más tarde posible']] }) },
    shannon: { title: 'Código de Shannon', form: (id, st) => probsFields(id, st) + fld(id, 'd', 'Alfabeto', st.d || '2', { type: 'select', opts: [['2', 'Binario'], ['3', 'Ternario']] }) },
    sfe: { title: 'Shannon-Fano-Elias', form: (id, st) => probsFields(id, st) },
    trim: { title: 'Recortar un código', form: (id, st) => probsFields(id, st) + fld(id, 'method', 'Código de partida', st.method || 'shannon', { type: 'select', opts: [['shannon', 'Shannon'], ['sfe', 'Shannon-Fano-Elias']] }) },
    kraftcodes: { title: 'Tipo de código y Sardinas-Patterson', form: (id, st) => fld(id, 'codes', 'Palabras código separadas por espacios', st.codes, { span: true, mono: true, ph: '0 10 110 111' }) },
    kraftlens: { title: 'Desigualdad de Kraft', form: (id, st) => fld(id, 'lengths', 'Longitudes', st.lengths, { mono: true, ph: '1 2 3 3' }) + fld(id, 'd', 'D', st.d || '2', { type: 'select', opts: [['2', '2'], ['3', '3'], ['4', '4']] }) },
    binexp: { title: 'Pasar una fracción a binario', form: (id, st) => fld(id, 'frac', 'Número entre 0 y 1', st.frac, { mono: true, ph: '0,6' }) + fld(id, 'digits', 'Dígitos', st.digits || '8', { mono: true }) + fld(id, 'd', 'Base', st.d || '2', { type: 'select', opts: [['2', '2'], ['3', '3']] }) },
    diagram: { title: 'Diagrama de estados', form: null },
    markov: { title: 'Cadena de Markov', form: (id, st) => fld(id, 'matrix', 'Matriz Π (una fila por estado; fracciones o decimales)', (st.matrix || '').split(';').map(s => s.trim()).join('\n'), { type: 'area' }) + fld(id, 'labels', 'Nombres de los estados', st.labels, { mono: true }) },
    rle: { title: 'RLE (longitud de ráfaga)', form: (id, st) => fld(id, 'lr', 'Longitud media de ráfaga L_R', st.lr, { mono: true, ph: '5' }) + fld(id, 'm', 'Forzar m (opcional)', st.m, { mono: true }) + fld(id, 'sub', 'Código del resto', st.sub || 'huffman', { type: 'select', opts: [['huffman', 'Huffman (algo más corto)'], ['fijo', '⌈log₂ m⌉ bits fijos (como las soluciones)']] }) }
  };

  function mountWidget(el, type, st, opts = {}) {
    const W = WIDGETS[type];
    if (type === 'venn') { el.innerHTML = vennSVG(); return; }
    if (type === 'codesets') { el.innerHTML = codesetsSVG(); return; }
    if (!W) { el.innerHTML = errBox('Widget desconocido: ' + type); return; }
    const id = uid(type);
    st._id = id;
    const showForm = W.form && !opts.noForm;
    el.innerHTML = `<div class="panel">${opts.heading === false ? '' : `<div class="row"><h4>${W.title}</h4>${opts.calcLink ? `<a class="btn sm ghost" href="#/calc/${opts.calcLink}" style="margin-left:auto">Abrir en calculadora →</a>` : ''}</div>`}${showForm ? `<div class="form">${W.form(id, st)}</div>` : ''}<div class="result" id="${id}-res"></div></div>`;
    const res = $('#' + id + '-res', el);
    const draw = () => {
      try { res.innerHTML = R[type](st); } catch (e) { res.innerHTML = errBox(e); }
      if (drawn) typeset(res); // el primer dibujado lo procesa el typeset de la página
      drawn = true;
    };
    let drawn = false;
    draw();
    let tmo;
    el.addEventListener('input', ev => {
      const k = ev.target.dataset && ev.target.dataset.k; if (!k) return;
      st[k] = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
      if (opts.persist) store.set('calc:' + opts.persist, Object.assign({}, st, { _id: undefined }));
      clearTimeout(tmo);
      const isRes = res.contains(ev.target);
      tmo = setTimeout(() => {
        const focusId = document.activeElement && document.activeElement.id; const caret = document.activeElement && document.activeElement.selectionStart;
        draw();
        if (isRes && focusId) { const f = document.getElementById(focusId); if (f) { f.focus(); try { if (caret != null) f.setSelectionRange(caret, caret); } catch (e) { /* select */ } } }
      }, isRes && ev.target.tagName === 'SELECT' ? 0 : 250);
    });
  }
  const WIDGET_DEFAULT_LINK = { entropia: 'entropia', conjunta: 'entropia', huffman: 'huffman', fano: 'fano', shannon: 'shannon', sfe: 'shannon', trim: 'shannon', kraftcodes: 'codigos', kraftlens: 'codigos', binexp: 'binario', markov: 'markov', diagram: 'markov', rle: 'rle' };
  function mountAll(root) {
    $$('[data-widget]', root).forEach(el => {
      if (el.dataset.mounted) return; el.dataset.mounted = '1';
      const d = el.dataset; const st = {};
      ['probs', 'labels', 'd', 'tie', 'matrix', 'mode', 'seq', 'lr', 'codes', 'lengths', 'frac', 'digits', 'method', 'base', 'sub', 'm', 'sort'].forEach(k => { if (d[k] !== undefined) st[k] = d[k]; });
      mountWidget(el, d.widget, st, { calcLink: WIDGET_DEFAULT_LINK[d.widget], heading: d.widget !== 'diagram' });
    });
  }

  /* ---------- Navegación ---------- */
  const CALCS = [
    ['entropia', 'Entropía, conjunta y D(p‖q)', ['entropia', 'conjunta']],
    ['huffman', 'Huffman (binario y D-ario)', ['huffman']],
    ['fano', 'Fano', ['fano']],
    ['shannon', 'Shannon, SFE y recorte', ['shannon', 'sfe', 'trim']],
    ['codigos', 'Kraft y tipos de código', ['kraftlens', 'kraftcodes']],
    ['binario', 'Decimal → binario', ['binexp']],
    ['markov', 'Cadena de Markov', ['markov']],
    ['rle', 'RLE (ráfagas)', ['rle']]
  ];
  const CALC_DEFAULTS = {
    entropia: { probs: '0.3 0.2 0.2 0.2 0.1', base: '2' }, conjunta: { matrix: '1/8 1/16 1/16 1/4; 1/16 1/8 1/16 0; 1/32 1/32 1/16 0; 1/32 1/32 1/16 0' },
    huffman: { probs: '0.15 0.26 0.09 0.25 0.11 0.14', labels: 'A B C D E F', d: '2' }, fano: { probs: '0.22 0.05 0.13 0.27 0.03 0.04 0.16 0.1', labels: 'a b c d e f g h' },
    shannon: { probs: '0.14 0.15 0.18 0.2 0.1 0.08 0.06 0.09', labels: '1 2 3 4 5 6 7 8' }, sfe: { probs: '0.25 0.25 0.2 0.15 0.15', labels: '1 2 3 4 5' }, trim: { probs: '0.14 0.15 0.18 0.2 0.1 0.08 0.06 0.09', labels: '1 2 3 4 5 6 7 8' },
    kraftlens: { lengths: '1 2 3 4 5', d: '2' }, kraftcodes: { codes: '0 01 011 0111' }, binexp: { frac: '0.6', digits: '8' },
    markov: { matrix: '1/4 1/4 1/4 1/4; 1/4 0 1/4 1/2; 1/8 1/2 1/8 1/4; 1/4 1/2 1/4 0', labels: 'A B C D', seq: 'AABCCBDABCC' }, rle: { lr: '5', l: '5' }
  };

  function navHTML(route) {
    const visited = store.get('visited', {});
    const a = (href, txt, n, on, tick) => `<a href="${href}" class="${on ? 'on' : ''}">${n !== undefined ? `<span class="n">${n}</span>` : ''}<span>${txt}</span>${tick ? '<span class="tick">✓</span>' : ''}</a>`;
    const r = route.join('/');
    return `<a class="brand" href="#/inicio"><span class="bits">0 10 110 111</span><b>Cuaderno de Entropía</b><span>Teoría de la Información · 1.er parcial</span></a>
      <nav class="nav-group"><span>Empieza aquí</span>${a('#/inicio', 'Plan y qué cae', undefined, r === 'inicio')}${a('#/chuleta', 'Chuleta de fórmulas', undefined, r === 'chuleta')}</nav>
      <nav class="nav-group"><span>Aprende</span>${C.lessons.map(l => a('#/aprende/' + l.id, l.title, l.n, r === 'aprende/' + l.id, visited[l.id])).join('')}</nav>
      <nav class="nav-group"><span>Practica</span>${a('#/practica', 'Ejercicios con corrección', undefined, route[0] === 'practica')}${a('#/teoria', 'Test de teoría', undefined, r === 'teoria')}</nav>
      <nav class="nav-group"><span>Exámenes resueltos</span>${C.exams.filter(e => e.group !== 'clase').map(e => a('#/examenes/' + e.id, e.title, undefined, r === 'examenes/' + e.id)).join('')}</nav>
      <nav class="nav-group"><span>Ejercicios de clase</span>${C.exams.filter(e => e.group === 'clase').map(e => a('#/examenes/' + e.id, e.title, undefined, r === 'examenes/' + e.id)).join('')}</nav>
      <nav class="nav-group"><span>Calculadoras</span>${CALCS.map(([id, t]) => a('#/calc/' + id, t, undefined, r === 'calc/' + id)).join('')}</nav>
      <div class="theme-btn row"><button class="btn sm" type="button" id="themeBtn">Tema: <span id="themeLbl"></span></button></div>`;
  }

  /* ---------- Páginas ---------- */
  const PAGES = {};
  const EXAM_DATE = new Date('2026-10-30T10:30:00+01:00');

  PAGES.inicio = () => {
    const done = store.get('plan', {});
    const today = new Date();
    const dayIdx = today < new Date('2026-10-28T00:00:00+01:00') ? 0 : today < new Date('2026-10-29T00:00:00+01:00') ? 1 : today < new Date('2026-10-30T00:00:00+01:00') ? 2 : 3;
    const days = [
      ['Martes 27', 'Fuentes sin memoria', [['l1', 'Lección 1: entropía e información mutua', '#/aprende/entropia'], ['l2', 'Lección 2: tipos de código y Kraft', '#/aprende/codigos'], ['l3', 'Lección 3: Shannon y eficiencia', '#/aprende/shannon'], ['l4', 'Lección 4: Huffman binario y ternario', '#/aprende/huffman'], ['l5', 'Lección 5: Fano y SFE', '#/aprende/alfabeticos'], ['p1', 'Practica 3 Huffman, 2 ternarios y 2 Fano', '#/practica']]],
      ['Miércoles 28', 'Fuentes con memoria', [['l6', 'Lección 6: cadenas de Markov', '#/aprende/markov'], ['l7', 'Lección 7: tasa de entropía y códigos por transiciones', '#/aprende/tasa'], ['p2', 'Practica 3 "Markov desde el enunciado" y 2 cadenas a codificar', '#/practica/markovtexto'], ['e1', 'Hoja de clase 1: entropía de 3 variables', '#/examenes/ej1'], ['e2', 'Hoja de clase 2: mensajes a, ab, abc', '#/examenes/ej2'], ['e3', 'Hoja de clase 3 (resuelta)', '#/examenes/ej3']]],
      ['Jueves 29', 'RLE y simulacros', [['l8', 'Lección 8: RLE y Lempel-Ziv', '#/aprende/rle'], ['x25', 'Examen oct 2025 en 50 minutos, luego corrige', '#/examenes/2025'], ['x24', 'Examen oct 2024 en 50 minutos', '#/examenes/2024'], ['xe26', 'Examen ene 2026 (RLE completo)', '#/examenes/ene26'], ['xj26', 'Examen jun 2026', '#/examenes/jun26'], ['xr', 'Repaso rápido: ene 2025, jun 2024 y oct 2023', '#/examenes/ene25'], ['t1', 'Test de teoría completo dos veces', '#/teoria']]],
      ['Viernes 30', 'Día del examen', [['ch', 'Repasa la chuleta 20 minutos antes', '#/chuleta'], ['ca', 'Calculadora: comprueba que sabes hacer ln y la tecla de fracciones', '#/chuleta']]]
    ];
    return `<div class="page">
      <section class="hero">
        <div class="bitline" aria-hidden="true">00 · 01 · 10 · 110 · 111 · 1110 · 11110</div>
        <h1>Cuaderno de Entropía</h1>
        <p class="lead">Todo lo que entra en el primer parcial de Teoría de la Información, explicado desde cero, con calculadoras que hacen las tablas igual que en clase y ejercicios que se corrigen solos. Sacado de tus diapositivas, de los siete exámenes de 2023 a 2026 y de las hojas de ejercicios de clase.</p>
      </section>
      <section class="grid2">
        <div class="tile"><span class="t-eyebrow">Viernes 30 oct · 10:30–12:30</span><h3>Teoría · 4 puntos</h3><p class="small">15–20 min. Cuestionario de preguntas cortas en la misma hoja: definiciones, fórmulas, teoremas, interpretaciones. <b>Sin calculadora.</b></p><a class="btn sm" href="#/teoria">Entrenar teoría</a></div>
        <div class="tile"><span class="t-eyebrow">50–60 min · solo calculadora</span><h3>Problemas · 6 puntos</h3><p class="small">Normalmente dos: uno corto de fuente sin memoria (Huffman / Fano / ternario) y uno largo de cadena de Markov. Cada problema se entrega por separado.</p><a class="btn sm" href="#/examenes/2025">Ver el de 2025</a></div>
      </section>
      <section class="sec">
        <h2>Qué ha caído en el primer parcial</h2>
        ${tbl(['', 'Problema corto (2–3 pt)', 'Problema largo (6–8 pt)', 'Teoría'], [
          ['<b>Jun 2026</b>', 'Dado trucado: Fano alfabético (con empates) y Huffman', 'Lenguaje A, B, C, espacio (A en parejas → estado extra), μE, tasa, entropía de los símbolos, código por transiciones', 'Extensión de código, UD vs prefijo, ¿Fano = Huffman?, ternario óptimo 3-ádico'],
          ['<b>Ene 2026</b>', 'Días de la semana (+10 %): Fano alfabético, recortar, Huffman', 'Mercado de colas: Π, μE, convergencia, <b>RLE estándar</b>, tasa, redundancia, H(μE)', 'Información mutua, tasa de entropía, por qué μ1 = μ2, McMillan vs Kraft'],
          ['<b>Oct 2025</b>', 'Huffman binario con sus 2 variantes, Huffman ternario, eficiencias', 'Π desde el enunciado + diagrama, convergencia, μE, estados vs transiciones, código, codificar cadena, relación markoviana', '—'],
          ['<b>Ene 2025</b>', 'Huffman quinario (3 fantasmas) vs longitudes de Shannon', 'Robot A/D/I: Π, ¿estacionario?, convergencia, estados vs transiciones, <b>RLE</b> para A', '—'],
          ['<b>Oct 2024</b>', 'Fano alfabético, Huffman ternario con fantasma, comparar con H', 'Ráfagas → Π, clasificar, comprobar μE, tasa, Huffman por estado + <b>RLE</b>, codificar cadena, cadena no homogénea', 'I(X;Y) y Venn, dado vs moneda, Kraft {1..5}, recortar códigos'],
          ['<b>Jun 2024</b>', '—', 'Píxeles CMAK: Π, μ(2) y μ(3), μE, H(μE), código por estados, tasa, transiciones + <b>RLE</b>', 'Interpretaciones de la entropía, código recortable'],
          ['<b>Oct 2023</b>', 'Caracterizar la fuente (caso peor), Huffman ternario, Fano binario', 'Viajante en 3 ciudades: Π, clasificar, tasa, código por transiciones, H(μa), no homogénea (lunes)', 'Entropía relativa, H(X,Y) ≤ H(X)+H(Y), tipos de código, propiedades de Huffman']
        ], 'text')}
        <div class="callout idea"><b>La conclusión</b><span>En los siete exámenes, los problemas son siempre un código para fuente sin memoria (Huffman, Fano o Shannon) y un problema de Markov completo. Además, RLE ha caído en 4 de 7 (siempre que un estado se repite con p &gt; 1/2). Domina las lecciones 4, 5, 6, 7 y 8.</span></div>
      </section>
      <section class="sec">
        <h2>Plan hasta el viernes</h2>
        <div class="plan">${days.map((d, i) => `<div class="day ${i === dayIdx ? 'today' : ''}"><div><b>${d[0]}</b><span class="small">${d[1]}${i === dayIdx ? ' · hoy' : ''}</span></div><div>${d[2].map(([k, t, href]) => `<label class="todo ${done[k] ? 'done' : ''}"><input type="checkbox" data-plan="${k}" ${done[k] ? 'checked' : ''}><span><a href="${href}">${t}</a></span></label>`).join('')}</div></div>`).join('')}</div>
        <p class="small muted">Las casillas se guardan en este navegador.</p>
      </section>
      <section class="sec">
        <h2>Consejos para el examen</h2>
        <div class="prose"><ul>
          <li>Escribe siempre las unidades: sb/mensaje, st/mensaje, bits/símbolo. Para comparar un código ternario con uno binario, multiplica por log₂3 = 1,585.</li>
          <li>Haz las tablas de Huffman y Fano con el mismo formato que en clase: columnas reordenadas y los 0/1 junto a las llaves.</li>
          <li>En Markov justifica cada palabra de la clasificación (homogénea, irreducible, aperiódica) con una frase y luego cita el teorema.</li>
          <li>Comprueba que cada fila de Π suma 1 y que Σμ = 1. Comprueba μE multiplicándola por Π.</li>
          <li>"Trayectos largos" o "bits necesarios" = tasa de entropía. "Incertidumbre sobre dónde está" = H(μE).</li>
        </ul></div>
      </section>
    </div>`;
  };

  PAGES.aprende = (id) => {
    const i = C.lessons.findIndex(l => l.id === id);
    const l = C.lessons[i >= 0 ? i : 0];
    const v = store.get('visited', {}); v[l.id] = true; store.set('visited', v);
    const prev = C.lessons[i - 1], next = C.lessons[i + 1];
    const practice = (l.practice || []).map(k => GEN[k] ? `<a class="btn sm" href="#/practica/${k}">${GEN[k].title}</a>` : '').join('');
    return `<div class="page"><header class="sec"><span class="eyebrow">Lección ${l.n} de ${C.lessons.length}</span><h1>${l.title}</h1></header>${l.html}
      <section class="sec"><h3>Ahora practica</h3><div class="row">${practice}</div>
      <div class="row" style="justify-content:space-between;margin-top:8px">${prev ? `<a class="btn" href="#/aprende/${prev.id}">← ${prev.title}</a>` : '<span></span>'}${next ? `<a class="btn pri" href="#/aprende/${next.id}">${next.title} →</a>` : `<a class="btn pri" href="#/examenes/2025">Hacer el examen de 2025 →</a>`}</div></section></div>`;
  };

  PAGES.calc = (id) => {
    const c = CALCS.find(x => x[0] === id) || CALCS[0];
    return `<div class="page"><header class="sec"><span class="eyebrow">Calculadora</span><h1>${c[1]}</h1><p class="lead">Cambia los datos y el resultado se recalcula con todos los pasos. Úsala para comprobar lo que hagas a mano.</p></header>${c[2].map(w => `<div data-calc="${w}"></div>`).join('')}</div>`;
  };

  PAGES.chuleta = () => `<div class="page wide"><header class="sec"><span class="eyebrow">Repaso</span><h1>Chuleta de fórmulas</h1><p class="lead">En el examen no puedes llevarla, pero repasarla justo antes ayuda. En la parte de teoría no hay calculadora: apréndete las entropías típicas.</p></header><div class="cheat">${C.cheat}</div></div>`;

  /* ---------- Teoría ---------- */
  PAGES.teoria = () => {
    const topics = ['Todas', ...new Set(C.cards.map(c => c.t))];
    return `<div class="page"><header class="sec"><span class="eyebrow">Parte de teoría · 4 puntos · sin calculadora</span><h1>Test de teoría</h1><p class="lead">${C.cards.length} preguntas cortas sacadas de los exámenes y de las diapositivas. Intenta contestar en voz alta o por escrito antes de ver la respuesta.</p></header>
      <div class="row"><div class="chips" id="topicChips">${topics.map((t, i) => `<button type="button" class="chip ${i === 0 ? 'on' : ''}" data-topic="${t}">${t}</button>`).join('')}</div></div>
      <div class="row"><button class="btn" type="button" id="modeCards">Tarjetas</button><button class="btn" type="button" id="modeSim">Simulacro de 4 preguntas (15 min)</button><button class="btn" type="button" id="modeList">Ver todas</button><span class="score" id="cardScore"></span></div>
      <div id="theoryArea"></div></div>`;
  };
  function theoryInit(root) {
    let topic = 'Todas', mode = 'cards', idx = 0, order = [];
    const marks = store.get('cards', {});
    const pool = () => C.cards.map((c, i) => ({ c, i })).filter(o => topic === 'Todas' || o.c.t === topic);
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const area = $('#theoryArea', root);
    const scoreTxt = () => { const p = pool(); const k = p.filter(o => marks[o.i] === 'ok').length; $('#cardScore', root).textContent = `Sabes ${k} de ${p.length}`; };
    const renderCards = () => {
      if (!order.length) { order = shuffle(pool().sort((a, b) => (marks[a.i] === 'ok') - (marks[b.i] === 'ok'))); idx = 0; }
      const o = order[idx % order.length];
      area.innerHTML = `<div class="card"><span class="src">${o.c.t} · ${o.c.src} · ${idx % order.length + 1}/${order.length}</span><div class="prose"><p><b>${o.c.q}</b></p></div>
        <div class="row"><button class="btn pri" type="button" id="showAns">Ver respuesta</button></div><div class="ans" id="ans" hidden><div class="prose">${o.c.a}</div>
        <div class="row"><button class="btn" type="button" data-mark="ok">La sabía</button><button class="btn" type="button" data-mark="no">Repasar</button></div></div></div>`;
      $('#showAns', area).onclick = () => { $('#ans', area).hidden = false; mountAll(area); typeset(area); };
      $$('[data-mark]', area).forEach(b => b.onclick = () => { marks[o.i] = b.dataset.mark; store.set('cards', marks); idx++; scoreTxt(); renderCards(); });
      typeset(area); scoreTxt();
    };
    const renderList = () => { area.innerHTML = pool().map(o => `<details><summary>${o.c.q} <span class="src small muted" style="margin-left:auto">${o.c.src}</span></summary><div class="body prose">${o.c.a}</div></details>`).join(''); mountAll(area); typeset(area); scoreTxt(); };
    let simTimer = null;
    const renderSim = () => {
      const picks = shuffle(pool().slice()).slice(0, 4);
      let left = 15 * 60;
      area.innerHTML = `<div class="panel"><div class="row"><b>Simulacro</b><span class="timer" id="simT">15:00</span><button class="btn sm" type="button" id="simDone" style="margin-left:auto">Corregir</button></div>
        ${picks.map((o, k) => `<div class="part"><p class="q-text"><b class="tag">P${k + 1}</b>${o.c.q}</p><textarea id="sim-${k}" placeholder="Escribe tu respuesta"></textarea><div class="ans" hidden data-sim="${k}"><div class="prose">${o.c.a}</div></div></div>`).join('')}</div>`;
      clearInterval(simTimer);
      simTimer = setInterval(() => { left--; const t = $('#simT', area); if (!t) { clearInterval(simTimer); return; } t.textContent = `${String(Math.floor(Math.max(left, 0) / 60)).padStart(2, '0')}:${String(Math.max(left, 0) % 60).padStart(2, '0')}`; if (left <= 0) { clearInterval(simTimer); reveal(); } }, 1000);
      const reveal = () => { clearInterval(simTimer); $$('[data-sim]', area).forEach(a => a.hidden = false); mountAll(area); typeset(area); };
      $('#simDone', area).onclick = reveal; typeset(area); scoreTxt();
    };
    const go = () => { clearInterval(simTimer); if (mode === 'cards') renderCards(); else if (mode === 'list') renderList(); else renderSim(); };
    $$('[data-topic]', root).forEach(b => b.onclick = () => { topic = b.dataset.topic; $$('[data-topic]', root).forEach(x => x.classList.toggle('on', x === b)); order = []; go(); });
    $('#modeCards', root).onclick = () => { mode = 'cards'; order = []; go(); };
    $('#modeList', root).onclick = () => { mode = 'list'; go(); };
    $('#modeSim', root).onclick = () => { mode = 'sim'; go(); };
    go();
  }

  /* ---------- Exámenes ---------- */
  PAGES.examenes = (id) => {
    const e = C.exams.find(x => x.id === id) || C.exams[0];
    return `<div class="page"><header class="sec"><span class="eyebrow">${e.date}${e.minutes ? ` · ${e.minutes} minutos` : ''}</span><h1>${e.title}</h1><p class="lead">${e.intro}</p>
      <div class="row">${e.minutes ? `<button class="btn" type="button" id="exTimerBtn">Empezar cronómetro de ${e.minutes} min</button><span class="timer" id="exTimer"></span>` : ''}<button class="btn" type="button" id="exAll">Mostrar todas las soluciones</button></div>
      <p class="small muted">Intenta cada apartado en papel. Si te atascas, abre la pista; luego compara con la solución, que trae la calculadora con los pasos.</p></header>
      ${e.problems.map((p, pi) => `<section class="sec"><h2>${p.title}</h2><div class="statement">${p.statement}</div>
        ${p.parts.map((pt, k) => `<div class="part"><p class="q-text"><b class="tag">${pt.tag})</b>${pt.q}${pt.pts !== undefined ? ` <span class="muted small">(${String(pt.pts).replace('.', ',')} pt)</span>` : ''}</p>
          <div class="row"><button class="btn sm" type="button" data-hint="${pi}-${k}">Pista</button><button class="btn sm" type="button" data-sol="${pi}-${k}">Solución</button></div>
          <div class="callout idea" data-hintbox="${pi}-${k}" hidden><b>Pista</b><span>${pt.hint || ''}</span></div>
          <div class="example" data-solbox="${pi}-${k}" hidden><span class="lbl">Solución</span>${pt.sol}</div></div>`).join('')}</section>`).join('')}</div>`;
  };
  let examTimer = null;
  function examInit(root) {
    const toggle = (sel, key) => { const box = $(`[${sel}="${key}"]`, root); box.hidden = !box.hidden; if (!box.hidden) { mountAll(box); typeset(box); } };
    $$('[data-hint]', root).forEach(b => b.onclick = () => toggle('data-hintbox', b.dataset.hint));
    $$('[data-sol]', root).forEach(b => b.onclick = () => toggle('data-solbox', b.dataset.sol));
    const all = $('#exAll', root);
    if (all) all.onclick = () => { $$('[data-solbox]', root).forEach(b => { b.hidden = false; mountAll(b); }); typeset(root); };
    const tb = $('#exTimerBtn', root);
    if (tb) tb.onclick = () => {
      clearInterval(examTimer); const mins = parseInt(tb.textContent.match(/\d+/)[0], 10); let left = mins * 60; const t = $('#exTimer', root);
      tb.textContent = `Reiniciar (${mins} min)`;
      examTimer = setInterval(() => { left--; if (!document.body.contains(t)) { clearInterval(examTimer); return; } t.textContent = left > 0 ? `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}` : 'Tiempo'; if (left <= 0) clearInterval(examTimer); }, 1000);
    };
  }

  /* ---------- Práctica ---------- */
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const lbls = n => 'abcdefghij'.slice(0, n).split('');
  const pstr = fr => fr.map(f => fmt(f.num(), 4)).join(' ');
  const GEN = {};

  GEN.huffman2 = { title: 'Huffman binario', lesson: 'huffman', make(r) {
    const n = TI.randInt(r, 4, 7); const fr = TI.randDist(r, n, 1, 2); const L = lbls(n);
    const h = TI.huffman(fr, 2, { labels: L }); const H = TI.H(fr.map(f => f.num()));
    return { statement: `<p>Una fuente sin memoria emite \\(\\{${L.join(',')}\\}\\) con probabilidades <span class="mono">(${pstr(fr).replace(/ /g, '; ')})</span>. Diseña un código binario óptimo.</p>`,
      qs: [{ label: 'Longitud media L (sb/mensaje)', ans: h.L, tol: 0.006 }, { label: 'Entropía H(X) (bits)', ans: H, tol: 0.006 }, { label: 'Eficiencia η (%)', ans: 100 * H / h.L, tol: 0.4 }],
      sol: `<div data-widget="huffman" data-probs="${pstr(fr)}" data-labels="${L.join(' ')}" data-d="2"></div>` };
  } };
  GEN.huffman3 = { title: 'Huffman ternario', lesson: 'huffman', make(r) {
    const n = TI.randInt(r, 5, 9); const fr = TI.randDist(r, n, 1, 2); const L = lbls(n);
    const h = TI.huffman(fr, 3, { labels: L }); const H3 = TI.H(fr.map(f => f.num()), 3);
    return { statement: `<p>Fuente sin memoria con ${n} mensajes \\(\\{${L.join(',')}\\}\\) y probabilidades <span class="mono">(${pstr(fr).replace(/ /g, '; ')})</span>. Diseña un código ternario óptimo.</p>`,
      qs: [{ label: 'Número de mensajes fantasma', ans: h.ghosts, tol: 0 }, { label: 'Longitud media (st/mensaje)', ans: h.L, tol: 0.006 }, { label: 'Esa longitud en sb/mensaje', ans: h.L * Math.log2(3), tol: 0.012 }, { label: 'Eficiencia η (%)', ans: 100 * H3 / h.L, tol: 0.5 }],
      sol: `<div data-widget="huffman" data-probs="${pstr(fr)}" data-labels="${L.join(' ')}" data-d="3"></div>` };
  } };
  GEN.fano = { title: 'Fano alfabético', lesson: 'alfabeticos', make(r) {
    let fr, f, n, L;
    for (let t = 0; t < 60; t++) { n = TI.randInt(r, 4, 7); fr = TI.randDist(r, n, 1, 2); L = lbls(n); f = TI.fano(fr, { labels: L }); if (!f.ambiguous) break; }
    return { statement: `<p>Diseña un código binario <b>alfabético</b> para \\(\\{${L.join(',')}\\}\\) con probabilidades <span class="mono">(${pstr(fr).replace(/ /g, '; ')})</span>, en ese orden.</p>`,
      qs: [{ label: `Palabras de ${L.join(', ')} (en orden, separadas por espacios)`, ans: f.codes.join(' '), kind: 'codes' }, { label: 'Longitud media (sb/mensaje)', ans: f.L, tol: 0.006 }],
      sol: `<div data-widget="fano" data-probs="${pstr(fr)}" data-labels="${L.join(' ')}"></div>` };
  } };
  GEN.shannon = { title: 'Código de Shannon', lesson: 'shannon', make(r) {
    const n = TI.randInt(r, 4, 6); const fr = TI.randDist(r, n, 1, 3); const L = lbls(n);
    const s = TI.shannon(fr, 2, { labels: L }); const tr = TI.trim(s.codes);
    return { statement: `<p>Construye el código binario de Shannon para \\(\\{${L.join(',')}\\}\\) con probabilidades <span class="mono">(${pstr(fr).replace(/ /g, '; ')})</span>.</p>`,
      qs: [{ label: `Longitudes de ${L.join(', ')} (en ese orden)`, ans: s.lengths.join(' '), kind: 'codes' }, { label: 'Longitud media (sb/mensaje)', ans: s.L, tol: 0.006 }, { label: '¿Se puede recortar?', ans: tr.changes.length ? 'si' : 'no', kind: 'choice', opts: [['si', 'Sí'], ['no', 'No']] }],
      sol: `<div data-widget="shannon" data-probs="${pstr(fr)}" data-labels="${L.join(' ')}"></div><div data-widget="trim" data-probs="${pstr(fr)}" data-labels="${L.join(' ')}"></div>` };
  } };
  GEN.sfe = { title: 'Shannon-Fano-Elias', lesson: 'alfabeticos', make(r) {
    const n = TI.randInt(r, 3, 5); const fr = TI.randDist(r, n, 5, 1); const L = lbls(n);
    const s = TI.sfe(fr, { labels: L });
    return { statement: `<p>Construye el código de Shannon-Fano-Elias para \\(\\{${L.join(',')}\\}\\) con probabilidades <span class="mono">(${pstr(fr).replace(/ /g, '; ')})</span>.</p>`,
      qs: [{ label: `Palabras de ${L.join(', ')} (en orden)`, ans: s.codes.join(' '), kind: 'codes' }, { label: 'Longitud media (sb/mensaje)', ans: s.L, tol: 0.006 }],
      sol: `<div data-widget="sfe" data-probs="${pstr(fr)}" data-labels="${L.join(' ')}"></div><div data-widget="binexp" data-frac="${fmt(s.rows[0].Fbar, 6).replace(',', '.')}" data-digits="8"></div>` };
  } };
  GEN.kraft = { title: 'Desigualdad de Kraft', lesson: 'codigos', make(r) {
    const D = r() < 0.7 ? 2 : 3; const n = TI.randInt(r, 4, 7);
    const ls = Array.from({ length: n }, () => TI.randInt(r, 1, D === 2 ? 5 : 3)).sort((a, b) => a - b);
    const sum = ls.reduce((a, l) => a.add(new TI.Frac(1n, BigInt(D) ** BigInt(l))), new TI.Frac(0n));
    const ok = sum.cmp(new TI.Frac(1n)) <= 0;
    const qs = [{ label: 'Σ D^(−l)', ans: sum.num(), tol: 0.0005 }, { label: '¿Existe un código prefijo con esas longitudes?', ans: ok ? 'si' : 'no', kind: 'choice', opts: [['si', 'Sí'], ['no', 'No']] }];
    if (D === 2 && ok) qs.push({ label: '¿Podría ser óptimo (Huffman) para alguna distribución?', ans: sum.eq(new TI.Frac(1n)) ? 'si' : 'no', kind: 'choice', opts: [['si', 'Sí'], ['no', 'No']] });
    return { statement: `<p>Alfabeto de código con D = ${D}. Longitudes de palabra: <span class="mono">{${ls.join(', ')}}</span>.</p>`, qs,
      sol: `<div data-widget="kraftlens" data-lengths="${ls.join(' ')}" data-d="${D}"></div><p class="small">Un código binario óptimo es completo (Kraft = 1): si sobra hueco, alguna palabra se puede acortar.</p>` };
  } };
  GEN.tipos = { title: 'Tipos de código', lesson: 'codigos', make(r) {
    const target = pick(r, ['singular', 'nosingular', 'ud', 'prefijo']); let codes;
    for (let t = 0; t < 400; t++) {
      const n = TI.randInt(r, 3, 4); codes = Array.from({ length: n }, () => { const l = TI.randInt(r, 1, 3); let s = ''; for (let i = 0; i < l; i++) s += r() < 0.5 ? '0' : '1'; return s; });
      if (TI.classifyCode(codes) === target) break;
    }
    const cls = TI.classifyCode(codes);
    return { statement: `<p>Código binario para \\(\\{a,b,c${codes.length > 3 ? ',d' : ''}\\}\\): <span class="mono">${codes.map((c, i) => `${'abcd'[i]} = ${c}`).join(', ')}</span>. ¿De qué tipo es? (La clase más restrictiva que cumple.)</p>`,
      qs: [{ label: 'Clase', ans: cls, kind: 'choice', opts: [['singular', 'Singular'], ['nosingular', 'No singular (no UD)'], ['ud', 'UD pero no prefijo'], ['prefijo', 'Prefijo']] }],
      sol: `<div data-widget="kraftcodes" data-codes="${codes.join(' ')}"></div>` };
  } };
  GEN.entropia = { title: 'Entropía y unidades', lesson: 'entropia', make(r) {
    const n = TI.randInt(r, 3, 6); const fr = TI.randDist(r, n, 5, 1); const p = fr.map(f => f.num());
    return { statement: `<p>Una fuente tiene probabilidades <span class="mono">(${pstr(fr).replace(/ /g, '; ')})</span>.</p>`,
      qs: [{ label: 'H(X) en bits', ans: TI.H(p), tol: 0.006 }, { label: 'H(X) en trits', ans: TI.H(p, 3), tol: 0.006 }, { label: 'Entropía máxima posible con ese número de mensajes (bits)', ans: Math.log2(n), tol: 0.006 }],
      sol: `<div data-widget="entropia" data-probs="${pstr(fr)}"></div>` };
  } };
  GEN.conjunta = { title: 'Entropía conjunta e información mutua', lesson: 'entropia', make(r) {
    const rows = 2, cols = TI.randInt(r, 2, 3); const units = 16; let cells;
    for (let t = 0; t < 100; t++) { const w = Array.from({ length: rows * cols }, () => (r() < 0.2 ? 0 : TI.randInt(r, 1, 6))); const s = w.reduce((a, b) => a + b, 0); if (!s) continue; cells = w.map(x => Math.round(x * units / s)); const d = units - cells.reduce((a, b) => a + b, 0); cells[cells.indexOf(Math.max(...cells))] += d; if (cells.every(x => x >= 0)) break; }
    const M = []; for (let i = 0; i < rows; i++) M.push(cells.slice(i * cols, (i + 1) * cols).map(x => new TI.Frac(BigInt(x), 16n)));
    const j = TI.joint(M);
    const mstr = M.map(r2 => r2.map(String).join(' ')).join('; ');
    return { statement: `<p>Distribución conjunta (filas = X, columnas = Y):</p>` + tbl(['X \\ Y', ...M[0].map((_, k) => 'y' + (k + 1))], M.map((r2, i) => ['x' + (i + 1), ...r2.map(v => ({ h: v.toString(), c: 'num' }))])),
      qs: [{ label: 'H(X)', ans: j.HX, tol: 0.006 }, { label: 'H(Y)', ans: j.HY, tol: 0.006 }, { label: 'H(X,Y)', ans: j.HXY, tol: 0.006 }, { label: 'H(Y/X)', ans: j.HYgX, tol: 0.006 }, { label: 'I(X;Y)', ans: j.I, tol: 0.006 }],
      sol: `<div data-widget="conjunta" data-matrix="${mstr}"></div>` };
  } };

  function randRow(r, n, units, minNonzero = 2) {
    for (let t = 0; t < 100; t++) {
      const w = Array.from({ length: n }, () => (r() < 0.3 ? 0 : TI.randInt(r, 1, 4))); const s = w.reduce((a, b) => a + b, 0); if (!s) continue;
      const u = w.map(x => Math.round(x * units / s)); let d = units - u.reduce((a, b) => a + b, 0); u[u.indexOf(Math.max(...u))] += d;
      if (u.every(x => x >= 0) && u.filter(x => x > 0).length >= minNonzero) return u.map(x => new TI.Frac(BigInt(x), BigInt(units)));
    }
    return Array.from({ length: n }, () => new TI.Frac(1n, BigInt(n)));
  }
  function genMatrix(r, n) {
    for (let t = 0; t < 200; t++) {
      const M = Array.from({ length: n }, () => randRow(r, n, pick(r, [4, 8])));
      const c = TI.classify(M); if (c.irreducible && c.period === 1) return M;
    }
    return Array.from({ length: n }, () => Array.from({ length: n }, () => new TI.Frac(1n, BigInt(n))));
  }
  const mstrOf = M => M.map(r2 => r2.map(String).join(' ')).join('; ');

  GEN.markovmatriz = { title: 'Markov: μE, tasa y códigos', lesson: 'tasa', make(r) {
    const n = r() < 0.6 ? 3 : 4; const M = genMatrix(r, n); const L = 'ABCD'.slice(0, n).split('');
    const mk = TI.markov(M, { labels: L });
    return { statement: `<p>Cadena de Markov homogénea con estados ${L.join(', ')} y matriz de transición:</p>` + tbl(['', ...L], M.map((r2, i) => [L[i], ...r2.map(v => ({ h: v.toString(), c: 'num' }))])),
      qs: [{ label: `Distribución estacionaria μE (${L.join(', ')})`, ans: mk.muN, kind: 'list', tol: 0.006 }, { label: 'Tasa de entropía (bits/símbolo)', ans: mk.rate, tol: 0.006 }, { label: 'H(μE) (bits)', ans: mk.Hmu, tol: 0.006 }, { label: 'L codificando por transiciones (Huffman por fila)', ans: mk.Ltrans, tol: 0.006 }],
      sol: `<div data-widget="markov" data-matrix="${mstrOf(M)}" data-labels="${L.join(' ')}"></div>` };
  } };

  GEN.markovtexto = { title: 'Markov desde el enunciado', lesson: 'markov', make(r) {
    for (let tries = 0; tries < 300; tries++) {
      const n = r() < 0.45 ? 3 : 4; const L = 'ABCD'.slice(0, n).split(''); const F = (a, b) => new TI.Frac(BigInt(a), BigInt(b));
      const rows = [], texts = [], why = []; const used = {};
      for (let i = 0; i < n; i++) {
        const X = L[i]; const others = L.filter((_, j) => j !== i);
        let k = pick(r, ['uniforme', 'rafagaDet', 'rafagaEq', 'noRepiteDoble', 'det', 'lista', 'nunca']);
        if ((k === 'uniforme' || k === 'det') && used[k]) k = 'lista';
        used[k] = (used[k] || 0) + 1;
        const row = L.map(() => F(0, 1));
        if (k === 'uniforme') { L.forEach((_, j) => row[j] = F(1, n)); texts.push(`Después de una ${X}, la incertidumbre sobre el siguiente mensaje es máxima.`); why.push(`Fila ${X}: incertidumbre máxima → uniforme, 1/${n} en cada columna.`); }
        else if (k === 'rafagaDet') { const LR = pick(r, [2, 3, 4, 5, 8]); const Y = pick(r, others); row[i] = F(LR - 1, LR); row[L.indexOf(Y)] = F(1, LR); texts.push(`Las ${X} aparecen en ráfagas de longitud media ${LR} y siempre van seguidas de una ${Y}.`); why.push(`Fila ${X}: ráfagas de media ${LR} → P${X}${X} = (${LR}−1)/${LR} = ${row[i]}; toda la salida va a ${Y}: P${X}${Y} = 1/${LR}.`); }
        else if (k === 'rafagaEq') { const LR = pick(r, [2, 3, 4, 5]); row[i] = F(LR - 1, LR); others.forEach(Y => row[L.indexOf(Y)] = F(1, LR * (n - 1))); texts.push(`Las ${X} forman ráfagas de longitud media ${LR}; al terminar la ráfaga aparece cualquiera de los otros mensajes con la misma probabilidad.`); why.push(`Fila ${X}: P${X}${X} = ${row[i]} y la salida 1/${LR} se reparte entre ${n - 1}: ${F(1, LR * (n - 1))} a cada uno.`); }
        else if (k === 'noRepiteDoble') { const Y = pick(r, others); const rest = others.filter(z => z !== Y); const tot = 2 + rest.length; row[L.indexOf(Y)] = F(2, tot); rest.forEach(z => row[L.indexOf(z)] = F(1, tot)); texts.push(`Los mensajes ${X} nunca se repiten, y tras una ${X} se observa ${Y} con el doble de probabilidad que ${rest.join(' y ')}.`); why.push(`Fila ${X}: P${X}${X} = 0; ${rest.map(z => 'P' + X + z).join(' = ')} = x y P${X}${Y} = 2x → ${tot}x = 1 → x = 1/${tot}.`); }
        else if (k === 'det') { const Y = pick(r, others); row[L.indexOf(Y)] = F(1, 1); texts.push(`Después de una ${X} siempre aparece una ${Y}.`); why.push(`Fila ${X}: P${X}${Y} = 1 y el resto 0.`); }
        else if (k === 'nunca') { const Y = pick(r, L); const rest = L.filter(z => z !== Y); rest.forEach(z => row[L.indexOf(z)] = F(1, n - 1)); texts.push(`Después de una ${X} nunca aparece ${Y === X ? 'otra ' + X : 'una ' + Y}, y el resto de mensajes son equiprobables.`); why.push(`Fila ${X}: P${X}${Y} = 0 y 1/${n - 1} para los otros ${n - 1}.`); }
        else { const rr = randRow(r, n, 8); rr.forEach((v, j) => row[j] = v); texts.push(`Después de una ${X} aparecen ${L.join(', ')} con probabilidades (${rr.map(String).join(', ')}).`); why.push(`Fila ${X}: la da el enunciado.`); }
        rows.push(row);
      }
      if ((used.lista || 0) > 1) continue;
      const c = TI.classify(rows); if (!c.irreducible || c.period !== 1) continue;
      const mk = TI.markov(rows, { labels: L });
      return { statement: `<p>Una fuente genera los mensajes ${L.join(', ')}. Tras observarla se concluye:</p><ul>${texts.map(t => `<li>${t}</li>`).join('')}</ul><p>Escribe la matriz con una fila por línea (vale <span class="mono">1/4</span> o <span class="mono">0,25</span>).</p>`,
        qs: [{ label: 'Matriz de transición Π', ans: rows, kind: 'matrix' }, { label: `μE (${L.join(', ')})`, ans: mk.muN, kind: 'list', tol: 0.006 }, { label: 'Tasa de entropía (bits/símbolo)', ans: mk.rate, tol: 0.006 }, { label: 'H(μE) (bits)', ans: mk.Hmu, tol: 0.006 }],
        sol: `<ul class="small">${why.map(w => `<li>${w}</li>`).join('')}</ul><div data-widget="markov" data-matrix="${mstrOf(rows)}" data-labels="${L.join(' ')}"></div>` };
    }
    return GEN.markovmatriz.make(r);
  } };

  GEN.cadena = { title: 'Codificar una cadena por transiciones', lesson: 'tasa', make(r) {
    const n = r() < 0.5 ? 3 : 4; const M = genMatrix(r, n); const L = 'ABCD'.slice(0, n).split('');
    const mk = TI.markov(M, { labels: L }); const fl = Math.ceil(Math.log2(n)); const first = L.map((_, i) => i.toString(2).padStart(fl, '0'));
    let s = TI.randInt(r, 0, n - 1); const seq = [s];
    for (let k = 1; k < 8; k++) { const u = r(); let acc = 0, nx = 0; for (let j = 0; j < n; j++) { acc += M[s][j].num(); if (u < acc) { nx = j; break; } nx = j; } if (M[s][nx].isZero()) { nx = M[s].findIndex(v => !v.isZero()); } seq.push(nx); s = nx; }
    const str = seq.map(i => L[i]).join('');
    const parts = TI.encodeTransitions(str, L, mk.rowCodes, first);
    const codeTbl = tbl(['Desde', ...L.map(l => '→ ' + l)], M.map((r2, i) => [L[i], ...r2.map((_, j) => cw(mk.rowCodes[i].codes[j]))]));
    return { statement: `<p>Fuente de Markov con estados ${L.join(', ')}. El primer símbolo se codifica con ${fl} bits fijos (${L.map((l, i) => `${l} = ${first[i]}`).join(', ')}) y el resto con estos códigos por transición:</p>${codeTbl}<p>Codifica la cadena <b class="mono">${str}</b>.</p>`,
      qs: [{ label: 'Cadena de bits', ans: parts.map(p => p.code).join(''), kind: 'bits' }],
      sol: `<p class="bits-out">${parts.map(p => `<span class="seg">${p.code || '∅'}</span>`).join('')}</p><p class="small">${parts.map(p => p.from ? `${p.from}→${p.to}: ${p.code || '(nada)'}` : `${p.to}: ${p.code}`).join(' · ')}</p>` };
  } };

  GEN.rle = { title: 'RLE: ráfagas', lesson: 'rle', make(r) {
    const LR = pick(r, [3, 4, 5, 6, 8, 10, 12, 16, 20]); const q = TI.rle({ LR }); const l = TI.randInt(r, 1, 3 * q.m + 1);
    return { statement: `<p>En una fuente de Markov, el símbolo B aparece en ráfagas de longitud media ${LR} y siempre va seguido de una A. Codifica las ráfagas con RLE.</p>`,
      qs: [{ label: 'Probabilidad de repetición p', ans: q.p, tol: 0.002 }, { label: 'm (entero con p^m ≈ 1/2)', ans: q.m, tol: 0 }, { label: 'Longitud media del preámbulo (bits/ráfaga)', ans: q.LG, tol: 0.01 }, { label: 'Bits por símbolo B (L_RLE / L_R)', ans: q.perSym, tol: 0.006 }, { label: `Palabra para una ráfaga de longitud ${l}`, ans: TI.rleCode(l, q.m, q.subCodes), kind: 'bits' }],
      sol: `<div data-widget="rle" data-lr="${LR}"></div><p class="small">Para la palabra uso el resto con código canónico (las palabras más cortas para los restos pequeños), como en la tabla de clase.</p>` };
  } };

  const GEN_GROUPS = [['Fuentes sin memoria', ['huffman2', 'huffman3', 'fano', 'shannon', 'sfe']], ['Entropía y códigos', ['entropia', 'conjunta', 'kraft', 'tipos']], ['Fuentes con memoria', ['markovtexto', 'markovmatriz', 'cadena', 'rle']]];

  PAGES.practica = (kind) => {
    const stats = store.get('stats', {});
    if (!kind || !GEN[kind]) {
      return `<div class="page"><header class="sec"><span class="eyebrow">Practica</span><h1>Ejercicios con corrección</h1><p class="lead">Cada ejercicio se genera con números nuevos. Escribe tus resultados (vale coma decimal y fracciones), pulsa Comprobar y mira la solución paso a paso.</p></header>
        ${GEN_GROUPS.map(([g, ks]) => `<section class="sec"><h3>${g}</h3><div class="grid2">${ks.map(k => { const s = stats[k] || { ok: 0, tot: 0 }; return `<a class="tile" href="#/practica/${k}"><span class="t-eyebrow">${s.tot ? `${s.ok}/${s.tot} bien` : 'sin hacer'}</span><b>${GEN[k].title}</b><span class="small muted">Lección: ${(C.lessons.find(l => l.id === GEN[k].lesson) || {}).title || ''}</span></a>`; }).join('')}</div></section>`).join('')}</div>`;
    }
    return `<div class="page"><header class="sec"><span class="eyebrow"><a href="#/practica">Practica</a></span><h1>${GEN[kind].title}</h1></header><div id="exArea"></div></div>`;
  };

  function parseNumIn(s) { try { const t = String(s).trim().replace('%', '').replace(/\s/g, ''); if (!t) return NaN; return TI.Frac.parse(t).num(); } catch (e) { return NaN; } }
  function checkQ(q, raw) {
    if (q.kind === 'choice') return raw === q.ans;
    if (q.kind === 'codes') return String(raw).trim().split(/[\s,;]+/).join(' ') === q.ans;
    if (q.kind === 'bits') return String(raw).replace(/[^012]/g, '') === q.ans;
    if (q.kind === 'list') { try { const v = TI.parseList(raw).map(f => f.num()); return v.length === q.ans.length && v.every((x, i) => Math.abs(x - q.ans[i]) <= q.tol); } catch (e) { return false; } }
    if (q.kind === 'matrix') { try { const M = TI.parseMatrix(raw); return M.length === q.ans.length && M.every((r2, i) => r2.length === q.ans[i].length && r2.every((v, j) => Math.abs(v.num() - q.ans[i][j].num()) < 1e-6)); } catch (e) { return false; } }
    const v = parseNumIn(raw); return isFinite(v) && Math.abs(v - q.ans) <= (q.tol || 0) + 1e-9;
  }
  const ansText = q => {
    if (q.kind === 'choice') return q.opts.find(o => o[0] === q.ans)[1];
    if (q.kind === 'list') return q.ans.map(x => fmt(x, 4)).join('; ');
    if (q.kind === 'matrix') return q.ans.map(r2 => r2.map(String).join(' ')).join(' | ');
    if (typeof q.ans === 'number') return fmt(q.ans, 4);
    return q.ans;
  };
  function practiceInit(root, kind) {
    if (!GEN[kind]) return;
    const area = $('#exArea', root);
    const fresh = () => {
      const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
      const ex = GEN[kind].make(TI.rng(seed));
      area.innerHTML = `<div class="statement">${ex.statement}</div>
        <div class="panel"><div class="q-list">${ex.qs.map((q, i) => `<div class="q"><label for="pq-${i}">${q.label}</label>${q.kind === 'choice' ? `<select id="pq-${i}"><option value="">Elige…</option>${q.opts.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select>` : q.kind === 'matrix' ? `<textarea id="pq-${i}" spellcheck="false" placeholder="1/4 1/4 1/2\n..."></textarea>` : `<input type="text" class="mono" id="pq-${i}" autocomplete="off" spellcheck="false">`}<span class="mark" id="pm-${i}"></span></div>`).join('')}</div>
        <div class="row"><button class="btn pri" type="button" id="pCheck">Comprobar</button><button class="btn" type="button" id="pSol">Ver solución</button><button class="btn" type="button" id="pNew">Otro ejercicio</button><span class="score" id="pScore"></span></div>
        <div id="pFeedback"></div></div>
        <div class="example" id="pSolBox" hidden><span class="lbl">Solución</span>${ex.sol}</div>`;
      let counted = false;
      $('#pCheck', area).onclick = () => {
        let ok = 0; const fb = [];
        ex.qs.forEach((q, i) => { const v = $('#pq-' + i, area).value; const good = checkQ(q, v); if (good) ok++; else fb.push(`<li>${q.label}: ${v.trim() ? 'no coincide' : 'sin contestar'}.</li>`); const m = $('#pm-' + i, area); m.textContent = good ? '✓' : '✗'; m.className = 'mark ' + (good ? 'ok' : 'no'); });
        $('#pScore', area).textContent = `${ok}/${ex.qs.length} correctas`;
        $('#pFeedback', area).innerHTML = fb.length ? `<ul class="small">${fb.join('')}</ul><p class="small muted">Revisa y vuelve a comprobar, o abre la solución.</p>` : '<p class="pill ok">Todo correcto</p>';
        if (!counted) { counted = true; const s = store.get('stats', {}); const k = s[kind] || { ok: 0, tot: 0 }; k.tot++; if (ok === ex.qs.length) k.ok++; s[kind] = k; store.set('stats', s); }
      };
      $('#pSol', area).onclick = () => {
        const box = $('#pSolBox', area); box.hidden = false;
        if (!box.dataset.ans) { box.dataset.ans = '1'; box.insertAdjacentHTML('afterbegin', `<div class="kv">${ex.qs.map(q => `<div><span>${q.label}</span><b>${esc(ansText(q))}</b></div>`).join('')}</div>`); }
        mountAll(box); typeset(box);
      };
      $('#pNew', area).onclick = fresh;
      typeset(area);
    };
    fresh();
  }

  /* ---------- Router ---------- */
  function route() {
    const h = (location.hash || '#/inicio').replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean); if (!parts.length) parts.push('inicio');
    const page = PAGES[parts[0]] ? parts[0] : 'inicio';
    const view = $('#view');
    view.innerHTML = PAGES[page](parts[1]);
    $('#side').innerHTML = navHTML([page, ...parts.slice(1)]);
    const crumbs = { inicio: 'Inicio', aprende: 'Aprende', calc: 'Calculadoras', practica: 'Practica', examenes: 'Exámenes', teoria: 'Test de teoría', chuleta: 'Chuleta' };
    const t = $('h1', view); $('#crumb').textContent = crumbs[page] + (t && page !== 'inicio' ? ' · ' + t.textContent : '');
    if (page === 'calc') {
      $$('[data-calc]', view).forEach(el => { const w = el.dataset.calc; const st = Object.assign({}, CALC_DEFAULTS[w] || {}, store.get('calc:' + w, {})); delete st._id; mountWidget(el, w, st, { persist: w }); });
    }
    if (page === 'teoria') theoryInit(view);
    if (page === 'examenes') examInit(view);
    if (page === 'practica') practiceInit(view, parts[1]);
    if (page === 'inicio') $$('[data-plan]', view).forEach(cb => cb.onchange = () => { const d = store.get('plan', {}); d[cb.dataset.plan] = cb.checked; store.set('plan', d); cb.closest('.todo').classList.toggle('done', cb.checked); });
    mountAll(view);
    typeset(view);
    wireSide();
    closeSide();
    window.scrollTo(0, 0);
  }

  /* ---------- Tema, menú, cuenta atrás ---------- */
  function applyTheme() {
    const t = store.get('theme', 'system');
    if (t === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    const l = $('#themeLbl'); if (l) l.textContent = { system: 'sistema', light: 'claro', dark: 'oscuro' }[t];
  }
  function wireSide() {
    const b = $('#themeBtn'); if (b) b.onclick = () => { const order = ['system', 'light', 'dark']; const t = store.get('theme', 'system'); store.set('theme', order[(order.indexOf(t) + 1) % 3]); applyTheme(); };
    applyTheme();
  }
  function closeSide() { $('#side').classList.remove('open'); const s = $('.scrim'); if (s) s.remove(); }
  $('#menuBtn').onclick = () => { const side = $('#side'); side.classList.add('open'); const s = document.createElement('div'); s.className = 'scrim'; s.onclick = closeSide; document.body.appendChild(s); };
  function tick() {
    const ms = EXAM_DATE - new Date(); const el = $('#countdown');
    if (ms <= 0) { el.innerHTML = '<b>¡Hoy es el examen!</b>'; return; }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
    el.innerHTML = `Examen en <b>${d} d ${h} h ${m} min</b>`;
  }
  tick(); setInterval(tick, 30000);
  window.addEventListener('hashchange', route);
  route();
})();
