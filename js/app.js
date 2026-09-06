document.addEventListener('DOMContentLoaded', async () => {
    // Theme initialization and synchronization
    const savedTheme = localStorage.getItem('niep_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        btn.addEventListener('click', () => {
            const newTheme = btn.dataset.theme;
            document.documentElement.setAttribute('data-theme', newTheme);
            if (document.body) {
                document.body.setAttribute('data-theme', newTheme);
            }
            localStorage.setItem('niep_theme', newTheme);
            document.querySelectorAll('.theme-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.theme === newTheme);
            });
        });
    });

    const plotListEl = document.getElementById('plotList');
    const searchInput = document.getElementById('searchInput');
    const plotFrame = document.getElementById('plotFrame');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    const filterType = document.getElementById('filterType');
    const filterSize = document.getElementById('filterSize');
    const filterDim = document.getElementById('filterDim');
    
    let plotsData = [];

    // Fetch data
    try {
        const response = await fetch('plots_index.json');
        plotsData = await response.json();
        renderList(plotsData);
    } catch (error) {
        console.error("Failed to load plots index", error);
        plotListEl.innerHTML = `<div class="welcome-msg" style="padding:1rem"><p>Error loading plots data.</p></div>`;
    }

    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();
        const keywords = query.split(' ').filter(k => k.length > 0);
        
        const fType = filterType.value; // "All", "SNIEP", "RNIEP"
        const fSize = filterSize.value; // "All", "4", "5", "6"
        const fDim = filterDim.value;   // "All", "Polygon", "Polyhedron"
        
        const filtered = plotsData.filter(plot => {
            if (fType !== "All" && plot.mode.toUpperCase() !== fType) return false;
            if (fSize !== "All" && plot.size.toString() !== fSize) return false;
            if (fDim !== "All" && !plot.type.includes(fDim)) return false;
            
            if (keywords.length > 0) {
                const plotText = plot.label.toLowerCase() + " " + plot.mode.toLowerCase() + " " + plot.type.toLowerCase();
                return keywords.every(kw => plotText.includes(kw));
            }
            return true;
        });
        
        renderList(filtered);
    }

    searchInput.addEventListener('input', applyFilters);
    filterType.addEventListener('change', applyFilters);
    filterSize.addEventListener('change', applyFilters);
    filterDim.addEventListener('change', applyFilters);

    function renderList(plots) {
        plotListEl.innerHTML = '';
        if (plots.length === 0) {
            plotListEl.innerHTML = `<p style="color: var(--text-secondary); text-align: center; margin-top: 2rem;">No plots match your search.</p>`;
            return;
        }

        plots.forEach(plot => {
            const item = document.createElement('div');
            item.className = 'plot-item';
            
            item.innerHTML = `
                <div class="plot-item-header">
                    <span class="badge ${plot.mode.toLowerCase()}">${plot.mode}</span>
                    <span class="plot-type">${plot.type}</span>
                </div>
                <div class="plot-vertices">
                    ${plot.label}
                </div>
            `;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.plot-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                
                welcomeMessage.classList.add('hidden');
                plotFrame.classList.remove('hidden');
                plotFrame.src = plot.file || plot.filename;
            });
            
            plotListEl.appendChild(item);
        });
    }
});
