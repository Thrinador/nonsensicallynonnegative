'use strict';
(function () {
    const $ = id => document.getElementById(id), NS = 'http://www.w3.org/2000/svg';
    const ink = '#17343f', teal = '#168579', amber = '#d98026', red = '#b05b46', muted = '#607b7e';
    const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);

    function rational(n, d = 1) {
        if (d < 0) { n = -n; d = -d; }
        const g = gcd(n, d);
        return { n: n / g, d: d / g };
    }

    const value = r => r.n / r.d, frac = r => r.d === 1 ? String(r.n).replace('-', '−') : `${r.n}/${r.d}`.replace('-', '−');
    const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];

    function el(tag, attrs = {}, text) {
        const e = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (text !== undefined) e.textContent = String(text);
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

    function line(s, A, B, color, width = 1.5, dash = '') {
        s.append(el('path', {
            d: `M${A}L${B}`,
            fill: 'none', stroke: color,
            'stroke-width': width, 'stroke-dasharray': dash
        }));
    }

    function dot(s, p, color = ink, r = 4, stroke = 'none') {
        s.append(el('circle', { cx: p[0], cy: p[1], r, fill: color, stroke, 'stroke-width': 1.5 }));
    }

    function polygon(s, v, fill, stroke, dash = '') {
        s.append(el('polygon', {
            points: v.map(p => p.join(',')).join(' '),
            fill, stroke,
            'stroke-width': 2, 'stroke-dasharray': dash
        }));
    }

    function status(node, message, kind) {
        node.textContent = message;
        node.classList.toggle('fails', kind === 'fails');
        node.classList.toggle('inward', kind === 'inward');
    }

    function projective(A, S) {
        return {
            a: rational(A, 4),
            s: rational(S, 1000),
            u: rational(A * S, 4 * (1000 + S)),
            gap: rational(S * (4 * (1000 + S) - 1000 * A), 4000 * (1000 + S)),
            atOne: rational(A, 8)
        };
    }

    let mapA = 4, mapS = 100;

    function drawMap() {
        const p = $('map-plot');
        if (!p) return;
        const m = projective(mapA, mapS), a = value(m.a), s = value(m.s), u = value(m.u), coord = (x, y) => [220 + 815 * x, 172 - 325 * y];
        p.replaceChildren();
        p.append(el('title', {}, 'A fractional linear return map compared with the identity line'));
        line(p, coord(-0.22, 0), coord(0.22, 0), '#d4ded3', 1);
        line(p, coord(0, -0.37), coord(0, 0.37), '#d4ded3', 1);
        line(p, coord(-0.22, -0.22), coord(0.22, 0.22), '#9eafa3', 1.6, '5 4');
        const points = Array.from({ length: 121 }, (_, i) => {
            const t = -0.22 + i * 0.44 / 120;
            return coord(t, a * t / (1 + t));
        });
        p.append(el('path', { d: 'M' + points.map(x => x.join(' ')).join('L'), fill: 'none', stroke: teal, 'stroke-width': 2.2 }));
        const color = m.gap.n < 0 ? red : m.gap.n > 0 ? amber : muted;
        line(p, coord(s, s), coord(s, u), color, 4);
        dot(p, coord(s, s), color, 4);
        dot(p, coord(s, u), teal, 4.5);
        txt(p, 402, 177, 's', 12);
        txt(p, 228, 46, 'u(s)', 12);
        txt(p, 220, 194, '0', 10);
        txt(p, 40, 25, `u(s) = ${frac(m.a)} · s/(1+s)`, 16, ink);
        txt(p, 40, 332, 'Gray: starting s · Teal: returned u(s)', 11);
        $('map-s-value').textContent = s.toFixed(3);
        $('map-derivative').textContent = `u′(0) = ${frac(m.a)} · u(1) = ${frac(m.atOne)}`;
        $('map-return').textContent = `u(s) = ${frac(m.u)} ≈ ${u.toFixed(6)}`;
        $('map-gap').textContent = `s − u(s) = ${frac(m.gap)} ≈ ${value(m.gap).toFixed(6)}`;
        status($('map-status'),
            m.gap.n > 0
                ? 'Positive gap: the local return-map test gives the inward inequality s > u(s).'
                : m.gap.n < 0
                    ? 'Negative gap: this displacement fails the inward inequality. Try the other sign.'
                    : 'The gap is zero at the starting configuration. Choose a nonzero displacement.',
            m.gap.n > 0 ? 'inward' : m.gap.n < 0 ? 'fails' : '');
        $('map-case-note').textContent = mapA === 4
            ? 'Critical case: u′(0)=1. The exact gap is s²/(1+s), positive for either nonzero sign near zero.'
            : mapA < 4
                ? 'Derivative below one: a sufficiently small positive s gives an inward gap.'
                : 'Derivative above one: a sufficiently small negative s gives an inward gap.';
        for (const [name, A] of [['below', 3], ['critical', 4], ['above', 5]]) {
            $('map-' + name).setAttribute('aria-pressed', String(mapA === A));
        }
    }

    function setMap(A, S) {
        mapA = A;
        mapS = S;
        $('map-s').value = S;
        drawMap();
    }

    if ($('map-s')) {
        $('map-s').addEventListener('input', () => setMap(mapA, Number($('map-s').value)));
        for (const [name, A] of [['below', 3], ['critical', 4], ['above', 5]]) {
            $('map-' + name).addEventListener('click', () => setMap(A, mapS));
        }
        for (const [name, S] of [['negative', -100], ['zero', 0], ['positive', 100]]) {
            $('map-' + name).addEventListener('click', () => setMap(mapA, S));
        }
        drawMap();
    }

    const cases = {
        rising: { A: 1, B: 3, label: 'a=1/4, b=3/4' },
        falling: { A: 3, B: 1, label: 'a=3/4, b=1/4' },
        equal: { A: 2, B: 2, label: 'a=b=1/2' },
        zero: { A: 2, B: 0, label: 'a=1/2, b=0' }
    };

    function weightModel(A, B, S) {
        const a = A / 4, b = B / 4, s = S / 1000, L = [0.25, 0.5], X = [1, 0], Y = [(0.25 - a) / (1 - a), 0.5 / (1 - a)], Z = mul([(0.25 - b) / (1 - b), 0.5 / (1 - b)], Y), Ys = Y.map((z, i) => z + s * (z - X[i]));
        const coefficients = [
            rational(S * (1000 * (B - A) - S * (4 - B)), 4000 * (1000 + S)),
            rational(B * (1000 + S) - S * (4 - A), 4 * (1000 + S)),
            rational((1000 + S) * (4 - B), 4000)
        ];
        const fixed = [rational(250 * A + S, 1000 + S), rational(250 * (4 - A), 1000 + S)];
        return {
            a, b, s, L, X, Y, Z, Ys,
            xi: L, eta: mul(L, Y), etas: mul(L, Ys),
            coefficients, fixed,
            previousOK: fixed.every(r => r.n >= 0),
            inside: coefficients.every(r => r.n > 0),
            contained: coefficients.every(r => r.n >= 0)
        };
    }

    let weightCase = 'rising', weightS = 0;

    function drawWeights() {
        const s = $('weight-plot');
        if (!s) return;
        const c = cases[weightCase], m = weightModel(c.A, c.B, weightS), all = [m.X, m.Y, m.Z, m.Ys, m.xi, m.eta, m.etas];
        const xs = all.map(p => p[0]), ys = all.map(p => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
        const scale = Math.min(310 / (maxX - minX), 240 / (maxY - minY)), midX = (minX + maxX) / 2, midY = (minY + maxY) / 2;
        const coord = z => [220 + (z[0] - midX) * scale, 191 - (z[1] - midY) * scale];
        s.replaceChildren();
        s.append(el('title', {}, 'A local neighboring-weight slide and its two contact tests'));
        polygon(s, [m.X, m.Y, m.Z].map(coord), 'none', '#acbeb1', '5 4');
        polygon(s, [m.X, m.Ys, m.Z].map(coord), '#e8f2e8', teal);
        line(s, coord(m.Y), coord(m.Ys), amber, 1.8, '4 3');
        dot(s, coord(m.Y), '#fbfaf6', 4, '#a5b7aa');
        dot(s, coord(m.eta), '#fbfaf6', 3, '#a5b7aa');
        dot(s, coord(m.X), ink);
        dot(s, coord(m.Z), ink);
        dot(s, coord(m.Ys), amber, 5.5);
        dot(s, coord(m.xi), teal, 5);
        const color = m.inside && m.previousOK ? amber : !m.contained || !m.previousOK ? red : teal;
        dot(s, coord(m.etas), color, 6.5);
        const center = [(m.X[0] + m.Ys[0] + m.Z[0]) / 3, (m.X[1] + m.Ys[1] + m.Z[1]) / 3];
        for (const [z, label] of [[m.X, 'A'], [m.Z, 'C']]) {
            const p = coord(z), dx = z[0] - center[0], dy = z[1] - center[1], r = Math.hypot(dx, dy);
            txt(s, p[0] + 18 * dx / r, p[1] - 18 * dy / r + 4, label, 14, ink, 'middle');
        }
        const old = coord(m.Y), moved = coord(m.Ys);
        if (Math.abs(m.s) < 0.02) txt(s, moved[0] + 13, moved[1] - 12, 'B = Bₛ', 13, ink);
        else {
            if (Math.abs(m.s) > 0.15) txt(s, old[0] - 14, old[1] + 18, 'B', 12, muted, 'end');
            txt(s, moved[0] - 9, moved[1] - 14, 'Bₛ', 14, amber, 'middle');
        }
        const xi = coord(m.xi), eta = coord(m.etas);
        txt(s, xi[0] + 11, xi[1] + 17, 'ξ', 14, teal);
        txt(s, eta[0] - 10, eta[1] - 12, 'TBₛ', 13, color, 'end');
        txt(s, 28, 24, 'Exact local model: Tz = (1/4+i/2)z', 14, ink);
        txt(s, 28, 371, 'Dashed: original triangle · Solid: moved triangle', 10);
        $('weight-s-value').textContent = m.s.toFixed(3);
        $('weight-parameters').textContent = c.label;
        $('weight-fixed').textContent = `Fixed contact ξ at (A,Bₛ): (${m.fixed.map(frac).join(', ')})`;
        $('weight-coefficients').textContent = `Moved image at (A,Bₛ,C): (${m.coefficients.map(frac).join(', ')})`;
        let message, kind = '';
        if (m.s === 0) message = 'Both contacts begin on their edges. Test a small motion to see whether the moved image enters the triangle.';
        else if (m.previousOK && m.inside) {
            message = 'Both local tests pass: ξ remains on the first edge, and TBₛ lies strictly inside the triangle.';
            kind = 'inward';
        } else if (!m.previousOK || !m.contained) {
            message = 'This motion fails a local containment test. A negative coefficient places one of the required images outside its permitted face.';
            kind = 'fails';
        } else {
            message = 'A coefficient is zero: this is a boundary contact, rather than a strictly interior image.';
        }
        status($('weight-status'), message, kind);
        $('weight-note').textContent = c.A === c.B
            ? 'When a=b, the opposite-vertex coefficient is −(1−a)s²/(1+s). This slide fails for every nonzero small s.'
            : c.B === 0
                ? 'The zero b case is included: choose a negative s. The coefficient at Bₛ then becomes positive along with the other two.'
                : 'For unequal weights, choose a sufficiently small s with the sign of b−a. The opposite-vertex coefficient becomes positive.';
    }

    function setWeights(name, S) {
        weightCase = name;
        weightS = S;
        $('weight-case').value = name;
        $('weight-s').value = S;
        drawWeights();
    }

    if ($('weight-case')) {
        $('weight-case').addEventListener('change', () => setWeights($('weight-case').value, 0));
        $('weight-s').addEventListener('input', () => setWeights(weightCase, Number($('weight-s').value)));
        $('weight-test').addEventListener('click', () => {
            const c = cases[weightCase];
            setWeights(weightCase, c.B < c.A ? -100 : 100);
        });
        $('weight-reset').addEventListener('click', () => setWeights(weightCase, 0));
        $('weight-exact').addEventListener('click', () => setWeights('rising', 500));
        drawWeights();
    }

    window.KarpelevichRigidity = Object.freeze({ rational, projective, weightModel, mul, setMap, setWeights, cases });
})();

