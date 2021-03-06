# Singularity Makefile

maints= main.ts

# TypeScript sources
tsfiles= \
 main.ts \
 ts/AffineTransform.ts \
 ts/AnalyticFunction.ts \
 ts/Complex.ts \
 ts/ComplexIntegralView.ts \
 ts/ComplexPlaneView.ts \
 ts/Curve.ts \
 ts/Diff.ts \
 ts/Integrate.ts \
 ts/UIUtil/line.ts \
 ts/UIUtil/pointer.ts \
 ts/UIUtil/requestAnimationFrame.ts \
 bower_components/rxjs/ts/rx.d.ts

# Generated files
files= \
 index.xhtml \
 style.css \
 main.js \
 dynmml.js \
 bower_components/rxjs/dist/rx.js \
 bower_components/rxjs/dist/rx.min.js \
 bower_components/rxjs/dist/rx.map \
 bower_components/es6-shim/es6-shim.js \
 bower_components/es6-shim/es6-shim.min.js \
 bower_components/es6-shim/es6-shim.map

# Files that will be installed (including gzipped version of the files)
installfiles= $(files) \
 main.min.js \
 main.js.map \
 dynmml.min.js \
 dynmml.js.map \
 main.min.js.gz \
 main.js.map.gz \
 dynmml.min.js.gz \
 dynmml.js.map.gz \
 $(patsubst %,%.gz,$(filter %.js %.xhtml %.css %.map,$(files)))

# Compiler options
tscflags= --noImplicitAny --strictNullChecks --noImplicitThis --removeComments -t ES5 --noEmitOnError --lib dom,es5,es2015.core,es2015.collection

# Google Closure Compiler must be installed...
# - via npm (globally): `npm install -g google-closure-compiler`
# - via npm (locally): `npm install google-closure-compiler`
# - as `closure-compiler` command (e.g. Homebrew)
# - as `closure` command (e.g. Arch Linux)
# Alternatively, you can provide `closure-compiler-jar` variable with the path to `compiler.jar`.
closure-compiler-jar-candidates= \
 /usr/local/lib/node_modules/google-closure-compiler/compiler.jar \
 ~/node_modules/google-closure-compiler/compiler.jar
closure-compiler-jar= $(shell $(foreach jar,$(closure-compiler-jar-candidates),(test -f $(jar) && echo $(jar)) ||) echo compiler.jar)
closure-compiler= $(shell \
 (test -f $(closure-compiler-jar) && echo java -jar $(closure-compiler-jar)) \
 || which closure-compiler \
 || which closure)

# Gzip compression command:
# Zopfli (https://github.com/google/zopfli) or plain gzip
gzip= $(shell which zopfli || echo gzip -9 -k)

xsltproc= xsltproc

name= singularity
dest= /Library/WebServer/Documents/webapp/$(name)

all: $(files)

install: $(patsubst index.xhtml%,index.release.xhtml%,$(installfiles))
# index.xhtml: install the optimized version
	mkdir -p $(dest)
	install -m 0644 -p index.release.xhtml $(dest)/index.xhtml
	install -m 0644 -p index.release.xhtml.gz $(dest)/index.xhtml.gz
# Regular files: install the file as is
	for f in $(filter-out index.xhtml%,$(installfiles)); do \
	    mkdir -p $(dest)/`dirname $$f`; \
	    install -m 0644 -p $$f $(dest)/$$f; \
	done

index.xhtml: index.xhtml.in strip-space.xsl
	$(xsltproc) --encoding UTF-8 -o $@ strip-space.xsl $<

index.release.xhtml: index.xhtml release.xsl
	$(xsltproc) --encoding UTF-8 -o $@ release.xsl $<

main.js: $(tsfiles)
	tsc --out $@ $(tscflags) $(maints)

dynmml.js: dynmml.ts
	tsc --out $@ $(tscflags) $<

watch:
	tsc --watch --out main.js $(tscflags) $(maints)

main.min.js main.js.map: main.js
	$(closure-compiler) --language_in ECMASCRIPT5_STRICT --create_source_map main.js.map --js_output_file $@ --js $<
	@echo "//# sourceMappingURL=main.js.map" >> $@

dynmml.min.js dynmml.js.map: dynmml.js
	$(closure-compiler) --language_in ECMASCRIPT5_STRICT --create_source_map dynmml.js.map --js_output_file $@ --js $<
	@echo "//# sourceMappingURL=dynmml.js.map" >> $@

$(filter bower_components/%,$(files) $(tsfiles)):
	bower update

%.gz: %
	$(gzip) $<

.PHONY: all install serve watch
