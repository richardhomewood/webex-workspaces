#!/usr/bin/env sh
cp doc/package-readme.txt _site/
cp src/content-for.html-head _site/
(cd _site; zip -9 -r ../webex-workspaces-site-$(date +%Y-%m-%d).zip content/ workspaces/explore.html content-for.html-head package-readme.txt)
