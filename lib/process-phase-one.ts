/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>

// AST transformation phase one

import treeWalker = module('./tree-walker');
import scope = module('./angl-scope');
import astTypes = module('./ast-types');
import astUtils = module('./ast-utils');
import scopeVariable = module('./Variable');
var _ = require('lodash');
var walk = treeWalker.walk;

// Create scopes for all nodes

export var transform = (ast:astTypes.AstNode) => {
    // TODO fix the typing on node.  I don't know how to access arbitrary properties of an object implementing an interface.
    walk(ast, (node:any, parent:astTypes.AstNode, locationInParent) => {

        var replacement:any[];

        // TODO convert all scriptdefs into consts
        // Will be a good test of replacing nodes

        // Script definitions register an identifier into the parent scope
        if(node.type === 'scriptdef' || node.type === 'const') {
            if(node.parentNode.type !== 'file') {
                throw new Error(node.type + ' must be at the root level of a file.');
            }
            var globalVar = new scopeVariable.Variable(node.name, 'PROP_ASSIGNMENT', 'PROP_ACCESS');
            globalVar.setContainingObjectIdentifier('anglGlobals');
            astUtils.getGlobalAnglScope(node).addVariable(globalVar);
        }

        // Const definitions register an identifier into the parent scope

        // Scripts create a new scope
        if(node.type === 'script' || node.type === 'scriptdef') {
            var newScope = new scope.AnglScope();
            newScope.setParentScope(astUtils.getAnglScope(node));
            node.anglScope = newScope;
            // Register script arguments into the local scope
            // TODO how to handle self and other?
            var thisVar = new scopeVariable.Variable('self', 'ARGUMENT');
            thisVar.setJsIdentifier('this');
            newScope.addVariable(thisVar);
            var otherVar = new scopeVariable.Variable('other', 'ARGUMENT');
            newScope.addVariable(otherVar);
            _.each(node.args, (argName) => {
                var argumentVar = new scopeVariable.Variable(argName, 'ARGUMENT');
                newScope.addVariable(argumentVar);
            });
        }

        // Var declarations register local variables into their scope
        if(node.type === 'var') {
            replacement = [];
            _.each(node.list, (var_item) => {
                if(astUtils.getAnglScope(node).hasIdentifier(var_item.name)) {
                    throw new Error('Attempt to declare local variable with the name ' + JSON.stringify(var_item.name) + ' more than once.');
                }
                var localVar = new scopeVariable.Variable(var_item.name);
                astUtils.getAnglScope(node).addVariable(localVar);
                if(var_item.expr) {
                    replacement.push({
                        type: 'assign',
                        lval: {
                            type: 'identifier',
                            variable: localVar
                        },
                        rval: var_item.expr
                    });
                }
            });
            return replacement;
        }

    });
}