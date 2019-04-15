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
