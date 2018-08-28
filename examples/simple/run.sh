#!/bin/sh
path=`pwd`
node ../../responsive-image-sizes.js --contextsfile ./contexts.csv --url "file://${path}/page.html" --selector 'img' --verbose
