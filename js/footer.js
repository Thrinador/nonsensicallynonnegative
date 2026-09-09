// Shared Hub & Personal Footer Web Component for NIEP Research Hub
(function() {
    class HubFooter extends HTMLElement {
        connectedCallback() {
            // Check if personal mode is requested via attribute or pathname
            const isPersonal = this.getAttribute('type') === 'personal' ||
                               this.hasAttribute('personal') ||
                               (typeof window !== 'undefined' && window.location.pathname.includes('/personal/'));

            // Resolve relative base path prefix (e.g., '../' for subdirectories)
            let prefix = this.getAttribute('base-path');
            if (prefix === null) {
                prefix = isPersonal || (typeof window !== 'undefined' && window.location.pathname.includes('/personal/')) ? '../' : '';
            }

            if (isPersonal) {
                this.innerHTML = `
        <footer class="personal-footer">
            <p>&copy; 2026 Benjamin J. Clark, Ph.D. &middot; Department of Mathematics &amp; Statistics, WSU</p>
            <div class="personal-footer-links">
                <a href="${prefix}index.html">Hub Home</a>
                <span>&middot;</span>
                <a href="${prefix}about.html">About &amp; Contribute</a>
                <span>&middot;</span>
                <a href="https://github.com/Thrinador/nonsensicallynonnegative" target="_blank" rel="noopener">GitHub</a>
                <span>&middot;</span>
                <a href="${prefix}sitemap.html">Sitemap</a>
                <span>&middot;</span>
                <a href="https://arxiv.org/a/clark_b_1.html" target="_blank" rel="noopener">arXiv</a>
            </div>
        </footer>`;
            } else {
                this.innerHTML = `
    <footer class="hub-footer">
        <div class="footer-container">
            <div class="footer-brand">
                <a href="${prefix}index.html" class="footer-logo">
                    <span class="nav-logo-badge">NIEP</span>
                    <span>NIEP Research Hub</span>
                </a>
                <p class="footer-tagline">
                    An open-source research initiative advancing computational linear algebra, spectral geometry, and inverse eigenvalue problems.
                </p>
                <div class="footer-brand-links">
                    <a href="https://github.com/Thrinador/nonsensicallynonnegative" target="_blank" rel="noopener" class="footer-ext-link">
                        <span>&#x1F4BB; GitHub Repository</span>
                    </a>
                </div>
            </div>
            <div class="footer-links-group">
                <span class="footer-col-title">Navigation</span>
                <a href="${prefix}index.html">Home</a>
                <a href="${prefix}about.html">About &amp; Contributing</a>
                <a href="${prefix}problem-background.html">Theory Wiki</a>
                <a href="${prefix}sitemap.html">Site Directory</a>
                <a href="${prefix}personal/index.html">Author Profile</a>
            </div>
            <div class="footer-links-group">
                <span class="footer-col-title">Interactive Tools</span>
                <a href="${prefix}karpelevich.html">Karpelevi&#x010D; Viewer</a>
                <a href="${prefix}spectra-realizer.html">Spectra Realizer</a>
                <a href="${prefix}trace-polytope.html">Trace Polytopes</a>
                <a href="${prefix}personal/publications.html">Research Publications</a>
            </div>
            <div class="footer-links-group">
                <span class="footer-col-title">Theory Wiki</span>
                <a href="${prefix}niep.html">NIEP Overview</a>
                <a href="${prefix}karpelevich-region.html">Karpelevi&#x010D; Region</a>
                <a href="${prefix}sniep.html">Symmetric NIEP (SNIEP)</a>
                <a href="${prefix}rniep.html">Real NIEP (RNIEP)</a>
                <a href="${prefix}suleimanova.html">Sule&#x012d;manova Spectra</a>
            </div>
        </div>
        <div class="footer-bottom">
            <span>&copy; 2026 Benjamin J. Clark, Ph.D. &middot; Released under the MIT License.</span>
            <div class="footer-bottom-links">
                <a href="${prefix}index.html">Home</a>
                <span>&middot;</span>
                <a href="${prefix}about.html">About &amp; Contribute</a>
                <span>&middot;</span>
                <a href="https://github.com/Thrinador/nonsensicallynonnegative" target="_blank" rel="noopener">GitHub</a>
                <span>&middot;</span>
                <a href="${prefix}sitemap.html">Sitemap</a>
            </div>
        </div>
    </footer>`;
            }
        }
    }

    if (typeof customElements !== 'undefined' && !customElements.get('hub-footer')) {
        customElements.define('hub-footer', HubFooter);
    }
})();
