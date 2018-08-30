"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Template_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const DOM = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
/**
 * Editor action template class.
 */
let Template = Template_1 = class Template extends Control.Component {
    /**
     * Default constructor.
     * @param properties Action properties.
     * @param children Action children.
     */
    constructor(properties, children) {
        super(properties, children);
        /**
         * Action states.
         */
        this.states = {
            disabled: false
        };
        /**
         * Action element.
         */
        this.actionSlot = DOM.create("slot", { name: "action", class: "action" });
        /**
         * Action styles.
         */
        this.styles = (DOM.create("style", null, `:host {
  display: block;
}`));
        /**
         * Action skeleton.
         */
        this.skeleton = (DOM.create("div", { slot: this.properties.slot, class: this.properties.class }, this.children));
        /**
         * Action elements.
         */
        this.elements = DOM.append(this.skeleton.attachShadow({ mode: 'closed' }), this.styles, this.actionSlot);
        this.bindHandlers();
        this.bindProperties();
        this.assignProperties();
    }
    /**
     * Bind event handlers to update the custom element.
     */
    bindHandlers() { }
    /**
     * Bind exposed properties to the custom element.
     */
    bindProperties() {
        Object.defineProperties(this.skeleton, {
            disabled: super.bindDescriptor(this, Template_1.prototype, 'disabled')
        });
    }
    /**
     * Assign all element properties.
     */
    assignProperties() {
        Control.assignProperties(this, this.properties, ['disabled']);
    }
    /**
     * Get disabled state.
     */
    get disabled() {
        return this.states.disabled;
    }
    /**
     * Set disabled state.
     */
    set disabled(state) {
        Control.setChildrenProperty(this.actionSlot, 'disabled', (this.states.disabled = state));
    }
    /**
     * Action element.
     */
    get element() {
        return this.skeleton;
    }
};
__decorate([
    Class.Private()
], Template.prototype, "states", void 0);
__decorate([
    Class.Private()
], Template.prototype, "actionSlot", void 0);
__decorate([
    Class.Private()
], Template.prototype, "styles", void 0);
__decorate([
    Class.Private()
], Template.prototype, "skeleton", void 0);
__decorate([
    Class.Private()
], Template.prototype, "elements", void 0);
__decorate([
    Class.Private()
], Template.prototype, "bindHandlers", null);
__decorate([
    Class.Private()
], Template.prototype, "bindProperties", null);
__decorate([
    Class.Private()
], Template.prototype, "assignProperties", null);
__decorate([
    Class.Public()
], Template.prototype, "disabled", null);
__decorate([
    Class.Public()
], Template.prototype, "element", null);
Template = Template_1 = __decorate([
    Class.Describe()
], Template);
exports.Template = Template;
