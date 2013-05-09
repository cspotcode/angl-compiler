define(function(require) {

var $ = require('jquery');
var ko = require('knockout');
var angl = require('angl/out/angl');
var compiler = require('lib/compile');

$(document).ready(function($) {
    var viewModel = window.viewModel = {};
    (function() {
        this.view = ko.observable('js');
        this.parserErrors = ko.observable();
        this.compilerErrors = ko.observable();
        this.ast = ko.observable();
        this.stringifiedAst = ko.observable();
        this.compiledJs = ko.observable();
        this.inputAngl = ko.observable('');
        this.on_getPermalinkClicked = function() {
            var hash = '#' + encodeURIComponent(this.inputAngl());
            window.location.hash = hash;
        };
        _.bindAll(this, 'on_getPermalinkClicked');

        var recompile = ko.computed(function() {
            var ast;
            try {
                ast = angl.parse(this.inputAngl());
                this.stringifiedAst(JSON.stringify(ast, null, '    '));
            } catch(e) {
                this.parserErrors(e.message);
                return;
            }
            this.parserErrors(undefined);
            try {
                this.compiledJs(compiler.compileAst(ast));
            } catch(e) {
                this.compilerErrors(e.message);
                return;
            }
            this.compilerErrors(undefined);
        }, this).extend({throttle: 500});

        if(window.location.hash) {
            this.inputAngl(decodeURIComponent(window.location.hash.replace(/^#?/, '')));
        }

    }).apply(viewModel);

    ko.applyBindings(viewModel);
});

});
