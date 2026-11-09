// Shared Theme Initialization, Sync & Standardized Scientific Color Palette for nonsensicallynonnegative
(function() {
    const PALETTES = {
        dark: {
            mode: 'dark',
            bgPage: '#081221',
            bgSurface: '#0e1d33',
            bgSurfaceSecondary: '#152946',
            borderSubtle: '#213b61',
            textPrimary: '#eaf2ff',
            textSecondary: '#a9c1e2',
            textMuted: '#6e8eb8',
            accent: '#3b82f6',
            // Canvas / Karpelevich / Realizer
            canvasBg: '#081221',
            canvasGrid: 'rgba(169, 193, 226, 0.07)',
            canvasAxes: '#8ab4f8',
            canvasText: '#eaf2ff',
            unitCircle: 'rgba(56, 189, 248, 0.35)',
            regionFill0: 'rgba(59, 130, 246, 0.35)',
            regionFill1: 'rgba(14, 165, 233, 0.22)',
            regionFill2: 'rgba(56, 189, 248, 0.14)',
            regionStroke: '#60a5fa',
            fareyRoot: '#ffffff',
            fareyStroke: '#081221',
            trail: '#38bdf8',
            basePoint: '#60a5fa',
            // Standardized Plotly / Character Cones / SNIEP Region Palette
            plotBg: '#081221',
            plotPaper: '#0e1d33',
            plotGrid: '#152946',
            plotZero: '#213b61',
            legendBg: 'rgba(14, 29, 51, 0.90)',
            chamberStroke: '#6e8eb8',
            chamberFill: 'rgba(110, 142, 184, 0.08)',
            // Character Cones
            d8Stroke: '#38bdf8',
            d8Fill: 'rgba(56, 189, 248, 0.28)',
            s4Stroke: '#f59e0b',
            s4Fill: 'rgba(245, 158, 11, 0.32)',
            a5Stroke: '#a855f7',
            a5Fill: 'rgba(168, 85, 247, 0.32)',
            z5Stroke: '#10b981',
            z5Fill: 'rgba(16, 185, 129, 0.30)',
            v4Stroke: '#2dd4bf',
            v4Fill: 'rgba(45, 212, 191, 0.24)',
            sniepStroke: '#f43f5e',
            sniepFill: 'rgba(244, 63, 94, 0.16)',
            trace0Color: '#10b981',
            highlightColor: '#eab308'
        },
        light: {
            mode: 'light',
            bgPage: '#faf8f2',
            bgSurface: '#ffffff',
            bgSurfaceSecondary: '#f4f0e4',
            borderSubtle: '#e5dfce',
            textPrimary: '#15370d',
            textSecondary: '#2b4c23',
            textMuted: '#536e4e',
            accent: '#15370d',
            // Canvas / Karpelevich / Realizer
            canvasBg: '#fdfcf9',
            canvasGrid: '#e8e2d2',
            canvasAxes: '#15370d',
            canvasText: '#15370d',
            unitCircle: 'rgba(114, 142, 109, 0.45)',
            regionFill0: 'rgba(21, 55, 13, 0.22)',
            regionFill1: 'rgba(114, 142, 109, 0.18)',
            regionFill2: 'rgba(229, 205, 130, 0.25)',
            regionStroke: '#15370d',
            fareyRoot: '#15370d',
            fareyStroke: '#ffffff',
            trail: '#728e6d',
            basePoint: '#15370d',
            // Standardized Plotly / Character Cones Palette
            plotBg: '#fdfcf9',
            plotPaper: '#ffffff',
            plotGrid: '#e8e2d2',
            plotZero: '#728e6d',
            legendBg: 'rgba(255, 255, 255, 0.94)',
            chamberStroke: '#64748b',
            chamberFill: 'rgba(100, 116, 139, 0.08)',
            // Character Cones
            d8Stroke: '#2563eb',
            d8Fill: 'rgba(37, 99, 235, 0.22)',
            s4Stroke: '#d97706',
            s4Fill: 'rgba(217, 119, 6, 0.26)',
            a5Stroke: '#7c3aed',
            a5Fill: 'rgba(124, 58, 237, 0.24)',
            z5Stroke: '#15803d',
            z5Fill: 'rgba(21, 128, 61, 0.24)',
            v4Stroke: '#0d9488',
            v4Fill: 'rgba(13, 148, 136, 0.20)',
            sniepStroke: '#b91c1c',
            sniepFill: 'rgba(185, 28, 28, 0.12)',
            trace0Color: '#15803d',
            highlightColor: '#ca8a04'
        }
    };

    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || localStorage.getItem('niep_theme') || 'light';
    }

    function getPalette(modeOverride) {
        const mode = modeOverride || getTheme();
        return PALETTES[mode === 'light' ? 'light' : 'dark'];
    }

    function syncMetaThemeColor(mode) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', mode === 'dark' ? '#081221' : '#faf8f2');
        }
    }

    function notifyIframes(newTheme) {
        syncMetaThemeColor(newTheme);
        document.querySelectorAll('iframe').forEach(frame => {
            try {
                if (frame.contentDocument && frame.contentDocument.documentElement) {
                    frame.contentDocument.documentElement.setAttribute('data-theme', newTheme);
                }
                if (frame.contentWindow) {
                    frame.contentWindow.postMessage({ type: 'niep_theme_change', theme: newTheme }, '*');
                }
            } catch (err) {
                // Ignore cross-origin iframe errors if any
            }
        });
    }

    window.NIEPTheme = {
        getTheme,
        getPalette,
        PALETTES
    };

    // 1. Immediate theme application to avoid FOIT / theme flash
    const savedTheme = localStorage.getItem('niep_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    syncMetaThemeColor(savedTheme);

    // 2. Setup theme switch buttons once DOM is loaded
    function setupThemeButtons() {
        const currentTheme = localStorage.getItem('niep_theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        syncMetaThemeColor(currentTheme);
        if (document.body) {
            document.body.setAttribute('data-theme', currentTheme);
        }

        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === currentTheme);
            btn.onclick = () => {
                const newTheme = btn.dataset.theme;
                document.documentElement.setAttribute('data-theme', newTheme);
                if (document.body) {
                    document.body.setAttribute('data-theme', newTheme);
                }
                localStorage.setItem('niep_theme', newTheme);
                document.querySelectorAll('.theme-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.theme === newTheme);
                });
                notifyIframes(newTheme);
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupThemeButtons);
    } else {
        setupThemeButtons();
    }

    // 3. Multi-tab synchronization
    window.addEventListener('storage', (e) => {
        if (e.key === 'niep_theme' && e.newValue) {
            document.documentElement.setAttribute('data-theme', e.newValue);
            if (document.body) {
                document.body.setAttribute('data-theme', e.newValue);
            }
            document.querySelectorAll('.theme-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.theme === e.newValue);
            });
            notifyIframes(e.newValue);
        }
    });
})();
