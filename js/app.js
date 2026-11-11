document.addEventListener('DOMContentLoaded', async () => {
    const plotListEl = document.getElementById('plotList');
    const searchInput = document.getElementById('searchInput');
    const plotFrame = document.getElementById('plotFrame');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const welcomeHeading = document.getElementById('welcomeHeading');
    const welcomeSubtext = document.getElementById('welcomeSubtext');
    const plotLoading = document.getElementById('plotLoading');
    const copyPlotLinkBtn = document.getElementById('copyPlotLinkBtn');
    const toggleProvenanceBtn = document.getElementById('toggleProvenanceBtn');
    const openProvenanceSidebarBtn = document.getElementById('openProvenanceSidebarBtn');
    const closeProvenanceBtn = document.getElementById('closeProvenanceBtn');
    const plotProvenanceCard = document.getElementById('plotProvenanceCard');

    const filterType = document.getElementById('filterType');
    const filterSize = document.getElementById('filterSize');
    const filterDim = document.getElementById('filterDim');

    let plotsData = [];
    let activePlotId = null;

    function setProvenanceOpen(isOpen) {
        if (!plotProvenanceCard) return;
        plotProvenanceCard.classList.toggle('hidden', !isOpen);
        if (toggleProvenanceBtn) {
            toggleProvenanceBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
    }

    if (toggleProvenanceBtn) {
        toggleProvenanceBtn.addEventListener('click', () => {
            const isHidden = plotProvenanceCard ? plotProvenanceCard.classList.contains('hidden') : true;
            setProvenanceOpen(isHidden);
        });
    }
    if (openProvenanceSidebarBtn) {
        openProvenanceSidebarBtn.addEventListener('click', () => setProvenanceOpen(true));
    }
    if (closeProvenanceBtn) {
        closeProvenanceBtn.addEventListener('click', () => setProvenanceOpen(false));
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && plotProvenanceCard && !plotProvenanceCard.classList.contains('hidden')) {
            setProvenanceOpen(false);
        }
    });

    function clearStageSelection(headingText, subText) {
        activePlotId = null;
        if (plotLoading) plotLoading.classList.add('hidden');
        if (copyPlotLinkBtn) copyPlotLinkBtn.classList.add('hidden');
        if (plotFrame) {
            plotFrame.classList.add('hidden');
            plotFrame.removeAttribute('src');
        }
        if (welcomeHeading && headingText) welcomeHeading.textContent = headingText;
        if (welcomeSubtext && subText) welcomeSubtext.textContent = subText;
        if (welcomeMessage) welcomeMessage.classList.remove('hidden');
    }

    function populateFiltersFromData(plots) {
        if (!Array.isArray(plots) || plots.length === 0) return;

        if (filterType) {
            const prevType = filterType.value;
            const modeCounts = {};
            plots.forEach(p => {
                const m = (p.mode || '').toUpperCase();
                if (m) modeCounts[m] = (modeCounts[m] || 0) + 1;
            });
            filterType.innerHTML = '';
            const allOpt = document.createElement('option');
            allOpt.value = 'All';
            allOpt.textContent = `All Types (${plots.length})`;
            filterType.appendChild(allOpt);
            ['SNIEP', 'RNIEP'].concat(Object.keys(modeCounts).filter(m => m !== 'SNIEP' && m !== 'RNIEP')).forEach(mode => {
                if (!modeCounts[mode]) return;
                const opt = document.createElement('option');
                opt.value = mode;
                opt.textContent = `${mode} (${modeCounts[mode]})`;
                filterType.appendChild(opt);
            });
            if ([...filterType.options].some(o => o.value === prevType)) filterType.value = prevType;
        }

        if (filterSize) {
            const prevSize = filterSize.value;
            const sizeCounts = {};
            plots.forEach(p => {
                const s = String(p.size);
                sizeCounts[s] = (sizeCounts[s] || 0) + 1;
            });
            const sizes = Object.keys(sizeCounts).sort((a, b) => Number(a) - Number(b));
            filterSize.innerHTML = '';
            const allOpt = document.createElement('option');
            allOpt.value = 'All';
            allOpt.textContent = sizes.length === 1
                ? `All Orders (n = ${sizes[0]})`
                : `All Orders (${plots.length})`;
            filterSize.appendChild(allOpt);
            sizes.forEach(sz => {
                const opt = document.createElement('option');
                opt.value = sz;
                opt.textContent = `Order n = ${sz} (${sizeCounts[sz]})`;
                filterSize.appendChild(opt);
            });
            if ([...filterSize.options].some(o => o.value === prevSize)) filterSize.value = prevSize;
        }

        if (filterDim) {
            const prevDim = filterDim.value;
            const poly2d = plots.filter(p => (p.type || '').includes('Polygon')).length;
            const poly3d = plots.filter(p => (p.type || '').includes('Polyhedron')).length;
            filterDim.innerHTML = '';
            const allOpt = document.createElement('option');
            allOpt.value = 'All';
            allOpt.textContent = `All Dims (${plots.length})`;
            filterDim.appendChild(allOpt);
            if (poly2d > 0) {
                const o2 = document.createElement('option');
                o2.value = 'Polygon';
                o2.textContent = `2D Polygon (${poly2d})`;
                filterDim.appendChild(o2);
            }
            if (poly3d > 0) {
                const o3 = document.createElement('option');
                o3.value = 'Polyhedron';
                o3.textContent = `3D Polyhedron (${poly3d})`;
                filterDim.appendChild(o3);
            }
            if ([...filterDim.options].some(o => o.value === prevDim)) filterDim.value = prevDim;
        }
    }

    function applyThemeToPlotFrame() {
        if (!plotFrame || plotFrame.classList.contains('hidden')) return;
        try {
            const doc = plotFrame.contentDocument;
            const win = plotFrame.contentWindow;
            if (!doc || !win) return;

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const bgColor = isDark ? '#0e1d33' : '#ffffff';
            const fgColor = isDark ? '#eaf2ff' : '#15370d';
            const legendBg = isDark ? 'rgba(14, 29, 51, 0.88)' : 'rgba(255, 255, 255, 0.88)';
            const legendBorder = isDark ? '#325688' : '#c5bda8';
            const hoverBg = isDark ? '#152946' : '#ffffff';
            const hoverBorder = isDark ? '#4a7ec7' : '#728e6d';

            let themeStyle = doc.getElementById('hub-plot-theme');
            if (!themeStyle && doc.head) {
                themeStyle = doc.createElement('style');
                themeStyle.id = 'hub-plot-theme';
                doc.head.appendChild(themeStyle);
            }
            if (themeStyle) {
                themeStyle.textContent = `html, body { margin: 0; padding: 0; background: ${bgColor} !important; color: ${fgColor}; overflow: hidden; }`;
            }

            const gd = doc.querySelector('.plotly-graph-div');
            if (gd && win.Plotly && typeof win.Plotly.relayout === 'function') {
                const relayoutUpdate = {
                    'paper_bgcolor': bgColor,
                    'plot_bgcolor': bgColor,
                    'font.color': fgColor,
                    'title.font.color': fgColor,
                    'legend.bgcolor': legendBg,
                    'legend.bordercolor': legendBorder,
                    'legend.font.color': fgColor,
                    'legend.title.font.color': fgColor,
                    'hoverlabel.bgcolor': hoverBg,
                    'hoverlabel.bordercolor': hoverBorder,
                    'hoverlabel.font.color': fgColor
                };
                if (gd.layout && gd.layout.scene) {
                    relayoutUpdate['scene.bgcolor'] = bgColor;
                }
                win.Plotly.relayout(gd, relayoutUpdate);
            }
        } catch (err) {
            // Ignore cross-origin or transient unload states
        }
    }

    if (plotFrame) {
        plotFrame.addEventListener('load', () => {
            if (!plotFrame.getAttribute('src')) return;
            if (plotLoading) plotLoading.classList.add('hidden');
            if (copyPlotLinkBtn) copyPlotLinkBtn.classList.remove('hidden');
            applyThemeToPlotFrame();
        });
    }

    const themeObserver = new MutationObserver(() => {
        applyThemeToPlotFrame();
    });
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    if (copyPlotLinkBtn) {
        copyPlotLinkBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                const original = copyPlotLinkBtn.textContent;
                copyPlotLinkBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyPlotLinkBtn.textContent = original;
                }, 1500);
            } catch (err) {
                console.warn('Clipboard write failed:', err);
            }
        });
    }

    function selectPlot(plot, itemEl, updateUrl = false) {
        activePlotId = plot.id;
        document.querySelectorAll('.plot-item').forEach(el => {
            el.classList.remove('active');
            el.setAttribute('aria-current', 'false');
        });
        if (itemEl) {
            itemEl.classList.add('active');
            itemEl.setAttribute('aria-current', 'true');
        }
        welcomeMessage.classList.add('hidden');
        if (plotLoading) plotLoading.classList.remove('hidden');
        plotFrame.classList.remove('hidden');
        plotFrame.src = plot.file || plot.filename;

        if (updateUrl && window.history && window.history.replaceState) {
            const url = new URL(window.location.href);
            url.searchParams.set('plot', plot.id);
            window.history.replaceState(null, '', url.pathname + url.search);
        }
    }

    // Fetch data
    try {
        const response = await fetch('plots_index.json');
        plotsData = await response.json();
        populateFiltersFromData(plotsData);
        renderList(plotsData);

        const params = new URLSearchParams(window.location.search);
        const targetId = params.get('plot');
        const matchedTarget = targetId ? plotsData.find(p => p.id === targetId) : null;
        const initialPlot = matchedTarget || (window.innerWidth > 900 ? plotsData[0] : null);
        if (initialPlot) {
            const idx = plotsData.indexOf(initialPlot);
            const firstEl = plotListEl.children[idx >= 0 ? idx : 0];
            selectPlot(initialPlot, firstEl, Boolean(matchedTarget));
        }
    } catch (error) {
        console.error('Failed to load plots index', error);
        plotListEl.innerHTML = `<div class="welcome-msg compact"><p>Error loading plots data.</p></div>`;
    }

    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();
        const keywords = query.split(' ').filter(k => k.length > 0);

        const fType = filterType.value; // "All", "SNIEP", "RNIEP"
        const fSize = filterSize.value; // "All", "5"
        const fDim = filterDim.value;   // "All", "Polygon", "Polyhedron"

        const filtered = plotsData.filter(plot => {
            if (fType !== 'All' && plot.mode.toUpperCase() !== fType) return false;
            if (fSize !== 'All' && plot.size.toString() !== fSize) return false;
            if (fDim !== 'All' && !plot.type.includes(fDim)) return false;

            if (keywords.length > 0) {
                const plotText = plot.label.toLowerCase() + ' ' + plot.mode.toLowerCase() + ' ' + plot.type.toLowerCase();
                return keywords.every(kw => plotText.includes(kw));
            }
            return true;
        });

        renderList(filtered);

        if (filtered.length === 0) {
            clearStageSelection(
                'No polytopes match the current filter',
                'Clear or adjust your search query and filter selections in the sidebar to view available order-5 slices.'
            );
        } else if (activePlotId && !filtered.some(plot => plot.id === activePlotId)) {
            clearStageSelection(
                'Select a matching plot from the sidebar',
                `${filtered.length} order-5 slice${filtered.length === 1 ? '' : 's'} match the current filter.`
            );
        }
    }

    searchInput.addEventListener('input', applyFilters);
    filterType.addEventListener('change', applyFilters);
    filterSize.addEventListener('change', applyFilters);
    filterDim.addEventListener('change', applyFilters);

    function renderList(plots) {
        plotListEl.innerHTML = '';
        if (plots.length === 0) {
            plotListEl.innerHTML = `<p class="plot-list-empty">No plots match your search.</p>`;
            return;
        }

        plots.forEach(plot => {
            const item = document.createElement('div');
            const isActive = plot.id === activePlotId;
            item.className = 'plot-item' + (isActive ? ' active' : '');
            item.setAttribute('role', 'listitem');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-current', isActive ? 'true' : 'false');
            item.setAttribute('aria-label', `${plot.mode} size ${plot.size} ${plot.type}: vertices ${plot.label}`);

            item.innerHTML = `
                <div class="plot-item-header">
                    <span class="badge ${plot.mode.toLowerCase()}">${plot.mode}</span>
                    <span class="plot-type">${plot.type} &middot; <i>n</i>=${plot.size}</span>
                </div>
                <div class="plot-vertices">
                    ${plot.label}
                </div>
            `;

            item.addEventListener('click', () => {
                selectPlot(plot, item, true);
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectPlot(plot, item, true);
                }
            });

            plotListEl.appendChild(item);
        });
    }
});
