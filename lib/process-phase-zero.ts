import types = module('./ast-types');
var globalScope = require('./global-scope');
import AnglScope = module('./angl-scope');

// Wrap the entire AST in a "file" node
// TODO fix typing of ast argument
export var transform = (ast:any):types.AstNode => {
    var anglScope = new AnglScope.AnglScope();
    var globalAnglScope = globalScope.createGlobalScope();
    anglScope.setParentScope(globalAnglScope);
    // Verify that the root node is of type "statements"
    if(ast.type !== 'statements') {
        throw new Error('Unexpected root node from Angl parser. Expected type "statements", got "' + ast.type + '".');
    }
    return <types.AstNode>{
        type: "file",
        stmts: ast.list,
        globalAnglScope: globalAnglScope,
        anglScope: anglScope
    }
};
