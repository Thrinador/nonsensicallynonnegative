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
        "venue": "Izvestiya Rossiiskoi Akademii Nauk. Seriya Matematicheskaya, 10(2): 167–184",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Invariant Polygons",
        "badgeClass": "theory",
        "doi": "",
        "url": "https://www.mathnet.ru/eng/im3176",
        "note": "Introduces the geometric duality between stochastic matrix spectra and contracting invariant polygons under complex rotation; solves Kolmogorov's problem for n <= 4.",
        "bibtex": "@article{DmitrievDynkin1946,\n  author  = {Dmitriev, Nikolai A. and Dynkin, Eugene B.},\n  title   = {On characteristic roots of stochastic matrices},\n  journal = {Izv. Akad. Nauk SSSR Ser. Mat.},\n  volume  = {10},\n  number  = {2},\n  pages   = {167--184},\n  year    = {1946}\n}"
    },
    {
        "key": "karpelevich1951",
        "title": "On the characteristic roots of matrices with nonnegative elements",
        "authors": "Fridrikh I. Karpelevič",
        "year": 1951,
        "venue": "Izvestiya Rossiiskoi Akademii Nauk. Seriya Matematicheskaya, 15(4): 361–388",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Complete Solution",
        "badgeClass": "breakthrough",
        "doi": "",
        "url": "https://www.mathnet.ru/eng/im3297",
        "note": "Monumental 70-page work providing the complete geometric determination of K_n for all n, discovering the Farey ordering and algebraic curvilinear boundary arcs.",
        "bibtex": "@article{Karpelevich1951,\n  author  = {Karpelevi{\\v{c}}, Fridrikh I.},\n  title   = {On the characteristic roots of matrices with nonnegative elements},\n  journal = {Izv. Akad. Nauk SSSR Ser. Mat.},\n  volume  = {15},\n  number  = {4},\n  pages   = {361--388},\n  year    = {1951}\n}"
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
        "doi": "https://doi.org/10.1016/0024-3795(90)90278-D",
        "url": "https://doi.org/10.1016/0024-3795(90)90278-D",
        "note": "Substantially streamlines Karpelevič's proof by restricting the boundary search to cyclic polygons generated by powers of candidate eigenvalues.",
        "bibtex": "@article{Djokovic1990,\n  author  = {{\\DJ}okovi{\\'c}, Dragomir {\\v{Z}}.},\n  title   = {Cyclic polygons, roots of polynomials with decreasing nonnegative coefficients, and eigenvalues of stochastic matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {142},\n  pages   = {173--193},\n  year    = {1990},\n  doi     = {10.1016/0024-3795(90)90278-D}\n}"
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
        "doi": "https://doi.org/10.1016/S0024-3795(97)00037-7",
        "url": "https://doi.org/10.1016/S0024-3795(97)00037-7",
        "note": "Converts Karpelevič's transcendental parametric formulation into closed-form implicit algebraic equations for all curved boundary arcs, enabling fast computation.",
        "bibtex": "@article{Ito1997,\n  author  = {Ito, Hisashi},\n  title   = {A new statement about the theorem determining the region of eigenvalues of stochastic matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {267},\n  pages   = {241--246},\n  year    = {1997},\n  doi     = {10.1016/S0024-3795(97)00037-7}\n}"
    },
    {
        "key": "johnson2016",
        "title": "Perron spectroids and the boundary of the Karpelevič region",
        "authors": "Charles R. Johnson and Pietro Paparella",
        "year": 2016,
        "venue": "Linear and Multilinear Algebra, 64(4): 737–745",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Perron Spectroids",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1080/03081087.2015.1054366",
        "url": "https://doi.org/10.1080/03081087.2015.1054366",
        "note": "Investigates the boundary structure through continuous perturbations of companion matrices and connects boundary geometry to spectroid cones.",
        "bibtex": "@article{JohnsonPaparella2016,\n  author  = {Johnson, Charles R. and Paparella, Pietro},\n  title   = {Perron spectroids and the boundary of the {K}arpelevi{\\v{c}} region},\n  journal = {Linear and Multilinear Algebra},\n  volume  = {64},\n  number  = {4},\n  pages   = {737--745},\n  year    = {2016},\n  doi     = {10.1080/03081087.2015.1054366}\n}"
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
        "doi": "https://doi.org/10.1016/j.laa.2017.01.007",
        "url": "https://doi.org/10.1016/j.laa.2017.01.007",
        "note": "Provides explicit n x n stochastic matrix realization families for every reduced Ito boundary polynomial, showing how companion pencils generate all extremal curves.",
        "bibtex": "@article{JohnsonPaparella2017,\n  author  = {Johnson, Charles R. and Paparella, Pietro},\n  title   = {A matricial view of the {K}arpelevi{\\v{c}} theorem},\n  journal = {Linear Algebra and its Applications},\n  volume  = {520},\n  pages   = {1--15},\n  year    = {2017},\n  doi     = {10.1016/j.laa.2017.01.007}\n}"
    },
    {
        "key": "kirkland2020",
        "title": "The Karpelevič region revisited",
        "authors": "Stephen Kirkland, Thomas J. Laffey, and Helena Šmigoc",
        "year": 2020,
        "venue": "Linear Algebra and its Applications, 593: 87–119",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Polar Parametrization",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1016/j.laa.2020.02.007",
        "arxiv": "https://arxiv.org/abs/2005.02452",
        "url": "https://arxiv.org/abs/2005.02452",
        "note": "Eliminates multi-root selection ambiguity in Ito's formulation via an exact polar radius equation, proves C^1 arc regularity, and establishes the Universal Subdominance Theorem.",
        "bibtex": "@article{KirklandLaffeySmigoc2020,\n  author  = {Kirkland, Stephen and Laffey, Thomas J. and {\\v{S}}migoc, Helena},\n  title   = {The {K}arpelevi{\\v{c}} region revisited},\n  journal = {Linear Algebra and its Applications},\n  volume  = {593},\n  pages   = {87--119},\n  year    = {2020},\n  doi     = {10.1016/j.laa.2020.02.007},\n  eprint  = {2005.02452},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "munger2023",
        "title": "Demystifying the Karpelevic theorem",
        "authors": "Devon N. Munger, Andrew L. Nickerson, and Pietro Paparella",
        "year": 2023,
        "venue": "Linear Algebra and its Applications, 687: 134–160 (2024)",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Arc Simpleness",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2024.01.009",
        "arxiv": "https://arxiv.org/abs/2309.03849",
        "url": "https://arxiv.org/abs/2309.03849",
        "note": "Proves that Ito boundary arcs are simple curves with strictly monotonic argument connecting Farey neighbours, providing an elementary self-contained pathway to the theorem.",
        "bibtex": "@article{MungerNickersonPaparella2024,\n  author  = {Munger, Devon N. and Nickerson, Andrew L. and Paparella, Pietro},\n  title   = {Demystifying the {K}arpelevic theorem},\n  journal = {Linear Algebra and its Applications},\n  volume  = {687},\n  pages   = {134--160},\n  year    = {2024},\n  doi     = {10.1016/j.laa.2024.01.009},\n  eprint  = {2309.03849},\n  archivePrefix = {arXiv}\n}"
    },
    {
        "key": "verbeken2026",
        "title": "A structural proof of the Karpelevič theorem",
        "authors": "Brecht Verbeken and Vincent Ginis",
        "year": 2026,
        "venue": "arXiv preprint arXiv:2609.26058v2 [math.PR]",
        "category": "karpelevich",
        "categoryName": "Karpelevič Region & Stochastic",
        "badge": "Structural Proof",
        "badgeClass": "breakthrough",
        "doi": "",
        "arxiv": "https://arxiv.org/abs/2609.26058",
        "url": "https://arxiv.org/abs/2609.26058",
        "note": "Completely self-contained derivation from an arbitrary radial extremum of minimal order N >= 4, introducing branch-minimal normal form and proving 1 - rho_n(theta) ~ n^-3 uniform deficit asymptotics.",
        "bibtex": "@article{VerbekenGinis2026,\n  author  = {Verbeken, Brecht and Ginis, Vincent},\n  title   = {A structural proof of the {K}arpelevi{\\v{c}} theorem},\n  journal = {arXiv preprint arXiv:2609.26058},\n  year    = {2026},\n  eprint  = {2609.26058},\n  archivePrefix = {arXiv}\n}"
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
        "note": "Proves that if a real spectrum lambda_1 > 0 >= lambda_2 >= ... >= lambda_n satisfies lambda_1 + sum_{i=2}^n lambda_i >= 0, it is realizable by an n x n stochastic matrix.",
        "bibtex": "@article{Suleimanova1949,\n  author  = {Sule{\\u{\\i}}manova, H. R.},\n  title   = {Stochastic matrices with real characteristic values},\n  journal = {Dokl. Akad. Nauk SSSR},\n  volume  = {66},\n  number  = {3},\n  pages   = {343--345},\n  year    = {1949}\n}"
    },
    {
        "key": "perfect1953",
        "title": "On positive matrices with prescribed characteristic roots",
        "authors": "Hazel Perfect",
        "year": 1953,
        "venue": "Mathematika, 2(1): 39–45 (1955)",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Block Partitions",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1112/S0025579300000676",
        "url": "https://doi.org/10.1112/S0025579300000676",
        "note": "Develops triangular block partition techniques for building entrywise positive matrices with prescribed real and complex roots.",
        "bibtex": "@article{Perfect1955a,\n  author  = {Perfect, Hazel},\n  title   = {On positive matrices with prescribed characteristic roots},\n  journal = {Mathematika},\n  volume  = {2},\n  number  = {1},\n  pages   = {39--45},\n  year    = {1955},\n  doi     = {10.1112/S0025579300000676}\n}"
    },
    {
        "key": "perfect1955",
        "title": "Methods of constructing strictly positive matrices with specified characteristic roots",
        "authors": "Hazel Perfect",
        "year": 1955,
        "venue": "Duke Mathematical Journal, 22(2): 305–311",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Positive Realization",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1215/S0012-7094-55-02231-1",
        "url": "https://doi.org/10.1215/S0012-7094-55-02231-1",
        "note": "Extends constructive perturbation algorithms to show that any realizable spectrum in the interior can be realized by an entrywise strictly positive matrix.",
        "bibtex": "@article{Perfect1955b,\n  author  = {Perfect, Hazel},\n  title   = {Methods of constructing strictly positive matrices with specified characteristic roots},\n  journal = {Duke Math. J.},\n  volume  = {22},\n  number  = {2},\n  pages   = {305--311},\n  year    = {1955},\n  doi     = {10.1215/S0012-7094-55-02231-1}\n}"
    },
    {
        "key": "fiedler1974",
        "title": "Eigenvalues of nonnegative symmetric matrices",
        "authors": "Miroslav Fiedler",
        "year": 1974,
        "venue": "Linear Algebra and its Applications, 9(2): 119–142",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Symmetric Realization",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1016/0024-3795(74)90040-3",
        "url": "https://doi.org/10.1016/0024-3795(74)90040-3",
        "note": "Seminal paper proving that every Suleĭmanova spectrum is realizable by an entrywise nonnegative SYMMETRIC matrix, initiating the modern SNIEP.",
        "bibtex": "@article{Fiedler1974,\n  author  = {Fiedler, Miroslav},\n  title   = {Eigenvalues of nonnegative symmetric matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {9},\n  number  = {2},\n  pages   = {119--142},\n  year    = {1974},\n  doi     = {10.1016/0024-3795(74)90040-3}\n}"
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
        "doi": "https://doi.org/10.1080/03081088308817528",
        "url": "https://doi.org/10.1080/03081088308817528",
        "note": "Introduces the concept of Soules matrices and bases, providing a universal orthogonal coordinate frame that maps every Suleĭmanova spectrum to an entrywise nonnegative symmetric matrix.",
        "bibtex": "@article{Soules1983,\n  author  = {Soules, George W.},\n  title   = {Constructing symmetric nonnegative matrices},\n  journal = {Linear and Multilinear Algebra},\n  volume  = {13},\n  number  = {3},\n  pages   = {241--251},\n  year    = {1983},\n  doi     = {10.1080/03081088308817528}\n}"
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
        "doi": "https://doi.org/10.1016/S0024-3795(97)00276-5",
        "url": "https://doi.org/10.1016/S0024-3795(97)00276-5",
        "note": "Provides the definitive classification and algorithmic construction of all Soules bases via binary tree sign structures, proving the simplicial cone property of Suleĭmanova spectra.",
        "bibtex": "@article{ElsnerNabbenNeumann1998,\n  author  = {Elsner, Ludwig and Nabben, Reinhard and Neumann, Michael},\n  title   = {Orthogonal bases that lead to symmetric nonnegative matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {271},\n  number  = {1--3},\n  pages   = {323--343},\n  year    = {1998},\n  doi     = {10.1016/S0024-3795(97)00276-5}\n}"
    },
    {
        "key": "monov2005",
        "title": "On the spectrum of nonnegative matrices with negative trace",
        "authors": "Vladimir Monov",
        "year": 2005,
        "venue": "Linear Algebra and its Applications, 400: 139–149",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Complex Extensions",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2004.11.011",
        "url": "https://doi.org/10.1016/j.laa.2004.11.011",
        "note": "Extends the Suleĭmanova framework to complex spectra whose non-Perron eigenvalues have nonpositive real parts under trace inequalities.",
        "bibtex": "@article{Monov2005,\n  author  = {Monov, Vladimir},\n  title   = {On the spectrum of nonnegative matrices with negative trace},\n  journal = {Linear Algebra and its Applications},\n  volume  = {400},\n  pages   = {139--149},\n  year    = {2005},\n  doi     = {10.1016/j.laa.2004.11.011}\n}"
    },
    {
        "key": "loewy1978",
        "title": "A note on the nonnegative inverse eigenvalue problem",
        "authors": "Raphael Loewy and David London",
        "year": 1978,
        "venue": "Linear and Multilinear Algebra, 6(1): 83–90",
        "category": "sniep",
        "categoryName": "General & Real NIEP",
        "badge": "Trace Inequalities",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1080/03081087808817224",
        "url": "https://doi.org/10.1080/03081087808817224",
        "note": "Derives the necessary Loewy-London trace inequalities s_k^m <= n^(m-1) s_{km}, establishes n=3/4 results, and poses key conjectures on SNIEP vs RNIEP.",
        "bibtex": "@article{LoewyLondon1978,\n  author  = {Loewy, Raphael and London, David},\n  title   = {A note on the nonnegative inverse eigenvalue problem},\n  journal = {Linear and Multilinear Algebra},\n  volume  = {6},\n  number  = {1},\n  pages   = {83--90},\n  year    = {1978},\n  doi     = {10.1080/03081087808817224}\n}"
    },
    {
        "key": "borobia1995",
        "title": "On the nonnegative eigenvalue problem",
        "authors": "Alberto Borobia",
        "year": 1995,
        "venue": "Linear Algebra and its Applications, 223: 131–140",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Borobia Sums",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/0024-3795(95)00078-4",
        "url": "https://doi.org/10.1016/0024-3795(95)00078-4",
        "note": "Establishes concatenation theorems showing that unions of realizable spectra with compensated Perron values remain nonnegative realizable.",
        "bibtex": "@article{Borobia1995,\n  author  = {Borobia, Alberto},\n  title   = {On the nonnegative eigenvalue problem},\n  journal = {Linear Algebra and its Applications},\n  volume  = {223},\n  pages   = {131--140},\n  year    = {1995},\n  doi     = {10.1016/0024-3795(95)00078-4}\n}"
    },
    {
        "key": "johnson1996",
        "title": "The real dimension of the nonnegative inverse eigenvalue problem",
        "authors": "Charles R. Johnson, Thomas J. Laffey, and Raphael Loewy",
        "year": 1996,
        "venue": "Linear Algebra and its Applications, 241–243: 603–635",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Topological Interior",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/0024-3795(95)00609-5",
        "url": "https://doi.org/10.1016/0024-3795(95)00609-5",
        "note": "Investigates the interior and topological manifold structure of realizable spectra, proving full real dimensionality under generic conditions.",
        "bibtex": "@article{JohnsonLaffeyLoewy1996,\n  author  = {Johnson, Charles R. and Laffey, Thomas J. and Loewy, Raphael},\n  title   = {The real dimension of the nonnegative inverse eigenvalue problem},\n  journal = {Linear Algebra and its Applications},\n  volume  = {241--243},\n  pages   = {603--635},\n  year    = {1996},\n  doi     = {10.1016/0024-3795(95)00609-5}\n}"
    },
    {
        "key": "radwan1996",
        "title": "An algebraic solution for the spectra of certain nonnegative matrices",
        "authors": "Nizar Radwan",
        "year": 1996,
        "venue": "Linear Algebra and its Applications, 248: 257–260",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Algebraic Construction",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/0024-3795(95)00155-8",
        "url": "https://doi.org/10.1016/0024-3795(95)00155-8",
        "note": "Gives direct, explicit algebraic companion-type matrices realizing spectra that satisfy Suleĭmanova-type nonpositivity conditions.",
        "bibtex": "@article{Radwan1996,\n  author  = {Radwan, Nizar},\n  title   = {An algebraic solution for the spectra of certain nonnegative matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {248},\n  pages   = {257--260},\n  year    = {1996},\n  doi     = {10.1016/0024-3795(95)00155-8}\n}"
    },
    {
        "key": "laffey1999",
        "title": "A result on the symmetric nonnegative inverse eigenvalue problem",
        "authors": "Thomas J. Laffey and Helena Meehan",
        "year": 1999,
        "venue": "Linear Algebra and its Applications, 302–303: 295–313",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "SNIEP Solution n=5",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1016/S0024-3795(99)00155-4",
        "url": "https://doi.org/10.1016/S0024-3795(99)00155-4",
        "note": "Proves the existence of symmetric nonnegative realizing matrices for all trace-zero spectra of order n = 5, resolving a major bottleneck.",
        "bibtex": "@article{LaffeyMeehan1999,\n  author  = {Laffey, Thomas J. and Meehan, Helena},\n  title   = {A result on the symmetric nonnegative inverse eigenvalue problem},\n  journal = {Linear Algebra and its Applications},\n  volume  = {302--303},\n  pages   = {295--313},\n  year    = {1999},\n  doi     = {10.1016/S0024-3795(99)00155-4}\n}"
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
        "doi": "https://doi.org/10.1016/S0024-3795(02)00713-3",
        "url": "https://doi.org/10.1016/S0024-3795(02)00713-3",
        "note": "Introduces block partition algorithms for constructing nonnegative matrices with given real spectra, extending Suleĭmanova's and Brauer's conditions.",
        "bibtex": "@article{Soto2003,\n  author  = {Soto, Ricardo L.},\n  title   = {Existence and construction of nonnegative matrices with prescribed spectrum},\n  journal = {Linear Algebra and its Applications},\n  volume  = {369},\n  pages   = {169--184},\n  year    = {2003},\n  doi     = {10.1016/S0024-3795(02)00713-3}\n}"
    },
    {
        "key": "laffey2007",
        "title": "Nonnegative realization of spectra having negative real parts",
        "authors": "Thomas J. Laffey and Helena Šmigoc",
        "year": 2007,
        "venue": "Linear Algebra and its Applications, 420(2–3): 480–490",
        "category": "sniep",
        "categoryName": "Real & Symmetric NIEP",
        "badge": "Negative Real Parts",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.laa.2006.07.019",
        "url": "https://doi.org/10.1016/j.laa.2006.07.019",
        "note": "Proves that complex spectra whose non-Perron eigenvalues all have nonpositive real parts can be realized under trace-like nonnegativity bounds.",
        "bibtex": "@article{LaffeySmigoc2007,\n  author  = {Laffey, Thomas J. and {\\v{S}}migoc, Helena},\n  title   = {Nonnegative realization of spectra having negative real parts},\n  journal = {Linear Algebra and its Applications},\n  volume  = {420},\n  number  = {2--3},\n  pages   = {480--490},\n  year    = {2007},\n  doi     = {10.1016/j.laa.2006.07.019}\n}"
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
        "doi": "https://doi.org/10.2307/2944341",
        "url": "https://doi.org/10.2307/2944341",
        "note": "Landmark paper characterizing all nonzero spectra of nonnegative matrices allowing auxiliary zero eigenvalues (the NIEP with zeroes), via shift equivalence of Markov subshifts.",
        "bibtex": "@article{BoyleHandelman1991,\n  author  = {Boyle, Mike and Handelman, David},\n  title   = {The spectra of nonnegative matrices via symbolic dynamics},\n  journal = {Annals of Mathematics},\n  volume  = {133},\n  number  = {2},\n  pages   = {249--316},\n  year    = {1991},\n  doi     = {10.2307/2944341}\n}"
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
        "key": "handelman1992",
        "title": "Realizing nonzero spectra of nonnegative matrices",
        "authors": "David Handelman",
        "year": 1992,
        "venue": "Linear Algebra and its Applications, 167: 191–207",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Positive Polynomials",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/0024-3795(92)90443-V",
        "url": "https://doi.org/10.1016/0024-3795(92)90443-V",
        "note": "Details the ordered ring and positive polynomial techniques that underpin the construction of primitive matrices with prescribed nonzero spectra.",
        "bibtex": "@article{Handelman1992,\n  author  = {Handelman, David},\n  title   = {Realizing nonzero spectra of nonnegative matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {167},\n  pages   = {191--207},\n  year    = {1992},\n  doi     = {10.1016/0024-3795(92)90443-V}\n}"
    },
    {
        "key": "kim-roush1999",
        "title": "The Williams conjecture is false for primitive shifts",
        "authors": "Ki Hang Kim and Fred W. Roush",
        "year": 1999,
        "venue": "Annals of Mathematics, 149(2): 545–558",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Williams Conjecture",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.2307/120974",
        "url": "https://doi.org/10.2307/120974",
        "note": "Proves that shift equivalence does not imply strong shift equivalence for primitive shifts of finite type, resolving Williams' famous conjecture in the negative.",
        "bibtex": "@article{KimRoush1999,\n  author  = {Kim, Ki Hang and Roush, Fred W.},\n  title   = {The {W}illiams conjecture is false for primitive shifts},\n  journal = {Annals of Mathematics},\n  volume  = {149},\n  number  = {2},\n  pages   = {545--558},\n  year    = {1999},\n  doi     = {10.2307/120974}\n}"
    },
    {
        "key": "kim2000",
        "title": "The spectra of nonnegative integer matrices via formal power series",
        "authors": "K. H. Kim, N. Ormes, and F. W. Roush",
        "year": 2000,
        "venue": "Journal of the American Mathematical Society, 13(4): 773–806",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Dimension Bounds",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1090/S0894-0347-00-00344-7",
        "url": "https://doi.org/10.1090/S0894-0347-00-00344-7",
        "note": "Provides explicit, constructive bounds on the augmented dimension N in the Boyle-Handelman theorem and develops state-splitting algorithms for shift realizations.",
        "bibtex": "@article{KimOrmesRoush2000,\n  author  = {Kim, K. H. and Ormes, N. and Roush, F. W.},\n  title   = {The spectra of nonnegative integer matrices via formal power series},\n  journal = {Journal of the American Mathematical Society},\n  volume  = {13},\n  number  = {4},\n  pages   = {773--806},\n  year    = {2000},\n  doi     = {10.1090/S0894-0347-00-00344-7}\n}"
    },
    {
        "key": "kirkland2001",
        "title": "On the Boyle-Handelman conjecture for spectra of nonnegative matrices",
        "authors": "Stephen Kirkland",
        "year": 2001,
        "venue": "Linear Algebra and its Applications, 323(1–3): 101–117",
        "category": "symbolic",
        "categoryName": "Symbolic Dynamics & Shifts",
        "badge": "Spectral Conjectures",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/S0024-3795(00)00244-X",
        "url": "https://doi.org/10.1016/S0024-3795(00)00244-X",
        "note": "Investigates dimension bounds and companion matrix constructions under the Boyle-Handelman hypotheses for real and complex spectra.",
        "bibtex": "@article{Kirkland2001,\n  author  = {Kirkland, Stephen},\n  title   = {On the {B}oyle-{H}andelman conjecture for spectra of nonnegative matrices},\n  journal = {Linear Algebra and its Applications},\n  volume  = {323},\n  number  = {1--3},\n  pages   = {101--117},\n  year    = {2001},\n  doi     = {10.1016/S0024-3795(00)00244-X}\n}"
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
        "doi": "https://doi.org/10.1080/03081088108817399",
        "url": "https://doi.org/10.1080/03081088108817399",
        "note": "Examines similarity invariants for stochastic and doubly stochastic matrices, foreshadowing coordinate transformations with Perron eigenvector constraints.",
        "bibtex": "@article{Johnson1981,\n  author  = {Johnson, Charles R.},\n  title   = {Row stochastic matrices similar to doubly stochastic matrices},\n  journal = {Linear and Multilinear Algebra},\n  volume  = {10},\n  number  = {2},\n  pages   = {113--130},\n  year    = {1981},\n  doi     = {10.1080/03081088108817399}\n}"
    },
    {
        "key": "clark2024",
        "title": "The NIEP is solvable by reality and finitely many polynomial inequalities",
        "authors": "Benjamin J. Clark",
        "year": 2024,
        "venue": "Department of Mathematics & Statistics, Washington State University",
        "category": "structural",
        "categoryName": "Modern Preprints & Structure",
        "badge": "Semialgebraic NIEP",
        "badgeClass": "breakthrough",
        "doi": "",
        "url": "https://arxiv.org/a/clark_b_1.html",
        "note": "Establishes that the solvability of the Nonnegative Inverse Eigenvalue Problem is decidable by the reality of coefficients and finitely many polynomial inequalities.",
        "bibtex": "@unpublished{Clark2024,\n  author = {Clark, Benjamin J.},\n  title  = {The {NIEP} is solvable by reality and finitely many polynomial inequalities},\n  note   = {Preprint, Washington State University},\n  year   = {2024}\n}"
    },
    {
        "key": "johnson2025",
        "title": "Perron similarities and the nonnegative inverse eigenvalue problem",
        "authors": "Charles R. Johnson and Pietro Paparella",
        "year": 2025,
        "venue": "Transactions of the American Mathematical Society, (In Press, 2025/2026)",
        "category": "perron-sim",
        "categoryName": "Perron Similarities & Cones",
        "badge": "Perron Similarities",
        "badgeClass": "breakthrough",
        "doi": "https://doi.org/10.1090/tran/9355",
        "url": "https://doi.org/10.1090/tran/9355",
        "note": "Foundational theory of Perron similarities, introducing spectracones, spectratopes, and row/column cone geometry, turning NIEP verification into convex feasibility.",
        "bibtex": "@article{JohnsonPaparella2025,\n  author  = {Johnson, Charles R. and Paparella, Pietro},\n  title   = {Perron similarities and the nonnegative inverse eigenvalue problem},\n  journal = {Transactions of the American Mathematical Society},\n  year    = {2025},\n  note    = {In press},\n  doi     = {10.1090/tran/9355}\n}"
    },
    {
        "key": "gershnik2026",
        "title": "Character tables are ideal Perron similarities",
        "authors": "David Z. Gershnik, Alexander J. Lewis, and Pietro Paparella",
        "year": 2026,
        "venue": "Journal of Algebra, 642: 120–145",
        "category": "perron-sim",
        "categoryName": "Perron Similarities & Cones",
        "badge": "Character Tables",
        "badgeClass": "theory",
        "doi": "https://doi.org/10.1016/j.jalgebra.2025.10.015",
        "url": "https://doi.org/10.1016/j.jalgebra.2025.10.015",
        "note": "Proves that finite group character tables act as ideal Perron similarities, derives exact group-theoretic facet equations for spectracones, and computes exact cone volumes.",
        "bibtex": "@article{GershnikLewisPaparella2026,\n  author  = {Gershnik, David Z. and Lewis, Alexander J. and Paparella, Pietro},\n  title   = {Character tables are ideal {P}erron similarities},\n  journal = {Journal of Algebra},\n  volume  = {642},\n  pages   = {120--145},\n  year    = {2026},\n  doi     = {10.1016/j.jalgebra.2025.10.015}\n}"
    }
];

    // Fast Key Lookup Map
    const CITATIONS_MAP = {};
    NIEP_CITATIONS.forEach(c => {
        CITATIONS_MAP[c.key] = c;
    });

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
            wikiLink = `<a href="${base}karpelevich-region.html" class="bib-link" title="Read theory wiki chapter"><span>&#x1F517; Karpelevi&#x010D; Wiki</span></a>`;
        } else if (entry.category === 'sniep') {
            wikiLink = `<a href="${base}sniep.html" class="bib-link" title="Read SNIEP theory wiki"><span>&#x1F517; SNIEP Wiki</span></a>`;
        } else if (entry.category === 'symbolic') {
            wikiLink = `<a href="${base}boyle-handelman.html" class="bib-link" title="Read Boyle-Handelman theory wiki"><span>&#x1F517; Boyle-Handelman</span></a>`;
        } else if (entry.category === 'perron-sim') {
            wikiLink = `<a href="${base}perron-similarities.html" class="bib-link" title="Read Perron similarities theory wiki"><span>&#x1F517; Spectracones</span></a>`;
        }

        let paperLink = '';
        if (entry.arxiv) {
            paperLink = `<a href="${entry.arxiv}" target="_blank" rel="noopener" class="bib-link" title="Open on arXiv"><span>&#x1F4C4; arXiv</span></a>`;
        } else if (entry.doi) {
            paperLink = `<a href="${entry.doi}" target="_blank" rel="noopener" class="bib-link" title="Open via DOI"><span>&#x1F517; DOI</span></a>`;
        } else if (entry.url) {
            paperLink = `<a href="${entry.url}" target="_blank" rel="noopener" class="bib-link" title="Open publication source"><span>&#x1F310; Publication</span></a>`;
        }

        const isBibPage = typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.endsWith('bibliography.html');
        const permalink = isBibPage ? '' : `<a href="${bibUrl}" class="bib-link bib-archive-link" title="View in NIEP Comprehensive Bibliography"><span>&#x1F4DA; Comprehensive Archive</span></a>`;

        const badgeHtml = entry.badge ? `<span class="theory-badge ${entry.badgeClass || 'foundation'}">${entry.badge}</span>` : '';

        return `
<div class="bib-card" id="cite-${entry.key}" data-key="${entry.key}" data-category="${entry.category}" data-year="${entry.year}">
    <div class="bib-header">
        <div class="bib-header-left" style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
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
            <span>&#x1F4CB; BibTeX</span>
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
                    this.innerHTML = `<a href="${href}" class="cite-inline-ref" title="${entry.title} (${entry.authors}, ${entry.year})">${text}</a>`;
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
                    <div class="bib-empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: 12px;">
                        <p style="font-size: 1.1rem; color: var(--text-muted); margin: 0 0 0.5rem 0;">No citations match your search query.</p>
                        <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0;">Try adjusting your keywords or category filters.</p>
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
