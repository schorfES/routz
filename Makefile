.PHONY:  validate tests build release


validate:
	./node_modules/.bin/tsc \
		--noEmit

	./node_modules/.bin/eslint . \
		--ext .js,.ts


tests:
	./node_modules/.bin/jest src \
		--coverage \
		--verbose


build:
	rm -rf dist/ && mkdir dist/

	./node_modules/.bin/tsc


release: validate tests build
