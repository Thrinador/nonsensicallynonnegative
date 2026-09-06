// Shared Theme Initialization & Sync for nonsensicallynonnegative
(function() {
    // 1. Immediate theme application to avoid FOIT / theme flash
    const savedTheme = localStorage.getItem('niep_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Setup theme switch buttons once DOM is loaded
    function setupThemeButtons() {
        const currentTheme = localStorage.getItem('niep_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
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
        }
    });
})();
