# Singularity Makefile

mainjs= index.min.js
maints= index.ts
tsfiles= \
 index.ts \
 ts/Complex.ts \
 ts/Curve.ts \
 ts/Integrate.ts \
 ts/ComplexPlaneView.ts \
 ts/ComplexIntegralView.ts \
 ts/AnalyticFunction.ts \
 bower_components/rxjs/ts/rx.d.ts
 bower_components/rxjs/ts/rx.d.ts \
 typings/es6-shim/es6-shim.d.ts

tscflags= --noImplicitAny --removeComments -t ES5 --noEmitOnError

inkscape= $(shell which inkscape || which /Applications/Inkscape.app/Contents/Resources/bin/inkscape)
closure-compiler= $(shell which closure-compiler || which closure)
gzip= $(shell which zopfli || echo gzip -9 -k)

icon-sizes= 56x56 76x76 120x120 128x128 152x152 196x196 512x512

srcfiles= \
 index.xhtml \
 style.css \
 $(mainjs) \
 bower_components/rxjs/dist/rx.js \
 bower_components/rxjs/dist/rx.min.js \
 bower_components/es6-shim/es6-shim.js \
 bower_components/es6-shim/es6-shim.min.js \
 bower_components/es6-shim/es6-shim.map
files= $(srcfiles) \
 index.xhtml.gz \
 $(mainjs).gz \
 bower_components/rxjs/dist/rx.js.gz \
 bower_components/rxjs/dist/rx.min.js.gz

name= singularity
dest= /Library/WebServer/Documents/webapp/$(name)

all: $(files)

install: $(files)
	for f in $(files); do \
	    mkdir -p $(dest)/`dirname $$f`; \
	    install -m 0644 -p $$f $(dest)/$$f; \
	done

cache.manifest: $(srcfiles)
	@echo "Writing $@..."
	@echo "CACHE MANIFEST" > $@
	@echo "# Date:$(shell LANG=C date)" >> $@
	@for f in $(srcfiles); do \
	    echo $$f >> $@; \
	done

index.xhtml: index.xhtml.in strip-space.xsl
	xsltproc --encoding UTF-8 -o $@ strip-space.xsl $<

index.js: $(tsfiles)
	tsc --out $@ $(tscflags) $(maints)

serve: all
	lighttpd -D -f lighttpd.conf

watch:
	tsc --watch --out index.js $(tscflags) $(maints)

index.min.js index.js.map: index.js
	$(closure-compiler) --language_in ECMASCRIPT5_STRICT --create_source_map index.js.map --js_output_file $@ --js $<
	@echo "//# sourceMappingURL=index.js.map" >> $@

$(filter bower_components/%,$(files) $(tsfiles)):
	bower update

$(filter typings/%,$(tsfiles)):
	tsd update

%.gz: %
	$(gzip) $<

.PHONY: all install serve watch
