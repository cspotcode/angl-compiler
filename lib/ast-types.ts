import scope = module('./angl-scope');

export interface AstNode {
    parentNode?: AstNode;
    type: string;
    anglScope?: scope.AnglScope;
    globalAnglScope?: scope.AnglScope;
}

