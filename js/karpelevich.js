// --- Theme Handling ---
function getThemeCanvasColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
        return {
            isLight: true,
            hasGlow: false,
            canvasBg: '#fdfcf9',
            grid: '#e8e2d2',
            axes: '#15370d',
            axesText: '#15370d',
            unitCircle: 'rgba(114, 142, 109, 0.45)',
            regionFill: 'rgba(21, 55, 13, 0.16)',
            regionFill0: 'rgba(21, 55, 13, 0.22)',
            regionFill1: 'rgba(114, 142, 109, 0.18)',
            regionFill2: 'rgba(229, 205, 130, 0.25)',
            regionStroke: '#15370d',
            fareyRoot: '#15370d',
            fareyRootStroke: '#ffffff',
            fareyRootText: '#15370d',
            trail: '#728e6d',
            basePoint: '#15370d'
        };
    } else {
        return {
            isLight: false,
            hasGlow: true,
            canvasBg: '#081221',
            grid: 'rgba(169, 193, 226, 0.07)',
            axes: '#8ab4f8',
            axesText: '#eaf2ff',
            unitCircle: 'rgba(56, 189, 248, 0.35)',
            regionFill: 'rgba(59, 130, 246, 0.18)',
            regionFill0: 'rgba(59, 130, 246, 0.35)',
            regionFill1: 'rgba(14, 165, 233, 0.22)',
            regionFill2: 'rgba(56, 189, 248, 0.14)',
            regionStroke: '#60a5fa',
            fareyRoot: '#ffffff',
            fareyRootStroke: '#081221',
            fareyRootText: '#eaf2ff',
            trail: '#38bdf8',
            basePoint: '#60a5fa'
        };
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
        document.body.setAttribute('data-theme', theme);
    }
    localStorage.setItem('niep_theme', theme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Refresh UI elements with theme-aware styling
    refreshStatusBox();
    renderPowersTable();

    if (window.viewer) {
        window.viewer.render();
    }
}

// Global State
const state = {
    n: 4,
    z: { x: 0.2, y: 0.6 }, // Selected complex number
    currentPower: 1,
    maxPower: 25,
    isPlaying: false,
    playSpeed: 800, // ms per step
    timerId: null,
    scale: 220, // pixels per unit
    pan: { x: 0, y: 0 },
    isDraggingPoint: false,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    hoveredVertex: null,
    showGrid: true,
    showFareyRoots: true,
    showUnitCircle: true,
    showTrail: true,
    cachedBoundary: null,
    cachedFareyRoots: [],
    isPanningMode: false,
    isShiftDown: false,
    stickToBoundary: false,
    lastMouseWorld: null,
    lastMouseScreen: null,
    isMouseOverCanvas: false,
    snappedPreviewPoint: null
};

// --- Mathematical Engine ---

/**
 * Generate the Farey sequence of order n for fractions in [0, 1]
 */
function getFareySequence(n) {
    const seq = [{ p: 0, q: 1 }, { p: 1, q: n }];
    while (true) {
        const last = seq[seq.length - 1];
        if (last.p === 1 && last.q === 1) break;
        const prev = seq[seq.length - 2];
        const k = Math.floor((n + prev.q) / last.q);
        seq.push({
            p: k * last.p - prev.p,
            q: k * last.q - prev.q
        });
    }
    return seq;
}

/**
 * Binomial coefficient (n choose k)
 */
function binom(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = (res * (n - i + 1)) / i;
    }
    return res;
}

/**
 * Aberth-Ehrlich simultaneous polynomial root solver
 * Finds all complex roots of sum_{i=0}^deg coeffs[i] * z^(deg - i) = 0
 */
function solvePolynomialAberth(coeffs, maxIter = 40, tol = 1e-12) {
    const deg = coeffs.length - 1;
    const c0 = coeffs[0];
    if (deg === 1) {
        return [{ re: -coeffs[1] / c0, im: 0 }];
    }
    const a = coeffs.map(c => c / c0);

    // Initial guesses distributed on circle
    const roots = [];
    for (let i = 0; i < deg; i++) {
        const theta = (2 * Math.PI * i) / deg + 0.35;
        roots.push({
            re: 0.95 * Math.cos(theta),
            im: 0.95 * Math.sin(theta)
        });
    }

    // Complex arithmetic helpers
    const cMul = (u, v) => ({ re: u.re * v.re - u.im * v.im, im: u.re * v.im + u.im * v.re });
    const cAdd = (u, v) => ({ re: u.re + v.re, im: u.im + v.im });
    const cSub = (u, v) => ({ re: u.re - v.re, im: u.im - v.im });
    const cDiv = (u, v) => {
        const d = v.re * v.re + v.im * v.im;
        return { re: (u.re * v.re + u.im * v.im) / d, im: (u.im * v.re - u.re * v.im) / d };
    };
    const cAbs = (u) => Math.hypot(u.re, u.im);

    for (let iter = 0; iter < maxIter; iter++) {
        let maxChange = 0;
        for (let i = 0; i < deg; i++) {
            const z = roots[i];
            // Horner's evaluation of P(z) and P'(z)
            let p = { re: a[0], im: 0 };
            let dp = { re: 0, im: 0 };
            for (let j = 1; j <= deg; j++) {
                dp = cAdd(cMul(dp, z), p);
                p = cAdd(cMul(p, z), { re: a[j], im: 0 });
            }

            if (cAbs(dp) < 1e-14) continue;
            const ratio = cDiv(p, dp);

            // Aberth sum
            let sumOther = { re: 0, im: 0 };
            for (let j = 0; j < deg; j++) {
                if (j !== i) {
                    sumOther = cAdd(sumOther, cDiv({ re: 1, im: 0 }, cSub(z, roots[j])));
                }
            }

            const denom = cSub({ re: 1, im: 0 }, cMul(ratio, sumOther));
            if (cAbs(denom) < 1e-14) continue;
            const corr = cDiv(ratio, denom);

            roots[i] = cSub(z, corr);
            maxChange = Math.max(maxChange, cAbs(corr));
        }
        if (maxChange < tol) break;
    }

    return roots;
}

/**
 * Expand Ito polynomial coefficients:
 * If s >= q*k, d = s - q*k:
 *   P(t) = t^d * (t^q - beta)^k - alpha^k = 0
 * If s < q*k, d = q*k - s:
 *   P(t) = (t^q - beta)^k - alpha^k * t^d = 0
 */
function getItoPolynomialCoeffs(q, s, k, alpha) {
    const beta = 1.0 - alpha;
    const deg = Math.max(s, q * k);
    const coeffs = new Array(deg + 1).fill(0);

    if (s >= q * k) {
        const d = s - q * k;
        for (let j = 0; j <= k; j++) {
            const power = d + q * j;
            const sign = (k - j) % 2 === 0 ? 1 : -1;
            const term = binom(k, j) * sign * Math.pow(beta, k - j);
            coeffs[deg - power] += term;
        }
        coeffs[deg] -= Math.pow(alpha, k);
    } else {
        const d = q * k - s;
        for (let j = 0; j <= k; j++) {
            const power = q * j;
            const sign = (k - j) % 2 === 0 ? 1 : -1;
            const term = binom(k, j) * sign * Math.pow(beta, k - j);
            coeffs[deg - power] += term;
        }
        coeffs[deg - d] -= Math.pow(alpha, k);
    }

    return coeffs;
}

/**
 * Solve the exact polar boundary arc connecting consecutive upper-half-plane
 * Farey fractions f1 < f2 in F_n (for n >= 4), based on the continuous polar
 * parametrization of the reduced Ito equation (Kirkland–Laffey–Šmigoc, 2020).
 */
function solvePolarBoundaryArc(n, f1, f2, samplesPerArc) {
    let p, q, r, s, reversed;
    if (f1.q < f2.q) {
        p = f1.p; q = f1.q; r = f2.p; s = f2.q; reversed = false;
    } else {
        p = f2.p; q = f2.q; r = f1.p; s = f1.q; reversed = true;
    }

    const thQ = (2 * Math.PI * p) / q;
    const thS = (2 * Math.PI * r) / s;

    // Type 0 (q = 1, s = n): straight line chord between 1 and e^{2*pi*i/n}
    if (q === 1 && s === n) {
        const zQ = { x: Math.cos(thQ), y: Math.sin(thQ) };
        const zS = { x: Math.cos(thS), y: Math.sin(thS) };
        const arc = [];
        for (let step = 0; step <= samplesPerArc; step++) {
            const alpha = step / samplesPerArc;
            arc.push({
                x: (1 - alpha) * zQ.x + alpha * zS.x,
                y: (1 - alpha) * zQ.y + alpha * zS.y
            });
        }
        if (reversed) arc.reverse();
        return arc;
    }

    // Exact polar solver along theta in [min(thQ, thS), max(thQ, thS)]:
    // Taking the continuous k-th root branch determined at alpha = 1 (z = e^{i*thS}):
    //   z^q - 1 = alpha * (rho^{q - s/k} * e^{i*psi} - 1),
    // where psi = (q - s/k)*theta + 2*pi*r/k and alpha in (0, 1) is real.
    // Eliminating alpha yields the monotone scalar equation G(rho) = 0 on (0, 1].
    const k = Math.floor(n / q);
    const arc = [];

    for (let step = 0; step <= samplesPerArc; step++) {
        if (step === 0) {
            arc.push({ x: Math.cos(thQ), y: Math.sin(thQ) });
            continue;
        }
        if (step === samplesPerArc) {
            arc.push({ x: Math.cos(thS), y: Math.sin(thS) });
            continue;
        }

        const theta = thQ + (thS - thQ) * (step / samplesPerArc);
        const psi = (q - s / k) * theta + (2 * Math.PI * r) / k;
        const cA = Math.sin((s * theta - 2 * Math.PI * r) / k);
        const cB = Math.sin(q * theta);
        const cC = Math.sin(psi);

        const G = (rho) => Math.pow(rho, q) * cA - Math.pow(rho, s / k) * cB + cC;

        let lo = 0.0;
        let hi = 1.0;
        let gLo = G(lo);
        for (let iter = 0; iter < 56; iter++) {
            const mid = 0.5 * (lo + hi);
            const gMid = G(mid);
            if (gMid === 0) {
                lo = hi = mid;
                break;
            }
            if (gLo * gMid <= 0) {
                hi = mid;
            } else {
                lo = mid;
                gLo = gMid;
            }
        }

        const rho = 0.5 * (lo + hi);
        arc.push({
            x: rho * Math.cos(theta),
            y: rho * Math.sin(theta)
        });
    }

    if (reversed) {
        arc.reverse();
    }
    return arc;
}

/**
 * Compute the complete Karpelevič boundary for matrix size n
 */
function computeKarpelevichBoundary(n, samplesPerArc = 40) {
    const fullFarey = getFareySequence(n);
    const fareyRoots = fullFarey.map(f => {
        const angle = (2 * Math.PI * f.p) / f.q;
        return {
            p: f.p,
            q: f.q,
            x: Math.cos(angle),
            y: Math.sin(angle),
            angle: angle
        };
    });

    // Special exact geometry for n = 2: real interval [-1, 1]
    if (n === 2) {
        const upperPoints = [];
        for (let step = 0; step <= samplesPerArc; step++) {
            const t = step / samplesPerArc;
            upperPoints.push({ x: 1 - 2 * t, y: 0 });
        }
        const lowerPoints = [];
        for (let i = upperPoints.length - 2; i >= 1; i--) {
            lowerPoints.push({ x: upperPoints[i].x, y: 0 });
        }
        return {
            boundary: [...upperPoints, ...lowerPoints],
            fareyRoots: fareyRoots
        };
    }

    // Special exact geometry for n = 3: triangle conv(1, e^{2pi*i/3}, e^{-2pi*i/3}) union [-1, -1/2]
    if (n === 3) {
        const rt32 = Math.sqrt(3) / 2;
        const upperPoints = [];
        for (let step = 0; step <= samplesPerArc; step++) {
            const t = step / samplesPerArc;
            upperPoints.push({ x: 1 - 1.5 * t, y: rt32 * t });
        }
        for (let step = 1; step <= samplesPerArc; step++) {
            const t = step / samplesPerArc;
            upperPoints.push({ x: -0.5, y: rt32 * (1 - t) });
        }
        const spikeSteps = Math.max(8, Math.floor(samplesPerArc / 2));
        for (let step = 1; step <= spikeSteps; step++) {
            const t = step / spikeSteps;
            upperPoints.push({ x: -0.5 - 0.5 * t, y: 0 });
        }
        const lowerPoints = [];
        for (let i = upperPoints.length - 2; i >= 1; i--) {
            lowerPoints.push({ x: upperPoints[i].x, y: -upperPoints[i].y });
        }
        return {
            boundary: [...upperPoints, ...lowerPoints],
            fareyRoots: fareyRoots
        };
    }

    const halfFarey = fullFarey.filter(f => f.p / f.q <= 0.5);
    const upperPoints = [];

    // Trace arcs in the upper half plane from 0/1 to 1/2
    for (let i = 0; i < halfFarey.length - 1; i++) {
        const arc = solvePolarBoundaryArc(n, halfFarey[i], halfFarey[i + 1], samplesPerArc);
        if (upperPoints.length === 0) {
            upperPoints.push(...arc);
        } else {
            upperPoints.push(...arc.slice(1));
        }
    }

    // Reflect upper boundary across the real axis to obtain full boundary
    const lowerPoints = [];
    for (let i = upperPoints.length - 2; i >= 1; i--) {
        lowerPoints.push({
            x: upperPoints[i].x,
            y: -upperPoints[i].y
        });
    }

    const fullBoundary = [...upperPoints, ...lowerPoints];

    return {
        boundary: fullBoundary,
        fareyRoots: fareyRoots
    };
}

/**
 * Point-in-polygon containment test
 */
function isPointInPolygon(px, py, polygon) {
    if (!polygon || polygon.length < 3) return false;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > py) !== (yj > py)) &&
            (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Minimum distance from point to polygon boundary
 */
function minDistanceToPolygon(px, py, polygon) {
    let minDist = Infinity;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const l2 = (xj - xi) * (xj - xi) + (yj - yi) * (yj - yi);
        let t = l2 === 0 ? 0 : ((px - xi) * (xj - xi) + (py - yi) * (yj - yi)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = xi + t * (xj - xi);
        const projY = yi + t * (yj - yi);
        const d = Math.hypot(px - projX, py - projY);
        if (d < minDist) minDist = d;
    }
    return minDist;
}

/**
 * Find the closest point on the polygon boundary to (px, py).
 * Projects (px, py) orthogonally onto each piecewise line segment.
 */
function getClosestPointOnBoundary(px, py, polygon) {
    if (!polygon || polygon.length === 0) return { x: px, y: py, dist: 0 };
    let minDist = Infinity;
    let closestPt = { x: polygon[0].x, y: polygon[0].y, dist: Infinity };

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const dx = xj - xi;
        const dy = yj - yi;
        const l2 = dx * dx + dy * dy;
        let t = l2 === 0 ? 0 : ((px - xi) * dx + (py - yi) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = xi + t * dx;
        const projY = yi + t * dy;
        const d = Math.hypot(px - projX, py - projY);
        if (d < minDist) {
            minDist = d;
            closestPt = { x: projX, y: projY, dist: d };
        }
    }
    return closestPt;
}

/**
 * Check containment status of point z relative to Karpelevič region
 */
function checkPointStatus(px, py, polygon) {
    if (!polygon || polygon.length === 0) {
        return { status: 'outside', text: 'Computing...', dist: Infinity };
    }
    const dist = minDistanceToPolygon(px, py, polygon);
    if (dist < 0.012) {
        return { status: 'boundary', text: 'On Boundary ∂𝒦ₙ', html: 'On Boundary &part;&#x1D4A6;<sub>n</sub>', dist };
    }
    const inside = isPointInPolygon(px, py, polygon);
    if (inside) {
        return { status: 'inside', text: 'Inside 𝒦ₙ (Stochastic Spectrum)', html: 'Inside &#x1D4A6;<sub>n</sub> (Stochastic Spectrum)', dist };
    }
    return { status: 'outside', text: 'Outside 𝒦ₙ (Infeasible for SIEP)', html: 'Outside &#x1D4A6;<sub>n</sub> (Infeasible for SIEP)', dist };
}

/**
 * Compute sequence of powers: z^1, z^2, ..., z^maxPower
 */
function computePowers(z, maxK, polygon) {
    const r = Math.hypot(z.x, z.y);
    const theta = Math.atan2(z.y, z.x);
    const powers = [];

    for (let k = 1; k <= maxK; k++) {
        const rK = Math.pow(r, k);
        const thetaK = k * theta;
        const xK = rK * Math.cos(thetaK);
        const yK = rK * Math.sin(thetaK);
        const statusObj = checkPointStatus(xK, yK, polygon);

        powers.push({
            k: k,
            x: xK,
            y: yK,
            modulus: rK,
            arg: thetaK,
            argNorm: ((thetaK % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
            status: statusObj.status,
            statusText: statusObj.text
        });
    }

    return powers;
}

// --- Canvas Visualizer Engine ---

class KarpelevichViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tooltip = document.getElementById('canvasTooltip');
        this.resize();

        window.addEventListener('resize', () => this.resize());
        this.setupInteractions();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.width = rect.width;
        this.height = rect.height;
        this.dpr = dpr;
        this.render();
    }

    resizeCanvas() {
        this.resize();
    }

    // World to Canvas Screen coords
    toScreen(x, y) {
        const cx = this.width / 2 + state.pan.x;
        const cy = this.height / 2 + state.pan.y;
        return {
            x: cx + x * state.scale,
            y: cy - y * state.scale
        };
    }

    // Canvas Screen to World coords
    toWorld(sx, sy) {
        const cx = this.width / 2 + state.pan.x;
        const cy = this.height / 2 + state.pan.y;
        return {
            x: (sx - cx) / state.scale,
            y: (cy - sy) / state.scale
        };
    }

    render() {
        if (!state.cachedBoundary) {
            const data = computeKarpelevichBoundary(state.n);
            state.cachedBoundary = data.boundary;
            state.cachedFareyRoots = data.fareyRoots;
        }

        const ctx = this.ctx;
        const colors = getThemeCanvasColors();
        ctx.save();
        ctx.scale(this.dpr, this.dpr);
        ctx.fillStyle = colors.canvasBg;
        ctx.fillRect(0, 0, this.width, this.height);

        // 1. Grid lines
        if (state.showGrid) {
            this.drawGrid(ctx);
        }

        // 2. Axes
        this.drawAxes(ctx);

        // 3. Unit circle
        if (state.showUnitCircle) {
            this.drawUnitCircle(ctx);
        }

        // 4. Karpelevič Region (Fill & Boundary)
        this.drawKarpelevichRegion(ctx);

        // 5. Farey Roots of Unity
        if (state.showFareyRoots) {
            this.drawFareyRoots(ctx);
        }

        // 6. Power Trajectory Trail
        const powers = computePowers(state.z, state.maxPower, state.cachedBoundary);
        if (state.showTrail && state.currentPower > 1) {
            this.drawPowerTrail(ctx, powers);
        }

        // 7. Power Points & Active Power
        this.drawPowerPoints(ctx, powers);

        // 8. Base point z_0 handle
        this.drawBasePoint(ctx);

        ctx.restore();
    }

    drawGrid(ctx) {
        const colors = getThemeCanvasColors();
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;

        const range = 2.5;
        const step = 0.25;

        for (let v = -range; v <= range; v += step) {
            if (Math.abs(v) < 1e-6) continue;
            // Vertical grid line
            const p1 = this.toScreen(v, -range);
            const p2 = this.toScreen(v, range);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Horizontal grid line
            const p3 = this.toScreen(-range, v);
            const p4 = this.toScreen(range, v);
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.stroke();
        }
    }

    drawAxes(ctx) {
        const colors = getThemeCanvasColors();
        const origin = this.toScreen(0, 0);

        // Real axis (X)
        ctx.strokeStyle = colors.axes;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, origin.y);
        ctx.lineTo(this.width, origin.y);
        ctx.stroke();

        // Imaginary axis (Y)
        ctx.beginPath();
        ctx.moveTo(origin.x, 0);
        ctx.lineTo(origin.x, this.height);
        ctx.stroke();

        // Axis ticks and labels
        ctx.fillStyle = colors.axesText;
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';

        const ticks = [-1, -0.5, 0.5, 1];
        for (const t of ticks) {
            // Real ticks
            const ptX = this.toScreen(t, 0);
            ctx.beginPath();
            ctx.moveTo(ptX.x, ptX.y - 4);
            ctx.lineTo(ptX.x, ptX.y + 4);
            ctx.stroke();
            ctx.fillText(t.toString(), ptX.x, ptX.y + 16);

            // Imaginary ticks
            const ptY = this.toScreen(0, t);
            ctx.beginPath();
            ctx.moveTo(ptY.x - 4, ptY.y);
            ctx.lineTo(ptY.x + 4, ptY.y);
            ctx.stroke();
            ctx.textAlign = 'right';
            ctx.fillText(t > 0 ? `+${t}i` : `${t}i`, ptY.x - 8, ptY.y + 4);
            ctx.textAlign = 'center';
        }

        // Origin label
        ctx.fillText('0', origin.x - 10, origin.y + 14);

        // Axes titles
        ctx.fillStyle = colors.axesText;
        ctx.font = '700 11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Re (Real)', this.width - 15, origin.y - 8);
        ctx.textAlign = 'left';
        ctx.fillText('Im (Imaginary)', origin.x + 8, 20);
    }

    drawUnitCircle(ctx) {
        const colors = getThemeCanvasColors();
        const origin = this.toScreen(0, 0);
        ctx.strokeStyle = colors.unitCircle;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, state.scale, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawKarpelevichRegion(ctx) {
        const poly = state.cachedBoundary;
        if (!poly || poly.length === 0) return;

        ctx.save();
        ctx.beginPath();
        const start = this.toScreen(poly[0].x, poly[0].y);
        ctx.moveTo(start.x, start.y);

        for (let i = 1; i < poly.length; i++) {
            const pt = this.toScreen(poly[i].x, poly[i].y);
            ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();

        const colors = getThemeCanvasColors();
        if (colors.hasGlow) {
            // Dark theme: rich glowing sci-fi style
            const origin = this.toScreen(0, 0);
            const grad = ctx.createRadialGradient(
                origin.x, origin.y, 10,
                origin.x, origin.y, state.scale * 1.1
            );
            grad.addColorStop(0, colors.regionFill0);
            grad.addColorStop(0.7, colors.regionFill1);
            grad.addColorStop(1, colors.regionFill2);
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.strokeStyle = colors.regionStroke;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = colors.regionStroke;
            ctx.shadowBlur = 10;
            ctx.stroke();
        } else {
            // Light theme: clean, non-flashy mathematical textbook figure
            ctx.fillStyle = colors.regionFill;
            ctx.fill();

            ctx.strokeStyle = colors.regionStroke;
            ctx.lineWidth = 2.0;
            ctx.shadowBlur = 0; // No glow
            ctx.stroke();
        }

        ctx.restore();
    }

    drawFareyRoots(ctx) {
        const roots = state.cachedFareyRoots;
        if (!roots) return;

        for (const rt of roots) {
            const pt = this.toScreen(rt.x, rt.y);
            const isHovered = state.hoveredVertex &&
                state.hoveredVertex.p === rt.p &&
                state.hoveredVertex.q === rt.q;

            ctx.save();
            ctx.beginPath();
            const radius = isHovered ? 6 : 3.5;
            ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);

            const colors = getThemeCanvasColors();
            ctx.fillStyle = isHovered ? '#60a5fa' : colors.fareyRoot;
            ctx.shadowColor = isHovered ? '#3b82f6' : colors.fareyRoot;
            ctx.shadowBlur = isHovered ? 12 : 4;
            ctx.fill();

            ctx.strokeStyle = colors.fareyRootStroke;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Label for major roots if not zoomed out too much
            if (state.scale > 150 && (rt.q <= 4 || isHovered)) {
                ctx.fillStyle = colors.fareyRootText;
                ctx.font = 'bold 11px monospace';
                const label = `${rt.p}/${rt.q}`;
                const offset = 14;
                ctx.fillText(label, pt.x + (rt.x >= 0 ? offset : -offset), pt.y + (rt.y >= 0 ? -6 : 14));
            }

            ctx.restore();
        }
    }

    drawPowerTrail(ctx, powers) {
        ctx.save();
        ctx.beginPath();

        const count = Math.min(state.currentPower, powers.length);
        const first = this.toScreen(powers[0].x, powers[0].y);
        ctx.moveTo(first.x, first.y);

        for (let i = 1; i < count; i++) {
            const pt = this.toScreen(powers[i].x, powers[i].y);
            ctx.lineTo(pt.x, pt.y);
        }

        const colors = getThemeCanvasColors();
        ctx.strokeStyle = colors.trail;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        if (colors.hasGlow) {
            ctx.shadowColor = colors.trail;
            ctx.shadowBlur = 8;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.restore();
    }

    drawPowerPoints(ctx, powers) {
        const colors = getThemeCanvasColors();
        const count = Math.min(state.currentPower, powers.length);

        // Draw intermediate power beads
        for (let i = 0; i < count; i++) {
            const p = powers[i];
            const pt = this.toScreen(p.x, p.y);
            const isCurrent = (i + 1 === state.currentPower);

            ctx.save();
            ctx.beginPath();

            if (isCurrent) {
                // Active pulsing ring
                ctx.arc(pt.x, pt.y, 9, 0, 2 * Math.PI);
                ctx.fillStyle = p.status === 'inside' ? 'rgba(16, 185, 129, 0.3)' :
                                p.status === 'boundary' ? 'rgba(245, 158, 11, 0.3)' :
                                'rgba(244, 63, 94, 0.3)';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 5.5, 0, 2 * Math.PI);
                ctx.fillStyle = p.status === 'inside' ? '#34d399' :
                                p.status === 'boundary' ? '#fbbf24' :
                                '#fb7185';
                if (colors.hasGlow) {
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.shadowBlur = 14;
                } else {
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                // Historical power marker
                ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = p.status === 'inside' ? 'rgba(52, 211, 153, 0.75)' :
                                p.status === 'boundary' ? 'rgba(251, 191, 36, 0.75)' :
                                'rgba(251, 113, 133, 0.75)';
                ctx.fill();
            }

            // Power label
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                ctx.fillStyle = isCurrent ? '#0f172a' : '#475569';
            } else {
                ctx.fillStyle = isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.75)';
            }
            ctx.font = isCurrent ? 'bold 11px monospace' : '9px monospace';
            ctx.fillText(`z^${p.k}`, pt.x + 10, pt.y - 6);

            ctx.restore();
        }
    }

    drawBasePoint(ctx) {
        const pt = this.toScreen(state.z.x, state.z.y);
        const colors = getThemeCanvasColors();

        ctx.save();

        // 1. If dragging with boundary-stick active and mouse is offset, draw projection guide line
        if (state.isDraggingPoint && (state.isShiftDown || state.stickToBoundary) && state.lastMouseScreen) {
            const mScr = state.lastMouseScreen;
            const distScr = Math.hypot(mScr.x - pt.x, mScr.y - pt.y);
            if (distScr > 6) {
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
                ctx.lineWidth = 1.4;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(mScr.x, mScr.y);
                ctx.lineTo(pt.x, pt.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Small cursor anchor
                ctx.beginPath();
                ctx.arc(mScr.x, mScr.y, 3.5, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
                ctx.fill();
            }
        }

        // 2. Hover snap preview when holding Shift without dragging
        if (!state.isDraggingPoint && state.isShiftDown && state.isMouseOverCanvas && state.snappedPreviewPoint && state.lastMouseScreen) {
            const snapScr = this.toScreen(state.snappedPreviewPoint.x, state.snappedPreviewPoint.y);
            const mScr = state.lastMouseScreen;

            // Guide line from cursor to prospective boundary snap point
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
            ctx.lineWidth = 1.4;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(mScr.x, mScr.y);
            ctx.lineTo(snapScr.x, snapScr.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Snap preview ring on boundary
            ctx.beginPath();
            ctx.arc(snapScr.x, snapScr.y, 8, 0, 2 * Math.PI);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
            ctx.fill();
            ctx.stroke();

            // Preview tooltip badge
            ctx.font = '600 10px Inter, sans-serif';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText('Snap to ∂𝒦ₙ', snapScr.x + 12, snapScr.y - 4);
        }

        // 3. Target crosshair for base point
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        ctx.beginPath();
        ctx.moveTo(pt.x - 14, pt.y);
        ctx.lineTo(pt.x + 14, pt.y);
        ctx.moveTo(pt.x, pt.y - 14);
        ctx.lineTo(pt.x, pt.y + 14);
        ctx.stroke();
        ctx.setLineDash([]);

        // 4. Boundary locked halo
        const isBoundary = state.cachedBoundary && minDistanceToPolygon(state.z.x, state.z.y, state.cachedBoundary) < 0.012;
        if (isBoundary || state.stickToBoundary) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 11.5, 0, 2 * Math.PI);
            ctx.strokeStyle = colors.hasGlow ? '#38bdf8' : '#2563eb';
            ctx.lineWidth = 2;
            ctx.fillStyle = colors.hasGlow ? 'rgba(56, 189, 248, 0.2)' : 'rgba(37, 99, 235, 0.15)';
            ctx.fill();
            ctx.stroke();
        }

        // 5. Main handle dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6.5, 0, 2 * Math.PI);
        ctx.fillStyle = (isBoundary || state.stickToBoundary) ? '#38bdf8' : colors.basePoint;
        if (colors.hasGlow) {
            ctx.shadowColor = (isBoundary || state.stickToBoundary) ? '#38bdf8' : colors.basePoint;
            ctx.shadowBlur = 10;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    setupInteractions() {
        const canvas = this.canvas;

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const handlePointerDown = (e) => {
            // Unfocus any active sidebar text inputs so clicking canvas immediately updates
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }

            const pos = getPos(e);
            const world = this.toWorld(pos.x, pos.y);
            const zScreen = this.toScreen(state.z.x, state.z.y);
            const distToZ = Math.hypot(pos.x - zScreen.x, pos.y - zScreen.y);

            // Shift+Click: Snap point to the closest boundary line and stick to it!
            if (e.shiftKey) {
                if (!state.cachedBoundary) {
                    const data = computeKarpelevichBoundary(state.n);
                    state.cachedBoundary = data.boundary;
                    state.cachedFareyRoots = data.fareyRoots;
                }
                const closest = getClosestPointOnBoundary(world.x, world.y, state.cachedBoundary);
                updatePoint(closest.x, closest.y, true);
                state.isDraggingPoint = true;
                state.stickToBoundary = true;
                canvas.style.cursor = 'grabbing';
                e.preventDefault();
                return;
            }

            // Panning: Middle-click, Alt+click, or Panning tool mode
            if (e.button === 1 || e.altKey || state.isPanningMode) {
                state.isPanning = true;
                state.panStart = { x: pos.x - state.pan.x, y: pos.y - state.pan.y };
                canvas.style.cursor = 'grabbing';
                e.preventDefault();
                return;
            }

            // Direct point drag handle
            if (distToZ <= 22) {
                state.isDraggingPoint = true;
                state.stickToBoundary = false;
                canvas.style.cursor = 'grabbing';
                e.preventDefault();
                return;
            }

            // Click anywhere on canvas to place z freely
            if (e.button === 0 || e.touches) {
                updatePoint(world.x, world.y, true);
                state.isDraggingPoint = true;
                state.stickToBoundary = false;
                canvas.style.cursor = 'grabbing';
            }
        };

        canvas.addEventListener('mousedown', handlePointerDown);
        canvas.addEventListener('touchstart', handlePointerDown, { passive: false });

        canvas.addEventListener('mouseenter', () => {
            state.isMouseOverCanvas = true;
        });

        canvas.addEventListener('mouseleave', () => {
            state.isMouseOverCanvas = false;
            state.snappedPreviewPoint = null;
            this.render();
        });

        const handlePointerMove = (e) => {
            const pos = getPos(e);
            const world = this.toWorld(pos.x, pos.y);
            state.lastMouseWorld = world;
            state.lastMouseScreen = pos;

            // Safety check: if mouse buttons are released outside canvas, release drag/pan immediately
            if ((state.isDraggingPoint || state.isPanning) && e.buttons === 0 && !e.touches) {
                handlePointerUp();
                return;
            }

            // Update mouse coordinates readout
            const readEl = document.getElementById('mouseCoords');
            if (readEl) {
                readEl.textContent = `Re: ${world.x.toFixed(3)}, Im: ${world.y.toFixed(3)}`;
            }

            // 1. Dragging z point
            if (state.isDraggingPoint) {
                // If Shift is held or stickToBoundary mode is active, stick strictly to boundary!
                if (e.shiftKey || state.stickToBoundary) {
                    if (!state.cachedBoundary) {
                        const data = computeKarpelevichBoundary(state.n);
                        state.cachedBoundary = data.boundary;
                        state.cachedFareyRoots = data.fareyRoots;
                    }
                    const closest = getClosestPointOnBoundary(world.x, world.y, state.cachedBoundary);
                    updatePoint(closest.x, closest.y, true);
                } else {
                    updatePoint(world.x, world.y, true);
                }
                if (e.touches) e.preventDefault();
                return;
            }

            // 2. Panning canvas
            if (state.isPanning) {
                state.pan.x = pos.x - state.panStart.x;
                state.pan.y = pos.y - state.panStart.y;
                this.render();
                if (e.touches) e.preventDefault();
                return;
            }

            // 3. Hover preview when holding Shift (not dragging)
            if (e.shiftKey && state.cachedBoundary) {
                state.snappedPreviewPoint = getClosestPointOnBoundary(world.x, world.y, state.cachedBoundary);
                this.render();
            } else if (state.snappedPreviewPoint) {
                state.snappedPreviewPoint = null;
                this.render();
            }

            // 4. Check hover over Farey roots
            let found = null;
            if (state.cachedFareyRoots) {
                for (const rt of state.cachedFareyRoots) {
                    const scr = this.toScreen(rt.x, rt.y);
                    if (Math.hypot(pos.x - scr.x, pos.y - scr.y) < 12) {
                        found = rt;
                        break;
                    }
                }
            }

            if (found !== state.hoveredVertex) {
                state.hoveredVertex = found;
                this.render();

                if (found) {
                    const scr = this.toScreen(found.x, found.y);
                    this.tooltip.innerHTML = `<strong>Farey Root:</strong> e<sup>2πi·${found.p}/${found.q}</sup><br>` +
                        `λ = ${found.x.toFixed(4)} + ${found.y.toFixed(4)}i`;
                    this.tooltip.style.left = `${scr.x}px`;
                    this.tooltip.style.top = `${scr.y}px`;
                    this.tooltip.classList.add('visible');
                } else {
                    this.tooltip.classList.remove('visible');
                }
            }
        };

        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('touchmove', handlePointerMove, { passive: false });

        const handlePointerUp = () => {
            if (state.isDraggingPoint || state.isPanning) {
                state.isDraggingPoint = false;
                state.isPanning = false;
                state.stickToBoundary = false;
                canvas.style.cursor = state.isPanningMode ? 'grab' : 'crosshair';
                // Final sync of inputs, URL, and table
                syncPointInputs(true);
                renderPowersTable();
                syncUrlState();
                this.render();
            }
        };

        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('touchend', handlePointerUp);
        window.addEventListener('touchcancel', handlePointerUp);
        window.addEventListener('blur', handlePointerUp);

        // Key listeners for Shift snap behavior & spacebar panning
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                state.isShiftDown = true;
                if (state.isDraggingPoint && !state.stickToBoundary) {
                    state.stickToBoundary = true;
                    if (state.lastMouseWorld && state.cachedBoundary) {
                        const closest = getClosestPointOnBoundary(state.lastMouseWorld.x, state.lastMouseWorld.y, state.cachedBoundary);
                        updatePoint(closest.x, closest.y, true);
                    }
                } else if (state.isMouseOverCanvas && state.lastMouseWorld && state.cachedBoundary && !state.isDraggingPoint) {
                    state.snappedPreviewPoint = getClosestPointOnBoundary(state.lastMouseWorld.x, state.lastMouseWorld.y, state.cachedBoundary);
                    this.render();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                state.isShiftDown = false;
                state.stickToBoundary = false;
                state.snappedPreviewPoint = null;
                if (state.isDraggingPoint && state.lastMouseWorld) {
                    updatePoint(state.lastMouseWorld.x, state.lastMouseWorld.y, true);
                } else {
                    this.render();
                }
            }
        });

        // Zoom with mouse wheel
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const pos = getPos(e);
            const worldBefore = this.toWorld(pos.x, pos.y);

            const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
            const newScale = Math.max(60, Math.min(1200, state.scale * zoomFactor));

            state.scale = newScale;
            const worldAfter = this.toWorld(pos.x, pos.y);
            state.pan.x += (worldAfter.x - worldBefore.x) * state.scale;
            state.pan.y -= (worldAfter.y - worldBefore.y) * state.scale;

            this.render();
        }, { passive: false });
    }
}

// --- UI & State Controllers ---

let viewer = null;

function updateN(newN) {
    newN = Math.max(2, Math.min(16, parseInt(newN) || 4));
    if (state.n === newN && state.cachedBoundary) return;

    state.n = newN;
    state.cachedBoundary = null;
    state.cachedFareyRoots = [];

    // Update UI
    document.getElementById('nSlider').value = newN;
    document.getElementById('nDisplay').textContent = newN;
    document.getElementById('hudN').textContent = newN;

    document.querySelectorAll('.n-presets .chip-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.n) === newN);
    });

    refreshAll();
}

function updatePoint(re, im, forceSync = true) {
    // Round to 4 decimal places for numerical stability
    state.z.x = parseFloat(re.toFixed(4));
    state.z.y = parseFloat(im.toFixed(4));

    syncPointInputs(forceSync);
    refreshAll();
}

function syncPointInputs(force = false) {
    const reInput = document.getElementById('inputRe');
    const imInput = document.getElementById('inputIm');
    const modInput = document.getElementById('inputMod');
    const argInput = document.getElementById('inputArg');
    if (!reInput || !imInput || !modInput || !argInput) return;

    if (force || document.activeElement !== reInput) reInput.value = state.z.x.toFixed(4);
    if (force || document.activeElement !== imInput) imInput.value = state.z.y.toFixed(4);

    const r = Math.hypot(state.z.x, state.z.y);
    const thetaPi = Math.atan2(state.z.y, state.z.x) / Math.PI;

    if (force || document.activeElement !== modInput) modInput.value = r.toFixed(4);
    if (force || document.activeElement !== argInput) argInput.value = thetaPi.toFixed(4);
}

function setPower(power) {
    power = Math.max(1, Math.min(state.maxPower, parseInt(power) || 1));
    state.currentPower = power;

    document.getElementById('powerSlider').value = power;
    document.getElementById('powerDisplay').textContent = power;

    highlightActivePowerRow();
    if (!state.isPlaying) syncUrlState();
    if (viewer) viewer.render();
}

function stepPower(delta) {
    let nextPower = state.currentPower + delta;
    if (nextPower > state.maxPower) nextPower = 1;
    if (nextPower < 1) nextPower = state.maxPower;
    setPower(nextPower);
}

function togglePlay() {
    state.isPlaying = !state.isPlaying;
    const playBtn = document.getElementById('playBtn');

    if (state.isPlaying) {
        playBtn.innerHTML = '⏸ Pause';
        playBtn.classList.add('danger');
        state.timerId = setInterval(() => {
            stepPower(1);
        }, state.playSpeed);
    } else {
        playBtn.innerHTML = '▶ Play';
        playBtn.classList.remove('danger');
        if (state.timerId) {
            clearInterval(state.timerId);
            state.timerId = null;
        }
    }
}

function syncUrlState() {
    if (typeof window === 'undefined' || !window.history || !window.history.replaceState) return;
    if (state.isDraggingPoint) return;
    const params = new URLSearchParams();
    params.set('n', String(state.n));
    params.set('re', state.z.x.toFixed(4));
    params.set('im', state.z.y.toFixed(4));
    if (state.currentPower > 1) {
        params.set('k', String(state.currentPower));
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
}

function loadUrlState() {
    if (typeof window === 'undefined' || !window.location) return;
    const params = new URLSearchParams(window.location.search);
    if (params.has('n')) {
        const parsedN = parseInt(params.get('n'), 10);
        if (!isNaN(parsedN)) {
            state.n = Math.max(2, Math.min(16, parsedN));
        }
    }
    if (params.has('re') || params.has('im')) {
        const parsedRe = parseFloat(params.get('re'));
        const parsedIm = parseFloat(params.get('im'));
        if (!isNaN(parsedRe)) state.z.x = parseFloat(parsedRe.toFixed(4));
        if (!isNaN(parsedIm)) state.z.y = parseFloat(parsedIm.toFixed(4));
    }
    if (params.has('k')) {
        const parsedK = parseInt(params.get('k'), 10);
        if (!isNaN(parsedK)) {
            state.currentPower = Math.max(1, Math.min(state.maxPower, parsedK));
        }
    }
}

function refreshStatusBox() {
    if (!state.cachedBoundary) return;
    const statusObj = checkPointStatus(state.z.x, state.z.y, state.cachedBoundary);
    const statusBox = document.getElementById('pointStatusBox');
    if (statusBox) {
        statusBox.className = `point-status status-${statusObj.status}`;
        statusBox.innerHTML = `<span class="status-dot"></span><span>${statusObj.html || statusObj.text}</span>` +
            `<span>|z| = ${Math.hypot(state.z.x, state.z.y).toFixed(3)}</span>`;
    }
}

function refreshAll() {
    if (!state.cachedBoundary) {
        const data = computeKarpelevichBoundary(state.n);
        state.cachedBoundary = data.boundary;
        state.cachedFareyRoots = data.fareyRoots;
    }

    // Check status of base point z_0
    refreshStatusBox();

    // Compute powers and build table
    renderPowersTable();

    if (viewer) {
        viewer.render();
    }

    syncUrlState();
}

function renderPowersTable() {
    if (!state.cachedBoundary || state.cachedBoundary.length === 0) return;
    const powers = computePowers(state.z, state.maxPower, state.cachedBoundary);
    const tbody = document.getElementById('powersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    powers.forEach(p => {
        const tr = document.createElement('tr');
        tr.id = `power-row-${p.k}`;
        if (p.k === state.currentPower) tr.classList.add('active-power-row');

        // Status colors (inside / boundary / outside) are theme-aware in css/karpelevich.css
        const statusBadge = `<span class="power-status ${p.status}">` +
            `${p.status.toUpperCase()}</span>`;

        tr.innerHTML = `
            <td>k=${p.k}</td>
            <td>${p.x.toFixed(3)} + ${p.y.toFixed(3)}i</td>
            <td>${p.modulus.toFixed(3)}</td>
            <td>${(p.arg / Math.PI).toFixed(2)}π</td>
            <td>${statusBadge}</td>
        `;

        tr.addEventListener('click', () => {
            setPower(p.k);
        });

        tbody.appendChild(tr);
    });
}

function highlightActivePowerRow() {
    document.querySelectorAll('.powers-table tr').forEach(tr => {
        tr.classList.remove('active-power-row');
    });
    const activeRow = document.getElementById(`power-row-${state.currentPower}`);
    if (activeRow) {
        activeRow.classList.add('active-power-row');
        if (typeof activeRow.scrollIntoView === 'function') { activeRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    }
}

// Preset complex points
function applyPresetPoint(type) {
    if (!state.cachedBoundary) {
        const data = computeKarpelevichBoundary(state.n);
        state.cachedBoundary = data.boundary;
        state.cachedFareyRoots = data.fareyRoots;
    }

    if (type === 'origin') {
        updatePoint(0, 0);
    } else if (type === 'farey') {
        const angle = (2 * Math.PI) / state.n;
        updatePoint(Math.cos(angle), Math.sin(angle));
    } else if (type === 'spiral') {
        const angle = Math.PI / 4;
        updatePoint(0.88 * Math.cos(angle), 0.88 * Math.sin(angle));
    } else if (type === 'boundary') {
        // Point on middle of first arc
        const midIdx = Math.floor(state.cachedBoundary.length / (2 * state.n));
        const pt = state.cachedBoundary[midIdx] || { x: 0.5, y: 0.5 };
        updatePoint(pt.x, pt.y);
    } else if (type === 'cycle') {
        const angle = (2 * Math.PI * 2) / 5;
        updatePoint(Math.cos(angle), Math.sin(angle));
    } else if (type === 'outside') {
        updatePoint(-0.7, 0.75);
    }
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 0. Parse shareable URL parameters (?n=&re=&im=&k=) if present
    loadUrlState();

    // 1. Calculate mathematical boundary first
    const initData = computeKarpelevichBoundary(state.n);
    state.cachedBoundary = initData.boundary;
    state.cachedFareyRoots = initData.fareyRoots;

    // 2. Initialize viewer and resizer
    initSidebarResizer();
    viewer = new KarpelevichViewer('karpelevichCanvas');
    window.viewer = viewer;

    // 3. Theme initialization
    const savedTheme = localStorage.getItem('niep_theme') || 'light';
    setTheme(savedTheme);

    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });

    // 4. Controls setup
    const nSlider = document.getElementById('nSlider');
    nSlider.addEventListener('input', (e) => updateN(e.target.value));

    document.querySelectorAll('.n-presets .chip-btn').forEach(btn => {
        btn.addEventListener('click', () => updateN(btn.dataset.n));
    });

    // Inputs: Cartesian
    const inputRe = document.getElementById('inputRe');
    const inputIm = document.getElementById('inputIm');
    const applyCartesian = () => {
        const re = parseFloat(inputRe.value) || 0;
        const im = parseFloat(inputIm.value) || 0;
        updatePoint(re, im);
    };
    inputRe.addEventListener('change', applyCartesian);
    inputIm.addEventListener('change', applyCartesian);

    // Inputs: Polar
    const inputMod = document.getElementById('inputMod');
    const inputArg = document.getElementById('inputArg');
    const applyPolar = () => {
        const r = Math.max(0, parseFloat(inputMod.value) || 0);
        const theta = (parseFloat(inputArg.value) || 0) * Math.PI;
        updatePoint(r * Math.cos(theta), r * Math.sin(theta));
    };
    inputMod.addEventListener('change', applyPolar);
    inputArg.addEventListener('change', applyPolar);

    // Preset point buttons
    document.querySelectorAll('.preset-points-row .chip-btn').forEach(btn => {
        btn.addEventListener('click', () => applyPresetPoint(btn.dataset.preset));
    });

    // Power controls
    const powerSlider = document.getElementById('powerSlider');
    powerSlider.addEventListener('input', (e) => setPower(e.target.value));

    document.getElementById('stepPrevBtn').addEventListener('click', () => stepPower(-1));
    document.getElementById('stepNextBtn').addEventListener('click', () => stepPower(1));
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('resetPowerBtn').addEventListener('click', () => {
        if (state.isPlaying) togglePlay();
        setPower(1);
    });

    // Toolbar buttons
    const panBtn = document.getElementById('panToggleBtn');
    if (panBtn) {
        panBtn.addEventListener('click', () => {
            state.isPanningMode = !state.isPanningMode;
            panBtn.classList.toggle('active', state.isPanningMode);
            const canvas = document.getElementById('karpelevichCanvas');
            if (canvas) {
                canvas.style.cursor = state.isPanningMode ? 'grab' : 'crosshair';
            }
        });
    }

    document.getElementById('zoomInBtn').addEventListener('click', () => {
        state.scale = Math.min(1200, state.scale * 1.25);
        viewer.render();
    });
    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        state.scale = Math.max(60, state.scale / 1.25);
        viewer.render();
    });
    document.getElementById('resetViewBtn').addEventListener('click', () => {
        state.scale = 220;
        state.pan = { x: 0, y: 0 };
        state.isPanningMode = false;
        if (panBtn) panBtn.classList.remove('active');
        const canvas = document.getElementById('karpelevichCanvas');
        if (canvas) canvas.style.cursor = 'crosshair';
        viewer.render();
    });

    const shareBtn = document.getElementById('shareLinkBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            syncUrlState();
            const url = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    const prev = shareBtn.innerHTML;
                    shareBtn.innerHTML = '✓';
                    setTimeout(() => { shareBtn.innerHTML = prev; }, 1600);
                });
            }
        });
    }

    // Theory toggle
    const theoryHeader = document.querySelector('.theory-header');
    const theoryContent = document.querySelector('.theory-content');
    const theoryIcon = document.querySelector('.theory-toggle-icon');
    if (theoryHeader && theoryContent) {
        theoryHeader.addEventListener('click', () => {
            theoryContent.classList.toggle('open');
            theoryIcon.classList.toggle('open');
        });
    }

    // Initialize display
    updateN(state.n);
    setPower(state.currentPower);
    syncPointInputs(true);
});


// --- Interactive Horizontal Sidebar Resizer ---
function initSidebarResizer() {
    const sidebar = document.getElementById('controlSidebar');
    const resizer = document.getElementById('sidebarResizer');
    const container = document.querySelector('.karpelevich-container');
    if (!sidebar || !resizer || !container) return;

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startWidth = sidebar.getBoundingClientRect().width;
        resizer.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        let newWidth = startWidth + deltaX;
        const minWidth = 260;
        const maxWidth = Math.max(320, window.innerWidth - 300);
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        sidebar.style.width = `${newWidth}px`;
        if (window.viewer) {
            window.viewer.resize();
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            resizer.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            if (window.viewer) {
                window.viewer.resize();
            }
        }
    });
}
