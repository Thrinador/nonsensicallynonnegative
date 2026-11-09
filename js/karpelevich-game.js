'use strict';
(function () {
    const NS = 'http://www.w3.org/2000/svg';
    const $ = id => document.getElementById(id);
    const mod = (a, n) => (a % n + n) % n;
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);

    function el(tag, attrs = {}, txt) {
        const e = document.createElementNS(NS, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        if (txt !== undefined) e.textContent = txt;
        return e;
    }

    function point(cx, cy, r, i, n) {
        const a = Math.PI / 2 + (2 * Math.PI * i) / n;
        return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    }

    function svgText(s, x, y, txt, size = 13, color = '#284e55', weight = 400) {
        s.append(
            el(
                'text',
                {
                    x,
                    y,
                    'text-anchor': 'middle',
                    'font-size': size,
                    fill: color,
                    'font-weight': weight,
                    'font-family': 'system-ui,sans-serif'
                },
                txt
            )
        );
    }

    function orbit(n, k) {
        const seq = [],
            records = [];
        for (let m = 0; m < n / gcd(n, k); m++) {
            const a = (m * k) % n;
            seq.push(a);
            if (!records.length || a > records[records.length - 1]) records.push(a);
        }
        return { seq, records };
    }

    function count(mask) {
        let c = 0;
        while (mask) {
            c += mask & 1;
            mask >>>= 1;
        }
        return c;
    }

    function runs(mask, n) {
        if (mask === (1 << n) - 1) return 1;
        let c = 0;
        for (let i = 0; i < n; i++) {
            if ((mask >> i) & 1 && !((mask >> mod(i - 1, n)) & 1)) c++;
        }
        return c;
    }

    function legal(mask, n, i) {
        return Boolean((mask >> i) & 1) && !((mask >> mod(i + 1, n)) & 1);
    }

    function move(mask, n, k, i) {
        return (mask & ~(1 << i)) | (1 << mod(i + k, n));
    }

    function reduced(mask, n, k) {
        return (
            count(mask) < gcd(n, k) ||
            (runs(mask, n) === 1 && orbit(n, k).records.includes(n - count(mask)))
        );
    }

    function shortestReduction(start, n, k) {
        if (reduced(start, n, k)) return [];
        const len = 1 << n,
            prev = new Int32Array(len).fill(-1),
            via = new Int16Array(len).fill(-1),
            q = [start];
        prev[start] = start;
        for (let p = 0; p < q.length; p++) {
            const a = q[p];
            for (let i = 0; i < n; i++) {
                if (legal(a, n, i)) {
                    const b = move(a, n, k, i);
                    if (prev[b] >= 0) continue;
                    prev[b] = a;
                    via[b] = i;
                    if (reduced(b, n, k)) {
                        const result = [];
                        for (let v = b; v !== start; v = prev[v]) result.push(via[v]);
                        return result.reverse();
                    }
                    q.push(b);
                }
            }
        }
        return null;
    }

    function attachLatexTools() {
        const blocks = document.querySelectorAll('.theory-formula, .math-callout');
        blocks.forEach(block => {
            if (block.querySelector('.copy-latex-btn')) return;
            const rawText = block.innerText || block.textContent;
            if (!rawText) return;
            if (getComputedStyle(block).position === 'static') {
                block.classList.add('rel-pos');
            }
            const btn = document.createElement('button');
            btn.className = 'copy-latex-btn';
            btn.innerHTML = 'Copy TeX';
            btn.title = 'Click to copy LaTeX source (or double-click block)';
            const doCopy = e => {
                e.stopPropagation();
                let tex = '';
                const mjx = block.querySelectorAll('mjx-container');
                if (mjx.length > 0 && window.MathJax && MathJax.startup && MathJax.startup.document) {
                    const mathItems = MathJax.startup.document.getMathItemsWithin(block);
                    tex = mathItems.map(m => m.math).join('\n\n');
                }
                if (!tex) tex = block.innerText.replace('Copy TeX', '').trim();
                navigator.clipboard.writeText(tex).then(() => {
                    const orig = btn.innerHTML;
                    btn.innerHTML = 'Copied!';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.innerHTML = orig;
                        btn.classList.remove('copied');
                    }, 1600);
                });
            };
            btn.addEventListener('click', doCopy);
            block.addEventListener('dblclick', doCopy);
            block.appendChild(btn);
        });
    }

    function initKarpelevichGame() {
        if (!$('game-board')) return;

        let n = 7,
            k = 3,
            mask = (1 << 0) | (1 << 2) | (1 << 4),
            initial = mask,
            history = [],
            plan = [],
            editing = false;
        const msg = $('game-status');

        function notify(t, warn = false) {
            msg.textContent = t;
            msg.classList.toggle('warn', warn);
        }

        function updateJump() {
            const s = $('game-k');
            s.replaceChildren();
            for (let j = 1; j < n; j++) {
                const o = document.createElement('option');
                o.value = j;
                o.textContent = j;
                s.append(o);
            }
            s.value = k;
        }

        function drawBoard() {
            const s = $('game-board');
            s.replaceChildren();
            s.append(
                el(
                    'title',
                    {},
                    `Circular board with ${n} sites and jump length ${k}. Click a legal chip to move it.`
                )
            );
            s.append(
                el('circle', {
                    cx: 180,
                    cy: 170,
                    r: 109,
                    fill: 'none',
                    stroke: '#c5d7d1',
                    'stroke-width': 1.5
                })
            );
            const defs = el('defs'),
                marker = el('marker', {
                    id: 'game-move-arrow',
                    viewBox: '0 0 10 10',
                    refX: 8,
                    refY: 5,
                    markerWidth: 6,
                    markerHeight: 6,
                    orient: 'auto'
                });
            marker.append(el('path', { d: 'M0 0L10 5L0 10Z', fill: '#168579' }));
            defs.append(marker);
            s.append(defs);

            for (let i = 0; i < n; i++) {
                const [x, y] = point(180, 170, 109, i, n),
                    [lx, ly] = point(180, 170, 138, i, n),
                    occ = Boolean((mask >> i) & 1),
                    can = legal(mask, n, i);
                const g = el('g', {
                    role: 'button',
                    tabindex: 0,
                    class: 'kg-site-node',
                    'aria-label': editing
                        ? `Toggle chip at site ${i}`
                        : `Site ${i}: ${
                              occ
                                  ? can
                                      ? 'chip; legal move to ' + mod(i + k, n)
                                      : 'chip; blocked by site ' + mod(i + 1, n)
                                  : 'empty'
                          }`,
                    'data-site': i
                });
                if (can && !editing) {
                    g.append(
                        el('circle', {
                            cx: x,
                            cy: y,
                            r: 18,
                            fill: '#e4f0e8',
                            stroke: '#168579',
                            'stroke-width': 1.2
                        })
                    );
                }
                g.append(
                    el('circle', {
                        cx: x,
                        cy: y,
                        r: 12,
                        fill: occ ? '#d98026' : '#fffefa',
                        stroke: occ ? '#bf6b1e' : '#9db7af',
                        'stroke-width': 2
                    })
                );
                svgText(g, lx, ly + 5, String(i), 14, '#56786e', 500);
                const act = () => clickSite(i);
                g.addEventListener('click', act);
                g.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        act();
                    }
                });
                s.append(g);
            }
            svgText(s, 180, 158, `${n} sites`, 19, '#2c5d54', 500);
            svgText(s, 180, 184, `jump +${k}`, 14, '#5b8073');
            svgText(s, 180, 205, 'counterclockwise', 10, '#7b958b');
            $('stat-chips').textContent = count(mask);
            $('stat-runs').textContent = runs(mask, n);
            $('stat-gcd').textContent = gcd(n, k);
            $('game-undo').disabled = !history.length;
            $('game-step').disabled = !plan.length;
            $('game-step').textContent = plan.length
                ? `Next move: ${plan[0]} → ${mod(plan[0] + k, n)}`
                : 'Next suggested move';
            const list = $('game-history');
            list.replaceChildren();
            history.slice(-5).forEach(h => {
                const li = document.createElement('li');
                li.textContent = `${h.i} → ${mod(h.i + k, n)}${
                    (h.mask >> mod(h.i + k, n)) & 1 ? ' · capture' : ''
                }`;
                list.append(li);
            });
        }

        function clickSite(i) {
            if (editing) {
                const next = mask ^ (1 << i);
                if (!next) {
                    notify('Keep at least one chip on the board.', true);
                    return;
                }
                mask = next;
                initial = mask;
                history = [];
                plan = [];
                drawBoard();
                notify('Board edited. Turn off editing to play.');
                return;
            }
            if (!legal(mask, n, i)) {
                notify(
                    (mask >> i) & 1
                        ? `Site ${i} is blocked: the next site, ${mod(i + 1, n)}, is occupied.`
                        : `Site ${i} is empty. Choose a chip with a teal ring.`,
                    true
                );
                return;
            }
            doMove(i, false);
        }

        function doMove(i, fromPlan) {
            if (!legal(mask, n, i)) {
                plan = [];
                drawBoard();
                notify('The board changed. Find a new reduction.', true);
                return;
            }
            const capture = Boolean((mask >> mod(i + k, n)) & 1);
            history.push({ mask, i });
            mask = move(mask, n, k, i);
            if (!fromPlan) plan = [];
            drawBoard();
            notify(
                `Moved ${i} → ${mod(i + k, n)}${capture ? '; captured one chip' : ''}. ${
                    reduced(mask, n, k)
                        ? 'The board now has the form guaranteed by the reduction theorem.'
                        : ''
                }`
            );
        }

        $('game-n').addEventListener('change', () => {
            n = Number($('game-n').value);
            k = Math.min(k, n - 1);
            mask = (1 << 0) | (1 << 2) | (1 << (n - 2));
            initial = mask;
            history = [];
            plan = [];
            updateJump();
            drawBoard();
            notify('New board. A teal ring marks each legal chip.');
        });
        $('game-k').addEventListener('change', () => {
            k = Number($('game-k').value);
            history = [];
            plan = [];
            initial = mask;
            drawBoard();
            notify('Jump length changed. All indices are read modulo n.');
        });
        $('game-edit').addEventListener('change', () => {
            editing = $('game-edit').checked;
            plan = [];
            drawBoard();
            notify(
                editing
                    ? 'Click a site to add or remove a chip.'
                    : 'Editing finished. Choose a chip with a teal ring.'
            );
        });
        $('game-reset').addEventListener('click', () => {
            mask = initial;
            history = [];
            plan = [];
            drawBoard();
            notify('Board reset.');
        });
        $('game-example').addEventListener('click', () => {
            n = 7;
            k = 3;
            mask = (1 << 0) | (1 << 2) | (1 << 4);
            initial = mask;
            history = [];
            plan = [];
            editing = false;
            $('game-edit').checked = false;
            $('game-n').value = 7;
            updateJump();
            drawBoard();
            notify('Worked example loaded: chips at 0, 2 and 4. Try moving site 2.');
        });
        $('game-undo').addEventListener('click', () => {
            if (history.length) {
                mask = history.pop().mask;
                plan = [];
                drawBoard();
                notify('Last move undone.');
            }
        });
        $('game-find').addEventListener('click', () => {
            editing = false;
            $('game-edit').checked = false;
            plan = shortestReduction(mask, n, k);
            drawBoard();
            if (plan === null) notify('No reduction found; this would contradict the theorem.', true);
            else if (plan.length)
                notify(
                    `A shortest path to the stated form uses ${plan.length} move${
                        plan.length === 1 ? '' : 's'
                    }. Step through it with “Next move”.`
                );
            else
                notify(
                    'This board already has the form in the reduction theorem. This does not certify geometric realizability or global minimality.'
                );
        });
        $('game-step').addEventListener('click', () => {
            if (plan.length) {
                const i = plan.shift();
                doMove(i, true);
            }
        });
        updateJump();
        drawBoard();

        function drawPolygon() {
            const t = Number($('polygon-t').value) / 100,
                s = $('polygon-svg');
            s.replaceChildren();
            s.append(el('title', {}, 'A regular pentagon and its invariant rotated image'));
            const V = Array.from({ length: 5 }, (_, i) => point(205, 185, 140, i, 5));
            const Y = V.map((v, i) => [
                (1 - t) * V[(i + 1) % 5][0] + t * V[(i + 2) % 5][0],
                (1 - t) * V[(i + 1) % 5][1] + t * V[(i + 2) % 5][1]
            ]);
            const pts = vs => vs.map(v => v.join(',')).join(' ');
            s.append(
                el('polygon', {
                    points: pts(V),
                    fill: '#17343f',
                    'fill-opacity': 0.025,
                    stroke: '#17343f',
                    'stroke-width': 2
                })
            );
            s.append(
                el('polygon', {
                    points: pts(Y),
                    fill: '#168579',
                    'fill-opacity': 0.13,
                    stroke: '#168579',
                    'stroke-width': 2
                })
            );
            V.forEach((v, i) => {
                s.append(el('circle', { cx: v[0], cy: v[1], r: 4, fill: '#17343f' }));
                const [x, y] = point(205, 185, 160, i, 5);
                svgText(s, x, y + 5, 'z' + i, 13);
            });
            Y.forEach(v =>
                s.append(el('circle', { cx: v[0], cy: v[1], r: 4.5, fill: '#168579' }))
            );
            s.append(el('circle', { cx: 205, cy: 185, r: 2.5, fill: '#71877d' }));
            svgText(s, 220, 202, '0', 11, '#6e887d');
            const re = (1 - t) * Math.cos((2 * Math.PI) / 5) + t * Math.cos((4 * Math.PI) / 5),
                im = (1 - t) * Math.sin((2 * Math.PI) / 5) + t * Math.sin((4 * Math.PI) / 5);
            $('polygon-val').textContent = t.toFixed(2);
            $('polygon-readout').textContent = `λ = ${re.toFixed(3)} + ${im.toFixed(
                3
            )}i · |λ| = ${Math.hypot(re, im).toFixed(3)}`;
        }
        $('polygon-t').addEventListener('input', drawPolygon);
        drawPolygon();

        function drawOrbit() {
            const nVal = Number($('orbit-n').value),
                kVal = Number($('orbit-k').value),
                d = gcd(nVal, kVal),
                o = orbit(nVal, kVal),
                tiles = $('orbit-tiles');
            tiles.replaceChildren();
            o.seq.forEach((a, m) => {
                const e = document.createElement('div');
                e.className = 'orbit-tile' + (o.records.includes(a) ? ' record' : '');
                const val = document.createElement('span');
                val.textContent = a;
                e.append(val);
                const sm = document.createElement('small');
                sm.textContent = 'm=' + m;
                e.append(sm);
                tiles.append(e);
            });
            $('orbit-gcd').textContent = `g = gcd(${nVal}, ${kVal}) = ${d} · orbit length ${nVal / d}`;
            const cand = $('orbit-candidates');
            cand.replaceChildren();
            o.records
                .map(a => nVal - a)
                .filter(q => q >= d)
                .forEach(q => {
                    const e = document.createElement('span');
                    e.textContent = 'φ = ' + q;
                    cand.append(e);
                });
        }
        $('orbit-n').addEventListener('change', () => {
            const nVal = Number($('orbit-n').value),
                s = $('orbit-k'),
                old = Number(s.value);
            s.replaceChildren();
            for (let j = 1; j < nVal; j++) {
                const o = document.createElement('option');
                o.value = j;
                o.textContent = j;
                s.append(o);
            }
            s.value = Math.min(old, nVal - 1);
            drawOrbit();
        });
        $('orbit-k').addEventListener('change', drawOrbit);
        drawOrbit();
    }

    window.KarpelevichGame = Object.freeze({
        gcd,
        orbit,
        count,
        runs,
        legal,
        move,
        reduced,
        shortestReduction
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initKarpelevichGame();
            if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
                window.MathJax.startup.promise.then(attachLatexTools);
            } else {
                window.addEventListener('load', () => setTimeout(attachLatexTools, 700));
            }
        });
    } else {
        initKarpelevichGame();
        if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
            window.MathJax.startup.promise.then(attachLatexTools);
        }
    }
})();
