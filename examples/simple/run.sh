#!/bin/sh
path=`pwd`
node ../../src/cli.js --contexts-file ./contexts.csv --url "file://${path}/page.html" --selector 'img' --verbose
