/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>

import treeWalker = module('./tree-walker');
import scope = module('./angl-scope');
import astTypes = module('./ast-types');
import astUtils = module('./ast-utils');
var walk = treeWalker.walk;

// Assign concrete identifier names to all unnamed Javascript variables
export var transform = (ast:astTypes.AstNode) => {
    walk(ast, (node:astTypes.AstNode, parent:astTypes.AstNode, locationInParent:string) => {
        astUtils.getAnglScope(node).assignJsIdentifiers();
    });
}
