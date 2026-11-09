/**
 * Karpelevič Monograph Series Navigation Web Component (<karpelevich-book-nav>)
 *
 * Provides a unified "book experience" across the Karpelevič proof series:
 *  - Top series banner bar with volume identification and chapter badge
 *  - Interactive "Choose Chapter" dropdown selector with instant navigation
 *  - Expandable visual Table of Contents drawer with cards for all 9 stops + Roadmap
 *  - Sequential Previous / Next chapter jump buttons
 *
 * Scoped, responsive, theme-adaptive, and accessible.
 */
(function() {
    'use strict';

    const CHAPTERS = [
        {
            id: 'roadmap',
            stopNum: 0,
            shortLabel: 'Roadmap',
            title: 'Series Roadmap: A Map of the Argument',
            pageTitle: 'Inside Karpelevich’s Proof: A Map of the Argument, with Precise Statements and a Proof Ledger',
            url: 'karpelevich-proof-roadmap.html',
            summary: 'Visual architecture of the nine stops, dependency map between Theorem A and Theorem B, and worked 4×4 family.',
            tag: 'Series Architecture',
            status: 'published'
        },
        {
            id: 'stop-1',
            stopNum: 1,
            shortLabel: 'Stop 1',
            title: 'Stop 1: From Matrix Rows to Convex Hulls',
            pageTitle: 'From Matrix Rows to Convex Hulls: An Eigenvector Becomes a Geometric Witness',
            url: 'karpelevich-polygons.html',
            summary: 'Row-stochastic matrices as convex combinations, invariant polygons (λQ ⊆ Q), Perron normalization, and unit-circle landmarks.',
            tag: 'Invariant Polygons',
            status: 'published'
        },
        {
            id: 'stop-2',
            stopNum: 2,
            shortLabel: 'Stop 2',
            title: 'Stop 2: What Extremality Forces',
            pageTitle: 'What Extremality Forces: A Polygon with No Room to Spare',
            url: 'karpelevich-contacts.html',
            summary: 'Extremal contacts forced onto polygon edges, support lines, and the Dmitriev–Dynkin fixed cyclic shift on two diagonals.',
            tag: 'Boundary Contacts',
            status: 'published'
        },
        {
            id: 'stop-3',
            stopNum: 3,
            shortLabel: 'Stop 3',
            title: 'Stop 3: Karpelevič’s Game',
            pageTitle: 'Karpelevich’s Game: A Circular Board, a Corner Cut, and a Way to Simplify an Eigenvalue',
            url: 'karpelevich-game.html',
            summary: 'Corner cuts that contract polygons, legal chip jump rules, and the modular record reduction narrowing extremal candidates.',
            tag: 'Chip Game',
            status: 'published'
        },
        {
            id: 'stop-4',
            stopNum: 4,
            shortLabel: 'Stop 4',
            title: 'Stop 4: Why the Euclidean Algorithm Appears',
            pageTitle: 'Why the Euclidean Algorithm Appears in an Eigenvalue Problem',
            url: 'karpelevich-returns.html',
            summary: 'Consecutive contact blocks, subtractive Euclidean record updates (pU + qL = n), and the two first-return chains (p and p+q).',
            tag: 'Euclidean Returns',
            status: 'published'
        },
        {
            id: 'stop-5',
            stopNum: 5,
            shortLabel: 'Stop 5',
            title: 'Stop 5: Moving Polygons Until Weights Agree',
            pageTitle: 'Moving Polygons Until the Weights Agree: Geometric Freedom Becomes a Contradiction',
            url: 'karpelevich-rigidity.html',
            summary: 'Fractional linear return maps forcing r = 1, and barycentric edge slides proving all contact weights coincide (α₁ = ··· = α_R).',
            tag: 'Geometric Rigidity',
            status: 'published'
        },
        {
            id: 'stop-6',
            stopNum: 6,
            shortLabel: 'Stop 6',
            title: 'Stop 6: Where Boundary Equations Come From',
            pageTitle: 'Where the Boundary Equations Come From: Multiply Along Chains, Then Close the Loop',
            url: 'karpelevich-boundary-equations.html',
            summary: 'Explicit powers counting chain lengths, tail shifts, and cycle-expansion proofs that the boundary curves are characteristic polynomials.',
            tag: 'Boundary Curves',
            status: 'published'
        },
        {
            id: 'stop-7',
            stopNum: 7,
            shortLabel: 'Stop 7',
            title: 'Stop 7: Why Farey Neighbors Label the Arcs',
            pageTitle: 'Why Farey Neighbors Label the Arcs: Turn Counts Locate the Algebraic Curves',
            url: 'karpelevich-farey.html',
            summary: 'Determinant-one Farey neighbors (bc − ad = 1, b + d > n), mediant insertion, integer winding in Arg(λ^ℓ), and endpoint root selection.',
            tag: 'Farey Neighbors',
            status: 'published'
        },
        {
            id: 'stop-8',
            stopNum: 8,
            shortLabel: 'Stop 8',
            title: 'Stop 8: Cyclic Polygons and the Whole Region',
            pageTitle: 'Cyclic Polygons and the Whole Region: Theorem A & the Geometric Interior',
            url: 'karpelevich-cyclic.html',
            summary: 'Every boundary eigenvalue realized by a cyclic polygon, star-shaped interior expansion, and the complete proof of Theorem A.',
            tag: 'Theorem A',
            status: 'published'
        },
        {
            id: 'stop-9',
            stopNum: 9,
            shortLabel: 'Stop 9',
            title: 'Stop 9: Closing the Boundary',
            pageTitle: 'Closing the Boundary: Old Arcs, New Arcs, and Induction',
            url: 'karpelevich-induction.html',
            summary: 'Inductive dimension reduction, the denominator divisibility test, strictly interior image polygons, and completing Theorem B.',
            tag: 'Theorem B',
            status: 'published'
        }
    ];

    class KarpelevichBookNav extends HTMLElement {
        connectedCallback() {
            const currentId = this.getAttribute('current') || 'roadmap';
            const currentIndex = CHAPTERS.findIndex(c => c.id === currentId);
            const currentChapter = CHAPTERS[currentIndex] || CHAPTERS[0];

            // Resolve Prev and Next published chapters
            let prevChapter = null;
            let nextChapter = null;

            if (currentIndex > 0) {
                prevChapter = CHAPTERS[currentIndex - 1];
            }
            if (currentIndex >= 0 && currentIndex < CHAPTERS.length - 1) {
                const candidate = CHAPTERS[currentIndex + 1];
                if (candidate.status === 'published') {
                    nextChapter = candidate;
                }
            }

            const uniqueId = Math.random().toString(36).substring(2, 8);

            this.innerHTML = `
                <nav class="series-book-bar" aria-label="Book series navigation">
                    <div class="book-bar-left">
                        <a href="blog.html" class="book-back-hub" title="Return to NIEP Research Blog Index">
                            <span class="arrow" aria-hidden="true">←</span>
                            <span class="label">All Blog Posts</span>
                        </a>
                        <div class="book-meta-divider" aria-hidden="true">/</div>
                        <a href="karpelevich-proof-roadmap.html" class="book-monograph-badge" title="Inside Karpelevič’s Proof (1951) Visual Series">
                            <span class="book-icon" aria-hidden="true">📖</span>
                            <span class="book-series-name">Inside Karpelevič’s Proof</span>
                            <span class="book-chapter-badge">${currentChapter.stopNum === 0 ? 'Roadmap Guide' : 'Stop ' + currentChapter.stopNum + ' of 9'}</span>
                        </a>
                    </div>

                    <div class="book-bar-center">
                        <div class="book-selector-wrap">
                            <label for="bookSelect_${uniqueId}" class="book-selector-label">
                                <span class="label-icon" aria-hidden="true">📑</span>
                                <span>Choose Chapter:</span>
                            </label>
                            <select id="bookSelect_${uniqueId}" class="book-chapter-select" aria-label="Choose chapter in Inside Karpelevich's Proof series">
                                ${CHAPTERS.map(ch => {
                                    const isSelected = ch.id === currentId ? 'selected' : '';
                                    const isDisabled = ch.status === 'upcoming' ? 'disabled' : '';
                                    const prefix = ch.stopNum === 0 ? '🗺️ ' : (ch.status === 'upcoming' ? '⏳ ' : '✓ ');
                                    const suffix = ch.status === 'upcoming' ? ' (Upcoming)' : '';
                                    return `<option value="${ch.url}" ${isSelected} ${isDisabled}>${prefix}${ch.title}${suffix}</option>`;
                                }).join('')}
                            </select>
                        </div>

                        <button type="button" class="book-drawer-toggle" id="bookToggle_${uniqueId}" aria-expanded="false" aria-controls="bookDrawer_${uniqueId}" title="Browse full table of contents">
                            <span class="toc-icon" aria-hidden="true">☰</span>
                            <span>Book Contents</span>
                            <span class="toc-chevron" aria-hidden="true">▾</span>
                        </button>
                    </div>

                    <div class="book-bar-right">
                        ${prevChapter ? `
                            <a href="${prevChapter.url}" class="book-step-btn prev" title="Previous: ${prevChapter.title}">
                                <span class="arrow" aria-hidden="true">‹</span>
                                <span>Prev</span>
                            </a>
                        ` : `
                            <span class="book-step-btn prev disabled" aria-disabled="true">
                                <span class="arrow" aria-hidden="true">‹</span>
                                <span>Prev</span>
                            </span>
                        `}
                        ${nextChapter ? `
                            <a href="${nextChapter.url}" class="book-step-btn next" title="Next: ${nextChapter.title}">
                                <span>Next</span>
                                <span class="arrow" aria-hidden="true">›</span>
                            </a>
                        ` : `
                            <span class="book-step-btn next disabled" aria-disabled="true" title="Upcoming stop in preparation">
                                <span>Next</span>
                                <span class="arrow" aria-hidden="true">›</span>
                            </span>
                        `}
                    </div>
                </nav>

                <!-- Expandable Visual Table of Contents Drawer -->
                <div class="book-toc-drawer" id="bookDrawer_${uniqueId}" hidden>
                    <div class="book-drawer-header">
                        <div>
                            <div class="book-drawer-eyebrow">A 9-Part Visual Journey · Karpelevič (1951)</div>
                            <h2 class="book-drawer-title">Inside Karpelevič’s Proof of the Boundary of $\\mathcal{K}_n$</h2>
                        </div>
                        <p class="book-drawer-desc">
                            Select any chapter to explore its geometric witnesses, interactive labs, and exact algebraic proofs:
                        </p>
                    </div>

                    <div class="book-drawer-grid">
                        ${CHAPTERS.map(ch => {
                            const isCurrent = ch.id === currentId;
                            const isUpcoming = ch.status === 'upcoming';
                            const cardClass = `book-drawer-card ${isCurrent ? 'current' : ''} ${isUpcoming ? 'upcoming' : ''}`;
                            const badgeText = ch.stopNum === 0 ? 'Series Overview' : `Stop ${ch.stopNum} of 9`;
                            
                            return `
                                <div class="${cardClass}">
                                    <div class="card-head">
                                        <span class="card-num-badge">${badgeText}</span>
                                        <span class="card-tag">${ch.tag}</span>
                                    </div>
                                    <h3 class="card-title">
                                        ${isUpcoming ? `<span>${ch.title}</span>` : `<a href="${ch.url}">${ch.title}</a>`}
                                    </h3>
                                    <p class="card-summary">${ch.summary}</p>
                                    <div class="card-footer">
                                        ${isCurrent ? `
                                            <span class="card-status current">● Currently Reading</span>
                                        ` : isUpcoming ? `
                                            <span class="card-status upcoming">⏳ In Preparation</span>
                                        ` : `
                                            <a href="${ch.url}" class="card-read-link">Read Chapter →</a>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            // Setup Event Handlers
            const selectEl = this.querySelector(`#bookSelect_${uniqueId}`);
            if (selectEl) {
                selectEl.addEventListener('change', (e) => {
                    const targetUrl = e.target.value;
                    if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript:')) {
                        window.location.href = targetUrl;
                    }
                });
            }

            const toggleBtn = this.querySelector(`#bookToggle_${uniqueId}`);
            const drawerEl = this.querySelector(`#bookDrawer_${uniqueId}`);
            if (toggleBtn && drawerEl) {
                toggleBtn.addEventListener('click', () => {
                    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
                    toggleBtn.classList.toggle('active', !isExpanded);
                    if (isExpanded) {
                        drawerEl.hidden = true;
                    } else {
                        drawerEl.hidden = false;
                        drawerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });

                // Close on Escape
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
                        toggleBtn.setAttribute('aria-expanded', 'false');
                        toggleBtn.classList.remove('active');
                        drawerEl.hidden = true;
                    }
                });
            }
        }
    }

    if (typeof customElements !== 'undefined' && !customElements.get('karpelevich-book-nav')) {
        customElements.define('karpelevich-book-nav', KarpelevichBookNav);
    }
})();

