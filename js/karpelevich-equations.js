/**
 * Interactive explorers for "Where the Boundary Equations Come From"
 * (karpelevich-boundary-equations.html).
 *
 * 1. Elimination explorer: step through contacts → multiply → close & cancel
 *    for the extra-tail (n = 7) and shifted-closure (n = 6) examples.
 * 2. Spectral explorer: all eigenvalues of the concrete stochastic matrices
 *    over t ∈ [0, 1], with the matrix drawn entry by entry.
 *
 * Data: window.KARPELEVICH_SPECTRAL_DATA (js/karpelevich-equations-data.js).
 * Root coordinates are numerical illustrations; the characteristic polynomials
 * themselves are proved exactly in the article.
 */
(function () {
    'use strict';

    const $ = id => document.getElementById(id);
    const NS = 'http://www.w3.org/2000/svg';

    function el(tag, attrs = {}, value) {
        const e = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (value !== undefined) e.textContent = value;
        return e;
    }

    function txt(s, x, y, value, size = 12, color = '#607b7e', anchor = 'start', extra = {}) {
        s.append(el('text', {
            x, y, fill: color, 'font-size': size, 'font-family': 'system-ui,sans-serif',
            'text-anchor': anchor, ...extra
        }, value));
    }

    // ---------- Elimination explorer ----------
    let elimFamily = 'I', elimStep = 0;

    function showElimination() {
        for (const family of ['I', 'II']) {
            $('elim-family-' + family).setAttribute('aria-pressed', String(elimFamily === family));
            $('elim-close-' + family).hidden = family !== elimFamily;
            for (let j = 0; j < 3; j++) {
                $('elim-panel-' + family + '-' + j).hidden = family !== elimFamily || j !== elimStep;
            }
        }
        for (let j = 0; j < 3; j++) $('elim-step-' + j).setAttribute('aria-pressed', String(j === elimStep));
    }

    // ---------- Spectral explorer ----------
    let data = null, kind = 'I';
    const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

    function groups(roots) {
        const out = [];
        for (const z of roots) {
            const old = out.find(x => distance(x.z, z) < 1e-6);
            if (old) old.count++; else out.push({ z, count: 1 });
        }
        return out;
    }

    function drawRoots(family, row) {
        const s = $('spec-roots');
        s.replaceChildren();
        s.append(el('title', {}, `All ${family.n} eigenvalues at t=${row.t}, with one selected upper-half-plane branch highlighted`));
        const xy = z => [205 + 137 * z[0], 195 - 137 * z[1]];
        s.append(el('circle', { cx: 205, cy: 195, r: 137, fill: '#fafbf6', stroke: '#bdcfc4', 'stroke-width': 1.5 }));
        s.append(el('path', { d: 'M47 195H363M205 38V352', stroke: '#dce4db', 'stroke-width': 1 }));
        const curve = family.samples.map(x => xy(x.selected).join(',')).join(' ');
        s.append(el('polyline', {
            points: curve, fill: 'none', stroke: kind === 'I' ? '#168579' : '#d98026',
            'stroke-width': 2, opacity: 0.65
        }));
        for (const g of groups(row.roots)) {
            const [x, y] = xy(g.z), perron = distance(g.z, [1, 0]) < 1e-6;
            s.append(el('circle', { cx: x, cy: y, r: 4.5, fill: perron ? '#168579' : '#397c91' }));
            if (perron) txt(s, x + 9, y + 4, '1' + (g.count > 1 ? ' · ×' + g.count : ''), 11, '#347867');
            else if (g.count > 1) txt(s, x + 7, y - 7, '×' + g.count, 10, '#4a7177');
        }
        const [x, y] = xy(row.selected);
        s.append(el('circle', { cx: x, cy: y, r: 7, fill: '#d98026', stroke: '#fffefa', 'stroke-width': 2 }));
        txt(s, 33, 25, 'All eigenvalues', 16, '#234d52');
        txt(s, 33, 373, 'Orange point: selected root · circle: |λ| = 1', 11);
        txt(s, 198, 211, '0', 10);
        txt(s, 359, 215, 'Re', 10);
        txt(s, 218, 47, 'Im', 10);
    }

    const weight = (label, t) => (label === '1' ? 1 : label === 't' ? t : 1 - t);

    function drawMatrix(family, t) {
        const s = $('spec-matrix');
        s.replaceChildren();
        s.append(el('title', {}, `${family.n} by ${family.n} stochastic matrix at t=${t}; all rows sum to one`));
        txt(s, 32, 25, 'The stochastic matrix Aₜ', 16, '#234d52');
        const n = family.n, cell = 34, left = 98, top = 92;
        const entries = Array.from({ length: n }, () => Array.from({ length: n }, () => []));
        for (const [i, j, label] of family.edges) entries[i][j].push(label);
        for (let i = 0; i < n; i++) {
            txt(s, left - 11, top + (i + 0.5) * cell + 4, family.labels[i], 10, '#456f65', 'end');
            txt(s, left + (i + 0.5) * cell, top - 11, family.labels[i], 10, '#456f65', 'start',
                { transform: `rotate(-43 ${left + (i + 0.5) * cell} ${top - 11})` });
            for (let j = 0; j < n; j++) {
                const labels = entries[i][j], w = labels.reduce((a, l) => a + weight(l, t), 0), tag = labels[0];
                const fill = w === 0 ? '#f3f5ee' : tag === '1-t' ? '#d98026' : tag === 't' ? '#397c91' : '#168579';
                s.append(el('rect', {
                    x: left + j * cell, y: top + i * cell, width: cell - 2, height: cell - 2, rx: 3,
                    fill, opacity: w === 0 ? 1 : 0.2 + 0.8 * w
                }));
                if (w > 0) {
                    txt(s, left + (j + 0.5) * cell - 1, top + (i + 0.5) * cell + 3, w === 1 ? '1' : w.toFixed(2),
                        10, w > 0.55 ? 'white' : '#254b48', 'middle');
                }
            }
        }
        txt(s, 32, 373, 'Blue: t · amber: 1 − t · teal: deterministic 1', 10);
    }

    function updateSpectrum() {
        const index = Number($('spec-t').value), family = data[kind], row = family.samples[index];
        $('spec-t-value').textContent = row.t.toFixed(3);
        $('spec-order').textContent = family.n + ' states';
        for (const f of ['I', 'II']) {
            $('spec-' + f).setAttribute('aria-pressed', String(kind === f));
            $('spec-equation-' + f).hidden = f !== kind;
        }
        for (const p of [0, 100, 200]) $('spec-preset-' + p).setAttribute('aria-pressed', String(p === index));
        const [re, im] = row.selected;
        $('spec-readout').textContent = `Selected λ ≈ ${re.toFixed(5)} + ${im.toFixed(5)}i · |λ| ≈ ${Math.hypot(re, im).toFixed(5)}`;
        $('spec-description').textContent = kind === 'I'
            ? 'Two three-state chains plus one tail state.'
            : 'Two three-state chains; the final forward edge targets the existing state λz₀.';
        drawRoots(family, row);
        drawMatrix(family, row.t);
    }

    function init() {
        if ($('elim-family-I')) {
            for (const family of ['I', 'II']) {
                $('elim-family-' + family).addEventListener('click', () => { elimFamily = family; showElimination(); });
            }
            for (let j = 0; j < 3; j++) {
                $('elim-step-' + j).addEventListener('click', () => { elimStep = j; showElimination(); });
            }
            showElimination();
        }
        data = window.KARPELEVICH_SPECTRAL_DATA;
        if ($('spec-t') && data) {
            for (const f of ['I', 'II']) $('spec-' + f).addEventListener('click', () => { kind = f; updateSpectrum(); });
            for (const p of [0, 100, 200]) {
                $('spec-preset-' + p).addEventListener('click', () => { $('spec-t').value = p; updateSpectrum(); });
            }
            $('spec-t').addEventListener('input', updateSpectrum);
            updateSpectrum();
        }
    }

    window.KarpelevichEquations = Object.freeze({ groups, weight, getData: () => data });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

