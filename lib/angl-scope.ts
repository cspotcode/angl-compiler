// Scope class that represents an Angl lexical scope and all the identifiers inside it.

// Remember, the "self" scope is a bit of an exception.
// It is the scope used when no other scope has a given identifier.

declare var require:any;
var _ = require('lodash');
var buckets = require('../vendor/buckets');

var bucketIdProp = '_id' + new Date;

export class AnglScope {

    private _identifiers;
    private _unnamedIdentifiers;
    private _parentScope;
    private _namingUid;

    constructor() {
        this._identifiers = new buckets.Dictionary();
        this._unnamedIdentifiers = new buckets.Dictionary((item) => item[bucketIdProp] = item[bucketIdProp] || _.uniqueId());
        this._parentScope = null;
        this._namingUid = 0;
    }

    // TODO what types should the identifier and value be?
    // identifier is a string

    // TODO add methods that take the parent scope(s) into account.
    // For example, figure out what identifier a name resolves to including all parent scopes.
    // Adding an identifier, throwing an exception if it overrides anything in a parent scope.
    // Getting all identifiers visible in this scope, including ones from parent scopes
    //   (unless they've been covered up by identical names in this scope).

    // TODO add ability to add identifiers for which the name doesn't matter?
    // These identifiers can be assigned names after the scope is done being created.
    // At that time, it's possible to assign names without causing conflicts.
    // Alternatively, assign names right away and rename if necessary.

    // adds an identifier with the given name, throwing an exception if it already exists
    addIdentifier(name, value) {
        if(this.hasIdentifier(name)) throw new Error('Scope already has an identifier with the name "' + name + '"');
        this.setIdentifier(name, value);
    }

    // returns value for the identifier with the given name, undefined if it doesn't exist
    getIdentifierValue(name) {
        return this._identifiers.get(name);
    };

    // returns value for the identifier with the given name in this or any parent scope, undefined if it doesn't exist
    getIdentifierValueInChain(name) {
        return this._identifiers.get(name) || (this._parentScope && this._parentScope.getIdentifierValueInChain(name));
    };

    // returns true or false if identifier with given name exists or doesn't exist
    hasIdentifier(name) {
        return this._identifiers.containsKey(name);
    };

    hasIdentifierInChain(name) {
        return this.hasIdentifier(name) || !!(this._parentScope && this._parentScope.hasIdentifierInChain(name));
    }

    // sets identifier with given name and value, replacing previous one with that name if it exists
    setIdentifier(name, value) {
        this._identifiers.set(name, value);
    };

    // removes identifier with the given name, returning true if it was removed, false if it didn't exist
    removeIdentifier(name) {
        this._identifiers.remove(name);
    };

    // Returns an array of all named identifier objects
    /*
    getAllIdentifiers() {
        return this._identifiers.slice();
    };
    */

    // Returns an array of all identifier names
    /*
    getAllIdentifierNames() {
        return _.pluck(this._identifiers, 'name');
    };
    */

    setParentScope(parentAnglScope) {
        this._parentScope = parentAnglScope;
    };

    getParentScope() {
        return this._parentScope;
    }

    // Creates a new identifier in this scope, when you don't care what the name is.  You can specify a
    // preferred name and, if possible, this unnamed identifier will be assigned that name.  If that name is taken, it
    // will be modified to make it unique.
    // Returns an UnnamedIdentifier instance.  When this scope is asked to assign names to all unnamed identifiers, it
    // will add the assigned names into each UnnamedIdentifier instance.
    createUnnamedIdentifier(preferredName, value) {
        var unnamedIdentifier = new UnnamedIdentifier(preferredName);
        this._unnamedIdentifiers.set(unnamedIdentifier, value);
        return unnamedIdentifier;
    }

    // Converts all unnamed identifiers to regular identifiers by assigning them names
    assignNames() {
        this._unnamedIdentifiers.forEach((unnamedIdentifier, value) => {
            var namePrefix = unnamedIdentifier.getPreferredName() || '__a';
            var nameSuffix = '';
            // While the name is already in use, create a new name by using a different suffix
            while(this._identifiers.containsKey(namePrefix + nameSuffix)) {
                nameSuffix = '' + this._namingUid;
                this._namingUid++;
            }
            var name = namePrefix + nameSuffix;
            this._identifiers.set(name, value);
            unnamedIdentifier._assignName(name);
        });
        this._unnamedIdentifiers.clear();
    }
}


export class UnnamedIdentifier {

    private _preferredName;
    private _assignedName;

    constructor(preferredName) {
        this._preferredName = preferredName || null;
    }

    // Returns the name assigned to this identifier, or null if it has not yet been assigned
    getName() {
        return this._assignedName || null;
    }

    // Returns the preferred
    getPreferredName() {
        return this._preferredName;
    }

    _assignName(name) {
        this._assignedName = name;
    }
}

// Types of identifiers:
// script const
// other const (these are the same???)
//    consts can't be an lvalue
// function argument
// local variables
// value is a script, const value, local variable

/*
  An Angl value takes the form:
  {
    type: 'constant' || 'localVar' || 'argument',

  }
 */


