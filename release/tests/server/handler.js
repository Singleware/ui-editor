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
const Backend = require("@singleware/backend");
/**
 * Default handler class.
 */
let Handler = class Handler extends Backend.Handlers.File.Default {
    /**
     * Exception response processor.
     * @param match Matched route.
     */
    async exceptionResponse(match) {
        await super.exceptionResponse(match);
    }
    /**
     * Default response processor.
     * @param match Matched route.
     */
    async defaultResponse(match) {
        await super.defaultResponse(match);
    }
};
__decorate([
    Backend.Processor({ path: '#', exact: false, environment: { methods: '*' } }),
    Class.Public()
], Handler.prototype, "exceptionResponse", null);
__decorate([
    Backend.Processor({ path: '/', exact: false, environment: { methods: '*' } }),
    Class.Public()
], Handler.prototype, "defaultResponse", null);
Handler = __decorate([
    Class.Describe()
], Handler);
exports.Handler = Handler;
