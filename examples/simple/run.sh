#!/bin/sh
rm ./variations.csv
path=`pwd`
node ../../responsive-image-sizes.js --contextsfile ./contexts.csv --url "file://${path}/page.html" --selector 'img' --verbose --minviewport 500 --maxviewport 510 --variationsfile ./variations.csv
