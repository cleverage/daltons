# Daltons

[![Travis build status](https://img.shields.io/travis/cleverage/daltons.svg?style=popout)](https://travis-ci.org/cleverage/daltons)
[![Known Vulnerabilities](https://snyk.io/test/github/cleverage/daltons/badge.svg?targetFile=package.json)](https://snyk.io/test/github/cleverage/daltons?targetFile=package.json)
[![License](https://img.shields.io/github/license/cleverage/daltons.svg?style=popout)](https://github.com/cleverage/daltons/blob/master/LICENSE.md)
[![GitHub stars](https://img.shields.io/github/stars/cleverage/daltons.svg?style=social)](https://github.com/cleverage/daltons/stargazers)

`daltons` is a command-line tool that computes optimal image widths to put in [`srcset`](https://html.spec.whatwg.org/multipage/embedded-content.html#attr-img-srcset) attributes of [responsive images](https://responsiveimages.org/).

## Why do we need this tool?

We want to provide the best experience to [our clients](https://www.clever-age.com/en/our-work/)’ users, so optimizing web performance is one of our main concerns.

Using responsive images in every projects, we wanted to be able to make it as efficient as possible. The main difficulty is choosing the image widths we put in `srcset` attributes, because nothing in the standard tells us about this.

## How does it work?

It takes 3 steps for `daltons` to find the best widths to put in the `srcset` attribute of a responsive image:

- take Real User Monitoring (RUM) of viewport widths and screen densities
- list the image’s widths across all of these viewport widths
- compute the optimal image widths to put in the `srcset` attribute to cover all these needs

Learn more in [the full documentation](https://cleverage.github.io/daltons/).

## Usage

To install and run this application, you’ll need [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

From your command line, install `daltons` as a global package:

```
npm i -g github:cleverage/daltons
```

Then run it with the `-h` option to get help:

```
npx daltons -h
```

Or see detailed options in [the full documentation](https://cleverage.github.io/daltons/options.html) and look at [examples and use cases](https://cleverage.github.io/daltons/#examples-and-use-cases).

## Built with

- [Node.js](https://nodejs.org/en/)
- [Puppeteer](https://developers.google.com/web/tools/puppeteer/), a Node.js library which provides a high-level API to control headless Chrome

## Authors

- [Nicolas Hoizey](https://github.com/nhoizey): Idea and initial work, maintainer
- [Yvain Liechti](https://github.com/ryuran): Early contributor, maintainer

See also the list of [contributors](https://github.com/cleverage/daltons/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Related projects

- [Sizer-Soze](https://blog.yoav.ws/who_is_sizer_soze/), developed by [Yoav Weiss](https://github.com/yoavweiss), “is a utility that enables you to evaluate how much you could save by properly resizing your images to match their display size on various viewports”.
- [imaging-heap](https://github.com/filamentgroup/imaging-heap), developed by [Zach Leatherman](https://github.com/zachleat) is “a command line tool to measure the efficiency of your responsive image markup across viewport sizes and device pixel ratios”.
