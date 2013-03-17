var jade = require('jade');
var stylus = require('stylus');
var _ = require('lodash');
require('shelljs/global');

var input, output;

// create output directories
mkdir('-p', 'out/demo/vendor');

// render demo html
input = cat('demo/index.jade');
output = jade.compile(input)();
output.to('out/demo/index.html');

// render demo css
input = cat('demo/style.styl');
stylus(input).render(function(err, output) {
    if(err) throw err;
    output.to('out/demo/style.css');
});

// copy third-party scripts
cp('-f', 'demo/vendor/*', 'out/demo/vendor/');
cp('-f', 'node_modules/lodash/dist/lodash.min.js', 'out/demo/vendor/lodash.min.js');

// copy angl AST-generator to demo
wrapForBrowser(cat('node_modules/angl/out/angl.js')).to('out/demo/vendor/angl.js');
wrapForBrowser(cat('node_modules/angl/out/parser.js')).to('out/demo/vendor/parser.js');

// copy compiler to demo
wrapForBrowser(cat('lib/main.js')).to('out/demo/main.js');

////
// UTILITY FUNCTIONS
////

function wrapForBrowser(input) {
    return ';(function(module, exports){\n' + input + '\n})(window.module, window.module.exports);';
}
