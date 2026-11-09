/**
 * Karpelevich Proof Series — Stop 9 Interactive Explorers
 * Closing the Boundary: Old Arcs, New Arcs, and Induction
 */
'use strict';

(function () {
    const $ = id => document.getElementById(id);
    const NS = 'http://www.w3.org/2000/svg';
    const ink = '#17343f';
    const teal = '#168579';
    const amber = '#d98026';
    const gray = '#9aaba4';
    const muted = '#607b7e';

    const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
    const compare = (a, b) => Math.sign(a.n * b.d - b.n * a.d);
    const label = a => `${a.n}/${a.d}`;
    const fraction = (n, d) => {
        const g = gcd(n, d);
        return { n: n / g, d: d / g };
    };
    const reflect = a => fraction(a.d - a.n, a.d);

    function farey(n) {
        const out = [];
        for (let d = 1; d <= n; d++) {
            for (let a = 0; a <= d; a++) {
                if (gcd(a, d) === 1) out.push({ n: a, d });
            }
        }
        return out.sort(compare);
    }

    function classify(n, A, B) {
        const leftDiv = n % A.d === 0;
        const rightDiv = n % B.d === 0;
        return {
            leftDiv,
            rightDiv,
            fresh: leftDiv || rightDiv,
            landmark: A.d === n || B.d === n,
            oldPair: A.d < n && B.d < n
        };
    }

    function comparison(n, A, B) {
        const c = classify(n, A, B);
        if (!c.fresh) return null;
        const chooseRight = c.rightDiv && B.n < B.d;
        const conjugate = !chooseRight;
        const k = chooseRight ? B.n * (n / B.d) : (A.d - A.n) * (n / A.d);
        const g = gcd(k, n);
        const seq = farey(n);
        const center = fraction(k, n);
        const j = seq.findIndex(f => compare(f, center) === 0);
        const left = seq[j - 1];
        const right = seq[j + 1];
        const m = g === 1 ? Math.min(left.d, right.d) * Math.floor((n - 1) / Math.min(left.d, right.d)) : left.d;
        return {
            k, g, m, center, left, right, conjugate,
            orientedLeft: conjugate ? reflect(B) : A,
            orientedRight: conjugate ? reflect(A) : B
        };
    }

    function el(tag, attrs = {}, value) {
        const e = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (value !== undefined) e.textContent = String(value);
        return e;
    }

    function txt(svg, x, y, value, size = 13, color = muted, anchor = 'start') {
        svg.append(el('text', {
            x, y, fill: color, 'font-size': size,
            'font-family': 'system-ui,sans-serif', 'text-anchor': anchor
        }, value));
    }

    function line(svg, A, B, color = muted, width = 1.3, dash = '') {
        svg.append(el('path', {
            d: `M${A}L${B}`,
            fill: 'none', stroke: color, 'stroke-width': width, 'stroke-dasharray': dash
        }));
    }

    function dot(svg, p, color = ink, r = 4) {
        svg.append(el('circle', { cx: p[0], cy: p[1], r, fill: color, stroke: color, 'stroke-width': 1.5 }));
    }

    function arc(svg, A, B, cx, cy, r, color, width = 4) {
        const points = [];
        for (let j = 0; j <= 30; j++) {
            const theta = (A.n / A.d + (B.n / B.d - A.n / A.d) * j / 30) * 2 * Math.PI;
            points.push([cx + r * Math.cos(theta), cy - r * Math.sin(theta)]);
        }
        svg.append(el('path', {
            d: 'M' + points.map(p => p.join(',')).join('L'),
            fill: 'none', stroke: color, 'stroke-width': width
        }));
    }

    function options(node, items, value) {
        if (!node) return;
        node.replaceChildren();
        for (const item of items) {
            const o = document.createElement('option');
            o.value = String(item.value);
            o.textContent = item.label;
            node.append(o);
        }
        node.value = String(value);
    }

    let order = 6, pairIndex = 0, sequence = [], pairs = [];
    function drawAtlas() {
        const s = $('ancestry-plot');
        if (!s || !pairs.length) return;
        const { left: A, right: B } = pairs[pairIndex];
        const c = classify(order, A, B);
        const cx = 250, cy = 280, r = 177;
        s.replaceChildren();
        s.append(el('title', {}, 'Farey angular intervals colored by the original induction criterion'));
        line(s, [55, cy], [445, cy], '#d3ddd1', 1);
        let freshCount = 0, landmarkCount = 0;
        for (const p of pairs) {
            const state = classify(order, p.left, p.right);
            if (state.fresh) freshCount++;
            if (state.landmark) landmarkCount++;
            arc(s, p.left, p.right, cx, cy, r, state.fresh ? teal : gray, 4.5);
        }
        arc(s, A, B, cx, cy, r, amber, 8);
        const at = f => [cx + r * Math.cos(2 * Math.PI * f.n / f.d), cy - r * Math.sin(2 * Math.PI * f.n / f.d)];
        for (const f of sequence) dot(s, at(f), f.d === order ? teal : '#9cafa2', 3);
        dot(s, at(A), amber, 5.5);
        dot(s, at(B), amber, 5.5);
        txt(s, 25, 27, `Angular arc map · order ${order}`, 17, ink);
        txt(s, 451, cy + 5, '0 turn', 11);
        txt(s, 18, cy + 5, '1/2', 12);
        txt(s, cx, 85, '1/4', 12, muted, 'middle');
        txt(s, 25, 334, 'The guide radius is fixed; the arcs encode angular intervals.', 10);

        $('ancestry-n-value').textContent = order;
        $('ancestry-pair-label').textContent = label(A) + ' < θ < ' + label(B);
        $('ancestry-type').textContent = c.fresh
            ? (c.landmark ? 'New arc · new unit-circle landmark' : 'New arc · existing endpoint landmarks')
            : 'Inherited arc from order ' + (order - 1);
        $('ancestry-type').setAttribute('data-kind', c.fresh ? 'new' : 'old');
        $('ancestry-divisibility').textContent = `${A.d} ${c.leftDiv ? 'divides' : 'does not divide'} ${order}; ${B.d} ${c.rightDiv ? 'divides' : 'does not divide'} ${order}.`;
        $('ancestry-determinant').textContent = `bc − ad = ${A.d}×${B.n} − ${A.n}×${B.d} = 1; b+d = ${A.d + B.d} > ${order}.`;
        $('ancestry-quotients').textContent = `Division quotients at ${order - 1} → ${order}: denominator ${A.d}: ${Math.floor((order - 1) / A.d)} → ${Math.floor(order / A.d)}; denominator ${B.d}: ${Math.floor((order - 1) / B.d)} → ${Math.floor(order / B.d)}.`;
        if (c.landmark) {
            const f = A.d === order ? A : B;
            const previous = farey(order - 1);
            const lo = previous.filter(p => compare(p, f) < 0).at(-1);
            const hi = previous.find(p => compare(p, f) > 0);
            $('ancestry-history').textContent = `The new fraction ${label(f)} splits the old Farey interval ${label(lo)} to ${label(hi)}.`;
        } else {
            $('ancestry-history').textContent = c.fresh
                ? 'Both endpoint landmarks and this Farey interval already existed. A division quotient changes at the new order.'
                : 'The same Farey interval occurs one order earlier, and both division quotients stay unchanged.';
        }
        const cmp = comparison(order, A, B);
        $('ancestry-comparison').textContent = cmp
            ? `Chosen ${cmp.conjugate ? 'conjugate ' : ''}orientation: k=${cmp.k}, gcd(k,n)=${cmp.g}, comparison order n* = ${cmp.m}.`
            : 'The angular estimates exclude a new extremum in this inherited interval.';
        $('ancestry-counts').textContent = `Upper half: ${pairs.length - freshCount} inherited arcs · ${freshCount} new arcs (${freshCount - landmarkCount} with existing endpoints).`;
    }

    function setAtlas(n, preferred = { n: 1, d: 4 }) {
        order = n;
        sequence = farey(n).filter(f => 2 * f.n <= f.d);
        pairs = sequence.slice(0, -1).map((left, i) => ({ left, right: sequence[i + 1] }));
        pairIndex = pairs.findIndex(p => compare(p.left, preferred) === 0);
        if (pairIndex < 0) pairIndex = 0;
        if ($('ancestry-n')) $('ancestry-n').value = n;
        options($('ancestry-pair'), pairs.map((p, i) => ({ value: i, label: label(p.left) + ' to ' + label(p.right) })), pairIndex);
        drawAtlas();
    }

    if ($('ancestry-plot')) {
        $('ancestry-n').addEventListener('input', () => setAtlas(Number($('ancestry-n').value)));
        $('ancestry-pair').addEventListener('change', () => {
            pairIndex = Number($('ancestry-pair').value);
            drawAtlas();
        });
        $('ancestry-five').addEventListener('click', () => setAtlas(5));
        $('ancestry-six').addEventListener('click', () => setAtlas(6));
        $('ancestry-eight').addEventListener('click', () => setAtlas(8));
        $('ancestry-landmark').addEventListener('click', () => setAtlas(8, { n: 1, d: 3 }));
        setAtlas(6);
    }

    const absInt = n => n < 0n ? -n : n;
    function bigGcd(a, b) {
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
        const g = bigGcd(n, d);
        return { n: n / g, d: d / g };
    }

    const add = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
    const sub = (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
    const mul = (a, b) => rat(a.n * b.n, a.d * b.d);
    const val = a => Number(a.n) / Number(a.d);
    const rlabel = a => a.d === 1n ? String(a.n).replace('-', '−') : `${a.n}/${a.d}`.replace('-', '−');

    function marginModel(u) {
        const r = rat(1024 + u, 1024);
        const gap = sub(rat(12), mul(rat(11), mul(r, r)));
        return { r, gap, strict: gap.n > 0n };
    }

    function setMargin(u) {
        const m = marginModel(u);
        const r = val(m.r);
        if ($('margin-scale')) $('margin-scale').value = u;
        const s = $('margin-plot');
        if (!s) return m;
        const cx = 270, cy = 240, scale = 180;
        const roots = Array.from({ length: 6 }, (_, j) => [Math.cos(j * Math.PI / 3), Math.sin(j * Math.PI / 3)]);
        const lambda = [-0.25, Math.sqrt(11) / 4];
        const product = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
        const point = p => [cx + scale * p[0], cy - scale * p[1]];
        const image = roots.map(v => product(lambda, v));
        const expanded = image.map(p => p.map(v => r * v));
        s.replaceChildren();
        s.append(el('title', {}, 'The regular hexagon and all images under the selected radial expansion of an old boundary point'));
        const poly = (points, fill, stroke, dash = '') => s.append(el('polygon', {
            points: points.map(point).map(p => p.join(',')).join(' '),
            fill, stroke, 'stroke-width': 1.7, 'stroke-dasharray': dash
        }));
        poly(roots, '#e3f1e7', teal);
        poly(expanded, '#f6e4c8', amber);
        poly(image, 'none', gray, '4 4');
        for (const v of roots) dot(s, point(v), teal, 4);
        for (const v of image) dot(s, point(v), gray, 3);
        for (const v of expanded) dot(s, point(v), amber, 4);
        dot(s, [cx, cy], muted, 2);
        const active = point(expanded[0]);
        txt(s, active[0] - 19, active[1] - 11, 'ν', 19, amber);
        txt(s, 25, 27, 'All six images must remain strictly inside Q', 16, ink);
        txt(s, 459, cy + 5, '1', 13);
        txt(s, cx + 7, cy + 18, '0', 11);
        txt(s, 25, 435, 'Teal: Q · Gray: λ₀Q · Amber: νQ', 12);

        $('margin-scale-value').textContent = rlabel(m.r);
        const coefficient = mul(m.r, rat(1, 4));
        $('margin-multiplier').textContent = `ν = −${rlabel(coefficient)} + (${rlabel(coefficient)})i√11`;
        $('margin-gap').textContent = `12 − 11r² = ${rlabel(m.gap)} ${m.gap.n > 0n ? '>' : m.gap.n < 0n ? '<' : '='} 0`;
        const status = $('margin-status');
        status.textContent = m.strict
            ? 'All six image vertices are strictly inside Q. This multiplier is an interior point of K₆.'
            : 'This hexagon no longer contains all image vertices. Its failure gives no conclusion about membership in K₆.';
        status.setAttribute('data-kind', m.strict ? 'inside' : 'uncertified');
        return m;
    }

    if ($('margin-plot')) {
        $('margin-scale').addEventListener('input', () => setMargin(Number($('margin-scale').value)));
        $('margin-original').addEventListener('click', () => setMargin(0));
        $('margin-example').addEventListener('click', () => setMargin(32));
        $('margin-near').addEventListener('click', () => setMargin(45));
        $('margin-beyond').addEventListener('click', () => setMargin(128));
        setMargin(32);
    }

    window.KarpelevichInduction = Object.freeze({
        gcd, farey, fraction, compare, reflect, classify, comparison,
        setAtlas, rat, add, sub, mul, val, rlabel, marginModel, setMargin
    });
})();

