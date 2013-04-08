/// <reference path="angl.d.ts"/>

import angl = module('angl/out/angl');
import types = module('./ast-types');
import allTransformations = module('./run-all-transformations');
var main = require('./main');

export function compile(anglSourceCode:string):string {
    // Parse the angl source code into an AST
    var ast = angl.parse(anglSourceCode);
    return compileAst(ast);
}

export function compileAst(anglAst:types.AstNode):string {
    anglAst = allTransformations.runAllTransformations(anglAst);
    var jsSource = main(anglAst);
    return jsSource;
}
