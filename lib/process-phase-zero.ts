import types = module('./ast-types');
var globalScope = require('./global-scope');
import AnglScope = module('./angl-scope');

// Create global and file scopes
// TODO fix typing of ast argument
export var transform = (ast:any):types.AstNode => {
    var anglScope = new AnglScope.AnglScope();
    var globalAnglScope = globalScope.createGlobalScope();
    anglScope.setParentScope(globalAnglScope);
    // Verify that the root node is of type "statements"
    if(ast.type !== 'file') {
        throw new Error('Unexpected root node from Angl parser. Expected type "file", got "' + ast.type + '".');
    }
    ast.anglScope = anglScope;
    ast.globalScope = globalAnglScope;
    return ast;
};
