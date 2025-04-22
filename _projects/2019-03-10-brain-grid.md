---
title: "Brain Grid"
collection: projects
date: 2019-03-10
permalink: /projects/2019-03-10-brain-grid
tags:
- C++
- Cuda
- Optimization
repourl: 'https://github.com/UWB-Biocomputing/BrainGrid'
---

BrainGrid is an open-source spiking neural network simulator that is intended to aid scientists and researchers by providing pre-built code that can be easily modified to fit different models.

Worked on optimizing the performance of the Cuda code through profiling different aspects of the kernel.

Found and fixed a bug that reduced the number of memory allocations from 6 million to 10 thousand.

Tuned the micro kernels and reduced the branching paths to give a 2 times speed up.

[Link to Github repo]('https://github.com/UWB-Biocomputing/BrainGrid')