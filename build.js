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

require('./run-requirejs-optimizer');

