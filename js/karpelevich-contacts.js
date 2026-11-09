'use strict';
(function () {
    const $ = id => document.getElementById(id), NS = 'http://www.w3.org/2000/svg';
    const ink = '#17343f', teal = '#168579', amber = '#d98026', muted = '#607b7e';
    const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];

    function el(tag, attrs = {}, value) {
        const e = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (value !== undefined) e.textContent = value;
        return e;
    }

    const point = z => [205 + 130 * z[0], 192 - 130 * z[1]], points = v => v.map(z => point(z).join(',')).join(' ');

    function txt(s, x, y, value, size = 12, color = muted, anchor = 'start') {
        s.append(el('text', {
            x, y, fill: color,
            'font-size': size,
            'font-family': 'system-ui,sans-serif',
            'text-anchor': anchor
        }, value));
    }

    function dot(s, z, color = ink, r = 4, stroke = 'none') {
        const [x, y] = point(z);
        s.append(el('circle', { cx: x, cy: y, r, fill: color, stroke, 'stroke-width': 2 }));
    }

    function segment(s, a, b, color, width = 2) {
        const p = point(a), q = point(b);
        s.append(el('path', {
            d: `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`,
            fill: 'none', stroke: color, 'stroke-width': width
        }));
    }

    function base(s, title) {
        s.replaceChildren();
        s.append(el('title', {}, title));
        s.append(el('path', { d: 'M45 192H365M205 32V352', stroke: '#e2e8de', 'stroke-width': 1 }));
        dot(s, [0, 0], muted, 2);
        txt(s, 214, 208, '0', 10);
    }

    function poly(s, v, fill, stroke, width = 2, opacity = 1) {
        s.append(el('polygon', {
            points: points(v),
            fill, stroke,
            'stroke-width': width,
            'fill-opacity': opacity
        }));
    }

    function status(node, text, type) {
        node.textContent = text;
        for (const name of ['contact', 'fails']) node.classList.toggle(name, type === name);
    }

    const square = [[1, 0], [0, 1], [-1, 0], [0, -1]], initial = [0.25, 0.5];
    let radial = 1;

    function drawSlack() {
        const s = $('slack-polygon');
        if (!s) return;
        const image = square.map(z => mul([radial * initial[0], radial * initial[1]], z)), l1 = 0.75 * radial;
        base(s, 'A fixed square and a radially expanded image');
        poly(s, square, '#edf2e9', ink);
        const type = l1 > 1 + 1e-10 ? 'fails' : Math.abs(l1 - 1) < 1e-10 ? 'contact' : 'strict';
        const color = type === 'fails' ? '#b05b46' : type === 'contact' ? amber : teal;
        poly(s, image, color, color, 2, 0.12);
        square.forEach(z => dot(s, z));
        image.forEach(z => dot(s, z, color, 5));
        for (let j = 0; j < 4; j++) {
            const z = square[j];
            txt(s, 205 + 151 * z[0], 196 - 151 * z[1], ['1', 'i', '−1', '−i'][j], 13, ink, 'middle');
        }
        txt(s, 28, 23, 'The fixed square Q and cλQ', 15, ink);
        txt(s, 28, 375, 'The shape of Q stays fixed throughout.', 11);
        $('slack-c-value').textContent = radial.toFixed(4);
        $('slack-norm').textContent = `|Re(cλ)| + |Im(cλ)| ≈ ${l1.toFixed(4)}`;
        const messages = {
            strict: 'Strict containment: all four image vertices are interior. This square has room for an outward radial improvement.',
            contact: 'First contact for this witness: at c = 4/3, all four image vertices lie on the square’s edges.',
            fails: 'This square no longer contains its image. This only rules out this witness; other polygons require separate analysis.'
        };
        status($('slack-status'), messages[type], type);
    }

    function setRadial(c) {
        radial = c;
        $('slack-c').value = Math.round(1000 * c);
        drawSlack();
    }

    if ($('slack-c')) {
        $('slack-c').addEventListener('input', () => setRadial(Number($('slack-c').value) / 1000));
        $('slack-reset').addEventListener('click', () => setRadial(1));
        $('slack-contact').addEventListener('click', () => setRadial(4 / 3));
        drawSlack();
    }

    let t = 0.5, orientation = 'lower', row = 1;

    function family(tVal, orient) {
        const lambda = [-0.5, (orient === 'lower' ? -1 : 1) * Math.sqrt(3 - 4 * tVal) / 2];
        const power = mul(lambda, lambda);
        const v = orient === 'lower' ? [[1, 0], power, lambda] : [[1, 0], lambda, power];
        const alpha = orient === 'lower' ? [0, tVal, 0] : [1, 1, 1 - tVal];
        const beta = alpha.map(a => 1 - a);
        const P = alpha.map((a, i) => Array.from({ length: 3 }, (_, j) => (j === (i + 1) % 3 ? a : 0) + (j === (i + 2) % 3 ? beta[i] : 0)));
        return { lambda, v, alpha, beta, P };
    }

    function drawContacts() {
        const s = $('contact-polygon');
        if (!s) return;
        const { lambda, v, alpha, beta, P } = family(t, orientation), image = v.map(z => mul(lambda, z));
        base(s, 'An exact radially extremal triangle, its image, and the selected supporting edge');
        poly(s, v, '#edf2e9', ink, 2.2);
        poly(s, image, '#b9dfcf', teal, 2, 0.32);
        segment(s, v[(row + 1) % 3], v[(row + 2) % 3], amber, 4.5);
        v.forEach((z, i) => {
            dot(s, z, ink, 4.3);
            const p = point(z), r = Math.hypot(...z), dx = r ? 18 * z[0] / r : 0, dy = r ? -18 * z[1] / r : 0;
            txt(s, p[0] + dx, p[1] + dy + 4, ['z₀', 'z₁', 'z₂'][i], 14, ink, 'middle');
        });
        image.forEach(z => dot(s, z, '#fbfaf6', 5, teal));
        dot(s, image[row], amber, 6.5);
        txt(s, 28, 23, orientation === 'lower' ? 'Game orientation: every β is positive' : 'Reflected orientation: every α is positive', 14, ink);
        txt(s, 28, 375, 'Amber edge: the two permitted target vertices.', 11);

        const m = $('contact-matrix');
        m.replaceChildren();
        m.append(el('title', {}, 'The three by three realizing stochastic matrix'));
        txt(m, 26, 24, 'The realizing matrix Pₜ', 15, ink);
        const left = 106, top = 66, cell = 64;
        for (let i = 0; i < 3; i++) {
            txt(m, left - 17, top + (i + 0.5) * cell + 4, ['z₀', 'z₁', 'z₂'][i], 13, muted, 'end');
            txt(m, left + (i + 0.5) * cell, top - 14, ['z₀', 'z₁', 'z₂'][i], 13, muted, 'middle');
            for (let j = 0; j < 3; j++) {
                const value = P[i][j];
                m.append(el('rect', {
                    x: left + j * cell, y: top + i * cell,
                    width: cell - 4, height: cell - 4, rx: 5,
                    fill: value ? '#168579' : '#f2f4eb',
                    opacity: value ? 0.18 + 0.82 * value : 1
                }));
                txt(m, left + (j + 0.5) * cell - 2, top + (i + 0.5) * cell + 4, value.toFixed(3), 13, value > 0.58 ? 'white' : ink, 'middle');
            }
        }
        m.append(el('rect', {
            x: left - 5, y: top + row * cell - 5,
            width: 3 * cell + 6, height: cell + 6, rx: 8,
            fill: 'none', stroke: amber, 'stroke-width': 2
        }));
        txt(m, 26, 291, 'Only cyclic offsets 1 and 2 can be nonzero.', 11);

        $('contact-t-value').textContent = t.toFixed(3);
        $('contact-value').textContent = `λₜ = −0.500 ${orientation === 'lower' ? '−' : '+'} ${Math.abs(lambda[1]).toFixed(3)}i · |λₜ| = ${Math.hypot(...lambda).toFixed(3)}`;
        $('contact-coefficients').textContent = `α = (${alpha.map(a => a.toFixed(3)).join(', ')}) · β = (${beta.map(a => a.toFixed(3)).join(', ')})`;
        const edge = alpha[row] > 1e-12 && beta[row] > 1e-12;
        $('contact-row-equation').textContent = `Row ${row + 1}: λₜz${row} = ${alpha[row].toFixed(3)} z${(row + 1) % 3} + ${beta[row].toFixed(3)} z${(row + 2) % 3}`;
        status($('contact-status'), edge
            ? 'Edge contact: both coefficients are positive. The image lies strictly between the highlighted edge’s endpoints.'
            : 'Vertex contact: one coefficient is zero. The image equals an endpoint of the highlighted edge.', edge ? 'contact' : 'strict');
        $('contact-orientation-note').textContent = orientation === 'lower'
            ? 'Every β is positive. A zero α gives the empty-site convention used in the chip game.'
            : 'Some β coefficients vanish. Reflecting back restores the game’s convention; the coefficients cannot be changed by simply renaming the endpoint roles.';
        for (const name of ['lower', 'upper']) $('contact-' + name).setAttribute('aria-pressed', String(orientation === name));
    }

    function setFamily(value, side = orientation) {
        t = value;
        orientation = side;
        $('contact-t').value = Math.round(1000 * t);
        drawContacts();
    }

    if ($('contact-t')) {
        $('contact-t').addEventListener('input', () => setFamily(Number($('contact-t').value) / 1000));
        $('contact-row').addEventListener('change', () => {
            row = Number($('contact-row').value);
            drawContacts();
        });
        $('contact-example').addEventListener('click', () => {
            row = 1;
            $('contact-row').value = '1';
            setFamily(0.5, 'lower');
        });
        $('contact-root').addEventListener('click', () => setFamily(0));
        for (const side of ['lower', 'upper']) {
            $('contact-' + side).addEventListener('click', () => {
                orientation = side;
                drawContacts();
            });
        }
        drawContacts();
    }

    window.KarpelevichContacts = Object.freeze({ family, mul, square, setRadial, setFamily });
})();

