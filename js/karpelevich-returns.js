'use strict';
(function () {
    const $ = id => document.getElementById(id), SVG = 'http://www.w3.org/2000/svg', MATH = 'http://www.w3.org/1998/Math/MathML';
    const ink = '#17343f', teal = '#168579', amber = '#d98026', muted = '#607b7e';
    const gcd = (a, b) => b ? gcd(b, a % b) : a, mod = (a, n) => (a % n + n) % n;
    const sub = i => String(i).replace(/[0-9]/g, c => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]);

    function el(tag, attrs = {}, value, ns = SVG) {
        const e = document.createElementNS(ns, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (value !== undefined) e.textContent = String(value);
        return e;
    }

    function txt(s, x, y, value, size = 12, color = muted, anchor = 'start') {
        s.append(el('text', {
            x, y, fill: color,
            'font-size': size,
            'font-family': 'system-ui,sans-serif',
            'text-anchor': anchor
        }, value));
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

    function euclid(n, k) {
        const remainders = [n, k], divisions = [];
        let a = n, b = k;
        while (b) {
            const r = a % b;
            divisions.push({ a, b, quotient: Math.floor(a / b), remainder: r });
            if (r) remainders.push(r);
            a = b;
            b = r;
        }
        return { remainders, divisions };
    }

    function recordData(n, k) {
        const d = gcd(n, k), orbit = Array.from({ length: n / d }, (_, j) => j * k % n), maxima = [], minima = [];
        let hi = -1, lo = n;
        orbit.forEach((a, j) => {
            if (a > hi) { maxima.push({ time: j, value: a }); hi = a; }
            if (a > 0 && a < lo) { minima.push({ time: j, value: a }); lo = a; }
        });
        let L = k, U = n - k, p = 1, q = 1;
        const states = [{ L, U, p, q, event: 'The first nonzero entry is both a positive minimum and a maximum.' }];
        while (L !== U) {
            let event;
            if (L > U) {
                L -= U; p += q;
                event = `New minimum a${sub(p)} = ${L}.`;
            } else {
                U -= L; q += p;
                event = `New maximum a${sub(q)} = ${n - U}; its gap is ${U}.`;
            }
            states.push({ L, U, p, q, event });
        }
        return { d, orbit, maxima, minima, states, candidates: maxima.map(x => n - x.value), ...euclid(n, k) };
    }

    function firstReturn(n, k, phi, i) {
        const period = n / gcd(n, k), path = [i % n];
        for (let t = 1; t <= period; t++) {
            const a = (i + t * k) % n, target = a || n;
            if (target <= phi) return { start: i, steps: t, target, path };
            path.push(a);
        }
        throw Error('The target block must meet every residue class.');
    }

    function model(n, k, phi) {
        const data = recordData(n, k);
        if (!data.candidates.includes(phi)) throw Error('The block must be a complementary record gap.');
        const chains = Array.from({ length: phi }, (_, i) => firstReturn(n, k, phi, i + 1));
        if (phi === n) return { ...data, chains, kind: 'full' };
        if (phi === data.d) return { ...data, chains, kind: 'gcd', length: n / data.d };
        const pair = data.states.find(s => s.U === phi && s.L < phi);
        if (!pair) throw Error('Missing selected record pair.');
        return { ...data, chains, kind: 'two', r: pair.L, p: pair.p, q: pair.q };
    }

    let n = 8, k = 3, phi = 2, stage = 0, base = 1, walk = 0, data = recordData(n, k);

    function drawRecords() {
        const s = $('record-orbit');
        if (!s) return;
        s.replaceChildren();
        s.append(el('title', {}, 'The modular orbit with record maxima and positive record minima'));
        const pair = data.states[stage], maxTimes = new Set(data.maxima.map(x => x.time)), minTimes = new Set(data.minima.map(x => x.time)), width = 744 / data.orbit.length, bottom = 232;
        s.append(el('path', { d: 'M54 232H808M54 42H808', stroke: '#d1ddd2', 'stroke-width': 1.2, 'stroke-dasharray': '4 5' }));
        txt(s, 817, 46, 'n', 11);
        data.orbit.forEach((a, j) => {
            const x = 61 + (j + 0.5) * width, h = 190 * a / n, w = Math.min(width * 0.62, 44);
            const fill = maxTimes.has(j) ? amber : minTimes.has(j) ? teal : '#cbd8cd';
            const active = j === pair.p || j === pair.q;
            if (a) {
                s.append(el('rect', {
                    x: x - w / 2, y: bottom - h,
                    width: w, height: h, rx: 3,
                    fill,
                    stroke: active ? ink : minTimes.has(j) ? teal : fill,
                    'stroke-width': active ? 3 : minTimes.has(j) ? 2 : 1
                }));
            } else {
                s.append(el('circle', { cx: x, cy: bottom, r: 4.5, fill: amber }));
            }
            txt(s, x, bottom - h - 8, a, 11, ink, 'middle');
            txt(s, x, bottom + 20, j, 10, muted, 'middle');
        });
        txt(s, 24, 252, 'm', 11);
        txt(s, 54, 286, 'Amber: maximum record · Teal: positive minimum · Dark outline: selected pair', 11);
        $('record-stage').max = data.states.length - 1;
        $('record-stage').value = stage;
        $('record-stage-value').textContent = `${stage + 1} / ${data.states.length}`;
        $('record-prev').disabled = stage === 0;
        $('record-next').disabled = stage === data.states.length - 1;
        $('record-pair').textContent = `L = ${pair.L} at p = ${pair.p} · U = ${pair.U} at q = ${pair.q}`;
        $('record-identity').textContent = `pU + qL = ${pair.p}×${pair.U} + ${pair.q}×${pair.L} = ${n}`;
        $('record-event').textContent = pair.event + (pair.L === pair.U ? ` The pair has reached g = ${data.d}; the next time is the period ${n / data.d}.` : '');
        $('record-divisions').textContent = data.divisions.map(x => `${x.a} = ${x.quotient}×${x.b}${x.remainder ? ' + ' + x.remainder : ''}`).join('   ·   ');
        const list = $('record-candidates');
        list.replaceChildren();
        for (const value of data.candidates) {
            const chip = document.createElement('span');
            chip.textContent = String(value);
            chip.setAttribute('class', value === phi ? 'chosen' : '');
            list.append(chip);
        }
    }

    function circlePoint(i) {
        const a = -Math.PI / 2 - 2 * Math.PI * i / n;
        return [205 + 110 * Math.cos(a), 174 + 110 * Math.sin(a)];
    }

    function arrow(s, a, b, active = false) {
        const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
        const A = [a[0] + 11 * ux, a[1] + 11 * uy], B = [b[0] - 13 * ux, b[1] - 13 * uy];
        s.append(el('path', { d: `M${A}L${B}`, fill: 'none', stroke: teal, 'stroke-width': active ? 2.6 : 1.6, opacity: active ? 1 : 0.45 }));
        s.append(el('path', { d: `M${B[0] - 7 * ux + 3.5 * uy} ${B[1] - 7 * uy - 3.5 * ux}L${B}L${B[0] - 7 * ux - 3.5 * uy} ${B[1] - 7 * uy + 3.5 * ux}`, fill: 'none', stroke: teal, 'stroke-width': 1.5, opacity: active ? 1 : 0.45 }));
    }

    function relation(node, power, start, target, weighted) {
        node.replaceChildren();
        const math = el('math', { display: 'block' }, undefined, MATH), row = el('mrow', {}, undefined, MATH), sup = el('msup', {}, undefined, MATH);
        sup.append(el('mi', {}, 'λ', MATH), el('mn', {}, power, MATH));
        row.append(sup);
        for (const item of [['x', start], ['=', null], [weighted ? 'ξ' : 'x', target]]) {
            if (item[1] === null) row.append(el('mo', {}, item[0], MATH));
            else {
                const z = el('msub', {}, undefined, MATH);
                z.append(el('mi', {}, item[0], MATH), el('mn', {}, item[1], MATH));
                row.append(z);
            }
        }
        math.append(row);
        node.append(math);
    }

    function drawReturns() {
        const s = $('return-board');
        if (!s) return;
        const m = model(n, k, phi), chain = m.chains[base - 1];
        walk = Math.min(walk, chain.steps);
        const T = new Set(Array.from({ length: phi }, (_, j) => (j + 1) % n)), S = new Set([...T].map(j => mod(j - k, n)));
        s.replaceChildren();
        s.append(el('title', {}, 'An index board showing the deterministic steps before the selected weighted contact'));
        s.append(el('circle', { cx: 205, cy: 174, r: 110, fill: 'none', stroke: '#d0dcd1', 'stroke-width': 1.1, 'stroke-dasharray': '4 5' }));
        for (let j = 1; j <= Math.min(walk, chain.steps - 1); j++) {
            arrow(s, circlePoint(chain.path[j - 1]), circlePoint(chain.path[j]), j === walk);
        }
        const current = chain.path[Math.min(walk, chain.steps - 1)];
        for (let i = 0; i < n; i++) {
            const [x, y] = circlePoint(i), a = -Math.PI / 2 - 2 * Math.PI * i / n;
            s.append(el('circle', {
                cx: x, cy: y, r: 7,
                fill: S.has(i) ? amber : '#fffefa',
                stroke: T.has(i) ? teal : '#9eb7a5',
                'stroke-width': T.has(i) ? 2.3 : 1.3
            }));
            if (i === current) s.append(el('circle', { cx: x, cy: y, r: 12, fill: 'none', stroke: ink, 'stroke-width': 2 }));
            txt(s, 205 + 132 * Math.cos(a), 178 + 132 * Math.sin(a), i, 12, ink, 'middle');
        }
        txt(s, 205, 17, `n = ${n} · k = ${k} · φ = ${phi}`, 14, ink, 'middle');
        txt(s, 205, 334, walk === chain.steps ? `Final weighted image: ξ${sub(chain.target % n)}` : `Vertices visited: ${Math.min(walk + 1, chain.steps)}`, 12, walk === chain.steps ? amber : muted, 'middle');
        relation($('return-relation'), walk, base % n, walk === chain.steps ? chain.target % n : current, walk === chain.steps);
        $('return-progress').textContent = `Step ${walk} of ${chain.steps}`;
        $('return-prev').disabled = walk === 0;
        $('return-next').disabled = walk === chain.steps;
        $('return-status').textContent = walk === chain.steps
            ? 'This last image is an edge point ξ, not the target vertex x. The final weighted step is included in the exponent.'
            : walk === chain.steps - 1
                ? 'The current source is chipped. Its next image is the weighted contact; it is not a deterministic step to a vertex.'
                : 'The next step is deterministic: multiply by λ and add k to the vertex index.';
        $('return-profile').textContent = m.kind === 'two'
            ? `r = ${m.r} · p = ${m.p} · q = ${m.q}. There are ${phi - m.r} chains of length ${m.p} and ${m.r} of length ${m.p + m.q}.`
            : m.kind === 'gcd'
                ? `φ = g = ${m.d}. Each of the ${m.d} chains has ${m.length} steps.`
                : `φ = n = ${n}. Every chain has one vertex and one weighted step.`;
        $('return-count').textContent = m.kind === 'two'
            ? `n = pφ + qr = ${m.p}×${phi} + ${m.q}×${m.r} = ${n}`
            : m.kind === 'gcd'
                ? `n = d × (n/d) = ${m.d}×${m.length} = ${n}`
                : `n = ${n}×1`;
        const body = $('return-chains');
        body.replaceChildren();
        for (const c of m.chains) {
            const tr = document.createElement('tr');
            if (c.start === base) tr.setAttribute('class', 'selected');
            for (const value of ['x' + sub(c.start % n), c.path.join(', '), String(c.steps), 'ξ' + sub(c.target % n)]) {
                const td = document.createElement('td');
                td.textContent = value;
                tr.append(td);
            }
            body.append(tr);
        }
    }

    function resetReturn(phiValue) {
        phi = phiValue;
        base = 1;
        walk = 0;
        options($('return-base'), Array.from({ length: phi }, (_, i) => ({ value: i + 1, label: 'x' + sub((i + 1) % n) })), base);
        drawReturns();
        drawRecords();
    }

    function configure(nValue, kValue, preferredPhi) {
        n = nValue;
        k = kValue;
        data = recordData(n, k);
        stage = 0;
        options($('record-k'), Array.from({ length: n - 1 }, (_, i) => ({ value: i + 1, label: String(i + 1) })), k);
        $('record-n').value = String(n);
        const proper = data.candidates.filter(v => v > data.d && v < n);
        const chosen = data.candidates.includes(preferredPhi) ? preferredPhi : proper.length ? proper.at(-1) : data.d;
        options($('return-phi'), data.candidates.map(v => ({ value: v, label: `${v}${v === n ? ' · full block' : v === data.d ? ' · gcd case' : ''}` })), chosen);
        resetReturn(chosen);
    }

    if ($('record-n')) {
        $('record-n').addEventListener('change', () => configure(Number($('record-n').value), Math.min(k, Number($('record-n').value) - 1)));
        $('record-k').addEventListener('change', () => configure(n, Number($('record-k').value)));
        $('record-stage').addEventListener('input', () => { stage = Number($('record-stage').value); drawRecords(); });
        $('record-prev').addEventListener('click', () => { if (stage > 0) stage--; drawRecords(); });
        $('record-next').addEventListener('click', () => { if (stage < data.states.length - 1) stage++; drawRecords(); });
        for (const [id, a, b, c] of [['preset-eight', 8, 3, 2], ['preset-thirteen', 13, 5, 3], ['preset-gcd', 8, 2, 2]]) {
            $(id).addEventListener('click', () => configure(a, b, c));
        }
        $('return-phi').addEventListener('change', () => resetReturn(Number($('return-phi').value)));
        $('return-base').addEventListener('change', () => { base = Number($('return-base').value); walk = 0; drawReturns(); });
        $('return-prev').addEventListener('click', () => { if (walk > 0) walk--; drawReturns(); });
        $('return-next').addEventListener('click', () => {
            const c = firstReturn(n, k, phi, base);
            if (walk < c.steps) walk++;
            drawReturns();
        });
        $('return-reset').addEventListener('click', () => { walk = 0; drawReturns(); });
        configure(8, 3, 2);
    }

    window.KarpelevichReturns = Object.freeze({ gcd, recordData, euclid, firstReturn, model, configure });
})();

