var nodeChildren = require('./ast-node-children');
var _ = require('lodash');

// Walks an AST, calling fn for each node
// fn(node, parent, locationInParent
// TODO allow fn to specify that a node should be re-processed via return value?
function walk(rootNode, fn) {
    // visit this node
    fn(rootNode, null, null);
    // visit children
    _walk(rootNode, fn);
}

// Visit all children of a node
function _walk(node, fn) {
    var type = node.type;
    var children = nodeChildren[type];
    _.each(children, function(childName) {
        var child = node[childName];
        if(_.isArray(child)) {
            _.each(child, function(child, i) {
                fn(child, node, childName + '.' + i);
            });
        } else {
            fn(child, node, childName);
        }
    });
}
