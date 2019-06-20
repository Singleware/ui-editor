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
