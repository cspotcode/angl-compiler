import astTypes = module('./ast-types');
import anglScope = module('./angl-scope');

// "Cleans" an AST node in preparation for moving it in the AST tree.
// The tree walker will take care of re-assigning the necessary properties based on the node's new tree position.
export var cleanNode = (astNode:astTypes.AstNode) => {
    astNode.parentNode = null;
    return astNode;
}

export var getAnglScope = (astNode:astTypes.AstNode):anglScope.AnglScope => {
    while(!astNode.anglScope) astNode = astNode.parentNode;
    return astNode.anglScope;
}

export var getGlobalAnglScope = (astNode:astTypes.AstNode):anglScope.AnglScope => {
    while(!astNode.globalAnglScope) astNode = astNode.parentNode;
    return astNode.globalAnglScope;
}
