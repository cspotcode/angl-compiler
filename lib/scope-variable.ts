/// <reference path="../typings/DefinitelyTyped/node/node.d.ts"/>

var _ = require('lodash');

export interface AbstractVariable {
    getJsIdentifier():string;
    getIdentifier():string;
    getAllocationType():string;
    getAccessType():string;
    getContainingObjectIdentifier():string;
}

export class Variable implements AbstractVariable {

    private _identifier:string;
    private _allocationType:string;
    private _accessType:string;
    private _desiredJsIdentifier:string;
    private _jsIdentifier:string;
    private _containingObjectIdentifier:string;

    private static allocationTypes = ['LOCAL', 'ARGUMENT', 'PROP_ASSIGNMENT'];
    private static accessTypes = ['BARE', 'PROP_ACCESS'];

    constructor(identifier?:string = null, allocationType?:string = 'LOCAL', accessType?:string = 'BARE') {
        if(!_.contains(Variable.allocationTypes, allocationType)) throw new Error('Invalid Variable allocationType "' + allocationType + '"');
        if(!_.contains(Variable.accessTypes, accessType)) throw new Error('Invalid Variable accessType"' + accessType + '"');

        this._identifier = identifier;
        this._jsIdentifier = identifier;
        this._desiredJsIdentifier = null;
        this._allocationType = allocationType;
        this._accessType = accessType;
        this._containingObjectIdentifier = null;
    }

    setDesiredJsIdentifier(desiredIdentifier:string) { this._desiredJsIdentifier = desiredIdentifier; }

    getDesiredJsIdentifier():string { return this._desiredJsIdentifier; }

    setJsIdentifier(jsIdentifier:string) { this._jsIdentifier = jsIdentifier; }

    getJsIdentifier():string { return this._jsIdentifier; }

    setIdentifier(identifier:string) { this._identifier = identifier; }

    getIdentifier():string { return this._identifier; }

    getAllocationType():string { return this._allocationType; }

    getAccessType():string { return this._accessType; }

    setContainingObjectIdentifier(identifier:string) { this._containingObjectIdentifier = identifier; }

    getContainingObjectIdentifier():string { return this._containingObjectIdentifier; }
}

