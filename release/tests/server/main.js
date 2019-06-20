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
const Backend = require("@singleware/backend");
const handler_1 = require("./handler");
/**
 * Test application class.
 */
let Application = Application_1 = class Application extends Backend.Main {
    /**
     * Default constructor.
     */
    constructor() {
        super({});
        /**
         * Logger instance.
         */
        this.logger = new Backend.Loggers.Console();
        /**
         * Service instance.
         */
        this.service = new Backend.Services.Server({
            port: 8080,
            debug: true
        });
        this.addLogger(this.logger);
        this.addService(this.service);
        this.addHandler(handler_1.Handler, Application_1.settings);
        this.start();
    }
};
/**
 * Global settings for the handler.
 */
Application.settings = {
    strictType: true,
    baseDirectory: './tests/public/',
    indexFile: `index.html`,
    types: {
        html: 'text/html',
        css: 'text/css',
        js: 'application/javascript',
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'text/html+svg',
        woff: 'application/font-woff',
        woff2: 'font/woff2',
        eot: 'application/vnd.ms-fontobject',
        ttf: 'application/font-sfnt'
    }
};
__decorate([
    Class.Private()
], Application.prototype, "logger", void 0);
__decorate([
    Class.Private()
], Application.prototype, "service", void 0);
__decorate([
    Class.Private()
], Application, "settings", void 0);
Application = Application_1 = __decorate([
    Class.Describe()
], Application);
// Start application.
new Application();
