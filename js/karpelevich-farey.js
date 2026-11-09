'use strict';
(function () {
    const $ = id => document.getElementById(id), NS = 'http://www.w3.org/2000/svg';
    const ink = '#17343f', teal = '#168579', amber = '#d98026', red = '#b05b46', muted = '#607b7e';
    const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a), mod = (a, n) => (a % n + n) % n;

    function rat(n, d = 1) {
        if (d < 0) { n = -n; d = -d; }
        const g = gcd(n, d);
        return { n: n / g, d: d / g };
    }

    const val = r => r.n / r.d;
    const compare = (a, b) => Math.sign(a.n * b.d - b.n * a.d);
    const add = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
    const sub = (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
    const times = (a, k) => rat(a.n * k, a.d);
    const label = r => `${r.n}/${r.d}`;
    const textFraction = r => r.d === 1 ? String(r.n).replace('-', '−') : label(r).replace('-', '−');

    function egcd(a, b) {
        if (!b) return [a, 1, 0];
        const [g, x, y] = egcd(b, a % b);
        return [g, y, x - Math.floor(a / b) * y];
    }

    function farey(n) {
        const out = [];
        for (let b = 1; b <= n; b++) {
            for (let a = 0; a <= b; a++) {
                if (gcd(a, b) === 1) out.push({ n: a, d: b });
            }
        }
        return out.sort(compare);
    }

    function predecessor(n, k) {
        const g = gcd(n, k), c = k / g, d = n / g;
        const b0 = mod(egcd(c, d)[1], d);
        const b = b0 + Math.floor((n - b0) / d) * d;
        const f = (c * b - 1) / d;
        return { g, c, d, f, b, left: rat(f, b), right: rat(k, n) };
    }

    function el(tag, attrs = {}, value) {
        const e = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (value !== undefined) e.textContent = String(value);
        return e;
    }

    function txt(s, x, y, text, size = 12, color = muted, anchor = 'start') {
        s.append(el('text', {
            x, y, fill: color,
            'font-size': size,
            'font-family': 'system-ui,sans-serif',
            'text-anchor': anchor
        }, text));
    }

    function point(theta, cx, cy, r) {
        const a = 2 * Math.PI * val(theta);
        return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    }

    function dot(s, p, color = ink, r = 4, stroke = 'none') {
        s.append(el('circle', { cx: p[0], cy: p[1], r, fill: color, stroke, 'stroke-width': 1.8 }));
    }

    function line(s, A, B, color, width = 1.4, dash = '') {
        s.append(el('path', {
            d: `M${A}L${B}`,
            fill: 'none', stroke: color,
            'stroke-width': width, 'stroke-dasharray': dash
        }));
    }

    function wedge(s, a, b, cx, cy, r, color) {
        const points = [[cx, cy]];
        for (let j = 0; j <= 48; j++) {
            points.push(point(rat(a.n * b.d * 48 + (b.n * a.d - a.n * b.d) * j, a.d * b.d * 48), cx, cy, r));
        }
        s.append(el('polygon', {
            points: points.map(p => p.join(',')).join(' '),
            fill: color, stroke: 'none'
        }));
    }

    function degreeText(turns) {
        const r = times(turns, 360);
        return r.d === 1 ? `${r.n}°` : `${textFraction(r)}° (≈ ${val(r).toFixed(3)}°)`;
    }

    function options(node, items, value) {
        node.replaceChildren();
        for (const item of items) {
            const o = document.createElement('option');
            o.value = String(item.value);
            o.textContent = item.label;
            node.append(o);
        }
        node.value = String(value);
    }

    let order = 7, pairIndex = 0, showMediant = true, sequence = [], pairs = [];

    function drawFarey() {
        const s = $('farey-plot');
        if (!s || !pairs.length) return;
        const pair = pairs[pairIndex], A = pair.left, B = pair.right, M = rat(A.n + B.n, A.d + B.d);
        const cx = 250, cy = 270, r = 172;
        s.replaceChildren();
        s.append(el('title', {}, 'Upper-half roots of unity and one selected Farey gap'));
        wedge(s, A, B, cx, cy, r, '#e3f1e7');
        const arc = Array.from({ length: 101 }, (_, j) => point(rat(j, 200), cx, cy, r));
        s.append(el('path', { d: 'M' + arc.map(p => p.join(' ')).join('L'), fill: 'none', stroke: '#c8d8cc', 'stroke-width': 1.5 }));
        line(s, [65, cy], [435, cy], '#d2ddd1', 1);
        line(s, [cx, cy], point(A, cx, cy, r), teal, 1.5);
        line(s, [cx, cy], point(B, cx, cy, r), amber, 1.5);
        if (showMediant) {
            line(s, [cx, cy], point(M, cx, cy, r), '#aa8a58', 1, '4 5');
            dot(s, point(M, cx, cy, r - 20), '#fffefa', 5, '#9d7950');
        }
        for (const f of sequence) {
            if (compare(f, A) !== 0 && compare(f, B) !== 0) dot(s, point(f, cx, cy, r), '#9bafa2', 3);
        }
        dot(s, point(A, cx, cy, r), teal, 6);
        dot(s, point(B, cx, cy, r), amber, 6);
        dot(s, [cx, cy], muted, 2);
        txt(s, cx + 7, cy + 18, '0', 11);
        txt(s, 451, cy + 4, '1', 13);
        txt(s, 47, cy + 4, '−1', 13);
        txt(s, 250, 82, 'i', 13, muted, 'middle');
        txt(s, 27, 24, `Upper-half unit-circle landmarks · n = ${order}`, 16, ink);
        txt(s, 27, 326, 'The wedge is an angular sector, not an eigenvalue region.', 10);

        $('farey-n-value').textContent = order;
        $('farey-left').textContent = label(A);
        $('farey-right').textContent = label(B);
        $('farey-determinant').textContent = `bc − ad = ${A.d}×${B.n} − ${A.n}×${B.d} = 1`;
        $('farey-sum').textContent = `b + d = ${A.d + B.d} > n = ${order}`;
        const width = sub(B, A);
        $('farey-width').textContent = `Gap = ${textFraction(width)} turn · ${degreeText(width)}`;
        $('farey-mediant').textContent = `First new fraction: ${label(M)} · first admitted at order ${M.d}`;
        $('farey-split').textContent = `At order ${M.d}: ${label(A)} < ${label(M)} < ${label(B)}.`;
        $('farey-ghost').setAttribute('aria-pressed', String(showMediant));
        $('farey-ghost').textContent = showMediant ? 'Hide future mediant' : 'Show future mediant';
    }

    function setFarey(n, preferred) {
        order = n;
        sequence = farey(n).filter(f => 2 * f.n <= f.d);
        pairs = sequence.slice(0, -1).map((left, i) => ({ left, right: sequence[i + 1] }));
        pairIndex = preferred === undefined ? pairs.findIndex(p => compare(p.left, rat(1, 3)) === 0) : preferred;
        if (pairIndex < 0) pairIndex = 0;
        const nInput = $('farey-n');
        const pairSelect = $('farey-pair');
        if (nInput) nInput.value = n;
        if (pairSelect) {
            options(pairSelect, pairs.map((p, i) => ({ value: i, label: `${label(p.left)} to ${label(p.right)}` })), pairIndex);
        }
        drawFarey();
    }

    const examples = {
        eight: { n: 8, k: 3, p: 3, h: 1, R: 2, q: 2 },
        seven_lower: { n: 7, k: 5, p: 3, h: 2, R: 2, q: 1 },
        seven_other: { n: 7, k: 4, p: 2, h: 1, R: 3, q: 1 },
        first: { n: 7, k: 1, p: 1, h: 0, R: 7, q: 0 }
    };

    function windingModel(c, theta) {
        const left = rat(c.h, c.p), right = rat(c.k, c.n);
        const lift = times(theta, c.p), phase = sub(lift, rat(c.h));
        const onLeft = compare(theta, left) === 0, onRight = compare(theta, right) === 0;
        return {
            theta, left, right, lift, phase,
            coarse: rat(c.k - 1, c.n),
            inside: compare(theta, left) > 0 && compare(theta, right) < 0,
            endpoint: onLeft || onRight
        };
    }

    let example = 'eight', theta = rat(17, 48);

    function ray(s, theta, cx, cy, r, color) {
        const tip = point(theta, cx, cy, r), near = point(theta, cx, cy, 12), back = point(theta, cx, cy, r - 10);
        const a = 2 * Math.PI * val(theta), v = [-Math.sin(a) * 4, -Math.cos(a) * 4];
        line(s, near, tip, color, 2.4);
        s.append(el('polygon', {
            points: [tip, [back[0] + v[0], back[1] + v[1]], [back[0] - v[0], back[1] - v[1]]].map(p => p.join(',')).join(' '),
            fill: color
        }));
    }

    function drawWinding() {
        const s = $('winding-plot');
        if (!s) return;
        const c = examples[example], m = windingModel(c, theta), cy = 174, r = 102;
        const color = m.inside ? teal : m.endpoint ? amber : red;
        s.replaceChildren();
        s.append(el('title', {}, 'Directions of the multiplier and its power, with the integer winding retained'));
        const lo = rat(1 - c.p, c.n), hi = rat(1, c.n);
        wedge(s, m.coarse, m.right, 205, cy, r, '#eef0e9');
        wedge(s, m.left, m.right, 205, cy, r, '#dcefe1');
        wedge(s, lo, hi, 645, cy, r, '#eef0e9');
        wedge(s, rat(0), hi, 645, cy, r, '#dcefe1');
        for (const cx of [205, 645]) {
            s.append(el('circle', { cx, cy, r, fill: 'none', stroke: '#c7d6c9', 'stroke-width': 1.4 }));
            line(s, [cx - r, cy], [cx + r, cy], '#dbe4d6', 1);
            dot(s, [cx, cy], muted, 2);
        }
        for (const [f, cx] of [[m.left, 205], [m.right, 205], [rat(0), 645], [hi, 645]]) {
            dot(s, point(f, cx, cy, r), '#fffefa', 4.5, teal);
            const p = point(f, cx, cy, r + 24);
            txt(s, p[0], p[1] + 4, textFraction(f), 12, muted, 'middle');
        }
        ray(s, theta, 205, cy, r - 3, color);
        ray(s, m.phase, 645, cy, r - 3, color);
        txt(s, 205, 25, 'Direction of λ', 17, ink, 'middle');
        txt(s, 645, 25, 'Principal direction of λᵖ', 17, ink, 'middle');
        txt(s, 430, 174, `power ${c.p}`, 13, muted, 'middle');
        txt(s, 430, 197, `remove ${c.h} turn${c.h === 1 ? '' : 's'}`, 12, muted, 'middle');
        txt(s, 430, 341, 'Directions only: no spectral modulus is assigned to the displayed ray.', 11, muted, 'middle');

        $('winding-theta-value').textContent = textFraction(theta);
        $('winding-direction').textContent = `θ = ${textFraction(theta)} turn · ${degreeText(theta)}`;
        $('winding-sector').textContent = `${textFraction(m.left)} < θ < ${textFraction(m.right)} · ℓ = ${c.p}, f = ${c.h}`;
        $('winding-identity').textContent = `kp − hn = ${c.k}×${c.p} − ${c.h}×${c.n} = 1`;
        $('winding-phase').textContent = `pθ = ${textFraction(m.lift)} turns · pθ − h = ${textFraction(m.phase)} turn`;
        $('winding-principal').textContent = `Principal angle of λᵖ: ${degreeText(m.phase)}`;
        $('winding-degree').textContent = `n = ℓm + τ = ${c.p}×${c.R} + ${c.q} = ${c.n}; ℓ ≤ n/2.`;
        const status = $('winding-status');
        status.textContent = m.inside
            ? 'The positive-contact angle test passes. This ray lies inside the selected Farey sector.'
            : m.endpoint
                ? 'This is a unit-circle endpoint direction, a limiting case of the strict-contraction argument.'
                : 'The lifted phase is nonpositive, so this ray fails the positive-contact angle requirement.';
        status.classList.toggle('fails', !m.inside && !m.endpoint);
        status.classList.toggle('endpoint', m.endpoint);
    }

    function setWinding(name, rayTheta) {
        example = name;
        const c = examples[name];
        theta = rayTheta ? rat(rayTheta.n, rayTheta.d) : times(add(rat(c.h, c.p), rat(c.k, c.n)), 1);
        if (!rayTheta) theta = rat(theta.n, 2 * theta.d);
        const caseSelect = $('winding-case');
        const angleInput = $('winding-angle');
        if (caseSelect) caseSelect.value = name;
        if (angleInput) angleInput.value = Math.round((c.n * val(theta) - (c.k - 1)) * 1000);
        drawWinding();
    }

    if ($('farey-plot')) {
        $('farey-n').addEventListener('input', () => setFarey(Number($('farey-n').value)));
        $('farey-pair').addEventListener('change', () => {
            pairIndex = Number($('farey-pair').value);
            drawFarey();
        });
        $('farey-ghost').addEventListener('click', () => {
            showMediant = !showMediant;
            drawFarey();
        });
        $('farey-seven').addEventListener('click', () => setFarey(7));
        $('farey-eight').addEventListener('click', () => setFarey(8));
        setFarey(7);
    }

    if ($('winding-plot')) {
        $('winding-case').addEventListener('change', () => setWinding($('winding-case').value));
        $('winding-angle').addEventListener('input', () => {
            const c = examples[example];
            setWinding(example, rat((c.k - 1) * 1000 + Number($('winding-angle').value), 1000 * c.n));
        });
        for (const name of ['coarse', 'left', 'mid', 'right']) {
            $('winding-' + name).addEventListener('click', () => {
                const c = examples[example];
                if (name === 'mid') setWinding(example);
                else setWinding(example, name === 'coarse' ? rat(c.k - 1, c.n) : name === 'left' ? rat(c.h, c.p) : rat(c.k, c.n));
            });
        }
        setWinding('eight');
    }

    window.KarpelevichFarey = Object.freeze({
        rat, val, compare, add, sub, times, gcd,
        farey, predecessor, windingModel, examples,
        setFarey, setWinding
    });
})();

