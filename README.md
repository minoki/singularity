Singularity
===========

[Singularity](https://miz-ar.info/math/singularity/) is a web page that demonstrates how complex integrals work.

## How to build

### Required tools

- [TypeScript](http://www.typescriptlang.org/) 2.2 or later
    - The code is written in TypeScript.
- [Google Closure Compiler](https://developers.google.com/closure/compiler/)
    - Used to minify the JavaScript source code.
- [bower](http://bower.io/)
    - Needed to fetch [RxJS](https://github.com/Reactive-Extensions/RxJS/) and [es6-shim](https://github.com/paulmillr/es6-shim/).
- GNU Make
    - The included Makefile is written for GNU Make.
- [xsltproc](http://www.xmlsoft.org/)
    - Used to strip whitespaces from `index.xhtml.in`.
- [Zopfli](https://github.com/google/zopfli/) or Gzip
    - Needed to generate the gzipped version of the files, which can be served as `Content-Encoding: gzip`.

Some of the required tools can be installed by `npm`:

```bash
$ npm install -g typescript google-closure-compiler bower tsd
```

### Dependencies

Fetch the dependencies by:

```bash
$ bower update
```

### Build and install

Compile the source code by:

```bash
$ make -j
```

Install the files to the destination location by:

```bash
$ make install dest=/home/foo/public_html/singularity
```

## License

This software is released under the MIT license.
See LICENSE.txt.
