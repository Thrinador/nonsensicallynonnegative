---
title: "Matrix Polynomial Analysis"
collection: projects
date: 2022-03-17
permalink: /projects/2022-03-17-matrix-polynomial-analysis
tags:
- Rust
- Optimization
- Thread pools
repourl: 'https://github.com/Thrinador/matrix_polynomial_analysis'
---

The goal of the project was to get a picture of what the space of polynomials that preserve the nonnegativity of matrices of a given size looks like.

This is being done as a followup investigation into the research I did on polynomials that preserve nonnegative matrices.

The main process is to generate a set of polynomials, then try and minimize their coefficients. Since there is no know test to see if a polynomial preserves nonnegative matrices after a minimization action is preformed the polynomial must be tested against a large set of matrices. This led to several performance optimization problems including thread pools, generating a large amount of random numbers, and race conditions.

I did this project in rust because it is a very performant language and as a way of learning the language better.

[Link to Github repo]('https://github.com/Thrinador/matrix_polynomial_analysis')