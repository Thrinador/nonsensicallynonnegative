# NIEP Research Hub · Nonsensically Nonnegative

An open-source computational research workbench, interactive visualization suite, and mathematical theory survey dedicated to the **Nonnegative Inverse Eigenvalue Problem (NIEP)** and its symmetric (SNIEP) and real (RNIEP) variants.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Active Research](https://img.shields.io/badge/Status-Active%20Research-success.svg)](#)
[![arXiv:2407.14472](https://img.shields.io/badge/arXiv-2407.14472-b31b1b.svg)](https://arxiv.org/abs/2407.14472)
[![arXiv:2402.04508](https://img.shields.io/badge/arXiv-2402.04508-b31b1b.svg)](https://arxiv.org/abs/2402.04508)
[![ORCID](https://img.shields.io/badge/ORCID-0000--0003--3492--8686-green.svg)](https://orcid.org/0000-0003-3492-8686)
[![Live Site](https://img.shields.io/badge/Live%20Platform-nonsensicallynonnegative.com-7c3aed.svg)](https://nonsensicallynonnegative.com)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Interactive Visualizers & Tools](#-interactive-visualizers--tools)
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

The **Nonnegative Inverse Eigenvalue Problem (NIEP)** is a classical open problem at the intersection of linear algebra, spectral geometry, dynamical systems, and real algebraic geometry:

> **The NIEP:** Given a multiset of $n$ complex numbers $\sigma = \{\lambda_1, \lambda_2, \dots, \lambda_n\}$, determine necessary and sufficient conditions for $\sigma$ to be the spectrum of an $n \times n$ entrywise nonnegative matrix $A \ge 0$.

While the problem is completely solved for $n \le 4$, it remains open for $n \ge 5$ in the general case. Recent research has shown that the NIEP, SNIEP, and RNIEP are semi-algebraic sets decidable by finite systems of polynomial inequalities via Tarski-Seidenberg quantifier elimination, but characterizing these algebraic boundaries explicitly remains an active mathematical frontier.

This hub bridges computational experimentation with theoretical analysis by providing:
1. **Interactive numerical solvers and visualizers** to synthesize matrices from candidate spectra in real-time.
2. **Geometric renderers** of spectral boundary regions like the Karpelevi&#x010D; region $\mathcal{K}_n$ and trace polytopes.
3. **Rigorous surveys and reference articles** covering Perron-Frobenius theory, Soules bases, Boyle-Handelman symbolic dynamics, and spectracone geometry.

---

## 🚀 Interactive Visualizers & Tools

### 1. [Karpelevi&#x010D; Region Interactive Viewer](karpelevich.html)
- **Engine**: High-performance HTML5 Canvas renderer with pan/zoom and coordinate hover inspector.
- **Functionality**:
  - Plots the exact boundary $\partial \mathcal{K}_n$ of eigenvalues of normalized $n \times n$ stochastic matrices for orders $n=2$ through $n=8$.
  - Computes Farey fractions $p/q \le 1/2$ and renders the corresponding curvilinear boundary arcs.
  - Interactive test point placement with power orbit ray tracing ($z^k$) and Ito polynomial zero testing.
  - Mobile-responsive layout with quick-test presets (roots of unity, boundary endpoints, interior/exterior points).

### 2. [Numerical Spectra Realizer](spectra-realizer.html)
- **Engine**: Interactive complex eigenvalue plane with alternating projection solvers (von Neumann / Dykstra algorithms).
- **Functionality**:
  - Drag-and-drop eigenvalues on the complex plane with conjugate symmetry constraints.
  - Alternating projections onto the isospectral manifold and the non-negative matrix cone.
  - Exact analytical synthesizers: **Sule&#x012d;manova spectra** and **Soules basis constructions**.
  - One-click matrix exports: **LaTeX**, **NumPy (`np.array`)**, **MATLAB**, and **JSON**.
  - Touch-drag navigation optimized for tablet and mobile devices.

### 3. [Trace Polytope 3D Visualizer](trace-polytope.html)
- **Engine**: 3D WebGL dataset browser powered by Plotly.js.
- **Functionality**:
  - Explores the geometry of order-5 trace polytopes for both symmetric (SNIEP) and general real (RNIEP) matrices.
  - Filterable by dimension (2D polygon projections vs. 3D polyhedra) and vertex identifiers.
  - Interactive orbit rotation, zoom, vertex inspection, and facet illumination.

---

## 📚 Mathematical Theory Wiki

The platform contains self-contained, research-grade articles typeset with MathJax:

| Article | Topic & Mathematical Scope |
| :--- | :--- |
| **[Foundational Overview](problem-background.html)** | Perron-Frobenius theorem, spectral radius, primitive matrices, and historical survey. |
| **[NIEP Core Formulation](niep.html)** | Necessary trace conditions ($s_k \ge 0$), Loewy-London inequalities, and dimensional solvability status. |
| **[Symmetric NIEP (SNIEP)](sniep.html)** | Orthogonal eigenspaces, Fiedler's companion constructions, and Soules bases. |
| **[Real NIEP (RNIEP)](rniep.html)** | Real non-symmetric spectra, non-orthogonal frames, and the Laffey-Loewy separation gap ($n \ge 5$). |
| **[Karpelevi&#x010D; Region](karpelevich-region.html)** | Kolmogorov's problem, stochastic boundaries, Farey arc dissection, and Ito's algebraic polynomials. |
| **[Sule&#x012d;manova Spectra](suleimanova.html)** | Single positive eigenvalue condition, trace sufficiency, and Fiedler's symmetric realization. |
| **[Boyle-Handelman Theorem](boyle-handelman.html)** | Symbolic dynamics, shifts of finite type, and realization with auxiliary zero eigenvalues. |
| **[Perron Similarities & Spectracones](perron-similarities.html)** | Johnson-Paparella theory, spectracones, and group character table realizations. |

---

## 🛠️ Architecture & Technology Stack

The project adheres to a **zero-dependency, static-first architecture** designed for high performance, accessibility, and permanent archival stability:

- **Core**: Semantic HTML5, Vanilla ES6+ JavaScript, CSS3 custom properties (variables).
- **Styling**: Tailored design system with sleek dark mode by default, light mode toggle, glassmorphism cards, and responsive fluid typography (`clamp()`).
- **Mathematical Typesetting**: [MathJax 3](https://www.mathjax.org/) for TeX/LaTeX rendering.
- **Scientific Plotting**: [Plotly.js](https://plotly.com/javascript/) for interactive WebGL 3D geometric polyhedra.
- **Hosting**: Pure static files compatible with GitHub Pages, Cloudflare Pages, Nginx, or any standard HTTP web server.

---

## 💻 Local Development & Quick Start

Because the project is built purely with native web standards, **no build steps, bundlers, Ruby gems, or package managers are required**.

### Option 1: Python (Built-in)
```bash
# Clone the repository
git clone https://github.com/Thrinador/nonsensicallynonnegative.git
cd nonsensicallynonnegative

# Start a local HTTP server on port 8000
python3 -m http.server 8000
```
Open your browser to [http://localhost:8000](http://localhost:8000).

### Option 2: Node.js / npx
```bash
npx serve .
```

### Option 3: VS Code / IDE
Install the **Live Server** extension in Visual Studio Code, right-click `index.html`, and select **Open with Live Server**.

---

## 📁 Project Directory Structure

```text
nonsensicallynonnegative/
├── index.html                  # NIEP Research Hub master dashboard
├── about.html                  # About the initiative & contribution guide
├── sitemap.html                # Comprehensive visual site directory
├── sitemap.xml                 # Search engine sitemap protocol
├── 404.html                    # Unified error stage with standard hub navigation
├── karpelevich.html            # Karpelevič Region interactive canvas viewer
├── spectra-realizer.html       # Numerical Spectra Realizer application
├── trace-polytope.html         # 3D Trace Polytope dataset visualizer
│
├── problem-background.html     # Theory Wiki: Foundations & Perron-Frobenius
├── niep.html                   # Theory Wiki: Core NIEP formulation
├── sniep.html                  # Theory Wiki: Symmetric NIEP
├── rniep.html                  # Theory Wiki: Real NIEP
├── karpelevich-region.html     # Theory Wiki: Karpelevič region & Ito polynomials
├── suleimanova.html            # Theory Wiki: Suleĭmanova spectra
├── boyle-handelman.html        # Theory Wiki: Boyle-Handelman theorem
├── perron-similarities.html    # Theory Wiki: Perron similarities & spectracones
│
├── css/
│   ├── style.css               # Core global design system & responsive navigation
│   ├── personal.css            # Stylesheet for academic portfolio & profile
│   ├── karpelevich.css         # Canvas UI & toolbar layout for Karpelevič viewer
│   └── realizer.css            # Matrix realizer workspace & canvas styles
│
├── js/
│   ├── app.js                  # Polytope data visualizer logic
│   ├── karpelevich.js          # Karpelevič mathematical boundary computation & canvas
│   ├── realizer.js             # Numerical projection solver & matrix synthesis
│   └── theme.js                # System-preference & local-storage color theme toggle
│
├── personal/                   # Author academic profile, CV, papers, and lectures
│   ├── index.html              # Academic biography & research overview
│   ├── cv.html                 # Curriculum Vitae (PDF viewer & downloadable asset)
│   ├── publications.html       # Peer-reviewed journal papers, preprints, and DOIs
│   ├── talks.html              # Conference slides & invited seminar presentations
│   └── teaching.html           # Course lecture notes & university instruction archives
│
├── plots/                      # Standalone Plotly HTML datasets for trace polytopes
├── files/                      # Downloadable academic PDF publications and CV
└── images/                     # Favicons, project branding, and asset graphics
```

---

## 🤝 Contributing & Community

We welcome contributions from researchers, software engineers, and students interested in computational matrix analysis:

- **Mathematicians & Theoretical Researchers**: Propose new conjectures, submit counterexamples, refine proofs, or supply literature citations.
- **Scientific Software Developers**: Implement faster matrix synthesis algorithms (e.g., WebAssembly, GPU shaders), improve numerical stability, or optimize touch UX.
- **Students & Educators**: Contribute interactive pedagogical examples, problem sets, or documentation enhancements.

For detailed guidelines and contribution workflows, visit the **[About & Contributing Page](about.html)**.

### Submitting Changes
1. Fork the repository (`https://github.com/Thrinador/nonsensicallynonnegative`).
2. Create your feature branch (`git checkout -b feature/new-solver`).
3. Commit your modifications (`git commit -m 'Add alternating projection acceleration'`).
4. Push to the branch (`git push origin feature/new-solver`).
5. Open a Pull Request on GitHub.

---

## 📖 Publications & Citations

If you use this software, datasets, or theoretical surveys in your research, please cite:

```bibtex
@article{clark2024niep,
  author  = {Clark, Benjamin J.},
  title   = {The NIEP is solvable by reality and finitely many polynomial inequalities},
  journal = {arXiv preprint arXiv:2407.14472},
  year    = {2024},
  url     = {https://arxiv.org/abs/2407.14472}
}

@article{clark2023polynomials,
  author  = {Clark, Benjamin J.},
  title   = {Polynomials that preserve nonnegative matrices},
  journal = {Linear Algebra and its Applications},
  volume  = {676},
  pages   = {267--276},
  year    = {2023},
  doi     = {10.1016/j.laa.2023.07.014}
}

@misc{clark2026niephub,
  author       = {Clark, Benjamin J.},
  title        = {NIEP Research Hub: Computational Tools and Theoretical Surveys for the Nonnegative Inverse Eigenvalue Problem},
  year         = {2026},
  howpublished = {\url{https://nonsensicallynonnegative.com}},
  note         = {GitHub: \url{https://github.com/Thrinador/nonsensicallynonnegative}}
}
```

---

## 👨‍💻 Author & Maintainer

**Benjamin J. Clark, Ph.D.**  
*Department of Mathematics & Statistics, Washington State University*  
- **Website**: [https://nonsensicallynonnegative.com](https://nonsensicallynonnegative.com)
- **Profile**: [Academic Bio & Profile](personal/index.html)
- **arXiv**: [arxiv.org/a/clark_b_1.html](https://arxiv.org/a/clark_b_1.html)
- **ORCID**: [0000-0003-3492-8686](https://orcid.org/0000-0003-3492-8686)
- **GitHub**: [@Thrinador](https://github.com/Thrinador)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.
