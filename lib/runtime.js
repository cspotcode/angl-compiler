// This is the Angl runtime.
// It gets loaded into whatever JS engine is executing the game and is not executed
// by the compiler.

var exports = module.exports = {}

var globalInstanceIdCounter = 100000

var globalClassIdCounter = 0

var globalClassAndInstanceCache = []

// Constructor to create a new AnglClass (not an instance)
exports.AnglClass = function() {
    // Initialize sparse array of all instances of this object/AnglClass
    this._instances = []

    // Counter used to generate unique ids for instances
    this._instanceIdCounter = 0

    // unique ID for this class
    this._id = globalClassIdCounter++

    // add to the global cache
    globalClassAndInstanceCache[this._id] = this
}

exports.AnglClass.prototype._createInstance = function() {
    var instance = {} // TODO what should these be?
    instance._anglClass = this
    instance._classSpecificInstanceId = this._instanceIdCounter
    this._instances[_instanceIdCounter] = instance
    this._instanceIdCounter++
    instance._globalInstanceId = ++globalInstanceIdCounter
    globalClassAndInstanceCache[instance._globalInstanceId] = instance
    return instance
}

exports.resolveObjectBeforeDot = function(value) {
    var ret = value, i
    // convert from number to class or instance
    if(typeof value === 'number') {
        ret = globalClassAndInstanceCache[value]
        if(!ret) throw new Error('Class or instance with id ' + value + ' doesn\'t exist')
    }
    // If given a class, return the first instance
    if(ret instanceof exports.AnglClass) {
        ret = undefined
        for(i in value._instances) {
            ret = value._instances[i]
            break
        }
    }
    return ret
}