SHELL=/bin/bash -o pipefail

default:
	node_modules/.bin/tsc --declaration --noFallthroughCasesInSwitch --noUnusedLocals --noImplicitReturns --forceConsistentCasingInFileNames --strict --target ES6 --module ES6 --moduleResolution Classic --lib DOM,ES6,DOM.Iterable,ES2016 --outDir . dom.ts tuit.ts | ansifilter | sed -E 's/^([^\(]+)\(([0-9]+),([0-9]+)\):/\1:\2:\3: /'

clean:
	-rm *.js *.d.ts tuit/*.js tuit/*.d.ts

fmt:
	node_modules/.bin/tsfmt -r dom.ts tuit.ts `find tuit -name '*.ts' ! -name '*.d.ts'`

setup:
	-mkdir -p node_modules/.bin
	npm install typescript@3.0.1 typescript-formatter@7.2.2 csstype@2.5.6
