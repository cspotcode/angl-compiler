var ast = require('../sample-asts/sample')
var compile = require('../index')

console.dir(ast)
console.log(compile(ast))