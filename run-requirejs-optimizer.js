var requirejs = require('requirejs');

var config = {
    baseUrl: '.',
    out: './out/demo/index.js',
    // Automatically wrap Node-style .js files in an AMD wrapping.
    cjsTranslate: true,
    name: 'node_modules/almond/almond',
    // Include and execute our main module
    include: ['demo/index'],
    insertRequire: ['demo/index'],
    // Describe NodeJS packages to Require
    packages: [
        {
            name: 'lodash',
            location: 'node_modules/lodash',
            main: 'index'
        },
        {
            name: 'angl',
            location: 'node_modules/angl'
        }
    ],
    // Map short-and-sweet module names to full minified filenames.
    paths: {
        jquery: 'demo/vendor/jquery-1.9.1.min',
        knockout: 'demo/vendor/knockout-2.2.1.min'
    },
    shim: {
        // Force jQuery to load before Knockout.
        // Knockout caches a reference to jQuery when it loads, so window.jQuery must already exist.
        knockout: {
            deps: ['jquery']
        }
    },
    // Allow these Node built-in modules to resolve in the browser.
    // They're require()d by angl's parser but only actually used when running in NodeJS.
    rawText: {
        'fs': '',
        'path': ''
    },
    // Minify output.
    optimize: 'none',
    // These two options are both required for sourcemap generation.
    preserveLicenseComments: false,
    generateSourceMaps: true
};

// Perform the optimization.
console.log('Optimizing with RequireJS...');
requirejs.optimize(config, function(buildResponse) {
    console.log('Done!');
    console.log(buildResponse);
}, function(err) {
    console.error('Error!');
    console.error(err.message);
});
