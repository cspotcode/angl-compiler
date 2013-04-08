/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>

// AST transformation phase one

import treeWalker = module('./tree-walker');
import scope = module('./angl-scope');
import astTypes = module('./ast-types');
var _ = require('lodash');
var walk = treeWalker.walk;

// Create scopes for all nodes

export var transform = (ast:astTypes.AstNode) => {
    // TODO fix the typing on node.  I don't know how to access arbitrary properties of an object implementing an interface.
    walk(ast, (node:any, parent:astTypes.AstNode, locationInParent) => {
        node.parentNode = parent;
        if(parent) {
            node.globalAnglScope = parent.globalAnglScope;
            node.anglScope = parent.anglScope;
        }

        // TODO convert all scriptdefs into consts
        // Will be a good test of replacing nodes

        // Script definitions register an identifier into the parent scope
        if(node.type === 'scriptdef' || node.type === 'const') {
            if(node.parentNode.type !== 'file') {
                throw new Error(node.type + ' must be at the root level of a file.');
            }
            node.anglScope.addIdentifier(node.name, node.type);
        }

        // Const definitions register an identifier into the parent scope

        // Scripts create a new scope
        if(node.type === 'script' || node.type === 'scriptdef') {
            var newScope = new scope.AnglScope();
            newScope.setParentScope(node.anglScope);
            node.anglScope = newScope;
            // Register script arguments into the local scope
            // TODO how to handle self and other?
            _.each(node.args, (argName) => {
                newScope.addIdentifier(argName, 'argument');
            });
        }

        // Var declarations register local variables into their scope
        if(node.type === 'var_item') {
            if(node.anglScope.hasIdentifier(node.name)) {
                throw new Error('Attempt to declare local variable with the name ' + JSON.stringify(node.name) + ' more than once.');
            }
            node.anglScope.addIdentifier(node.name, 'localvar');
        }

    });
}