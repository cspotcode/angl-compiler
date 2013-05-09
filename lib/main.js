var _ = require('lodash');
var astUtils = require('./ast-utils');
var strings = require('./strings');

var buffer
  , print
  , indentationLevel
  ;

var initializeCompiler = function() {
    buffer = [];
    print = _.bind(buffer.push, buffer);
    indentationLevel = 0;
};

var indent = function() {
    indentationLevel++;
};

var outdent = function() {
    indentationLevel--;
    if(indentationLevel < 0) {
        throw new Error('Tried to outdent too far.');
    }
};

var printIndent = function() {
    // TODO create customizable indentation level
    // TODO make this faster?
    _.times(indentationLevel, function() {
        print('    ');
    });
};

// TODO properly translate all binops and unops:
//   ones that GML has that JS doesn't have
//   ones with different behavior that need to be implemented differently
//   DIV, MOD, ^^, bitwise ops
//   how does GML do type coercion (42 + "hello world")?  Do I need to emulate that behavior?
var generateExpression = function(astNode, omitIndentation) {
    switch(astNode.type) {

        case 'identifier':
            var variable = astNode.variable;
            if(variable) {
                if(variable.getAccessType() === 'PROP_ACCESS') {
                    print(variable.getContainingObjectIdentifier() + '.');
                }
                print(variable.getJsIdentifier());
            } else {
                print(astNode.name);
            }
            // TODO will this ever need to be enclosed in parentheses?
            // How should I be handling this in the general case?
            break;

        case 'binop':
            print('(');
            // special-case the dot operator
            if(astNode.op === '.') {
                print(strings.ANGL_RUNTIME_IDENTIFIER + '.resolveObjectBeforeDot(');
                generateExpression(astNode.expr1);
                print(').');
                generateExpression(astNode.expr2);
            } else { // all other operators
                generateExpression(astNode.expr1);
                print(' ' + astNode.op + ' ');
                generateExpression(astNode.expr2);
            }
            print(')');
            break;

        case 'unop':
            print('(');
            print(astNode.op);
            generateExpression(astNode.expr);
            print(')');
            break;

        case 'number':
            print('(');
            print(astNode.val.toString());
            // TODO does toString always produce valid Javascript that will create the exact same number?
            print(')');
            break;

        case 'string':
            print('(');
            print(JSON.stringify(astNode.val));
            // TODO this fails in a select few corner cases.  Use something better,
            // perhaps stolen from the Jade source code
            print(')');
            break;

        case 'index':
            // TODO this needs a lot of work
            // What do we do when index values aren't numbers?  Aren't integers?
            // What about when the array isn't initialized or the target isn't an array?
            print('(');
            generateExpression(astNode.expr);
            print(')');
            _.each(astNode.indexes, function (index) {
                print('[');
                generateExpression(index);
                print(']');
            });
            break;

        case 'funccall':
            print('(');
            generateExpression(astNode.expr);
            print(')');
            if(astNode.isMethodCall) {
                // Method calls: `self`/`this` is automatically set to the object to which the method belongs
                // `other` should be set to the local `self` value
                print('(');
                generateExpression({
                    type: 'identifier',
                    variable: astUtils.getAnglScope(astNode).getVariableByIdentifierInChain('self')
                });
            } else {
                // Function calls: Function's `self` and `other` are the local `self` and `other` values
                print('.call(');
                generateExpression({
                    type: 'identifier',
                    variable: astUtils.getAnglScope(astNode).getVariableByIdentifierInChain('self')
                });
                print(', ');
                generateExpression({
                    type: 'identifier',
                    variable: astUtils.getAnglScope(astNode).getVariableByIdentifierInChain('other')
                })
            }
            _.each(astNode.args, function(arg, i, args) {
                print(', ');
                generateExpression(arg);
            });
            print(')');
            break;

        case 'script':
            print('function(');
            print(['other'].concat(astNode.args).join(', '));
            print(') {\n');
            indent();
            generateLocalVariableAllocation(astNode);
            // TODO this part of the AST doesn't seem quite right, suggesting there are
            // possibilities I'm not aware of.
            // These sanity checks will reject anything unexpected.
            /*if(!(_.isObject(astNode.stmts) && _(_.keys(astNode.stmts).sort()).isEqual(['list', 'type']) && astNode.stmts.type === 'statements' && _.isArray(astNode.stmts.list))) {
             throw new Error('Failed sanity checks on stmts!')
             }
             _.each(astNode.stmts.list, generateStatement)*/
            generateStatement(astNode.stmts);
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        default:
            throw new Error('Unknown expression type: "' + astNode.type + '"');
    }
};

var generateStatement = function(astNode, omitTerminator, omitIndentation) {
    if(arguments.length < 2) omitTerminator = false;
    switch(astNode.type) {

        case 'var':
            omitIndentation || printIndent();
            print('var ');
            _.each(astNode.list, function (varNode, i, args) {
                print (varNode.name);
                if (varNode.hasOwnProperty('expr')) {
                    print (' = ');
                    generateExpression(varNode.expr);
                }
                if(i < args.length - 1) {
                    print(', ');
                }
            });
            break;

        case 'assign':
            omitIndentation || printIndent();
            generateExpression(astNode.lval);
            print(' = ');
            generateExpression(astNode.rval);
            break;

        case 'scriptdef':
            omitIndentation || printIndent();
            print(strings.ANGL_GLOBALS_IDENTIFIER + '.' + astNode.name);
            print(' = function(');
            print(['other'].concat(astNode.args).join(', '));
            print(') {\n');
            indent();
            generateLocalVariableAllocation(astNode);
            // TODO this part of the AST doesn't seem quite right, suggesting there are
            // possibilities I'm not aware of.
            // These sanity checks will reject anything unexpected.
            /*if(!(_.isObject(astNode.stmts) && _(_.keys(astNode.stmts).sort()).isEqual(['list', 'type']) && astNode.stmts.type === 'statements' && _.isArray(astNode.stmts.list))) {
                throw new Error('Failed sanity checks on stmts!')
            }
            _.each(astNode.stmts.list, generateStatement)*/
            generateStatement(astNode.stmts);
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        case 'const':
            omitIndentation || printIndent();
            print(strings.ANGL_GLOBALS_IDENTIFIER + '.' + astNode.name);
            print(' = ');
            generateExpression(astNode.expr);
            break;

        case 'switch':
            omitIndentation || printIndent();
            print('switch(');
            generateExpression(astNode.expr);
            print(') {\n');
            indent();
            _.each(astNode.cases, function(caseNode) {
                generateCase(caseNode);
            });
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        case 'for':
            omitIndentation || printIndent();
            print('for(');
            generateStatement(astNode.initstmt, true, true);
            print('; ');
            generateExpression(astNode.contexpr);
            print('; ');
            generateStatement(astNode.stepstmt, true, true);
            print(') {\n');
            indent();
            // TODO I bet there are some scoping issues I'm not dealing with correctly.
            generateStatement(astNode.stmt);
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        case 'cmpassign':
            // Rewrite the cmpassign into a simpler binop and assign combo.
            // E.g. a += 1 becomes a = a + 1
            // TODO this will produce somewhat uglier code.  Maybe pretty it up later.
            // TODO what if the lval contains a function call?  Will it execute twice?
            generateStatement({
                type: 'assign',
                lval: astNode.lval,
                rval: {
                    type: 'binop',
                    op: astNode.op,
                    expr1: astNode.lval,
                    expr2: astNode.rval
                }
            }, omitTerminator, omitIndentation);
            break;

        case 'ifelse':
            omitIndentation || printIndent();
            print('if(');
            generateExpression(astNode.expr);
            print(') {\n');
            indent();
            generateStatement(astNode.stmt1);
            outdent();
            omitIndentation || printIndent();
            print('} else {\n');
            indent();
            generateStatement(astNode.stmt2);
            outdent();
            omitIndentation || printIndent();
            print('}');
            break;

        case 'if':
            // This is a special case of ifelse where the else block is empty.
            generateStatement({
                type: 'ifelse',
                expr: astNode.expr,
                stmt1: astNode.stmt,
                stmt2: {type: 'nop'}
            }, omitTerminator, omitIndentation);
            break;

        case 'while':
            omitIndentation || printIndent();
            print('while(');
            generateExpression(astNode.expr);
            print(') {\n');
            indent();
            generateStatement(astNode.stmt);
            outdent();
            printIndent();
            print('}');
            break;

        case 'dountil':
            omitIndentation || printIndent();
            print('do {\n');
            indent();
            generateStatement(astNode.stmt);
            outdent();
            omitIndentation || printIndent();
            print('} while(!(');
            generateExpression(astNode.expr);
            print('))');
            break;

        case 'break':
            omitIndentation || printIndent();
            print('break');
            // TODO are break semantics ever different in Angl than they are in JS?
            break;

        case 'continue':
            omitIndentation || printIndent();
            print('continue');
            // TODO are continue semantics ever different in Angl than they are in JS?
            break;

        case 'statements':
            _.each(astNode.list, function(statement) {
                generateStatement(statement);
            });
            break;

        case 'funccall':
            // Delegate to the expression generator
            omitIndentation || printIndent();
            generateExpression(astNode);
            break;

        case 'with':
            // TODO I DONT WANNA IMPLEMENT THIS WAAAAAH
            // Also it requires some sort of runtime that can find all instances of
            // a given object type to iterate over.
            // For now, I'm emitting a comment that explains code has been omitted.
            omitIndentation || printIndent();
            print('/* with(){} block has been omitted.  Not implemented yet.*/');
            break;

        case 'return':
            // TODO is there ever a situation where a Javascript 'return' won't do what we want?
            // For example, inside a _.each() iterator function
            omitIndentation || printIndent();
            print('return (');
            generateExpression(astNode.expr);
            print(')');
            break;

        case 'exit':
            // TODO same caveats as 'return'
            omitIndentation || printIndent();
            print('return');
            break;

        case 'nop':
            // No-ops don't do anything.  I'm assuming they never trigger any behavior by
            // "seperating" adjacent statements.
            break;

        default:
            throw new Error('Unknown statement type: "' + astNode.type + '"');
    }
    // Statements are terminated by a semicolon and a newline
    // except for a few exceptions.
    // Also, in certain contexts we want to omit this termination
    // (e.g., initializer statement of a for loop)
    if(!_.contains(['nop', 'statements'], astNode.type) && !omitTerminator) {
        print(';\n');
    }
};

var generateCase = function(astNode) {
    switch(astNode.type) {

        case 'case':
            printIndent();
            print('case (');
            generateExpression(astNode.expr);
            print('):\n');
            indent();
            generateStatement(astNode.stmts);
            outdent();
            break;

        case 'defaultcase':
            printIndent();
            print('default:\n');
            indent();
            generateStatement(astNode.stmts);
            outdent();
            break;

        default:
            throw new Error('Unknown case type: "' + astNode.type + '"');
    }
};

var generateLocalVariableAllocation = function(astNode) {
    var localVariables = _.filter(astUtils.getAnglScope(astNode).getVariablesArray(), function(variable) {
        return variable.getAllocationType() === 'LOCAL';
    });
    if(localVariables.length) {
        printIndent();
        print('var ');
        print(_.map(localVariables, function(variable) {
            return variable.getJsIdentifier();
        }).join(', '));
        print(';\n');
    }
}

var generateTopNode = function(astNode) {
    switch(astNode.type) {

        case 'file':
            print(';(function(){\n');
            indent();
            generateLocalVariableAllocation(astNode);
            // delegate to the statement generator
            _.each(astNode.stmts, function(node) {
                generateStatement(node);
            });
            outdent();
            print('}());');
            break;

        default:
            throw new Error('Unknown root node type: "' + astNode.type + '"');
    }
};

var compile = module.exports = function(ast) {
    initializeCompiler();
    generateTopNode(ast);
    return _.flatten(buffer).join('');
};

