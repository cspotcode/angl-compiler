var _ = require('lodash')

var initializeBuffer = function() {
    buffer = []
    bufferPush = _.bind(buffer.push, buffer)
}

// TODO properly translate all binops and unops:
//   ones that GML has that JS doesn't have
//   ones with different behavior that need to be implemented differently
//   DIV, MOD, ^^, bitwise ops
//   how does GML do type coercion (42 + "hello world")?  Do I need to emulate that behavior?
var generateExpression = function(astNode) {
    switch(astNode.type) {
        case 'identifier':
            bufferPush(astNode.val)
            // TODO will this every need to be enclosed in parentheses?
            // How should I be handling this in the general case?
            break
        case 'binop':
            bufferPush('(')
            generateExpression(astNode.exp1)
            bufferPush(' ' + astNode.op + ' ')
            generateExpression(astNode.exp2)
            bufferPush(')')
            break
        case 'unop':
            bufferPush('(')
            bufferPush(astNode.op)
            generateExpression(astNode.exp1)
            bufferPush(')')
            break
        case 'number':
            bufferPush('(')
            bufferPush(astNode.val.toString())
            // TODO does toString always produce valid Javascript that will create the exact same number?
            bufferPush(')')
            break
        case 'string':
            bufferPush('(')
            bufferPush(JSON.stringify(astNode.val))
            // TODO this fails in a select few corner cases.  Use something better,
            // perhaps stolen from the Jade source code
            bufferPush(')')
            break
        default:
            throw new Error('Unknown expression type: "' + astNode.type + '"')
    }
}

var generateStatement = function(astNode) {
    switch(astNode.type) {
        case 'var':
            bufferPush('var ')
            bufferPush.apply(astNode.list.join(', '))
            bufferPush(';\n')
            break
        case 'set':
            generateExpression(astNode.lval)
            bufferPush(' = ')
            generateExpression(astNode.rval)
            bufferPush(';\n')
            break
        default:
            throw new Error('Unknown statement type: "' + astNode.type + '"')
    }
}

var generateCodeFromRootNode = function(astNode) {
    switch(astNode.type) {
        case 'statements':
            _.each(astNode.list, generateStatement)
            break
        default:
            throw new Error('Unknown root node type: "' + astNode.type + '"')

    }
}

var compile = module.exports = function(ast) {
    initializeBuffer()
    generateCodeFromRootNode(ast)
    return _.flatten(buffer).join('')
}