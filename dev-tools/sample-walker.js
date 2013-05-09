var walk = require('../lib/tree-walker.js');
var ast = require('../sample-angl/all-language-features.json');

walk(ast, function(node, parent, locationInParent) {
    var indentation = ((parent && parent.indentation) || 0) + 1;
    node.indentation = indentation;
    var output = '';
    for(var i = 0; i < indentation; i++) { output += ' ' };
    output += node.type + ' (' + (locationInParent || '') + ')';
    console.log(output);
});
