import types = module('./ast-types');

// Wrap the entire AST in a "file" node
export var transform = (ast:types.AstNode):types.AstNode => {
    return <types.AstNode>{
        type: "file",
        stmts: ast
    }
};
