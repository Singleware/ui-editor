/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
'use strict';
var Loader;
(function(Loader) {
  /**
   * All loaded modules.
   */
  const cache = {};

  /**
   * All loading locations.
   */
  const loading = [];

  /**
   * All modules repository.
   */
  const repository = {"@singleware/class/exception":{pack:false, invoke:function(exports, require){
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom exception class.
 */
class Exception extends Error {
}
exports.Exception = Exception;

}},
"@singleware/class/helper":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("./exception");
/**
 * Provide decorators and methods to protect classes at runtime.
 */
var Helper;
(function (Helper) {
    /**
     * Map to access the original proxy context.
     */
    const contextMap = new WeakMap();
    /**
     * Map to access a context vault.
     */
    const vaultMap = new WeakMap();
    /**
     * Set list for locked classes.
     */
    const lockedSet = new WeakSet();
    /**
     * Set list for wrapped members.
     */
    const memberSet = new WeakSet();
    /**
     * Set list for wrapped types.
     */
    const typeSet = new WeakSet();
    /**
     * Calling type to determine the current access rules.
     */
    let callingType;
    /**
     * Resolves the given proxy to its original context.
     * @param proxy Proxy to be resolved.
     * @returns Returns the resolved proxy context.
     */
    function getOriginalContext(proxy) {
        return (contextMap.get(proxy) || proxy);
    }
    /**
     * Determines whether the specified type is derived from base type.
     * @param type Class type.
     * @param base Base class type.
     * @returns Returns true when the specified type is derived from base type, false otherwise.
     */
    function isDerived(type, base) {
        while ((type = Reflect.getPrototypeOf(type)) && type.prototype) {
            if (type.prototype.constructor === base.prototype.constructor) {
                return true;
            }
        }
        return false;
    }
    /**
     * Determines whether the specified property is member of the given class type.
     * @param type Class type.
     * @param property Property name.
     * @returns Returns true when the specified property is a member, false otherwise.
     */
    function isMember(type, property) {
        do {
            if (Reflect.getOwnPropertyDescriptor(type.prototype, property) || Reflect.getOwnPropertyDescriptor(type, property)) {
                return true;
            }
        } while ((type = Reflect.getPrototypeOf(type)) && type.prototype && typeSet.has(type.prototype.constructor));
        return false;
    }
    /**
     * Wraps the specified context to ensure its access rules automatically in each method call.
     * @param type Class type.
     * @param context Class context.
     * @returns Returns the new generated proxy to the original context.
     */
    function wrapContext(type, context) {
        const proxy = new Proxy(context, {
            get: (target, property, receiver) => {
                let value;
                if (!isMember(type, property)) {
                    if ((value = Reflect.get(target, property, getOriginalContext(receiver))) && value instanceof Function) {
                        return function (...parameters) {
                            return value.apply(getOriginalContext(this), parameters);
                        };
                    }
                }
                else {
                    if ((value = performCall(type, target, Reflect.get, [target, property, receiver])) && memberSet.has(value)) {
                        return function (...parameters) {
                            return performCall(type, this, value, parameters);
                        };
                    }
                }
                return value;
            },
            set: (target, property, value, receiver) => {
                if (!isMember(type, property)) {
                    return Reflect.set(target, property, value, getOriginalContext(receiver));
                }
                else {
                    return performCall(type, target, Reflect.set, [target, property, value, receiver]);
                }
            }
        });
        contextMap.set(proxy, context);
        return proxy;
    }
    /**
     * Perform the specified callback with the given parameters.
     * @param type Calling class type.
     * @param context Calling context.
     * @param callback Calling member.
     * @param parameters Calling parameters.
     * @returns Returns the same result of the performed callback.
     * @throws Throws the same error of the performed callback.
     */
    function performCall(type, context, callback, parameters) {
        const originalCalling = callingType;
        const currentContext = context ? wrapContext(type, getOriginalContext(context)) : context;
        try {
            callingType = type;
            return callback.apply(currentContext, parameters);
        }
        catch (exception) {
            throw exception;
        }
        finally {
            callingType = originalCalling;
        }
    }
    /**
     * Wraps the specified callback to be a public member.
     * @param type Class type.
     * @param property Property key.
     * @param callback Original member callback.
     * @returns Returns the wrapped callback.
     */
    function publicWrapper(type, property, callback) {
        const member = function (...parameters) {
            return performCall(type, this, callback, parameters);
        };
        memberSet.add(member);
        return member;
    }
    /**
     * Wraps the specified callback to be a protected member.
     * @param type Class type.
     * @param property Property key.
     * @param callback Original member callback.
     * @returns Returns the wrapped callback.
     * @throws Throws an error when the current calling type isn't the same type or instance of expected type.
     */
    function protectedWrapper(type, property, callback) {
        const member = function (...parameters) {
            if (!callingType || (callingType !== type && !isDerived(type, callingType) && !isDerived(callingType, type))) {
                throw new exception_1.Exception(`Access to the protected member '${property}' has been denied.`);
            }
            return performCall(type, this, callback, parameters);
        };
        memberSet.add(member);
        return member;
    }
    /**
     * Wraps the specified callback to be a private member.
     * @param type Class type.
     * @param property Property key.
     * @param callback Original member callback.
     * @returns Returns the wrapped callback.
     * @throws Throws an error when the current calling type isn't the same type of the expected type.
     */
    function privateWrapper(type, property, callback) {
        const member = function (...parameters) {
            if (callingType !== type) {
                throw new exception_1.Exception(`Access to the private member '${property}' has been denied.`);
            }
            return performCall(type, this, callback, parameters);
        };
        memberSet.add(member);
        return member;
    }
    /**
     * Locks the specified class constructor to returns its instance in a wrapped context.
     * @param type Class Type.
     * @returns Returns the locked class type.
     */
    function lockClass(type) {
        if (!lockedSet.has(type.prototype.constructor)) {
            const basePrototype = Reflect.getPrototypeOf(type).prototype;
            if (!basePrototype) {
                console.warn(`For security and compatibility reasons the class '${type.name}' must extends the default class Null.`);
            }
            else if (!typeSet.has(basePrototype.constructor)) {
                class ClassLocker extends basePrototype.constructor {
                    constructor(...parameters) {
                        return wrapContext(type.prototype.constructor, super(...parameters));
                    }
                }
                Reflect.setPrototypeOf(type, ClassLocker);
            }
            lockedSet.add(type.prototype.constructor);
        }
        return type;
    }
    /**
     * Wraps the specified class type.
     * @param type Class type.
     * @returns Returns the wrapped class type.
     * @throws Throws an error when the class was already wrapped.
     */
    function wrapClass(type) {
        if (typeSet.has(type.prototype.constructor)) {
            throw new exception_1.Exception(`Access to the class has been denied.`);
        }
        typeSet.add(type.prototype.constructor);
        return new Proxy(lockClass(type), {
            construct: (target, parameters, derived) => {
                const currentType = target.prototype.constructor;
                const derivedType = derived.prototype.constructor;
                const context = performCall(currentType, void 0, Reflect.construct, [target, parameters, derived]);
                return currentType !== derivedType ? wrapContext(callingType, getOriginalContext(context)) : getOriginalContext(context);
            }
        });
    }
    /**
     * Wraps the specified member with the given wrapper function.
     * @param target Member target.
     * @param property Property key.
     * @param descriptor Property descriptor.
     * @param wrapper Wrapper function.
     * @returns Returns the wrapped property descriptor.
     * @throws Throws an error when the class was already wrapped.
     */
    function wrapMember(target, property, descriptor, wrapper) {
        const type = (target instanceof Function ? target : target.constructor).prototype.constructor;
        if (typeSet.has(type)) {
            throw new exception_1.Exception(`Access to the class has been denied.`);
        }
        if (descriptor.value instanceof Function) {
            descriptor.value = wrapper(type, property, descriptor.value);
        }
        else {
            if (descriptor.get instanceof Function) {
                descriptor.get = wrapper(type, property, descriptor.get);
            }
            if (descriptor.set instanceof Function) {
                descriptor.set = wrapper(type, property, descriptor.set);
            }
        }
        return descriptor;
    }
    /**
     * Creates a new getter and setter member for the specified property.
     * @param target Member target.
     * @param property Property name.
     * @returns Returns the new member property descriptor.
     */
    function createMember(target, property) {
        const initial = target.hasOwnProperty(property) ? target[property] : void 0;
        let vault;
        return {
            get: function () {
                const context = getOriginalContext(this);
                if (!(vault = vaultMap.get(context))) {
                    vaultMap.set(context, (vault = {}));
                }
                return property in vault ? vault[property] : (vault[property] = initial);
            },
            set: function (value) {
                const context = getOriginalContext(this);
                if (!(vault = vaultMap.get(context))) {
                    vaultMap.set(context, (vault = {}));
                }
                vault[property] = value;
            }
        };
    }
    /**
     * Default class for security and compatibility reasons.
     */
    class Null {
    }
    Helper.Null = Null;
    /**
     * Decorates the specified class to ensure its access rules at runtime.
     * @returns Returns the decorator method.
     */
    function Describe() {
        return (target) => {
            return wrapClass(target);
        };
    }
    Helper.Describe = Describe;
    /**
     * Decorates the specified class member to be public at runtime.
     * @returns Returns the decorator method.
     */
    function Public() {
        return (target, property, descriptor) => {
            return wrapMember(target, property, descriptor || createMember(target, property), publicWrapper);
        };
    }
    Helper.Public = Public;
    /**
     * Decorates the specified class member to be protected at runtime.
     * @returns Returns the decorator method.
     */
    function Protected() {
        return (target, property, descriptor) => {
            return wrapMember(target, property, descriptor || createMember(target, property), protectedWrapper);
        };
    }
    Helper.Protected = Protected;
    /**
     * Decorates the specified class member to be private at runtime.
     * @returns Returns the decorator method.
     */
    function Private() {
        return (target, property, descriptor) => {
            return wrapMember(target, property, descriptor || createMember(target, property), privateWrapper);
        };
    }
    Helper.Private = Private;
    /**
     * Decorates the specified class member to be an enumerable property at runtime.
     * @returns Returns the decorator method.
     */
    function Property() {
        return (target, property, descriptor) => {
            return ((descriptor || (descriptor = createMember(target, property))).enumerable = true), descriptor;
        };
    }
    Helper.Property = Property;
    /**
     * Performs the specified callback using the specified context rules.
     * @param context Context instance.
     * @param callback Callback to be performed.
     * @param parameters Calling parameters.
     * @returns Returns the same result of the performed callback.
     * @throws Throws an error when the provided context isn't valid or the same error of the performed callback.
     */
    async function perform(context, callback, ...parameters) {
        if (!contextMap.has(context)) {
            throw new exception_1.Exception(`The provided context isn't a valid context.`);
        }
        const originalContext = getOriginalContext(context);
        const originalType = Reflect.getPrototypeOf(originalContext).constructor;
        return await performCall(originalType, originalContext, callback, parameters);
    }
    Helper.perform = perform;
    /**
     * Resolves the given wrapped context to the original context.
     * @param context Context to be resolved.
     * @returns Returns the original context.
     */
    function resolve(context) {
        return getOriginalContext(context);
    }
    Helper.resolve = resolve;
})(Helper = exports.Helper || (exports.Helper = {}));

}},
"@singleware/class/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exception_1 = require("./exception");
exports.Exception = exception_1.Exception;
/**
 * Declarations.
 */
const helper_1 = require("./helper");
/**
 * Default null class for security reasons.
 */
exports.Null = helper_1.Helper.Null;
/**
 * Decorates the specified class to ensure its access rules at runtime.
 * @returns Returns the decorator method.
 */
exports.Describe = () => helper_1.Helper.Describe();
/**
 * Decorates the specified class member to be public at runtime.
 * @returns Returns the decorator method.
 */
exports.Public = () => helper_1.Helper.Public();
/**
 * Decorates the specified class member to be protected at runtime.
 * @returns Returns the decorator method.
 */
exports.Protected = () => helper_1.Helper.Protected();
/**
 * Decorates the specified class member to be private at runtime.
 * @returns Returns the decorator method.
 */
exports.Private = () => helper_1.Helper.Private();
/**
 * Decorates the specified class member to be an enumerable property at runtime.
 * @returns Returns the decorator method.
 */
exports.Property = () => helper_1.Helper.Property();
/**
 * Performs the specified callback using the specified context rules.
 * @param context Context instance.
 * @param callback Callback to be performed.
 * @param parameters Calling parameters.
 * @returns Returns the same result of the performed callback.
 * @throws Throws the same error of the performed callback.
 */
exports.perform = async (context, callback, ...parameters) => helper_1.Helper.perform(context, callback, ...parameters);
/**
 * Resolves the given wrapped context to the original context.
 * @param context Context to be resolved.
 * @returns Returns the original context.
 */
exports.resolve = (context) => helper_1.Helper.resolve(context);

}},
"@singleware/class":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/injection/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var manager_1 = require("./manager");
exports.Manager = manager_1.Manager;
const manager_2 = require("./manager");
// Global manager.
const global = new manager_2.Manager();
/**
 * Decorates the specified class to be a global dependency class.
 * @param settings Dependency settings.
 * @returns Returns the decorator method.
 */
exports.Describe = (settings) => global.Describe(settings);
/**
 * Decorates a class type or class property to be injected by the specified dependencies.
 * @param dependency First dependency.
 * @param dependencies Remaining dependencies.
 * @returns Returns the decorator method.
 * @throws Throws an error when multiple dependencies are specified in a class property injection.
 */
exports.Inject = (dependency, ...dependencies) => global.Inject(dependency, ...dependencies);
/**
 * Resolves the current instance of the specified class type.
 * @param type Class type.
 * @throws Throws a type error when the class type does not exists in the dependencies.
 * @returns Returns the resolved instance.
 */
exports.resolve = (type) => global.resolve(type);
/**
 * Constructs a new instance of the specified class type.
 * @param type Class type.
 * @param parameters Initial parameters.
 * @returns Returns a new instance of the specified class type.
 */
exports.construct = (type, ...parameters) => global.construct(type, ...parameters);

}},
"@singleware/injection":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/injection/manager":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Dependency manager class.
 */
let Manager = class Manager extends Class.Null {
    /**
     * Dependency manager class.
     */
    constructor() {
        super(...arguments);
        /**
         * Map of injected properties.
         */
        this.injectionsMap = new WeakMap();
        /**
         * Map of singleton instances.
         */
        this.singletonsMap = new WeakMap();
        /**
         * Map of dependency settings.
         */
        this.settingsMap = new WeakMap();
    }
    /**
     * Wraps the specified dependency list in the given class type.
     * @param type Class type.
     * @param dependencies Dependency class list.
     * @returns Returns the wrapped class type.
     */
    wrapClass(type, dependencies) {
        return new Proxy(type, {
            construct: (target, parameters, other) => {
                const list = {};
                for (const type of dependencies) {
                    const settings = this.settingsMap.get(type.prototype.constructor);
                    list[settings.name || type.name] = this.resolve(type);
                }
                return Reflect.construct(target, [list, parameters], other);
            }
        });
    }
    /**
     * Creates a new property for the specified dependency.
     * @param property Property name.
     * @param dependency Dependency class.
     * @returns Returns the generated property descriptor.
     */
    createProperty(property, dependency) {
        const resolver = this.resolve.bind(this, dependency);
        const injections = this.injectionsMap;
        let map;
        return {
            enumerable: false,
            get: function () {
                const context = Class.resolve(this);
                if (!(map = injections.get(context))) {
                    injections.set(context, (map = {}));
                }
                return property in map ? map[property] : (map[property] = resolver());
            },
            set: function () {
                throw new Error(`Injected dependencies are read-only.`);
            }
        };
    }
    /**
     * Wraps the specified dependency into the given property descriptor.
     * @param property Property name.
     * @param dependency Dependency class.
     * @param descriptor Property descriptor.
     * @returns Returns the specified property descriptor or a new generated property descriptor.
     * @throws Throws an error when the property descriptor is a method.
     */
    wrapProperty(property, dependency, descriptor) {
        if (descriptor.value instanceof Function) {
            throw new Error(`Only properties are allowed for dependency injection.`);
        }
        else {
            if (!(descriptor.get instanceof Function) || !(descriptor.set instanceof Function)) {
                return this.createProperty(property, dependency);
            }
            else {
                const resolver = this.resolve.bind(this, dependency);
                const getter = descriptor.get;
                const setter = descriptor.set;
                descriptor.get = function () {
                    let instance = getter.call(this);
                    if (!instance) {
                        setter.call(this, (instance = resolver()));
                    }
                    return instance;
                };
                descriptor.set = function () {
                    throw new Error(`Injected dependencies are read-only.`);
                };
                return descriptor;
            }
        }
    }
    /**
     * Decorates the specified class to be a dependency class.
     * @param settings Dependency settings.
     * @returns Returns the decorator method.
     */
    Describe(settings) {
        return (type) => {
            if (this.settingsMap.has(type.prototype.constructor)) {
                throw new TypeError(`Dependency '${type.name}' is already described.`);
            }
            this.settingsMap.set(type.prototype.constructor, settings || {});
        };
    }
    /**
     * Decorates a class type or class property to be injected by the specified dependencies.
     * @param dependency First dependency.
     * @param dependencies Remaining dependencies.
     * @returns Returns the decorator method.
     * @throws Throws an error when multiple dependencies are specified in a class property injection.
     */
    Inject(dependency, ...dependencies) {
        return (scope, property, descriptor) => {
            if (!property) {
                return this.wrapClass(scope, [dependency, ...dependencies]);
            }
            else {
                if (dependencies.length > 0) {
                    throw new Error(`Multiple dependency injection in a class property isn't allowed.`);
                }
                return this.wrapProperty(property, dependency, descriptor || {});
            }
        };
    }
    /**
     * Resolves the current instance from the specified class type.
     * @param type Class type.
     * @throws Throws a type error when the class type isn't a described dependency.
     * @returns Returns the resolved instance.
     */
    resolve(type) {
        const constructor = type.prototype.constructor;
        const settings = this.settingsMap.get(constructor);
        if (!settings) {
            throw new TypeError(`Dependency '${type ? type.name : void 0}' doesn't found.`);
        }
        else {
            if (!settings.singleton) {
                return this.construct(type);
            }
            else {
                let instance = this.singletonsMap.get(constructor);
                if (!instance) {
                    this.singletonsMap.set(constructor, (instance = this.construct(type)));
                }
                return instance;
            }
        }
    }
    /**
     * Constructs a new instance for the specified class type.
     * @param type Class type.
     * @param parameters Initial parameters.
     * @returns Returns a new instance of the specified class type.
     */
    construct(type, ...parameters) {
        return new type(...parameters);
    }
};
__decorate([
    Class.Private()
], Manager.prototype, "injectionsMap", void 0);
__decorate([
    Class.Private()
], Manager.prototype, "singletonsMap", void 0);
__decorate([
    Class.Private()
], Manager.prototype, "settingsMap", void 0);
__decorate([
    Class.Private()
], Manager.prototype, "wrapClass", null);
__decorate([
    Class.Private()
], Manager.prototype, "createProperty", null);
__decorate([
    Class.Private()
], Manager.prototype, "wrapProperty", null);
__decorate([
    Class.Public()
], Manager.prototype, "Describe", null);
__decorate([
    Class.Public()
], Manager.prototype, "Inject", null);
__decorate([
    Class.Public()
], Manager.prototype, "resolve", null);
__decorate([
    Class.Public()
], Manager.prototype, "construct", null);
Manager = __decorate([
    Class.Describe()
], Manager);
exports.Manager = Manager;

}},
"@singleware/observable/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var subject_1 = require("./subject");
exports.Subject = subject_1.Subject;

}},
"@singleware/observable":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/observable/subject":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Subject_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Generic subject class.
 */
let Subject = Subject_1 = class Subject extends Class.Null {
    /**
     * Generic subject class.
     */
    constructor() {
        super(...arguments);
        /**
         * List of observers.
         */
        this.observers = [];
    }
    /**
     * Number of registered observers.
     */
    get length() {
        return this.observers.length;
    }
    /**
     * Subscribes the specified source into the subject.
     * @param source Source instance.
     * @returns Returns the own instance.
     */
    subscribe(source) {
        if (source instanceof Subject_1) {
            for (const observer of source.observers) {
                this.observers.push(observer);
            }
        }
        else {
            this.observers.push(source);
        }
        return this;
    }
    /**
     * Determines whether the subject contains the specified observer or not.
     * @param observer Observer instance.
     * @returns Returns true when the observer was found, false otherwise.
     */
    contains(observer) {
        return this.observers.indexOf(observer) !== -1;
    }
    /**
     * Unsubscribes the specified observer from the subject.
     * @param observer Observer instance.
     * @returns Returns true when the observer was removed, false when the observer does not exists in the subject.
     */
    unsubscribe(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Notify all registered observers.
     * @param value Notification value.
     * @returns Returns the own instance.
     */
    notifyAllSync(value) {
        for (const observer of this.observers) {
            observer(value);
        }
        return this;
    }
    /**
     * Notify all registered observers asynchronously.
     * @param value Notification value.
     * @returns Returns a promise to get the own instance.
     */
    async notifyAll(value) {
        for (const observer of this.observers) {
            await observer(value);
        }
        return this;
    }
    /**
     * Notify all registered observers step by step with an iterator.
     * @param value Notification value.
     * @returns Returns a new notification iterator.
     */
    *notifyStep(value) {
        for (const observer of this.observers) {
            yield observer(value);
        }
        return this;
    }
};
__decorate([
    Class.Protected()
], Subject.prototype, "observers", void 0);
__decorate([
    Class.Public()
], Subject.prototype, "length", null);
__decorate([
    Class.Public()
], Subject.prototype, "subscribe", null);
__decorate([
    Class.Public()
], Subject.prototype, "contains", null);
__decorate([
    Class.Public()
], Subject.prototype, "unsubscribe", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyAllSync", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyAll", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyStep", null);
Subject = Subject_1 = __decorate([
    Class.Describe()
], Subject);
exports.Subject = Subject;

}},
"@singleware/pipeline/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var subject_1 = require("./subject");
exports.Subject = subject_1.Subject;

}},
"@singleware/pipeline":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/pipeline/subject":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Observable = require("@singleware/observable");
/**
 * Generic subject class.
 */
let Subject = class Subject extends Observable.Subject {
    /**
     * Notify the first registered observer and remove it.
     * @param value Notification value.
     * @returns Returns the own instance.
     */
    notifyFirstSync(value) {
        const observer = this.observers.shift();
        if (observer) {
            observer(value);
        }
        return this;
    }
    /**
     * Notify the first registered observer asynchronously and remove it.
     * @param value Notification value.
     * @returns Returns a promise to get the own instance.
     */
    async notifyFirst(value) {
        const observer = this.observers.shift();
        if (observer) {
            await observer(value);
        }
        return this;
    }
    /**
     * Notify the last registered observer and remove it.
     * @param value Notification value.
     * @returns Returns the own instance.
     */
    notifyLastSync(value) {
        const observer = this.observers.pop();
        if (observer) {
            observer(value);
        }
        return this;
    }
    /**
     * Notify the last registered observer asynchronously and remove it.
     * @param value Notification value.
     * @returns Returns a promise to get the own instance.
     */
    async notifyLast(value) {
        const observer = this.observers.pop();
        if (observer) {
            await observer(value);
        }
        return this;
    }
};
__decorate([
    Class.Public()
], Subject.prototype, "notifyFirstSync", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyFirst", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyLastSync", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyLast", null);
Subject = __decorate([
    Class.Describe()
], Subject);
exports.Subject = Subject;

}},
"@singleware/routing/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var match_1 = require("./match");
exports.Match = match_1.Match;
var router_1 = require("./router");
exports.Router = router_1.Router;

}},
"@singleware/routing":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/routing/match":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Generic match manager class.
 */
let Match = class Match extends Class.Null {
    /**
     * Default constructor.
     * @param path Matched path.
     * @param remaining Remaining path.
     * @param variables List of matched variables.
     * @param detail Extra details data for notifications.
     * @param events Pipeline of matched events.
     */
    constructor(path, remaining, variables, detail, events) {
        super();
        this.matchPath = path;
        this.matchEvents = events;
        this.matchVariables = variables;
        this.currentVariables = variables.shift();
        this.remainingPath = remaining;
        this.extraDetails = detail;
    }
    /**
     * Current match length.
     */
    get length() {
        return this.matchEvents.length;
    }
    /**
     * Matched path.
     */
    get path() {
        return this.matchPath;
    }
    /**
     * Remaining path.
     */
    get remaining() {
        return this.remainingPath;
    }
    /**
     * Matched variables.
     */
    get variables() {
        return this.currentVariables || {};
    }
    /**
     * Extra details data.
     */
    get detail() {
        return this.extraDetails;
    }
    /**
     * Determines whether it is an exact match or not.
     */
    get exact() {
        return this.remainingPath.length === 0;
    }
    /**
     * Moves to the next matched route and notify it.
     * @returns Returns the own instance.
     */
    nextSync() {
        this.matchEvents.notifyFirstSync(this);
        this.currentVariables = this.matchVariables.shift();
        return this;
    }
    /**
     * Moves to the next matched route and notify it asynchronously.
     * @returns Returns a promise to get the own instance.
     */
    async next() {
        await this.matchEvents.notifyFirst(this);
        this.currentVariables = this.matchVariables.shift();
        return this;
    }
};
__decorate([
    Class.Private()
], Match.prototype, "matchPath", void 0);
__decorate([
    Class.Private()
], Match.prototype, "matchEvents", void 0);
__decorate([
    Class.Private()
], Match.prototype, "matchVariables", void 0);
__decorate([
    Class.Private()
], Match.prototype, "currentVariables", void 0);
__decorate([
    Class.Private()
], Match.prototype, "remainingPath", void 0);
__decorate([
    Class.Private()
], Match.prototype, "extraDetails", void 0);
__decorate([
    Class.Public()
], Match.prototype, "length", null);
__decorate([
    Class.Public()
], Match.prototype, "path", null);
__decorate([
    Class.Public()
], Match.prototype, "remaining", null);
__decorate([
    Class.Public()
], Match.prototype, "variables", null);
__decorate([
    Class.Public()
], Match.prototype, "detail", null);
__decorate([
    Class.Public()
], Match.prototype, "exact", null);
__decorate([
    Class.Public()
], Match.prototype, "nextSync", null);
__decorate([
    Class.Public()
], Match.prototype, "next", null);
Match = __decorate([
    Class.Describe()
], Match);
exports.Match = Match;

}},
"@singleware/routing/router":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Pipeline = require("@singleware/pipeline");
const match_1 = require("./match");
/**
 * Generic router class.
 */
let Router = class Router extends Class.Null {
    /**
     * Default constructor.
     * @param settings Router settings.
     */
    constructor(settings) {
        super();
        /**
         * Router entries.
         */
        this.entries = {};
        /**
         * Entries counter.
         */
        this.counter = 0;
        this.settings = settings;
    }
    /**
     * Splits the specified path into an array of directories.
     * @param path Path to be splitted.
     * @returns Returns the array of directories.
     */
    splitPath(path) {
        const pieces = path.split(this.settings.separator);
        const directories = [this.settings.separator];
        for (let i = 0; i < pieces.length; ++i) {
            const directory = pieces[i];
            if (directory.length) {
                directories.push(directory);
                if (i + 1 < pieces.length) {
                    directories.push(this.settings.separator);
                }
            }
        }
        return directories;
    }
    /**
     * Creates a new empty entry.
     * @param pattern Variable pattern.
     * @param variable Variable name.
     * @returns Returns a new entry instance.
     */
    createEntry(pattern, variable) {
        return {
            pattern: pattern,
            variable: variable,
            entries: {},
            partial: [],
            exact: []
        };
    }
    /**
     * Inserts all required entries for the specified array of directories.
     * @param directories Array of directories.
     * @param constraint Path constraint.
     * @returns Returns the last inserted entry.
     * @throws Throws an error when the rules for the specified variables was not found.
     */
    insertEntries(directories, constraint) {
        let entries = this.entries;
        let entry;
        for (let directory of directories) {
            let match, variable, pattern;
            if ((match = this.settings.variable.exec(directory))) {
                if (!(pattern = constraint[(variable = match[1])])) {
                    throw new TypeError(`Constraint rules for the variable "${variable}" was not found.`);
                }
                directory = pattern.toString();
            }
            if (!(entry = entries[directory])) {
                entries[directory] = entry = this.createEntry(pattern, variable);
                ++this.counter;
            }
            entries = entry.entries;
        }
        return entry;
    }
    /**
     * Search all entries that corresponds to the expected directory.
     * @param directory Expected directory.
     * @param entries Entries to select.
     * @returns Returns the selection results.
     */
    searchEntries(directory, entries) {
        const selection = { directories: [], entries: [], variables: {} };
        for (const current in entries) {
            const entry = entries[current];
            if (entry.pattern && entry.variable) {
                let match;
                if ((match = entry.pattern.exec(directory))) {
                    selection.variables[entry.variable] = directory;
                    selection.entries.push(entry);
                }
            }
            else if (current === directory) {
                selection.entries.push(entry);
            }
        }
        return selection;
    }
    /**
     * Collect all entries that corresponds to the specified array of directories.
     * The array of directories will be reduced according to the number of entries found.
     * @param directories Array of directories.
     * @returns Returns the selection results.
     */
    collectEntries(directories) {
        let selection = { directories: [], entries: [], variables: {} };
        let targets = [this.entries];
        let variables = {};
        while (directories.length && targets.length) {
            const tempTargets = [];
            const tempEntries = [];
            for (const entries of targets) {
                const tempSearch = this.searchEntries(directories[0], entries);
                variables = { ...tempSearch.variables, ...variables };
                for (const entry of tempSearch.entries) {
                    if (entry.partial.length || entry.exact.length) {
                        tempEntries.push(entry);
                    }
                    tempTargets.push(entry.entries);
                }
            }
            targets = tempTargets;
            if (tempTargets.length) {
                selection.directories.push(directories.shift());
            }
            if (tempEntries.length) {
                selection.entries = tempEntries;
                selection.variables = variables;
            }
        }
        return selection;
    }
    /**
     * Number of routes.
     */
    get length() {
        return this.counter;
    }
    /**
     * Adds the specified routes into the router.
     * @param routes List of routes.
     * @returns Returns the own instance.
     */
    add(...routes) {
        for (const route of routes) {
            const entry = this.insertEntries(this.splitPath(route.path), route.constraint || {});
            const event = { environment: route.environment, callback: route.onMatch };
            if (route.exact) {
                entry.exact.push(event);
            }
            else {
                entry.partial.push(event);
            }
        }
        return this;
    }
    /**
     * Match all routes that corresponds to the specified path.
     * @param path Route path.
     * @param detail Extra details used in the route notification.
     * @returns Returns the manager for the matched routes.
     */
    match(path, detail) {
        const directories = this.splitPath(path);
        const selection = this.collectEntries(directories);
        const pipeline = new Pipeline.Subject();
        const variables = [];
        const remaining = directories.join('');
        const collected = selection.directories.join('');
        for (const entry of selection.entries) {
            if (remaining.length === 0) {
                for (const event of entry.exact) {
                    pipeline.subscribe(event.callback);
                    variables.push({ ...selection.variables, ...event.environment });
                }
            }
            for (const event of entry.partial) {
                pipeline.subscribe(event.callback);
                variables.push({ ...selection.variables, ...event.environment });
            }
        }
        return new match_1.Match(collected, remaining, variables, detail, pipeline);
    }
    /**
     * Clear the router.
     * @returns Returns the own instance.
     */
    clear() {
        this.entries = {};
        this.counter = 0;
        return this;
    }
};
__decorate([
    Class.Private()
], Router.prototype, "entries", void 0);
__decorate([
    Class.Private()
], Router.prototype, "counter", void 0);
__decorate([
    Class.Private()
], Router.prototype, "settings", void 0);
__decorate([
    Class.Private()
], Router.prototype, "splitPath", null);
__decorate([
    Class.Private()
], Router.prototype, "createEntry", null);
__decorate([
    Class.Private()
], Router.prototype, "insertEntries", null);
__decorate([
    Class.Private()
], Router.prototype, "searchEntries", null);
__decorate([
    Class.Private()
], Router.prototype, "collectEntries", null);
__decorate([
    Class.Public()
], Router.prototype, "length", null);
__decorate([
    Class.Public()
], Router.prototype, "add", null);
__decorate([
    Class.Public()
], Router.prototype, "match", null);
__decorate([
    Class.Public()
], Router.prototype, "clear", null);
Router = __decorate([
    Class.Describe()
], Router);
exports.Router = Router;

}},
"@singleware/application/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module = require("./main");
exports.Main = Module.Main;
/**
 * Decorates the specified member to filter an application request. (Alias for Main.Filter)
 * @param action Filter action settings.
 * @returns Returns the decorator method.
 */
exports.Filter = (action) => exports.Main.Filter(action);
/**
 * Decorates the specified member to process an application request. (Alias for Main.Processor)
 * @param action Route action settings.
 * @returns Returns the decorator method.
 */
exports.Processor = (action) => exports.Main.Processor(action);

}},
"@singleware/application":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/application/main":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1;
"use strict";
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Routing = require("@singleware/routing");
const Injection = require("@singleware/injection");
/**
 * Generic main application class.
 */
let Main = Main_1 = class Main extends Class.Null {
    /**
     * Default constructor.
     * @param settings Application settings.
     */
    constructor(settings) {
        super();
        /**
         * Determines whether the application is started or not.
         */
        this.started = false;
        /**
         * Dependency Injection Manager.
         */
        this.dim = new Injection.Manager();
        /**
         * Array of services.
         */
        this.services = [];
        /**
         * Array of loggers.
         */
        this.loggers = [];
        /**
         * Receive handler listener.
         */
        this.receiveHandlerListener = this.receiveHandler.bind(this);
        /**
         * Send handler listener.
         */
        this.sendHandlerListener = this.sendHandler.bind(this);
        /**
         * Error handler listener.
         */
        this.errorHandlerListener = this.errorHandler.bind(this);
        this.filters = new Routing.Router(settings);
        this.processors = new Routing.Router(settings);
    }
    /**
     * Adds a new route handler.
     * @param handler Handler type.
     * @param route Route settings.
     */
    static addRoute(handler, route) {
        let list;
        if (!(list = this.routes.get(handler))) {
            this.routes.set(handler, (list = []));
        }
        list.push(route);
    }
    /**
     * Notify all registered loggers about new requests.
     * @param type Notification type.
     * @param request Request information.
     * @throws Throws an error when the notification type is not valid.
     */
    notifyRequest(type, request) {
        const copy = Object.freeze({ ...request });
        for (const logger of this.loggers) {
            switch (type) {
                case 'receive':
                    logger.onReceive(copy);
                    break;
                case 'process':
                    logger.onProcess(copy);
                    break;
                case 'send':
                    logger.onSend(copy);
                    break;
                case 'error':
                    logger.onError(copy);
                    break;
                default:
                    throw new TypeError(`Request notification type '${type}' does not supported.`);
            }
        }
    }
    /**
     * Notify all registered loggers about new actions.
     * @param type Notification type.
     * @param request Request information.
     * @throws Throws an error when the notification type is not valid.
     */
    notifyAction(type) {
        for (const logger of this.loggers) {
            switch (type) {
                case 'start':
                    logger.onStart(void 0);
                    break;
                case 'stop':
                    logger.onStop(void 0);
                    break;
                default:
                    throw new TypeError(`Action notification type '${type}' does not supported.`);
            }
        }
    }
    /**
     * Performs the specified handler method with the given route match and parameters.
     * @param handler Handler class.
     * @param method Handler method name.
     * @param parameters Handler constructor parameters.
     * @param match Route match.
     * @returns Returns the same value returned by the performed handler method.
     */
    async performHandler(handler, method, parameters, match) {
        let result;
        try {
            result = await new handler(...parameters)[method](match);
        }
        catch (error) {
            match.detail.error = error;
            this.notifyRequest('error', match.detail);
        }
        finally {
            return result;
        }
    }
    /**
     * Performs all route filters for the specified request with the given variables.
     * @param request Request information.
     * @param variables Request processor variables.
     * @returns Returns true when the request access is granted or false otherwise.
     */
    async performFilters(request, variables) {
        const local = request.environment.local;
        const match = this.filters.match(request.path, request);
        while (request.granted && match.length) {
            request.environment.local = { ...variables, ...match.variables, ...local };
            await match.next();
            request.environment.local = local;
        }
        return request.granted || false;
    }
    /**
     * Receiver handler.
     * @param request Request information.
     */
    async receiveHandler(request) {
        this.notifyRequest('receive', request);
        const local = request.environment.local;
        const match = this.processors.match(request.path, request);
        while (match.length && (await this.performFilters(request, match.variables))) {
            request.environment.local = { ...match.variables, ...local };
            await match.next();
            request.environment.local = local;
        }
        this.notifyRequest('process', request);
    }
    /**
     * Send handler.
     * @param request Request information.
     */
    async sendHandler(request) {
        this.notifyRequest('send', request);
    }
    /**
     * Error handler.
     * @param request Request information.
     */
    async errorHandler(request) {
        this.notifyRequest('error', request);
    }
    /**
     * Filter handler to be inherited and extended.
     * @param match Match information.
     * @param allowed Determine whether the filter is allowing the request matching or not.
     * @returns Returns true when the filter handler still allows the request matching or false otherwise.
     */
    async filterHandler(match, allowed) {
        return allowed;
    }
    /**
     * Process handler to be inherited and extended.
     * @param match Match information.
     * @param callback Callable member.
     */
    async processHandler(match, callback) {
        await callback(match);
    }
    /**
     * Decorates the specified class to be an application dependency.
     * @param settings Dependency settings.
     * @returns Returns the decorator method.
     */
    Dependency(settings) {
        return this.dim.Describe(settings);
    }
    /**
     * Decorates the specified class to be injected by the specified application dependencies.
     * @param list List of dependencies.
     * @returns Returns the decorator method.
     */
    Inject(...list) {
        return this.dim.Inject(...list);
    }
    /**
     * Adds a generic route handler into this application.
     * @param handler Handler class type.
     * @returns Returns the own instance.
     */
    addHandler(handler, ...parameters) {
        if (this.started) {
            throw new Error(`To add new handlers the application must be stopped.`);
        }
        const routes = Main_1.routes.get(handler.prototype.constructor) || [];
        for (const route of routes) {
            switch (route.type) {
                case 'filter':
                    this.filters.add({
                        ...route.action,
                        onMatch: async (match) => {
                            const allowed = (await this.performHandler(handler, route.method, parameters, match)) === true;
                            match.detail.granted = (await this.filterHandler(match, allowed)) && allowed === true;
                        }
                    });
                    break;
                case 'processor':
                    this.processors.add({
                        ...route.action,
                        exact: route.action.exact === void 0 ? true : route.action.exact,
                        onMatch: async (match) => {
                            const callback = this.performHandler.bind(this, handler, route.method, parameters);
                            await this.processHandler(match, callback);
                        }
                    });
                    break;
                default:
                    throw new TypeError(`Unsupported route type ${route.type}`);
            }
        }
        return this;
    }
    /**
     * Adds a service handler into this application.
     * @param instance Service class type or instance.
     * @returns Returns the service instance.
     */
    addService(service, ...parameters) {
        if (this.started) {
            throw new Error(`To add new services the application must be stopped.`);
        }
        if (service instanceof Function) {
            service = new service(...parameters);
        }
        this.services.push(service);
        return service;
    }
    /**
     * Adds a logger handler into this application.
     * @param logger Logger class type or instance.
     * @returns Returns the logger instance.
     */
    addLogger(logger, ...parameters) {
        if (this.started) {
            throw new Error(`To add new loggers service the application must be stopped.`);
        }
        if (logger instanceof Function) {
            logger = new logger(...parameters);
        }
        this.loggers.push(logger);
        return logger;
    }
    /**
     * Starts the application with all included services.
     * @returns Returns the own instance.
     */
    start() {
        if (this.started) {
            throw new Error(`The application is already initialized.`);
        }
        this.notifyAction('start');
        for (const service of this.services) {
            service.onReceive.subscribe(this.receiveHandlerListener);
            service.onSend.subscribe(this.sendHandlerListener);
            service.onError.subscribe(this.errorHandlerListener);
            service.start();
        }
        this.started = true;
        return this;
    }
    /**
     * Stops the application and all included services.
     * @returns Returns the own instance.
     */
    stop() {
        if (!this.started) {
            throw new Error(`The application is not initialized.`);
        }
        for (const service of this.services) {
            service.stop();
            service.onReceive.unsubscribe(this.receiveHandlerListener);
            service.onSend.unsubscribe(this.sendHandlerListener);
            service.onError.unsubscribe(this.errorHandlerListener);
        }
        this.started = false;
        this.notifyAction('stop');
        return this;
    }
    /**
     * Decorates the specified member to filter an application request.
     * @param action Filter action settings.
     * @returns Returns the decorator method.
     */
    static Filter(action) {
        return (prototype, property, descriptor) => {
            if (!(descriptor.value instanceof Function)) {
                throw new TypeError(`Only methods are allowed as filters.`);
            }
            this.addRoute(prototype.constructor, {
                type: 'filter',
                action: action,
                method: property
            });
        };
    }
    /**
     * Decorates the specified member to process an application request.
     * @param action Route action settings.
     * @returns Returns the decorator method.
     */
    static Processor(action) {
        return (prototype, property, descriptor) => {
            if (!(descriptor.value instanceof Function)) {
                throw new TypeError(`Only methods are allowed as processors.`);
            }
            this.addRoute(prototype.constructor, {
                type: 'processor',
                action: action,
                method: property
            });
        };
    }
};
/**
 * Global routes.
 */
Main.routes = new WeakMap();
__decorate([
    Class.Private()
], Main.prototype, "started", void 0);
__decorate([
    Class.Private()
], Main.prototype, "dim", void 0);
__decorate([
    Class.Private()
], Main.prototype, "services", void 0);
__decorate([
    Class.Private()
], Main.prototype, "loggers", void 0);
__decorate([
    Class.Private()
], Main.prototype, "filters", void 0);
__decorate([
    Class.Private()
], Main.prototype, "processors", void 0);
__decorate([
    Class.Private()
], Main.prototype, "receiveHandlerListener", void 0);
__decorate([
    Class.Private()
], Main.prototype, "sendHandlerListener", void 0);
__decorate([
    Class.Private()
], Main.prototype, "errorHandlerListener", void 0);
__decorate([
    Class.Private()
], Main.prototype, "notifyRequest", null);
__decorate([
    Class.Private()
], Main.prototype, "notifyAction", null);
__decorate([
    Class.Private()
], Main.prototype, "performHandler", null);
__decorate([
    Class.Private()
], Main.prototype, "performFilters", null);
__decorate([
    Class.Private()
], Main.prototype, "receiveHandler", null);
__decorate([
    Class.Private()
], Main.prototype, "sendHandler", null);
__decorate([
    Class.Private()
], Main.prototype, "errorHandler", null);
__decorate([
    Class.Protected()
], Main.prototype, "filterHandler", null);
__decorate([
    Class.Protected()
], Main.prototype, "processHandler", null);
__decorate([
    Class.Protected()
], Main.prototype, "Dependency", null);
__decorate([
    Class.Protected()
], Main.prototype, "Inject", null);
__decorate([
    Class.Protected()
], Main.prototype, "addHandler", null);
__decorate([
    Class.Protected()
], Main.prototype, "addService", null);
__decorate([
    Class.Protected()
], Main.prototype, "addLogger", null);
__decorate([
    Class.Protected()
], Main.prototype, "start", null);
__decorate([
    Class.Protected()
], Main.prototype, "stop", null);
__decorate([
    Class.Private()
], Main, "routes", void 0);
__decorate([
    Class.Private()
], Main, "addRoute", null);
__decorate([
    Class.Public()
], Main, "Filter", null);
__decorate([
    Class.Public()
], Main, "Processor", null);
Main = Main_1 = __decorate([
    Class.Describe()
], Main);
exports.Main = Main;

}},
"@singleware/jsx/helpers/browser":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const common_1 = require("./common");
/**
 * Provides methods to help Browser DOM.
 */
let Helper = class Helper extends Class.Null {
    /**
     * Assign the specified properties into the given element.
     * @param element Element instance.
     * @param properties Element properties.
     */
    static assignProperties(element, properties) {
        for (const property in properties) {
            if (properties[property] !== void 0) {
                if (property in element) {
                    element[property] = properties[property];
                }
                else {
                    const event = property.toLowerCase();
                    if (this.eventMap.includes(event)) {
                        element.addEventListener(event.substr(2), properties[property]);
                    }
                    else {
                        element.setAttribute(property, properties[property]);
                    }
                }
            }
        }
    }
    /**
     * Creates a native element with the specified type.
     * @param type Element type.
     * @param properties Element properties.
     * @param children Children list.
     * @returns Returns the element instance.
     */
    static createFromElement(type, properties, ...children) {
        const element = this.append(document.createElement(type), ...children);
        if (properties) {
            this.assignProperties(element, properties);
        }
        return element;
    }
    /**
     * Decorates the specified class to be a custom element.
     * @param name Tag name.
     * @returns Returns the decorator method.
     */
    static Describe(name) {
        return (type) => {
            window.customElements.define(name, type);
            return type;
        };
    }
    /**
     * Creates an element by the specified type.
     * @param type Component type or native element tag name.
     * @param properties Element properties.
     * @param children Element children.
     * @throws Throws a type error when the element or component type is unsupported.
     */
    static create(type, properties, ...children) {
        if (type instanceof Function) {
            return new type(properties, children).element;
        }
        else if (typeof type === 'string') {
            return this.createFromElement(type, properties, ...children);
        }
        else {
            throw new TypeError(`Unsupported element or component type "${type}"`);
        }
    }
    /**
     * Appends the specified children into the given parent element.
     * @param parent Parent element.
     * @param children Children elements.
     * @returns Returns the parent element.
     * @throws Throws a type error when the child type is unsupported.
     */
    static append(parent, ...children) {
        for (const child of children) {
            if (child instanceof Node) {
                parent.appendChild(child);
            }
            else if (child instanceof NodeList || child instanceof Array) {
                this.append(parent, ...child);
            }
            else if (typeof child === 'string' || typeof child === 'number') {
                this.renderer.innerHTML = child.toString();
                this.append(parent, ...this.renderer.childNodes);
            }
            else if (child) {
                const node = child.element;
                if (node instanceof Node) {
                    this.append(parent, node);
                }
                else if (node instanceof Array) {
                    this.append(parent, ...node);
                }
                else {
                    throw new TypeError(`Unsupported child type "${child}"`);
                }
            }
        }
        return parent;
    }
    /**
     * Clear all children of the specified element.
     * @param element Element instance.
     * @returns Returns the cleared element instance.
     */
    static clear(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        return element;
    }
    /**
     * Unwraps the specified element into its parent.
     * @param element Element instance.
     * @throws Throws an error when the specified element has no parent.
     */
    static unwrap(element) {
        const parent = element.parentElement;
        if (!parent) {
            throw new Error(`The specified element has no parent.`);
        }
        while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        element.remove();
        parent.normalize();
    }
    /**
     * Determines whether the specified node is child of the given parent element.
     * @param parent Parent element.
     * @param node Child node.
     * @returns Returns true when the specified node is child of the given parent, false otherwise.
     */
    static childOf(parent, node) {
        while (node && node.parentElement) {
            if (node.parentElement === parent) {
                return true;
            }
            node = node.parentElement;
        }
        return false;
    }
    /**
     * Escape any special HTML characters in the given input string.
     * @param input Input string.
     * @returns Returns the escaped input string.
     */
    static escape(input) {
        return common_1.Common.escape(input);
    }
};
/**
 * Known events to automate listeners.
 */
Helper.eventMap = [
    // Form events
    'onblur',
    'onchange',
    'oncontextmenu',
    'onfocus',
    'oninput',
    'oninvalid',
    'onreset',
    'onsearch',
    'onselect',
    'onsubmit',
    // Keyboard events
    'onkeydown',
    'onkeypress',
    'onkeyup',
    // Mouse events
    'onclick',
    'ondblclick',
    'onmousedown',
    'onmousemove',
    'onmouseout',
    'onmouseover',
    'onmouseup',
    'onmousewheel',
    'onwheel',
    // Drag events
    'ondrag',
    'ondragend',
    'ondragenter',
    'ondragleave',
    'ondragover',
    'ondragstart',
    'ondrop',
    'onscroll',
    // Clipboard events
    'oncopy',
    'oncut',
    'onpaste',
    // Media events
    'onabort',
    'oncanplay',
    'oncanplaythrough',
    'oncuechange',
    'ondurationchange',
    'onemptied',
    'onended',
    'onerror',
    'onloadeddata',
    'onloadedmetadata',
    'onloadstart',
    'onpause',
    'onplay',
    'onplaying',
    'onprogress',
    'onratechange',
    'onseeked',
    'onseeking',
    'onstalled',
    'onsuspend',
    'ontimeupdate',
    'onvolumechange',
    'onwaiting',
    // Misc events
    'ontoggle',
    'onslotchange'
];
/**
 * Renderer for temp elements.
 */
Helper.renderer = document.createElement('body');
__decorate([
    Class.Private()
], Helper, "eventMap", void 0);
__decorate([
    Class.Private()
], Helper, "renderer", void 0);
__decorate([
    Class.Private()
], Helper, "assignProperties", null);
__decorate([
    Class.Private()
], Helper, "createFromElement", null);
__decorate([
    Class.Public()
], Helper, "Describe", null);
__decorate([
    Class.Public()
], Helper, "create", null);
__decorate([
    Class.Public()
], Helper, "append", null);
__decorate([
    Class.Public()
], Helper, "clear", null);
__decorate([
    Class.Public()
], Helper, "unwrap", null);
__decorate([
    Class.Public()
], Helper, "childOf", null);
__decorate([
    Class.Public()
], Helper, "escape", null);
Helper = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;

}},
"@singleware/jsx/helpers/common":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Provides any common methods to help Browser and Text DOM.
 */
let Common = class Common extends Class.Null {
    /**
     * Escape any special HTML character in the given input string.
     * @param input Input string.
     * @returns Returns the escaped input string.
     */
    static escape(input) {
        return input.replace(/\"|\'|\<|\>|\&/gi, (match) => {
            switch (match) {
                case '"':
                    return '&quot;';
                case "'":
                    return '&39;';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
            }
            return match;
        });
    }
};
__decorate([
    Class.Public()
], Common, "escape", null);
Common = __decorate([
    Class.Describe()
], Common);
exports.Common = Common;

}},
"@singleware/jsx/helpers/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Browser = require("./browser");
exports.Browser = Browser.Helper;
const Text = require("./text");
exports.Text = Text.Helper;

}},
"@singleware/jsx/helpers":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/jsx/helpers/text":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const common_1 = require("./common");
/**
 * Provides methods to help Text DOM.
 */
let Helper = class Helper extends Class.Null {
    /**
     * Gets a string with all given properties.
     * @param properties Element properties.
     * @returns Returns the element properties string.
     */
    static getProperties(properties) {
        let list = [];
        for (const property in properties) {
            if (properties[property] !== void 0) {
                list.push(`${property.toLowerCase()}="${this.escape(properties[property])}"`);
            }
        }
        return list.join(' ');
    }
    /**
     * Gets a string with all given children.
     * @param children Children list.
     * @returns Returns the children list string.
     * @throws Throws an error when the child type is not supported.
     */
    static getChildren(children) {
        let output = '';
        for (const child of children) {
            if (typeof child === 'string' || typeof child === 'number') {
                output += child;
            }
            else if (child instanceof Array) {
                output += this.getChildren(child);
            }
            else if (child) {
                const node = child.element;
                if (node) {
                    output += this.getChildren([node]);
                }
                else {
                    throw new TypeError(`Unsupported child type "${child}"`);
                }
            }
        }
        return output;
    }
    /**
     * Decorates the specified class to be a custom element.
     * @param name Tag name.
     * @returns Returns the decorator method.
     */
    static Describe(name) {
        return (type) => {
            return type;
        };
    }
    /**
     * Creates an element with the specified type.
     * @param type Component type or native element tag name.
     * @param properties Element properties.
     * @param children Element children.
     * @throws Throws an error when the element or component type is not supported.
     */
    static create(type, properties, ...children) {
        if (type instanceof Function) {
            return new type(properties, children).element;
        }
        else if (typeof type === 'string') {
            const attributes = this.getProperties(properties);
            const content = this.getChildren(children);
            if (content.length) {
                return `<${type}${attributes.length ? ` ${attributes}` : ''}>${content}</${type}>`;
            }
            else {
                return `<${type}${attributes.length ? ` ${attributes}` : ''}/>`;
            }
        }
        else {
            throw new TypeError(`Unsupported element or component type "${type}"`);
        }
    }
    /**
     * Appends the specified children into the given parent element. (Not supported in text mode)
     * @param parent Parent element.
     * @param children Children elements.
     * @returns Returns the parent element.
     * @throws Throws a type error when the child type is unsupported.
     */
    static append(parent, ...children) {
        throw new Error(`Operation not supported in text mode.`);
    }
    /**
     * Clear all children of the specified element. (Not supported in text mode)
     * @param element Element instance.
     * @returns Returns the cleared element instance.
     */
    static clear(element) {
        throw new Error(`Operation not supported in text mode.`);
    }
    /**
     * Unwraps the specified element into its parent.
     * @param element Element instance.
     * @throws Throws an error when the specified element has no parent.
     */
    static unwrap(element) {
        throw new Error(`Operation not supported in text mode.`);
    }
    /**
     * Determines whether the specified node is a child of the given parent element. (Not supported in text mode)
     * @param parent Parent element.
     * @param node Child node.
     * @returns Returns true when the specified node is child of the given parent, false otherwise.
     */
    static childOf(parent, node) {
        throw new Error(`Operation not supported in text mode.`);
    }
    /**
     * Escape any special HTML characters in the given input string.
     * @param input Input string.
     * @returns Returns the escaped input string.
     */
    static escape(input) {
        return common_1.Common.escape(input);
    }
};
__decorate([
    Class.Private()
], Helper, "getProperties", null);
__decorate([
    Class.Private()
], Helper, "getChildren", null);
__decorate([
    Class.Public()
], Helper, "Describe", null);
__decorate([
    Class.Public()
], Helper, "create", null);
__decorate([
    Class.Public()
], Helper, "append", null);
__decorate([
    Class.Public()
], Helper, "clear", null);
__decorate([
    Class.Public()
], Helper, "unwrap", null);
__decorate([
    Class.Public()
], Helper, "childOf", null);
__decorate([
    Class.Public()
], Helper, "escape", null);
Helper = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;

}},
"@singleware/jsx/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Current helper according to the environment.
 */
const Helper = require(`./helpers/${typeof window !== 'undefined' ? 'browser' : 'text'}`).Helper;
/**
 * Decorates the specified class to be a custom element.
 * @param name Tag name.
 * @returns Returns the decorator method.
 */
exports.Describe = (name) => Helper.Describe(name);
/**
 * Creates an element by the specified type.
 * @param type Component type or native element tag name.
 * @param properties Element properties.
 * @param children Element children.
 * @throws Throws a type error when the element or component type is unsupported.
 */
exports.create = (type, properties, ...children) => Helper.create(type, properties, ...children);
/**
 * Appends the specified children into the given parent element.
 * @param parent Parent element.
 * @param children Children elements.
 * @returns Returns the parent element.
 * @throws Throws a type error when the child type is unsupported.
 */
exports.append = (parent, ...children) => Helper.append(parent, ...children);
/**
 * Clear all children of the specified element.
 * @param element Element instance.
 * @returns Returns the cleared element instance.
 */
exports.clear = (element) => Helper.clear(element);
/**
 * Unwraps the specified element into its parent.
 * @param element Element instance.
 * @throws Throws an error when the specified element has no parent.
 */
exports.unwrap = (element) => Helper.unwrap(element);
/**
 * Determines whether the specified node is child of the given parent element.
 * @param parent Parent element.
 * @param node Child node.
 * @returns Returns true when the specified node is child of the given parent, false otherwise.
 */
exports.childOf = (parent, node) => Helper.childOf(parent, node);
/**
 * Escape any special HTML character in the given input string.
 * @param input Input string.
 * @returns Returns the escaped input string.
 */
exports.escape = (input) => Helper.escape(input);

}},
"@singleware/jsx":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/path/helper":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Path helper class.
 */
let Helper = class Helper extends Class.Null {
    /**
     * Normalizes the specified path.
     * @param path Path to be normalized.
     * @return Returns the normalized path.
     */
    static normalize(path) {
        if (path.length > 0) {
            const pieces = path.split(this.separator);
            const length = pieces.length;
            const newer = [];
            let last;
            for (let offset = 0; offset < length; ++offset) {
                const part = pieces[offset];
                if (newer.length === 0) {
                    newer.push((last = part));
                }
                else if (part !== '.') {
                    if (part === '..' && part !== last) {
                        if (last !== '') {
                            newer.pop();
                            last = newer[newer.length - 1];
                        }
                    }
                    else if (part.length > 0) {
                        if (last === '.') {
                            newer[newer.length - 1] = last = part;
                        }
                        else {
                            newer.push((last = part));
                        }
                    }
                    else if (offset + 1 === length) {
                        newer.push((last = part));
                    }
                }
            }
            return newer.join(this.separator);
        }
        return '.';
    }
    /**
     * Join the specified path list.
     * @param paths Path list.
     * @returns Returns the joined path.
     */
    static join(...paths) {
        return this.normalize(paths.filter((value) => value.length).join(this.separator));
    }
    /**
     * Resolves the last absolute path.
     * @param paths Path list.
     * @returns Returns the resolved path.
     */
    static resolve(...paths) {
        let resolved = '';
        for (const path of paths) {
            resolved = path[0] === this.separator ? this.normalize(path) : this.join(resolved, path);
        }
        return resolved;
    }
    /**
     * Gets the directory path of the specified path.
     * @param path Path for extraction.
     * @returns Returns the directory path.
     */
    static dirname(path) {
        const normalized = this.normalize(path);
        return normalized.substr(0, normalized.lastIndexOf(this.separator));
    }
    /**
     * Gets the directory name of the specified path.
     * @param path Path for extraction.
     * @returns Returns the directory name.
     */
    static basename(path) {
        const normalized = this.normalize(path);
        return normalized.substr(normalized.lastIndexOf(this.separator) + 1);
    }
    /**
     * Gets the extension name of the specified path.
     * @param path Path for extraction.
     * @returns Returns the extension name.
     */
    static extname(path) {
        const base = this.basename(path);
        return base[0] === '.' ? '' : base.substr(base.lastIndexOf('.') + 1);
    }
};
/**
 * Path separator.
 */
Helper.separator = '/';
__decorate([
    Class.Public()
], Helper, "separator", void 0);
__decorate([
    Class.Public()
], Helper, "normalize", null);
__decorate([
    Class.Public()
], Helper, "join", null);
__decorate([
    Class.Public()
], Helper, "resolve", null);
__decorate([
    Class.Public()
], Helper, "dirname", null);
__decorate([
    Class.Public()
], Helper, "basename", null);
__decorate([
    Class.Public()
], Helper, "extname", null);
Helper = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;

}},
"@singleware/path/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const helper_1 = require("./helper");
/**
 * Normalizes the specified path.
 * @param path Path to be normalized.
 * @return Returns the normalized path.
 */
exports.normalize = (path) => helper_1.Helper.normalize(path);
/**
 * Join the specified path list.
 * @param paths Path list.
 * @returns Returns the joined path.
 */
exports.join = (...paths) => helper_1.Helper.join(...paths);
/**
 * Resolves the last absolute path.
 * @param paths Path list.
 * @returns Returns the resolved path.
 */
exports.resolve = (...paths) => helper_1.Helper.resolve(...paths);
/**
 * Gets the directory path of the specified path.
 * @param path Path for extraction.
 * @returns Returns the directory path.
 */
exports.dirname = (path) => helper_1.Helper.dirname(path);
/**
 * Gets the directory name of the specified path.
 * @param path Path for extraction.
 * @returns Returns the directory name.
 */
exports.basename = (path) => helper_1.Helper.basename(path);
/**
 * Gets the extension name of the specified path.
 * @param path Path for extraction.
 * @returns Returns the extension name.
 */
exports.extname = (path) => helper_1.Helper.extname(path);

}},
"@singleware/path":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/frontend/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Services = require("./services");
exports.Services = Services;
const Module = require("./main");
exports.Main = Module.Main;
/**
 * Declarations.
 */
const Application = require("@singleware/application");
/**
 * Decorates the specified member to filter an application request. (Alias for Main.Filter)
 * @param action Filter action settings.
 * @returns Returns the decorator method.
 */
exports.Filter = (action) => Application.Main.Filter(action);
/**
 * Decorates the specified member to process an application request. (Alias for Main.Processor)
 * @param action Route action settings.
 * @returns Returns the decorator method.
 */
exports.Processor = (action) => Application.Main.Processor(action);

}},
"@singleware/frontend":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/frontend/main":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Application = require("@singleware/application");
const JSX = require("@singleware/jsx");
/**
 * Frontend main application class.
 */
let Main = class Main extends Application.Main {
    /**
     * Default constructor.
     * @param settings Application settings.
     */
    constructor(settings) {
        super({ separator: '/', variable: /^\{([a-zA-Z_0-9]+)\}$/ });
        /**
         * Current script list.
         */
        this.scriptList = [];
        /**
         * Current style list.
         */
        this.styleList = [];
        this.settings = settings;
    }
    /**
     * Clear the specified list of elements by removing them from their parents.
     * @param list List of elements.
     */
    clearElements(list) {
        while (list.length) {
            list.pop().remove();
        }
    }
    /**
     * Set any output script from the specified output in the current document.
     * @param output Output information.
     */
    setScripts(output) {
        this.clearElements(this.scriptList);
        if (output.scripts) {
            for (const url of output.scripts) {
                const script = JSX.create('script', { src: url });
                JSX.append(document.head, script);
                this.scriptList.push(script);
            }
        }
    }
    /**
     * Set any output style from the specified output in the current document.
     * @param output Output information.
     */
    setStyles(output) {
        this.clearElements(this.styleList);
        if (output.styles) {
            for (const url of output.styles) {
                const style = JSX.create('link', { href: url, rel: 'stylesheet', type: 'text/css' });
                JSX.append(document.head, style);
                this.styleList.push(style);
            }
        }
    }
    /**
     * Set any defined title from the specified output in the current document.
     * @param output Output information.
     */
    setTitle(output) {
        if (output.subtitle) {
            if (this.settings.title.prefix) {
                document.title = `${this.settings.title.text}${this.settings.title.separator}${output.subtitle}`;
            }
            else {
                document.title = `${output.subtitle}${this.settings.title.separator}${this.settings.title.text}`;
            }
        }
        else {
            document.title = this.settings.title.text;
        }
    }
    /**
     * Process event handler.
     * @param match Matched routes.
     * @param callback Handler callback.
     */
    async processHandler(match, callback) {
        const request = match.detail;
        await super.processHandler(match, callback);
        if (request.error) {
            throw request.error;
        }
        else {
            this.setTitle(request.output);
            this.setScripts(request.output);
            this.setStyles(request.output);
            JSX.append(JSX.clear(this.settings.body || document.body), request.output.content);
            history.pushState(match.variables.state, document.title, match.detail.path);
        }
    }
};
__decorate([
    Class.Private()
], Main.prototype, "settings", void 0);
__decorate([
    Class.Private()
], Main.prototype, "scriptList", void 0);
__decorate([
    Class.Private()
], Main.prototype, "styleList", void 0);
__decorate([
    Class.Private()
], Main.prototype, "clearElements", null);
__decorate([
    Class.Private()
], Main.prototype, "setScripts", null);
__decorate([
    Class.Private()
], Main.prototype, "setStyles", null);
__decorate([
    Class.Private()
], Main.prototype, "setTitle", null);
__decorate([
    Class.Protected()
], Main.prototype, "processHandler", null);
Main = __decorate([
    Class.Describe()
], Main);
exports.Main = Main;

}},
"@singleware/frontend/services/client":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Observable = require("@singleware/observable");
const navigator_1 = require("./navigator");
/**
 * Front-end client class.
 */
let Client = class Client extends Class.Null {
    /**
     * Default constructor.
     * @param settings Application settings.
     */
    constructor(settings) {
        super();
        /**
         * Navigator instance.
         */
        this.navigation = new navigator_1.Navigator(this);
        /**
         * Receive subject instance.
         */
        this.receiveSubject = new Observable.Subject();
        /**
         * Send subject instance.
         */
        this.sendSubject = new Observable.Subject();
        /**
         * Error subject instance.
         */
        this.errorSubject = new Observable.Subject();
        this.settings = settings;
    }
    /**
     * Gets the current opened path.
     */
    get path() {
        return this.navigation.path;
    }
    /**
     * Gets the navigator instance.
     */
    get navigator() {
        return this.navigation;
    }
    /**
     * Receive request event.
     */
    get onReceive() {
        return this.receiveSubject;
    }
    /**
     * Send response event.
     */
    get onSend() {
        return this.sendSubject;
    }
    /**
     * Error response event.
     */
    get onError() {
        return this.errorSubject;
    }
    /**
     * Starts the service.
     */
    start() {
        this.navigation.open(this.settings.path || location.pathname);
    }
    /**
     * Stops the service.
     */
    stop() { }
};
__decorate([
    Class.Private()
], Client.prototype, "settings", void 0);
__decorate([
    Class.Private()
], Client.prototype, "navigation", void 0);
__decorate([
    Class.Private()
], Client.prototype, "receiveSubject", void 0);
__decorate([
    Class.Private()
], Client.prototype, "sendSubject", void 0);
__decorate([
    Class.Private()
], Client.prototype, "errorSubject", void 0);
__decorate([
    Class.Public()
], Client.prototype, "path", null);
__decorate([
    Class.Public()
], Client.prototype, "navigator", null);
__decorate([
    Class.Public()
], Client.prototype, "onReceive", null);
__decorate([
    Class.Public()
], Client.prototype, "onSend", null);
__decorate([
    Class.Public()
], Client.prototype, "onError", null);
__decorate([
    Class.Public()
], Client.prototype, "start", null);
__decorate([
    Class.Public()
], Client.prototype, "stop", null);
Client = __decorate([
    Class.Describe()
], Client);
exports.Client = Client;

}},
"@singleware/frontend/services/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var client_1 = require("./client");
exports.Client = client_1.Client;
var navigator_1 = require("./navigator");
exports.Navigator = navigator_1.Navigator;

}},
"@singleware/frontend/services":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/frontend/services/navigator":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Path = require("@singleware/path");
/**
 * Front-end navigator class.
 */
let Navigator = class Navigator extends Class.Null {
    /**
     * Default constructor.
     * @param client Client instance.
     */
    constructor(client) {
        super();
        /**
         * Current opened path.
         */
        this.openedPath = '';
        this.client = client;
    }
    /**
     * Current opened path.
     */
    get path() {
        return this.openedPath;
    }
    /**
     * Opens the specified path.
     * @param path Path to be opened.
     */
    open(path) {
        this.openedPath = Path.resolve(Path.dirname(this.openedPath), path);
        this.client.onReceive.notifyAll({
            path: this.openedPath,
            input: {},
            output: {},
            environment: {
                local: {},
                shared: {}
            },
            granted: true
        });
    }
};
__decorate([
    Class.Private()
], Navigator.prototype, "client", void 0);
__decorate([
    Class.Private()
], Navigator.prototype, "openedPath", void 0);
__decorate([
    Class.Public()
], Navigator.prototype, "path", null);
__decorate([
    Class.Public()
], Navigator.prototype, "open", null);
Navigator = __decorate([
    Class.Describe()
], Navigator);
exports.Navigator = Navigator;

}},
"@singleware/oss/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var style_1 = require("./style");
exports.Style = style_1.Style;
var stylesheet_1 = require("./stylesheet");
exports.Stylesheet = stylesheet_1.Stylesheet;

}},
"@singleware/oss":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/oss/selector":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

}},
"@singleware/oss/style":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Style class.
 */
let Style = class Style extends Class.Null {
};
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "alignContent", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "alignItems", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "alignSelf", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "all", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "animation", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "animationDelay", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "animationDirection", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "animationDuration", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "animationFillMode", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "animationIterationCount", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "animationName", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "animationPlayState", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "animationTimingFunction", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backfaceVisibility", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "background", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backgroundAttachment", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backgroundBlendMode", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backgroundClip", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backgroundColor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backgroundImage", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backgroundOrigin", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backgroundPosition", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backgroundRepeat", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "backgroundSize", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "blockSize", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "border", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderBottom", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderBottomColor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderBottomLeftRadius", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderBottomRightRadius", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderBottomStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderBottomWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderCollapse", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderColor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderImage", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderImageOutset", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderImageRepeat", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderImageSlice", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderImageSource", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderImageWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderLeft", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderLeftColor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderLeftStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderLeftWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderRadius", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderRight", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderRightColor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderRightStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderRightWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderSpacing", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderTop", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderTopColor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderTopLeftRadius", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderTopRightRadius", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderTopStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderTopWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "borderWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "bottom", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "boxDecorationBreak", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "boxShadow", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "boxSizing", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "captionSide", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "clip", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "color", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columnCount", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columnFill", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columnGap", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columnRule", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columnRuleColor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columnRuleStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columnRuleWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columns", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columnSpan", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "columnWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "content", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "counterIncrement", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "counterReset", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "cursor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "direction", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "display", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "emptyCells", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "filter", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "flex", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "flexBasis", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "flexDirection", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "flexFlow", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "flexGrow", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "flexShrink", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "flexWrap", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "float", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "font", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "fontFamily", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "fontSize", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "fontSizeAdjust", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "fontStretch", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "fontStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "fontVariant", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "fontWeight", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "hangingPunctuation", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "height", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "hyphens", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "isolation", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "justifyContent", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "left", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "letterSpacing", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "lineHeight", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "listStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "listStyleImage", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "listStylePosition", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "listStyleType", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "margin", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "marginBottom", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "marginLeft", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "marginRight", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "marginTop", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "maxHeight", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "maxWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "minHeight", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "minWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "objectFit", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "opacity", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "order", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "orphans", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "outline", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "outlineColor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "outlineOffset", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "outlineStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "outlineWidth", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "overflow", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "overflowX", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "overflowY", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "padding", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "paddingBottom", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "paddingLeft", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "paddingRight", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "paddingTop", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "pageBreakAfter", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "pageBreakBefore", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "pageBreakInside", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "perspective", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "position", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "quotes", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "resize", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "right", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "tableLayout", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "tabSize", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textAlign", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textAlignLast", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textDecoration", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textDecorationColor", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textDecorationLine", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textDecorationStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textIndent", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textJustify", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textOverflow", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textShadow", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "textTransform", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "top", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "transform", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "transformOrigin", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "transformStyle", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "transition", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "transitionDelay", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "transitionDuration", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "transitionProperty", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "transitionTimingFunction", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "unicodeBidi", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "userSelect", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "verticalAlign", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "visibility", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "whiteSpace", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "width", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "wordBreak", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "wordSpacing", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "wordWrap", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "windows", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "zIndex", void 0);
__decorate([
    Class.Public(),
    Class.Property()
], Style.prototype, "zoom", void 0);
Style = __decorate([
    Class.Describe()
], Style);
exports.Style = Style;

}},
"@singleware/oss/stylesheet":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Stylesheet_1;
"use strict";
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const style_1 = require("./style");
/**
 * Stylesheet class.
 */
let Stylesheet = Stylesheet_1 = class Stylesheet extends Class.Null {
    /**
     * Stylesheet class.
     */
    constructor() {
        super(...arguments);
        /**
         * Map of selectors.
         */
        this.selectorMap = {};
    }
    /**
     * Gets the representative string of the specified style object.
     * @param style Style object.
     * @returns Returns the representative string generated by the given style object.
     */
    static getStyleCode(style) {
        const properties = [];
        for (const property in style) {
            const value = style[property];
            if (value !== void 0) {
                const propertyName = property.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
                const propertyValue = value instanceof Array ? value.join(',') : value;
                properties.push(`${propertyName}:${propertyValue}`);
            }
        }
        return properties.join(';');
    }
    /**
     * Returns a new style for the specified selector path.
     * @param selectors Selectors path.
     * @returns Returns the style object.
     */
    select(...selectors) {
        const path = selectors.join(',');
        if (this.selectorMap[path] === void 0) {
            this.selectorMap[path] = new style_1.Style();
        }
        return this.selectorMap[path];
    }
    /**
     * Remove all styles from this stylesheet.
     */
    clear() {
        this.selectorMap = {};
    }
    /**
     * Convert all styles from this stylesheet to its representative code.
     * @returns Returns the representation code of this stylesheet.
     */
    toString() {
        const stylesheet = [];
        for (const name in this.selectorMap) {
            stylesheet.push(`${name}{${Stylesheet_1.getStyleCode(this.selectorMap[name])}}`);
        }
        return stylesheet.join('');
    }
};
__decorate([
    Class.Private()
], Stylesheet.prototype, "selectorMap", void 0);
__decorate([
    Class.Public()
], Stylesheet.prototype, "select", null);
__decorate([
    Class.Public()
], Stylesheet.prototype, "clear", null);
__decorate([
    Class.Public()
], Stylesheet.prototype, "toString", null);
__decorate([
    Class.Private()
], Stylesheet, "getStyleCode", null);
Stylesheet = Stylesheet_1 = __decorate([
    Class.Describe()
], Stylesheet);
exports.Stylesheet = Stylesheet;

}},
"@singleware/ui-control/component":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Component class.
 */
let Component = class Component extends Class.Null {
    /**
     * Default constructor.
     * @param properties Initial properties.
     * @param children Initial children.
     */
    constructor(properties, children) {
        super();
        this.properties = Object.freeze(properties || {});
        this.children = Object.freeze(children || []);
    }
    /**
     * Gets the property descriptor that corresponds to the specified property name and prototype source.
     * @param prototype Prototype source.
     * @param property Property name.
     * @returns Returns the corresponding property descriptor or undefined when the property was not found.
     */
    getPropertyDescriptor(prototype, property) {
        let descriptor;
        while (!(descriptor = Object.getOwnPropertyDescriptor(prototype, property))) {
            if (!(prototype = Reflect.getPrototypeOf(prototype))) {
                break;
            }
        }
        return descriptor;
    }
    /**
     * Binds the property descriptor from the specified prototype to be called with this instance context.
     * @param prototype Source prototype.
     * @param property Property name.
     * @returns Returns a new property descriptor.
     * @throws Throws an error when the specified property was not found.
     */
    bindDescriptor(prototype, property) {
        const descriptor = this.getPropertyDescriptor(prototype, property);
        if (!descriptor) {
            throw new Error(`Property '${property}' was not found.`);
        }
        const newer = { ...descriptor };
        if (newer.value) {
            newer.value = newer.value.bind(this);
        }
        else {
            if (newer.get) {
                newer.get = newer.get.bind(this);
            }
            if (newer.set) {
                newer.set = newer.set.bind(this);
            }
        }
        return newer;
    }
    /**
     * Bind all specified properties from this instance into the target object.
     * @param target Target object.
     * @param properties Properties to be assigned.
     */
    bindComponentProperties(target, properties) {
        const prototype = Reflect.getPrototypeOf(this);
        for (const property of properties) {
            Reflect.defineProperty(target, property, this.bindDescriptor(prototype, property));
        }
    }
    /**
     * Assign all mapped values by the specified properties into this instance.
     * @param values Values to be assigned.
     * @param properties Properties to be assigned.
     * @throws Throws an error when some specified property does not exists in this instance.
     */
    assignComponentProperties(values, properties) {
        for (const property of properties) {
            if (property in values) {
                if (!(property in this)) {
                    throw new Error(`Property '${property}' can't be assigned.`);
                }
                this[property] = values[property];
            }
        }
    }
    /**
     * Gets the component instance.
     * @throws Always throw an exception when not implemented.
     */
    get element() {
        throw new Error(`Component not implemented.`);
    }
};
__decorate([
    Class.Protected()
], Component.prototype, "properties", void 0);
__decorate([
    Class.Protected()
], Component.prototype, "children", void 0);
__decorate([
    Class.Private()
], Component.prototype, "getPropertyDescriptor", null);
__decorate([
    Class.Private()
], Component.prototype, "bindDescriptor", null);
__decorate([
    Class.Protected()
], Component.prototype, "bindComponentProperties", null);
__decorate([
    Class.Protected()
], Component.prototype, "assignComponentProperties", null);
__decorate([
    Class.Public()
], Component.prototype, "element", null);
Component = __decorate([
    Class.Describe()
], Component);
exports.Component = Component;

}},
"@singleware/ui-control/element":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Element class.
 */
let Element = class Element extends HTMLElement {
    /**
     * Gets the first child element in the specified slot element.
     * @param slot Slot element.
     * @param required Determines whether the child is required or not.
     * @throws Throws an error when there are no children in the specified slot and the child is required.
     * @returns Returns the first child element or undefined when the child was not found.
     */
    getChildElement(slot, required) {
        const child = slot.assignedNodes()[0];
        if (!child && required) {
            throw new Error(`There are no children in the '${slot.name}' slot.`);
        }
        return child;
    }
    /**
     * Gets the first child element in the specified slot element.
     * @param slot Slot element.
     * @throws Throws an error when there are no children in the specified slo.
     * @returns Returns the first child element.
     */
    getRequiredChildElement(slot) {
        return this.getChildElement(slot, true);
    }
    /**
     * Gets the specified property from the first child in the given slot element.
     * @param slot Slot element.
     * @param property Property name.
     * @param required Determines whether the property is required or not.
     * @throws Throws an error when there are no children in the specified slot and the property is required.
     * @returns Returns the property value.
     */
    getChildProperty(slot, property, required) {
        return this.getChildElement(slot, required)[property];
    }
    /**
     * Gets the specified property from the first child in the given slot element.
     * @param slot Slot element.
     * @param property Property name.
     * @throws Throws an error when there are no children in the specified slot.
     * @returns Returns the property value.
     */
    getRequiredChildProperty(slot, property) {
        return this.getChildProperty(slot, property, true);
    }
    /**
     * Sets the specified property into the first child in the given slot element.
     * @param slot Slot element.
     * @param property Property name.
     * @param value Property value.
     * @param required Determines whether the child is required or not.
     * @throws Throws an error when there are no children in the specified slot and the child is required.
     * @returns Returns true when the specified property has been assigned, false otherwise.
     */
    setChildProperty(slot, property, value, required) {
        const child = this.getChildElement(slot, required);
        if (property in child) {
            child[property] = value;
            return true;
        }
        return false;
    }
    /**
     * Sets the specified property into the first child in the given slot element.
     * @param slot Slot element.
     * @param property Property name.
     * @param value Property value.
     * @throws Throws an error when there are no children in the specified slot.
     * @returns Returns true when the specified property has been assigned, false otherwise.
     */
    setRequiredChildProperty(slot, property, value) {
        return this.setChildProperty(slot, property, value, true);
    }
    /**
     * Calls the specified method from the first child in the given slot element.
     * @param slot Slot element.
     * @param method Method name.
     * @param parameters Method parameters.
     * @param required Determines whether the child is required or not.
     * @throws Throws an error when there are no children in the specified slot and the child is required.
     * @returns Returns the same value from the performed method.
     */
    callChildMethod(slot, method, parameters, required) {
        const child = this.getChildElement(slot, required);
        if (child[method] instanceof Function) {
            return child[method](...parameters);
        }
        return void 0;
    }
    /**
     * Calls the specified method from the first child in the given slot element.
     * @param slot Slot element.
     * @param method Method name.
     * @param parameters Method parameters.
     * @throws Throws an error when there are no children in the specified slot.
     * @returns Returns the same value from the performed method.
     */
    callRequiredChildMethod(slot, method, parameters) {
        return this.callChildMethod(slot, method, parameters, true);
    }
    /**
     * Updates the specified property name with the given value in the element.
     * @param property Property name.
     * @param value Property value.
     */
    updatePropertyState(property, value) {
        if (value) {
            this.setAttribute(property, value === true ? '' : value);
        }
        else {
            this.removeAttribute(property);
        }
    }
    /**
     * Update all element's children width the specified property name and value.
     * @param property Property name.
     * @param value Property value.
     */
    updateChildrenState(property, value) {
        for (const child of this.children) {
            if (property in child) {
                child[property] = value;
            }
        }
    }
};
__decorate([
    Class.Protected()
], Element.prototype, "getChildElement", null);
__decorate([
    Class.Protected()
], Element.prototype, "getRequiredChildElement", null);
__decorate([
    Class.Protected()
], Element.prototype, "getChildProperty", null);
__decorate([
    Class.Protected()
], Element.prototype, "getRequiredChildProperty", null);
__decorate([
    Class.Protected()
], Element.prototype, "setChildProperty", null);
__decorate([
    Class.Protected()
], Element.prototype, "setRequiredChildProperty", null);
__decorate([
    Class.Protected()
], Element.prototype, "callChildMethod", null);
__decorate([
    Class.Protected()
], Element.prototype, "callRequiredChildMethod", null);
__decorate([
    Class.Protected()
], Element.prototype, "updatePropertyState", null);
__decorate([
    Class.Protected()
], Element.prototype, "updateChildrenState", null);
Element = __decorate([
    Class.Describe()
], Element);
exports.Element = Element;

}},
"@singleware/ui-control/helper":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Control helper class.
 */
let Helper = class Helper extends Class.Null {
    /**
     * List all children of the expected type in the provided element slot and performs the given callback for each child.
     * @param slot Element slot.
     * @param type Expected instance type.
     * @param callback Callback to be performed.
     * @returns Returns the same value returned by the callback or undefined if the callback has no returns.
     */
    static listChildrenByType(slot, type, callback) {
        const children = slot.assignedNodes();
        for (const child of children) {
            if (child instanceof type) {
                const result = callback(child);
                if (result !== void 0) {
                    return result;
                }
            }
        }
        return void 0;
    }
    /**
     * List all children that contains the expected property in the provided element slot and performs the given callback for each child.
     * @param slot Element slot.
     * @param property Expected property.
     * @param callback Callback to be executed for each child.
     * @returns Returns the same value returned by the callback or undefined if the callback has no returns.
     */
    static listChildrenByProperty(slot, property, callback) {
        return this.listChildrenByType(slot, HTMLElement, (child) => {
            if (property in child) {
                const result = callback(child);
                if (result !== void 0) {
                    return result;
                }
            }
        });
    }
    /**
     * Gets the first child of the expected type from the specified element slot.
     * @param slot Element slot.
     * @param type Expected instance type.
     * @returns Returns the first child or undefined when there is no child found.
     */
    static getChildByType(slot, type) {
        return this.listChildrenByType(slot, type, (child) => child);
    }
    /**
     * Gets the first child that contains the expected property from the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @returns Returns the first child or undefined when there is no child found.
     */
    static getChildByProperty(slot, property) {
        return this.listChildrenByProperty(slot, property, (child) => child);
    }
    /**
     * Gets the property value from the first child that contains the expected property in the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @returns Returns the property value or undefined when there is no child found.
     */
    static getChildProperty(slot, property) {
        const child = this.getChildByProperty(slot, property);
        return child ? child[property] : void 0;
    }
    /**
     * Sets the specified property value to all elements in the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @param value New property value.
     */
    static setChildrenProperty(slot, property, value) {
        this.listChildrenByProperty(slot, property, (child) => {
            child[property] = value;
        });
    }
    /**
     * Sets the property value into the first child that contains the expected property in the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @param value New property value.
     * @returns Returns true when the child was found and updated, false otherwise.
     */
    static setChildProperty(slot, property, value) {
        const child = this.getChildByProperty(slot, property);
        if (child) {
            child[property] = value;
            return true;
        }
        return false;
    }
};
__decorate([
    Class.Public()
], Helper, "listChildrenByType", null);
__decorate([
    Class.Public()
], Helper, "listChildrenByProperty", null);
__decorate([
    Class.Public()
], Helper, "getChildByType", null);
__decorate([
    Class.Public()
], Helper, "getChildByProperty", null);
__decorate([
    Class.Public()
], Helper, "getChildProperty", null);
__decorate([
    Class.Public()
], Helper, "setChildrenProperty", null);
__decorate([
    Class.Public()
], Helper, "setChildProperty", null);
Helper = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;

}},
"@singleware/ui-control/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var element_1 = require("./element");
exports.Element = element_1.Element;
var component_1 = require("./component");
exports.Component = component_1.Component;
const helper_1 = require("./helper");
/**
 * List all children of the expected type in the provided element slot and performs the given callback for each child.
 * @param slot Element slot.
 * @param type Expected instance type.
 * @param callback Callback to be performed.
 * @returns Returns the same value returned by the callback or undefined if the callback has no returns.
 */
exports.listChildrenByType = (slot, type, callback) => helper_1.Helper.listChildrenByType(slot, type, callback);
/**
 * List all children that contains the expected property in the provided element slot and performs the given callback for each child.
 * @param slot Element slot.
 * @param property Expected property.
 * @param callback Callback to be executed for each child.
 * @returns Returns the same value returned by the callback or undefined if the callback has no returns.
 */
exports.listChildrenByProperty = (slot, property, callback) => helper_1.Helper.listChildrenByProperty(slot, property, callback);
/**
 * Gets the first child of the expected type from the specified element slot.
 * @param slot Element slot.
 * @param type Expected instance type.
 * @returns Returns the first child or undefined when there is no child found.
 */
exports.getChildByType = (slot, type) => helper_1.Helper.getChildByType(slot, type);
/**
 * Gets the first child that contains the expected property from the specified element slot.
 * @param slot Element slot.
 * @param property Expected property.
 * @returns Returns the first child or undefined when there is no child found.
 */
exports.getChildByProperty = (slot, property) => helper_1.Helper.getChildByProperty(slot, property);
/**
 * Gets the property value from the first child that contains the expected property in the specified element slot.
 * @param slot Element slot.
 * @param property Expected property.
 * @returns Returns the property value or undefined when there is no child found.
 */
exports.getChildProperty = (slot, property) => helper_1.Helper.getChildProperty(slot, property);
/**
 * Sets the specified property value to all elements in the specified element slot.
 * @param slot Element slot.
 * @param property Expected property.
 * @param value New property value.
 */
exports.setChildrenProperty = (slot, property, value) => helper_1.Helper.setChildrenProperty(slot, property, value);
/**
 * Sets the property value into the first child that contains the expected property in the specified element slot.
 * @param slot Element slot.
 * @param property Expected property.
 * @param value New property value.
 * @returns Returns true when the child was found and updated, false otherwise.
 */
exports.setChildProperty = (slot, property, value) => helper_1.Helper.setChildProperty(slot, property, value);

}},
"@singleware/ui-control":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/ui-select/component":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
/**
 * Select component class.
 */
let Component = class Component extends Control.Component {
    /**
     * Default constructor.
     * @param properties Initial properties.
     * @param children Initial children.
     */
    constructor(properties, children) {
        super(properties, children);
        /**
         * Element instance.
         */
        this.skeleton = (JSX.create("swe-select", { class: this.properties.class, slot: this.properties.slot, name: this.properties.name, searchable: this.properties.searchable, required: this.properties.required, readOnly: this.properties.readOnly, disabled: this.properties.disabled, onFocus: this.properties.onFocus, onBlur: this.properties.onBlur, onChange: this.properties.onChange }, this.children));
        this.skeleton.addEventListener('renderoption', this.renderOptionHandler.bind(this));
        this.skeleton.addEventListener('renderselection', this.renderSelectionHandler.bind(this));
        this.skeleton.addEventListener('rendergroup', this.renderGroupHandler.bind(this));
        this.initialize();
    }
    /**
     * Render option, event handler.
     * @param event Event information.
     */
    renderOptionHandler(event) {
        if (this.properties.onRenderOption) {
            event.detail.element = this.properties.onRenderOption(event.detail.option);
        }
    }
    /**
     * Render selection, event handler.
     * @param event Event information.
     */
    renderSelectionHandler(event) {
        if (this.properties.onRenderSelection) {
            event.detail.element = this.properties.onRenderSelection(event.detail.option);
        }
    }
    /**
     * Render group, event handler.
     * @param event Event information.
     */
    renderGroupHandler(event) {
        if (this.properties.onRenderGroup) {
            event.detail.element = this.properties.onRenderGroup(event.detail.group);
        }
    }
    /**
     * Add the specified list of options.
     * @param options List of options.
     */
    addOptions(options) {
        for (const option of options) {
            if (typeof option !== 'string') {
                this.skeleton.addOption(option.value, option.label, { group: option.group, tags: option.tags, custom: option.custom });
            }
            else {
                this.skeleton.addOption(option, option);
            }
        }
    }
    /**
     * Initializes the select element adding options and selecting the specified value.
     */
    initialize() {
        if (this.properties.options) {
            this.addOptions(this.properties.options);
            if (this.properties.value) {
                this.skeleton.value = this.properties.value;
            }
        }
    }
    /**
     * Gets the element.
     */
    get element() {
        return this.skeleton;
    }
    /**
     * Gets the selected option.
     */
    get selection() {
        return this.skeleton.selection;
    }
    /**
     * Gets the current search.
     */
    get search() {
        return this.skeleton.search;
    }
    /**
     * Gets the opened state.
     */
    get opened() {
        return this.skeleton.opened;
    }
    /**
     * Gets the options found state.
     */
    get found() {
        return this.skeleton.found;
    }
    /**
     * Gets the total number of options.
     */
    get count() {
        return this.skeleton.count;
    }
    /**
     * Gets the empty state of the element.
     */
    get empty() {
        return this.skeleton.empty;
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.skeleton.name;
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.skeleton.name = name;
    }
    /**
     * Gets the element value.
     */
    get value() {
        return this.skeleton.value;
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        this.skeleton.value = value;
    }
    /**
     * Gets the default value of the element.
     */
    get defaultValue() {
        return this.skeleton.defaultValue;
    }
    /**
     * Sets the default value of the element.
     */
    set defaultValue(value) {
        this.skeleton.defaultValue = value;
    }
    /**
     * Gets the searchable state of the element.
     */
    get searchable() {
        return this.skeleton.searchable;
    }
    /**
     * Sets the searchable state of the element.
     */
    set searchable(state) {
        this.skeleton.searchable = state;
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.skeleton.required;
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.skeleton.required = state;
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.skeleton.readOnly;
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.skeleton.readOnly = state;
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.skeleton.disabled;
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.skeleton.disabled = state;
    }
    /**
     * Move the focus to this element.
     */
    focus() {
        this.skeleton.focus();
    }
    /**
     * Reset the element value to its initial value.
     */
    reset() {
        this.skeleton.reset();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        return this.skeleton.checkValidity();
    }
    /**
     * Set the element custom validity error message.
     * @param error Custom error message.
     */
    setCustomValidity(error) {
        this.skeleton.setCustomValidity(error);
    }
    /**
     * Adds the specified group into the groups list.
     * @param name Group name.
     * @param label Group label.
     */
    addGroup(name, label) {
        this.skeleton.addGroup(name, label);
    }
    /**
     * Adds the specified option into the options list.
     * @param value Option value.
     * @param label Option label.
     * @param data Option metadata.
     * @returns Returns true when the option has been added, false otherwise.
     */
    addOption(value, label, data = {}) {
        return this.skeleton.addOption(value, label, data);
    }
    /**
     * Removes all the options that corresponds to the specified option value.
     * @param value Option value.
     * @returns Returns true when some option was removed or false otherwise.
     */
    removeOption(value) {
        return this.skeleton.removeOption(value);
    }
    /**
     * Clear all options.
     */
    clear() {
        this.skeleton.clear();
    }
    /**
     * Opens the options list.
     */
    open() {
        this.skeleton.open();
    }
    /**
     * Closes the options list.
     */
    close() {
        this.skeleton.close();
    }
    /**
     * Toggles the options list.
     */
    toggle() {
        this.skeleton.toggle();
    }
};
__decorate([
    Class.Private()
], Component.prototype, "skeleton", void 0);
__decorate([
    Class.Private()
], Component.prototype, "renderOptionHandler", null);
__decorate([
    Class.Private()
], Component.prototype, "renderSelectionHandler", null);
__decorate([
    Class.Private()
], Component.prototype, "renderGroupHandler", null);
__decorate([
    Class.Private()
], Component.prototype, "addOptions", null);
__decorate([
    Class.Private()
], Component.prototype, "initialize", null);
__decorate([
    Class.Public()
], Component.prototype, "element", null);
__decorate([
    Class.Public()
], Component.prototype, "selection", null);
__decorate([
    Class.Public()
], Component.prototype, "search", null);
__decorate([
    Class.Public()
], Component.prototype, "opened", null);
__decorate([
    Class.Public()
], Component.prototype, "found", null);
__decorate([
    Class.Public()
], Component.prototype, "count", null);
__decorate([
    Class.Public()
], Component.prototype, "empty", null);
__decorate([
    Class.Public()
], Component.prototype, "name", null);
__decorate([
    Class.Public()
], Component.prototype, "value", null);
__decorate([
    Class.Public()
], Component.prototype, "defaultValue", null);
__decorate([
    Class.Public()
], Component.prototype, "searchable", null);
__decorate([
    Class.Public()
], Component.prototype, "required", null);
__decorate([
    Class.Public()
], Component.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Component.prototype, "disabled", null);
__decorate([
    Class.Public()
], Component.prototype, "focus", null);
__decorate([
    Class.Public()
], Component.prototype, "reset", null);
__decorate([
    Class.Public()
], Component.prototype, "checkValidity", null);
__decorate([
    Class.Public()
], Component.prototype, "setCustomValidity", null);
__decorate([
    Class.Public()
], Component.prototype, "addGroup", null);
__decorate([
    Class.Public()
], Component.prototype, "addOption", null);
__decorate([
    Class.Public()
], Component.prototype, "removeOption", null);
__decorate([
    Class.Public()
], Component.prototype, "clear", null);
__decorate([
    Class.Public()
], Component.prototype, "open", null);
__decorate([
    Class.Public()
], Component.prototype, "close", null);
__decorate([
    Class.Public()
], Component.prototype, "toggle", null);
Component = __decorate([
    Class.Describe()
], Component);
exports.Component = Component;

}},
"@singleware/ui-select/element":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Element_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
const stylesheet_1 = require("./stylesheet");
/**
 * Select element.
 */
let Element = Element_1 = class Element extends Control.Element {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        /**
         * Default text for no selections in the text input.
         */
        this.defaultText = '';
        /**
         * Default nodes for no selections in the button input.
         */
        this.defaultNodes = [];
        /**
         * Map of options.
         */
        this.optionsMap = {};
        /**
         * List of active options.
         */
        this.activatedList = [];
        /**
         * Map of entity group by name.
         */
        this.groupsMap = {};
        /**
         * Map of element group by entity group.
         */
        this.groupElementMap = new WeakMap();
        /**
         * Map of element option by entity option.
         */
        this.optionElementMap = new WeakMap();
        /**
         * Determines whether the result or empty element slot can be closed or not.
         */
        this.canClose = true;
        /**
         * Element styles.
         */
        this.styles = new stylesheet_1.Stylesheet();
        /**
         * Input slot element.
         */
        this.inputSlot = (JSX.create("slot", { name: "input", class: "input", onClick: this.toggleListHandler.bind(this), onSlotChange: this.slotChangeHandler.bind(this) }));
        /**
         * Arrow slot element.
         */
        this.arrowSlot = JSX.create("slot", { name: "arrow", class: "arrow", onClick: this.toggleListHandler.bind(this) });
        /**
         * Search slot element.
         */
        this.searchSlot = JSX.create("slot", { name: "search", class: "search", onKeyUp: this.updateResultList.bind(this) });
        /**
         * Result slot element.
         */
        this.resultSlot = JSX.create("slot", { name: "result", class: "result", onMouseDown: this.preventCloseHandler.bind(this) });
        /**
         * Empty slot element.
         */
        this.emptySlot = (JSX.create("slot", { name: "empty", class: "empty", onMouseDown: this.preventCloseHandler.bind(this), onClick: this.closeListHandler.bind(this) }));
        /**
         * Select layout element.
         */
        this.selectLayout = (JSX.create("label", { class: "select" },
            JSX.create("div", { class: "field" },
                this.searchSlot,
                this.inputSlot,
                this.arrowSlot),
            this.resultSlot,
            this.emptySlot));
        /**
         * Select styles element.
         */
        this.selectStyles = JSX.create("style", { type: "text/css" }, this.styles.toString());
        const shadow = JSX.append(this.attachShadow({ mode: 'closed' }), this.selectStyles, this.selectLayout);
        shadow.addEventListener('keydown', this.optionKeydownHandler.bind(this));
        this.inputSlot.addEventListener('focus', this.focusListHandler.bind(this), true);
        this.inputSlot.addEventListener('blur', this.blurListHandler.bind(this), true);
        this.searchSlot.addEventListener('blur', this.blurListHandler.bind(this), true);
    }
    /**
     * Update all validation attributes.
     */
    updateValidation() {
        this.updatePropertyState('empty', this.empty);
        this.updatePropertyState('invalid', !this.empty && !this.checkValidity());
    }
    /**
     * Updates the input element with the specified option entity.
     * @param option Option entity.
     */
    updateInputSelection(option) {
        const selection = this.renderSelectionElement(option);
        const input = this.getRequiredChildElement(this.inputSlot);
        if (input instanceof HTMLButtonElement) {
            JSX.append(JSX.clear(input), selection);
        }
        else if (input instanceof HTMLInputElement) {
            input.value = selection ? selection.innerText : '';
        }
    }
    /**
     * Updates the result element with any option found.
     */
    updateResultList() {
        const result = JSX.clear(this.getRequiredChildElement(this.resultSlot));
        const search = this.search;
        this.activatedList = [];
        for (const value in this.optionsMap) {
            const options = this.optionsMap[value];
            for (const option of options) {
                let element = this.optionElementMap.get(option);
                if (search.length === 0 || option.tags.find(tag => tag.includes(search))) {
                    this.activatedList.push(option);
                    if (option.group) {
                        const group = this.groupsMap[option.group];
                        if (group) {
                            element = JSX.append(this.groupElementMap.get(group), element);
                        }
                        else {
                            console.warn(`Option group '${option.group}' wasn't found.`);
                        }
                    }
                    JSX.append(result, element);
                }
                else if (option.group) {
                    element.remove();
                }
            }
        }
        if (this.selectedElement) {
            this.selectedElement.scrollIntoView({ block: 'center' });
        }
        this.updatePropertyState('found', this.activatedList.length !== 0);
    }
    /**
     * Renders a new option element for the specified option entity.
     * @param option Option entity.
     * @returns Returns the rendered option element.
     */
    renderOptionElement(option) {
        const detail = { option: option, element: void 0 };
        const event = new CustomEvent('renderoption', { bubbles: true, cancelable: true, detail: detail });
        if (this.dispatchEvent(event)) {
            return (JSX.create("div", { class: "option", onClick: this.optionClickHandler.bind(this, option) }, detail.element || option.label || option.value));
        }
        return void 0;
    }
    /**
     * Renders a new selection result for the specified option entity.
     * @param option Option entity.
     * @returns Returns the rendered selection result.
     */
    renderSelectionElement(option) {
        const detail = { option: option, element: void 0 };
        const event = new CustomEvent('renderselection', { bubbles: true, cancelable: true, detail: detail });
        if (this.dispatchEvent(event)) {
            return JSX.create("div", { class: "selection" }, detail.element || option.label || option.value);
        }
        return void 0;
    }
    /**
     * Renders a new group element for the specified group entity.
     * @param group Group entity.
     * @returns Returns the rendered group element.
     */
    renderGroupElement(group) {
        const detail = { group: group, element: void 0 };
        const event = new CustomEvent('rendergroup', { bubbles: true, cancelable: true, detail: detail });
        if (this.dispatchEvent(event)) {
            return JSX.create("div", { class: "group" }, detail.element || group.label);
        }
        return void 0;
    }
    /**
     * Selects the element that corresponds to the specified option entity.
     * @param option Option entity.
     */
    selectOption(option) {
        if (this.selectedElement) {
            delete this.selectedElement.dataset.selected;
        }
        this.selectedOption = option;
        this.selectedElement = this.optionElementMap.get(option);
        this.selectedElement.dataset.selected = '';
        this.selectedElement.scrollIntoView();
        this.setCustomValidity(!this.required || option.value.length ? '' : 'Please select a valid option.');
        this.updateInputSelection(option);
        this.updateValidation();
    }
    /**
     * Selects the option that corresponds to the specified value.
     * @param value Option value.
     * @returns Returns true when an option was selected, false otherwise.
     */
    selectOptionByValue(value) {
        const options = this.optionsMap[value];
        if (options) {
            const option = options[0];
            if (option !== void 0) {
                if (option !== this.selectedOption) {
                    this.selectOption(option);
                }
                return true;
            }
        }
        return false;
    }
    /**
     * Selects the element that corresponds to the specified option and notifies the change.
     * @param option Option entity.
     * @returns Returns true when some option was selected, false otherwise.
     */
    selectOptionAndNotify(option) {
        if (option !== this.selectedOption) {
            const event = new Event('change', { bubbles: true, cancelable: true });
            const saved = this.selectedOption;
            this.selectOption(option);
            if (!this.dispatchEvent(event)) {
                if (saved) {
                    this.selectOption(saved);
                }
                else {
                    this.unselectOption();
                }
                return false;
            }
        }
        return true;
    }
    /**
     * Selects the previous option.
     * @returns Returns true when some option was selected, false otherwise.
     */
    selectPreviousOptionAndNotify() {
        const index = this.activatedList.indexOf(this.selectedOption);
        const option = this.activatedList[(index - 1 > -1 ? index : this.activatedList.length) - 1];
        return this.selectOptionAndNotify(option);
    }
    /**
     * Selects the next option.
     * @returns Returns true when some option was selected, false otherwise.
     */
    selectNextOptionAndNotify() {
        const index = this.activatedList.indexOf(this.selectedOption);
        const option = this.activatedList[index + 1 < this.activatedList.length ? index + 1 : 0];
        return this.selectOptionAndNotify(option);
    }
    /**
     * Selects the next first option that corresponds to the specified search.
     * @param search Search value.
     * @returns Returns true when some option was selected, false otherwise.
     */
    selectNextOptionBySearchAndNotify(search) {
        let index = this.activatedList.indexOf(this.selectedOption);
        for (let l = 0; l < this.activatedList.length; ++l) {
            const option = this.activatedList[++index % this.activatedList.length];
            if (option.tags.find(tag => tag.includes(search))) {
                return this.selectOptionAndNotify(option);
            }
        }
        return false;
    }
    /**
     * Unselects the current selected option.
     */
    unselectOption() {
        const input = this.getRequiredChildElement(this.inputSlot);
        if (input instanceof HTMLButtonElement) {
            JSX.append(JSX.clear(input), ...this.defaultNodes);
        }
        else if (input instanceof HTMLInputElement) {
            input.value = this.defaultText;
        }
        delete this.selectedElement.dataset.selected;
        this.selectedOption = void 0;
        this.selectedElement = void 0;
    }
    /**
     * Opens the option list result.
     */
    openList() {
        if (this.searchable) {
            const search = this.getRequiredChildElement(this.searchSlot);
            if (search.reset instanceof Function) {
                search.reset();
            }
            else if ('value' in search) {
                search.value = search.defaultValue;
            }
            if (search.focus instanceof Function) {
                search.focus();
            }
            this.canClose = false;
        }
        this.updateResultList();
        this.updatePropertyState('opened', true);
    }
    /**
     * Closes the option list result.
     */
    closeList() {
        this.updatePropertyState('found', false);
        this.updatePropertyState('opened', false);
    }
    /**
     * Gets the normalized tag list based on the specified input tags.
     * @param inputs Input tags.
     * @returns Returns the generated tag list.
     */
    getTagList(inputs) {
        const tags = [];
        for (const input of inputs) {
            if (input instanceof Element_1) {
                tags.push(input.innerText.toLocaleLowerCase());
            }
            else if (input !== void 0) {
                tags.push(input.toLocaleLowerCase());
            }
        }
        return tags;
    }
    /**
     * Option click, event handler.
     * @param option Option entity.
     */
    optionClickHandler(option) {
        this.closeListHandler();
        this.selectOptionAndNotify(option);
    }
    /**
     * Option keydown, event handler.
     * @param event Event instance.
     */
    optionKeydownHandler(event) {
        if (event.code === 'Space') {
            if (this.open()) {
                event.preventDefault();
                this.focus();
            }
        }
        else if (event.code === 'Enter') {
            event.preventDefault();
            this.toggleListHandler();
        }
        else if (event.code === 'Escape') {
            event.preventDefault();
            this.closeListHandler();
        }
        else if (event.code === 'ArrowUp') {
            event.preventDefault();
            this.selectPreviousOptionAndNotify();
        }
        else if (event.code === 'ArrowDown') {
            event.preventDefault();
            this.selectNextOptionAndNotify();
        }
        else if (!this.searchable && this.selectNextOptionBySearchAndNotify(event.key)) {
            event.preventDefault();
        }
    }
    /**
     * Updates the current selection into the new input slot element.
     */
    slotChangeHandler() {
        const input = this.getRequiredChildElement(this.inputSlot);
        if (input instanceof HTMLButtonElement) {
            this.defaultNodes = [];
            for (const node of input.childNodes) {
                this.defaultNodes.push(node);
            }
        }
        else if (input instanceof HTMLInputElement) {
            this.defaultText = input.value;
            input.readOnly = true;
        }
        if (this.selectedOption) {
            this.updateInputSelection(this.selectedOption);
        }
        this.updateValidation();
    }
    /**
     * Prevent close, event handler.
     */
    preventCloseHandler() {
        this.canClose = false;
        this.focus();
    }
    /**
     * Focus list, event handler.
     */
    focusListHandler() {
        if (!this.opened) {
            const event = new Event('focus', { bubbles: true, cancelable: true });
            this.dispatchEvent(event);
        }
    }
    /**
     * Blur list, event handler.
     */
    blurListHandler() {
        if (this.canClose) {
            const event = new Event('blur', { bubbles: true, cancelable: true });
            if (this.dispatchEvent(event)) {
                this.close();
            }
        }
        this.canClose = true;
    }
    /**
     * Opens the list, event handler.
     */
    openListHandler() {
        this.open();
        this.focus();
    }
    /**
     * Closes the list, event handler.
     */
    closeListHandler() {
        this.focus();
        this.close();
    }
    /**
     * Toggles the list, event handler.
     */
    toggleListHandler() {
        if (this.opened) {
            this.closeListHandler();
        }
        else {
            this.openListHandler();
        }
    }
    /**
     * Gets the selected option.
     */
    get selection() {
        return this.selectedOption ? { ...this.selectedOption } : void 0;
    }
    /**
     * Gets the current search text.
     */
    get search() {
        return this.searchable ? this.getRequiredChildElement(this.searchSlot).value : '';
    }
    /**
     * Gets the opened state.
     */
    get opened() {
        return this.hasAttribute('opened');
    }
    /**
     * Gets the options found state.
     */
    get found() {
        return this.hasAttribute('found');
    }
    /**
     * Gets the number of active options.
     */
    get count() {
        return this.activatedList.length;
    }
    /**
     * Determines whether the element is empty or not.
     */
    get empty() {
        return this.selectedOption === void 0;
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.getAttribute('name') || '';
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.setAttribute('name', name);
        this.setRequiredChildProperty(this.inputSlot, 'name', name);
    }
    /**
     * Gets the element value.
     */
    get value() {
        return this.selectedOption ? this.selectedOption.value : void 0;
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        if (value === void 0 || !this.selectOptionByValue(value)) {
            if (this.selectedOption) {
                this.unselectOption();
                this.updateValidation();
            }
        }
    }
    /**
     * Gets the searchable state of the element.
     */
    get searchable() {
        return this.hasAttribute('searchable') && this.searchSlot.assignedNodes().length !== 0;
    }
    /**
     * Sets the searchable state of the element.
     */
    set searchable(state) {
        this.updatePropertyState('searchable', state);
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.hasAttribute('required');
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.setRequiredChildProperty(this.inputSlot, 'required', state);
        this.updatePropertyState('required', state);
        this.updateValidation();
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.hasAttribute('readonly');
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.updatePropertyState('readonly', state);
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.hasAttribute('disabled');
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.updatePropertyState('disabled', this.setRequiredChildProperty(this.inputSlot, 'disabled', state) && state);
    }
    /**
     * Move the focus to this element.
     */
    focus() {
        this.callRequiredChildMethod(this.searchable && this.opened ? this.searchSlot : this.inputSlot, 'focus', []);
    }
    /**
     * Reset the element value to its initial value.
     */
    reset() {
        this.value = this.defaultValue;
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        return ((!this.required || (this.value !== void 0 && this.value.length !== 0)) &&
            this.callRequiredChildMethod(this.inputSlot, 'checkValidity', []) !== false);
    }
    /**
     * Sets the element custom validity error message.
     * @param error Custom error message.
     */
    setCustomValidity(error) {
        this.callRequiredChildMethod(this.inputSlot, 'setCustomValidity', [error]);
    }
    /**
     * Adds the specified group into the groups list.
     * @param name Group name.
     * @param label Group label.
     */
    addGroup(name, label) {
        const group = { name: name, label: label };
        const element = this.renderGroupElement(group);
        if (element) {
            this.groupsMap[name] = group;
            this.groupElementMap.set(group, element);
            this.updateResultList();
        }
    }
    /**
     * Adds the specified option into the options list.
     * @param value Option value.
     * @param label Option label.
     * @param data Option metadata.
     * @returns Returns true when the option has been added, false otherwise.
     */
    addOption(value, label, data = {}) {
        const option = {
            value: value,
            label: label,
            group: data.group,
            tags: this.getTagList(data.tags || [label]),
            custom: data.custom || {}
        };
        const element = this.renderOptionElement(option);
        if (element) {
            if (!(this.optionsMap[value] instanceof Array)) {
                this.optionsMap[value] = [];
            }
            this.optionsMap[value].push(option);
            this.optionElementMap.set(option, element);
            this.updateResultList();
            return true;
        }
        return false;
    }
    /**
     * Remove all options that corresponds to the specified option value.
     * @param value Option value.
     * @returns Returns true when some option was removed or false otherwise.
     */
    removeOption(value) {
        const options = this.optionsMap[value];
        if (options) {
            for (const option of options) {
                this.optionElementMap.get(option).remove();
            }
            delete this.optionsMap[value];
            this.updateResultList();
            return true;
        }
        return false;
    }
    /**
     * Clear all options.
     */
    clear() {
        if (this.selectedOption) {
            this.unselectOption();
            this.updateValidation();
        }
        for (const value in this.optionsMap) {
            const options = this.optionsMap[value];
            for (const option of options) {
                this.optionElementMap.get(option).remove();
            }
        }
        this.optionsMap = {};
        this.updatePropertyState('found', false);
        JSX.clear(this.getRequiredChildElement(this.resultSlot));
    }
    /**
     * Opens the options list.
     * @returns Returns true when the options list was closed, false otherwise.
     */
    open() {
        if (!this.readOnly && !this.disabled && !this.opened) {
            return this.openList(), true;
        }
        return false;
    }
    /**
     * Closes the options list.
     * @returns Returns true when the options list was closed, false otherwise.
     */
    close() {
        if (this.opened) {
            return this.closeList(), true;
        }
        return false;
    }
    /**
     * Toggles the options list.
     */
    toggle() {
        if (this.opened) {
            this.closeList();
        }
        else {
            this.openList();
        }
    }
};
__decorate([
    Class.Private()
], Element.prototype, "defaultText", void 0);
__decorate([
    Class.Private()
], Element.prototype, "defaultNodes", void 0);
__decorate([
    Class.Private()
], Element.prototype, "optionsMap", void 0);
__decorate([
    Class.Private()
], Element.prototype, "activatedList", void 0);
__decorate([
    Class.Private()
], Element.prototype, "groupsMap", void 0);
__decorate([
    Class.Private()
], Element.prototype, "groupElementMap", void 0);
__decorate([
    Class.Private()
], Element.prototype, "optionElementMap", void 0);
__decorate([
    Class.Private()
], Element.prototype, "selectedOption", void 0);
__decorate([
    Class.Private()
], Element.prototype, "selectedElement", void 0);
__decorate([
    Class.Private()
], Element.prototype, "canClose", void 0);
__decorate([
    Class.Private()
], Element.prototype, "styles", void 0);
__decorate([
    Class.Private()
], Element.prototype, "inputSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "arrowSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "searchSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "resultSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "emptySlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "selectLayout", void 0);
__decorate([
    Class.Private()
], Element.prototype, "selectStyles", void 0);
__decorate([
    Class.Private()
], Element.prototype, "updateValidation", null);
__decorate([
    Class.Private()
], Element.prototype, "updateInputSelection", null);
__decorate([
    Class.Private()
], Element.prototype, "updateResultList", null);
__decorate([
    Class.Private()
], Element.prototype, "renderOptionElement", null);
__decorate([
    Class.Private()
], Element.prototype, "renderSelectionElement", null);
__decorate([
    Class.Private()
], Element.prototype, "renderGroupElement", null);
__decorate([
    Class.Private()
], Element.prototype, "selectOption", null);
__decorate([
    Class.Private()
], Element.prototype, "selectOptionByValue", null);
__decorate([
    Class.Private()
], Element.prototype, "selectOptionAndNotify", null);
__decorate([
    Class.Private()
], Element.prototype, "selectPreviousOptionAndNotify", null);
__decorate([
    Class.Private()
], Element.prototype, "selectNextOptionAndNotify", null);
__decorate([
    Class.Private()
], Element.prototype, "selectNextOptionBySearchAndNotify", null);
__decorate([
    Class.Private()
], Element.prototype, "unselectOption", null);
__decorate([
    Class.Private()
], Element.prototype, "openList", null);
__decorate([
    Class.Private()
], Element.prototype, "closeList", null);
__decorate([
    Class.Private()
], Element.prototype, "getTagList", null);
__decorate([
    Class.Private()
], Element.prototype, "optionClickHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "optionKeydownHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "slotChangeHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "preventCloseHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "focusListHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "blurListHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "openListHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "closeListHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "toggleListHandler", null);
__decorate([
    Class.Public()
], Element.prototype, "selection", null);
__decorate([
    Class.Public()
], Element.prototype, "search", null);
__decorate([
    Class.Public()
], Element.prototype, "opened", null);
__decorate([
    Class.Public()
], Element.prototype, "found", null);
__decorate([
    Class.Public()
], Element.prototype, "count", null);
__decorate([
    Class.Public()
], Element.prototype, "empty", null);
__decorate([
    Class.Public()
], Element.prototype, "name", null);
__decorate([
    Class.Public()
], Element.prototype, "value", null);
__decorate([
    Class.Public()
], Element.prototype, "defaultValue", void 0);
__decorate([
    Class.Public()
], Element.prototype, "searchable", null);
__decorate([
    Class.Public()
], Element.prototype, "required", null);
__decorate([
    Class.Public()
], Element.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Element.prototype, "disabled", null);
__decorate([
    Class.Public()
], Element.prototype, "focus", null);
__decorate([
    Class.Public()
], Element.prototype, "reset", null);
__decorate([
    Class.Public()
], Element.prototype, "checkValidity", null);
__decorate([
    Class.Public()
], Element.prototype, "setCustomValidity", null);
__decorate([
    Class.Public()
], Element.prototype, "addGroup", null);
__decorate([
    Class.Public()
], Element.prototype, "addOption", null);
__decorate([
    Class.Public()
], Element.prototype, "removeOption", null);
__decorate([
    Class.Public()
], Element.prototype, "clear", null);
__decorate([
    Class.Public()
], Element.prototype, "open", null);
__decorate([
    Class.Public()
], Element.prototype, "close", null);
__decorate([
    Class.Public()
], Element.prototype, "toggle", null);
Element = Element_1 = __decorate([
    JSX.Describe('swe-select'),
    Class.Describe()
], Element);
exports.Element = Element;

}},
"@singleware/ui-select/index":{pack:false, invoke:function(exports, require){
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Common exports.
var component_1 = require("./component");
exports.Component = component_1.Component;
var element_1 = require("./element");
exports.Element = element_1.Element;
var stylesheet_1 = require("./stylesheet");
exports.Stylesheet = stylesheet_1.Stylesheet;
const Internals = require("./internals");
exports.Internals = Internals;
const Rendering = require("./rendering");
exports.Rendering = Rendering;

}},
"@singleware/ui-select":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/ui-select/internals/index":{pack:false, invoke:function(exports, require){
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });

}},
"@singleware/ui-select/internals":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/ui-select/rendering/index":{pack:false, invoke:function(exports, require){
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });

}},
"@singleware/ui-select/rendering":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/ui-select/stylesheet":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const OSS = require("@singleware/oss");
/**
 * Select stylesheet class.
 */
let Stylesheet = class Stylesheet extends OSS.Stylesheet {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        /**
         * Select styles.
         */
        this.element = this.select(':host>.select');
        /**
         * Field styles.
         */
        this.field = this.select(':host(:not([opened]))>.select>.field');
        /**
         * Arrow styles.
         */
        this.arrow = this.select(':host>.select>.field>.arrow');
        /**
         * Slotted selection styles.
         */
        this.slottedSelection = this.select(':host>.select>.field>.input::slotted(*)');
        /**
         * Slotted input styles.
         */
        this.slottedInput = this.select(':host>.select>.field>.search::slotted(*)', ':host>.select>.field>.input::slotted(*)');
        /**
         * Slotted arrow styles.
         */
        this.slottedArrow = this.select(':host>.select>.field>.arrow::slotted(*)');
        /**
         * Slotted arrow styles.
         */
        this.slottedResults = this.select(':host>.select>.result::slotted(*)', ':host>.select>.empty::slotted(*)');
        /**
         * Slotted hidden styles.
         */
        this.slottedHidden = this.select(':host([searchable][opened])>.select>.field>.input::slotted(*)', ':host([searchable]:not([opened]))>.select>.field>.search::slotted(*)', ':host(:not([searchable]))>.select>.field>.search::slotted(*)', ':host(:not([searchable]))>.select>.empty::slotted(*)', ':host(:not([opened]))>.select>.result::slotted(*)', ':host(:not([found]))>.select>.result::slotted(*)', ':host(:not([opened]))>.select>.empty::slotted(*)', ':host([opened][found])>.select>.empty::slotted(*)');
        this.element.display = 'flex';
        this.element.position = 'relative';
        this.element.flexDirection = 'column';
        this.element.position = 'relative';
        this.element.height = 'inherit';
        this.element.width = 'inherit';
        this.element.userSelect = 'none';
        this.field.display = 'flex';
        this.arrow.position = 'absolute';
        this.arrow.top = '0';
        this.arrow.bottom = '0';
        this.arrow.right = '0';
        this.slottedSelection.cursor = 'default';
        this.slottedInput.textAlign = 'left';
        this.slottedInput.width = '100%';
        this.slottedArrow.position = 'absolute';
        this.slottedArrow.top = '50%';
        this.slottedArrow.right = '0.5rem';
        this.slottedArrow.width = '0';
        this.slottedArrow.height = '0';
        this.slottedArrow.transform = 'translate(-50%,-50%)';
        this.slottedArrow.borderLeft = '0.1875rem solid transparent';
        this.slottedArrow.borderRight = this.slottedArrow.borderLeft;
        this.slottedArrow.borderTop = '0.25rem solid black';
        this.slottedResults.display = 'block';
        this.slottedResults.position = 'absolute';
        this.slottedResults.border = '0.0625rem solid black';
        this.slottedResults.overflow = 'auto';
        this.slottedResults.top = '100%';
        this.slottedResults.width = '100%';
        this.slottedResults.zIndex = 1;
        this.slottedHidden.display = 'none';
    }
};
__decorate([
    Class.Private()
], Stylesheet.prototype, "element", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "field", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "arrow", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "slottedSelection", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "slottedInput", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "slottedArrow", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "slottedResults", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "slottedHidden", void 0);
Stylesheet = __decorate([
    Class.Describe()
], Stylesheet);
exports.Stylesheet = Stylesheet;

}},
"@singleware/ui-fieldset/component":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
/**
 * Fieldset component class.
 */
let Component = class Component extends Control.Component {
    /**
     * Fieldset component class.
     */
    constructor() {
        super(...arguments);
        /**
         * Element instance.
         */
        this.skeleton = (JSX.create("swe-fieldset", { class: this.properties.class, slot: this.properties.slot, type: this.properties.type, name: this.properties.name, value: this.properties.value, unwind: this.properties.unwind, required: this.properties.required, readOnly: this.properties.readOnly, disabled: this.properties.disabled, orientation: this.properties.orientation, onChange: this.properties.onChange }, this.children));
    }
    /**
     * Gets the element.
     */
    get element() {
        return this.skeleton;
    }
    /**
     * Gets the empty state of the element.
     */
    get empty() {
        return this.skeleton.empty;
    }
    /**
     * Gets the element type.
     */
    get type() {
        return this.skeleton.type;
    }
    /**
     * Sets the element type.
     */
    set type(type) {
        this.skeleton.type = type;
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.skeleton.name;
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.skeleton.name = name;
    }
    /**
     * Gets the element value.
     */
    get value() {
        return this.skeleton.value;
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        this.skeleton.value = value;
    }
    /**
     * Gets the unwind state of the element.
     */
    get unwind() {
        return this.skeleton.unwind;
    }
    /**
     * Sets the unwind state of the element.
     */
    set unwind(state) {
        this.skeleton.unwind = state;
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.skeleton.required;
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.skeleton.required = state;
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.skeleton.readOnly;
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.skeleton.readOnly = state;
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.skeleton.disabled;
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.skeleton.disabled = state;
    }
    /**
     * Gets the element orientation.
     */
    get orientation() {
        return this.skeleton.orientation;
    }
    /**
     * Sets the element orientation.
     */
    set orientation(orientation) {
        this.skeleton.orientation = orientation;
    }
    /**
     * Move the focus to the first child that can be focused.
     */
    focus() {
        this.skeleton.focus();
    }
    /**
     * Reset all fields in the element to its initial values.
     */
    reset() {
        this.skeleton.reset();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        return this.skeleton.checkValidity();
    }
};
__decorate([
    Class.Private()
], Component.prototype, "skeleton", void 0);
__decorate([
    Class.Public()
], Component.prototype, "element", null);
__decorate([
    Class.Public()
], Component.prototype, "empty", null);
__decorate([
    Class.Public()
], Component.prototype, "type", null);
__decorate([
    Class.Public()
], Component.prototype, "name", null);
__decorate([
    Class.Public()
], Component.prototype, "value", null);
__decorate([
    Class.Public()
], Component.prototype, "unwind", null);
__decorate([
    Class.Public()
], Component.prototype, "required", null);
__decorate([
    Class.Public()
], Component.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Component.prototype, "disabled", null);
__decorate([
    Class.Public()
], Component.prototype, "orientation", null);
__decorate([
    Class.Public()
], Component.prototype, "focus", null);
__decorate([
    Class.Public()
], Component.prototype, "reset", null);
__decorate([
    Class.Public()
], Component.prototype, "checkValidity", null);
Component = __decorate([
    Class.Describe()
], Component);
exports.Component = Component;

}},
"@singleware/ui-fieldset/element":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Control = require("@singleware/ui-control");
const JSX = require("@singleware/jsx");
/**
 * Fieldset element.
 */
let Element = class Element extends Control.Element {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        this.addEventListener('keyup', this.changeHandler.bind(this));
        this.addEventListener('change', this.changeHandler.bind(this));
    }
    /**
     * Add all values from the specified child into the given entity.
     * @param entity Target entity.
     * @param child Child element.
     */
    addValues(entity, child) {
        const values = child.value;
        if (values instanceof Object) {
            for (const name in values) {
                if (values[name] !== void 0) {
                    entity[name] = values[name];
                }
            }
        }
    }
    /**
     * Add the value from the specified child into the given entity.
     * @param entity Target entity.
     * @param child Child element.
     */
    addValue(entity, child) {
        if (child.name) {
            const value = child.value;
            if (value !== void 0) {
                entity[child.name] = value;
            }
        }
    }
    /**
     * Change event handler.
     */
    changeHandler() {
        this.updatePropertyState('empty', this.empty);
        this.updatePropertyState('invalid', !this.empty && !this.checkValidity());
    }
    /**
     * Determines whether the element is empty or not.
     */
    get empty() {
        for (const child of this.children) {
            if (!child.empty) {
                return false;
            }
        }
        return true;
    }
    /**
     * Gets the element type.
     */
    get type() {
        return this.getAttribute('type') || '';
    }
    /**
     * Sets the element type.
     */
    set type(type) {
        this.setAttribute('type', type);
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.getAttribute('name') || '';
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.setAttribute('name', name);
    }
    /**
     * Gets the element value.
     */
    get value() {
        const entity = {};
        for (const child of this.children) {
            if (!child.empty) {
                if (child.unwind) {
                    this.addValues(entity, child);
                }
                else {
                    this.addValue(entity, child);
                }
            }
        }
        return entity;
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        for (const child of this.children) {
            if (child.unwind) {
                child.value = value;
            }
            else {
                const name = child.name;
                if (value instanceof Object && value[name] !== void 0) {
                    child.value = value[name];
                }
            }
        }
    }
    /**
     * Gets the unwind state of the element.
     */
    get unwind() {
        return this.hasAttribute('unwind');
    }
    /**
     * Sets the unwind state of the element.
     */
    set unwind(state) {
        this.updatePropertyState('unwind', state);
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.hasAttribute('required');
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.updatePropertyState('required', state);
        this.updateChildrenState('required', state);
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.hasAttribute('readonly');
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.updatePropertyState('readonly', state);
        this.updateChildrenState('readOnly', state);
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.hasAttribute('disabled');
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.updatePropertyState('disabled', state);
        this.updateChildrenState('disabled', state);
    }
    /**
     * Gets the element orientation.
     */
    get orientation() {
        return this.getAttribute('orientation') || 'column';
    }
    /**
     * Sets the element orientation.
     */
    set orientation(orientation) {
        this.setAttribute('orientation', orientation);
    }
    /**
     * Move the focus to the first child that can be focused.
     */
    focus() {
        for (const child of this.children) {
            if (child.focus instanceof Function && !child.disabled && !child.readOnly) {
                child.focus();
                break;
            }
        }
    }
    /**
     * Reset all fields in the element to its initial values.
     */
    reset() {
        for (const child of this.children) {
            if (child.reset instanceof Function) {
                child.reset();
            }
            else {
                if ('value' in child) {
                    child.value = child.defaultValue;
                }
                if ('checked' in child) {
                    child.checked = child.defaultChecked;
                }
            }
        }
        this.changeHandler();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        for (const child of this.children) {
            if (child.checkValidity instanceof Function && !child.checkValidity()) {
                return false;
            }
        }
        return true;
    }
};
__decorate([
    Class.Private()
], Element.prototype, "addValues", null);
__decorate([
    Class.Private()
], Element.prototype, "addValue", null);
__decorate([
    Class.Private()
], Element.prototype, "changeHandler", null);
__decorate([
    Class.Public()
], Element.prototype, "empty", null);
__decorate([
    Class.Public()
], Element.prototype, "type", null);
__decorate([
    Class.Public()
], Element.prototype, "name", null);
__decorate([
    Class.Public()
], Element.prototype, "value", null);
__decorate([
    Class.Public()
], Element.prototype, "unwind", null);
__decorate([
    Class.Public()
], Element.prototype, "required", null);
__decorate([
    Class.Public()
], Element.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Element.prototype, "disabled", null);
__decorate([
    Class.Public()
], Element.prototype, "orientation", null);
__decorate([
    Class.Public()
], Element.prototype, "focus", null);
__decorate([
    Class.Public()
], Element.prototype, "reset", null);
__decorate([
    Class.Public()
], Element.prototype, "checkValidity", null);
Element = __decorate([
    JSX.Describe('swe-fieldset'),
    Class.Describe()
], Element);
exports.Element = Element;

}},
"@singleware/ui-fieldset/index":{pack:false, invoke:function(exports, require){
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Common exports.
var component_1 = require("./component");
exports.Component = component_1.Component;
var element_1 = require("./element");
exports.Element = element_1.Element;

}},
"@singleware/ui-fieldset":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/ui-field/component":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
/**
 * Field component class.
 */
let Component = class Component extends Control.Component {
    /**
     * Field component class.
     */
    constructor() {
        super(...arguments);
        /**
         * Element instance.
         */
        this.skeleton = (JSX.create("swe-field", { class: this.properties.class, slot: this.properties.slot, label: this.properties.label, type: this.properties.type, name: this.properties.name, value: this.properties.value, checked: this.properties.checked, required: this.properties.required, readOnly: this.properties.readOnly, disabled: this.properties.disabled, orientation: this.properties.orientation, onChange: this.properties.onChange }, this.children));
    }
    /**
     * Gets the element.
     */
    get element() {
        return this.skeleton;
    }
    /**
     * Gets the label.
     */
    get label() {
        return this.skeleton.label;
    }
    /**
     * Sets the label.
     */
    set label(label) {
        this.skeleton.label = label;
    }
    /**
     * Gets the empty state of the element.
     */
    get empty() {
        return this.skeleton.empty;
    }
    /**
     * Gets the element type.
     */
    get type() {
        return this.skeleton.type;
    }
    /**
     * Sets the element type.
     */
    set type(type) {
        this.skeleton.type = type;
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.skeleton.name;
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.skeleton.name = name;
    }
    /**
     * Gets the element value.
     */
    get value() {
        return this.skeleton.value;
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        this.skeleton.value = value;
    }
    /**
     * Gets the checked state of the element.
     */
    get checked() {
        return this.skeleton.checked;
    }
    /**
     * Sets the checked state of the element.
     */
    set checked(value) {
        this.skeleton.checked = value;
    }
    /**
     * Gets the default value of the element.
     */
    get defaultValue() {
        return this.skeleton.defaultValue;
    }
    /**
     * Sets the default value of the element.
     */
    set defaultValue(value) {
        this.skeleton.defaultValue = value;
    }
    /**
     * Gets the default checked state of the element.
     */
    get defaultChecked() {
        return this.skeleton.defaultChecked;
    }
    /**
     * Sets the default checked state of the element.
     */
    set defaultChecked(value) {
        this.skeleton.defaultChecked = value;
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.skeleton.required;
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.skeleton.required = state;
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.skeleton.readOnly;
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.skeleton.readOnly = state;
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.skeleton.disabled;
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.skeleton.disabled = state;
    }
    /**
     * Gets the element orientation.
     */
    get orientation() {
        return this.skeleton.orientation;
    }
    /**
     * Sets the element orientation.
     */
    set orientation(orientation) {
        this.skeleton.orientation = orientation;
    }
    /**
     * Move the focus to this element.
     */
    focus() {
        this.skeleton.focus();
    }
    /**
     * Reset the element value to its initial value.
     */
    reset() {
        this.skeleton.reset();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        return this.skeleton.checkValidity();
    }
    /**
     * Set the element custom validity error message.
     * @param error Custom error message.
     */
    setCustomValidity(error) {
        this.skeleton.setCustomValidity(error);
    }
};
__decorate([
    Class.Private()
], Component.prototype, "skeleton", void 0);
__decorate([
    Class.Public()
], Component.prototype, "element", null);
__decorate([
    Class.Public()
], Component.prototype, "label", null);
__decorate([
    Class.Public()
], Component.prototype, "empty", null);
__decorate([
    Class.Public()
], Component.prototype, "type", null);
__decorate([
    Class.Public()
], Component.prototype, "name", null);
__decorate([
    Class.Public()
], Component.prototype, "value", null);
__decorate([
    Class.Public()
], Component.prototype, "checked", null);
__decorate([
    Class.Public()
], Component.prototype, "defaultValue", null);
__decorate([
    Class.Public()
], Component.prototype, "defaultChecked", null);
__decorate([
    Class.Public()
], Component.prototype, "required", null);
__decorate([
    Class.Public()
], Component.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Component.prototype, "disabled", null);
__decorate([
    Class.Public()
], Component.prototype, "orientation", null);
__decorate([
    Class.Public()
], Component.prototype, "focus", null);
__decorate([
    Class.Public()
], Component.prototype, "reset", null);
__decorate([
    Class.Public()
], Component.prototype, "checkValidity", null);
__decorate([
    Class.Public()
], Component.prototype, "setCustomValidity", null);
Component = __decorate([
    Class.Describe()
], Component);
exports.Component = Component;

}},
"@singleware/ui-field/element":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
const stylesheet_1 = require("./stylesheet");
/**
 * Field element.
 */
let Element = class Element extends Control.Element {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        /**
         * Element styles.
         */
        this.styles = new stylesheet_1.Stylesheet();
        /**
         * Label slot element.
         */
        this.labelSlot = JSX.create("slot", { name: "label", class: "label" });
        /**
         * Prepend slot element.
         */
        this.prependSlot = JSX.create("slot", { name: "prepend", class: "prepend" });
        /**
         * Center slot element.
         */
        this.centerSlot = JSX.create("slot", { name: "center", class: "center" });
        /**
         * Append slot element.
         */
        this.appendSlot = JSX.create("slot", { name: "append", class: "append" });
        /**
         * Field layout element.
         */
        this.fieldLayout = (JSX.create("label", { class: "field" },
            this.labelSlot,
            JSX.create("div", { class: "group" },
                this.prependSlot,
                this.centerSlot,
                this.appendSlot)));
        /**
         * Field styles element.
         */
        this.fieldStyles = JSX.create("style", { type: "text/css" }, this.styles.toString());
        const shadow = JSX.append(this.attachShadow({ mode: 'closed' }), this.fieldStyles, this.fieldLayout);
        shadow.addEventListener('slotchange', this.changeHandler.bind(this));
        shadow.addEventListener('keyup', this.changeHandler.bind(this));
        shadow.addEventListener('change', this.changeHandler.bind(this));
    }
    /**
     * Change event handler.
     */
    changeHandler() {
        this.updatePropertyState('empty', this.empty);
        this.updatePropertyState('checked', this.checked);
        this.updatePropertyState('invalid', !this.empty && !this.checkValidity());
    }
    /**
     * Determines whether the element is empty or not.
     */
    get empty() {
        const child = this.getRequiredChildElement(this.centerSlot);
        if (!('empty' in child)) {
            return child.value === void 0 || ((typeof child.value === 'string' || child.value instanceof Array) && child.value.length === 0);
        }
        return child.empty;
    }
    /**
     * Gets the label.
     */
    get label() {
        return this.currentLabel;
    }
    /**
     * Sets the label.
     */
    set label(label) {
        const child = this.labelSlot.assignedNodes()[0];
        if (child) {
            JSX.append(JSX.clear(child), (this.currentLabel = label));
        }
    }
    /**
     * Gets the element type.
     */
    get type() {
        return this.getRequiredChildProperty(this.centerSlot, 'type');
    }
    /**
     * Sets the element type.
     */
    set type(type) {
        this.setRequiredChildProperty(this.centerSlot, 'type', type);
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.getRequiredChildProperty(this.centerSlot, 'name');
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.setRequiredChildProperty(this.centerSlot, 'name', name);
    }
    /**
     * Gets the element value.
     */
    get value() {
        return this.getRequiredChildProperty(this.centerSlot, 'value');
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        this.setRequiredChildProperty(this.centerSlot, 'value', value);
    }
    /**
     * Gets the checked state of the element.
     */
    get checked() {
        return Boolean(this.getRequiredChildProperty(this.centerSlot, 'checked'));
    }
    /**
     * Sets the checked state of the element.
     */
    set checked(value) {
        this.setRequiredChildProperty(this.centerSlot, 'checked', Boolean(value));
    }
    /**
     * Gets the default value of the element.
     */
    get defaultValue() {
        return this.getRequiredChildProperty(this.centerSlot, 'defaultValue');
    }
    /**
     * Sets the default value of the element.
     */
    set defaultValue(value) {
        this.setRequiredChildProperty(this.centerSlot, 'defaultValue', value);
    }
    /**
     * Gets the default checked state of the element.
     */
    get defaultChecked() {
        return Boolean(this.getRequiredChildProperty(this.centerSlot, 'defaultChecked'));
    }
    /**
     * Sets the default checked state of the element.
     */
    set defaultChecked(value) {
        this.setRequiredChildProperty(this.centerSlot, 'defaultChecked', Boolean(value));
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.hasAttribute('required');
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.updatePropertyState('required', this.setRequiredChildProperty(this.centerSlot, 'required', state) && state);
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.hasAttribute('readonly');
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.updatePropertyState('readonly', this.setRequiredChildProperty(this.centerSlot, 'readOnly', state) && state);
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.hasAttribute('disabled');
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.updatePropertyState('disabled', this.setRequiredChildProperty(this.centerSlot, 'disabled', state) && state);
    }
    /**
     * Gets the element orientation.
     */
    get orientation() {
        return this.getAttribute('orientation') || 'column';
    }
    /**
     * Sets the element orientation.
     */
    set orientation(orientation) {
        this.setAttribute('orientation', orientation);
    }
    /**
     * Move the focus to this element.
     */
    focus() {
        this.callRequiredChildMethod(this.centerSlot, 'focus', []);
    }
    /**
     * Reset the element value to its initial value.
     */
    reset() {
        const child = this.getRequiredChildElement(this.centerSlot);
        if (child.reset instanceof Function) {
            child.reset();
        }
        else {
            if ('value' in child) {
                child.value = child.defaultValue;
            }
            if ('checked' in child) {
                child.checked = child.defaultChecked;
            }
        }
        this.changeHandler();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        return this.callRequiredChildMethod(this.centerSlot, 'checkValidity', []) !== false;
    }
    /**
     * Set the element custom validity error message.
     * @param error Custom error message.
     */
    setCustomValidity(error) {
        this.callRequiredChildMethod(this.centerSlot, 'setCustomValidity', [error]);
    }
};
__decorate([
    Class.Private()
], Element.prototype, "styles", void 0);
__decorate([
    Class.Private()
], Element.prototype, "currentLabel", void 0);
__decorate([
    Class.Private()
], Element.prototype, "labelSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "prependSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "centerSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "appendSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "fieldLayout", void 0);
__decorate([
    Class.Private()
], Element.prototype, "fieldStyles", void 0);
__decorate([
    Class.Private()
], Element.prototype, "changeHandler", null);
__decorate([
    Class.Public()
], Element.prototype, "empty", null);
__decorate([
    Class.Public()
], Element.prototype, "label", null);
__decorate([
    Class.Public()
], Element.prototype, "type", null);
__decorate([
    Class.Public()
], Element.prototype, "name", null);
__decorate([
    Class.Public()
], Element.prototype, "value", null);
__decorate([
    Class.Public()
], Element.prototype, "checked", null);
__decorate([
    Class.Public()
], Element.prototype, "defaultValue", null);
__decorate([
    Class.Public()
], Element.prototype, "defaultChecked", null);
__decorate([
    Class.Public()
], Element.prototype, "required", null);
__decorate([
    Class.Public()
], Element.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Element.prototype, "disabled", null);
__decorate([
    Class.Public()
], Element.prototype, "orientation", null);
__decorate([
    Class.Public()
], Element.prototype, "focus", null);
__decorate([
    Class.Public()
], Element.prototype, "reset", null);
__decorate([
    Class.Public()
], Element.prototype, "checkValidity", null);
__decorate([
    Class.Public()
], Element.prototype, "setCustomValidity", null);
Element = __decorate([
    JSX.Describe('swe-field'),
    Class.Describe()
], Element);
exports.Element = Element;

}},
"@singleware/ui-field/index":{pack:false, invoke:function(exports, require){
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Common exports.
var component_1 = require("./component");
exports.Component = component_1.Component;
var element_1 = require("./element");
exports.Element = element_1.Element;
var stylesheet_1 = require("./stylesheet");
exports.Stylesheet = stylesheet_1.Stylesheet;

}},
"@singleware/ui-field":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/ui-field/stylesheet":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const OSS = require("@singleware/oss");
/**
 * Field stylesheet class.
 */
let Stylesheet = class Stylesheet extends OSS.Stylesheet {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        /**
         * Host styles.
         */
        this.host = this.select(':host');
        /**
         * Field styles.
         */
        this.field = this.select(':host>.field');
        /**
         * Field group styles.
         */
        this.fieldGroup = this.select(':host>.field>.group');
        /**
         * Field sides styles.
         */
        this.fieldSides = this.select(':host>.field>.group>.prepend, :host>.field>.group>.append');
        /**
         * Row field styles.
         */
        this.rowField = this.select(':host([orientation="row"])>.field');
        /**
         * Row field label styles.
         */
        this.rowFieldLabel = this.select(':host([orientation="row"])>.field>.label');
        /**
         * Column field styles.
         */
        this.columnField = this.select(':host([orientation="column"])>.field, :host>.field');
        this.host.display = 'block';
        this.field.display = 'flex';
        this.field.width = '100%';
        this.fieldGroup.display = 'flex';
        this.fieldGroup.flexDirection = 'row';
        this.fieldGroup.alignItems = 'center';
        this.fieldGroup.width = 'inherit';
        this.fieldSides.flexShrink = 0;
        this.fieldSides.flexGrow = 0;
        this.rowField.flexDirection = 'row';
        this.rowFieldLabel.display = 'block';
        this.rowFieldLabel.alignSelf = 'center';
        this.columnField.flexDirection = 'column';
    }
};
__decorate([
    Class.Private()
], Stylesheet.prototype, "host", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "field", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "fieldGroup", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "fieldSides", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "rowField", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "rowFieldLabel", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "columnField", void 0);
Stylesheet = __decorate([
    Class.Describe()
], Stylesheet);
exports.Stylesheet = Stylesheet;

}},
"@singleware/ui-form/component":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
/**
 * Fieldset component class.
 */
let Component = class Component extends Control.Component {
    /**
     * Fieldset component class.
     */
    constructor() {
        super(...arguments);
        /**
         * Element instance.
         */
        this.skeleton = (JSX.create("swe-form", { class: this.properties.class, slot: this.properties.slot, name: this.properties.name, value: this.properties.value, unwind: this.properties.unwind, required: this.properties.required, readOnly: this.properties.readOnly, disabled: this.properties.disabled, orientation: this.properties.orientation, onChange: this.properties.onChange, onReset: this.properties.onReset, onSubmit: this.properties.onSubmit }, this.children));
    }
    /**
     * Gets the element.
     */
    get element() {
        return this.skeleton;
    }
    /**
     * Gets the empty state of the element.
     */
    get empty() {
        return this.skeleton.empty;
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.skeleton.name;
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.skeleton.name = name;
    }
    /**
     * Gets the element value.
     */
    get value() {
        return this.skeleton.value;
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        this.skeleton.value = value;
    }
    /**
     * Gets the unwind state of the element.
     */
    get unwind() {
        return this.skeleton.unwind;
    }
    /**
     * Sets the unwind state of the element.
     */
    set unwind(state) {
        this.skeleton.unwind = state;
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.skeleton.required;
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.skeleton.required = state;
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.skeleton.readOnly;
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.skeleton.readOnly = state;
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.skeleton.disabled;
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.skeleton.disabled = state;
    }
    /**
     * Gets the element orientation.
     */
    get orientation() {
        return this.skeleton.orientation;
    }
    /**
     * Sets the element orientation.
     */
    set orientation(orientation) {
        this.skeleton.orientation = orientation;
    }
    /**
     * Move the focus to the first child that can be focused.
     */
    focus() {
        this.skeleton.focus();
    }
    /**
     * Reset all fields in the element to its initial values.
     */
    reset() {
        this.skeleton.reset();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        return this.skeleton.checkValidity();
    }
};
__decorate([
    Class.Private()
], Component.prototype, "skeleton", void 0);
__decorate([
    Class.Public()
], Component.prototype, "element", null);
__decorate([
    Class.Public()
], Component.prototype, "empty", null);
__decorate([
    Class.Public()
], Component.prototype, "name", null);
__decorate([
    Class.Public()
], Component.prototype, "value", null);
__decorate([
    Class.Public()
], Component.prototype, "unwind", null);
__decorate([
    Class.Public()
], Component.prototype, "required", null);
__decorate([
    Class.Public()
], Component.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Component.prototype, "disabled", null);
__decorate([
    Class.Public()
], Component.prototype, "orientation", null);
__decorate([
    Class.Public()
], Component.prototype, "focus", null);
__decorate([
    Class.Public()
], Component.prototype, "reset", null);
__decorate([
    Class.Public()
], Component.prototype, "checkValidity", null);
Component = __decorate([
    Class.Describe()
], Component);
exports.Component = Component;

}},
"@singleware/ui-form/element":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Control = require("@singleware/ui-control");
const JSX = require("@singleware/jsx");
const stylesheet_1 = require("./stylesheet");
/**
 * Form element.
 */
let Element = class Element extends Control.Element {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        /**
         * Element styles.
         */
        this.styles = new stylesheet_1.Stylesheet();
        /**
         * Header slot element.
         */
        this.headerSlot = JSX.create("slot", { name: "header", class: "header" });
        /**
         * Content slot element.
         */
        this.contentSlot = JSX.create("slot", { name: "content", class: "content" });
        /**
         * Footer slot element.
         */
        this.footerSlot = JSX.create("slot", { name: "footer", class: "footer" });
        /**
         * Form layout element.
         */
        this.formLayout = (JSX.create("div", { class: "form" },
            this.headerSlot,
            this.contentSlot,
            this.footerSlot));
        /**
         * Form styles element.
         */
        this.formStyles = JSX.create("style", { type: "text/css" }, this.styles.toString());
        const shadow = JSX.append(this.attachShadow({ mode: 'closed' }), this.formStyles, this.formLayout);
        shadow.addEventListener('slotchange', this.changeHandler.bind(this));
        shadow.addEventListener('keyup', this.changeHandler.bind(this));
        shadow.addEventListener('change', this.changeHandler.bind(this));
        shadow.addEventListener('click', this.clickHandler.bind(this));
        shadow.addEventListener('keypress', this.keypressHandler.bind(this));
    }
    /**
     * Add all values from the specified child into the given entity.
     * @param entity Target entity.
     * @param child Child element.
     */
    addValues(entity, child) {
        const values = child.value;
        if (values instanceof Object) {
            for (const name in values) {
                if (values[name] !== void 0) {
                    entity[name] = values[name];
                }
            }
        }
    }
    /**
     * Add the value from the specified child into the given entity.
     * @param entity Target entity.
     * @param child Child element.
     */
    addValue(entity, child) {
        if (child.name) {
            const value = child.value;
            if (value !== void 0) {
                entity[child.name] = value;
            }
        }
    }
    /**
     * Enable or disable all first-level children with submit type.
     */
    updateSubmitButtonState() {
        const isDisabled = this.disabled || !this.checkValidity();
        for (const child of this.children) {
            switch (child.type) {
                case 'submit':
                    child.disabled = isDisabled;
                    break;
            }
        }
    }
    /**
     * Notifies the form submission.
     */
    submitAndNotify() {
        const saved = this.readOnly;
        const event = new Event('submit', { bubbles: true, cancelable: true });
        this.readOnly = true;
        this.dispatchEvent(event);
        this.readOnly = saved;
    }
    /**
     * Notifies the form reset.
     */
    resetAndNotify() {
        const event = new Event('reset', { bubbles: true, cancelable: true });
        if (this.dispatchEvent(event)) {
            this.reset();
        }
    }
    /**
     * Change event handler.
     */
    changeHandler() {
        this.updatePropertyState('empty', this.empty);
        this.updatePropertyState('invalid', !this.empty && !this.checkValidity());
        this.updateSubmitButtonState();
    }
    /**
     * Click event handler.
     * @param event Event information.
     */
    clickHandler(event) {
        const isTarget = event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement;
        const isUsable = !this.disabled && !this.readOnly && this.checkValidity();
        if (isTarget && isUsable) {
            switch (event.target.type) {
                case 'submit':
                    event.preventDefault();
                    this.submitAndNotify();
                    break;
                case 'reset':
                    event.preventDefault();
                    this.resetAndNotify();
                    break;
            }
        }
    }
    /**
     * Keypress event handler.
     * @param event Event information.
     */
    keypressHandler(event) {
        const isTarget = event.target instanceof HTMLInputElement;
        const isUsable = !this.disabled && !this.readOnly && this.checkValidity();
        if (isTarget && isUsable) {
            switch (event.code) {
                case 'Enter':
                    event.preventDefault();
                    this.submitAndNotify();
                    break;
            }
        }
    }
    /**
     * Determines whether the element is empty or not.
     */
    get empty() {
        for (const child of this.children) {
            if (!child.empty) {
                return false;
            }
        }
        return true;
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.getAttribute('name') || '';
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.setAttribute('name', name);
    }
    /**
     * Gets the element value.
     */
    get value() {
        const entity = {};
        for (const child of this.children) {
            if (!child.empty) {
                if (child.unwind) {
                    this.addValues(entity, child);
                }
                else {
                    this.addValue(entity, child);
                }
            }
        }
        return entity;
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        for (const child of this.children) {
            if (child.unwind) {
                child.value = value;
            }
            else if (value instanceof Object && value[child.name] !== void 0) {
                child.value = value[child.name];
            }
        }
        this.changeHandler();
    }
    /**
     * Gets the unwind state of the element.
     */
    get unwind() {
        return this.hasAttribute('unwind');
    }
    /**
     * Sets the unwind state of the element.
     */
    set unwind(state) {
        this.updatePropertyState('unwind', state);
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.hasAttribute('required');
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.updatePropertyState('required', state);
        this.updateChildrenState('required', state);
        this.changeHandler();
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.hasAttribute('readonly');
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.updatePropertyState('readonly', state);
        this.updateChildrenState('readOnly', state);
        this.changeHandler();
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.hasAttribute('disabled');
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.updatePropertyState('disabled', state);
        this.updateChildrenState('disabled', state);
        this.changeHandler();
    }
    /**
     * Gets the element orientation.
     */
    get orientation() {
        return this.getAttribute('orientation') || 'column';
    }
    /**
     * Sets the element orientation.
     */
    set orientation(orientation) {
        this.setAttribute('orientation', orientation);
    }
    /**
     * Move the focus to the first child that can be focused.
     */
    focus() {
        for (const child of this.children) {
            if (child.focus instanceof Function && !child.disabled && !child.readOnly) {
                child.focus();
                break;
            }
        }
    }
    /**
     * Reset all fields in the element to its initial values.
     */
    reset() {
        for (const child of this.children) {
            if (child.reset instanceof Function) {
                child.reset();
            }
            else {
                if ('value' in child) {
                    child.value = child.defaultValue;
                }
                if ('checked' in child) {
                    child.checked = child.defaultChecked;
                }
            }
        }
        this.changeHandler();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        for (const child of this.children) {
            if (child.checkValidity instanceof Function && !child.checkValidity()) {
                return false;
            }
        }
        return true;
    }
};
__decorate([
    Class.Private()
], Element.prototype, "styles", void 0);
__decorate([
    Class.Private()
], Element.prototype, "headerSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "contentSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "footerSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "formLayout", void 0);
__decorate([
    Class.Private()
], Element.prototype, "formStyles", void 0);
__decorate([
    Class.Private()
], Element.prototype, "addValues", null);
__decorate([
    Class.Private()
], Element.prototype, "addValue", null);
__decorate([
    Class.Private()
], Element.prototype, "updateSubmitButtonState", null);
__decorate([
    Class.Private()
], Element.prototype, "submitAndNotify", null);
__decorate([
    Class.Private()
], Element.prototype, "resetAndNotify", null);
__decorate([
    Class.Private()
], Element.prototype, "changeHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "clickHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "keypressHandler", null);
__decorate([
    Class.Public()
], Element.prototype, "empty", null);
__decorate([
    Class.Public()
], Element.prototype, "name", null);
__decorate([
    Class.Public()
], Element.prototype, "value", null);
__decorate([
    Class.Public()
], Element.prototype, "unwind", null);
__decorate([
    Class.Public()
], Element.prototype, "required", null);
__decorate([
    Class.Public()
], Element.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Element.prototype, "disabled", null);
__decorate([
    Class.Public()
], Element.prototype, "orientation", null);
__decorate([
    Class.Public()
], Element.prototype, "focus", null);
__decorate([
    Class.Public()
], Element.prototype, "reset", null);
__decorate([
    Class.Public()
], Element.prototype, "checkValidity", null);
Element = __decorate([
    JSX.Describe('swe-form'),
    Class.Describe()
], Element);
exports.Element = Element;

}},
"@singleware/ui-form/index":{pack:false, invoke:function(exports, require){
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Common exports.
var component_1 = require("./component");
exports.Component = component_1.Component;
var element_1 = require("./element");
exports.Element = element_1.Element;
var stylesheet_1 = require("./stylesheet");
exports.Stylesheet = stylesheet_1.Stylesheet;

}},
"@singleware/ui-form":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@singleware/ui-form/stylesheet":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const OSS = require("@singleware/oss");
/**
 * Form stylesheet class.
 */
let Stylesheet = class Stylesheet extends OSS.Stylesheet {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        /**
         * Host styles.
         */
        this.host = this.select(':host');
        /**
         * Form styles.
         */
        this.form = this.select(':host>.form');
        /**
         * Row form styles.
         */
        this.rowForm = this.select(':host([orientation="row"])>.form');
        /**
         * Column form styles.
         */
        this.columnForm = this.select(':host([orientation="column"])>.form, :host>.form');
        this.host.display = 'block';
        this.form.display = 'flex';
        this.form.width = 'inherit';
        this.form.height = 'inherit';
        this.rowForm.flexDirection = 'row';
        this.rowForm.alignItems = 'center';
        this.columnForm.flexDirection = 'column';
    }
};
__decorate([
    Class.Private()
], Stylesheet.prototype, "host", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "form", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "rowForm", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "columnForm", void 0);
Stylesheet = __decorate([
    Class.Describe()
], Stylesheet);
exports.Stylesheet = Stylesheet;

}},
"@module/component":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
/**
 * Editor component class.
 */
let Component = class Component extends Control.Component {
    /**
     * Editor component class.
     */
    constructor() {
        super(...arguments);
        /**
         * Element instance.
         */
        this.skeleton = (JSX.create("swe-editor", { class: this.properties.class, slot: this.properties.slot, name: this.properties.name, value: this.properties.value, defaultValue: this.properties.defaultValue, required: this.properties.required, readOnly: this.properties.readOnly, disabled: this.properties.disabled, preserveSelection: this.properties.preserveSelection, paragraphType: this.properties.paragraphType, deniedTags: this.properties.deniedTags, orientation: this.properties.orientation, onChange: this.properties.onChange }, this.children));
    }
    /**
     * Gets the element.
     */
    get element() {
        return this.skeleton;
    }
    /**
     * Determines whether the element is empty or not.
     */
    get empty() {
        return this.skeleton.empty;
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.skeleton.name;
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.skeleton.name = name;
    }
    /**
     * Gets the element value.
     */
    get value() {
        return this.skeleton.value;
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        this.skeleton.value = value;
    }
    /**
     * Gets the element default value.
     */
    get defaultValue() {
        return this.skeleton.defaultValue;
    }
    /**
     * Sets the element default value.
     */
    set defaultValue(value) {
        this.skeleton.defaultValue = value;
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.skeleton.required;
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.skeleton.required = state;
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.skeleton.readOnly;
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.skeleton.readOnly = state;
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.skeleton.disabled;
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.skeleton.disabled = state;
    }
    /**
     * Gets the preserve selection state.
     */
    get preserveSelection() {
        return this.skeleton.preserveSelection;
    }
    /**
     * Sets the preserve selection state.
     */
    set preserveSelection(status) {
        this.skeleton.preserveSelection = status;
    }
    /**
     * Gets the paragraph tag.
     */
    get paragraphType() {
        return this.skeleton.paragraphType;
    }
    /**
     * Sets the paragraph tag.
     */
    set paragraphType(tag) {
        this.skeleton.paragraphType = tag;
    }
    /**
     * Gets the denied tag list.
     */
    get deniedTags() {
        return this.skeleton.deniedTags;
    }
    /**
     * Sets the denied tag list.
     */
    set deniedTags(tags) {
        this.skeleton.deniedTags = tags;
    }
    /**
     * Gets the element orientation.
     */
    get orientation() {
        return this.skeleton.orientation;
    }
    /**
     * Sets the element orientation.
     */
    set orientation(orientation) {
        this.skeleton.orientation = orientation;
    }
    /**
     * Gets the selected range.
     */
    get selectedRange() {
        return this.skeleton.selectedRange;
    }
    /**
     * Gets the selected text.
     */
    get selectedText() {
        return this.selectedText;
    }
    /**
     * Gets the selected HTML.
     */
    get selectedHTML() {
        return this.skeleton.selectedHTML;
    }
    /**
     * Gets the selected styles.
     */
    get selectedStyles() {
        return this.selectedStyles;
    }
    /**
     * Sets the removal state for the specified element.
     * @param element Element instance.
     * @param state Determines whether the element can be removed by the user or not.
     * @param locker Locker object, should be used to unlock the element.
     * @throws Throws an error when the specified locker for the element is invalid.
     */
    setRemovalState(element, state, locker = null) {
        this.skeleton.setRemovalState(element, state, locker);
    }
    /**
     * Sets the rendering state of the specified node.
     * @param node Node instance.
     * @param state Determines whether the node should be ignored by the renderer or not.
     * @param children Determines whether the node children should be affected or not.
     */
    setRenderingState(node, state, children) {
        this.skeleton.setRenderingState(node, state, children);
    }
    /**
     * Clears the current selection.
     */
    clearSelection() {
        this.skeleton.clearSelection();
    }
    /**
     * Move the focus to this element.
     */
    focus() {
        this.skeleton.focus();
    }
    /**
     * Reset the element value to its initial value.
     */
    reset() {
        this.skeleton.reset();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        return this.skeleton.checkValidity();
    }
    /**
     * Change the font name for the selection or at the insertion point.
     * @param name Font name.
     */
    fontNameAction(name) {
        this.skeleton.fontNameAction(name);
    }
    /**
     * Change the font size for the selection or at the insertion point.
     * @param size Font size.
     */
    fontSizeAction(size) {
        this.skeleton.fontSizeAction(size);
    }
    /**
     * Change the font color for the selection or at the insertion point.
     * @param color Font color.
     */
    fontColorAction(color) {
        this.skeleton.fontColorAction(color);
    }
    /**
     * Change line height for the selection or at the insertion point.
     * @param height Line height.
     */
    lineHeightAction(height) {
        this.skeleton.lineHeightAction(height);
    }
    /**
     * Formats the specified tag for the selection or insertion point.
     * @param tag HTML tag.
     */
    formatAction(tag) {
        this.skeleton.formatAction(tag);
    }
    /**
     * Undoes the last executed command.
     */
    undoAction() {
        this.skeleton.undoAction();
    }
    /**
     * Redoes the previous undo command.
     */
    redoAction() {
        this.skeleton.redoAction();
    }
    /**
     * Toggles bold on/off for the selection or at the insertion point.
     */
    boldAction() {
        this.skeleton.boldAction();
    }
    /**
     * Toggles italics on/off for the selection or at the insertion point.
     */
    italicAction() {
        this.skeleton.italicAction();
    }
    /**
     * Toggles underline on/off for the selection or at the insertion point.
     */
    underlineAction() {
        this.skeleton.underlineAction();
    }
    /**
     * Toggles strikeThrough on/off for the selection or at the insertion point.
     */
    strikeThroughAction() {
        this.skeleton.strikeThroughAction();
    }
    /**
     * Creates a bulleted unordered list for the selection or at the insertion point.
     */
    unorderedListAction() {
        this.skeleton.unorderedListAction();
    }
    /**
     * Creates a numbered ordered list for the selection or at the insertion point.
     */
    orderedListAction() {
        this.skeleton.orderedListAction();
    }
    /**
     * Justifies the selection or insertion point to the left.
     */
    alignLeftAction() {
        this.skeleton.alignLeftAction();
    }
    /**
     * Justifies the selection or insertion point to the center.
     */
    alignCenterAction() {
        this.skeleton.alignCenterAction();
    }
    /**
     * Justifies the selection or insertion point to the right.
     */
    alignRightAction() {
        this.skeleton.alignRightAction();
    }
    /**
     * Justifies the selection or insertion point.
     */
    alignJustifyAction() {
        this.skeleton.alignJustifyAction();
    }
    /**
     * Outdents the line containing the selection or insertion point.
     */
    outdentAction() {
        this.skeleton.outdentAction();
    }
    /**
     * Indents the line containing the selection or insertion point.
     */
    indentAction() {
        this.skeleton.indentAction();
    }
    /**
     * Removes the current selection and copies it to the clipboard.
     */
    cutAction() {
        this.skeleton.cutAction();
    }
    /**
     * Copies the current selection to the clipboard.
     */
    copyAction() {
        this.skeleton.copyAction();
    }
    /**
     * Pastes the clipboard contents at the insertion point.
     */
    pasteAction() {
        this.skeleton.pasteAction();
    }
    /**
     * Sets a new zoom into the content element.
     */
    zoomAction(zoom) {
        this.skeleton.zoomAction(zoom);
    }
};
__decorate([
    Class.Private()
], Component.prototype, "skeleton", void 0);
__decorate([
    Class.Public()
], Component.prototype, "element", null);
__decorate([
    Class.Public()
], Component.prototype, "empty", null);
__decorate([
    Class.Public()
], Component.prototype, "name", null);
__decorate([
    Class.Public()
], Component.prototype, "value", null);
__decorate([
    Class.Public()
], Component.prototype, "defaultValue", null);
__decorate([
    Class.Public()
], Component.prototype, "required", null);
__decorate([
    Class.Public()
], Component.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Component.prototype, "disabled", null);
__decorate([
    Class.Public()
], Component.prototype, "preserveSelection", null);
__decorate([
    Class.Public()
], Component.prototype, "paragraphType", null);
__decorate([
    Class.Public()
], Component.prototype, "deniedTags", null);
__decorate([
    Class.Public()
], Component.prototype, "orientation", null);
__decorate([
    Class.Public()
], Component.prototype, "selectedRange", null);
__decorate([
    Class.Public()
], Component.prototype, "selectedText", null);
__decorate([
    Class.Public()
], Component.prototype, "selectedHTML", null);
__decorate([
    Class.Public()
], Component.prototype, "selectedStyles", null);
__decorate([
    Class.Public()
], Component.prototype, "setRemovalState", null);
__decorate([
    Class.Public()
], Component.prototype, "setRenderingState", null);
__decorate([
    Class.Public()
], Component.prototype, "clearSelection", null);
__decorate([
    Class.Public()
], Component.prototype, "focus", null);
__decorate([
    Class.Public()
], Component.prototype, "reset", null);
__decorate([
    Class.Public()
], Component.prototype, "checkValidity", null);
__decorate([
    Class.Public()
], Component.prototype, "fontNameAction", null);
__decorate([
    Class.Public()
], Component.prototype, "fontSizeAction", null);
__decorate([
    Class.Public()
], Component.prototype, "fontColorAction", null);
__decorate([
    Class.Public()
], Component.prototype, "lineHeightAction", null);
__decorate([
    Class.Public()
], Component.prototype, "formatAction", null);
__decorate([
    Class.Public()
], Component.prototype, "undoAction", null);
__decorate([
    Class.Public()
], Component.prototype, "redoAction", null);
__decorate([
    Class.Public()
], Component.prototype, "boldAction", null);
__decorate([
    Class.Public()
], Component.prototype, "italicAction", null);
__decorate([
    Class.Public()
], Component.prototype, "underlineAction", null);
__decorate([
    Class.Public()
], Component.prototype, "strikeThroughAction", null);
__decorate([
    Class.Public()
], Component.prototype, "unorderedListAction", null);
__decorate([
    Class.Public()
], Component.prototype, "orderedListAction", null);
__decorate([
    Class.Public()
], Component.prototype, "alignLeftAction", null);
__decorate([
    Class.Public()
], Component.prototype, "alignCenterAction", null);
__decorate([
    Class.Public()
], Component.prototype, "alignRightAction", null);
__decorate([
    Class.Public()
], Component.prototype, "alignJustifyAction", null);
__decorate([
    Class.Public()
], Component.prototype, "outdentAction", null);
__decorate([
    Class.Public()
], Component.prototype, "indentAction", null);
__decorate([
    Class.Public()
], Component.prototype, "cutAction", null);
__decorate([
    Class.Public()
], Component.prototype, "copyAction", null);
__decorate([
    Class.Public()
], Component.prototype, "pasteAction", null);
__decorate([
    Class.Public()
], Component.prototype, "zoomAction", null);
Component = __decorate([
    Class.Describe()
], Component);
exports.Component = Component;

}},
"@module/element":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
const stylesheet_1 = require("./stylesheet");
const settings_1 = require("./settings");
const helper_1 = require("./helper");
/**
 * Editor element.
 */
let Element = class Element extends Control.Element {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        /**
         * Current HTML content.
         */
        this.currentHTML = '';
        /**
         * List of denied tags.
         */
        this.deniedTagList = [...settings_1.Settings.defaultDeniedTags];
        /**
         * Content observer.
         */
        this.observer = new MutationObserver(this.contentChangeHandler.bind(this));
        /**
         * Map of unremovable nodes.
         */
        this.unremovableMap = new WeakMap();
        /**
         * Map of ignored nodes.
         */
        this.ignoredMap = new WeakMap();
        /**
         * Element styles.
         */
        this.styles = new stylesheet_1.Stylesheet();
        /**
         * Toolbar element.
         */
        this.toolbarSlot = JSX.create("slot", { name: "toolbar", class: "toolbar" });
        /**
         * Content element.
         */
        this.contentSlot = JSX.create("slot", { name: "content", class: "content", onSlotChange: this.contentSlotChangeHandler.bind(this) });
        /**
         * Editor layout element.
         */
        this.editorLayout = (JSX.create("div", { class: "editor" },
            this.toolbarSlot,
            this.contentSlot));
        /**
         * Editor styles element.
         */
        this.editorStyles = JSX.create("style", { type: "text/css" }, this.styles.toString());
        /**
         * Default value for resets.
         */
        this.defaultValue = '';
        JSX.append(this.attachShadow({ mode: 'closed' }), this.editorStyles, this.editorLayout);
        this.contentSlot.addEventListener('keyup', this.saveChanges.bind(this), true);
        this.contentSlot.addEventListener('focus', this.restoreSelection.bind(this), true);
        this.contentSlot.addEventListener('mousedown', this.clearSelection.bind(this), true);
        this.contentSlot.addEventListener('mouseup', this.saveSelectionRange.bind(this), true);
        this.contentSlot.addEventListener('blur', this.wrapSelectionRange.bind(this), true);
        this.paragraphType = 'p';
    }
    /**
     * Update all validation attributes based on the current content.
     */
    updateValidation() {
        this.updatePropertyState('invalid', !this.empty && !this.checkValidity());
        this.updatePropertyState('empty', this.empty);
    }
    /**
     * Starts the content observer.
     */
    startContentObserver() {
        this.observer.observe(this.getRequiredChildElement(this.contentSlot), {
            childList: true,
            subtree: true
        });
    }
    /**
     * Stops the content observer and clear its records.
     */
    stopContentObserver() {
        this.observer.disconnect();
        this.observer.takeRecords();
    }
    /**
     * Preserves the current selection elements wrapping it into a new mark element.
     */
    wrapSelectionRange() {
        if (this.currentRange && !this.currentRange.collapsed && this.preserveSelection) {
            this.stopContentObserver();
            this.currentMark = JSX.create("mark", { "data-swe-editor-selection": true }, this.currentRange.extractContents());
            this.currentRange.insertNode(this.currentMark);
            this.setRenderingState(this.currentMark, false);
            this.startContentObserver();
        }
    }
    /**
     * Restores the previously preserved selection elements unwrapping the current mark element.
     */
    unwrapSelectionRange() {
        if (this.currentMark) {
            this.stopContentObserver();
            JSX.unwrap(this.currentMark);
            this.startContentObserver();
            this.currentMark = void 0;
        }
    }
    /**
     * Gets the current selection.
     * @returns Returns the selection object.
     * @throws Throws an error when the selection object doesn't exists.
     */
    getSelection() {
        const selection = window.getSelection();
        if (!selection) {
            throw new Error(`There's no selection.`);
        }
        return selection;
    }
    /**
     * Saves the current selection range.
     */
    saveSelectionRange() {
        const selection = this.getSelection();
        if (selection.rangeCount > 0) {
            this.currentRange = selection.getRangeAt(0);
        }
    }
    /**
     * Restores the previously saved selection range.
     */
    restoreSelectionRange() {
        if (this.currentRange && this.preserveSelection) {
            const selection = this.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.currentRange);
        }
    }
    /**
     * Removes the current saved selection range.
     */
    removeSelectionRange() {
        if (this.currentRange) {
            this.getSelection().removeRange(this.currentRange);
            this.currentRange = void 0;
        }
    }
    /**
     * Restores the previously saved selection range and unwraps the current mark element.
     */
    restoreSelection() {
        this.unwrapSelectionRange();
        this.restoreSelectionRange();
    }
    /**
     * Restores the current focus in the specified element.
     * @param element Element instance.
     */
    restoreFocus(element) {
        const selection = this.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
        return range;
    }
    /**
     * Restores the first paragraph in the content element.
     * @param focused Determines whether the focus should be moved to the restored paragraph or not.
     * @returns Returns true when the paragraph was restored, false otherwise.
     */
    restoreParagraph(focused) {
        const content = this.getRequiredChildElement(this.contentSlot);
        if (content.firstChild === null) {
            const paragraph = JSX.create(this.paragraphType, {});
            if (paragraph.tagName !== 'BR') {
                JSX.append(paragraph, JSX.create("br", null));
            }
            content.appendChild(paragraph);
            this.currentHTML = content.innerHTML;
            if (focused) {
                this.restoreFocus(paragraph);
            }
            return true;
        }
        return false;
    }
    /**
     * Restores any locked node form the specified node list.
     * @param parent Parent node for all nodes in the specified list of removed nodes.
     * @param next Next sibling node of the specified list of removed nodes.
     * @param list List of removed nodes or elements.
     * @returns Returns the number of restored nodes.
     */
    restoreLockedNodes(parent, next, list) {
        let total = 0;
        for (let i = list.length - 1; i > -1; --i) {
            const node = list.item(i);
            if (node instanceof HTMLElement) {
                if (this.unremovableMap.has(node)) {
                    parent.insertBefore(node, next && next.isConnected ? next : parent.lastChild);
                    total++;
                }
                else {
                    total += this.restoreLockedNodes(parent, next, node.children);
                }
            }
        }
        return total;
    }
    /**
     * Remove any denied node for the specified node list.
     * @param list List of added nodes or elements.
     * @returns Returns the number of removed nodes.
     */
    removeDeniedNodes(list) {
        let total = 0;
        for (let i = list.length - 1; i > -1; --i) {
            const node = list.item(i);
            if (node instanceof HTMLElement) {
                if (this.deniedTags.includes(node.tagName)) {
                    node.remove();
                    total++;
                }
                else {
                    total += this.removeDeniedNodes(node.children);
                }
            }
        }
        return total;
    }
    /**
     * Remove all given CSS properties from the specified list of nodes, when the node becomes without CSS, it will be removed.
     * @param list List of nodes or elements.
     * @param tag Expected tag name.
     * @param properties CSS properties to be cleaned.
     * @returns Returns the number of removed nodes.
     */
    clearNodes(list, tag, ...properties) {
        let total = 0;
        for (let i = list.length - 1; i > -1; --i) {
            const node = list.item(i);
            if (node instanceof HTMLElement) {
                if (node.tagName.toLowerCase() === tag) {
                    for (const property of properties) {
                        node.style[property] = null;
                    }
                    const styles = node.getAttribute('style');
                    if (styles === null || styles.length === 0) {
                        JSX.unwrap(node);
                        total++;
                    }
                }
                total += this.clearNodes(node.children, tag, ...properties);
            }
        }
        return total;
    }
    /**
     * Saves the current content changes.
     * @returns Returns true when the content changes was saved, false otherwise.
     */
    saveChanges() {
        const content = this.getRequiredChildElement(this.contentSlot);
        if (this.currentHTML !== content.innerHTML) {
            const event = new Event('change', { bubbles: true, cancelable: true });
            if (this.dispatchEvent(event)) {
                this.currentHTML = content.innerHTML;
                this.updateValidation();
                return true;
            }
            else {
                this.stopContentObserver();
                content.innerHTML = this.currentHTML;
                if ((this.currentMark = content.querySelector('[data-swe-editor-selection]'))) {
                    this.currentRange = this.restoreFocus(this.currentMark);
                }
                this.startContentObserver();
            }
        }
        return false;
    }
    /**
     * Gets the higher parent element that is connected to the document.
     * @param parent First parent element.
     * @returns Returns the higher parent element that is connected to the document.
     */
    getConnectedParent(parent) {
        while (parent && !parent.isConnected) {
            parent = parent.parentElement;
        }
        return parent;
    }
    /**
     * Content change, event handler.
     * @param records Mutation record list.
     */
    contentChangeHandler(records) {
        const content = this.getRequiredChildElement(this.contentSlot);
        const focused = JSX.childOf(content, this.getSelection().focusNode);
        let updated = false;
        this.stopContentObserver();
        for (const record of records) {
            const parent = this.getConnectedParent(record.target) || content;
            updated = this.restoreLockedNodes(parent, record.nextSibling, record.removedNodes) > 0 || updated;
            updated = this.removeDeniedNodes(record.addedNodes) > 0 || updated;
        }
        if (this.restoreParagraph(focused) || updated) {
            this.currentHTML = content.innerHTML;
            this.updateValidation();
        }
        this.startContentObserver();
    }
    /**
     * Updates the current selection into the new input slot element.
     */
    contentSlotChangeHandler() {
        const content = this.getRequiredChildElement(this.contentSlot);
        content.contentEditable = (!this.readOnly && !this.disabled).toString();
        this.currentHTML = content.innerHTML;
        this.restoreParagraph(JSX.childOf(content, this.getSelection().focusNode));
        this.updateValidation();
        this.clearSelection();
        this.stopContentObserver();
        this.startContentObserver();
    }
    /**
     * Performs a surrounding in the current selection with the specified tag.
     * @param tag Tag name.
     * @returns Returns the affected element instance.
     */
    performSurrounding(tag) {
        this.focus();
        const selection = this.getSelection();
        const range = selection.getRangeAt(0);
        let element;
        if (range.startContainer instanceof HTMLElement && range.startContainer.tagName.toLowerCase() === tag) {
            element = range.startContainer;
        }
        else if (range.endContainer instanceof HTMLElement && range.endContainer.tagName.toLowerCase() === tag) {
            element = range.endContainer;
        }
        if (!element) {
            const newer = document.createRange();
            range.surroundContents((element = JSX.create(tag, {})));
            newer.selectNodeContents(element);
            selection.removeRange(range);
            selection.addRange(newer);
        }
        return element;
    }
    /**
     * Performs the specified command with the given value.
     * @param name Command name.
     * @param value Command value.
     * @returns Returns the affected element instance.
     */
    performCommand(name, value) {
        this.focus();
        const selection = this.getSelection();
        document.execCommand(name, false, value);
        this.saveChanges();
        return selection.focusNode.parentElement;
    }
    /**
     * Determines whether the element is empty or not.
     */
    get empty() {
        return this.getRequiredChildElement(this.contentSlot).innerText.length === 0;
    }
    /**
     * Gets the element name.
     */
    get name() {
        return this.getAttribute('name') || '';
    }
    /**
     * Sets the element name.
     */
    set name(name) {
        this.setAttribute('name', name);
    }
    /**
     * Gets the element value.
     */
    get value() {
        return helper_1.Helper.buildHTMLNodes(this.getRequiredChildElement(this.contentSlot).childNodes, this.ignoredMap);
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        const content = this.getRequiredChildElement(this.contentSlot);
        const focused = JSX.childOf(content, this.getSelection().focusNode);
        this.currentHTML = content.innerHTML = value || '';
        this.restoreParagraph(focused);
        this.updateValidation();
        this.clearSelection();
    }
    /**
     * Gets the required state of the element.
     */
    get required() {
        return this.hasAttribute('required');
    }
    /**
     * Sets the required state of the element.
     */
    set required(state) {
        this.updatePropertyState('required', state);
        this.updateValidation();
    }
    /**
     * Gets the read-only state of the element.
     */
    get readOnly() {
        return this.hasAttribute('readonly');
    }
    /**
     * Sets the read-only state of the element.
     */
    set readOnly(state) {
        this.updatePropertyState('readonly', state);
        this.getRequiredChildElement(this.contentSlot).contentEditable = (!(state || this.disabled)).toString();
    }
    /**
     * Gets the disabled state of the element.
     */
    get disabled() {
        return this.hasAttribute('disabled');
    }
    /**
     * Sets the disabled state of the element.
     */
    set disabled(state) {
        this.updatePropertyState('disabled', state);
        this.getRequiredChildElement(this.contentSlot).contentEditable = (!(state || this.readOnly)).toString();
    }
    /**
     * Gets the preserve selection state.
     */
    get preserveSelection() {
        return this.hasAttribute('preserveselection');
    }
    /**
     * Sets the preserve selection state.
     */
    set preserveSelection(state) {
        if (!state) {
            this.unwrapSelectionRange();
        }
        this.updatePropertyState('preserveselection', state);
    }
    /**
     * Gets the paragraph type.
     */
    get paragraphType() {
        return document.queryCommandValue('defaultParagraphSeparator');
    }
    /**
     * Sets the paragraph type.
     */
    set paragraphType(type) {
        document.execCommand('defaultParagraphSeparator', false, type.toLowerCase());
    }
    /**
     * Gets the denied tag list.
     */
    get deniedTags() {
        return this.deniedTagList;
    }
    /**
     * Sets the denied tag list.
     */
    set deniedTags(tags) {
        const content = this.getRequiredChildElement(this.contentSlot);
        this.deniedTagList = tags.map((tag) => tag.toLowerCase());
        if (this.removeDeniedNodes(content.children) > 0) {
            this.saveChanges();
        }
    }
    /**
     * Gets the element orientation.
     */
    get orientation() {
        return this.getAttribute('orientation') || 'row';
    }
    /**
     * Sets the element orientation.
     */
    set orientation(orientation) {
        this.setAttribute('orientation', orientation);
    }
    /**
     * Gets the selected range.
     */
    get selectedRange() {
        return this.currentRange;
    }
    /**
     * Gets the selected text.
     */
    get selectedText() {
        if (this.currentRange) {
            return this.currentRange.cloneContents().textContent || '';
        }
        return void 0;
    }
    /**
     * Gets the selected HTML.
     */
    get selectedHTML() {
        if (this.currentRange) {
            return helper_1.Helper.buildHTMLNodes(this.currentRange.cloneContents().childNodes, this.ignoredMap);
        }
        return void 0;
    }
    /**
     * Gets the selected styles.
     */
    get selectedStyles() {
        const selection = window.getSelection();
        const styles = { ...settings_1.Settings.defaultStyles };
        if (selection.focusNode) {
            const content = this.getRequiredChildElement(this.contentSlot);
            let current = selection.focusNode;
            styles.zoom = parseFloat(this.contentSlot.style.zoom || '1.0');
            while (current && current !== content) {
                if (current instanceof HTMLElement) {
                    helper_1.Helper.collectStylesByElement(styles, current);
                    helper_1.Helper.collectStylesByCSS(styles, window.getComputedStyle(current));
                }
                current = current.parentElement;
            }
        }
        return styles;
    }
    /**
     * Sets the removal state for the specified element.
     * @param element Element instance.
     * @param state Determines whether the element can be removed by the user or not.
     * @param locker Locker object, should be used to unlock the element.
     * @throws Throws an error when the specified locker for the element is invalid.
     */
    setRemovalState(element, state, locker = null) {
        const entry = this.unremovableMap.get(element);
        if (state) {
            if (entry !== locker) {
                throw new Error(`Element doesn't found or invalid locker argument.`);
            }
            this.unremovableMap.delete(element);
        }
        else {
            if (entry && entry !== locker) {
                throw new Error(`Element already locked by another locker.`);
            }
            this.unremovableMap.set(element, locker);
        }
    }
    /**
     * Sets the rendering state of the specified node.
     * @param node Node instance.
     * @param state Determines whether the node should be ignored by the renderer or not.
     * @param children Determines whether the node children should be affected or not.
     */
    setRenderingState(node, state, children) {
        if (state) {
            this.ignoredMap.delete(node);
        }
        else {
            this.ignoredMap.set(node, children || false);
        }
    }
    /**
     * Clears the current selection.
     */
    clearSelection() {
        this.unwrapSelectionRange();
        this.removeSelectionRange();
    }
    /**
     * Move the focus to this element.
     */
    focus() {
        this.unwrapSelectionRange();
        this.callRequiredChildMethod(this.contentSlot, 'focus', []);
        this.restoreSelectionRange();
    }
    /**
     * Reset the element value to its initial value.
     */
    reset() {
        const content = this.getRequiredChildElement(this.contentSlot);
        const focused = JSX.childOf(content, this.getSelection().focusNode);
        this.currentHTML = content.innerHTML = this.defaultValue || '';
        this.restoreParagraph(focused);
        this.updateValidation();
        this.clearSelection();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        return !this.required || (this.value !== void 0 && this.value.length !== 0);
    }
    /**
     * Formats the specified font name for the selection or at the insertion point.
     * @param name Font name.
     */
    fontNameAction(name) {
        const element = this.performSurrounding('span');
        this.clearNodes(element.children, 'span', 'fontFamily');
        this.saveChanges();
        element.style.fontFamily = name;
        element.normalize();
    }
    /**
     * Formats the specified font size for the selection or at the insertion point.
     * @param size Font size.
     */
    fontSizeAction(size) {
        const element = this.performSurrounding('span');
        this.clearNodes(element.children, 'span', 'fontSize');
        this.saveChanges();
        element.style.fontSize = size;
        element.normalize();
    }
    /**
     * Formats the specified font color for the selection or at the insertion point.
     * @param color Font color.
     */
    fontColorAction(color) {
        const element = this.performSurrounding('span');
        this.clearNodes(element.children, 'span', 'color');
        this.saveChanges();
        element.style.color = color;
        element.normalize();
    }
    /**
     * Change line height for the selection or at the insertion point.
     * @param height Line height.
     */
    lineHeightAction(height) {
        const element = this.performSurrounding('p');
        this.saveChanges();
        element.style.lineHeight = height;
    }
    /**
     * Formats the specified tag from the selection or insertion point.
     * @param tag HTML tag.
     */
    formatAction(tag) {
        this.performCommand('formatBlock', tag);
    }
    /**
     * Undoes the last executed command.
     */
    undoAction() {
        this.performCommand('undo');
    }
    /**
     * Redoes the previous undo command.
     */
    redoAction() {
        this.performCommand('redo');
    }
    /**
     * Toggles bold on/off for the selection or at the insertion point.
     */
    boldAction() {
        this.performCommand('bold');
    }
    /**
     * Toggles italics on/off for the selection or at the insertion point.
     */
    italicAction() {
        this.performCommand('italic');
    }
    /**
     * Toggles underline on/off for the selection or at the insertion point.
     */
    underlineAction() {
        this.performCommand('underline');
    }
    /**
     * Toggles strikeThrough on/off for the selection or at the insertion point.
     */
    strikeThroughAction() {
        this.performCommand('strikeThrough');
    }
    /**
     * Creates a bulleted unordered list for the selection or at the insertion point.
     */
    unorderedListAction() {
        this.performCommand('insertUnorderedList');
    }
    /**
     * Creates a numbered ordered list for the selection or at the insertion point.
     */
    orderedListAction() {
        this.performCommand('insertOrderedList');
    }
    /**
     * Justifies the selection or insertion point to the left.
     */
    alignLeftAction() {
        this.performCommand('justifyLeft');
    }
    /**
     * Justifies the selection or insertion point to the center.
     */
    alignCenterAction() {
        this.performCommand('justifyCenter');
    }
    /**
     * Justifies the selection or insertion point to the right.
     */
    alignRightAction() {
        this.performCommand('justifyRight');
    }
    /**
     * Justifies the selection or insertion point.
     */
    alignJustifyAction() {
        this.performCommand('justifyFull');
    }
    /**
     * Outdents the line containing the selection or insertion point.
     */
    outdentAction() {
        this.performCommand('outdent');
    }
    /**
     * Indents the line containing the selection or insertion point.
     */
    indentAction() {
        this.performCommand('indent');
    }
    /**
     * Removes the current selection and copies it to the clipboard.
     */
    cutAction() {
        this.performCommand('cut');
    }
    /**
     * Copies the current selection to the clipboard.
     */
    copyAction() {
        this.performCommand('copy');
    }
    /**
     * Pastes the clipboard contents at the insertion point.
     */
    pasteAction() {
        this.performCommand('paste');
    }
    /**
     * Sets a new zoom into the content element.
     */
    zoomAction(zoom) {
        this.contentSlot.style.zoom = zoom.toFixed(2);
    }
};
__decorate([
    Class.Private()
], Element.prototype, "currentRange", void 0);
__decorate([
    Class.Private()
], Element.prototype, "currentMark", void 0);
__decorate([
    Class.Private()
], Element.prototype, "currentHTML", void 0);
__decorate([
    Class.Private()
], Element.prototype, "deniedTagList", void 0);
__decorate([
    Class.Private()
], Element.prototype, "observer", void 0);
__decorate([
    Class.Private()
], Element.prototype, "unremovableMap", void 0);
__decorate([
    Class.Private()
], Element.prototype, "ignoredMap", void 0);
__decorate([
    Class.Private()
], Element.prototype, "styles", void 0);
__decorate([
    Class.Private()
], Element.prototype, "toolbarSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "contentSlot", void 0);
__decorate([
    Class.Private()
], Element.prototype, "editorLayout", void 0);
__decorate([
    Class.Private()
], Element.prototype, "editorStyles", void 0);
__decorate([
    Class.Private()
], Element.prototype, "updateValidation", null);
__decorate([
    Class.Private()
], Element.prototype, "startContentObserver", null);
__decorate([
    Class.Private()
], Element.prototype, "stopContentObserver", null);
__decorate([
    Class.Private()
], Element.prototype, "wrapSelectionRange", null);
__decorate([
    Class.Private()
], Element.prototype, "unwrapSelectionRange", null);
__decorate([
    Class.Private()
], Element.prototype, "getSelection", null);
__decorate([
    Class.Private()
], Element.prototype, "saveSelectionRange", null);
__decorate([
    Class.Private()
], Element.prototype, "restoreSelectionRange", null);
__decorate([
    Class.Private()
], Element.prototype, "removeSelectionRange", null);
__decorate([
    Class.Private()
], Element.prototype, "restoreSelection", null);
__decorate([
    Class.Private()
], Element.prototype, "restoreFocus", null);
__decorate([
    Class.Private()
], Element.prototype, "restoreParagraph", null);
__decorate([
    Class.Private()
], Element.prototype, "restoreLockedNodes", null);
__decorate([
    Class.Private()
], Element.prototype, "removeDeniedNodes", null);
__decorate([
    Class.Private()
], Element.prototype, "clearNodes", null);
__decorate([
    Class.Private()
], Element.prototype, "saveChanges", null);
__decorate([
    Class.Private()
], Element.prototype, "getConnectedParent", null);
__decorate([
    Class.Private()
], Element.prototype, "contentChangeHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "contentSlotChangeHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "performSurrounding", null);
__decorate([
    Class.Private()
], Element.prototype, "performCommand", null);
__decorate([
    Class.Public()
], Element.prototype, "empty", null);
__decorate([
    Class.Public()
], Element.prototype, "name", null);
__decorate([
    Class.Public()
], Element.prototype, "value", null);
__decorate([
    Class.Public()
], Element.prototype, "defaultValue", void 0);
__decorate([
    Class.Public()
], Element.prototype, "required", null);
__decorate([
    Class.Public()
], Element.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Element.prototype, "disabled", null);
__decorate([
    Class.Public()
], Element.prototype, "preserveSelection", null);
__decorate([
    Class.Public()
], Element.prototype, "paragraphType", null);
__decorate([
    Class.Public()
], Element.prototype, "deniedTags", null);
__decorate([
    Class.Public()
], Element.prototype, "orientation", null);
__decorate([
    Class.Public()
], Element.prototype, "selectedRange", null);
__decorate([
    Class.Public()
], Element.prototype, "selectedText", null);
__decorate([
    Class.Public()
], Element.prototype, "selectedHTML", null);
__decorate([
    Class.Public()
], Element.prototype, "selectedStyles", null);
__decorate([
    Class.Public()
], Element.prototype, "setRemovalState", null);
__decorate([
    Class.Public()
], Element.prototype, "setRenderingState", null);
__decorate([
    Class.Public()
], Element.prototype, "clearSelection", null);
__decorate([
    Class.Public()
], Element.prototype, "focus", null);
__decorate([
    Class.Public()
], Element.prototype, "reset", null);
__decorate([
    Class.Public()
], Element.prototype, "checkValidity", null);
__decorate([
    Class.Public()
], Element.prototype, "fontNameAction", null);
__decorate([
    Class.Public()
], Element.prototype, "fontSizeAction", null);
__decorate([
    Class.Public()
], Element.prototype, "fontColorAction", null);
__decorate([
    Class.Public()
], Element.prototype, "lineHeightAction", null);
__decorate([
    Class.Public()
], Element.prototype, "formatAction", null);
__decorate([
    Class.Public()
], Element.prototype, "undoAction", null);
__decorate([
    Class.Public()
], Element.prototype, "redoAction", null);
__decorate([
    Class.Public()
], Element.prototype, "boldAction", null);
__decorate([
    Class.Public()
], Element.prototype, "italicAction", null);
__decorate([
    Class.Public()
], Element.prototype, "underlineAction", null);
__decorate([
    Class.Public()
], Element.prototype, "strikeThroughAction", null);
__decorate([
    Class.Public()
], Element.prototype, "unorderedListAction", null);
__decorate([
    Class.Public()
], Element.prototype, "orderedListAction", null);
__decorate([
    Class.Public()
], Element.prototype, "alignLeftAction", null);
__decorate([
    Class.Public()
], Element.prototype, "alignCenterAction", null);
__decorate([
    Class.Public()
], Element.prototype, "alignRightAction", null);
__decorate([
    Class.Public()
], Element.prototype, "alignJustifyAction", null);
__decorate([
    Class.Public()
], Element.prototype, "outdentAction", null);
__decorate([
    Class.Public()
], Element.prototype, "indentAction", null);
__decorate([
    Class.Public()
], Element.prototype, "cutAction", null);
__decorate([
    Class.Public()
], Element.prototype, "copyAction", null);
__decorate([
    Class.Public()
], Element.prototype, "pasteAction", null);
__decorate([
    Class.Public()
], Element.prototype, "zoomAction", null);
Element = __decorate([
    JSX.Describe('swe-editor'),
    Class.Describe()
], Element);
exports.Element = Element;

}},
"@module/helper":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
/**
 * Editor helper.
 */
let Helper = class Helper extends Class.Null {
    /**
     * Gets the representative string of the specified attribute list.
     * @param attributes List of attributes.
     * @returns Returns the representative string of the specified attribute list.
     */
    static buildHTMLAttributes(attributes) {
        const list = [];
        for (let i = 0; i < attributes.length; ++i) {
            const attribute = attributes.item(i);
            if (attribute.value !== null) {
                list.push(`${attribute.name}="${JSX.escape(attribute.value)}"`);
            }
            else {
                list.push(`${attribute.value}`);
            }
        }
        return list.join(' ');
    }
    /**
     * Gets the representative string of the specified node list.
     * @param nodes List of nodes.
     * @param ignore Map of ignored elements and its children.
     * @returns Returns the representative string of the specified node list.
     */
    static buildHTMLNodes(nodes, ignore) {
        const list = [];
        for (const node of nodes) {
            if (node instanceof HTMLElement) {
                const children = this.buildHTMLNodes(node.childNodes, ignore);
                if (ignore.has(node)) {
                    if (ignore.get(node) !== true && children.length > 0) {
                        list.push(children);
                    }
                }
                else {
                    const tagName = node.tagName.toLowerCase();
                    const attributes = this.buildHTMLAttributes(node.attributes);
                    if (children.length > 0) {
                        list.push(`<${tagName}${attributes.length ? ` ${attributes}` : ''}>${children}</${tagName}>`);
                    }
                    else {
                        list.push(`<${tagName}${attributes.length ? ` ${attributes}` : ''}${this.emptyElements.has(tagName) ? '' : '/'}>`);
                    }
                }
            }
            else {
                list.push(node.textContent || '');
            }
        }
        return list.join('');
    }
    /**
     * Collect all styles by its respective CSS declaration form the specified CSS declarations.
     * @param styles Styles map.
     * @param declarations CSS declarations.
     */
    static collectStylesByCSS(styles, declarations) {
        let style, property;
        for (const entry in this.stylesByCSSDeclaration) {
            if ((style = this.stylesByCSSDeclaration[entry])) {
                if (style.target) {
                    if (styles[style.target] === void 0) {
                        styles[style.target] = declarations[entry];
                    }
                }
                else if (style.mapping) {
                    if ((property = style.mapping[declarations[entry]])) {
                        styles[property] = true;
                    }
                }
            }
        }
    }
    /**
     * Collect all styles by its respective element name form the specified element instance.
     * @param styles Styles map.
     * @param element Element instance.
     */
    static collectStylesByElement(styles, element) {
        const entries = this.stylesByTagName[element.tagName] || [];
        for (const entry of entries) {
            if (entry && entry.target) {
                if (entry.source) {
                    if (styles[entry.target] === void 0 && element.hasAttribute(entry.source)) {
                        styles[entry.target] = element.getAttribute(entry.source);
                    }
                }
                else {
                    styles[entry.target] = true;
                }
            }
        }
    }
};
/**
 * Map of styles by tag name.
 */
Helper.stylesByTagName = {
    B: [{ target: 'bold' }],
    STRONG: [{ target: 'bold' }],
    I: [{ target: 'italic' }],
    EM: [{ target: 'italic' }],
    U: [{ target: 'underline' }],
    INS: [{ target: 'underline' }],
    S: [{ target: 'strikeThrough' }],
    STRIKE: [{ target: 'strikeThrough' }],
    DEL: [{ target: 'strikeThrough' }],
    UL: [{ target: 'unorderedList' }],
    OL: [{ target: 'orderedList' }],
    P: [{ target: 'paragraph' }],
    H1: [{ target: 'heading1' }],
    H2: [{ target: 'heading2' }],
    H3: [{ target: 'heading3' }],
    H4: [{ target: 'heading4' }],
    H5: [{ target: 'heading5' }],
    H6: [{ target: 'heading6' }],
    FONT: [{ target: 'faceName', source: 'face' }, { target: 'fontSize', source: 'size' }, { target: 'fontColor', source: 'color' }]
};
/**
 * Map of styles by CSS declaration.
 */
Helper.stylesByCSSDeclaration = {
    lineHeight: { target: 'lineHeight' },
    fontSize: { target: 'fontSize' },
    fontFamily: { target: 'fontName' },
    color: { target: 'fontColor' },
    textAlign: {
        mapping: {
            left: 'alignLeft',
            center: 'alignCenter',
            right: 'alignRight',
            justify: 'alignJustify'
        }
    }
};
/**
 * Set of elements without children.
 */
Helper.emptyElements = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
]);
__decorate([
    Class.Private()
], Helper, "stylesByTagName", void 0);
__decorate([
    Class.Private()
], Helper, "stylesByCSSDeclaration", void 0);
__decorate([
    Class.Private()
], Helper, "emptyElements", void 0);
__decorate([
    Class.Private()
], Helper, "buildHTMLAttributes", null);
__decorate([
    Class.Public()
], Helper, "buildHTMLNodes", null);
__decorate([
    Class.Public()
], Helper, "collectStylesByCSS", null);
__decorate([
    Class.Public()
], Helper, "collectStylesByElement", null);
Helper = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;

}},
"@module/index":{pack:false, invoke:function(exports, require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var component_1 = require("./component");
exports.Component = component_1.Component;
var settings_1 = require("./settings");
exports.Settings = settings_1.Settings;
var element_1 = require("./element");
exports.Element = element_1.Element;

}},
"@module":{pack:true, invoke:function(exports, require){
Object.assign(exports, require('index'));
}},
"@module/settings":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Editor global settings.
 */
let Settings = class Settings extends Class.Null {
};
/**
 * Default styles.
 */
Settings.defaultStyles = {
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
    orderedList: false,
    paragraph: false,
    heading1: false,
    heading2: false,
    heading3: false,
    heading4: false,
    heading5: false,
    heading6: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
    fontName: void 0,
    fontSize: void 0,
    fontColor: void 0,
    lineHeight: void 0,
    zoom: 1.0
};
/**
 * List of denied tags in the editor.
 */
Settings.defaultDeniedTags = [
    'html',
    'head',
    'meta',
    'base',
    'basefont',
    'title',
    'body',
    'frame',
    'frameset',
    'noframes',
    'iframe',
    'script',
    'noscript',
    'applet',
    'embed',
    'object',
    'param',
    'form',
    'fieldset',
    'legend',
    'label',
    'select',
    'optgroup',
    'option',
    'textarea',
    'input',
    'output',
    'button',
    'datalist'
];
__decorate([
    Class.Public()
], Settings, "defaultStyles", void 0);
__decorate([
    Class.Public()
], Settings, "defaultDeniedTags", void 0);
Settings = __decorate([
    Class.Describe()
], Settings);
exports.Settings = Settings;

}},
"@module/stylesheet":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const OSS = require("@singleware/oss");
/**
 * Editor stylesheet class.
 */
let Stylesheet = class Stylesheet extends OSS.Stylesheet {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        /**
         * Editor styles.
         */
        this.element = this.select(':host>.editor');
        /**
         * Horizontal editor styles.
         */
        this.horizontal = this.select(':host([orientation="row"])>.editor');
        /**
         * Vertical editor styles.
         */
        this.vertical = this.select(':host>.editor', ':host([orientation="column"])>.editor');
        /**
         * Toolbar styles.
         */
        this.toolbar = this.select(':host>.editor>.toolbar');
        /**
         * Horizontal editor, toolbar styles.
         */
        this.horizontalToolbar = this.select(':host>.editor>.toolbar', ':host([orientation="column"])>.editor>.toolbar');
        /**
         * Vertical editor, toolbar styles.
         */
        this.verticalToolbar = this.select(':host([orientation="row"])>.editor>.toolbar');
        /**
         * Content styles.
         */
        this.content = this.select(':host>.editor>.content', ':host>.editor>.content::slotted(*)');
        /**
         * Slotted content styles.
         */
        this.slottedContent = this.select(':host>.editor>.content::slotted(*)');
        /**
         * Content selection.
         */
        this.selection = this.select('swe-editor>*[slot="content"] mark[data-swe-editor-selection]');
        this.element.display = 'flex';
        this.element.height = 'inherit';
        this.element.width = 'inherit';
        this.horizontal.flexDirection = 'row';
        this.vertical.flexDirection = 'column';
        this.toolbar.display = 'flex';
        this.toolbar.flexGrow = 0;
        this.toolbar.flexShrink = 0;
        this.horizontalToolbar.flexDirection = 'row';
        this.horizontalToolbar.width = 'inherit';
        this.verticalToolbar.flexDirection = 'column';
        this.verticalToolbar.height = 'inherit';
        this.content.width = 'inherit';
        this.content.height = 'inherit';
        this.content.zoom = '1';
        this.slottedContent.display = 'block';
        this.slottedContent.position = 'relative';
        this.slottedContent.overflow = 'auto';
        this.selection.display = 'inline';
        this.selection.backgroundColor = 'rgb(236,240,241)';
    }
};
__decorate([
    Class.Private()
], Stylesheet.prototype, "element", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "horizontal", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "vertical", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "toolbar", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "horizontalToolbar", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "verticalToolbar", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "content", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "slottedContent", void 0);
__decorate([
    Class.Private()
], Stylesheet.prototype, "selection", void 0);
Stylesheet = __decorate([
    Class.Describe()
], Stylesheet);
exports.Stylesheet = Stylesheet;

}},
"@client/handler":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Frontend = require("@singleware/frontend");
const view_1 = require("./view");
/**
 * Component test, handler class.
 */
let Handler = class Handler extends Class.Null {
    /**
     * Component test route.
     * @param match Matched route.
     */
    async indexAction(match) {
        match.detail.output.content = new view_1.View({});
    }
};
__decorate([
    Frontend.Processor({ path: '/' }),
    Class.Public()
], Handler.prototype, "indexAction", null);
Handler = __decorate([
    Class.Describe()
], Handler);
exports.Handler = Handler;

}},
"@client/main":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Application_1;
Object.defineProperty(exports, "__esModule", { value: true });
"use strict";
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Frontend = require("@singleware/frontend");
const handler_1 = require("./handler");
/**
 * Test application class.
 */
let Application = Application_1 = class Application extends Frontend.Main {
    /**
     * Default constructor.
     */
    constructor() {
        super({ title: Application_1.title });
        /**
         * Service instance.
         */
        this.service = new Frontend.Services.Client({});
        this.addService(this.service);
        this.addHandler(handler_1.Handler);
        this.start();
    }
};
/**
 * Global title settings.
 */
Application.title = {
    text: 'Singleware',
    separator: ' - ',
    prefix: true
};
__decorate([
    Class.Private()
], Application.prototype, "service", void 0);
__decorate([
    Class.Private()
], Application, "title", void 0);
Application = Application_1 = __decorate([
    Class.Describe()
], Application);
// Start application.
new Application();

}},
"@client/view":{pack:false, invoke:function(exports, require){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
const Select = require("@singleware/ui-select");
const Fieldset = require("@singleware/ui-fieldset");
const Form = require("@singleware/ui-form");
const Test = require("@module/index");
/**
 * View class.
 */
let View = class View extends Control.Component {
    /**
     * Default constructor.
     * @param properties Default properties.
     */
    constructor(properties) {
        super(properties);
        /**
         * Font select.
         */
        this.fontSelect = (JSX.create(Select.Component, { class: "select", options: ['Arial', 'Courier New', 'Time New Roman'], onChange: () => this.content.fontNameAction(this.fontSelect.value) },
            JSX.create("button", { slot: "input", class: "button" }, "Default font"),
            JSX.create("div", { slot: "result", class: "result" })));
        /**
         * Bold button.
         */
        this.boldButton = (JSX.create("button", { class: "button", onClick: () => this.content.boldAction() }, "B"));
        /**
         * Italic button.
         */
        this.italicButton = (JSX.create("button", { class: "button", onClick: () => this.content.italicAction() }, "I"));
        /**
         * Underline button.
         */
        this.underlineButton = (JSX.create("button", { class: "button", onClick: () => this.content.underlineAction() }, "U"));
        /**
         * Strike-through button.
         */
        this.strikeThroughButton = (JSX.create("button", { class: "button", onClick: () => this.content.strikeThroughAction() }, "S"));
        /**
         * Ordered list button.
         */
        this.orderedListButton = (JSX.create("button", { class: "button", onClick: () => this.content.orderedListAction() }, "OL"));
        /**
         * Unordered list button.
         */
        this.unorderedListButton = (JSX.create("button", { class: "button", onClick: () => this.content.unorderedListAction() }, "UL"));
        /**
         * Align-left button.
         */
        this.alignLeftButton = (JSX.create("button", { class: "button", onClick: () => this.content.alignLeftAction() }, "Left"));
        /**
         * Align-center button.
         */
        this.alignCenterButton = (JSX.create("button", { class: "button", onClick: () => this.content.alignCenterAction() }, "Center"));
        /**
         * Align-right button.
         */
        this.alignRightButton = (JSX.create("button", { class: "button", onClick: () => this.content.alignRightAction() }, "Right"));
        /**
         * Align-justify button.
         */
        this.alignJustifyButton = (JSX.create("button", { class: "button", onClick: () => this.content.alignJustifyAction() }, "Justify"));
        /**
         * Test content.
         */
        this.content = (JSX.create(Test.Component, { class: "editor", preserveSelection: true },
            JSX.create(Fieldset.Component, { slot: "toolbar", class: "toolbar" },
                this.fontSelect,
                this.boldButton,
                this.italicButton,
                this.underlineButton,
                this.strikeThroughButton,
                this.orderedListButton,
                this.unorderedListButton,
                this.alignLeftButton,
                this.alignCenterButton,
                this.alignRightButton,
                this.alignJustifyButton,
                JSX.create("button", { class: "button", onClick: () => this.content.indentAction() }, "Indent"),
                JSX.create("button", { class: "button", onClick: () => this.content.outdentAction() }, "Outdent")),
            JSX.create("div", { slot: "content", class: "content", onMouseUp: this.onUpdateToolbar.bind(this), onKeyUp: this.onUpdateToolbar.bind(this) })));
        /**
         * Test control.
         */
        this.control = (JSX.create(Form.Component, { onSubmit: this.onSubmit.bind(this) },
            JSX.create(Fieldset.Component, { slot: "header" },
                JSX.create("h2", null, "Controls")),
            JSX.create(Fieldset.Component, { slot: "footer" },
                JSX.create("button", { type: "submit", class: "button" }, "Apply"))));
        /**
         * View element.
         */
        this.skeleton = (JSX.create("div", { class: "experiment" },
            JSX.create("div", { class: "content" }, this.content),
            JSX.create("div", { class: "control" }, this.control)));
    }
    /**
     * Update toolbar, event handler.
     */
    onUpdateToolbar() {
        const styles = this.content.selectedStyles;
        this.fontSelect.value = styles.fontName;
        this.boldButton.classList.toggle('pushed', styles.bold);
        this.italicButton.classList.toggle('pushed', styles.italic);
        this.underlineButton.classList.toggle('pushed', styles.underline);
        this.strikeThroughButton.classList.toggle('pushed', styles.strikeThrough);
        this.orderedListButton.classList.toggle('pushed', styles.orderedList);
        this.alignLeftButton.classList.toggle('pushed', styles.alignLeft);
        this.alignCenterButton.classList.toggle('pushed', styles.alignCenter);
        this.alignRightButton.classList.toggle('pushed', styles.alignRight);
        this.alignJustifyButton.classList.toggle('pushed', styles.alignJustify);
    }
    /**
     * Submit event handler.
     */
    onSubmit() {
        const options = this.control.value;
    }
    /**
     * View element.
     */
    get element() {
        return this.skeleton;
    }
};
__decorate([
    Class.Private()
], View.prototype, "fontSelect", void 0);
__decorate([
    Class.Private()
], View.prototype, "boldButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "italicButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "underlineButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "strikeThroughButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "orderedListButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "unorderedListButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "alignLeftButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "alignCenterButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "alignRightButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "alignJustifyButton", void 0);
__decorate([
    Class.Private()
], View.prototype, "content", void 0);
__decorate([
    Class.Private()
], View.prototype, "control", void 0);
__decorate([
    Class.Private()
], View.prototype, "skeleton", void 0);
__decorate([
    Class.Private()
], View.prototype, "onUpdateToolbar", null);
__decorate([
    Class.Private()
], View.prototype, "onSubmit", null);
__decorate([
    Class.Public()
], View.prototype, "element", null);
View = __decorate([
    Class.Describe()
], View);
exports.View = View;

}}};

  /**
   * Determines whether the specified path is relative or not.
   * @param path Path.
   * @returns Returns the base path.
   */
  function relative(path) {
    return path[0] !== '/' && path[0] !== '@';
  }

  /**
   * Gets the directory name of the specified path.
   * @param path Path of extraction.
   * @returns Returns the directory name.
   */
  function dirname(path) {
    const output = normalize(path).split('/');
    return output.splice(0, output.length - 1).join('/');
  }

  /**
   * Gets the normalized path from the specified path.
   * @param path Path to be normalized.
   * @return Returns the normalized path.
   */
  function normalize(path) {
    const input = path.split('/');
    const output = [];
    for (let i = 0; i < input.length; ++i) {
      const directory = input[i];
      if (i === 0 || (directory.length && directory !== '.')) {
        if (directory === '..') {
          output.pop();
        } else {
          output.push(directory);
        }
      }
    }
    return output.join('/');
  }

  /**
   * Loads the module that corresponds to the specified location.
   * @param location Module location.
   * @returns Returns all exported members.
   */
  function loadModule(location) {
    const module = repository[location];
    const current = Loader.baseDirectory;
    const exports = {};
    let caught;
    try {
      Loader.baseDirectory = module.pack ? location : dirname(location);
      loading.push(location);
      module.invoke(exports, require);
    } catch (exception) {
      caught = exception;
    } finally {
      Loader.baseDirectory = current;
      loading.pop();
      if (caught) {
        throw caught;
      }
      return exports;
    }
  }

  /**
   * Requires the module that corresponds to the specified path.
   * @param path Module path.
   * @returns Returns all exported members.
   * @throws Throws an error when the specified module does not exists.
   */
  function require(path) {
    const location = normalize(relative(path) ? `${Loader.baseDirectory}/${path}` : path);
    if (!cache[location]) {
      const current = loading[loading.length - 1] || '.';
      if (!repository[location]) {
        throw new Error(`Module "${path}" loaded by "${current}" does not found.`);
      }
      if (loading.includes(location)) {
        throw new Error(`Module "${current}" with circular reference to module "${path}"`);
      }
      cache[location] = loadModule(location);
    }
    return cache[location];
  }

  /**
   * Global base directory.
   */
  Loader.baseDirectory = '.';

  // Setups the require method.
  if (!window.require) {
    window.require = require;
  }
})(Loader || (Loader = {}));
