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
