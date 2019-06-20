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
     * Remove all given CSS properties from the specified list of nodes, when the node becomes without CSS itself will be removed.
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
        const selection = globalThis.getSelection();
        const styles = { ...settings_1.Settings.defaultStyles };
        if (selection.focusNode) {
            const content = this.getRequiredChildElement(this.contentSlot);
            let current = selection.focusNode;
            styles.zoom = parseFloat(this.contentSlot.style.zoom || '1.0');
            while (current && current !== content) {
                if (current instanceof HTMLElement) {
                    helper_1.Helper.collectStylesByElement(styles, current);
                    helper_1.Helper.collectStylesByCSS(styles, globalThis.getComputedStyle(current));
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
