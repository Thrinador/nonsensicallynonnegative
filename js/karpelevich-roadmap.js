/**
 * Interactive explorers for "Inside Karpelevich's Proof · The Roadmap"
 * (karpelevich-proof-roadmap.html).
 *
 * 1. Stage explorer: nine stops, each with input / operation / result.
 * 2. Arc explorer: the stochastic family A_t with last row (1-t, t, 0, 0),
 *    following the upper nonreal root of λ^4 = tλ + (1-t) from i to ω₃
 *    and drawing its invariant polygon conv{1, λ, λ², λ³}.
 *
 * Root selection: factor out the Perron root 1, leaving the cubic
 * x^3 + x^2 + x + (1 - t). Its derivative 3x^2 + 2x + 1 > 0, so it has one
 * real root a ∈ [-1, 0]; the remaining pair has real part -(1+a)/2 and
 * imaginary part ±sqrt(3 + 2a + 3a^2)/2. We take the upper one.
 */
(function () {
    'use strict';

    const NS = 'http://www.w3.org/2000/svg';
    const $ = id => document.getElementById(id);

    function el(tag, attrs = {}, txt) {
        const e = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (txt !== undefined) e.textContent = txt;
        return e;
    }

    function txt(s, x, y, t, size = 12, color = '#607b7e', anchor = 'start') {
        s.append(el('text', {
            x, y, fill: color, 'font-size': size, 'text-anchor': anchor,
            'font-family': 'system-ui,sans-serif'
        }, t));
    }

    // ---------- Stage explorer ----------
    function selectStage(n) {
        for (let i = 1; i <= 9; i++) {
            const b = $('stage-button-' + i), p = $('stage-panel-' + i);
            if (!b || !p) continue;
            b.setAttribute('aria-pressed', String(i === n));
            p.hidden = i !== n;
        }
    }

    // ---------- Arc explorer ----------
    function selectedRoot(t) {
        let lo = -1, hi = 0;
        for (let j = 0; j < 64; j++) {
            const a = (lo + hi) / 2;
            if (a * a * a + a * a + a + 1 - t > 0) hi = a; else lo = a;
        }
        const a = (lo + hi) / 2;
        return [-(1 + a) / 2, Math.sqrt(3 + 2 * a + 3 * a * a) / 2];
    }

    const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];

    function powers(z) {
        const a = [[1, 0]];
        for (let j = 0; j < 4; j++) a.push(mul(a[a.length - 1], z));
        return a;
    }

    const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const pts = a => a.map(p => p.join(',')).join(' ');

    function drawCurve(z) {
        const s = $('arc-curve');
        s.replaceChildren();
        s.append(el('title', {}, 'The selected upper nonreal eigenvalue curve from i to the primitive cubic root of unity'));
        const cp = w => [65 + (w[0] + 0.65) * 425, 269 - (w[1] - 0.7) * 425];
        for (const y of [0.7, 0.8, 0.9, 1]) {
            const yy = 269 - (y - 0.7) * 425;
            s.append(el('line', { x1: 65, y1: yy, x2: 390, y2: yy, stroke: '#e0e7df' }));
            txt(s, 53, yy + 4, String(y), 10, '#6b857b', 'end');
        }
        for (const x of [-0.5, -0.25, 0]) {
            const xx = 65 + (x + 0.65) * 425;
            s.append(el('line', { x1: xx, y1: 91, x2: xx, y2: 269, stroke: '#e0e7df' }));
            txt(s, xx, 288, String(x), 10, '#6b857b', 'middle');
        }
        const C = [], P = [];
        for (let j = 0; j <= 150; j++) {
            P.push(cp(selectedRoot(j / 150)));
            const a = Math.PI / 2 + (j * Math.PI) / 6 / 150;
            C.push(cp([Math.cos(a), Math.sin(a)]));
        }
        s.append(el('polyline', { points: pts(C), fill: 'none', stroke: '#afc5bd', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }));
        s.append(el('polyline', { points: pts(P), fill: 'none', stroke: '#168579', 'stroke-width': 2.8 }));
        for (const [point, label, dx, dy] of [[[0, 1], 'i', 8, -8], [[-0.5, Math.sqrt(3) / 2], 'ω₃', -17, -10]]) {
            const [x, y] = cp(point);
            s.append(el('circle', { cx: x, cy: y, r: 4, fill: '#168579' }));
            txt(s, x + dx, y + dy, label, 13, '#234d52');
        }
        const [x, y] = cp(z);
        s.append(el('circle', { cx: x, cy: y, r: 6, fill: '#d98026', stroke: '#fffefa', 'stroke-width': 2 }));
        txt(s, 65, 46, 'Selected eigenvalue', 16, '#234d52');
        txt(s, 65, 67, 'ω₃ = exp(2πi/3)', 11);
        txt(s, 65, 315, 'Cropped complex-plane view · dashed: unit circle', 10);
    }

    function drawPolygon(z) {
        const s = $('arc-polygon');
        s.replaceChildren();
        s.append(el('title', {}, 'The invariant convex hull of the first four powers of the selected eigenvalue'));
        const V = powers(z), pp = w => [195 + 115 * w[0], 174 - 115 * w[1]];
        s.append(el('polygon', { points: pts(V.slice(0, 4).map(pp)), fill: '#edf1eb', stroke: '#17343f', 'stroke-width': 2 }));
        s.append(el('polygon', { points: pts(V.slice(1, 5).map(pp)), fill: '#168579', 'fill-opacity': 0.1, stroke: '#168579', 'stroke-width': 1.8 }));
        const labels = ['1', 'λ', 'λ²', 'λ³'];
        if (distance(V[0], V[3]) < 1e-9) labels[0] = '1 = λ³';
        let hit = -1;
        for (let i = 0; i < 4; i++) if (distance(V[i], V[4]) < 1e-9) { hit = i; break; }
        if (hit >= 0) labels[hit] += ' = λ⁴';
        for (let i = 0; i < 4; i++) {
            if (i === 3 && distance(V[0], V[3]) < 1e-9) continue;
            const [x, y] = pp(V[i]);
            s.append(el('circle', { cx: x, cy: y, r: 4, fill: '#17343f' }));
            txt(s, x + (V[i][0] >= 0 ? 14 : -14), y + (V[i][1] < 0 ? 18 : -10), labels[i], 12, '#234d52', V[i][0] >= 0 ? 'start' : 'end');
        }
        const [x, y] = pp(V[4]);
        s.append(el('circle', { cx: x, cy: y, r: 5.5, fill: '#d98026' }));
        if (hit < 0) txt(s, x + 13, y - 5, 'λ⁴', 12, '#9a672d');
        s.append(el('circle', { cx: 195, cy: 174, r: 2.3, fill: '#7c9187' }));
        txt(s, 203, 187, '0', 10);
        txt(s, 30, 46, 'An invariant polygon', 16, '#234d52');
        txt(s, 30, 67, 'Q = conv{1, λ, λ², λ³}', 11);
        txt(s, 30, 315, 'Teal: λQ ⊆ Q · amber: λ⁴ on [1, λ]', 10);
    }

    function updateArc() {
        const raw = Number($('arc-t').value), t = raw / 1000, z = selectedRoot(t);
        $('arc-t-value').textContent = raw === 625 ? '5/8' : t.toFixed(3);
        $('arc-readout').textContent = raw === 625
            ? 'λ = (−1 + i√11)/4 · |λ| = √3/2'
            : `λ ≈ ${z[0].toFixed(3)} + ${z[1].toFixed(3)}i · |λ| ≈ ${Math.hypot(...z).toFixed(3)}`;
        $('arc-row').textContent = `Last row of Aₜ: (${(1 - t).toFixed(3)}, ${t.toFixed(3)}, 0, 0)`;
        drawCurve(z);
        drawPolygon(z);
        for (const a of [0, 625, 1000]) $('arc-preset-' + a).setAttribute('aria-pressed', String(a === raw));
    }

    function init() {
        if ($('stage-button-1')) {
            for (let i = 1; i <= 9; i++) {
                const b = $('stage-button-' + i);
                if (b) b.addEventListener('click', () => selectStage(i));
            }
            selectStage(1);
        }
        if ($('arc-t')) {
            $('arc-t').addEventListener('input', updateArc);
            for (const a of [0, 625, 1000]) {
                $('arc-preset-' + a).addEventListener('click', () => {
                    $('arc-t').value = a;
                    updateArc();
                });
            }
            updateArc();
        }
    }

    window.KarpelevichRoadmap = Object.freeze({ selectedRoot, powers, selectStage });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

