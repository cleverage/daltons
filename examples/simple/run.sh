#!/bin/sh
path=`pwd`
node ../../responsive-image-sizes.js -c -u "file://${path}/page.html" -s 'img' -p 200 --verbose
