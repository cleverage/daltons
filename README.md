# Responsive Image Widths

[![Build Status](https://travis-ci.org/cleverage/responsive-image-widths.svg?branch=master)](https://travis-ci.org/cleverage/responsive-image-widths)

A command-line tool helping the choice of optimal responsive image widths to put in your `srcset` attribute(s).

Install as a global package: `npm i -g github:cleverage/responsive-image-widths#master`

Run: `npx responsive-image-widths -h`

Steps required to get the image widths list:

- Step 1: get actual contexts (viewports and screen densities) of site visitors
- Step 2: get variations of image width across viewport widths
- Step 3: compute optimal n widths from both datasets

See details in [the full documentation](https://cleverage.github.io/responsive-image-widths/)
