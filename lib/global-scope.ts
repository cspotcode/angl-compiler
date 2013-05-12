import scope = module('./angl-scope');
import scopeVariable = module('./scope-variable');
import strings = module('./strings');
var _ = require('lodash');

export function createGlobalScope():scope.AnglScope {
    var globalScope = new scope.AnglScope();

    var globalIdentifiers:any = 'global true false';

    // Add all global identifiers into global scope
    globalIdentifiers = globalIdentifiers.split(' ');
    _.each(globalIdentifiers, (globalIdentifier) => {
        // TODO what values should I be adding?  Gotta invent an object/type/schema for values.
        var variable = new scopeVariable.Variable(globalIdentifier, 'PROP_ASSIGNMENT', 'PROP_ACCESS');
        variable.setContainingObjectIdentifier(strings.ANGL_GLOBALS_IDENTIFIER);
        globalScope.addVariable(variable);
    });

    return globalScope;
};

