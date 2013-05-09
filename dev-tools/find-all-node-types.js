// Given an AST that contains all possible language features, this will traverse the AST, discovering all node types and
// where their children are stored.

var _ = require('lodash');
var angl = require('angl');
var fs = require('fs');
var path = require('path');
//var ast = require('../sample-asts/all-node-types.json');

var nodeTypes = {};

function getChildren(type) {
    if(_.has(nodeTypes, type)) return nodeTypes[type];
    return nodeTypes[type] = {};
}

function processNode(node) {
    if(_.isArray(node)) {
        _.each(node, function(node) {processNode(node)});
        return;
    }
    if(!_.has(node, 'type')) console.log('Node doesn\'t have a type!?:\n' + JSON.stringify(node, null, 4));
    var children = getChildren(node.type);
    _.each(node, function(v, k) {
        // Is this a child?
        if(_.isObject(v) || _.isArray(v)) {
            children[k] = true;
            processNode(v);
        }
    });
}

// Compile the sample angl source code into an AST
var anglSource = fs.readFileSync(path.join(__dirname, '../sample-angl/all-language-features.angl')).toString();
var ast = angl.parse(anglSource);
// Dump it into a file for convenience
fs.writeFileSync(path.join(__dirname, '../sample-angl/all-language-features.json'), JSON.stringify(ast, null, 4));

// Scan the AST
processNode(ast);
// Convert objects into arrays
_(nodeTypes).keys().each(function(k) {
    nodeTypes[k] = _.map(nodeTypes[k], function(v, k) {return k});
});

// Dump the result to stdout
console.log(JSON.stringify(nodeTypes, null, 4));
