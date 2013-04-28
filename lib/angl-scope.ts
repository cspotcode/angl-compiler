/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>
// Scope class that represents an Angl lexical scope and all the identifiers inside it.

// Remember, the "self" scope is a bit of an exception.
// It is the scope used when no other scope has a given identifier.

var _ = require('lodash');
var buckets = require('../vendor/buckets');
import Variable = module('./Variable');

var bucketIdProp = '_id' + new Date;

var idGeneratorFn = (item) => item[bucketIdProp] = item[bucketIdProp] || _.uniqueId();

export class AnglScope {

    // Set of all Variables
    private _variables;
    // Dictionary mapping Angl identifiers to Variables.  Not all Variables have an Angl identifier.
    private _identifiers;
    // Dictionary mapping Javascript identifiers to Variables.  Not all Variables have a Javascript identifier, though
    // one will eventually have to be assigned to them.
    private _jsIdentifiers;
    // Set containing all Variables that do not have a Javascript identifier.  These identifiers will be assigned to
    // them before Javascript code generation occurs.
    private _unnamedVariables;
    private _parentScope;
    private _namingUid;

    constructor() {
        this._identifiers = new buckets.Dictionary();
        this._jsIdentifiers = new buckets.Dictionary();
        this._unnamedVariables = new buckets.Set(idGeneratorFn);
        this._variables = new buckets.Set(idGeneratorFn);
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
    addVariable(variable:Variable.Variable) {
        var identifier = variable.getIdentifier();
        var jsIdentifier = variable.getJsIdentifier();

        // Check that we don't have name conflicts
        if(identifier !== null && this.hasIdentifier(identifier)) throw new Error('Scope already has an identifier with the name "' + identifier + '"');

        // Add variable to our internal data structures
        this._variables.add(variable);
        if(identifier !== null) this._identifiers.set(identifier, variable);
        if(jsIdentifier === null) {
            this._unnamedVariables.add(variable);
        } else {
            this._jsIdentifiers.set(jsIdentifier, variable);
        }
    }

    // returns value for the identifier with the given name, undefined if it doesn't exist
    getVariableByIdentifier(identifier:string):Variable.Variable {
        return this._identifiers.get(identifier);
    };

    // returns value for the identifier with the given name in this or any parent scope, undefined if it doesn't exist
    getVariableByIdentifierInChain(identifier:string):Variable.Variable {
        return this._identifiers.get(identifier) || (this._parentScope && this._parentScope.getVariableByIdentifierInChain(identifier));
    };

    // returns true or false if identifier with given name exists or doesn't exist
    hasIdentifier(identifier:string) {
        return this._identifiers.containsKey(identifier);
    };

    hasIdentifierInChain(identifier:string) {
        return this.hasIdentifier(identifier) || !!(this._parentScope && this._parentScope.hasIdentifierInChain(identifier));
    }

    // sets identifier with given name and value, replacing previous one with that name if it exists
/*    setIdentifier(name, value) {
        this._identifiers.set(name, value);
    };*/

    // removes identifier with the given name, returning true if it was removed, false if it didn't exist
    removeVariableByIdentifier(identifier:string):bool {
        var variable = this.getVariableByIdentifier(identifier);
        if(variable) {
            this.removeVariable(variable);
            return true;
        } else {
            return false;
        }
    };

    removeVariable(variable:Variable.Variable):bool {
        var ret = this._variables.remove(variable);
        if(ret) {
            var jsIdentifier = variable.getJsIdentifier()
              , identifier = variable.getIdentifier()
              ;
            identifier !== null && this._identifiers.remove(identifier);
            jsIdentifier !== null && this._jsIdentifiers.remove(jsIdentifier);
            this._unnamedVariables.remove(variable);
        }
        return ret;
    }

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

    // Returns an array of all Variables
    getVariablesArray():Variable.Variable[] { return this._variables.toArray(); }

    setParentScope(parentAnglScope) {
        this._parentScope = parentAnglScope;
    };

    getParentScope():AnglScope {
        return this._parentScope;
    }

    // Creates a new identifier in this scope, when you don't care what the name is.  You can specify a
    // preferred name and, if possible, this unnamed identifier will be assigned that name.  If that name is taken, it
    // will be modified to make it unique.
    // Returns an UnnamedIdentifier instance.  When this scope is asked to assign names to all unnamed identifiers, it
    // will add the assigned names into each UnnamedIdentifier instance.
    createUnnamedIdentifier(preferredName, value):UnnamedIdentifier {
        var unnamedIdentifier = new UnnamedIdentifier(preferredName);
        this._unnamedVariables.set(unnamedIdentifier, value);
        return unnamedIdentifier;
    }

    // Converts all unnamed identifiers to regular identifiers by assigning them names
    assignJsIdentifiers():void {
        var unnamedVariables = this._unnamedVariables.toArray();
        _.each(unnamedVariables, (variable:Variable.Variable) => {
            // Remove variable from self.  Will be re-added once we've assigned a JS name
            this.removeVariable(variable);
            var namePrefix = variable.getDesiredJsIdentifier() || '__a';
            var nameSuffix = '';
            // While the name is already in use, create a new name by using a different suffix
            while(this._jsIdentifiers.containsKey(namePrefix + nameSuffix)) {
                nameSuffix = '' + this._namingUid;
                this._namingUid++;
            }
            // Found a unique name!  Assign it.
            var name = namePrefix + nameSuffix;
            variable.setJsIdentifier(name);
            // Re-add variable to self
            this.addVariable(variable);
        });
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


