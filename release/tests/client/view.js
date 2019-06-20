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
