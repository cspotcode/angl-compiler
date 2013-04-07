/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>

var nodeChildren = require('./ast-node-children');
var _ = require('lodash');
import types = module('./ast-types');

export interface WalkerFunction {
    (node:types.AstNode, parentNode:types.AstNode, locationInParent:string):any;
}

// Walks an AST, calling fn for each node
// fn(node, parent, locationInParent)
// TODO allow fn to specify that a node should be re-processed via return value?
// If fn returns:
//   an object, that object will replace the node in the tree
//   null, node will be removed from the tree
//   false, children will *not* be visited
export function walk(rootNode:types.AstNode, fn:WalkerFunction) {
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
        var ret;
        if(_.isArray(child)) {
            _.each(child, function(child, i) {
                ret = fn(child, node, childName + '.' + i);
                ret === false || _walk(child, fn);
            });
        } else {
            ret = fn(child, node, childName);
            ret === false || _walk(child, fn);
        }
    });
}

