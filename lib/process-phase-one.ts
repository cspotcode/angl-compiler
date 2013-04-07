/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>

// AST transformation phase one

var walk = require('./tree-walker');
import scope = module('./angl-scope');
import astTypes = module('./ast-types');

// Create scopes for all nodes

export var transform = (ast:astTypes.AstNode) => {
    walk(ast, (node:astTypes.AstNode, parent:astTypes.AstNode, locationInParent) => {
        node.parentNode = parent;
        node.globalAnglScope = parent.globalAnglScope;
        node.anglScope = parent.anglScope;

        // Scripts create a new scope
        if(node.type === 'script' || node.type === 'scriptdef') {
            node.anglScope = new scope.AnglScope();
        }
    });
}