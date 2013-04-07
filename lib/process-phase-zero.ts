import types = module('./ast-types');
var globalScope = require('./global-scope');
import AnglScope = module('./angl-scope');

// Wrap the entire AST in a "file" node
export var transform = (ast:types.AstNode):types.AstNode => {
    var anglScope = new AnglScope.AnglScope();
    var globalAnglScope = globalScope.createGlobalScope();
    anglScope.setParentScope(globalAnglScope);
    return <types.AstNode>{
        type: "file",
        stmts: ast,
        globalAnglScope: globalAnglScope,
        anglScope: anglScope
    }
};
