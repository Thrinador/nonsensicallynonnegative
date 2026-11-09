/**
 * Karpelevich Proof Series — Stop 8 Interactive Explorers
 * Cyclic Polygons and the Whole Region
 */
'use strict';

(function () {
    const $ = id => document.getElementById(id);
    const NS = 'http://www.w3.org/2000/svg';
    const ink = '#17343f';
    const teal = '#168579';
    const amber = '#d98026';
    const muted = '#607b7e';

    const absInt = n => n < 0n ? -n : n;
    function gcd(a, b) {
        a = absInt(a);
        b = absInt(b);
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    function rat(n, d = 1) {
        n = BigInt(n);
        d = BigInt(d);
        if (d === 0n) throw Error('Zero denominator');
        if (d < 0n) {
            n = -n;
            d = -d;
        }
        const g = gcd(n, d);
        return { n: n / g, d: d / g };
    }

    const add = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
    const neg = a => rat(-a.n, a.d);
    const sub = (a, b) => add(a, neg(b));
    const mul = (a, b) => rat(a.n * b.n, a.d * b.d);
    const abs = a => rat(absInt(a.n), a.d);
    const positive = a => a.n > 0n ? a : rat(0);
    const val = a => Number(a.n) / Number(a.d);
    const equal = (a, b) => a.n === b.n && a.d === b.d;
    const fraction = a => a.d === 1n ? String(a.n).replace('-', '−') : `${a.n}/${a.d}`.replace('-', '−');

    const complex = (re, im = rat(0)) => ({ re, im });
    const cmul = (a, b) => complex(
        sub(mul(a.re, b.re), mul(a.im, b.im)),
        add(mul(a.re, b.im), mul(a.im, b.re))
    );
    const cadd = (a, b) => complex(add(a.re, b.re), add(a.im, b.im));

    function complexText(z) {
        if (z.im.n === 0n) return fraction(z.re);
        const im = abs(z.im);
        const term = (equal(im, rat(1)) ? '' : fraction(im) + '·') + 'i';
        if (z.re.n === 0n) return (z.im.n < 0n ? '−' : '') + term;
        return `${fraction(z.re)} ${z.im.n < 0n ? '−' : '+'} ${term}`;
    }

    const vertices = [
        complex(rat(1)),
        complex(rat(0), rat(1, 2)),
        complex(rat(-1)),
        complex(rat(0), rat(-1, 2))
    ];

    function diamondWeights(w) {
        const slack = sub(rat(1), add(abs(w.re), mul(rat(2), abs(w.im))));
        if (slack.n < 0n) throw Error('Point outside the cyclic diamond');
        const s = mul(slack, rat(1, 2));
        return [
            add(positive(w.re), s),
            mul(rat(2), positive(w.im)),
            add(positive(neg(w.re)), s),
            mul(rat(2), positive(neg(w.im)))
        ];
    }

    function matrixFor(z) {
        return vertices.map(v => diamondWeights(cmul(z, v)));
    }

    function matrixCheck(z, A) {
        return A.every((row, i) => {
            if (row.some(x => x.n < 0n) || !equal(row.reduce(add, rat(0)), rat(1))) return false;
            const image = row.reduce((sum, a, j) => cadd(sum, complex(mul(a, vertices[j].re), mul(a, vertices[j].im))), complex(rat(0)));
            const target = cmul(z, vertices[i]);
            return equal(image.re, target.re) && equal(image.im, target.im);
        });
    }

    function el(tag, attrs = {}, value) {
        const e = document.createElementNS(NS, tag);
        for (const [key, valAttr] of Object.entries(attrs)) e.setAttribute(key, valAttr);
        if (value !== undefined) e.textContent = String(value);
        return e;
    }

    function txt(svg, x, y, value, size = 13, color = muted, anchor = 'start') {
        svg.append(el('text', {
            x, y, fill: color, 'font-size': size,
            'font-family': 'system-ui,sans-serif', 'text-anchor': anchor
        }, value));
    }

    const num = (re, im = 0) => ({ re, im });
    const nmul = (a, b) => num(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
    const power = (z, m) => {
        let p = num(1);
        for (let j = 0; j < m; j++) p = nmul(p, z);
        return p;
    };
    const nneg = z => num(-z.re, -z.im);

    function hull(points) {
        const sorted = points.slice().sort((a, b) => a.re - b.re || a.im - b.im);
        const p = sorted.filter((v, i) => !i || Math.abs(v.re - sorted[i - 1].re) > 1e-12 || Math.abs(v.im - sorted[i - 1].im) > 1e-12);
        const cross = (o, a, b) => (a.re - o.re) * (b.im - o.im) - (a.im - o.im) * (b.re - o.re);
        const lo = [], hi = [];
        for (const v of p) {
            while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], v) <= 1e-12) lo.pop();
            lo.push(v);
        }
        for (const v of p.slice().reverse()) {
            while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], v) <= 1e-12) hi.pop();
            hi.push(v);
        }
        return lo.slice(0, -1).concat(hi.slice(0, -1));
    }

    function point(z, cx, cy, s) {
        return [cx + s * z.re, cy - s * z.im];
    }

    function poly(svg, points, cx, cy, s, fill = '#e3f1e7', stroke = teal, dash = '') {
        svg.append(el('polygon', {
            points: hull(points).map(z => point(z, cx, cy, s).join(',')).join(' '),
            fill, stroke, 'stroke-width': 1.7, 'stroke-dasharray': dash
        }));
    }

    function line(svg, a, b, cx, cy, s, color = muted, dash = '') {
        svg.append(el('path', {
            d: `M${point(a, cx, cy, s)}L${point(b, cx, cy, s)}`,
            fill: 'none', stroke: color, 'stroke-width': 1.3, 'stroke-dasharray': dash
        }));
    }

    function dot(svg, z, cx, cy, s, color = teal, r = 4, fill = color) {
        const [x, y] = point(z, cx, cy, s);
        svg.append(el('circle', { cx: x, cy: y, r, fill, stroke: color, 'stroke-width': 1.6 }));
    }

    function axes(svg, cx, cy, s) {
        line(svg, num(-1.1), num(1.1), cx, cy, s, '#d3ded4');
        line(svg, num(0, -1.05), num(0, 1.05), cx, cy, s, '#d3ded4');
    }

    let horizontal = 30, vertical = 80;
    function setMultiplication(u, v) {
        horizontal = u;
        vertical = v;
        if ($('product-x')) $('product-x').value = u;
        if ($('product-y')) $('product-y').value = v;
        const x = rat(u, 120);
        const ratio = rat(v, 120);
        const y = mul(mul(sub(rat(1), abs(x)), rat(1, 2)), ratio);
        const z = complex(x, y);
        const A = matrixFor(z);
        const checked = matrixCheck(z, A);
        if (!checked) throw Error('Stochastic eigenvector identity failed');

        const s = $('product-plot');
        if (!s) return { z, A, checked };
        const cx = 280, cy = 190, scale = 195;
        const vs = vertices.map(a => num(val(a.re), val(a.im)));
        const zn = num(val(x), val(y));
        s.replaceChildren();
        s.append(el('title', {}, 'A cyclic diamond and its image under multiplication by the selected rational point'));
        axes(s, cx, cy, scale);
        poly(s, vs, cx, cy, scale);
        poly(s, vs.map(v0 => nmul(zn, v0)), cx, cy, scale, '#f6dfbc', amber);
        for (const v0 of vs) dot(s, nmul(zn, v0), cx, cy, scale, amber, 4);
        for (const [v0, label, dx, dy] of [[vs[0], '1', 14, 5], [vs[1], 'i/2', -9, -16], [vs[2], '−1', -28, 5], [vs[3], '−i/2', -20, 25]]) {
            dot(s, v0, cx, cy, scale, teal, 5);
            const p = point(v0, cx, cy, scale);
            txt(s, p[0] + dx, p[1] + dy, label, 14);
        }
        dot(s, num(0), cx, cy, scale, muted, 2);
        dot(s, zn, cx, cy, scale, '#b05b46', 6);
        const pz = point(zn, cx, cy, scale);
        txt(s, pz[0] + (zn.re > 0.85 ? -19 : 10), pz[1] + (zn.im > 0.43 ? 24 : -10), 'z', 16, '#b05b46');
        txt(s, 25, 27, 'C contains its product zC', 17, ink);
        txt(s, 25, 348, 'Teal: C · Amber: zC · Red point: z', 12);

        $('product-x-value').textContent = fraction(x);
        $('product-y-value').textContent = fraction(ratio);
        $('product-z').textContent = 'z = ' + complexText(z);
        $('product-gauge').textContent = '|Re z| + 2|Im z| = ' + fraction(add(abs(x), mul(rat(2), abs(y)))) + ' ≤ 1';
        $('product-matrix').replaceChildren();
        for (const row of A) {
            const tr = document.createElement('tr');
            for (const value of row) {
                const td = document.createElement('td');
                td.textContent = fraction(value);
                tr.append(td);
            }
            $('product-matrix').append(tr);
        }
        $('product-status').textContent = 'Exact check: all four rows are nonnegative and sum to 1. Av − zv = (0, 0, 0, 0).';
        return { z, A, checked };
    }

    if ($('product-plot')) {
        $('product-x').addEventListener('input', () => setMultiplication(Number($('product-x').value), vertical));
        $('product-y').addEventListener('input', () => setMultiplication(horizontal, Number($('product-y').value)));
        const productPresets = { example: [30, 80], center: [0, 0], edge: [60, 120], bottom: [0, -120], one: [120, 0] };
        for (const [name, values] of Object.entries(productPresets)) {
            $('product-' + name).addEventListener('click', () => setMultiplication(...values));
        }
        setMultiplication(30, 80);
    }

    const cases = {
        quad: {
            title: 'Four-state spiral',
            mu: num(-0.25, Math.sqrt(11) / 4),
            d: 1, L: 4,
            closure: 'μ⁴ = 3/8 + (5/8)μ',
            parameter: 'μ = (−1 + i√11)/4',
            detail: 'One power sequence; the fourth power closes on [1, μ].'
        },
        eight: {
            title: 'Eight-generator half-turn construction',
            mu: num(-3 / 5, Math.sqrt(39 - Math.sqrt(599)) / 5),
            d: 2, L: 4,
            closure: 'μ⁴ = tμ + (1−t)(−1)',
            parameter: 't = 12(30−√599)/125',
            detail: 'μ = (−3 + i√(39−√599))/5. Half-turn copies close both terminal chains.'
        },
        diamond: {
            title: 'Cyclic diamond',
            mu: num(0, 0.5),
            d: 2, L: 2,
            closure: 'μ² = (3/8)·1 + (5/8)·(−1)',
            parameter: 'μ = i/2',
            detail: 'Two rotational copies of two initial powers give the four diamond vertices.'
        }
    };

    let orbitCase = 'quad', orbitStep = 4, showImage = false;
    function drawOrbit() {
        const c = cases[orbitCase];
        const s = $('orbit-plot');
        if (!s) return;
        const cx = 255, cy = 230, scale = 170;
        const base = Array.from({ length: c.L }, (_, j) => power(c.mu, j));
        const full = c.d === 2 ? base.concat(base.map(nneg)) : base;
        s.replaceChildren();
        s.append(el('title', {}, c.title + ' with a certified infinite power orbit'));
        axes(s, cx, cy, scale);
        poly(s, full, cx, cy, scale);
        if (showImage) poly(s, full.map(v => nmul(c.mu, v)), cx, cy, scale, 'none', amber, '5 4');
        for (let j = 1; j <= orbitStep; j++) line(s, power(c.mu, j - 1), power(c.mu, j), cx, cy, scale, '#b2c6b9', '3 5');
        for (let j = c.L; j <= orbitStep; j++) dot(s, power(c.mu, j), cx, cy, scale, '#9caf9f', 3);
        if (c.d === 2) {
            for (const p of base) dot(s, nneg(p), cx, cy, scale, amber, 4.5);
        }
        for (let j = 0; j < base.length; j++) {
            dot(s, base[j], cx, cy, scale, teal, 5);
            if (j !== orbitStep) {
                const p = point(base[j], cx, cy, scale * 1.13);
                txt(s, p[0], p[1] + 5, j === 0 ? '1' : j === 1 ? 'μ' : 'μ^' + j, 13, ink, 'middle');
            }
        }
        const active = power(c.mu, orbitStep);
        const p = point(active, cx, cy, scale);
        dot(s, active, cx, cy, scale, '#b05b46', 6);
        txt(s, p[0] + 11, p[1] - 11, 'μ^' + orbitStep, 16, '#b05b46');
        dot(s, num(0), cx, cy, scale, muted, 2);
        txt(s, cx + 8, cy + 17, '0', 11);
        txt(s, 25, 27, c.title, 17, ink);
        txt(s, 25, 436, 'Orbit positions are drawn numerically; the closing identities are exact.', 11);

        $('orbit-step-value').textContent = orbitStep;
        $('orbit-name').textContent = c.parameter;
        $('orbit-closure').textContent = c.closure;
        $('orbit-detail').textContent = c.detail;
        $('orbit-count').textContent = `h = ${c.d}, L = ${c.L} · ${c.d * c.L} generators · at most ${c.d * c.L} vertices`;
        $('orbit-status').textContent = orbitStep < c.L
            ? 'This is an initial generator. The closing relation certifies the rest of the infinite orbit.'
            : orbitStep === c.L
                ? 'This is the first closing power. It lies in the finite hull by the displayed convex identity.'
                : 'This is a later power. The finite closing argument proves its containment without checking powers one by one.';
        $('orbit-image').setAttribute('aria-pressed', String(showImage));
        $('orbit-image').textContent = showImage ? 'Hide μC' : 'Show μC';
    }

    function setOrbit(name, step) {
        orbitCase = name;
        orbitStep = step === undefined ? cases[name].L : step;
        if ($('orbit-case')) $('orbit-case').value = name;
        if ($('orbit-step')) $('orbit-step').value = orbitStep;
        drawOrbit();
    }

    if ($('orbit-plot')) {
        $('orbit-case').addEventListener('change', () => setOrbit($('orbit-case').value));
        $('orbit-step').addEventListener('input', () => setOrbit(orbitCase, Number($('orbit-step').value)));
        $('orbit-initial').addEventListener('click', () => setOrbit(orbitCase, cases[orbitCase].L - 1));
        $('orbit-close').addEventListener('click', () => setOrbit(orbitCase));
        $('orbit-later').addEventListener('click', () => setOrbit(orbitCase, 12));
        $('orbit-image').addEventListener('click', () => {
            showImage = !showImage;
            drawOrbit();
        });
        setOrbit('quad');
    }

    window.KarpelevichCyclic = Object.freeze({
        rat, add, sub, mul, neg, abs, val, equal, fraction,
        complex, cmul, vertices, diamondWeights, matrixFor, matrixCheck,
        setMultiplication, setOrbit, cases, power, hull
    });
})();

