# Responsive Image Widths

[![Build Status](https://travis-ci.org/cleverage/responsive-image-widths.svg?branch=master)](https://travis-ci.org/cleverage/responsive-image-widths)

`responsive-image-widths` is a command-line tool that computes optimal image widths to put in [`srcset`](https://html.spec.whatwg.org/multipage/embedded-content.html#attr-img-srcset) attributes of [responsive images](https://responsiveimages.org/).

## How it works

## Usage

To install and run this application, you'll need [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

From your command line, install `responsive-image-widths` as a global package:

```
npm install -g "cleverage/responsive-image-widths#master"
```

Then run it with the `-h` option to get help:

```
npx responsive-image-widths -h
```

Or see details in [the full documentation](https://cleverage.github.io/responsive-image-widths/).

## Related projects

- [Sizer-Soze](https://blog.yoav.ws/who_is_sizer_soze/), developed by [Yoav Weiss](https://github.com/yoavweiss), "is a utility that enables you to evaluate how much you could save by properly resizing your images to match their display size on various viewports".
- [imaging-heap](https://github.com/filamentgroup/imaging-heap), developed by [Zach Leatherman](https://github.com/zachleat) is "a command line tool to measure the efficiency of your responsive image markup across viewport sizes and device pixel ratios".

## Built With

* [Node.js](https://nodejs.org/en/)
* [Puppeteer](https://developers.google.com/web/tools/puppeteer/), a Node.js library which provides a high-level API to control headless Chrome

## Authors

* **[Nicolas Hoizey](https://github.com/nhoizey)**: *Idea and initial work*
* **[Yvain Liechti](https://github.com/ryuran)**: *Initial work*

See also the list of [contributors](https://github.com/cleverage/responsive-image-widths/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
