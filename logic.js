/* Núcleo de cálculo de Teoría de la Información (entropía, códigos, Markov, RLE).
   Funciona en navegador (window.TI) y en Node (module.exports). */
(function (root) {
  'use strict';
  const TI = {};
  const EPS = 1e-9;

  /* ---------- Fracciones exactas (BigInt) ---------- */
  function bgcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; }
  class Frac {
    constructor(n, d = 1n) {
      n = BigInt(n); d = BigInt(d);
      if (d === 0n) throw new Error('División por cero');
      if (d < 0n) { n = -n; d = -d; }
      const g = bgcd(n, d) || 1n;
      this.n = n / g; this.d = d / g;
    }
    add(o) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { return new Frac(this.n * o.n, this.d * o.d); }
    div(o) { return new Frac(this.n * o.d, this.d * o.n); }
    neg() { return new Frac(-this.n, this.d); }
    isZero() { return this.n === 0n; }
    cmp(o) { const x = this.n * o.d - o.n * this.d; return x < 0n ? -1 : x > 0n ? 1 : 0; }
    eq(o) { return this.cmp(o) === 0; }
    num() { return Number(this.n) / Number(this.d); }
    toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
    static of(x) {
      if (x instanceof Frac) return x;
      if (typeof x === 'number') return Frac.parse(String(x));
      return Frac.parse(x);
    }
    static parse(s) {
      s = String(s).trim().replace(',', '.');
      if (!s) throw new Error('Valor vacío');
      if (s.includes('/')) {
        const [a, b] = s.split('/');
        return Frac.parse(a).div(Frac.parse(b));
      }
      if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) throw new Error(`"${s}" no es un número`);
      let [mant, exp] = s.toLowerCase().split('e');
      exp = exp ? parseInt(exp, 10) : 0;
      let neg = false;
      if (mant[0] === '-' || mant[0] === '+') { neg = mant[0] === '-'; mant = mant.slice(1); }
      let [ip, fp = ''] = mant.split('.');
      let n = BigInt((ip || '0') + fp);
      let d = 10n ** BigInt(fp.length);
      if (exp > 0) n *= 10n ** BigInt(exp); else if (exp < 0) d *= 10n ** BigInt(-exp);
      return new Frac(neg ? -n : n, d);
    }
  }
  TI.Frac = Frac;
  const F0 = new Frac(0n), F1 = new Frac(1n);

  /* ---------- Utilidades numéricas ---------- */
  TI.log = (x, b = 2) => Math.log(x) / Math.log(b);
  TI.fmt = (x, d = 4) => {
    if (!isFinite(x)) return '∞';
    const r = Math.round(x * 10 ** d) / 10 ** d;
    return r.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d });
  };
  TI.H = (ps, b = 2) => ps.reduce((s, p) => (p > EPS ? s - p * TI.log(p, b) : s), 0);
  TI.info = (p, b = 2) => -TI.log(p, b);
  TI.unitName = (D) => ({ 2: 'bits', 3: 'trits', 10: 'dits' }[D] || `${D}-its`);
  TI.symName = (D) => ({ 2: 'sb', 3: 'st' }[D] || `s${D}`);

  /* Lee una lista de probabilidades: "0,3 0,2 0,5", "0.3, 0.2, 0.5", "1/4 1/2 1/4" */
  TI.parseList = function (text) {
    let s = String(text).trim().replace(/[{}()[\]]/g, ' ');
    if (!s) return [];
    let toks = s.split(/[\s;]+/).filter(Boolean);
    if (toks.length === 1 && toks[0].includes(',') && !toks[0].includes('.')) {
      // "0,3,0,2" es ambiguo; "0.3,0.2" no. Con una sola pieza y comas, separamos por coma
      toks = toks[0].split(',');
    } else if (toks.some(t => /,.*,/.test(t) || /\d\.\d*,/.test(t))) {
      toks = s.split(/[\s;,]+/).filter(Boolean);
    } else {
      toks = toks.flatMap(t => (t.endsWith(',') ? [t.slice(0, -1)] : [t]));
    }
    return toks.map(t => Frac.parse(t));
  };
  TI.parseLabels = function (text, n) {
    const toks = String(text || '').trim().split(/[\s,;]+/).filter(Boolean);
    const out = [];
    for (let i = 0; i < n; i++) out.push(toks[i] || (n <= 26 ? String.fromCharCode(65 + i) : 'x' + (i + 1)));
    return out;
  };
  TI.normalize = function (fracs) {
    const s = fracs.reduce((a, b) => a.add(b), F0);
    if (s.isZero()) throw new Error('Las probabilidades suman 0');
    return { probs: fracs.map(f => f.div(s)), sum: s, wasNormalized: !s.eq(F1) };
  };

  /* ---------- Expansión D-aria de una fracción en [0,1) ---------- */
  TI.expand = function (frac, D, digits) {
    let x = Frac.of(frac); const Df = new Frac(BigInt(D));
    let out = '';
    for (let i = 0; i < digits; i++) {
      x = x.mul(Df);
      const dgt = x.n / x.d; // parte entera
      out += dgt.toString(D);
      x = x.sub(new Frac(dgt));
    }
    return { digits: out, exact: x.isZero() };
  };

  /* ---------- Huffman D-ario con pasos (convención de clase) ----------
     - Se ordena de mayor a menor.
     - Se agrupan los D menores; el de arriba recibe 0, el siguiente 1, ...
     - tie: 'arriba' coloca el nodo agrupado lo más arriba posible entre empates,
            'abajo' lo más abajo. Son el "grado de libertad" del algoritmo. */
  TI.huffman = function (probsIn, D = 2, opts = {}) {
    const tie = opts.tie || 'arriba';
    const labels = opts.labels || probsIn.map((_, i) => String.fromCharCode(65 + i));
    const ps = probsIn.map(p => (p instanceof Frac ? p.num() : Number(p)));
    let leaves = ps.map((p, i) => ({ p, label: labels[i], idx: i, kids: null }));
    const active = leaves.filter(l => l.p > EPS);
    const zeroIdx = leaves.filter(l => l.p <= EPS).map(l => l.idx);
    const codes = new Array(ps.length).fill(null);
    let ghosts = 0;
    if (active.length === 0) return { codes, lengths: codes.map(() => null), stages: [], ghosts, L: 0, D };
    if (active.length === 1) {
      codes[active[0].idx] = '';
      return { codes, lengths: codes.map(c => (c === null ? null : c.length)), stages: [], ghosts, L: 0, D, single: true, zeroIdx };
    }
    const n = active.length;
    if (D > 2) ghosts = (D - 1 - ((n - 1) % (D - 1))) % (D - 1);
    let list = active.slice();
    for (let g = 0; g < ghosts; g++) list.push({ p: 0, label: 'Z' + (ghosts > 1 ? g + 1 : ''), idx: -1 - g, kids: null, ghost: true });
    // orden estable de mayor a menor
    list = list.map((x, k) => ({ x, k })).sort((a, b) => (b.x.p - a.x.p) || (a.k - b.k)).map(o => o.x);
    const stages = [];
    let uid = 0;
    list.forEach(x => (x.uid = uid++));
    while (list.length > 1) {
      const take = list.slice(list.length - D);
      const rest = list.slice(0, list.length - D);
      const node = { p: take.reduce((s, x) => s + x.p, 0), kids: take, label: take.map(t => t.label).join(''), uid: uid++ };
      stages.push({ items: list.map(x => ({ p: x.p, uid: x.uid, label: x.label, ghost: !!x.ghost })), merged: take.map(t => t.uid), newUid: node.uid });
      // insertar
      let pos;
      if (tie === 'arriba') { pos = rest.findIndex(x => x.p <= node.p + EPS); if (pos < 0) pos = rest.length; }
      else { pos = rest.length; for (let i = rest.length - 1; i >= 0; i--) { if (rest[i].p >= node.p - EPS) { pos = i + 1; break; } pos = i; } }
      rest.splice(pos, 0, node);
      list = rest;
    }
    stages.push({ items: list.map(x => ({ p: x.p, uid: x.uid, label: x.label })), merged: [], final: true });
    const ghostCodes = [];
    (function walk(node, pre) {
      if (!node.kids) { if (node.ghost) ghostCodes.push({ label: node.label, code: pre }); else codes[node.idx] = pre; return; }
      node.kids.forEach((k, i) => walk(k, pre + i.toString(D)));
    })(list[0], '');
    // códigos de cada nodo (para mostrar la vuelta atrás)
    const nodeCode = {};
    (function walk2(node, pre) { nodeCode[node.uid] = pre; if (node.kids) node.kids.forEach((k, i) => walk2(k, pre + i.toString(D))); })(list[0], '');
    const lengths = codes.map(c => (c === null ? null : c.length));
    const L = ps.reduce((s, p, i) => s + (codes[i] === null ? 0 : p * codes[i].length), 0);
    return { codes, lengths, stages, ghosts, ghostCodes, L, D, nodeCode, zeroIdx };
  };

  /* Código canónico a partir de longitudes (las más cortas primero, en orden) */
  TI.canonical = function (lengths, D = 2) {
    const order = lengths.map((l, i) => ({ l, i })).filter(o => o.l !== null).sort((a, b) => a.l - b.l || a.i - b.i);
    const codes = new Array(lengths.length).fill(null);
    let code = 0n, prevLen = order.length ? order[0].l : 0;
    const Db = BigInt(D);
    order.forEach((o, k) => {
      if (k > 0) { code = (code + 1n) * Db ** BigInt(o.l - prevLen); }
      else code = 0n;
      prevLen = o.l;
      codes[o.i] = o.l === 0 ? '' : code.toString(D).padStart(o.l, '0');
    });
    return codes;
  };

  /* ---------- Fano binario (por defecto conserva el orden: alfabético) ---------- */
  TI.fano = function (probsIn, opts = {}) {
    const labels = opts.labels || probsIn.map((_, i) => String.fromCharCode(65 + i));
    const ps = probsIn.map(p => (p instanceof Frac ? p.num() : Number(p)));
    let items = ps.map((p, i) => ({ p, i, label: labels[i] }));
    if (opts.sort) items = items.slice().sort((a, b) => b.p - a.p || a.i - b.i);
    const codes = new Array(ps.length).fill('');
    const splits = [];
    let ambiguous = false;
    (function rec(group, pre, depth) {
      if (group.length <= 1) { if (group.length) codes[group[0].i] = pre || '0'; return; }
      const tot = group.reduce((s, x) => s + x.p, 0);
      let best = 1, bestDiff = Infinity, acc = 0; const cum = [], diffs = [];
      for (let k = 1; k < group.length; k++) {
        acc += group[k - 1].p; cum.push(acc);
        const diff = Math.abs(2 * acc - tot); diffs.push(diff);
        if (diff < bestDiff - EPS || (opts.tie === 'abajo' && Math.abs(diff - bestDiff) < 1e-7)) { bestDiff = diff; best = k; }
      }
      if (diffs.filter(d => Math.abs(d - bestDiff) < 1e-7).length > 1) ambiguous = true;
      const A = group.slice(0, best), B = group.slice(best);
      const sa = A.reduce((s, x) => s + x.p, 0), sb = tot - sa;
      splits.push({ depth, prefix: pre, group: group.map(x => x.label), cum, tot, cut: best, left: A.map(x => x.label), right: B.map(x => x.label), pl: sa, pr: sb });
      rec(A, pre + '0', depth + 1); rec(B, pre + '1', depth + 1);
    })(items, '', 0);
    const lengths = codes.map(c => c.length);
    const L = ps.reduce((s, p, i) => s + p * lengths[i], 0);
    return { codes, lengths, L, splits, order: items.map(x => x.i), ambiguous };
  };

  /* ---------- Código de Shannon: l = ⌈log_D 1/p⌉, palabra = expansión de F acumulada ---------- */
  TI.shannon = function (probsIn, D = 2, opts = {}) {
    const labels = opts.labels || probsIn.map((_, i) => String.fromCharCode(65 + i));
    const fr = probsIn.map(Frac.of);
    const order = fr.map((f, i) => ({ f, i })).filter(o => !o.f.isZero()).sort((a, b) => b.f.cmp(a.f) || a.i - b.i);
    const codes = new Array(fr.length).fill(null), lengths = new Array(fr.length).fill(null);
    const rows = [];
    let F = F0;
    order.forEach(o => {
      const p = o.f.num();
      const l = Math.max(1, Math.ceil(TI.log(1 / p, D) - EPS));
      const ex = TI.expand(F, D, l);
      codes[o.i] = ex.digits; lengths[o.i] = l;
      rows.push({ i: o.i, label: labels[o.i], p, F: F.num(), Ffrac: F, info: TI.log(1 / p, D), l, code: ex.digits });
      F = F.add(o.f);
    });
    const L = order.reduce((s, o) => s + o.f.num() * lengths[o.i], 0);
    return { codes, lengths, L, rows, D };
  };

  /* ---------- Shannon-Fano-Elias: F̄ = F(x-1) + p/2, l = ⌈log 1/p⌉ + 1 ---------- */
  TI.sfe = function (probsIn, opts = {}) {
    const labels = opts.labels || probsIn.map((_, i) => String.fromCharCode(65 + i));
    const fr = probsIn.map(Frac.of);
    const half = new Frac(1n, 2n);
    let F = F0; const rows = []; const codes = [], lengths = [];
    fr.forEach((f, i) => {
      const Fbar = F.add(f.mul(half));
      const p = f.num();
      const l = Math.ceil(TI.log(1 / p, 2) - EPS) + 1;
      const ex = TI.expand(Fbar, 2, Math.max(l, 8));
      codes.push(ex.digits.slice(0, l)); lengths.push(l);
      F = F.add(f);
      rows.push({ i, label: labels[i], p, F: F.num(), Fbar: Fbar.num(), bin: ex.digits, exact: ex.exact, l, code: ex.digits.slice(0, l) });
    });
    const L = fr.reduce((s, f, i) => s + f.num() * lengths[i], 0);
    return { codes, lengths, L, rows };
  };

  /* ---------- Propiedades de códigos ---------- */
  TI.isPrefixFree = function (codes) {
    const c = codes.filter(x => x !== null && x !== undefined);
    for (let i = 0; i < c.length; i++) for (let j = 0; j < c.length; j++) if (i !== j && c[j].startsWith(c[i])) return false;
    return true;
  };
  TI.kraft = (lengths, D = 2) => lengths.filter(l => l !== null).reduce((s, l) => s + Math.pow(D, -l), 0);
  /* Recortar: quitar el último dígito mientras el código siga siendo prefijo */
  TI.trim = function (codesIn) {
    const codes = codesIn.slice(); const changes = [];
    let changed = true;
    while (changed) {
      changed = false;
      const order = codes.map((c, i) => ({ c, i })).filter(o => o.c && o.c.length > 1).sort((a, b) => b.c.length - a.c.length || a.i - b.i);
      for (const o of order) {
        const cand = o.c.slice(0, -1);
        const test = codes.slice(); test[o.i] = cand;
        if (TI.isPrefixFree(test) && new Set(test.filter(Boolean)).size === test.filter(Boolean).length) {
          changes.push({ i: o.i, from: o.c, to: cand }); codes[o.i] = cand; changed = true; break;
        }
      }
    }
    return { codes, changes };
  };
  /* Sardinas-Patterson: devuelve los conjuntos de sufijos colgantes */
  TI.sardinas = function (codesIn) {
    const C = [...new Set(codesIn.filter(Boolean))];
    if (C.length !== codesIn.filter(Boolean).length) return { ud: false, singular: true, sets: [] };
    const dangling = (A, B) => { const out = new Set(); for (const u of A) for (const v of B) if (u !== v && v.startsWith(u)) out.add(v.slice(u.length)); return out; };
    const sets = []; const seen = new Set();
    let S = dangling(C, C);
    for (let it = 0; it < 50 && S.size; it++) {
      const arr = [...S].sort();
      sets.push(arr);
      if (arr.some(w => C.includes(w))) return { ud: false, singular: false, sets, culprit: arr.find(w => C.includes(w)) };
      const key = arr.join('|');
      if (seen.has(key)) break; seen.add(key);
      const next = new Set([...dangling(C, S), ...dangling(S, C)]);
      S = next;
    }
    return { ud: true, singular: false, sets };
  };
  TI.classifyCode = function (codes) {
    const c = codes.filter(Boolean);
    if (new Set(c).size !== c.length) return 'singular';
    if (TI.isPrefixFree(c)) return 'prefijo';
    return TI.sardinas(c).ud ? 'ud' : 'nosingular';
  };

  /* ---------- Entropía conjunta / información mutua ---------- */
  TI.joint = function (M) {
    const P = M.map(r => r.map(x => (x instanceof Frac ? x.num() : Number(x))));
    const tot = P.flat().reduce((a, b) => a + b, 0);
    const px = P.map(r => r.reduce((a, b) => a + b, 0));          // filas = X
    const py = P[0].map((_, j) => P.reduce((s, r) => s + r[j], 0)); // columnas = Y
    const HXY = TI.H(P.flat()), HX = TI.H(px), HY = TI.H(py);
    const HYgX = px.reduce((s, p, i) => s + (p > EPS ? p * TI.H(P[i].map(v => v / p)) : 0), 0);
    const HXgY = py.reduce((s, p, j) => s + (p > EPS ? p * TI.H(P.map(r => r[j] / p)) : 0), 0);
    return { tot, px, py, HXY, HX, HY, HYgX, HXgY, I: HX + HY - HXY };
  };
  TI.kl = (p, q, b = 2) => p.reduce((s, pi, i) => (pi > EPS ? s + pi * TI.log(pi / q[i], b) : s), 0);

  /* ---------- Cadenas de Markov ---------- */
  TI.parseMatrix = function (text, square = true) {
    const rows = String(text).trim().split(/\n|;|\|/).map(r => r.trim()).filter(Boolean);
    const M = rows.map(r => TI.parseList(r));
    const n = M.length;
    if (!n) throw new Error('Escribe la matriz, una fila por línea');
    if (square) M.forEach((r, i) => { if (r.length !== n) throw new Error(`La fila ${i + 1} tiene ${r.length} valores y la matriz debería ser ${n}×${n}`); });
    return M;
  };
  TI.checkStochastic = function (M) {
    const bad = [];
    M.forEach((r, i) => { const s = r.reduce((a, b) => a.add(b), F0); if (!s.eq(F1)) bad.push({ row: i, sum: s }); });
    return bad;
  };
  TI.reach = function (M) {
    const n = M.length; const R = [];
    for (let s = 0; s < n; s++) {
      const seen = new Array(n).fill(false); const st = [s];
      while (st.length) { const u = st.pop(); for (let v = 0; v < n; v++) if (!M[u][v].isZero() && !seen[v]) { seen[v] = true; st.push(v); } }
      R.push(seen);
    }
    return R;
  };
  TI.classify = function (M) {
    const n = M.length; const R = TI.reach(M);
    const irreducible = R.every(row => row.every(Boolean));
    // clases comunicantes
    const cls = []; const assigned = new Array(n).fill(-1);
    for (let i = 0; i < n; i++) {
      if (assigned[i] >= 0) continue;
      const c = []; for (let j = 0; j < n; j++) if ((i === j || (R[i][j] && R[j][i])) && assigned[j] < 0) { c.push(j); assigned[j] = cls.length; }
      cls.push(c);
    }
    const closed = cls.map(c => c.every(i => { for (let v = 0; v < n; v++) if (!M[i][v].isZero() && !c.includes(v)) return false; return true; }));
    const transient = []; cls.forEach((c, k) => { if (!closed[k]) transient.push(...c); });
    // periodo (de la clase de cada estado)
    const period = (states) => {
      const lvl = {}; lvl[states[0]] = 0; const q = [states[0]];
      while (q.length) { const u = q.shift(); for (const v of states) if (!M[u][v].isZero() && lvl[v] === undefined) { lvl[v] = lvl[u] + 1; q.push(v); } }
      let g = 0; const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
      for (const u of states) for (const v of states) if (!M[u][v].isZero() && lvl[u] !== undefined && lvl[v] !== undefined) g = gcd(g, lvl[u] + 1 - lvl[v]);
      return g || 0;
    };
    const periods = cls.map(period);
    const per = irreducible ? periods[0] : null;
    const selfLoops = M.map((r, i) => !r[i].isZero());
    return { irreducible, classes: cls, closed, transient, period: per, periods, aperiodic: irreducible ? per === 1 : null, selfLoops };
  };
  /* Distribución estacionaria exacta: μ = μ·Π, Σμ = 1 */
  TI.stationary = function (M) {
    const n = M.length;
    // Sistema A·μ = b con A filas: ecuaciones j=0..n-2 de (Π^T - I) y la de suma
    const A = []; const b = [];
    for (let j = 0; j < n - 1; j++) {
      A.push(M.map((row, i) => (i === j ? row[j].sub(F1) : row[j])));
      b.push(F0);
    }
    A.push(new Array(n).fill(F1)); b.push(F1);
    // Gauss-Jordan
    const Ab = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let piv = -1; for (let r = c; r < n; r++) if (!Ab[r][c].isZero()) { piv = r; break; }
      if (piv < 0) return null; // no única
      [Ab[c], Ab[piv]] = [Ab[piv], Ab[c]];
      const pv = Ab[c][c];
      for (let k = c; k <= n; k++) Ab[c][k] = Ab[c][k].div(pv);
      for (let r = 0; r < n; r++) if (r !== c && !Ab[r][c].isZero()) {
        const f = Ab[r][c];
        for (let k = c; k <= n; k++) Ab[r][k] = Ab[r][k].sub(f.mul(Ab[c][k]));
      }
    }
    return Ab.map(r => r[n]);
  };
  TI.matPow = function (M, k) {
    const P = M.map(r => r.map(x => (x instanceof Frac ? x.num() : x)));
    const n = P.length;
    let R = P.map((_, i) => P.map((__, j) => (i === j ? 1 : 0)));
    for (let t = 0; t < k; t++) R = R.map(row => P[0].map((_, j) => row.reduce((s, v, m) => s + v * P[m][j], 0)));
    return R;
  };
  TI.evolve = function (M, mu1, steps) {
    const P = M.map(r => r.map(x => x.num()));
    let mu = mu1.map(x => (x instanceof Frac ? x.num() : x)); const out = [mu];
    for (let s = 1; s < steps; s++) { mu = P[0].map((_, j) => mu.reduce((acc, v, i) => acc + v * P[i][j], 0)); out.push(mu); }
    return out;
  };
  TI.markov = function (M, opts = {}) {
    const labels = opts.labels || M.map((_, i) => String.fromCharCode(65 + i));
    const cls = TI.classify(M);
    const mu = TI.stationary(M);
    const rowsH = M.map(r => TI.H(r.map(x => x.num())));
    const muN = mu ? mu.map(x => x.num()) : null;
    const rate = muN ? muN.reduce((s, m, i) => s + m * rowsH[i], 0) : null;
    const Hmu = muN ? TI.H(muN) : null;
    const rowCodes = M.map(r => TI.huffman(r, 2, { labels, tie: opts.tie }));
    const Lrows = rowCodes.map(h => h.L);
    const Ltrans = muN ? muN.reduce((s, m, i) => s + m * Lrows[i], 0) : null;
    const stateCode = muN ? TI.huffman(muN, 2, { labels, tie: opts.tie }) : null;
    return { labels, cls, mu, muN, rowsH, rate, Hmu, rowCodes, Lrows, Ltrans, stateCode };
  };
  /* Codificar una secuencia por transiciones */
  TI.encodeTransitions = function (seq, labels, rowCodes, firstCodes) {
    const idx = [...seq].map(ch => labels.indexOf(ch));
    if (idx.some(i => i < 0)) throw new Error('La cadena contiene símbolos que no están en el alfabeto');
    const parts = [];
    parts.push({ from: null, to: labels[idx[0]], code: firstCodes ? firstCodes[idx[0]] : '' });
    for (let k = 1; k < idx.length; k++) {
      const c = rowCodes[idx[k - 1]].codes[idx[k]];
      if (c === null) throw new Error(`La transición ${labels[idx[k - 1]]}→${labels[idx[k]]} tiene probabilidad 0: esa cadena es imposible`);
      parts.push({ from: labels[idx[k - 1]], to: labels[idx[k]], code: c });
    }
    return parts;
  };

  /* ---------- RLE / fuentes geométricas ---------- */
  TI.rle = function (opts) {
    let p;
    if (opts.LR !== undefined) p = (opts.LR - 1) / opts.LR; else p = opts.p;
    const LR = 1 / (1 - p);
    const kreal = -1 / TI.log(p, 2);
    const cands = [...new Set([Math.max(1, Math.floor(kreal)), Math.max(1, Math.ceil(kreal))])];
    const scored = cands.map(m => ({ m, pm: Math.pow(p, m), dist: Math.abs(Math.pow(p, m) - 0.5) }));
    let m = opts.m || scored.slice().sort((a, b) => a.dist - b.dist || a.m - b.m)[0].m;
    const pm = Math.pow(p, m);
    const subP = []; for (let r = 0; r < m; r++) subP.push(Math.pow(p, r) * (1 - p) / (1 - pm));
    let subCodes;
    if (m === 1) subCodes = [''];
    else if (opts.fixed) { const b = Math.ceil(Math.log2(m)); subCodes = subP.map((_, r) => r.toString(2).padStart(b, '0')); }
    else { const h = TI.huffman(subP, 2); subCodes = TI.canonical(h.lengths); }
    const LSG = subP.reduce((s, q, r) => s + q * subCodes[r].length, 0);
    const LG = 1 / (1 - pm);
    const Lrun = LG + LSG;
    const perSym = Lrun / LR;
    const Hp = TI.H([p, 1 - p]);
    const maxL = opts.rows || Math.min(40, Math.max(3 * m, 8));
    const table = [];
    for (let l = 1; l <= maxL; l++) {
      const k = Math.floor((l - 1) / m), r = (l - 1) % m;
      table.push({ l, p: (1 - p) * Math.pow(p, l - 1), k, r, pre: '1'.repeat(k) + '0', sub: subCodes[r], code: '1'.repeat(k) + '0' + subCodes[r] });
    }
    return { p, LR, kreal, cands: scored, m, pm, subP, subCodes, LSG, LG, Lrun, perSym, Hp, table, Hrun: Hp / (1 - p) };
  };
  TI.rleCode = function (l, m, subCodes) {
    const k = Math.floor((l - 1) / m), r = (l - 1) % m;
    return '1'.repeat(k) + '0' + subCodes[r];
  };

  /* ---------- Aleatorios (para ejercicios) ---------- */
  TI.rng = function (seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; }; };
  TI.randInt = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  /* Reparte 100 unidades entre n símbolos (múltiplos de step) */
  TI.randDist = function (r, n, step = 1, minU = 2) {
    const units = Math.round(100 / step);
    for (let tries = 0; tries < 500; tries++) {
      const w = Array.from({ length: n }, () => 0.3 + r() * 2);
      const s = w.reduce((a, b) => a + b, 0);
      let u = w.map(x => Math.max(minU, Math.round((x / s) * units)));
      let diff = units - u.reduce((a, b) => a + b, 0);
      let k = 0; while (diff !== 0 && k < 1000) { const i = k % n; if (diff > 0) { u[i]++; diff--; } else if (u[i] > minU) { u[i]--; diff++; } k++; }
      if (diff === 0) return u.map(x => new Frac(BigInt(x * step), 100n));
    }
    return Array.from({ length: n }, () => new Frac(1n, BigInt(n)));
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = TI;
  else root.TI = TI;
})(typeof window !== 'undefined' ? window : globalThis);
