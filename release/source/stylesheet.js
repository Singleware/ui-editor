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
