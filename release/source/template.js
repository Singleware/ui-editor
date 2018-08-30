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
 * Editor template class.
 */
let Template = Template_1 = class Template extends Control.Component {
    /**
     * Default constructor.
     * @param properties Form properties.
     * @param children Form children.
     */
    constructor(properties, children) {
        super(properties, children);
        /**
         * Editor states.
         */
        this.states = {
            name: '',
            required: false,
            readOnly: false,
            disabled: false
        };
        /**
         * Toolbar element.
         */
        this.toolbarSlot = DOM.create("slot", { name: "toolbar", class: "toolbar" });
        /**
         * Content element.
         */
        this.contentSlot = DOM.create("slot", { name: "content", class: "content" });
        /**
         * Wrapper element.
         */
        this.wrapper = (DOM.create("div", { class: "wrapper" },
            this.toolbarSlot,
            this.contentSlot));
        /**
         * Editor styles.
         */
        this.styles = (DOM.create("style", null, `:host > .wrapper {
  display: flex;
  width: inherit;
  height: inherit;
}
:host > .wrapper[data-orientation='row'] {
  flex-direction: row;
}
:host > .wrapper,
:host > .wrapper[data-orientation='column'] {
  flex-direction: column;
}
:host > .wrapper > .toolbar {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  width: inherit;
}
:host > .wrapper[data-orientation='row'] > .toolbar {
  flex-direction: row;
}
:host > .wrapper > .toolbar
:host > .wrapper[data-orientation='column'] > .toolbar {
  flex-direction: column;
}
:host > .wrapper > .content,
:host > .wrapper > .content::slotted(*) {
  width: inherit;
  height: inherit;
}
:host > .wrapper > .content {
  display: block;
  overflow: auto;
}`));
        /**
         * Editor skeleton.
         */
        this.skeleton = (DOM.create("div", { slot: this.properties.slot, class: this.properties.class }, this.children));
        /**
         * Editor elements.
         */
        this.elements = DOM.append(this.skeleton.attachShadow({ mode: 'closed' }), this.styles, this.wrapper);
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
            name: super.bindDescriptor(this, Template_1.prototype, 'name'),
            value: super.bindDescriptor(this, Template_1.prototype, 'value'),
            required: super.bindDescriptor(this, Template_1.prototype, 'required'),
            readOnly: super.bindDescriptor(this, Template_1.prototype, 'readOnly'),
            disabled: super.bindDescriptor(this, Template_1.prototype, 'disabled'),
            orientation: super.bindDescriptor(this, Template_1.prototype, 'orientation')
        });
    }
    /**
     * Assign all elements properties.
     */
    assignProperties() {
        Control.assignProperties(this, this.properties, ['name', 'value', 'required', 'disabled']);
        this.orientation = this.properties.orientation || 'column';
        this.readOnly = this.properties.readOnly || false;
    }
    /**
     * Get HTML value.
     */
    get value() {
        return this.contentSlot.innerHTML;
    }
    /**
     * Set HTML value.
     */
    set value(value) {
        this.contentSlot.innerHTML = value;
    }
    /**
     * Get editor name.
     */
    get name() {
        return this.states.name;
    }
    /**
     * Set editor name.
     */
    set name(name) {
        this.states.name = name;
    }
    /**
     * Get required state.
     */
    get required() {
        return this.states.required;
    }
    /**
     * Set required state.
     */
    set required(state) {
        this.states.required = state;
    }
    /**
     * Get read-only state.
     */
    get readOnly() {
        return this.states.readOnly;
    }
    /**
     * Set read-only state.
     */
    set readOnly(state) {
        this.states.readOnly = state;
        Control.setChildrenProperty(this.contentSlot, 'contentEditable', !(state || this.disabled));
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
        this.states.disabled = state;
        Control.setChildrenProperty(this.contentSlot, 'contentEditable', !(state || this.readOnly));
        Control.setChildrenProperty(this.toolbarSlot, 'disabled', state);
    }
    /**
     * Get orientation mode.
     */
    get orientation() {
        return this.wrapper.dataset.orientation || 'row';
    }
    /**
     * Set orientation mode.
     */
    set orientation(mode) {
        this.wrapper.dataset.orientation = mode;
    }
    /**
     * Editor element.
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
], Template.prototype, "toolbarSlot", void 0);
__decorate([
    Class.Private()
], Template.prototype, "contentSlot", void 0);
__decorate([
    Class.Private()
], Template.prototype, "wrapper", void 0);
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
], Template.prototype, "value", null);
__decorate([
    Class.Public()
], Template.prototype, "name", null);
__decorate([
    Class.Public()
], Template.prototype, "required", null);
__decorate([
    Class.Public()
], Template.prototype, "readOnly", null);
__decorate([
    Class.Public()
], Template.prototype, "disabled", null);
__decorate([
    Class.Public()
], Template.prototype, "orientation", null);
__decorate([
    Class.Public()
], Template.prototype, "element", null);
Template = Template_1 = __decorate([
    Class.Describe()
], Template);
exports.Template = Template;
