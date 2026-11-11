# NIEP Research Hub · Nonsensically Nonnegative

An open-source computational research workbench, interactive visualization suite, expository monograph series, and mathematical theory wiki dedicated to the **Nonnegative Inverse Eigenvalue Problem (NIEP)** and its symmetric (SNIEP), real (RNIEP), and stochastic variants.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Active Research](https://img.shields.io/badge/Status-Active%20Research-success.svg)](#)
[![arXiv:2407.14472](https://img.shields.io/badge/arXiv-2407.14472-b31b1b.svg)](https://arxiv.org/abs/2407.14472)
[![arXiv:2402.04508](https://img.shields.io/badge/arXiv-2402.04508-b31b1b.svg)](https://arxiv.org/abs/2402.04508)
[![arXiv:2401.01471](https://img.shields.io/badge/arXiv-2401.01471-b31b1b.svg)](https://arxiv.org/abs/2401.01471)
[![ORCID](https://img.shields.io/badge/ORCID-0000--0003--3492--8686-green.svg)](https://orcid.org/0000-0003-3492-8686)
[![Live Site](https://img.shields.io/badge/Live%20Platform-nonsensicallynonnegative.com-15370d.svg)](https://nonsensicallynonnegative.com)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Interactive Visualizers & Tools](#-interactive-visualizers--tools)
- [Expository Monographs & Research Blog](#-expository-monographs--research-blog)
- [Mathematical Theory Wiki](#-mathematical-theory-wiki)
- [Architecture & Technology Stack](#-architecture--technology-stack)
- [Local Development & Quick Start](#-local-development--quick-start)
- [Project Directory Structure](#-project-directory-structure)
- [Contributing & Community](#-contributing--community)
- [Publications & Citations](#-publications--citations)
- [Author & Maintainer](#-author--maintainer)
- [License](#-license)

---

## 🔬 Overview

The **Nonnegative Inverse Eigenvalue Problem (NIEP)** is a central open problem at the intersection of linear algebra, spectral geometry, dynamical systems, and real algebraic geometry:

> **The NIEP:** Given a multiset of $n$ complex numbers $\sigma = \{\lambda_1, \lambda_2, \dots, \lambda_n\}$, determine necessary and sufficient conditions for $\sigma$ to be the spectrum of an $n \times n$ entrywise nonnegative matrix $A \ge 0$.

While completely solved for $n \le 4$ (Loewy & London 1978 for real spectra; Meehan 1998 and Torre-Mayo et al. 2007 in general), the problem remains open for $n \ge 5$. Although the NIEP, SNIEP, and RNIEP are semi-algebraic sets decidable by finite systems of polynomial inequalities via Tarski–Seidenberg quantifier elimination, describing their algebraic boundaries explicitly remains an active frontier.

This hub bridges computational experimentation with rigorous exposition:
1. **Interactive numerical solvers and visualizers** to synthesize matrices from candidate spectra and inspect spectral boundaries in real time.
2. **Long-form interactive monographs and deep dives**, including a nine-stop geometric reconstruction of Karpelevič's 1951 theorem and 3D character-table spectracone explorations.
3. **Self-contained Theory Wiki articles** covering Perron–Frobenius theory, JLL and Holtz $M$-matrix Newton inequalities, Soules bases, Boyle–Handelman symbolic dynamics, and Perron similarities.

---

## 🚀 Interactive Visualizers & Tools

### 1. [Karpelevič Region Interactive Viewer](karpelevich.html)
- **Engine**: High-performance HTML5 Canvas renderer with pan/zoom, coordinate hover inspector, and shareable URL state (`?n=&re=&im=&k=`).
- **Functionality**:
  - Plots the exact boundary $\partial \mathcal{K}_n$ of eigenvalues of $n \times n$ stochastic matrices for orders $n = 2$ through $n = 16$ using exact polar root bisection on the Ito / Kirkland–Laffey–Šmigoc boundary polynomials.
  - Renders Farey landmarks $p/q \in \mathcal{F}_n$, power-orbit trajectories ($z^k$), and real-time Ito polynomial zero diagnostics.
  - Includes quick-test presets (roots of unity, Farey boundary arcs, interior/exterior witnesses) and PNG export.

### 2. [Numerical Spectra Realizer](spectra-realizer.html)
- **Engine**: Interactive complex eigenvalue plane paired with alternating projection solvers (von Neumann / Dykstra) and shareable URL state (`?class=&spec=&tol=`).
- **Functionality**:
  - Drag-and-drop complex conjugate and real eigenvalues on the unit disk / spectral plane.
  - Alternating projections between the isospectral manifold and the nonnegative, symmetric nonnegative, or stochastic matrix cones.
  - Exact analytical synthesizers for **Suleĭmanova spectra** (companion & Fiedler symmetric realizations) and **Soules basis constructions**.
  - One-click matrix exports: **LaTeX (`bmatrix`)**, **NumPy (`np.array`)**, **MATLAB**, and **JSON**.

### 3. [Trace Polytope 2D & 3D Gallery](trace-polytope.html)
- **Engine**: 125-dataset 2D polygon and 3D WebGL polyhedron browser powered by Plotly.js with live light/dark theme synchronization and shareable `?plot=` URLs.
- **Functionality**:
  - Explores trace polytope slices and realizability boundaries for symmetric (SNIEP, 81 datasets) and real (RNIEP, 44 datasets) matrices at order $n = 5$.
  - Filterable by problem variant, matrix order, dimension (2D Polygon vs. 3D Polyhedron), and symbolic vertex identifiers.

---

## 📖 Expository Monographs & Research Blog

Hosted on the **[Research Blog](blog.html)**:

- **[Inside Karpelevič’s Proof (Roadmap + 9-Stop Series)](karpelevich-proof-roadmap.html)**: A complete, self-contained 9-part interactive monograph reconstructing F. I. Karpelevič’s 1951 characterization of $\mathcal{K}_n$—from Dmitriev–Dynkin contracting polygons (Stop 1), minimal edge contacts (Stop 2), and the circular-board chip game (Stop 3) to Euclidean return relations (Stop 4), single-loop log-concavity rigidity (Stop 5), canonical boundary equations (Stop 6), Farey fractions & the two-step law (Stop 7), cyclic polygons (Stop 8), and Farey mediant induction (Stop 9), complete with 43 numbered lemma/theorem anchors.
- **[Character Table Spectracones & the $n = 5$ SNIEP](character-cones.html)**: Interactive 2D and 3D Plotly investigation of finite-group character spectracones ($D_8, Q_8, S_4, A_5, \mathbb{Z}_5$, and $V_4 \oplus [1]$), capturing 99.97% of the Loewy–McDonald $(1,a,a,b,b)$ benchmark and lifting 17 cone orbits to the unsolved 3D $(1,a,a,b,c)$ frontier.

---

## 📚 Mathematical Theory Wiki

Self-contained reference articles typeset with MathJax 3 and one-click TeX formula copying:

| Article | Topic & Mathematical Scope |
| :--- | :--- |
| **[Foundational Overview](problem-background.html)** | Perron–Frobenius theorem, JLL & Holtz $M$-matrix Newton inequalities, and semi-algebraic decidability. |
| **[NIEP Core Formulation](niep.html)** | Trace nonnegativity ($s_k \ge 0$), Loewy–London & Johnson inequalities, and $n \le 4$ vs. $n \ge 5$ status. |
| **[Symmetric NIEP (SNIEP)](sniep.html)** | Orthogonal eigenspaces, Fiedler's glued symmetric realizations, Soules bases, and McDonald–Neumann cones. |
| **[Real NIEP (RNIEP)](rniep.html)** | Real non-symmetric spectra, Johnson–Laffey–Loewy separation ($n \ge 5$), and trace polyhedra. |
| **[Karpelevič Region](karpelevich-region.html)** | Kolmogorov's problem, Dmitriev–Dynkin polygons ($n \le 5$), Ito's theorem, Kirkland–Laffey–Šmigoc polar form, and Munger–Nickerson–Paparella (2024). |
| **[Suleĭmanova Spectra](suleimanova.html)** | Single positive eigenvalue condition, companion realization, and Friedland's perfection proof. |
| **[Boyle–Handelman Theorem](boyle-handelman.html)** | Symbolic dynamics, shifts of finite type, zeta functions, and stabilization via auxiliary zeros. |
| **[Perron Similarities & Spectracones](perron-similarities.html)** | Johnson–Paparella ideal Perron similarities and Gershnik–Lewis–Paparella group character spectracones. |
| **[Comprehensive Bibliography](bibliography.html)** | Searchable literature archive of 35+ foundational and modern papers with BibTeX export. |

---

## 🛠️ Architecture & Technology Stack

The project adheres to a **zero-build, static-first architecture** designed for fast loading, accessibility, and long-term archival durability:

- **Core**: Semantic HTML5, Vanilla ES6+ JavaScript, Web Components (`<hub-nav>`, `<hub-footer>`, `<cite-grid>`, `<karpelevich-book-nav>`), and modular external CSS3 custom properties.
- **Design System & Accessibility**: Warm textbook paper light mode by default (`#faf8f2` / `#15370d`) with persistent dark mode (`#081221` / `#0e1d33`), keyboard skip links, `:focus-visible` rings, `prefers-reduced-motion` support, and WCAG-aligned heading hierarchy.
- **Mathematical Typesetting**: [MathJax 3](https://www.mathjax.org/) via centralized `js/mathjax-config.js` with one-click TeX source copy.
- **Scientific Plotting**: Custom HTML5 Canvas 2D engines and [Plotly.js](https://plotly.com/javascript/) WebGL 3D polyhedra.

---

## 💻 Local Development & Quick Start

No bundlers, package managers, or build steps are required. Serve the root directory with any static HTTP server:

```bash
# Clone the repository
git clone https://github.com/Thrinador/nonsensicallynonnegative.git
cd nonsensicallynonnegative

# Start a local HTTP server on port 8000
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser (or run `npx serve .`).

---

## 📁 Project Directory Structure

```text
nonsensicallynonnegative/
├── index.html                           # NIEP Research Hub master dashboard
├── about.html                           # Project mission & contribution guide
├── blog.html                            # Research Blog & Monograph hub
├── bibliography.html                    # Searchable literature & BibTeX catalog
├── sitemap.html / sitemap.xml           # Visual site directory & XML sitemap
├── 404.html                             # Error page with hub navigation
│
├── karpelevich.html                     # Karpelevič Region interactive viewer (n = 2..16)
├── spectra-realizer.html                # Numerical Spectra Realizer application
├── trace-polytope.html                  # 2D & 3D Trace Polytope gallery (order n = 5, 125 slices)
│
├── problem-background.html              # Theory Wiki: Foundations & Perron–Frobenius
├── niep.html / sniep.html / rniep.html  # Theory Wiki: NIEP, SNIEP, and RNIEP
├── karpelevich-region.html              # Theory Wiki: Karpelevič theorem & modern literature
├── suleimanova.html                     # Theory Wiki: Suleĭmanova spectra
├── boyle-handelman.html                 # Theory Wiki: Boyle–Handelman theorem
├── perron-similarities.html             # Theory Wiki: Perron similarities & spectracones
├── character-cones.html                 # Deep Dive: Character table cones for n = 5 SNIEP
│
├── karpelevich-proof-roadmap.html       # Monograph: Inside Karpelevič’s Proof (Roadmap)
├── karpelevich-polygons.html            # Stop 1: Contracting polygons
├── karpelevich-contacts.html            # Stop 2: Boundary eigenvalues & edge contacts
├── karpelevich-game.html                # Stop 3: Circular-board chip game
├── karpelevich-returns.html             # Stop 4: Return relations & characteristic equation
├── karpelevich-rigidity.html            # Stop 5: Contact-parameter rigidity
├── karpelevich-boundary-equations.html  # Stop 6: Canonical boundary equations
├── karpelevich-farey.html               # Stop 7: Farey fractions & two-step law
├── karpelevich-cyclic.html              # Stop 8: Cyclic polygons & boundary matrices
├── karpelevich-induction.html           # Stop 9: Induction on order & final region K_n
│
├── css/
│   ├── style.css                        # Core design system, components, & accessibility
│   ├── blog.css                         # Monograph, interactive proof figures, & blog styles
│   ├── karpelevich.css                  # Karpelevič canvas viewer & inspector layout
│   ├── realizer.css                     # Spectra Realizer workspace & controls
│   └── personal.css                     # Academic profile, publications, & CV styles
│
├── js/
│   ├── nav.js / footer.js / theme.js    # Shared Web Components & light/dark theme manager
│   ├── mathjax-config.js                # Centralized MathJax 3 config & Copy TeX utility
│   ├── citations.js                     # Centralized literature database & <cite-grid>
│   ├── karpelevich.js                   # Exact polar boundary solver & canvas renderer
│   ├── realizer.js                      # Alternating projection & exact matrix synthesizers
│   ├── app.js                           # Trace Polytope gallery & live Plotly theme sync
│   └── karpelevich-*.js                 # Interactive widgets & book nav for Stops 1–9
│
├── personal/                            # Academic bio, CV, publications, talks, & teaching
├── plots/                               # Interactive Plotly 2D/3D datasets
├── files/                               # Downloadable PDF preprints, slides, CV, & notes
└── images/                              # Favicons, web manifest, & profile assets
```

---

## 🤝 Contributing & Community

Contributions from researchers, software engineers, and students are welcome:
- **Mathematicians & Researchers**: Suggest literature additions, sharper bounds, counterexamples, or expository notes.
- **Scientific Developers**: Contribute numerical solvers, performance improvements, or interactive visualizations.

See **[About & Contributing](about.html)** for details, or open an issue / pull request on GitHub.

---

## 📖 Publications & Citations

If you use these tools, datasets, or expository surveys in your research, please cite:

```bibtex
@article{clark2022polynomials,
  author  = {Clark, Benjamin J. and Paparella, Pietro},
  title   = {Polynomials that preserve nonnegative matrices},
  journal = {Linear Algebra and its Applications},
  volume  = {637},
  pages   = {110--118},
  year    = {2022},
  doi     = {10.1016/j.laa.2021.12.007}
}

@article{clark2024niep,
  author  = {Clark, Benjamin J.},
  title   = {The NIEP is solvable by reality and finitely many polynomial inequalities},
  journal = {arXiv preprint arXiv:2407.14472},
  year    = {2024},
  url     = {https://arxiv.org/abs/2407.14472}
}

@misc{clark2026niephub,
  author       = {Clark, Benjamin J.},
  title        = {Nonsensically Nonnegative: Computational Tools and Expository Monographs for the Nonnegative Inverse Eigenvalue Problem},
  year         = {2026},
  howpublished = {\url{https://nonsensicallynonnegative.com}},
  note         = {GitHub: \url{https://github.com/Thrinador/nonsensicallynonnegative}}
}
```

---

## 👨‍💻 Author & Maintainer

**Benjamin J. Clark, Ph.D.**  
*Google · Ph.D. in Mathematics, Washington State University*  
- **Website**: [https://nonsensicallynonnegative.com](https://nonsensicallynonnegative.com)
- **Academic Profile**: [personal/index.html](personal/index.html)
- **arXiv**: [arxiv.org/a/clark_b_1.html](https://arxiv.org/a/clark_b_1.html)
- **ORCID**: [0000-0003-3492-8686](https://orcid.org/0000-0003-3492-8686)
- **GitHub**: [@Thrinador](https://github.com/Thrinador)

---

## 📄 License

Licensed under the **MIT License** — see [LICENSE](LICENSE) for details.
