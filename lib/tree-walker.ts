/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>

var nodeChildren = require('./ast-node-children');
var _ = require('lodash');
import types = module('./ast-types');

export interface WalkerFunction {
    (node:types.AstNode, parentNode:types.AstNode, locationInParent:string):any;
}

var setNodeParent = (node:types.AstNode, parent:types.AstNode) => {
    node.parentNode = parent;
}


// Walks an AST, calling fn for each node
// fn(node, parent, locationInParent)
// TODO allow fn to specify that a node should be re-processed via return value?
// If fn returns:
//   an object or array or objects, that object or array will replace the node in the tree
//   null, node will be removed from the tree
//   false, children will *not* be visited
export function walk(rootNode:types.AstNode, fn:WalkerFunction) {
    setNodeParent(rootNode, null);
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
            // Loop over an array of children
            var i
              , children = child
              ;
            for(i = 0; i < children.length; i++) {
                var child = children[i];
                setNodeParent(child, node);
                ret = fn(child, node, childName + '.' + i);
                // Null means the node must be removed (replaced with nothing)
                if(ret === null) ret = [];
                // Object means node must be replaced by the object
                if(_.isObject(ret) && !_.isArray(ret)) ret = [ret];
                // Array means node must be replaced by the array of node objects
                if(_.isArray(ret)) {
                    var args = [i, 1].concat(ret);
                    children.splice.apply(children, args);
                    // Since this node has been replaced, we should immediately revisit it.
                    i--;
                    continue;
                }
                ret === false || _walk(child, fn);
            }
        } else if(child !== undefined) { // skip nodes that aren't present on the parent (e.g. if the child is optional)
            // Keep visiting the child node until it is *not* replaced.
            // If it *is* replaced, we want to immediately visit the replacement node by looping.
            while(true) {
                setNodeParent(child, node);
                ret = fn(child, node, childName);
                if(ret === null) {
                    // null means node should be removed from the tree, but we can't do that unless the node is in a list
                    // (e.g. array of statements)
                    throw new Error('Cannot remove child node from parent type "' + node.type + '" at position "' + childName + '"');
                }
                if(_.isArray(ret)) {
                    // We cannot replace with node with an array of nodes
                    throw new Error('Cannot replace child node with multiple nodes, from parent type "' + node.type + '" at position "' + childName + '"');
                }
                if(_.isObject(ret)) {
                    // Replace node with returned object
                    child = ret;
                    node[childName] = child;
                    // immediately revisit the new child
                    continue;
                }
                ret === false || _walk(child, fn);
                break;
            }
        }
    });
}

