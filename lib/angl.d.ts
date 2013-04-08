declare module 'angl/out/angl' {

    import types = module('./ast-types');

    export function parse(input:string):types.AstNode;
    export function printAST(input:string):void;
}