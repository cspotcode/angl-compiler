/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>
var _ = require('lodash');
import types = module('./ast-types');

var transformers = [
    require('./process-phase-zero').transform,
    require('./process-phase-one').transform
];

export var runAllTransformations = (ast:types.AstNode):types.AstNode => {
    return _.reduce(transformers, (ast:types.AstNode, transformer) => ( transformer(ast) || ast ), ast);
};