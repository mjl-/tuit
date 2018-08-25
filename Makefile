SHELL=/bin/bash -o pipefail

default:
	node_modules/.bin/tsc --declaration --noFallthroughCasesInSwitch --noUnusedLocals --noImplicitReturns --forceConsistentCasingInFileNames --strict --target ES6 --module ES6 --moduleResolution Classic --lib DOM,ES6,DOM.Iterable,ES2016 --outDir . domgen.ts twit.ts | ansifilter | sed -E 's/^([^\(]+)\(([0-9]+),([0-9]+)\):/\1:\2:\3: /'

clean:
	-rm *.js *.d.ts

fmt:
	node_modules/.bin/tsfmt -r domgen.ts twit.ts

setup:
	-mkdir -p node_modules/.bin
	npm install typescript@3.0.1 typescript-formatter@7.2.2
