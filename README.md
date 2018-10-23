# Responsive Image Widths

[![Build Status](https://travis-ci.org/cleverage/responsive-image-widths.svg?branch=master)](https://travis-ci.org/cleverage/responsive-image-widths)

`responsive-image-widths` is a command-line tool that computes optimal image widths to put in [`srcset`](https://html.spec.whatwg.org/multipage/embedded-content.html#attr-img-srcset) attributes of [responsive images](https://responsiveimages.org/).

## Why do we need this tool?

We want to provide the best experience to [our clients](https://www.clever-age.com/en/our-work/)' users, so optimizing web performance is one of our main concerns.

Using responsive images in every projects, we wanted to be able to make it as efficient as possible. The main difficulty is choosing the image widths we put in `srcset` attributes, because nothing in the standard tells us about this.

## How does it work?

It takes 3 steps for `responsive-image-widths` to find the best widths to put in the `srcset` attribute of a responsive image:

- take Real User Monitoring (RUM) of viewport widths and screen densities
- list the image’s widths across all of these viewport widths
- compute the optimal image widths to put in the `srcset` attribute to cover all these needs

Learn more in [the full documentation](https://cleverage.github.io/responsive-image-widths/).

## Usage

To install and run this application, you’ll need [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

From your command line, install `responsive-image-widths` as a global package:

```
npm install -g "cleverage/responsive-image-widths#master"
```

Then run it with the `-h` option to get help:

```
npx responsive-image-widths -h
```

Or see detailed options in [the full documentation](https://cleverage.github.io/responsive-image-widths/options.html) and look at [examples and use cases](https://cleverage.github.io/responsive-image-widths/#examples-and-use-cases).

## Built with

- [Node.js](https://nodejs.org/en/)
- [Puppeteer](https://developers.google.com/web/tools/puppeteer/), a Node.js library which provides a high-level API to control headless Chrome

## Authors

- [Nicolas Hoizey](https://github.com/nhoizey): Idea and initial work, maintainer
- [Yvain Liechti](https://github.com/ryuran): Early contributor, maintainer

See also the list of [contributors](https://github.com/cleverage/responsive-image-widths/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
