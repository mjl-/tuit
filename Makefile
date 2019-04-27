SHELL=/bin/bash -o pipefail

default:
	node_modules/.bin/tsc | sed -E 's/^([^\(]+)\(([0-9]+),([0-9]+)\):/\1:\2:\3: /'

clean:
	-rm *.js *.d.ts tuit/*.js tuit/*.d.ts

fmt:
	node_modules/.bin/tsfmt -r

docs:
	# needs npm install typedoc
	./node_modules/.bin/typedoc --out docs --mode file --excludePrivate --excludeProtected --target ES6

setup:
	-mkdir -p node_modules/.bin
	npm install typescript@3.4.5 typescript-formatter@7.2.2 csstype@2.6.4
