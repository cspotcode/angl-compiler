import scope = module('./angl-scope');
import scopeVariable = module('./scope-variable');
import strings = module('./strings');

export function createGlobalScope():scope.AnglScope {
    var globalScope = new scope.AnglScope();

    // TODO what values should I be adding?  Gotta invent an object/type/schema for values.
    var variable = new scopeVariable.Variable('global', 'PROP_ASSIGNMENT', 'PROP_ACCESS');
    variable.setContainingObjectIdentifier(strings.ANGL_GLOBALS_IDENTIFIER);
    globalScope.addVariable(variable);

    return globalScope;
};

