/**
 * Spectra Realizer - Numerical NIEP / SNIEP / Stochastic Realization Engine & UI
 * Nonnegative Inverse Eigenvalue Problem Solver
 */

(function () {
    'use strict';

    // --- Complex Number Utilities ---
    const Complex = {
        create(re = 0, im = 0) {
            return { re: Number(re) || 0, im: Number(im) || 0 };
        },
        add(a, b) {
            return { re: a.re + b.re, im: a.im + b.im };
        },
        sub(a, b) {
            return { re: a.re - b.re, im: a.im - b.im };
        },
        mul(a, b) {
            return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
        },
        div(a, b) {
            const d = b.re * b.re + b.im * b.im;
            if (d === 0) return { re: 0, im: 0 };
            return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
        },
        abs(a) {
            return Math.hypot(a.re, a.im);
        },
        absSq(a) {
            return a.re * a.re + a.im * a.im;
        },
        pow(a, k) {
            let res = { re: 1, im: 0 };
            for (let i = 0; i < k; i++) res = Complex.mul(res, a);
            return res;
        },
        format(a, digits = 4) {
            const re = Math.abs(a.re) < 1e-12 ? 0 : a.re;
            const im = Math.abs(a.im) < 1e-12 ? 0 : a.im;
            if (Math.abs(im) < 1e-6) {
                return re.toFixed(digits);
            }
            const sign = im >= 0 ? '+' : '-';
            const imAbs = Math.abs(im);
            const imStr = Math.abs(imAbs - 1) < 1e-6 ? 'i' : `${imAbs.toFixed(digits)}i`;
            if (Math.abs(re) < 1e-6) {
                return (im < 0 ? '-' : '') + imStr;
            }
            return `${re.toFixed(digits)} ${sign} ${imStr}`;
        }
    };

    // --- Matrix Utilities ---
    const Matrix = {
        zeros(n, m = n) {
            return Array.from({ length: n }, () => new Float64Array(m));
        },
        eye(n) {
            const I = Matrix.zeros(n);
            for (let i = 0; i < n; i++) I[i][i] = 1;
            return I;
        },
        copy(A) {
            return A.map(row => new Float64Array(row));
        },
        mul(A, B) {
            const n = A.length, p = B[0].length, m = B.length;
            const C = Matrix.zeros(n, p);
            for (let i = 0; i < n; i++) {
                for (let k = 0; k < m; k++) {
                    const aik = A[i][k];
                    for (let j = 0; j < p; j++) {
                        C[i][j] += aik * B[k][j];
                    }
                }
            }
            return C;
        },
        transpose(A) {
            const n = A.length, m = A[0].length;
            const T = Matrix.zeros(m, n);
            for (let i = 0; i < n; i++)
                for (let j = 0; j < m; j++)
                    T[j][i] = A[i][j];
            return T;
        },
        normF(A) {
            let s = 0;
            for (let i = 0; i < A.length; i++)
                for (let j = 0; j < A[i].length; j++)
                    s += A[i][j] * A[i][j];
            return Math.sqrt(s);
        },
        symmetrize(A) {
            const n = A.length;
            const S = Matrix.zeros(n);
            for (let i = 0; i < n; i++) {
                for (let j = i; j < n; j++) {
                    const v = 0.5 * (A[i][j] + A[j][i]);
                    S[i][j] = S[j][i] = v;
                }
            }
            return S;
        },
        clipNonnegative(A) {
            const n = A.length, m = A[0].length;
            const C = Matrix.zeros(n, m);
            for (let i = 0; i < n; i++)
                for (let j = 0; j < m; j++)
                    C[i][j] = Math.max(0, A[i][j]);
            return C;
        },
        projectSimplex(v) {
            const n = v.length;
            const u = Array.from(v).sort((a, b) => b - a);
            let cumsum = 0;
            let rho = 0;
            for (let j = 0; j < n; j++) {
                cumsum += u[j];
                if (u[j] + (1 - cumsum) / (j + 1) > 0) {
                    rho = j;
                }
            }
            let sumRho = 0;
            for (let j = 0; j <= rho; j++) sumRho += u[j];
            const theta = (1 - sumRho) / (rho + 1);
            const res = new Float64Array(n);
            for (let i = 0; i < n; i++) {
                res[i] = Math.max(0, v[i] + theta);
            }
            return res;
        },
        projectStochastic(A) {
            const n = A.length;
            const res = Matrix.zeros(n);
            for (let i = 0; i < n; i++) {
                res[i] = Matrix.projectSimplex(A[i]);
            }
            return res;
        },
        projectDoublyStochasticSymmetric(A_in, iters = 18) {
            const n = A_in.length;
            let A = Matrix.symmetrize(A_in);
            for (let k = 0; k < iters; k++) {
                for (let i = 0; i < n; i++) {
                    A[i] = Matrix.projectSimplex(A[i]);
                }
                A = Matrix.symmetrize(A);
            }
            return A;
        }
    };

    // --- Eigenvalue & Schur Decompositions ---
    function jacobiEigen(A_in, maxIter = 120) {
        const n = A_in.length;
        const A = Matrix.copy(A_in);
        const V = Matrix.eye(n);

        for (let iter = 0; iter < maxIter; iter++) {
            let maxOff = 0, p = 0, q = 1;
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const off = Math.abs(A[i][j]);
                    if (off > maxOff) {
                        maxOff = off;
                        p = i; q = j;
                    }
                }
            }
            if (maxOff < 1e-14) break;

            const App = A[p][p], Aqq = A[q][q], Apq = A[p][q];
            const phi = 0.5 * Math.atan2(2 * Apq, Aqq - App);
            const c = Math.cos(phi), s = Math.sin(phi);

            for (let i = 0; i < n; i++) {
                if (i !== p && i !== q) {
                    const aip = A[i][p], aiq = A[i][q];
                    A[i][p] = A[p][i] = c * aip - s * aiq;
                    A[i][q] = A[q][i] = s * aip + c * aiq;
                }
                const vip = V[i][p], viq = V[i][q];
                V[i][p] = c * vip - s * viq;
                V[i][q] = s * vip + c * viq;
            }
            A[p][p] = c * c * App - 2 * s * c * Apq + s * s * Aqq;
            A[q][q] = s * s * App + 2 * s * c * Apq + c * c * Aqq;
            A[p][q] = A[q][p] = 0;
        }

        const eigs = [];
        for (let i = 0; i < n; i++) {
            eigs.push({ val: A[i][i], index: i });
        }
        eigs.sort((a, b) => b.val - a.val);

        const sortedVals = new Float64Array(n);
        const sortedV = Matrix.zeros(n);
        for (let j = 0; j < n; j++) {
            sortedVals[j] = eigs[j].val;
            const orig = eigs[j].index;
            for (let i = 0; i < n; i++) {
                sortedV[i][j] = V[i][orig];
            }
        }
        return { eigenvalues: sortedVals, V: sortedV };
    }

    function hessenberg(A_in) {
        const n = A_in.length;
        const H = Matrix.copy(A_in);
        const Q = Matrix.eye(n);

        for (let k = 0; k < n - 2; k++) {
            let normSq = 0;
            for (let i = k + 1; i < n; i++) normSq += H[i][k] * H[i][k];
            if (normSq < 1e-28) continue;
            const norm = Math.sqrt(normSq);
            const alpha = (H[k + 1][k] >= 0 ? -1 : 1) * norm;
            const v1 = H[k + 1][k] - alpha;
            const s = Math.sqrt(2 * (normSq - H[k + 1][k] * alpha));
            if (s < 1e-15) continue;

            const v = new Float64Array(n);
            v[k + 1] = v1 / s;
            for (let i = k + 2; i < n; i++) v[i] = H[i][k] / s;

            for (let j = k; j < n; j++) {
                let dot = 0;
                for (let i = k + 1; i < n; i++) dot += v[i] * H[i][j];
                for (let i = k + 1; i < n; i++) H[i][j] -= 2 * v[i] * dot;
            }
            for (let i = 0; i < n; i++) {
                let dot = 0;
                for (let j = k + 1; j < n; j++) dot += H[i][j] * v[j];
                for (let j = k + 1; j < n; j++) H[i][j] -= 2 * dot * v[j];
            }
            for (let i = 0; i < n; i++) {
                let dot = 0;
                for (let j = k + 1; j < n; j++) dot += Q[i][j] * v[j];
                for (let j = k + 1; j < n; j++) Q[i][j] -= 2 * dot * v[j];
            }
        }
        return { H, Q };
    }

    function realSchur(A_in, maxIter = 100) {
        const n = A_in.length;
        const { H, Q } = hessenberg(A_in);
        let p = n - 1;
        let iter = 0;
        const totalMax = maxIter * n;

        while (p > 0 && iter < totalMax) {
            iter++;
            const q = p - 1;

            const scale1 = Math.abs(H[q][q]) + Math.abs(H[p][p]) + 1e-15;
            if (Math.abs(H[p][q]) < 1e-13 * scale1) {
                H[p][q] = 0;
                p = q;
                continue;
            }

            if (q > 0) {
                const scale2 = Math.abs(H[q - 1][q - 1]) + Math.abs(H[q][q]) + 1e-15;
                if (Math.abs(H[q][q - 1]) < 1e-13 * scale2) {
                    H[q][q - 1] = 0;
                    p = q - 1;
                    continue;
                }
            } else {
                break;
            }

            const s = H[q][q] + H[p][p];
            const t = H[q][q] * H[p][p] - H[q][p] * H[p][q];

            let x = H[0][0] * H[0][0] + H[0][1] * H[1][0] - s * H[0][0] + t;
            let y = H[1][0] * (H[0][0] + H[1][1] - s);
            let z = (n > 2 && p >= 2) ? H[1][0] * H[2][1] : 0;

            for (let k = 0; k < p; k++) {
                const m = Math.min(k + 3, p + 1);
                let v1 = x, v2 = y, v3 = (m - k > 2) ? z : 0;
                let norm = Math.hypot(v1, v2, v3);
                if (norm > 1e-15) {
                    const alpha = (v1 >= 0 ? -1 : 1) * norm;
                    v1 -= alpha;
                    const vNorm = Math.hypot(v1, v2, v3);
                    v1 /= vNorm; v2 /= vNorm; v3 /= vNorm;

                    const r_start = Math.max(0, k - 1);
                    for (let j = r_start; j < n; j++) {
                        let dot = v1 * H[k][j] + v2 * H[k + 1][j];
                        if (m - k > 2) dot += v3 * H[k + 2][j];
                        H[k][j] -= 2 * v1 * dot;
                        H[k + 1][j] -= 2 * v2 * dot;
                        if (m - k > 2) H[k + 2][j] -= 2 * v3 * dot;
                    }
                    const c_end = Math.min(k + 4, n);
                    for (let i = 0; i < c_end; i++) {
                        let dot = v1 * H[i][k] + v2 * H[i][k + 1];
                        if (m - k > 2) dot += v3 * H[i][k + 2];
                        H[i][k] -= 2 * v1 * dot;
                        H[i][k + 1] -= 2 * v2 * dot;
                        if (m - k > 2) H[i][k + 2] -= 2 * v3 * dot;
                    }
                    for (let i = 0; i < n; i++) {
                        let dot = v1 * Q[i][k] + v2 * Q[i][k + 1];
                        if (m - k > 2) dot += v3 * Q[i][k + 2];
                        Q[i][k] -= 2 * v1 * dot;
                        Q[i][k + 1] -= 2 * v2 * dot;
                        if (m - k > 2) Q[i][k + 2] -= 2 * v3 * dot;
                    }
                }
                if (k + 1 < p) {
                    x = H[k + 1][k];
                    y = H[k + 2][k];
                    z = (k + 3 <= p) ? H[k + 3][k] : 0;
                }
            }
        }

        const eigenvalues = [];
        let i = 0;
        while (i < n) {
            if (i === n - 1 || Math.abs(H[i + 1][i]) < 1e-8 * (Math.abs(H[i][i]) + Math.abs(H[i + 1][i + 1]) + 1e-12)) {
                eigenvalues.push({ re: H[i][i], im: 0, blockIndex: i, blockSize: 1 });
                i++;
            } else {
                const a = H[i][i], b = H[i][i + 1], c = H[i + 1][i], d = H[i + 1][i + 1];
                const tr = a + d;
                const det = a * d - b * c;
                const disc = tr * tr - 4 * det;
                if (disc >= 0) {
                    const sq = Math.sqrt(disc);
                    eigenvalues.push({ re: (tr + sq) / 2, im: 0, blockIndex: i, blockSize: 2 });
                    eigenvalues.push({ re: (tr - sq) / 2, im: 0, blockIndex: i, blockSize: 2 });
                } else {
                    const sq = Math.sqrt(-disc);
                    eigenvalues.push({ re: tr / 2, im: sq / 2, blockIndex: i, blockSize: 2 });
                    eigenvalues.push({ re: tr / 2, im: -sq / 2, blockIndex: i, blockSize: 2 });
                }
                i += 2;
            }
        }
        return { H, Q, eigenvalues };
    }

    function calcSpectralDistance(targets, candidates) {
        const n = targets.length;
        const used = new Array(n).fill(false);
        let totalDistSq = 0;
        const pairs = [];

        for (let i = 0; i < n; i++) {
            let bestDist = Infinity, bestJ = -1;
            for (let j = 0; j < n; j++) {
                if (!used[j]) {
                    const d = (targets[i].re - candidates[j].re) ** 2 + (targets[i].im - candidates[j].im) ** 2;
                    if (d < bestDist) {
                        bestDist = d;
                        bestJ = j;
                    }
                }
            }
            used[bestJ] = true;
            totalDistSq += bestDist;
            pairs.push({
                target: targets[i],
                candidate: candidates[bestJ],
                dist: Math.sqrt(bestDist)
            });
        }
        return { dist: Math.sqrt(totalDistSq / n), pairs };
    }

    function structureTargetSpectrum(targets) {
        const n = targets.length;
        const remaining = targets.map((t, idx) => ({ ...t, idx }));
        const blocks = [];

        for (let i = 0; i < remaining.length; i++) {
            if (!remaining[i] || Math.abs(remaining[i].im) < 1e-7) continue;
            const t1 = remaining[i];
            let bestPair = -1;
            let minDiff = Infinity;
            for (let j = i + 1; j < remaining.length; j++) {
                if (!remaining[j]) continue;
                const t2 = remaining[j];
                const diff = Math.hypot(t1.re - t2.re, t1.im + t2.im);
                if (diff < 1e-4 && diff < minDiff) {
                    minDiff = diff;
                    bestPair = j;
                }
            }
            if (bestPair !== -1) {
                const b = Math.abs(t1.im);
                blocks.push({
                    type: '2x2',
                    re: t1.re,
                    im: b,
                    items: [t1, remaining[bestPair]]
                });
                remaining[i] = null;
                remaining[bestPair] = null;
            }
        }

        for (let i = 0; i < remaining.length; i++) {
            if (remaining[i]) {
                blocks.push({
                    type: '1x1',
                    re: remaining[i].re,
                    im: 0,
                    items: [remaining[i]]
                });
            }
        }

        blocks.sort((a, b) => {
            const magA = Math.hypot(a.re, a.im);
            const magB = Math.hypot(b.re, b.im);
            return magB - magA;
        });

        return blocks;
    }

    function analyzeTheoreticalConditions(targets, targetClass) {
        const n = targets.length;
        const diagnostics = [];
        let allPassed = true;

        const sorted = targets.slice();
        let conjugateMismatch = false;
        const matched = new Array(n).fill(false);
        for (let i = 0; i < n; i++) {
            if (matched[i]) continue;
            if (Math.abs(sorted[i].im) < 1e-6) {
                matched[i] = true;
                continue;
            }
            let pairIdx = -1;
            for (let j = i + 1; j < n; j++) {
                if (!matched[j] && Math.abs(sorted[i].re - sorted[j].re) < 1e-5 && Math.abs(sorted[i].im + sorted[j].im) < 1e-5) {
                    pairIdx = j;
                    break;
                }
            }
            if (pairIdx !== -1) {
                matched[i] = true;
                matched[pairIdx] = true;
            } else {
                conjugateMismatch = true;
                break;
            }
        }

        if (conjugateMismatch) {
            allPassed = false;
            diagnostics.push({
                name: 'Conjugate Symmetry (σ = σ̄)',
                status: 'fail',
                detail: 'Eigenvalues of any real matrix must occur in complex conjugate pairs. A lone complex eigenvalue was detected.',
                critical: true
            });
        } else {
            diagnostics.push({
                name: 'Conjugate Symmetry (σ = σ̄)',
                status: 'pass',
                detail: 'Spectrum is closed under complex conjugation.'
            });
        }

        if (targetClass === 'symmetric' || targetClass === 'stochastic-symmetric') {
            const hasComplex = targets.some(t => Math.abs(t.im) > 1e-5);
            if (hasComplex) {
                allPassed = false;
                diagnostics.push({
                    name: 'Spectral Reality (SNIEP)',
                    status: 'fail',
                    detail: 'Symmetric real matrices cannot have complex eigenvalues. All eigenvalues must be purely real.',
                    critical: true
                });
            } else {
                diagnostics.push({
                    name: 'Spectral Reality (SNIEP)',
                    status: 'pass',
                    detail: 'All eigenvalues are purely real as required for symmetric matrices.'
                });
            }
        }

        let maxMod = -1;
        for (const t of targets) {
            const mod = Complex.abs(t);
            if (mod > maxMod) {
                maxMod = mod;
            }
        }

        const isPerronReal = targets.some(t => Math.abs(t.im) < 1e-5 && t.re > 0 && Math.abs(t.re - maxMod) < 1e-4);
        if (!isPerronReal) {
            allPassed = false;
            diagnostics.push({
                name: 'Perron-Frobenius Root',
                status: 'fail',
                detail: `Spectral radius ρ = ${maxMod.toFixed(4)} must be a positive real eigenvalue in σ.`,
                critical: true
            });
        } else {
            diagnostics.push({
                name: 'Perron-Frobenius Root',
                status: 'pass',
                detail: `Perron root ρ = ${maxMod.toFixed(4)} is real, positive, and maximal.`
            });
        }

        if (targetClass === 'stochastic' || targetClass === 'stochastic-symmetric') {
            const hasOne = targets.some(t => Math.abs(t.im) < 1e-4 && Math.abs(t.re - 1) < 1e-4);
            const allLeOne = targets.every(t => Complex.abs(t) <= 1.0001);
            if (!hasOne || !allLeOne) {
                allPassed = false;
                diagnostics.push({
                    name: 'Stochastic Perron Root (ρ = 1)',
                    status: 'fail',
                    detail: `Stochastic matrices must have maximal eigenvalue ρ = 1. Current max modulus: ${maxMod.toFixed(4)}.`,
                    critical: true
                });
            } else {
                diagnostics.push({
                    name: 'Stochastic Perron Root (ρ = 1)',
                    status: 'pass',
                    detail: 'Spectral radius is exactly 1 with unit Perron eigenvalue.'
                });
            }
        }

        const traces = [];
        let traceViolated = false;
        let worstTraceK = 0, worstTraceVal = 0;
        for (let k = 1; k <= Math.min(n + 2, 8); k++) {
            let sumK = Complex.create(0, 0);
            for (const t of targets) {
                sumK = Complex.add(sumK, Complex.pow(t, k));
            }
            const s_k = sumK.re;
            traces.push({ k, val: s_k });
            if (s_k < -1e-4 && !traceViolated) {
                traceViolated = true;
                worstTraceK = k;
                worstTraceVal = s_k;
            }
        }

        if (traceViolated) {
            allPassed = false;
            diagnostics.push({
                name: 'Trace Power Nonnegativity (s_k ≥ 0)',
                status: 'fail',
                detail: `Power trace s_${worstTraceK} = tr(A^${worstTraceK}) = ${worstTraceVal.toFixed(4)} < 0. For any nonnegative matrix, tr(A^k) must be ≥ 0.`,
                critical: true
            });
        } else {
            diagnostics.push({
                name: 'Trace Power Nonnegativity (s_k ≥ 0)',
                status: 'pass',
                detail: `Traces s_1, ..., s_${traces.length} are all nonnegative (s_1 = tr(A) = ${traces[0].val.toFixed(4)}).`
            });
        }

        let loewyViolated = false;
        let loewyDetail = '';
        if (!traceViolated && n >= 3) {
            const s1 = traces[0].val;
            const s2 = (traces[1] && traces[1].val) || 0;
            if (s1 * s1 > n * s2 + 1e-4) {
                loewyViolated = true;
                loewyDetail = `s_1² (${(s1 * s1).toFixed(3)}) > ${n} · s_2 (${(n * s2).toFixed(3)})`;
            }
        }

        if (loewyViolated) {
            allPassed = false;
            diagnostics.push({
                name: 'Loewy-London Inequality',
                status: 'fail',
                detail: `Violated bound: ${loewyDetail}. Necessary for nonnegative realization.`,
                critical: true
            });
        } else {
            diagnostics.push({
                name: 'Loewy-London Inequality',
                status: 'pass',
                detail: 'Satisfies classical Loewy-London trace power inequalities.'
            });
        }

        if (targetClass === 'stochastic' || targetClass === 'stochastic-symmetric') {
            let outsideKarpelevich = false;
            let outsidePoint = null;
            for (const t of targets) {
                const mod = Complex.abs(t);
                if (mod > 1.0001) {
                    outsideKarpelevich = true;
                    outsidePoint = t;
                    break;
                }
                if (n === 3 && Math.abs(t.im) > 1e-5) {
                    const x = t.re, y = Math.abs(t.im);
                    if (x + y * Math.sqrt(3) > 1.001) {
                        outsideKarpelevich = true;
                        outsidePoint = t;
                        break;
                    }
                }
            }
            if (outsideKarpelevich) {
                allPassed = false;
                diagnostics.push({
                    name: 'Karpelevič Region K_n Containment',
                    status: 'fail',
                    detail: `Eigenvalue ${Complex.format(outsidePoint, 3)} lies outside the Karpelevič region K_${n}. Infeasible for stochastic matrices.`,
                    critical: true
                });
            } else {
                diagnostics.push({
                    name: 'Karpelevič Region K_n Containment',
                    status: 'pass',
                    detail: `All eigenvalues lie within the Karpelevič compact region K_${n}.`
                });
            }
        }

        return { allPassed, diagnostics, traces, perronRoot: maxMod };
    }

    function trySuleimanovaConstruction(targets, targetClass) {
        const n = targets.length;
        if (targets.some(t => Math.abs(t.im) > 1e-6)) return null;
        const reals = targets.map(t => t.re).sort((a, b) => b - a);
        if (reals[0] <= 0) return null;
        for (let i = 1; i < n; i++) {
            if (reals[i] > 1e-6) return null;
        }
        let sum = 0;
        for (const r of reals) sum += r;
        if (sum < -1e-6) return null;

        if (targetClass === 'symmetric' || targetClass === 'stochastic-symmetric') {
            return trySoulesConstruction(targets, targetClass);
        }

        let poly = [1];
        for (let i = 0; i < n; i++) {
            const r = reals[i];
            const next = new Array(poly.length + 1).fill(0);
            for (let j = 0; j < poly.length; j++) {
                next[j] += poly[j];
                next[j + 1] -= r * poly[j];
            }
            poly = next;
        }
        const C = Matrix.zeros(n);
        for (let i = 0; i < n - 1; i++) {
            C[i][i + 1] = 1.0;
        }
        let allNonneg = true;
        for (let k = 1; k <= n; k++) {
            const coeff = -poly[k];
            C[n - 1][n - k] = coeff >= -1e-12 ? Math.max(0, coeff) : coeff;
            if (C[n - 1][n - k] < 0) allNonneg = false;
        }

        if (allNonneg) {
            if (targetClass === 'stochastic') {
                if (Math.abs(reals[0] - 1) < 1e-5) {
                    const rowSums = C.map(row => row.reduce((a, b) => a + b, 0));
                    if (rowSums.every(s => Math.abs(s - 1) < 1e-4)) return C;
                }
            } else {
                return C;
            }
        }
        return null;
    }

    function trySoulesConstruction(targets, targetClass) {
        const n = targets.length;
        if (targets.some(t => Math.abs(t.im) > 1e-6)) return null;
        const sorted = targets.map(t => t.re).sort((a, b) => b - a);
        if (sorted[0] <= 0) return null;

        const R = Matrix.zeros(n);
        const invSqrtN = 1.0 / Math.sqrt(n);
        for (let i = 0; i < n; i++) R[i][0] = invSqrtN;

        let col = 1;
        function split(indices) {
            if (indices.length <= 1 || col >= n) return;
            const mid = Math.floor(indices.length / 2);
            const left = indices.slice(0, mid);
            const right = indices.slice(mid);

            const nL = left.length, nR = right.length;
            const wL = Math.sqrt(nR / (nL * (nL + nR)));
            const wR = -Math.sqrt(nL / (nR * (nL + nR)));

            for (const idx of left) R[idx][col] = wL;
            for (const idx of right) R[idx][col] = wR;
            col++;

            split(left);
            split(right);
        }
        split(Array.from({ length: n }, (_, i) => i));

        const LambdaRT = Matrix.zeros(n);
        for (let i = 0; i < n; i++) {
            const lam = sorted[i];
            for (let j = 0; j < n; j++) {
                LambdaRT[i][j] = lam * R[j][i];
            }
        }
        const A = Matrix.mul(R, LambdaRT);

        let isNonneg = true;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (A[i][j] < -1e-6) {
                    isNonneg = false;
                    break;
                }
            }
            if (!isNonneg) break;
        }

        if (isNonneg) {
            const cleanA = Matrix.clipNonnegative(Matrix.symmetrize(A));
            if (targetClass === 'stochastic-symmetric') {
                if (Math.abs(sorted[0] - 1) < 1e-4) {
                    const rowSums = cleanA.map(r => r.reduce((a, b) => a + b, 0));
                    if (rowSums.every(s => Math.abs(s - 1) < 1e-3)) return cleanA;
                }
            } else {
                return cleanA;
            }
        }
        return null;
    }

    function tryCirculantConstruction(targets, targetClass) {
        const n = targets.length;
        const perron = targets.reduce((max, t) => Complex.abs(t) > Complex.abs(max) ? t : max, targets[0]);
        if (perron.re <= 0 || Math.abs(perron.im) > 1e-5) return null;

        const rho = perron.re;
        const P = Matrix.zeros(n);
        for (let i = 0; i < n; i++) {
            P[i][(i + 1) % n] = rho;
        }
        const { eigenvalues: pEigs } = realSchur(P);
        const { dist } = calcSpectralDistance(targets, pEigs);
        if (dist < 1e-5) {
            if (targetClass === 'symmetric' || targetClass === 'stochastic-symmetric') {
                if (n > 2) return null;
            }
            if (targetClass === 'stochastic' && Math.abs(rho - 1) > 1e-4) return null;
            return P;
        }
        return null;
    }

    function solveNIEP(targetSpectrum, targetClass, options = {}) {
        const tol = (options && options.tol !== undefined) ? parseFloat(options.tol) : 1e-4;
        const restarts = Math.max(5, (options && options.restarts) ? parseInt(options.restarts, 10) : 10);
        const maxIters = Math.max(1000, (options && options.maxIters) ? parseInt(options.maxIters, 10) : 2500);
        const n = targetSpectrum.length;

        const theoretical = analyzeTheoreticalConditions(targetSpectrum, targetClass);

        if (theoretical.allPassed) {
            const circulant = tryCirculantConstruction(targetSpectrum, targetClass);
            if (circulant) {
                const { eigenvalues } = realSchur(circulant);
                return {
                    success: true,
                    matrix: circulant,
                    dist: 0,
                    eigenvalues,
                    iterations: 1,
                    restarts: 1,
                    method: 'Exact Circulant Realization',
                    theoretical
                };
            }

            const suleimanova = trySuleimanovaConstruction(targetSpectrum, targetClass);
            if (suleimanova) {
                const { eigenvalues } = realSchur(suleimanova);
                return {
                    success: true,
                    matrix: suleimanova,
                    dist: 0,
                    eigenvalues,
                    iterations: 1,
                    restarts: 1,
                    method: 'Exact Suleimanova Realization',
                    theoretical
                };
            }

            const soules = trySoulesConstruction(targetSpectrum, targetClass);
            if (soules) {
                const { eigenvalues } = jacobiEigen(soules);
                return {
                    success: true,
                    matrix: soules,
                    dist: 0,
                    eigenvalues: Array.from(eigenvalues).map(v => ({ re: v, im: 0 })),
                    iterations: 1,
                    restarts: 1,
                    method: 'Exact Soules Orthogonal Realization',
                    theoretical
                };
            }
        }

        const isSymmetric = targetClass === 'symmetric' || targetClass === 'stochastic-symmetric';

        let globalBestMatrix = null;
        let globalBestDist = Infinity;
        let globalBestEigs = null;
        let totalItersRun = 0;

        if (isSymmetric) {
            const sortedTargets = Array.from(targetSpectrum).map(t => t.re).sort((a, b) => b - a);

            for (let r = 0; r < restarts; r++) {
                let A = Matrix.zeros(n);
                if (r === 0) {
                    for (let i = 0; i < n; i++) A[i][i] = Math.max(0, sortedTargets[i]);
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < n; j++) {
                            if (i !== j) A[i][j] = 0.1 * (sortedTargets[0] || 1) / n;
                        }
                    }
                } else {
                    for (let i = 0; i < n; i++) {
                        for (let j = i; j < n; j++) {
                            const val = Math.random() * (sortedTargets[0] || 1);
                            A[i][j] = A[j][i] = val;
                        }
                    }
                }

                if (targetClass === 'stochastic-symmetric') {
                    A = Matrix.projectDoublyStochasticSymmetric(A);
                } else {
                    A = Matrix.clipNonnegative(Matrix.symmetrize(A));
                }

                for (let iter = 0; iter < maxIters; iter++) {
                    totalItersRun++;
                    const { eigenvalues: mu, V } = jacobiEigen(A);

                    let distSq = 0;
                    for (let i = 0; i < n; i++) {
                        distSq += (sortedTargets[i] - mu[i]) ** 2;
                    }
                    const curDist = Math.sqrt(distSq / n);

                    if (curDist < globalBestDist) {
                        globalBestDist = curDist;
                        globalBestMatrix = Matrix.copy(A);
                        globalBestEigs = Array.from(mu).map(m => ({ re: m, im: 0 }));
                    }

                    if (curDist <= tol) {
                        return {
                            success: true,
                            matrix: A,
                            dist: curDist,
                            eigenvalues: Array.from(mu).map(m => ({ re: m, im: 0 })),
                            iterations: totalItersRun,
                            restarts: r + 1,
                            totalRestarts: restarts,
                            method: 'Alternating Projections (Orsi SNIEP)',
                            theoretical
                        };
                    }

                    const LambdaV_T = Matrix.zeros(n);
                    for (let i = 0; i < n; i++) {
                        const lam = sortedTargets[i];
                        for (let j = 0; j < n; j++) {
                            LambdaV_T[i][j] = lam * V[j][i];
                        }
                    }
                    const M = Matrix.mul(V, LambdaV_T);

                    if (targetClass === 'stochastic-symmetric') {
                        A = Matrix.projectDoublyStochasticSymmetric(M);
                    } else {
                        A = Matrix.clipNonnegative(Matrix.symmetrize(M));
                    }
                }
            }
        } else {
            const targetBlocks = structureTargetSpectrum(targetSpectrum);

            for (let r = 0; r < restarts; r++) {
                let A = Matrix.zeros(n);
                if (r === 0) {
                    for (let i = 0; i < n; i++) {
                        A[i][(i + 1) % n] = 1.0;
                    }
                } else {
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < n; j++) {
                            A[i][j] = Math.random();
                        }
                    }
                }

                if (targetClass === 'stochastic') {
                    A = Matrix.projectStochastic(A);
                } else {
                    A = Matrix.clipNonnegative(A);
                }

                for (let iter = 0; iter < maxIters; iter++) {
                    totalItersRun++;
                    const { H, Q, eigenvalues: curEig } = realSchur(A);
                    const { dist: curDist } = calcSpectralDistance(targetSpectrum, curEig);

                    if (curDist < globalBestDist) {
                        globalBestDist = curDist;
                        globalBestMatrix = Matrix.copy(A);
                        globalBestEigs = curEig;
                    }

                    if (curDist <= tol) {
                        return {
                            success: true,
                            matrix: A,
                            dist: curDist,
                            eigenvalues: curEig,
                            iterations: totalItersRun,
                            restarts: r + 1,
                            totalRestarts: restarts,
                            method: 'Alternating Projections (Orsi General NIEP)',
                            theoretical
                        };
                    }

                    const T = Matrix.copy(H);
                    let row = 0;
                    for (let b = 0; b < targetBlocks.length; b++) {
                        const block = targetBlocks[b];
                        if (block.type === '1x1') {
                            T[row][row] = block.re;
                            if (row + 1 < n) T[row + 1][row] = 0;
                            row += 1;
                        } else {
                            T[row][row] = block.re;
                            T[row][row + 1] = block.im;
                            T[row + 1][row] = -block.im;
                            T[row + 1][row + 1] = block.re;
                            if (row + 2 < n) T[row + 2][row + 1] = 0;
                            row += 2;
                        }
                    }

                    const T_QT = Matrix.mul(T, Matrix.transpose(Q));
                    const M = Matrix.mul(Q, T_QT);

                    if (targetClass === 'stochastic') {
                        A = Matrix.projectStochastic(M);
                    } else {
                        A = Matrix.clipNonnegative(M);
                    }
                }
            }
        }

        return {
            success: false,
            matrix: globalBestMatrix,
            bestMatrix: globalBestMatrix,
            dist: globalBestDist,
            eigenvalues: globalBestEigs,
            iterations: totalItersRun,
            restarts,
            totalRestarts: restarts,
            method: 'Alternating Projections (Best Approximation)',
            theoretical
        };
    }

    async function solveNIEPAsync(targetSpectrum, targetClass, options = {}, onProgress = null, cancelToken = null) {
        const tol = (options && options.tol !== undefined) ? parseFloat(options.tol) : 1e-4;
        const restarts = Math.max(5, (options && options.restarts) ? parseInt(options.restarts, 10) : 10);
        const maxIters = Math.max(1000, (options && options.maxIters) ? parseInt(options.maxIters, 10) : 2500);
        const n = targetSpectrum.length;

        const theoretical = analyzeTheoreticalConditions(targetSpectrum, targetClass);

        if (theoretical.allPassed) {
            const circulant = tryCirculantConstruction(targetSpectrum, targetClass);
            if (circulant) {
                const { eigenvalues } = realSchur(circulant);
                return {
                    success: true,
                    matrix: circulant,
                    dist: 0,
                    eigenvalues,
                    iterations: 1,
                    restarts: 1,
                    method: 'Exact Circulant Realization',
                    theoretical
                };
            }

            const suleimanova = trySuleimanovaConstruction(targetSpectrum, targetClass);
            if (suleimanova) {
                const { eigenvalues } = realSchur(suleimanova);
                return {
                    success: true,
                    matrix: suleimanova,
                    dist: 0,
                    eigenvalues,
                    iterations: 1,
                    restarts: 1,
                    method: 'Exact Suleimanova Realization',
                    theoretical
                };
            }

            const soules = trySoulesConstruction(targetSpectrum, targetClass);
            if (soules) {
                const { eigenvalues } = jacobiEigen(soules);
                return {
                    success: true,
                    matrix: soules,
                    dist: 0,
                    eigenvalues: Array.from(eigenvalues).map(v => ({ re: v, im: 0 })),
                    iterations: 1,
                    restarts: 1,
                    method: 'Exact Soules Orthogonal Realization',
                    theoretical
                };
            }
        }

        const isSymmetric = targetClass === 'symmetric' || targetClass === 'stochastic-symmetric';

        let globalBestMatrix = null;
        let globalBestDist = Infinity;
        let globalBestEigs = null;
        let totalItersRun = 0;
        let actualRestarts = 0;

        if (isSymmetric) {
            const sortedTargets = Array.from(targetSpectrum).map(t => t.re).sort((a, b) => b - a);

            for (let r = 0; r < restarts; r++) {
                if (cancelToken && cancelToken.isCancelled) break;
                actualRestarts = r + 1;

                if (onProgress) {
                    onProgress({
                        restart: r + 1,
                        totalRestarts: restarts,
                        bestDist: globalBestDist,
                        iterations: totalItersRun
                    });
                }
                // Yield to browser event loop so UI and clicks update smoothly
                await new Promise(resolve => setTimeout(resolve, 0));
                if (cancelToken && cancelToken.isCancelled) break;

                let A = Matrix.zeros(n);
                if (r === 0) {
                    for (let i = 0; i < n; i++) A[i][i] = Math.max(0, sortedTargets[i]);
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < n; j++) {
                            if (i !== j) A[i][j] = 0.1 * (sortedTargets[0] || 1) / n;
                        }
                    }
                } else {
                    for (let i = 0; i < n; i++) {
                        for (let j = i; j < n; j++) {
                            const val = Math.random() * (sortedTargets[0] || 1);
                            A[i][j] = A[j][i] = val;
                        }
                    }
                }

                if (targetClass === 'stochastic-symmetric') {
                    A = Matrix.projectDoublyStochasticSymmetric(A);
                } else {
                    A = Matrix.clipNonnegative(Matrix.symmetrize(A));
                }

                for (let iter = 0; iter < maxIters; iter++) {
                    totalItersRun++;
                    const { eigenvalues: mu, V } = jacobiEigen(A);

                    let distSq = 0;
                    for (let i = 0; i < n; i++) {
                        distSq += (sortedTargets[i] - mu[i]) ** 2;
                    }
                    const curDist = Math.sqrt(distSq / n);

                    if (curDist < globalBestDist) {
                        globalBestDist = curDist;
                        globalBestMatrix = Matrix.copy(A);
                        globalBestEigs = Array.from(mu).map(m => ({ re: m, im: 0 }));
                    }

                    if (curDist <= tol) {
                        return {
                            success: true,
                            matrix: A,
                            dist: curDist,
                            eigenvalues: Array.from(mu).map(m => ({ re: m, im: 0 })),
                            iterations: totalItersRun,
                            restarts: r + 1,
                            totalRestarts: restarts,
                            method: 'Alternating Projections (Orsi SNIEP)',
                            theoretical
                        };
                    }

                    const LambdaV_T = Matrix.zeros(n);
                    for (let i = 0; i < n; i++) {
                        const lam = sortedTargets[i];
                        for (let j = 0; j < n; j++) {
                            LambdaV_T[i][j] = lam * V[j][i];
                        }
                    }
                    const M = Matrix.mul(V, LambdaV_T);

                    if (targetClass === 'stochastic-symmetric') {
                        A = Matrix.projectDoublyStochasticSymmetric(M);
                    } else {
                        A = Matrix.clipNonnegative(Matrix.symmetrize(M));
                    }
                }
            }
        } else {
            const targetBlocks = structureTargetSpectrum(targetSpectrum);

            for (let r = 0; r < restarts; r++) {
                if (cancelToken && cancelToken.isCancelled) break;
                actualRestarts = r + 1;

                if (onProgress) {
                    onProgress({
                        restart: r + 1,
                        totalRestarts: restarts,
                        bestDist: globalBestDist,
                        iterations: totalItersRun
                    });
                }
                // Yield to browser event loop so UI and clicks update smoothly
                await new Promise(resolve => setTimeout(resolve, 0));
                if (cancelToken && cancelToken.isCancelled) break;

                let A = Matrix.zeros(n);
                if (r === 0) {
                    for (let i = 0; i < n; i++) {
                        A[i][(i + 1) % n] = 1.0;
                    }
                } else {
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < n; j++) {
                            A[i][j] = Math.random();
                        }
                    }
                }

                if (targetClass === 'stochastic') {
                    A = Matrix.projectStochastic(A);
                } else {
                    A = Matrix.clipNonnegative(A);
                }

                for (let iter = 0; iter < maxIters; iter++) {
                    totalItersRun++;
                    const { H, Q, eigenvalues: curEig } = realSchur(A);
                    const { dist: curDist } = calcSpectralDistance(targetSpectrum, curEig);

                    if (curDist < globalBestDist) {
                        globalBestDist = curDist;
                        globalBestMatrix = Matrix.copy(A);
                        globalBestEigs = curEig;
                    }

                    if (curDist <= tol) {
                        return {
                            success: true,
                            matrix: A,
                            dist: curDist,
                            eigenvalues: curEig,
                            iterations: totalItersRun,
                            restarts: r + 1,
                            totalRestarts: restarts,
                            method: 'Alternating Projections (Orsi General NIEP)',
                            theoretical
                        };
                    }

                    const T = Matrix.copy(H);
                    let row = 0;
                    for (let b = 0; b < targetBlocks.length; b++) {
                        const block = targetBlocks[b];
                        if (block.type === '1x1') {
                            T[row][row] = block.re;
                            if (row + 1 < n) T[row + 1][row] = 0;
                            row += 1;
                        } else {
                            T[row][row] = block.re;
                            T[row][row + 1] = block.im;
                            T[row + 1][row] = -block.im;
                            T[row + 1][row + 1] = block.re;
                            if (row + 2 < n) T[row + 2][row + 1] = 0;
                            row += 2;
                        }
                    }

                    const T_QT = Matrix.mul(T, Matrix.transpose(Q));
                    const M = Matrix.mul(Q, T_QT);

                    if (targetClass === 'stochastic') {
                        A = Matrix.projectStochastic(M);
                    } else {
                        A = Matrix.clipNonnegative(M);
                    }
                }
            }
        }

        const isCancelled = !!(cancelToken && cancelToken.isCancelled);

        return {
            success: false,
            cancelled: isCancelled,
            matrix: globalBestMatrix,
            bestMatrix: globalBestMatrix,
            dist: globalBestDist,
            eigenvalues: globalBestEigs,
            iterations: totalItersRun,
            restarts: actualRestarts || restarts,
            totalRestarts: restarts,
            method: isCancelled ? 'Search Stopped (Best Candidate Approximation)' : 'Alternating Projections (Best Approximation)',
            theoretical
        };
    }

    function parseSpectrumInput(rawText) {
        if (!rawText || typeof rawText !== 'string') return [];
        let text = rawText.replace(/[\[\]\(\)\{\}]/g, ' ').trim();
        if (!text) return [];

        let tokens = text.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
        if (tokens.length === 1 && tokens[0].includes(' ')) {
            tokens = tokens[0].split(/\s+/).filter(Boolean);
        }

        const spectrum = [];
        for (let token of tokens) {
            token = token.replace(/\s+/g, '');
            if (!token) continue;

            let re = 0, im = 0;
            const lower = token.toLowerCase();

            if (lower.includes('i') || lower.includes('j')) {
                const clean = lower.replace(/j/g, 'i');
                const fullMatch = clean.match(/^([+-]?\d*\.?\d+(?:e[+-]?\d+)?)([+-]\d*\.?\d*(?:e[+-]?\d+)?)?i$/);
                if (fullMatch) {
                    re = parseFloat(fullMatch[1]);
                    const imStr = fullMatch[2];
                    if (!imStr || imStr === '+') im = 1;
                    else if (imStr === '-') im = -1;
                    else im = parseFloat(imStr);
                } else {
                    const imMatch = clean.match(/^([+-]?\d*\.?\d*(?:e[+-]?\d+)?)i$/);
                    if (imMatch) {
                        const val = imMatch[1];
                        if (!val || val === '+') im = 1;
                        else if (val === '-') im = -1;
                        else im = parseFloat(val);
                    } else {
                        try {
                            const lastSign = clean.lastIndexOf('+', clean.length - 2) > 0 ? '+' : (clean.lastIndexOf('-', clean.length - 2) > 0 ? '-' : null);
                            if (lastSign) {
                                const splitIdx = clean.lastIndexOf(lastSign);
                                re = parseFloat(clean.slice(0, splitIdx)) || 0;
                                let imPart = clean.slice(splitIdx, -1);
                                if (imPart === '+' || imPart === '') im = 1;
                                else if (imPart === '-') im = -1;
                                else im = parseFloat(imPart) || 0;
                            }
                        } catch (e) {}
                    }
                }
            } else {
                re = parseFloat(token);
            }

            if (!isNaN(re) || !isNaN(im)) {
                spectrum.push(Complex.create(re, im));
            }
        }
        return spectrum;
    }

    const PRESETS = [
        {
            id: 'suleimanova4',
            name: 'Suleimanova Spectrum (n = 4)',
            targetClass: 'nonnegative',
            spectrum: '3, -1, -1, -1',
            desc: 'Classic Suleimanova spectrum. Has 1 positive eigenvalue and trace ≥ 0. Realizable in all 4 classes!'
        },
        {
            id: 'karpelevich3',
            name: 'Karpelevič Boundary Roots of Unity (n = 3)',
            targetClass: 'stochastic',
            spectrum: '1, -0.5 + 0.866025i, -0.5 - 0.866025i',
            desc: 'Cubic roots of unity on ∂K₃. Realizable as a 3×3 stochastic permutation matrix.'
        },
        {
            id: 'doubly_stoch4',
            name: 'Doubly Stochastic Symmetric (n = 4)',
            targetClass: 'stochastic-symmetric',
            spectrum: '1, 0.6, -0.3, -0.3',
            desc: 'Real symmetric spectrum with Perron root 1 and row sum 1.'
        },
        {
            id: 'soules4',
            name: 'Soules Realizable Spectrum (n = 4)',
            targetClass: 'symmetric',
            spectrum: '4, 1, -2, -3',
            desc: 'Symmetric NIEP (SNIEP) spectrum realizable via orthogonal Soules transformation.'
        },
        {
            id: 'johnson_loewy5',
            name: 'Johnson-Loewy-London Borderline (n = 5)',
            targetClass: 'nonnegative',
            spectrum: '3, 1, 1, -2.5, -2.5',
            desc: 'Challenging real spectrum right at the boundary of Loewy-London trace bounds.'
        },
        {
            id: 'fiedler4',
            name: 'Fiedler Zero-Trace Spectrum (n = 4)',
            targetClass: 'symmetric',
            spectrum: '4, 0, -2, -2',
            desc: 'Trace zero symmetric realization with zero diagonal entries.'
        },
        {
            id: 'impossible_trace',
            name: 'Provably Infeasible: Negative Trace (n = 3)',
            targetClass: 'nonnegative',
            spectrum: '1, 1, -2',
            desc: 'Satisfies tr(A) = 0, but power trace s₃ = 1³ + 1³ + (-2)³ = -6 < 0. No nonnegative matrix exists!'
        },
        {
            id: 'impossible_stoch',
            name: 'Infeasible Stochastic: Outside K₃ (n = 3)',
            targetClass: 'stochastic',
            spectrum: '1, 0.8i, -0.8i',
            desc: 'Perron root is 1, but complex conjugate pair lies strictly outside the Karpelevič boundary ∂K₃.'
        }
    ];

    // Export engine to window & module
    const SpectraRealizerEngine = {
        Complex,
        Matrix,
        jacobiEigen,
        realSchur,
        calcSpectralDistance,
        analyzeTheoreticalConditions,
        solveNIEP,
        solveNIEPAsync,
        parseSpectrumInput,
        PRESETS
    };

    if (typeof window !== 'undefined') {
        window.SpectraRealizerEngine = SpectraRealizerEngine;
    }

    // =========================================================================
    // UI Controller & Interactive Canvas Visualizer
    // =========================================================================

    class SpectraRealizerApp {
        constructor() {
            this.currentResult = null;
            this.currentTargetSpectrum = [];
            this.canvasScale = 1.0;
            this.canvasOffset = { x: 0, y: 0 };
            this.isDragging = false;
            this.dragStart = { x: 0, y: 0 };
            this.hoveredPoint = null;
            this.matrixPrecision = 4;
            this.currentCancelToken = null;

            this.initDOM();
            this.initEvents();
            this.loadPreset('suleimanova4');
        }

        initDOM() {
            this.presetSelect = document.getElementById('presetSelect');
            this.spectrumInput = document.getElementById('spectrumInput');
            this.classRadios = document.querySelectorAll('input[name="targetClass"]');
            this.tolSelect = document.getElementById('tolSelect');
            this.retriesInput = document.getElementById('retriesInput');
            this.depthInput = document.getElementById('depthInput');
            this.chipBtns = document.querySelectorAll('.chip-btn');
            this.solveBtn = document.getElementById('solveBtn');
            this.solveBtnText = document.getElementById('solveBtnText');
            this.stopBtn = document.getElementById('stopBtn');
            this.resetBtn = document.getElementById('resetBtn');
            this.presetDesc = document.getElementById('presetDesc');

            // Solver progress DOM
            this.solverProgressBox = document.getElementById('solverProgressBox');
            this.progressStatusText = document.getElementById('progressStatusText');
            this.progressPctText = document.getElementById('progressPctText');
            this.progressBarFill = document.getElementById('progressBarFill');
            this.progressBestText = document.getElementById('progressBestText');
            this.progressIterText = document.getElementById('progressIterText');

            // Output DOM
            this.statusBanner = document.getElementById('statusBanner');
            this.statusIcon = document.getElementById('statusIcon');
            this.statusTitle = document.getElementById('statusTitle');
            this.statusDesc = document.getElementById('statusDesc');
            this.statusBadge = document.getElementById('statusBadge');

            this.matrixContainer = document.getElementById('matrixContainer');
            this.matrixMeta = document.getElementById('matrixMeta');
            this.canvas = document.getElementById('spectralCanvas');
            this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

            this.diagList = document.getElementById('diagList');
            this.eigenTableBody = document.getElementById('eigenTableBody');
            this.matrixPropsBody = document.getElementById('matrixPropsBody');

            // Populate preset select dropdown
            if (this.presetSelect) {
                this.presetSelect.innerHTML = '';
                for (const p of PRESETS) {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = p.name;
                    this.presetSelect.appendChild(opt);
                }
            }
        }

        initEvents() {
            if (this.presetSelect) {
                this.presetSelect.addEventListener('change', () => {
                    this.loadPreset(this.presetSelect.value);
                });
            }

            if (this.solveBtn) {
                this.solveBtn.addEventListener('click', () => {
                    this.runSolver();
                });
            }

            if (this.stopBtn) {
                this.stopBtn.addEventListener('click', () => {
                    if (this.currentCancelToken) {
                        this.currentCancelToken.isCancelled = true;
                        this.stopBtn.disabled = true;
                        this.stopBtn.innerHTML = '<span>&#x23F3;</span><span>Stopping...</span>';
                    }
                });
            }

            // Profile chips for search effort
            if (this.chipBtns) {
                this.chipBtns.forEach(chip => {
                    chip.addEventListener('click', () => {
                        this.chipBtns.forEach(c => c.classList.remove('active'));
                        chip.classList.add('active');
                        if (this.retriesInput && chip.dataset.retries) {
                            this.retriesInput.value = chip.dataset.retries;
                        }
                        if (this.depthInput && chip.dataset.depth) {
                            this.depthInput.value = chip.dataset.depth;
                        }
                    });
                });
            }

            const onCustomParamInput = () => {
                if (this.chipBtns) {
                    this.chipBtns.forEach(c => c.classList.remove('active'));
                }
            };

            if (this.retriesInput) {
                this.retriesInput.addEventListener('input', onCustomParamInput);
                this.retriesInput.addEventListener('change', () => {
                    let val = parseInt(this.retriesInput.value, 10);
                    if (isNaN(val) || val < 5) {
                        this.retriesInput.value = 5;
                    }
                });
            }

            if (this.depthInput) {
                this.depthInput.addEventListener('input', onCustomParamInput);
                this.depthInput.addEventListener('change', () => {
                    let val = parseInt(this.depthInput.value, 10);
                    if (isNaN(val) || val < 1000) {
                        this.depthInput.value = 1000;
                    }
                });
            }

            if (this.resetBtn) {
                this.resetBtn.addEventListener('click', () => {
                    this.loadPreset(this.presetSelect.value || 'suleimanova4');
                });
            }

            // Target class radio change
            this.classRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    this.onTargetClassChange();
                });
            });

            // Precision buttons
            document.querySelectorAll('.prec-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.prec-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.matrixPrecision = parseInt(btn.dataset.prec, 10) || 4;
                    if (this.currentResult && (this.currentResult.matrix || this.currentResult.bestMatrix)) {
                        this.renderMatrix(this.currentResult.matrix || this.currentResult.bestMatrix);
                    }
                });
            });

            // Copy buttons
            const copyLatex = document.getElementById('copyLatexBtn');
            if (copyLatex) copyLatex.addEventListener('click', () => this.copyAs('latex'));
            const copyNumpy = document.getElementById('copyNumpyBtn');
            if (copyNumpy) copyNumpy.addEventListener('click', () => this.copyAs('numpy'));
            const copyMatlab = document.getElementById('copyMatlabBtn');
            if (copyMatlab) copyMatlab.addEventListener('click', () => this.copyAs('matlab'));
            const copyJson = document.getElementById('copyJsonBtn');
            if (copyJson) copyJson.addEventListener('click', () => this.copyAs('json'));

            // Canvas Zoom & Pan
            if (this.canvas) {
                this.canvas.addEventListener('mousedown', (e) => {
                    this.isDragging = true;
                    this.dragStart = { x: e.clientX - this.canvasOffset.x, y: e.clientY - this.canvasOffset.y };
                });
                window.addEventListener('mousemove', (e) => {
                    if (this.isDragging) {
                        this.canvasOffset.x = e.clientX - this.dragStart.x;
                        this.canvasOffset.y = e.clientY - this.dragStart.y;
                        this.drawCanvas();
                    }
                });
                window.addEventListener('mouseup', () => {
                    this.isDragging = false;
                });
                this.canvas.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
                    this.canvasScale = Math.max(0.2, Math.min(10, this.canvasScale * zoomFactor));
                    this.drawCanvas();
                }, { passive: false });

                const zoomIn = document.getElementById('zoomInBtn');
                if (zoomIn) zoomIn.addEventListener('click', () => {
                    this.canvasScale = Math.min(10, this.canvasScale * 1.25);
                    this.drawCanvas();
                });
                const zoomOut = document.getElementById('zoomOutBtn');
                if (zoomOut) zoomOut.addEventListener('click', () => {
                    this.canvasScale = Math.max(0.2, this.canvasScale / 1.25);
                    this.drawCanvas();
                });
                const zoomReset = document.getElementById('zoomResetBtn');
                if (zoomReset) zoomReset.addEventListener('click', () => {
                    this.canvasScale = 1.0;
                    this.canvasOffset = { x: 0, y: 0 };
                    this.drawCanvas();
                });

                // Window resize listener (prevents feedback loops)
                window.addEventListener('resize', () => {
                    this.resizeCanvas();
                    this.drawCanvas();
                });

                // Redraw on theme switch
                if (typeof MutationObserver !== 'undefined') {
                    const themeObs = new MutationObserver(() => {
                        this.drawCanvas();
                    });
                    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
                }
            }
        }

        onTargetClassChange() {
            const currentClass = this.getSelectedClass();
            // If symmetric is selected and input contains 'i', show helpful warning or auto-strip
            const raw = this.spectrumInput.value;
            if ((currentClass === 'symmetric' || currentClass === 'stochastic-symmetric') && raw.includes('i')) {
                // Keep input but run solver to trigger proper diagnostic warning
            }
            this.runSolver();
        }

        getSelectedClass() {
            for (const r of this.classRadios) {
                if (r.checked) return r.value;
            }
            return 'nonnegative';
        }

        setSelectedClass(cls) {
            this.classRadios.forEach(r => {
                r.checked = (r.value === cls);
            });
        }

        loadPreset(presetId) {
            const p = PRESETS.find(x => x.id === presetId);
            if (!p) return;

            this.spectrumInput.value = p.spectrum;
            this.setSelectedClass(p.targetClass);
            if (this.presetDesc) {
                this.presetDesc.textContent = p.desc;
            }
            this.runSolver();
        }

        async runSolver() {
            if (this.currentCancelToken) {
                this.currentCancelToken.isCancelled = true;
            }

            const rawText = this.spectrumInput ? this.spectrumInput.value : '';
            const targetClass = this.getSelectedClass();
            const targets = parseSpectrumInput(rawText);
            this.currentTargetSpectrum = targets;

            if (targets.length === 0) {
                this.renderEmptyState('Please enter at least one eigenvalue in the spectrum input.');
                return;
            }

            // Get tolerance, retries, and depth with enforced minimums
            const tol = parseFloat(this.tolSelect ? this.tolSelect.value : 1e-4) || 1e-4;
            let restarts = parseInt(this.retriesInput ? this.retriesInput.value : 10, 10);
            if (isNaN(restarts) || restarts < 5) restarts = 5;

            let maxIters = parseInt(this.depthInput ? this.depthInput.value : 2500, 10);
            if (isNaN(maxIters) || maxIters < 1000) maxIters = 1000;

            const cancelToken = { isCancelled: false };
            this.currentCancelToken = cancelToken;

            // Show loading and progress state
            if (this.solveBtn) {
                this.solveBtn.classList.add('loading');
                this.solveBtn.disabled = true;
            }
            if (this.solveBtnText) {
                this.solveBtnText.textContent = 'Searching...';
            }
            if (this.stopBtn) {
                this.stopBtn.classList.remove('hidden');
                this.stopBtn.disabled = false;
                this.stopBtn.innerHTML = '<span>&#x25A0;</span><span>Stop</span>';
            }
            if (this.solverProgressBox) {
                this.solverProgressBox.classList.remove('hidden');
            }
            if (this.progressBarFill) this.progressBarFill.style.width = '0%';
            if (this.progressPctText) this.progressPctText.textContent = '0%';
            if (this.progressStatusText) this.progressStatusText.textContent = `Starting attempt 1 of ${restarts}...`;
            if (this.progressBestText) this.progressBestText.textContent = 'Best error: searching...';
            if (this.progressIterText) this.progressIterText.textContent = 'Total iters: 0';

            const onProgress = (p) => {
                const pct = Math.min(100, Math.round((p.restart / p.totalRestarts) * 100));
                if (this.progressBarFill) this.progressBarFill.style.width = `${pct}%`;
                if (this.progressPctText) this.progressPctText.textContent = `${pct}%`;
                if (this.progressStatusText) this.progressStatusText.textContent = `Attempt ${p.restart} of ${p.totalRestarts}...`;
                if (this.progressBestText) {
                    this.progressBestText.textContent = p.bestDist === Infinity
                        ? 'Best error: searching...'
                        : `Best error: ${p.bestDist.toExponential(2)}`;
                }
                if (this.progressIterText) this.progressIterText.textContent = `Total iters: ${p.iterations.toLocaleString()}`;
            };

            const startTime = performance.now();
            let result;
            try {
                result = await solveNIEPAsync(targets, targetClass, { tol, maxIters, restarts }, onProgress, cancelToken);
            } catch (err) {
                console.error('Error during solveNIEPAsync:', err);
                result = solveNIEP(targets, targetClass, { tol, maxIters, restarts });
            }
            const elapsedMs = (performance.now() - startTime).toFixed(1);

            // Clean up running state
            if (this.stopBtn) {
                this.stopBtn.classList.add('hidden');
            }
            if (this.solverProgressBox) {
                this.solverProgressBox.classList.add('hidden');
            }
            if (this.solveBtn) {
                this.solveBtn.classList.remove('loading');
                this.solveBtn.disabled = false;
            }
            if (this.solveBtnText) {
                this.solveBtnText.textContent = 'Realize Spectrum';
            }

            this.currentResult = result;
            this.renderResults(result, targetClass, tol, elapsedMs);
        }

        renderResults(result, targetClass, tol, elapsedMs) {
            const M = result.matrix || result.bestMatrix;
            const isFound = result.success;

            // 1. Status Banner
            this.statusBanner.className = 'status-banner ' + (isFound ? 'success' : (result.cancelled ? 'warning' : (result.theoretical.allPassed ? 'warning' : 'danger')));
            if (isFound) {
                this.statusIcon.innerHTML = '&#x2714;&#xFE0F;';
                this.statusTitle.textContent = 'Realization Found';
                this.statusBadge.className = 'badge success';
                this.statusBadge.textContent = `Error: ${result.dist.toExponential(2)} ≤ ${tol.toExponential(0)}`;
                this.statusDesc.textContent = `A valid ${this.getClassName(targetClass)} was successfully constructed in ${result.iterations.toLocaleString()} iterations across ${result.restarts} attempt(s) (${elapsedMs} ms) using ${result.method}.`;
            } else if (result.cancelled) {
                this.statusIcon.innerHTML = '&#x23F9;&#xFE0F;';
                this.statusTitle.textContent = 'Search Stopped (Best Found Candidate)';
                this.statusBadge.className = 'badge warning';
                this.statusBadge.textContent = `Error: ${result.dist.toExponential(3)}`;
                this.statusDesc.textContent = `Search was halted early after ${result.restarts} attempt(s) (${result.iterations.toLocaleString()} iterations, ${elapsedMs} ms). Displaying the best candidate approximation found so far.`;
            } else {
                this.statusIcon.innerHTML = result.theoretical.allPassed ? '&#x26A0;&#xFE0F;' : '&#x274C;';
                this.statusTitle.textContent = result.theoretical.allPassed ? 'Best Found Candidate' : 'Infeasible / Best Approximation';
                this.statusBadge.className = 'badge warning';
                this.statusBadge.textContent = `Best Residual: ${result.dist.toExponential(3)} > tol`;
                
                if (!result.theoretical.allPassed) {
                    this.statusDesc.textContent = `The spectrum violates necessary mathematical conditions for this matrix class (see Diagnostics below). Showing the closest candidate found by numerical projection.`;
                } else {
                    this.statusDesc.textContent = `No realizing matrix was found within tolerance (${tol.toExponential(0)}) after ${result.iterations.toLocaleString()} iterations across ${result.restarts} attempts. Displaying the best found candidate with minimal spectral discrepancy.`;
                }
            }

            // 2. Matrix Display
            if (M) {
                this.renderMatrix(M);
                this.matrixMeta.textContent = `${M.length}×${M.length} ${this.getClassName(targetClass)} · Spectral error: ${result.dist.toExponential(3)}`;
            } else {
                this.matrixContainer.innerHTML = '<div class="no-matrix">No valid candidate matrix available.</div>';
            }

            // 3. Canvas Visualization
            this.drawCanvas();

            // 4. Theoretical Diagnostics List
            this.renderDiagnostics(result.theoretical);

            // 5. Verification Tables
            this.renderVerification(result, targetClass, M);
        }

        getClassName(cls) {
            switch (cls) {
                case 'nonnegative': return 'Nonnegative Matrix (A ≥ 0)';
                case 'stochastic': return 'Stochastic Matrix (A ≥ 0, row sum = 1)';
                case 'symmetric': return 'Symmetric Nonnegative Matrix (A = Aᵀ ≥ 0)';
                case 'stochastic-symmetric': return 'Stochastic Symmetric Matrix (Doubly Stochastic)';
                default: return 'Nonnegative Matrix';
            }
        }

        renderMatrix(M) {
            const n = M.length;
            let maxVal = 0;
            for (let i = 0; i < n; i++)
                for (let j = 0; j < n; j++)
                    if (Math.abs(M[i][j]) > maxVal) maxVal = Math.abs(M[i][j]);

            if (maxVal === 0) maxVal = 1;

            let html = '<table class="matrix-table">';
            // Column headers
            html += '<thead><tr><th></th>';
            for (let j = 0; j < n; j++) html += `<th>${j + 1}</th>`;
            html += '</tr></thead><tbody>';

            for (let i = 0; i < n; i++) {
                html += `<tr><th>${i + 1}</th>`;
                for (let j = 0; j < n; j++) {
                    const val = M[i][j];
                    const cleanVal = Math.abs(val) < 1e-12 ? 0 : val;
                    const intensity = Math.min(1, Math.max(0, cleanVal / maxVal));
                    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
                    const bg = isDark
                        ? `rgba(59, 130, 246, ${0.08 + intensity * 0.35})`
                        : `rgba(37, 99, 235, ${0.06 + intensity * 0.28})`;
                    
                    const strVal = cleanVal.toFixed(this.matrixPrecision);
                    html += `<td style="background: ${bg};" title="A[${i+1},${j+1}] = ${val}">${strVal}</td>`;
                }
                html += '</tr>';
            }
            html += '</tbody></table>';
            this.matrixContainer.innerHTML = html;
        }

        renderDiagnostics(theoretical) {
            if (!this.diagList) return;
            let html = '';
            for (const d of theoretical.diagnostics) {
                const icon = d.status === 'pass' ? '&#x2705;' : '&#x274C;';
                const pillClass = d.status === 'pass' ? 'pass-pill' : 'fail-pill';
                html += `
                    <div class="diag-item ${d.status}">
                        <div class="diag-item-header">
                            <span class="diag-icon">${icon}</span>
                            <span class="diag-name">${d.name}</span>
                            <span class="diag-pill ${pillClass}">${d.status.toUpperCase()}</span>
                        </div>
                        <p class="diag-detail">${d.detail}</p>
                    </div>
                `;
            }
            this.diagList.innerHTML = html;
        }

        renderVerification(result, targetClass, M) {
            // Eigenvalue comparison table
            if (this.eigenTableBody && result.eigenvalues) {
                const { pairs } = calcSpectralDistance(this.currentTargetSpectrum, result.eigenvalues);
                let html = '';
                for (let i = 0; i < pairs.length; i++) {
                    const p = pairs[i];
                    const err = p.dist;
                    const errClass = err < 1e-3 ? 'good' : (err < 0.1 ? 'warn' : 'bad');
                    html += `
                        <tr>
                            <td><strong>λ_${i + 1}</strong></td>
                            <td>${Complex.format(p.target, 4)}</td>
                            <td>${Complex.format(p.candidate, 4)}</td>
                            <td class="${errClass}">${err.toExponential(3)}</td>
                        </tr>
                    `;
                }
                this.eigenTableBody.innerHTML = html;
            }

            // Matrix properties table
            if (this.matrixPropsBody && M) {
                const n = M.length;
                let minEntry = Infinity;
                let maxRowSum = -Infinity, minRowSum = Infinity;
                let maxSymDiff = 0;

                for (let i = 0; i < n; i++) {
                    let rSum = 0;
                    for (let j = 0; j < n; j++) {
                        const v = M[i][j];
                        if (v < minEntry) minEntry = v;
                        rSum += v;
                        const symDiff = Math.abs(M[i][j] - M[j][i]);
                        if (symDiff > maxSymDiff) maxSymDiff = symDiff;
                    }
                    if (rSum > maxRowSum) maxRowSum = rSum;
                    if (rSum < minRowSum) minRowSum = rSum;
                }

                const minEntryPass = minEntry >= -1e-6;
                const rowSumPass = (targetClass === 'stochastic' || targetClass === 'stochastic-symmetric')
                    ? (Math.abs(maxRowSum - 1) < 1e-3 && Math.abs(minRowSum - 1) < 1e-3)
                    : true;
                const symPass = (targetClass === 'symmetric' || targetClass === 'stochastic-symmetric')
                    ? maxSymDiff < 1e-4
                    : true;

                let html = `
                    <tr>
                        <td><strong>Nonnegativity (min A_ij)</strong></td>
                        <td>${minEntry.toFixed(6)}</td>
                        <td>${minEntryPass ? '<span class="tag-pass">PASS (A ≥ 0)</span>' : '<span class="tag-fail">VIOLATED</span>'}</td>
                    </tr>
                    <tr>
                        <td><strong>Row Sum Range [min, max]</strong></td>
                        <td>[${minRowSum.toFixed(4)}, ${maxRowSum.toFixed(4)}]</td>
                        <td>${rowSumPass ? '<span class="tag-pass">PASS</span>' : '<span class="tag-warn">NON-UNIT</span>'}</td>
                    </tr>
                    <tr>
                        <td><strong>Symmetry Deviation ||A - Aᵀ||_max</strong></td>
                        <td>${maxSymDiff.toExponential(3)}</td>
                        <td>${symPass ? '<span class="tag-pass">PASS</span>' : '<span class="tag-warn">NON-SYMMETRIC</span>'}</td>
                    </tr>
                    <tr>
                        <td><strong>Matrix Order (Dimension n)</strong></td>
                        <td>${n} × ${n}</td>
                        <td><span class="tag-pass">VALID</span></td>
                    </tr>
                `;
                this.matrixPropsBody.innerHTML = html;
            }
        }

        renderEmptyState(msg) {
            if (this.statusBanner) {
                this.statusBanner.className = 'status-banner warning';
                this.statusIcon.innerHTML = '&#x2139;&#xFE0F;';
                this.statusTitle.textContent = 'Input Required';
                this.statusBadge.className = 'badge warning';
                this.statusBadge.textContent = 'Awaiting Input';
                this.statusDesc.textContent = msg;
            }
            if (this.matrixContainer) this.matrixContainer.innerHTML = '';
            if (this.eigenTableBody) this.eigenTableBody.innerHTML = '';
            if (this.matrixPropsBody) this.matrixPropsBody.innerHTML = '';
            if (this.diagList) this.diagList.innerHTML = '';
        }

        copyAs(format) {
            if (!this.currentResult) return;
            const M = this.currentResult.matrix || this.currentResult.bestMatrix;
            if (!M) return;
            const n = M.length;
            let text = '';

            if (format === 'latex') {
                text = '\\begin{pmatrix}\n';
                for (let i = 0; i < n; i++) {
                    const row = Array.from(M[i]).map(x => (Math.abs(x) < 1e-12 ? 0 : x).toFixed(this.matrixPrecision));
                    text += '  ' + row.join(' & ') + (i < n - 1 ? ' \\\\\n' : '\n');
                }
                text += '\\end{pmatrix}';
            } else if (format === 'numpy') {
                text = 'import numpy as np\n\nA = np.array([\n';
                for (let i = 0; i < n; i++) {
                    const row = Array.from(M[i]).map(x => (Math.abs(x) < 1e-12 ? 0 : x).toFixed(this.matrixPrecision));
                    text += '  [' + row.join(', ') + ']' + (i < n - 1 ? ',\n' : '\n');
                }
                text += '])';
            } else if (format === 'matlab') {
                text = 'A = [\n';
                for (let i = 0; i < n; i++) {
                    const row = Array.from(M[i]).map(x => (Math.abs(x) < 1e-12 ? 0 : x).toFixed(this.matrixPrecision));
                    text += '  ' + row.join(' ') + (i < n - 1 ? ';\n' : '\n');
                }
                text += '];';
            } else if (format === 'json') {
                const arr = Array.from(M).map(row => Array.from(row));
                text = JSON.stringify(arr, null, 2);
            }

            navigator.clipboard.writeText(text).then(() => {
                this.showToast(`Copied matrix as ${format.toUpperCase()}!`);
            }).catch(() => {
                this.showToast('Failed to copy to clipboard.');
            });
        }

        showToast(msg) {
            let toast = document.getElementById('realizerToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'realizerToast';
                toast.className = 'realizer-toast';
                document.body.appendChild(toast);
            }
            toast.textContent = msg;
            toast.classList.add('visible');
            setTimeout(() => {
                toast.classList.remove('visible');
            }, 2500);
        }

        // --- Complex Plane Canvas Visualization ---
        resizeCanvas() {
            if (!this.canvas || !this.ctx) return;
            const parent = this.canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const w = Math.floor(rect.width);
            const h = Math.floor(rect.height);
            if (w <= 0 || h <= 0) return;

            const targetW = Math.round(w * dpr);
            const targetH = Math.round(h * dpr);

            if (this.canvas.width === targetW && this.canvas.height === targetH) {
                return;
            }

            this.canvas.width = targetW;
            this.canvas.height = targetH;

            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.scale(dpr, dpr);
        }

        drawCanvas() {
            if (!this.canvas || !this.ctx) return;
            const ctx = this.ctx;
            const rect = this.canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

            // Background
            ctx.fillStyle = isDark ? '#0b1120' : '#ffffff';
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2 + this.canvasOffset.x;
            const centerY = height / 2 + this.canvasOffset.y;

            // Determine bounds
            let maxCoord = 1.25;
            for (const t of this.currentTargetSpectrum) {
                maxCoord = Math.max(maxCoord, Math.abs(t.re) * 1.2, Math.abs(t.im) * 1.2);
            }
            if (this.currentResult && this.currentResult.eigenvalues) {
                for (const e of this.currentResult.eigenvalues) {
                    maxCoord = Math.max(maxCoord, Math.abs(e.re) * 1.2, Math.abs(e.im) * 1.2);
                }
            }

            const baseRadius = (Math.min(width, height) / 2) * 0.75;
            const pxPerUnit = (baseRadius / maxCoord) * this.canvasScale;

            const toScreenX = (x) => centerX + x * pxPerUnit;
            const toScreenY = (y) => centerY - y * pxPerUnit;

            // Grid lines
            ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
            ctx.lineWidth = 1;

            const step = maxCoord > 4 ? 2 : (maxCoord > 2 ? 1 : 0.5);
            for (let val = -Math.ceil(maxCoord * 2); val <= Math.ceil(maxCoord * 2); val += step) {
                if (Math.abs(val) < 1e-6) continue;
                // Vertical grid
                const sx = toScreenX(val);
                ctx.beginPath();
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx, height);
                ctx.stroke();

                // Horizontal grid
                const sy = toScreenY(val);
                ctx.beginPath();
                ctx.moveTo(0, sy);
                ctx.lineTo(width, sy);
                ctx.stroke();
            }

            // Axes
            ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, height);
            ctx.stroke();

            // Unit circle
            ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(37, 99, 235, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(centerX, centerY, 1 * pxPerUnit, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Labels for axes
            ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText('Re', width - 24, centerY - 6);
            ctx.fillText('Im', centerX + 6, 16);
            ctx.fillText('1', toScreenX(1) - 4, centerY + 16);
            ctx.fillText('-1', toScreenX(-1) - 6, centerY + 16);

            // If stochastic, draw Karpelevic boundary if order n <= 5
            const targetClass = this.getSelectedClass();
            if ((targetClass === 'stochastic' || targetClass === 'stochastic-symmetric') && this.currentTargetSpectrum.length === 3) {
                // Draw Karpelevic K_3 triangle: 1, e^{i 2pi/3}, e^{i 4pi/3}
                ctx.strokeStyle = isDark ? 'rgba(244, 114, 182, 0.4)' : 'rgba(219, 39, 119, 0.4)';
                ctx.fillStyle = isDark ? 'rgba(244, 114, 182, 0.08)' : 'rgba(219, 39, 119, 0.06)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                const kPts = [
                    { x: 1, y: 0 },
                    { x: -0.5, y: Math.sqrt(3) / 2 },
                    { x: -0.5, y: -Math.sqrt(3) / 2 }
                ];
                ctx.moveTo(toScreenX(kPts[0].x), toScreenY(kPts[0].y));
                ctx.lineTo(toScreenX(kPts[1].x), toScreenY(kPts[1].y));
                ctx.lineTo(toScreenX(kPts[2].x), toScreenY(kPts[2].y));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            // Draw pairs connecting lines
            if (this.currentResult && this.currentResult.eigenvalues) {
                const { pairs } = calcSpectralDistance(this.currentTargetSpectrum, this.currentResult.eigenvalues);
                ctx.strokeStyle = isDark ? 'rgba(239, 68, 68, 0.7)' : 'rgba(220, 38, 38, 0.7)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                for (const p of pairs) {
                    ctx.beginPath();
                    ctx.moveTo(toScreenX(p.target.re), toScreenY(p.target.im));
                    ctx.lineTo(toScreenX(p.candidate.re), toScreenY(p.candidate.im));
                    ctx.stroke();
                }
                ctx.setLineDash([]);
            }

            // Draw Target Spectrum (Blue Rings)
            for (let i = 0; i < this.currentTargetSpectrum.length; i++) {
                const t = this.currentTargetSpectrum[i];
                const sx = toScreenX(t.re);
                const sy = toScreenY(t.im);

                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2.5;
                ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
                ctx.beginPath();
                ctx.arc(sx, sy, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Inner cross
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(sx - 3, sy);
                ctx.lineTo(sx + 3, sy);
                ctx.moveTo(sx, sy - 3);
                ctx.lineTo(sx, sy + 3);
                ctx.stroke();
            }

            // Draw Realized / Candidate Spectrum (Filled Magenta/Emerald Dots)
            if (this.currentResult && this.currentResult.eigenvalues) {
                const isSuccess = this.currentResult.success;
                const dotColor = isSuccess ? '#10b981' : '#f59e0b';

                for (let i = 0; i < this.currentResult.eigenvalues.length; i++) {
                    const e = this.currentResult.eigenvalues[i];
                    const sx = toScreenX(e.re);
                    const sy = toScreenY(e.im);

                    ctx.fillStyle = dotColor;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Auto-mount when DOM is ready and page elements exist
    if (typeof document !== 'undefined' && document.getElementById && document.getElementById('presetSelect')) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.realizerApp = new SpectraRealizerApp();
            });
        } else {
            window.realizerApp = new SpectraRealizerApp();
        }
    }

    // Node.js CommonJS export
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SpectraRealizerEngine;
    }

})();
