/**
 * Shared MathJax 3 Configuration & One-Click LaTeX Copy Tools
 * NIEP Research Hub
 */
(function () {
    'use strict';

    function showLatexToast(msg) {
        let toast = document.querySelector('.latex-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'latex-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 1600);
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showLatexToast('LaTeX copied to clipboard');
    }

    function copyLatexSource(tex, sourceElem) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(tex).then(() => {
                if (sourceElem && sourceElem.classList.contains('copy-latex-btn')) {
                    const originalHTML = sourceElem.innerHTML;
                    sourceElem.classList.add('copied');
                    sourceElem.innerHTML = '<span>Copied!</span>';
                    setTimeout(() => {
                        sourceElem.classList.remove('copied');
                        sourceElem.innerHTML = originalHTML;
                    }, 1500);
                } else {
                    showLatexToast('LaTeX copied to clipboard');
                }
            }).catch(() => {
                fallbackCopy(tex);
            });
        } else {
            fallbackCopy(tex);
        }
    }

    function attachLatexTools() {
        if (!window.MathJax || !MathJax.startup || !MathJax.startup.document) return;
        const doc = MathJax.startup.document;
        if (!doc.math) return;

        Array.from(doc.math).forEach(item => {
            const root = item.typesetRoot;
            if (!root || root.hasAttribute('data-tex-bound')) return;
            const tex = item.math;

            root.setAttribute('data-tex', tex);
            root.setAttribute('data-tex-bound', 'true');
            root.setAttribute('title', 'Double-click to copy LaTeX formula');

            root.addEventListener('copy', (e) => {
                if (e.clipboardData) {
                    e.clipboardData.setData('text/plain', tex);
                    e.preventDefault();
                }
            });

            root.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                copyLatexSource(tex, root);
            });

            if (item.display && root.parentElement && !root.parentElement.classList.contains('display-math-container')) {
                const container = document.createElement('div');
                container.className = 'display-math-container';
                root.parentNode.insertBefore(container, root);
                container.appendChild(root);

                const btn = document.createElement('button');
                btn.className = 'copy-latex-btn';
                btn.type = 'button';
                btn.setAttribute('aria-label', 'Copy LaTeX formula');
                btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy TeX</span>';
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyLatexSource(tex, btn);
                });
                container.appendChild(btn);
            }
        });
    }

    window.attachLatexTools = attachLatexTools;

    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true
        },
        options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        },
        startup: {
            ready: () => {
                MathJax.startup.defaultReady();
                if (typeof MathJax.typesetPromise === 'function') {
                    const origTypesetPromise = MathJax.typesetPromise.bind(MathJax);
                    MathJax.typesetPromise = function (...args) {
                        return origTypesetPromise(...args).then((res) => {
                            attachLatexTools();
                            return res;
                        });
                    };
                }
                MathJax.startup.promise.then(() => {
                    attachLatexTools();
                });
            }
        }
    };
})();

