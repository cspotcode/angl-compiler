import scope = module('./angl-scope');

export function createGlobalScope():scope.AnglScope {
    var globalScope = new scope.AnglScope();

    // TODO what values should I be adding?  Gotta invent an object/type/schema for values.
    globalScope.addIdentifier('global', null);

    return globalScope;
};
