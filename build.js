var fs = require('fs')
var path = require('path')
var jade = require('jade')
var stylus = require('stylus')
var _ = require('lodash')

// create output directory
createDirectory('out')
createDirectory('out/demo')
createDirectory('out/demo/vendor')

// render demo html
var input = readFile('demo/index.jade')
var output = jade.compile(input)()
writeFile('out/demo/index.html', output)

// render demo css
var input = readFile('demo/style.styl')
stylus(input).render(function(err, output) {
    if(err) throw err
    writeFile('out/demo/style.css', output)
})

// copy scripts
_.each([
    'demo/vendor/jquery-1.9.1.min.js',
    'demo/vendor/knockout-2.2.1.min.js'
    ], function(v) {
    copyFile(v, path.join('out', v))
})

copyFile('node_modules/lodash/lodash.min.js', 'out/demo/vendor/lodash.min.js')

// copy angl AST-generator to demo
writeFile('out/demo/vendor/angl.js', wrapForBrowser(readFile('node_modules/angl/out/angl.js')))
writeFile('out/demo/vendor/parser.js', wrapForBrowser(readFile('node_modules/angl/out/parser.js')))

// copy compiler to demo
writeFile('out/demo/main.js', wrapForBrowser(readFile('lib/main.js')))

////
// UTILITY FUNCTIONS
////

function createDirectory(dir) {
    try {
        fs.mkdirSync(path.join(__dirname, dir))
    } catch(e) {}
}

function readFile(file) {
    return fs.readFileSync(path.join(__dirname, file)).toString()
}

function writeFile(file, content) {
    fs.writeFileSync(path.join(__dirname, file), content)
}

function copyFile(inFile, outFile) {
    writeFile(outFile, readFile(inFile))
}

function wrapForBrowser(input) {
    return ';(function(module, exports){\n' + input + '\n})(window.module, window.module.exports);'
}
