/**
 * NIEP Research Hub - Unified Master Citations Registry & Web Component System
 * 
 * Provides a single source of truth for all academic literature across the NIEP area.
 * Custom elements:
 *   - <cite-card key="karpelevich1951"></cite-card>
 *   - <cite-grid keys="kolmogorov1938, karpelevich1951, ..."></cite-grid>
 *   - <cite-ref key="karpelevich1951"></cite-ref>
 * Also supports:
 *   - <div class="bib-grid" data-citations="key1, key2, ..."></div>
 */

(function(window) {
    'use strict';

    // Master Citation Registry
    const NIEP_CITATIONS = [
    {
        "key": "perron1907",
        "title": "Zur Theorie der Matrices",
        "authors": "Oskar Perron",
        "year": 1907,
        "venue": "Mathematische Annalen, 64(2): 248–263",
        "category": "foundations",
        "categoryName": "Foundations & Classical",
        "badge": "Classical Genesis",
        "badgeClass": "foundation",
        "doi": "https://doi.org/10.1007/BF01449896",
        "url": "https://doi.org/10.1007/BF01449896",
        "note": "Introduces the Perron theorem for strictly positive matrices, proving the existence of a unique maximal positive eigenvalue with an entrywise positive eigenvector.",
        "bibtex": "@article{Perron1907,\n  author  = {Perron, Oskar},\n  title   = {Zur {T}heorie der {M}atrices},\n  journal = {Mathematische Annalen},\n  volume  = {64},\n  number  = {2},\n  pages   = {248--263},\n  year    = {1907},\n  doi     = {10.1007/BF01449896}\n}"
    },
    {
        "key": "frobenius1912",
        "title": "Über Matrizen aus nicht negativen Elementen",
        "authors": "Georg Frobenius",
        "year": 1912,
        "venue": "Sitzungsberichte der Königlich Preussischen Akademie der Wissenschaften zu Berlin: 456–477",
        "category": "foundations",
        "categoryName": "Foundations & Classical",
        "badge": "Perron-Frobenius",
        "badgeClass": "foundation",
        "doi": "",
        "url": "https://archive.org/details/sitzungsberichte1912berl",
        "note": "Extends Perron's results to general entrywise nonnegative matrices, introducing irreducibility, imprimitivity, and cyclic block normal forms.",
        "bibtex": "@article{Frobenius1912,\n  author  = {Frobenius, Georg},\n  title   = {{\\\"U}ber {M}atrizen aus nicht negativen {E}lementen},\n  journal = {Sitzungsberichte der K{\\\"o}niglich Preussischen Akademie der Wissenschaften zu Berlin},\n  pages   = {456--477},\n  year    = {1912}\n}"
    },
    {
        "key": "minkowski1900",
        "title": "Zur Theorie der Einheiten in den algebraischen Zahlkörpern",
        "authors": "Hermann Minkowski",
        "year": 1900,
        "venue": "Nachrichten von der Gesellschaft der Wissenschaften zu Göttingen, Mathematisch-Physikalische Klasse, 1900: 90–93",
        "category": "foundations",
        "categoryName": "Foundations & Classical",
        "badge": "Dominant Diagonals",
        "badgeClass": "foundation",
        "doi": "",
        "url": "http://eudml.org/doc/58461",
        "note": "Establishes non-singularity criteria for matrices with strictly dominant diagonals, laying foundational inequalities for nonnegative spectral localization.",
        "bibtex": "@article{Minkowski1900,\n  author  = {Minkowski, Hermann},\n  title   = {Zur {T}heorie der {E}inheiten in den algebraischen {Z}ahlk{\\\"o}rpern},\n  journal = {Nachr. Ges. Wiss. G{\\\"o}ttingen, Math.-Phys. Kl.},\n  pages   = {90--93},\n  year    = {1900}\n}"
    },
    {
        "key": "kolmogorov1938",
        "title": "Markov chains with countably many possible states",
        "authors": "Andrey N. Kolmogorov",
        "year": 1938,
        "venue": "Bulletin of Moscow University, Mathematics and Mechanics, 1(3): 1–16",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Problem Origin",
        "badgeClass": "history",
        "doi": "",
        "url": "",
        "note": "Original formulation of the problem asking for the complete set K_n of complex eigenvalues realizable by n x n stochastic matrices (often misattributed to 1937).",
        "bibtex": "@article{Kolmogorov1938,\n  author  = {Kolmogorov, Andrey N.},\n  title   = {Markov chains with countably many possible states},\n  journal = {Bull. Univ. Moscow, Ser. Internat., Sect. A},\n  volume  = {1},\n  number  = {3},\n  pages   = {1--16},\n  year    = {1938}\n}"
    },
    {
        "key": "dmitriev1946",
        "title": "On characteristic roots of stochastic matrices",
        "authors": "Nikolai A. Dmitriev and Eugene B. Dynkin",
        "year": 1946,
        "venue": "Izvestiya Akademii Nauk SSSR. Seriya Matematicheskaya, 10(2): 167–184",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Invariant Polygons",
        "badgeClass": "theory",
        "doi": "",
        "url": "https://www.mathnet.ru/eng/im3595",
        "note": "Introduces the geometric duality between stochastic matrix spectra and contracting invariant polygons under complex rotation; determines the eigenvalue region for small orders (n <= 5). The invariant-polygon correspondence is recalled in Karpelevič (1951), §2.",
        "bibtex": "@article{DmitrievDynkin1946,\n  author  = {Dmitriev, Nikolai A. and Dynkin, Eugene B.},\n  title   = {On characteristic roots of stochastic matrices},\n  journal = {Izv. Akad. Nauk SSSR Ser. Mat.},\n  volume  = {10},\n  number  = {2},\n  pages   = {167--184},\n  year    = {1946}\n}"
    },
    {
        "key": "karpelevich1951",
        "title": "On the characteristic roots of matrices with nonnegative elements",
        "authors": "Fridrikh I. Karpelevič",
        "year": 1951,
        "venue": "Izvestiya Akademii Nauk SSSR. Seriya Matematicheskaya, 15(4): 361–383 (English transl.: Amer. Math. Soc. Transl. (2), 140 (1988), 79–100)",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Complete Solution",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1090/trans2/140/05",
        "url": "https://www.mathnet.ru/eng/im3317",
        "note": "Seminal 23-page paper providing the complete geometric determination of K_n for all n via invariant polygons, the circular-board contact reduction game, Farey ordering, and algebraic boundary arcs.",
        "bibtex": "@article{Karpelevich1951,\n  author  = {Karpelevi{\\v{c}}, Fridrikh I.},\n  title   = {On the characteristic roots of matrices with nonnegative elements},\n  journal = {Izv. Akad. Nauk SSSR Ser. Mat.},\n  volume  = {15},\n  number  = {4},\n  pages   = {361--383},\n  year    = {1951},\n  note    = {English translation in Amer. Math. Soc. Transl. (2), 140 (1988), 79--100},\n  doi     = {10.1090/trans2/140/05}\n}"
    },
    {
        "key": "swift1972",
        "title": "The location of characteristic roots of stochastic matrices",
        "authors": "Joanne Swift",
        "year": 1972,
        "venue": "Master's Thesis, McGill University, Department of Mathematics",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Thesis & Translations",
        "badgeClass": "survey",
        "doi": "",
        "url": "https://escholarship.mcgill.ca/concern/theses/8s45qc869",
        "note": "Authoritative Western dissemination providing full English translations of Dmitriev-Dynkin (1946) and Suleĭmanova (1949), rectifying the 1938 Kolmogorov citation, and analyzing boundary contact geometry.",
        "bibtex": "@mastersthesis{Swift1972,\n  author  = {Swift, Joanne},\n  title   = {The location of characteristic roots of stochastic matrices},\n  school  = {McGill University},\n  address = {Montreal, Canada},\n  year    = {1972}\n}"
    },
    {
        "key": "djokovic1990",
        "title": "Cyclic polygons, roots of polynomials with decreasing nonnegative coefficients, and eigenvalues of stochastic matrices",
        "authors": "Dragomir Ž. Đoković",
        "year": 1990,
        "venue": "Linear Algebra and its Applications, 142: 173–193",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Cyclic Polygons",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/0024-3795(90)90266-F",
        "url": "https://doi.org/10.1016/0024-3795(90)90266-F",
        "note": "Studies single-orbit cyclic polygons, disproves the Dmitriev–Dynkin conjecture at order six, and simplifies the theorem’s statement.",
        "bibtex": "@article{Djokovic1990,\n  author  = {{\\DJ}okovi{\\'c}, Dragomir {\\v{Z}}.},\n  title   = {Cyclic polygons, roots of polynomials with decreasing nonnegative coefficients, and eigenvalues of stochastic matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {142},\n  pages   = {173--193},\n  year    = {1990},\n  doi     = {10.1016/0024-3795(90)90266-F}\n}"
    },
    {
        "key": "ito1997",
        "title": "A new statement about the theorem determining the region of eigenvalues of stochastic matrices",
        "authors": "Hisashi Ito",
        "year": 1997,
        "venue": "Linear Algebra and its Applications, 267: 241–246",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Algebraic Equations",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1016/S0024-3795(97)80052-3",
        "url": "https://doi.org/10.1016/S0024-3795(97)80052-3",
        "note": "Gives a shorter equivalent formulation of Karpelevich’s theorem.",
        "bibtex": "@article{Ito1997,\n  author  = {Ito, Hisashi},\n  title   = {A new statement about the theorem determining the region of eigenvalues of stochastic matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {267},\n  pages   = {241--246},\n  year    = {1997},\n  doi     = {10.1016/S0024-3795(97)80052-3}\n}"
    },
    {
        "key": "johnson2016",
        "title": "Perron spectratopes and the real nonnegative inverse eigenvalue problem",
        "authors": "Charles R. Johnson and Pietro Paparella",
        "year": 2016,
        "venue": "Linear Algebra and its Applications, 493: 281–300",
        "category": "perron-sim",
        "categoryName": "Perron Similarities & Cones",
        "badge": "Perron Spectratopes",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2015.11.033",
        "arxiv": "https://arxiv.org/abs/1508.07400",
        "url": "https://doi.org/10.1016/j.laa.2015.11.033",
        "note": "Introduces real Perron similarities, Perron spectracones, and Perron spectratopes to study polyhedral sufficient regions in the real nonnegative inverse eigenvalue problem.",
        "bibtex": "@article{JohnsonPaparella2016,\n  author  = {Johnson, Charles R. and Paparella, Pietro},\n  title   = {Perron spectratopes and the real nonnegative inverse eigenvalue problem},\n  journal = {Linear Algebra and its Applications},\n  volume  = {493},\n  pages   = {281--300},\n  year    = {2016},\n  doi     = {10.1016/j.laa.2015.11.033},\n  eprint  = {1508.07400},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "johnson2017",
        "title": "A matricial view of the Karpelevič theorem",
        "authors": "Charles R. Johnson and Pietro Paparella",
        "year": 2017,
        "venue": "Linear Algebra and its Applications, 520: 1–15",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Matrix Realizations",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2017.01.009",
        "url": "https://doi.org/10.1016/j.laa.2017.01.009",
        "note": "Provides explicit n x n stochastic matrix realization families for every reduced Ito boundary polynomial, showing how companion pencils generate all extremal curves.",
        "bibtex": "@article{JohnsonPaparella2017,\n  author  = {Johnson, Charles R. and Paparella, Pietro},\n  title   = {A matricial view of the {K}arpelevi{\\v{c}} theorem},\n  journal = {Linear Algebra and its Applications},\n  volume  = {520},\n  pages   = {1--15},\n  year    = {2017},\n  doi     = {10.1016/j.laa.2017.01.009}\n}"
    },
    {
        "key": "kirkland2020",
        "title": "The Karpelevič region revisited",
        "authors": "Stephen Kirkland, Thomas J. Laffey, and Helena Šmigoc",
        "year": 2020,
        "venue": "Journal of Mathematical Analysis and Applications, 490(2): 124332",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Polar Parametrization",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1016/j.jmaa.2020.124332",
        "arxiv": "https://arxiv.org/abs/2005.02452",
        "url": "https://doi.org/10.1016/j.jmaa.2020.124332",
        "note": "Eliminates multi-root selection ambiguity in Ito's formulation via an exact polar radius equation, proves C^1 arc regularity, and establishes the Universal Subdominance Theorem.",
        "bibtex": "@article{KirklandLaffeySmigoc2020,\n  author  = {Kirkland, Stephen and Laffey, Thomas J. and {\\v{S}}migoc, Helena},\n  title   = {The {K}arpelevi{\\v{c}} region revisited},\n  journal = {Journal of Mathematical Analysis and Applications},\n  volume  = {490},\n  number  = {2},\n  pages   = {124332},\n  year    = {2020},\n  doi     = {10.1016/j.jmaa.2020.124332},\n  eprint  = {2005.02452},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "munger2023",
        "title": "Demystifying the Karpelevič theorem",
        "authors": "Devon N. Munger, Andrew L. Nickerson, and Pietro Paparella",
        "year": 2024,
        "venue": "Linear Algebra and its Applications, 702: 46–62",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Arc Simpleness",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2024.08.006",
        "arxiv": "https://arxiv.org/abs/2309.03849",
        "url": "https://doi.org/10.1016/j.laa.2024.08.006",
        "note": "Proves continuous selection and simplicity for Type I arcs, and boundary extremality for n > 3.",
        "bibtex": "@article{MungerNickersonPaparella2024,\n  author  = {Munger, Devon N. and Nickerson, Andrew L. and Paparella, Pietro},\n  title   = {Demystifying the {K}arpelevi{\\v{c}} theorem},\n  journal = {Linear Algebra and its Applications},\n  volume  = {702},\n  pages   = {46--62},\n  year    = {2024},\n  doi     = {10.1016/j.laa.2024.08.006},\n  eprint  = {2309.03849},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "verbeken2026",
        "title": "A proof of the Karpelevič theorem via invariant polygons",
        "authors": "Brecht Verbeken and Vincent Ginis",
        "year": 2026,
        "venue": "arXiv preprint arXiv:2609.26058v3 [math.PR]",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Invariant Polygons Proof",
        "badgeClass": "breakthrough",
        "doi": "",
        "arxiv": "https://arxiv.org/abs/2609.26058",
        "url": "https://arxiv.org/abs/2609.26058",
        "note": "Self-contained geometric derivation of the Karpelevič theorem via invariant polygons from an arbitrary radial extremum of minimal order N >= 4, including exposing-line and positive-coordinate projective chain proofs (Lemmas 3.3–3.4 and Theorem 3.5).",
        "bibtex": "@article{VerbekenGinis2026,\n  author  = {Verbeken, Brecht and Ginis, Vincent},\n  title   = {A proof of the {K}arpelevi{\\v{c}} theorem via invariant polygons},\n  journal = {arXiv preprint arXiv:2609.26058v3},\n  year    = {2026},\n  eprint  = {2609.26058},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "suleimanova1949",
        "title": "Stochastic matrices with real characteristic values",
        "authors": "H. R. Suleĭmanova",
        "year": 1949,
        "venue": "Doklady Akademii Nauk SSSR, 66(3): 343–345",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Suleĭmanova Condition",
        "badgeClass": "foundation",
        "doi": "",
        "url": "",
        "note": "States that any real list lambda_1 > 0 >= lambda_2 >= ... >= lambda_n with lambda_1 + sum_{i=2}^n lambda_i >= 0 is realizable by an n x n nonnegative matrix (and, after normalizing lambda_1 = 1, by a row-stochastic matrix).",
        "bibtex": "@article{Suleimanova1949,\n  author  = {Sule{\\u{\\i}}manova, H. R.},\n  title   = {Stochastic matrices with real characteristic values},\n  journal = {Dokl. Akad. Nauk SSSR},\n  volume  = {66},\n  number  = {3},\n  pages   = {343--345},\n  year    = {1949}\n}"
    },
    {
        "key": "perfect1953",
        "title": "Methods of constructing certain stochastic matrices",
        "authors": "Hazel Perfect",
        "year": 1953,
        "venue": "Duke Mathematical Journal, 20(3): 395–404",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Constructive Proof",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1215/S0012-7094-53-02040-7",
        "url": "https://doi.org/10.1215/S0012-7094-53-02040-7",
        "note": "Develops explicit similarity transformations to construct stochastic and nonnegative matrices with prescribed real eigenvalues, giving a rigorous constructive proof of Suleĭmanova's criterion.",
        "bibtex": "@article{Perfect1953,\n  author  = {Perfect, Hazel},\n  title   = {Methods of constructing certain stochastic matrices},\n  journal = {Duke Mathematical Journal},\n  volume  = {20},\n  number  = {3},\n  pages   = {395--404},\n  year    = {1953},\n  doi     = {10.1215/S0012-7094-53-02040-7}\n}"
    },
    {
        "key": "perfect1955",
        "title": "Methods of constructing certain stochastic matrices. II",
        "authors": "Hazel Perfect",
        "year": 1955,
        "venue": "Duke Mathematical Journal, 22(2): 305–311",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Rank-One Perturbations",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1215/S0012-7094-55-02232-8",
        "url": "https://doi.org/10.1215/S0012-7094-55-02232-8",
        "note": "Extends constructive similarity and rank-one perturbation methods for building stochastic and positive matrices with prescribed characteristic roots.",
        "bibtex": "@article{Perfect1955,\n  author  = {Perfect, Hazel},\n  title   = {Methods of constructing certain stochastic matrices. {II}},\n  journal = {Duke Mathematical Journal},\n  volume  = {22},\n  number  = {2},\n  pages   = {305--311},\n  year    = {1955},\n  doi     = {10.1215/S0012-7094-55-02232-8}\n}"
    },
    {
        "key": "fiedler1974",
        "title": "Eigenvalues of nonnegative symmetric matrices",
        "authors": "Miroslav Fiedler",
        "year": 1974,
        "venue": "Linear Algebra and its Applications, 9(1): 119–142",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Symmetric Realization",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1016/0024-3795(74)90031-7",
        "url": "https://doi.org/10.1016/0024-3795(74)90031-7",
        "note": "Seminal paper proving via recursive rank-one symmetric gluing that every Suleĭmanova spectrum is realizable by an entrywise nonnegative symmetric matrix, initiating the modern SNIEP.",
        "bibtex": "@article{Fiedler1974,\n  author  = {Fiedler, Miroslav},\n  title   = {Eigenvalues of nonnegative symmetric matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {9},\n  number  = {1},\n  pages   = {119--142},\n  year    = {1974},\n  doi     = {10.1016/0024-3795(74)90031-7}\n}"
    },
    {
        "key": "soules1983",
        "title": "Constructing symmetric nonnegative matrices",
        "authors": "George W. Soules",
        "year": 1983,
        "venue": "Linear and Multilinear Algebra, 13(3): 241–251",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Soules Bases",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1080/03081088308817523",
        "url": "https://doi.org/10.1080/03081088308817523",
        "note": "Introduces Soules matrices and orthogonal bases, providing an orthogonal coordinate frame that maps every Suleĭmanova spectrum (and certain spectra with multiple positive eigenvalues) to a symmetric nonnegative matrix.",
        "bibtex": "@article{Soules1983,\n  author  = {Soules, George W.},\n  title   = {Constructing symmetric nonnegative matrices},\n  journal = {Linear and Multilinear Algebra},\n  volume  = {13},\n  number  = {3},\n  pages   = {241--251},\n  year    = {1983},\n  doi     = {10.1080/03081088308817523}\n}"
    },
    {
        "key": "elsner1998",
        "title": "Orthogonal bases that lead to symmetric nonnegative matrices",
        "authors": "Ludwig Elsner, Reinhard Nabben, and Michael Neumann",
        "year": 1998,
        "venue": "Linear Algebra and its Applications, 271(1–3): 323–343",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Binary Tree Bases",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/S0024-3795(97)00302-9",
        "url": "https://doi.org/10.1016/S0024-3795(97)00302-9",
        "note": "Classifies and constructs Soules bases via binary partition trees, analyzing the simplicial cones of symmetric nonnegative matrices they generate.",
        "bibtex": "@article{ElsnerNabbenNeumann1998,\n  author  = {Elsner, Ludwig and Nabben, Reinhard and Neumann, Michael},\n  title   = {Orthogonal bases that lead to symmetric nonnegative matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {271},\n  number  = {1--3},\n  pages   = {323--343},\n  year    = {1998},\n  doi     = {10.1016/S0024-3795(97)00302-9}\n}"
    },
    {
        "key": "smigoc2004",
        "title": "The inverse eigenvalue problem for nonnegative matrices",
        "authors": "Helena Šmigoc",
        "year": 2004,
        "venue": "Linear Algebra and its Applications, 393: 365–374",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Diagonal Block Gluing",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2004.03.036",
        "url": "https://doi.org/10.1016/j.laa.2004.03.036",
        "note": "Constructs a nonnegative matrix realizing (lambda_1, ..., lambda_m, mu_2, ..., mu_n) whenever a diagonal entry of a realization of (lambda_1, ..., lambda_m) dominates the Perron root mu_1, unifying real and complex gluing constructions.",
        "bibtex": "@article{Smigoc2004,\n  author  = {{\\v{S}}migoc, Helena},\n  title   = {The inverse eigenvalue problem for nonnegative matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {393},\n  pages   = {365--374},\n  year    = {2004},\n  doi     = {10.1016/j.laa.2004.03.036}\n}"
    },
    {
        "key": "loewy1978",
        "title": "A note on an inverse problem for nonnegative matrices",
        "authors": "Raphael Loewy and David London",
        "year": 1978,
        "venue": "Linear and Multilinear Algebra, 6(1): 83–90",
        "category": "sniep",
        "categoryName": "General & Real NIEP",
        "badge": "Trace Inequalities",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1080/03081087808817226",
        "url": "https://doi.org/10.1080/03081087808817226",
        "note": "Derives the necessary Loewy–London trace inequalities s_k^m <= n^(m-1) s_{km}, solves the n = 3 NIEP and real/trace-zero n = 4 cases, and poses the RNIEP vs. SNIEP question.",
        "bibtex": "@article{LoewyLondon1978,\n  author  = {Loewy, Raphael and London, David},\n  title   = {A note on an inverse problem for nonnegative matrices},\n  journal = {Linear and Multilinear Algebra},\n  volume  = {6},\n  number  = {1},\n  pages   = {83--90},\n  year    = {1978},\n  doi     = {10.1080/03081087808817226}\n}"
    },
    {
        "key": "borobia1995",
        "title": "On the nonnegative eigenvalue problem",
        "authors": "Alberto Borobia",
        "year": 1995,
        "venue": "Linear Algebra and its Applications, 223–224: 131–140",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Partitioning Realizations",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/0024-3795(94)00343-C",
        "url": "https://doi.org/10.1016/0024-3795(94)00343-C",
        "note": "Extends Suleĭmanova's criterion by showing that real lists partitionable into Suleĭmanova sublists after splitting positive eigenvalues are realizable by nonnegative matrices.",
        "bibtex": "@article{Borobia1995,\n  author  = {Borobia, Alberto},\n  title   = {On the nonnegative eigenvalue problem},\n  journal = {Linear Algebra and its Applications},\n  volume  = {223--224},\n  pages   = {131--140},\n  year    = {1995},\n  doi     = {10.1016/0024-3795(94)00343-C}\n}"
    },
    {
        "key": "johnson1996",
        "title": "The real and the symmetric nonnegative inverse eigenvalue problems are different",
        "authors": "Charles R. Johnson, Thomas J. Laffey, and Raphael Loewy",
        "year": 1996,
        "venue": "Proceedings of the American Mathematical Society, 124(12): 3647–3651",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "RNIEP ≠ SNIEP",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1090/S0002-9939-96-03587-3",
        "url": "https://doi.org/10.1090/S0002-9939-96-03587-3",
        "note": "Proves that the real nonnegative inverse eigenvalue problem (RNIEP) and the symmetric nonnegative inverse eigenvalue problem (SNIEP) are distinct, refuting the Loewy–London equivalence conjecture.",
        "bibtex": "@article{JohnsonLaffeyLoewy1996,\n  author  = {Johnson, Charles R. and Laffey, Thomas J. and Loewy, Raphael},\n  title   = {The real and the symmetric nonnegative inverse eigenvalue problems are different},\n  journal = {Proceedings of the American Mathematical Society},\n  volume  = {124},\n  number  = {12},\n  pages   = {3647--3651},\n  year    = {1996},\n  doi     = {10.1090/S0002-9939-96-03587-3}\n}"
    },
    {
        "key": "radwan1996",
        "title": "An inverse eigenvalue problem for symmetric and normal matrices",
        "authors": "Nizar Radwan",
        "year": 1996,
        "venue": "Linear Algebra and its Applications, 248: 101–109",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Symmetric & Normal NIEP",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/0024-3795(95)00162-X",
        "url": "https://doi.org/10.1016/0024-3795(95)00162-X",
        "note": "Establishes sufficient conditions for real spectra to be realized by symmetric nonnegative matrices and for complex spectra to be realized by normal nonnegative matrices.",
        "bibtex": "@article{Radwan1996,\n  author  = {Radwan, Nizar},\n  title   = {An inverse eigenvalue problem for symmetric and normal matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {248},\n  pages   = {101--109},\n  year    = {1996},\n  doi     = {10.1016/0024-3795(95)00162-X}\n}"
    },
    {
        "key": "laffey1999",
        "title": "A characterization of trace zero nonnegative 5×5 matrices",
        "authors": "Thomas J. Laffey and Eleanor Meehan",
        "year": 1999,
        "venue": "Linear Algebra and its Applications, 302–303: 295–302",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Trace-Zero n=5",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1016/S0024-3795(99)00099-3",
        "url": "https://doi.org/10.1016/S0024-3795(99)00099-3",
        "note": "Characterizes trace-zero 5×5 nonnegative spectra via s_2^2 <= 4 s_4 (with s_3, s_5 >= 0), proving that spectra such as (3+t, 3-t, -2, -2, -2) for small t >= 0 satisfy all JLL inequalities yet are unrealizable in order 5.",
        "bibtex": "@article{LaffeyMeehan1999,\n  author  = {Laffey, Thomas J. and Meehan, Eleanor},\n  title   = {A characterization of trace zero nonnegative $5 \\times 5$ matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {302--303},\n  pages   = {295--302},\n  year    = {1999},\n  doi     = {10.1016/S0024-3795(99)00099-3}\n}"
    },
    {
        "key": "soto2003",
        "title": "Existence and construction of nonnegative matrices with prescribed spectrum",
        "authors": "Ricardo L. Soto",
        "year": 2003,
        "venue": "Linear Algebra and its Applications, 369: 169–184",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Constructive Algorithms",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/S0024-3795(02)00731-0",
        "url": "https://doi.org/10.1016/S0024-3795(02)00731-0",
        "note": "Develops constructive sufficiency criteria and Brauer rank-one perturbation algorithms for building nonnegative matrices with prescribed real spectra.",
        "bibtex": "@article{Soto2003,\n  author  = {Soto, Ricardo L.},\n  title   = {Existence and construction of nonnegative matrices with prescribed spectrum},\n  journal = {Linear Algebra and its Applications},\n  volume  = {369},\n  pages   = {169--184},\n  year    = {2003},\n  doi     = {10.1016/S0024-3795(02)00731-0}\n}"
    },
    {
        "key": "laffey2006",
        "title": "Nonnegative realization of spectra having negative real parts",
        "authors": "Thomas J. Laffey and Helena Šmigoc",
        "year": 2006,
        "venue": "Linear Algebra and its Applications, 416(1): 148–159",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Negative Real Parts",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2005.12.008",
        "url": "https://doi.org/10.1016/j.laa.2005.12.008",
        "note": "Characterizes when a conjugate-closed spectrum consisting of one positive eigenvalue and remaining eigenvalues with nonpositive real parts is realizable by a nonnegative matrix (requiring s_1 >= 0 and s_1^2 <= n s_2).",
        "bibtex": "@article{LaffeySmigoc2006,\n  author  = {Laffey, Thomas J. and {\\v{S}}migoc, Helena},\n  title   = {Nonnegative realization of spectra having negative real parts},\n  journal = {Linear Algebra and its Applications},\n  volume  = {416},\n  number  = {1},\n  pages   = {148--159},\n  year    = {2006},\n  doi     = {10.1016/j.laa.2005.12.008}\n}"
    },
    {
        "key": "boyle1991",
        "title": "The spectra of nonnegative matrices via symbolic dynamics",
        "authors": "Mike Boyle and David Handelman",
        "year": 1991,
        "venue": "Annals of Mathematics, 133(2): 249–316",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Boyle-Handelman",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.2307/2944339",
        "url": "https://doi.org/10.2307/2944339",
        "note": "Landmark paper characterizing all nonzero spectra of primitive real nonnegative matrices allowing auxiliary zero eigenvalues, via symbolic dynamics and shift equivalence.",
        "bibtex": "@article{BoyleHandelman1991,\n  author  = {Boyle, Mike and Handelman, David},\n  title   = {The spectra of nonnegative matrices via symbolic dynamics},\n  journal = {Annals of Mathematics},\n  volume  = {133},\n  number  = {2},\n  pages   = {249--316},\n  year    = {1991},\n  doi     = {10.2307/2944339}\n}"
    },
    {
        "key": "williams1973",
        "title": "Classification of subshifts of finite type",
        "authors": "R. F. Williams",
        "year": 1973,
        "venue": "Annals of Mathematics, 98(1): 120–153; Errata: 99(2): 380–381 (1974)",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Shift Equivalence",
        "badgeClass": "foundation",
        "doi": "https://doi.org/10.2307/1970908",
        "url": "https://doi.org/10.2307/1970908",
        "note": "Foundational paper defining shifts of finite type, shift equivalence, and strong shift equivalence, formulating the Spectral Conjecture for nonnegative transition matrices.",
        "bibtex": "@article{Williams1973,\n  author  = {Williams, R. F.},\n  title   = {Classification of subshifts of finite type},\n  journal = {Annals of Mathematics},\n  volume  = {98},\n  number  = {1},\n  pages   = {120--153},\n  year    = {1973},\n  doi     = {10.2307/1970908}\n}"
    },
    {
        "key": "boyle1993",
        "title": "Algebraic shift equivalence and primitive matrices",
        "authors": "Mike Boyle and David Handelman",
        "year": 1993,
        "venue": "Transactions of the American Mathematical Society, 336(1): 121–149",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Algebraic Shift Equivalence",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1090/S0002-9947-1993-1102219-4",
        "url": "https://doi.org/10.1090/S0002-9947-1993-1102219-4",
        "note": "Investigates when matrices over unital subrings of R are algebraically shift equivalent to primitive matrices, formulating the Spectral Conjecture over subrings and establishing dimension lower bounds over Z.",
        "bibtex": "@article{BoyleHandelman1993,\n  author  = {Boyle, Mike and Handelman, David},\n  title   = {Algebraic shift equivalence and primitive matrices},\n  journal = {Transactions of the American Mathematical Society},\n  volume  = {336},\n  number  = {1},\n  pages   = {121--149},\n  year    = {1993},\n  doi     = {10.1090/S0002-9947-1993-1102219-4}\n}"
    },
    {
        "key": "kim-roush1999",
        "title": "The Williams conjecture is false for irreducible subshifts",
        "authors": "Ki Hang Kim and Fred W. Roush",
        "year": 1999,
        "venue": "Annals of Mathematics, 149(2): 545–558",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Williams Conjecture",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.2307/120975",
        "arxiv": "https://arxiv.org/abs/math/9907095",
        "url": "https://doi.org/10.2307/120975",
        "note": "Proves that shift equivalence over Z+ does not imply strong shift equivalence for primitive/irreducible shifts of finite type, resolving Williams' conjecture in the negative.",
        "bibtex": "@article{KimRoush1999,\n  author  = {Kim, Ki Hang and Roush, Fred W.},\n  title   = {The {W}illiams conjecture is false for irreducible subshifts},\n  journal = {Annals of Mathematics},\n  volume  = {149},\n  number  = {2},\n  pages   = {545--558},\n  year    = {1999},\n  doi     = {10.2307/120975},\n  eprint  = {math/9907095},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "kim2000",
        "title": "The spectra of nonnegative integer matrices via formal power series",
        "authors": "K. H. Kim, N. S. Ormes, and F. W. Roush",
        "year": 2000,
        "venue": "Journal of the American Mathematical Society, 13(4): 773–806",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Integer Realization",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1090/S0894-0347-00-00342-8",
        "url": "https://doi.org/10.1090/S0894-0347-00-00342-8",
        "note": "Characterizes the nonzero spectra of primitive nonnegative integer matrices via formal power series and state splitting, proving the necessity and sufficiency of the Boyle–Handelman conditions together with integer coefficients and nonnegative net traces.",
        "bibtex": "@article{KimOrmesRoush2000,\n  author  = {Kim, K. H. and Ormes, N. S. and Roush, F. W.},\n  title   = {The spectra of nonnegative integer matrices via formal power series},\n  journal = {Journal of the American Mathematical Society},\n  volume  = {13},\n  number  = {4},\n  pages   = {773--806},\n  year    = {2000},\n  doi     = {10.1090/S0894-0347-00-00342-8}\n}"
    },
    {
        "key": "laffey2012",
        "title": "A constructive version of the Boyle–Handelman theorem on the spectra of nonnegative matrices",
        "authors": "Thomas J. Laffey",
        "year": 2012,
        "venue": "Linear Algebra and its Applications, 436(6): 1701–1709",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Constructive Boyle–Handelman",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2011.09.023",
        "url": "https://doi.org/10.1016/j.laa.2011.09.023",
        "note": "Provides an explicit matrix-theoretic proof and dimension-bounding construction for the real Boyle–Handelman theorem under positive power sums.",
        "bibtex": "@article{Laffey2012,\n  author  = {Laffey, Thomas J.},\n  title   = {A constructive version of the {B}oyle--{H}andelman theorem on the spectra of nonnegative matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {436},\n  number  = {6},\n  pages   = {1701--1709},\n  year    = {2012},\n  doi     = {10.1016/j.laa.2011.09.023}\n}"
    },
    {
        "key": "johnson1981",
        "title": "Row stochastic matrices similar to doubly stochastic matrices",
        "authors": "Charles R. Johnson",
        "year": 1981,
        "venue": "Linear and Multilinear Algebra, 10(2): 113–130",
        "category": "perron-sim",
        "categoryName": "Perron Similarities & Cones",
        "badge": "Doubly Stochastic",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1080/03081088108817402",
        "url": "https://doi.org/10.1080/03081088108817402",
        "note": "Examines similarity between row-stochastic and doubly stochastic matrices, showing that not every row-stochastic matrix is similar to a doubly stochastic matrix.",
        "bibtex": "@article{Johnson1981,\n  author  = {Johnson, Charles R.},\n  title   = {Row stochastic matrices similar to doubly stochastic matrices},\n  journal = {Linear and Multilinear Algebra},\n  volume  = {10},\n  number  = {2},\n  pages   = {113--130},\n  year    = {1981},\n  doi     = {10.1080/03081088108817402}\n}"
    },
    {
        "key": "holtz2005",
        "title": "M-matrices satisfy Newton's inequalities",
        "authors": "Olga Holtz",
        "year": 2005,
        "venue": "Proceedings of the American Mathematical Society, 133(3): 711–717",
        "category": "foundations",
        "categoryName": "General & Real NIEP",
        "badge": "M-Matrix Newton Bounds",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1090/S0002-9939-04-07576-8",
        "arxiv": "https://arxiv.org/abs/math/0512610",
        "url": "https://doi.org/10.1090/S0002-9939-04-07576-8",
        "note": "Proves that the normalized characteristic polynomial coefficients of every M-matrix (hence rho*I - A for every nonnegative matrix A) satisfy Newton's log-concavity inequalities.",
        "bibtex": "@article{Holtz2005,\n  author  = {Holtz, Olga},\n  title   = {{M}-matrices satisfy {N}ewton's inequalities},\n  journal = {Proceedings of the American Mathematical Society},\n  volume  = {133},\n  number  = {3},\n  pages   = {711--717},\n  year    = {2005},\n  doi     = {10.1090/S0002-9939-04-07576-8},\n  eprint  = {math/0512610},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "torre2007",
        "title": "The nonnegative inverse eigenvalue problem from the coefficients of the characteristic polynomial. EBL digraphs",
        "authors": "J. Torre-Mayo, M. R. Abril-Raymundo, E. Alarcia-Estévez, C. Marijuán, and M. Pisonero",
        "year": 2007,
        "venue": "Linear Algebra and its Applications, 426(2–3): 729–773",
        "category": "sniep",
        "categoryName": "General & Real NIEP",
        "badge": "Complete n=4 Solution",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1016/j.laa.2007.06.014",
        "url": "https://doi.org/10.1016/j.laa.2007.06.014",
        "note": "Completely characterizes the general 4×4 NIEP in terms of polynomial inequalities on the coefficients of the characteristic polynomial via EBL digraphs.",
        "bibtex": "@article{TorreMayo2007,\n  author  = {Torre-Mayo, J. and Abril-Raymundo, M. R. and Alarcia-Est{\\'e}vez, E. and Mariju{\\'a}n, C. and Pisonero, M.},\n  title   = {The nonnegative inverse eigenvalue problem from the coefficients of the characteristic polynomial. {EBL} digraphs},\n  journal = {Linear Algebra and its Applications},\n  volume  = {426},\n  number  = {2--3},\n  pages   = {729--773},\n  year    = {2007},\n  doi     = {10.1016/j.laa.2007.06.014}\n}"
    },
    {
        "key": "clark2022",
        "title": "Polynomials that preserve nonnegative matrices",
        "authors": "Benjamin J. Clark and Pietro Paparella",
        "year": 2022,
        "venue": "Linear Algebra and its Applications, 637: 110–118",
        "category": "structural",
        "categoryName": "Modern Preprints & Structure",
        "badge": "Preserving Polynomials",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2021.12.007",
        "arxiv": "https://arxiv.org/abs/2109.03360",
        "url": "https://doi.org/10.1016/j.laa.2021.12.007",
        "note": "Establishes coefficient-based necessary and sufficient conditions for polynomials in P_n preserving entrywise nonnegative matrices of order n.",
        "bibtex": "@article{ClarkPaparella2022,\n  author  = {Clark, Benjamin J. and Paparella, Pietro},\n  title   = {Polynomials that preserve nonnegative matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {637},\n  pages   = {110--118},\n  year    = {2022},\n  doi     = {10.1016/j.laa.2021.12.007},\n  eprint  = {2109.03360},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "clark2024cone",
        "title": "Properties of the cone of polynomials of fixed degree that preserve nonnegative matrices",
        "authors": "Jared J. L. Brannan, Benjamin J. Clark, and Garrett J. Kepler",
        "year": 2024,
        "venue": "arXiv preprint arXiv:2402.04508 [math.RA]",
        "category": "structural",
        "categoryName": "Modern Preprints & Structure",
        "badge": "Polynomial Cones",
        "badgeClass": "theory",
        "doi": "",
        "arxiv": "https://arxiv.org/abs/2402.04508",
        "url": "https://arxiv.org/abs/2402.04508",
        "note": "Proves that the cone of nonnegative-preserving polynomials of degree >= 2n is non-polyhedral, resolves Loewy's question on arbitrarily negative coefficients, and bounds spherical cone volume.",
        "bibtex": "@misc{BrannanClarkKepler2024,\n  author        = {Brannan, Jared J. L. and Clark, Benjamin J. and Kepler, Garrett J.},\n  title         = {Properties of the cone of polynomials of fixed degree that preserve nonnegative matrices},\n  year          = {2024},\n  eprint        = {2402.04508},\n  archivePrefix = {arXiv},\n  primaryClass  = {math.RA}\n}"
    },
    {
        "key": "clark2024",
        "title": "The NIEP is solvable by reality and finitely many polynomial inequalities",
        "authors": "Benjamin J. Clark",
        "year": 2024,
        "venue": "arXiv preprint arXiv:2407.14472 [math.RA]",
        "category": "structural",
        "categoryName": "Modern Preprints & Structure",
        "badge": "Semialgebraic NIEP",
        "badgeClass": "breakthrough",
        "doi": "",
        "arxiv": "https://arxiv.org/abs/2407.14472",
        "url": "https://arxiv.org/abs/2407.14472",
        "note": "Establishes via Tarski–Seidenberg quantifier elimination that the NIEP is solvable by spectrum conjugation invariance together with a finite union and intersection of polynomial inequalities, and that SNIEP and RNIEP form semialgebraic sets.",
        "bibtex": "@misc{Clark2024,\n  author        = {Clark, Benjamin J.},\n  title         = {The {NIEP} is solvable by reality and finitely many polynomial inequalities},\n  year          = {2024},\n  eprint        = {2407.14472},\n  archivePrefix = {arXiv},\n  primaryClass  = {math.RA}\n}"
    },
    {
        "key": "johnson2025",
        "title": "Perron similarities and the nonnegative inverse eigenvalue problem",
        "authors": "Charles R. Johnson and Pietro Paparella",
        "year": 2025,
        "venue": "Transactions of the American Mathematical Society, 378: 8361–8389",
        "category": "perron-sim",
        "categoryName": "Perron Similarities & Cones",
        "badge": "Perron Similarities",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1090/tran/9596",
        "arxiv": "https://arxiv.org/abs/2409.07682",
        "url": "https://doi.org/10.1090/tran/9596",
        "note": "Foundational theory of Perron similarities, introducing spectracones, spectratopes, and row/column cone geometry, turning NIEP verification into convex feasibility.",
        "bibtex": "@article{JohnsonPaparella2025,\n  author  = {Johnson, Charles R. and Paparella, Pietro},\n  title   = {Perron similarities and the nonnegative inverse eigenvalue problem},\n  journal = {Transactions of the American Mathematical Society},\n  volume  = {378},\n  pages   = {8361--8389},\n  year    = {2025},\n  doi     = {10.1090/tran/9596},\n  eprint  = {2409.07682},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "gershnik2026",
        "title": "Character tables are ideal Perron similarities",
        "authors": "David Z. Gershnik, Alexander J. Lewis, and Pietro Paparella",
        "year": 2026,
        "venue": "Journal of Algebra, 694: 782–800",
        "category": "perron-sim",
        "categoryName": "Perron Similarities & Cones",
        "badge": "Character Tables",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.jalgebra.2026.02.004",
        "arxiv": "https://arxiv.org/abs/2508.02830",
        "url": "https://doi.org/10.1016/j.jalgebra.2026.02.004",
        "note": "Proves that finite group character tables act as ideal Perron similarities, derives exact group-theoretic facet equations for spectracones, and computes exact cone volumes.",
        "bibtex": "@article{GershnikLewisPaparella2026,\n  author  = {Gershnik, David Z. and Lewis, Alexander J. and Paparella, Pietro},\n  title   = {Character tables are ideal {P}erron similarities},\n  journal = {Journal of Algebra},\n  volume  = {694},\n  pages   = {782--800},\n  year    = {2026},\n  doi     = {10.1016/j.jalgebra.2026.02.004},\n  eprint  = {2508.02830},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "loewy2004",
        "title": "The symmetric nonnegative inverse eigenvalue problem for 5×5 matrices",
        "authors": "Raphael Loewy and Judith J. McDonald",
        "year": 2004,
        "venue": "Linear Algebra and its Applications, 393: 275–298",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "5×5 (1,a,a,b,b) SNIEP",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1016/j.laa.2003.10.018",
        "url": "https://doi.org/10.1016/j.laa.2003.10.018",
        "note": "Establishes the hyperbolic sufficient curve 1 + 4ab >= 0 and conjectures the exact realizable boundary for 5×5 symmetric nonnegative matrices with spectrum (1, a, a, b, b).",
        "bibtex": "@article{LoewyMcDonald2004,\n  author  = {Loewy, Raphael and McDonald, Judith J.},\n  title   = {The symmetric nonnegative inverse eigenvalue problem for $5 \\times 5$ matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {393},\n  pages   = {275--298},\n  year    = {2004},\n  doi     = {10.1016/j.laa.2003.10.018}\n}"
    }
];

    // Fast Key Lookup Map
    const CITATIONS_MAP = {};
    NIEP_CITATIONS.forEach(c => {
        CITATIONS_MAP[c.key] = c;
    });
    if (CITATIONS_MAP['munger2023']) {
        CITATIONS_MAP['munger2024'] = CITATIONS_MAP['munger2023'];
    }
    if (CITATIONS_MAP['laffey2006']) {
        CITATIONS_MAP['laffey2007'] = CITATIONS_MAP['laffey2006'];
    }
    if (CITATIONS_MAP['smigoc2004']) {
        CITATIONS_MAP['monov2005'] = CITATIONS_MAP['smigoc2004'];
    }
    if (CITATIONS_MAP['boyle1993']) {
        CITATIONS_MAP['handelman1992'] = CITATIONS_MAP['boyle1993'];
    }
    if (CITATIONS_MAP['laffey2012']) {
        CITATIONS_MAP['kirkland2001'] = CITATIONS_MAP['laffey2012'];
    }

    // Determine base URL path prefix based on location
    function getBasePath() {
        if (typeof window === 'undefined' || !window.location) return '';
        const path = window.location.pathname || '';
        if (path.includes('/personal/')) return '../';
        return '';
    }

    // Show floating toast notification
    function showBibToast(msg) {
        if (typeof document === 'undefined') return;
        let toast = document.querySelector('.bib-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'bib-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 1800);
    }

    // Copy formatted BibTeX to clipboard
    function copyBibtex(key, btnElem) {
        const item = CITATIONS_MAP[key];
        if (!item || !item.bibtex) {
            showBibToast('No BibTeX record available');
            return;
        }

        const text = item.bibtex;
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                if (btnElem) {
                    const originalHTML = btnElem.innerHTML;
                    btnElem.classList.add('copied');
                    btnElem.innerHTML = '<span>&#x2714; Copied!</span>';
                    setTimeout(() => {
                        btnElem.classList.remove('copied');
                        btnElem.innerHTML = originalHTML;
                    }, 1500);
                } else {
                    showBibToast('BibTeX copied to clipboard!');
                }
            }).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        if (typeof document === 'undefined') return;
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showBibToast('BibTeX copied to clipboard!');
    }

    // Export all records as a single downloadable .bib file
    function exportAllBibtex() {
        if (typeof document === 'undefined' || typeof Blob === 'undefined') return;
        const allBib = NIEP_CITATIONS.map(c => c.bibtex).filter(Boolean).join('\n\n');
        const blob = new Blob([allBib], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'niep-literature.bib';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showBibToast('Exported ' + NIEP_CITATIONS.length + ' citations to niep-literature.bib');
    }

    // Generate HTML for a single standard citation card
    function renderBibCardHTML(entry, options = {}) {
        if (!entry) return '';
        const base = getBasePath();
        const bibUrl = `${base}bibliography.html#cite-${entry.key}`;

        // Determine wiki link based on category
        let wikiLink = '';
        if (entry.category === 'karpelevich') {
            wikiLink = `<a href="${base}karpelevich-region.html" class="bib-link" title="Read theory wiki chapter"><span>Karpelevi&#x010D; Wiki</span></a>`;
        } else if (entry.category === 'sniep') {
            wikiLink = `<a href="${base}sniep.html" class="bib-link" title="Read SNIEP theory wiki"><span>SNIEP Wiki</span></a>`;
        } else if (entry.category === 'symbolic') {
            wikiLink = `<a href="${base}boyle-handelman.html" class="bib-link" title="Read Boyle-Handelman theory wiki"><span>Boyle-Handelman</span></a>`;
        } else if (entry.category === 'perron-sim') {
            wikiLink = `<a href="${base}perron-similarities.html" class="bib-link" title="Read Perron similarities theory wiki"><span>Spectracones</span></a>`;
        }

        const paperLinks = [];
        if (entry.doi) {
            paperLinks.push(`<a href="${entry.doi}" target="_blank" rel="noopener" class="bib-link" title="Open via DOI"><span>DOI</span></a>`);
        }
        if (entry.arxiv) {
            paperLinks.push(`<a href="${entry.arxiv}" target="_blank" rel="noopener" class="bib-link" title="Open on arXiv"><span>arXiv</span></a>`);
        }
        if (!paperLinks.length && entry.url) {
            paperLinks.push(`<a href="${entry.url}" target="_blank" rel="noopener" class="bib-link" title="Open publication source"><span>Publication</span></a>`);
        }
        const paperLink = paperLinks.join('\n        ');

        const isBibPage = typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.endsWith('bibliography.html');
        const permalink = isBibPage ? '' : `<a href="${bibUrl}" class="bib-link bib-archive-link" title="View in NIEP Comprehensive Bibliography"><span>Bibliography Archive</span></a>`;

        const badgeHtml = entry.badge ? `<span class="theory-badge ${entry.badgeClass || 'foundation'}">${entry.badge}</span>` : '';

        return `
<div class="bib-card" id="cite-${entry.key}" data-key="${entry.key}" data-category="${entry.category}" data-year="${entry.year}">
    <div class="bib-header">
        <div class="bib-header-left">
            <span class="bib-year">${entry.year}</span>
            ${badgeHtml}
        </div>
        <span class="bib-key" title="Citation Key: ${entry.key}">[${entry.key}]</span>
    </div>
    <h4 class="bib-title">${entry.title}</h4>
    <p class="bib-authors">${entry.authors}</p>
    <p class="bib-venue">${entry.venue}</p>
    ${entry.note ? `<p class="bib-note">${entry.note}</p>` : ''}
    <div class="bib-actions">
        ${paperLink}
        ${wikiLink}
        ${permalink}
        <button type="button" class="bib-link bib-copy-btn" onclick="NIEP_CITATIONS_SYS.copyBibtex('${entry.key}', this)" title="Copy BibTeX citation to clipboard">
            <span>Copy BibTeX</span>
        </button>
    </div>
</div>`.trim();
    }

    // Register Web Components in browser environments
    if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined') {
        // Web Component: <cite-card key="karpelevich1951"></cite-card>
        class CiteCard extends HTMLElement {
            connectedCallback() {
                const key = this.getAttribute('key') || this.getAttribute('data-key');
                if (!key) return;
                const entry = CITATIONS_MAP[key.trim()];
                if (entry) {
                    this.innerHTML = renderBibCardHTML(entry);
                } else {
                    this.innerHTML = `<div class="bib-card error"><p class="bib-authors">Citation key not found: <code>${key}</code></p></div>`;
                }
            }
        }

        // Web Component: <cite-grid keys="kolmogorov1938, dmitriev1946, ..."></cite-grid>
        class CiteGrid extends HTMLElement {
            connectedCallback() {
                const keysAttr = this.getAttribute('keys') || this.getAttribute('data-keys');
                if (!keysAttr) return;
                const keys = keysAttr.split(',').map(k => k.trim()).filter(Boolean);
                const html = keys.map(k => {
                    const entry = CITATIONS_MAP[k];
                    return entry ? renderBibCardHTML(entry) : '';
                }).filter(Boolean).join('\n');

                this.innerHTML = `<div class="bib-grid">${html}</div>`;
            }
        }

        // Web Component: <cite-ref key="karpelevich1951"></cite-ref>
        class CiteRef extends HTMLElement {
            connectedCallback() {
                const key = (this.getAttribute('key') || this.getAttribute('data-key') || '').trim();
                const entry = CITATIONS_MAP[key];
                const base = getBasePath();
                const href = `${base}bibliography.html#cite-${key}`;

                if (entry) {
                    const firstAuthor = entry.authors.split(' and ')[0].split(',')[0].trim().replace(/^.*\s+/, '');
                    const text = this.textContent.trim() || `[${firstAuthor}, ${entry.year}]`;
                    const targetHref = `${base}bibliography.html#cite-${entry.key}`;
                    this.innerHTML = `<a href="${targetHref}" class="cite-inline-ref" title="${entry.title} (${entry.authors}, ${entry.year})">${text}</a>`;
                } else {
                    this.innerHTML = `<span>[${key}]</span>`;
                }
            }
        }

        if (!customElements.get('cite-card')) customElements.define('cite-card', CiteCard);
        if (!customElements.get('cite-grid')) customElements.define('cite-grid', CiteGrid);
        if (!customElements.get('cite-ref')) customElements.define('cite-ref', CiteRef);
    }

    // Process all container elements with [data-citations] or [data-cite-keys]
    function processStaticDataCitations() {
        if (typeof document === 'undefined') return;
        document.querySelectorAll('[data-citations], [data-cite-keys]').forEach(elem => {
            const keysAttr = elem.getAttribute('data-citations') || elem.getAttribute('data-cite-keys');
            if (!keysAttr) return;
            const keys = keysAttr.split(',').map(k => k.trim()).filter(Boolean);
            const cardsHtml = keys.map(k => {
                const entry = CITATIONS_MAP[k];
                return entry ? renderBibCardHTML(entry) : '';
            }).filter(Boolean).join('\n');

            if (elem.classList.contains('bib-grid')) {
                elem.innerHTML = cardsHtml;
            } else {
                elem.innerHTML = `<div class="bib-grid">${cardsHtml}</div>`;
            }
        });
    }

    // Comprehensive Bibliography Page Search & Filter Controller
    function initBibliographyPage() {
        if (typeof document === 'undefined') return;
        const gridElem = document.getElementById('master-bib-grid');
        if (!gridElem) return;

        const searchInput = document.getElementById('bib-search-input');
        const categoryPills = document.querySelectorAll('.bib-filter-pill');
        const countBadge = document.getElementById('bib-count-badge');
        const sortSelect = document.getElementById('bib-sort-select');

        let currentCategory = 'all';
        let currentSearch = '';
        let currentSort = 'year-desc';

        function filterAndRender() {
            let filtered = NIEP_CITATIONS.slice();

            // Category filter
            if (currentCategory !== 'all') {
                filtered = filtered.filter(item => item.category === currentCategory);
            }

            // Text search
            if (currentSearch.trim()) {
                const q = currentSearch.toLowerCase().trim();
                filtered = filtered.filter(item => {
                    return (item.title && item.title.toLowerCase().includes(q)) ||
                           (item.authors && item.authors.toLowerCase().includes(q)) ||
                           (item.venue && item.venue.toLowerCase().includes(q)) ||
                           (item.note && item.note.toLowerCase().includes(q)) ||
                           (item.key && item.key.toLowerCase().includes(q)) ||
                           (String(item.year).includes(q));
                });
            }

            // Sorting
            filtered.sort((a, b) => {
                if (currentSort === 'year-desc') return b.year - a.year;
                if (currentSort === 'year-asc') return a.year - b.year;
                if (currentSort === 'author-asc') return a.authors.localeCompare(b.authors);
                if (currentSort === 'title-asc') return a.title.localeCompare(b.title);
                return 0;
            });

            // Update Count
            if (countBadge) {
                countBadge.textContent = `Showing ${filtered.length} of ${NIEP_CITATIONS.length} publications`;
            }

            // Render Cards
            if (filtered.length === 0) {
                gridElem.innerHTML = `
                    <div class="bib-empty-state">
                        <p class="bib-empty-title">No citations match your search query.</p>
                        <p class="bib-empty-hint">Try adjusting your keywords or category filters.</p>
                    </div>`;
            } else {
                gridElem.innerHTML = filtered.map(item => renderBibCardHTML(item)).join('\n');
            }

            // Re-check target hash in URL to jump/highlight if present
            if (typeof window !== 'undefined' && window.location && window.location.hash) {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value;
                filterAndRender();
            });
        }

        categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                categoryPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentCategory = pill.getAttribute('data-category') || 'all';
                filterAndRender();
            });
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                filterAndRender();
            });
        }

        // Initial render
        filterAndRender();
    }

    // Run on DOM Content Loaded
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                processStaticDataCitations();
                initBibliographyPage();
            });
        } else {
            processStaticDataCitations();
            initBibliographyPage();
        }
    }

    // Expose Global Public API
    const api = {
        data: NIEP_CITATIONS,
        map: CITATIONS_MAP,
        renderCard: renderBibCardHTML,
        copyBibtex: copyBibtex,
        exportAllBibtex: exportAllBibtex,
        showToast: showBibToast
    };

    if (typeof window !== 'undefined') {
        window.NIEP_CITATIONS_SYS = api;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

})(typeof window !== 'undefined' ? window : this);
