// Shared Hub & Personal Top Navigation Web Component for NIEP Research Hub
(function() {
    class HubNav extends HTMLElement {
        connectedCallback() {
            const isPersonal = this.getAttribute('type') === 'personal' ||
                               this.hasAttribute('personal') ||
                               (typeof window !== 'undefined' && window.location.pathname.includes('/personal/'));

            // Resolve relative base path prefix (e.g., '../' for subdirectories)
            let prefix = this.getAttribute('base-path');
            if (prefix === null) {
                prefix = isPersonal || (typeof window !== 'undefined' && window.location.pathname.includes('/personal/')) ? '../' : '';
            }

            const filename = (typeof window !== 'undefined' && window.location.pathname.split('/').pop()) || 'index.html';

            // Resolve Title and Subtitle
            let title = this.getAttribute('brand-title');
            let subtitle = this.getAttribute('brand-subtitle');
            if (!title || !subtitle) {
                if (isPersonal || filename === '404.html') {
                    title = title || 'Nonsensically Nonnegative';
                    subtitle = subtitle || 'NIEP Research &amp; Visual Computing';
                } else if (filename === 'spectra-realizer.html') {
                    title = title || 'Spectra Realizer';
                    subtitle = subtitle || 'Numerical Inverse Eigenvalue Solver';
                } else if (filename === 'karpelevich.html') {
                    title = title || 'Karpelevi\u010d Region Viewer';
                    subtitle = subtitle || 'Nonnegative Inverse Eigenvalue Problem';
                } else if (filename === 'trace-polytope.html') {
                    title = title || 'Trace Polytope Gallery';
                    subtitle = subtitle || 'Nonnegative Inverse Eigenvalue Problem';
                } else {
                    title = title || 'NIEP Research Hub';
                    subtitle = subtitle || 'Nonnegative Inverse Eigenvalue Problem';
                }
            }

            // Resolve Active Button
            let active = this.getAttribute('active');
            if (!active) {
                if (isPersonal) {
                    active = 'personal';
                } else if (filename === 'index.html' || filename === '') {
                    active = 'hub';
                } else if ([
                    'problem-background.html', 'niep.html', 'sniep.html', 'rniep.html',
                    'karpelevich-region.html', 'suleimanova.html', 'boyle-handelman.html',
                    'perron-similarities.html'
                ].includes(filename)) {
                    active = 'theory';
                } else if (filename === 'karpelevich.html') {
                    active = 'karpelevich';
                } else if (filename === 'trace-polytope.html') {
                    active = 'trace-polytope';
                } else if (filename === 'spectra-realizer.html') {
                    active = 'realizer';
                } else {
                    active = 'none';
                }
            }

            this.innerHTML = `
    <header class="top-nav">
        <a href="${prefix}index.html" class="nav-brand">
            <span class="nav-logo-badge">NIEP</span>
            <div class="nav-brand-text">
                <span class="nav-title">${title}</span>
                <span class="nav-subtitle">${subtitle}</span>
            </div>
        </a>
        <nav class="nav-center" aria-label="Main Navigation">
            <a href="${prefix}index.html" class="nav-button ${active === 'hub' ? 'active' : ''}" ${active === 'hub' ? 'aria-current="page"' : ''}>
                <span class="nav-btn-icon">&#x1F3E0;</span>
                <span>NIEP Hub</span>
            </a>
            <a href="${prefix}problem-background.html" class="nav-button ${active === 'theory' ? 'active' : ''}" ${active === 'theory' ? 'aria-current="page"' : ''}>
                <span class="nav-btn-icon">&#x1F4D6;</span>
                <span>Problem Background</span>
            </a>
            <a href="${prefix}karpelevich.html" class="nav-button ${active === 'karpelevich' ? 'active' : ''}" ${active === 'karpelevich' ? 'aria-current="page"' : ''}>
                <span class="nav-btn-icon">&#x1F3AF;</span>
                <span>Karpelevi&#x010D; Viewer</span>
            </a>
            <a href="${prefix}trace-polytope.html" class="nav-button ${active === 'trace-polytope' ? 'active' : ''}" ${active === 'trace-polytope' ? 'aria-current="page"' : ''}>
                <span class="nav-btn-icon">&#x1F4CA;</span>
                <span>Trace Polytopes</span>
            </a>
            <a href="${prefix}spectra-realizer.html" class="nav-button ${active === 'realizer' ? 'active' : ''}" ${active === 'realizer' ? 'aria-current="page"' : ''}>
                <span class="nav-btn-icon">&#x1F9EE;</span>
                <span>Spectra Realizer</span>
            </a>
            <a href="${prefix}personal/index.html" class="nav-button ${active === 'personal' ? 'active' : ''}" ${active === 'personal' ? 'aria-current="page"' : ''}>
                <span class="nav-btn-icon">&#x1F464;</span>
                <span>Personal</span>
            </a>
        </nav>
        <div class="nav-right">
            <div class="theme-switch-group" role="group" aria-label="Color Theme">
                <button type="button" class="theme-btn" data-theme="light" title="Light Theme">
                    <span>&#x2600;</span> Light
                </button>
                <button type="button" class="theme-btn active" data-theme="dark" title="Dark Theme">
                    <span>&#x1F319;</span> Dark
                </button>
            </div>
        </div>
    </header>`;

            // Sync current theme to the rendered buttons
            var currentTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('niep_theme')) || 'dark';
            var lightBtn = this.querySelector('.theme-btn[data-theme="light"]');
            var darkBtn = this.querySelector('.theme-btn[data-theme="dark"]');
            if (currentTheme === 'light') {
                if (lightBtn) lightBtn.classList.add('active');
                if (darkBtn) darkBtn.classList.remove('active');
            } else {
                if (darkBtn) darkBtn.classList.add('active');
                if (lightBtn) lightBtn.classList.remove('active');
            }

            // Bind click listeners for instant theme switching
            var self = this;
            this.querySelectorAll('.theme-btn').forEach(function(btn) {
                btn.onclick = function() {
                    var newTheme = btn.dataset.theme;
                    document.documentElement.setAttribute('data-theme', newTheme);
                    if (document.body) {
                        document.body.setAttribute('data-theme', newTheme);
                    }
                    try {
                        localStorage.setItem('niep_theme', newTheme);
                    } catch (e) {}
                    self.querySelectorAll('.theme-btn').forEach(function(b) {
                        b.classList.toggle('active', b.dataset.theme === newTheme);
                    });
                };
            });
        }
    }

    if (typeof customElements !== 'undefined' && !customElements.get('hub-nav')) {
        customElements.define('hub-nav', HubNav);
    }
})();
