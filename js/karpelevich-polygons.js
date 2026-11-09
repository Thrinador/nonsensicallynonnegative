'use strict';
(function () {
    const $ = id => document.getElementById(id), NS = 'http://www.w3.org/2000/svg';
    const vertices = [[1, 0], [0, 1], [-1, 0], [0, -1]], labels = ['1', 'i', '−1', '−i'];
    const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];

    function el(tag, attrs = {}, value) {
        const e = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (value !== undefined) e.textContent = value;
        return e;
    }

    function txt(s, x, y, value, size = 12, color = '#607b7e', anchor = 'start', extra = {}) {
        s.append(el('text', {
            x,
            y,
            fill: color,
            'font-size': size,
            'font-family': 'system-ui,sans-serif',
            'text-anchor': anchor,
            ...extra
        }, value));
    }

    const coords = z => [205 + 130 * z[0], 192 - 130 * z[1]], pts = vv => vv.map(z => coords(z).join(',')).join(' ');
    function dot(s, z, color, r = 4) {
        const [x, y] = coords(z);
        s.append(el('circle', { cx: x, cy: y, r, fill: color }));
    }

    function basePlot(s, title) {
        s.replaceChildren();
        s.append(el('title', {}, title));
        s.append(el('circle', {
            cx: 205, cy: 192, r: 130,
            fill: 'none', stroke: '#d0dcd0',
            'stroke-width': 1.2, 'stroke-dasharray': '4 5'
        }));
        s.append(el('path', {
            d: 'M52 192H358M205 39V345',
            stroke: '#e0e7db', 'stroke-width': 1
        }));
        dot(s, [0, 0], '#86988a', 2.3);
        txt(s, 214, 206, '0', 10);
    }

    function weights(x, y) {
        return [
            (1 - Math.abs(y) + x) / 2,
            Math.max(y, 0),
            (1 - Math.abs(y) - x) / 2,
            Math.max(-y, 0)
        ].map(v => Math.abs(v) < 1e-12 ? 0 : v);
    }

    function matrix(w) {
        return Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => w[(j - i + 4) % 4]));
    }

    let x = 0.25, y = 0.5, row = 0;

    function drawRow() {
        const w = weights(x, y), P = matrix(w), lambda = [x, y], images = vertices.map(z => mul(lambda, z)), s = $('row-polygon');
        if (!s) return;
        basePlot(s, 'The fixed square contains its image under the chosen eigenvalue');
        s.append(el('polygon', { points: pts(vertices), fill: '#eef3eb', stroke: '#17343f', 'stroke-width': 2.2 }));
        const support = vertices.filter((_, j) => P[row][j] > 1e-12);
        if (support.length >= 3) {
            s.append(el('polygon', { points: pts(support), fill: '#eecb94', 'fill-opacity': 0.2, stroke: 'none' }));
        }
        s.append(el('polygon', { points: pts(images), fill: '#168579', 'fill-opacity': 0.11, stroke: '#168579', 'stroke-width': 1.9 }));
        vertices.forEach((z, i) => {
            dot(s, z, '#17343f', 4);
            const p = [205 + 153 * z[0], 192 - 153 * z[1]];
            txt(s, p[0], p[1] + 4, labels[i], 13, '#365751', 'middle');
        });
        images.forEach(z => dot(s, z, '#168579', 4));
        dot(s, images[row], '#d98026', 6.5);
        txt(s, 30, 24, 'Q and λQ', 16, '#234d52');
        txt(s, 30, 372, 'Amber: image for the selected matrix row', 11);

        const m = $('row-matrix');
        m.replaceChildren();
        m.append(el('title', {}, 'A four by four stochastic matrix whose selected eigenvalue is the chosen complex multiplier'));
        txt(m, 32, 24, 'The stochastic matrix P', 16, '#234d52');
        const left = 93, top = 80, c = 57;
        for (let i = 0; i < 4; i++) {
            txt(m, left - 16, top + (i + 0.5) * c + 4, labels[i], 13, '#496e5d', 'end');
            txt(m, left + (i + 0.5) * c, top - 14, labels[i], 13, '#496e5d', 'middle');
            for (let j = 0; j < 4; j++) {
                const v = P[i][j];
                m.append(el('rect', {
                    x: left + j * c, y: top + i * c,
                    width: c - 3, height: c - 3, rx: 5,
                    fill: v > 0 ? '#168579' : '#f2f4eb',
                    opacity: v > 0 ? 0.17 + 0.83 * v : 1
                }));
                txt(m, left + (j + 0.5) * c - 1, top + (i + 0.5) * c + 4, v.toFixed(3), 12, v > 0.58 ? 'white' : '#315b4d', 'middle');
            }
        }
        m.append(el('rect', {
            x: left - 5, y: top + row * c - 5,
            width: 4 * c + 6, height: c + 7, rx: 8,
            fill: 'none', stroke: '#d98026', 'stroke-width': 2
        }));
        txt(m, 32, 347, 'Rows and columns are labeled by coordinates.', 10);
        txt(m, 32, 372, 'Each row is nonnegative and sums to one.', 11);

        const target = images[row];
        $('row-x-value').textContent = x.toFixed(3);
        $('row-y-value').textContent = y.toFixed(3);
        $('row-readout').textContent = `λ = ${x.toFixed(3)} ${y < 0 ? '−' : '+'} ${Math.abs(y).toFixed(3)}i · |λ| = ${Math.hypot(x, y).toFixed(3)}`;
        $('row-sum').textContent = `Row ${row + 1}: (${P[row].map(a => a.toFixed(3)).join(', ')}) · image ≈ ${target[0].toFixed(3)} ${target[1] < 0 ? '−' : '+'} ${Math.abs(target[1]).toFixed(3)}i`;
    }

    function setPoint(a, b) {
        x = a;
        y = b;
        $('row-x').value = Math.round(x * 1000);
        $('row-y').value = Math.round(y * 1000);
        drawRow();
    }

    if ($('row-x')) {
        $('row-x').addEventListener('input', () => {
            x = Number($('row-x').value) / 1000;
            const bound = 1 - Math.abs(x);
            y = Math.max(-bound, Math.min(bound, y));
            setPoint(x, y);
        });
        $('row-y').addEventListener('input', () => {
            y = Number($('row-y').value) / 1000;
            const bound = 1 - Math.abs(y);
            x = Math.max(-bound, Math.min(bound, x));
            setPoint(x, y);
        });
        $('row-select').addEventListener('change', () => {
            row = Number($('row-select').value);
            drawRow();
        });
        $('row-example').addEventListener('click', () => {
            row = 0;
            $('row-select').value = '0';
            setPoint(0.25, 0.5);
        });
        $('row-rotation').addEventListener('click', () => setPoint(0, 1));
        $('row-center').addEventListener('click', () => setPoint(0, 0));
        drawRow();
    }

    const star = [-0.25, Math.sqrt(11) / 4], W = [[1, 0]];
    for (let i = 0; i < 3; i++) W.push(mul(W[W.length - 1], star));
    let witness = 'square';

    function drawWitness() {
        const s = $('witness-polygon');
        if (!s) return;
        const V = witness === 'square' ? vertices : W, image = V.map(z => mul(star, z)), good = witness !== 'square';
        basePlot(s, good ? 'The power polygon is invariant for lambda star' : 'The fixed square fails invariance for lambda star');
        s.append(el('polygon', { points: pts(V), fill: '#edf2e9', stroke: '#17343f', 'stroke-width': 2.3 }));
        s.append(el('polygon', { points: pts(image), fill: good ? '#168579' : '#b05b46', 'fill-opacity': 0.14, stroke: good ? '#168579' : '#b05b46', 'stroke-width': 2 }));
        V.forEach(z => dot(s, z, '#17343f', 4));
        image.forEach(z => dot(s, z, good ? '#168579' : '#b05b46', 5));
        if (good) {
            dot(s, image[3], '#d98026', 6);
            const [a, b] = coords(image[3]);
            txt(s, a + 11, b - 5, 'λ*⁴', 12, '#a16c2d');
        }
        txt(s, 30, 24, good ? 'The power polygon Q*' : 'The fixed square Q', 16, '#234d52');
        txt(s, 30, 372, good ? 'All image vertices belong to Q*.' : 'The image vertices lie outside Q.', 11, good ? '#168579' : '#b05b46');
        for (const name of ['square', 'powers']) {
            $('witness-' + name).setAttribute('aria-pressed', String(witness === name));
            $('witness-proof-' + name).hidden = witness !== name;
        }
        $('witness-status').textContent = good
            ? 'Invariance holds: the first three images are vertices; the last is a convex combination of 1 and λ*.'
            : 'Invariance fails: the image of the vertex 1 is outside the square, so it cannot be a convex combination of its four vertices.';
        $('witness-status').classList.toggle('fails', !good);
    }

    if ($('witness-square')) {
        for (const name of ['square', 'powers']) {
            $('witness-' + name).addEventListener('click', () => {
                witness = name;
                drawWitness();
            });
        }
        drawWitness();
    }

    window.KarpelevichPolygons = Object.freeze({ weights, matrix, mul, vertices, star, W, setPoint });
})();

