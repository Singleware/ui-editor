"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Element_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const JSX = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
const stylesheet_1 = require("./stylesheet");
/**
 * Editor element.
 */
let Element = Element_1 = class Element extends Control.Element {
    /**
     * Default constructor.
     */
    constructor() {
        super();
        /**
         * List of denied tags in the editor.
         */
        this.deniedTagList = [
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
        /**
         * Cached HTML content.
         */
        this.cachedHTML = '';
        /**
         * Content observer.
         */
        this.observer = new MutationObserver(this.mutationHandler.bind(this));
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
        this.observer.observe(Class.resolve(this), { childList: true, subtree: true });
        this.contentSlot.addEventListener('focus', this.contentFocusHandler.bind(this), true);
        this.contentSlot.addEventListener('keyup', this.contentChangeHandler.bind(this), true);
    }
    /**
     * Collect all styles by its respective CSS declaration.
     * @param styles Styles map.
     * @param declarations CSS declarations.
     */
    static collectStylesByCSS(styles, declarations) {
        let style, property;
        for (const entry in this.stylesByCSSDeclaration) {
            if ((style = this.stylesByCSSDeclaration[entry])) {
                if (style.target) {
                    if (styles[style.target] === void 0) {
                        styles[style.target] = declarations[entry];
                    }
                }
                else if (style.mapping) {
                    if ((property = style.mapping[declarations[entry]])) {
                        styles[property] = true;
                    }
                }
            }
        }
    }
    /**
     * Collect all styles by its respective element name.
     * @param styles Styles map.
     * @param element HTML element.
     */
    static collectStylesByElement(styles, element) {
        const entries = this.stylesByElementName[element.tagName.toLowerCase()] || [];
        for (const entry of entries) {
            if (entry && entry.target) {
                if (entry.source) {
                    if (styles[entry.target] === void 0 && element.hasAttribute(entry.source)) {
                        styles[entry.target] = element.getAttribute(entry.source);
                    }
                }
                else {
                    styles[entry.target] = true;
                }
            }
        }
    }
    /**
     * Update all validation attributes.
     */
    updateValidation() {
        this.updatePropertyState('empty', this.empty);
        this.updatePropertyState('invalid', !this.empty && !this.checkValidity());
    }
    /**
     * Unwraps the specified element.
     * @param element Element instance.
     */
    unwrapElement(element) {
        const parent = element.parentNode;
        while (parent && element.firstChild) {
            parent.insertBefore(element.firstChild, element);
        }
        element.remove();
    }
    /**
     * Cleans the specified element.
     * @param element Element instance.
     * @param tag Child tag name to be cleaned.
     * @param properties CSS properties to be cleaned.
     */
    cleanElement(element, tag, ...properties) {
        for (const child of element.children) {
            this.cleanElement(child, tag, ...properties);
            if (child.tagName.toLowerCase() === tag) {
                for (const property of properties) {
                    child.style[property] = '';
                }
                const styles = child.getAttribute('style');
                if (styles === null || styles.length === 0) {
                    this.unwrapElement(child);
                }
            }
        }
    }
    /**
     * Performs a surrounding in the current selection with the specified tag.
     * @param tag Tag name.
     * @returns Returns the affected element instance.
     * @throws Throws an error when there is no current selection.
     */
    performSurrounding(tag) {
        this.focus();
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            throw new Error(`There is no current selection.`);
        }
        const range = selection.getRangeAt(0);
        const ancestor = range.commonAncestorContainer.parentElement;
        if (ancestor.firstChild !== ancestor.lastChild || ancestor.tagName.toLowerCase() !== tag) {
            const element = JSX.create(tag, {});
            range.surroundContents(element);
            return element;
        }
        return ancestor;
    }
    /**
     * Performs the specified command with the given value.
     * @param name Command name.
     * @param value Command value.
     * @returns Returns the affected element instance.
     */
    performCommand(name, value) {
        this.focus();
        const selection = window.getSelection();
        document.execCommand(name, false, value);
        return selection.focusNode.parentElement;
    }
    /**
     * Filters the specified list to remove any denied node.
     * @param list List of nodes or elements.
     * @returns Returns the number of removed nodes.
     */
    removeDeniedNodes(list) {
        let total = 0;
        for (const item of list) {
            if (item instanceof HTMLElement) {
                if (this.deniedTags.includes(item.tagName)) {
                    item.remove();
                    total++;
                }
                else {
                    total += this.removeDeniedNodes(item.children);
                }
            }
        }
        return total;
    }
    /**
     * Mutation handler.
     * @param records Mutation record list.
     */
    mutationHandler(records) {
        const content = this.getRequiredChildElement(this.contentSlot);
        let changed = false;
        for (const record of records) {
            if (record.target === content || (record.target instanceof HTMLElement && JSX.childOf(content, record.target))) {
                if (this.removeDeniedNodes(record.addedNodes) > 0) {
                    changed = true;
                }
            }
        }
        if (changed) {
            this.cachedHTML = content.innerHTML;
            this.updateValidation();
        }
    }
    /**
     * Content focus handler.
     */
    contentFocusHandler() {
        const content = this.getRequiredChildElement(this.contentSlot);
        if (content.childNodes.length === 0 && this.paragraphTag !== 'br') {
            const selection = window.getSelection();
            const range = document.createRange();
            JSX.append(content, JSX.create(this.paragraphTag, {}, JSX.create('br', {})));
            range.setStart(content.firstChild, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    /**
     * Content change handler.
     */
    contentChangeHandler() {
        const content = this.getRequiredChildElement(this.contentSlot);
        content.normalize();
        if (this.cachedHTML !== content.innerHTML) {
            const event = new Event('change', { bubbles: true, cancelable: true });
            if (this.dispatchEvent(event)) {
                this.cachedHTML = content.innerHTML;
            }
            else {
                content.innerHTML = this.cachedHTML;
            }
        }
    }
    /**
     * Updates the current selection into the new input slot element.
     */
    contentSlotChangeHandler() {
        const content = this.getRequiredChildElement(this.contentSlot);
        content.contentEditable = (!this.readOnly && !this.disabled).toString();
        this.cachedHTML = content.innerHTML;
        this.updateValidation();
    }
    /**
     * Determines whether the element is empty or not.
     */
    get empty() {
        return this.cachedHTML.length === 0;
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
        return this.cachedHTML;
    }
    /**
     * Sets the element value.
     */
    set value(value) {
        const content = this.getRequiredChildElement(this.contentSlot);
        content.innerHTML = this.cachedHTML = value || '';
        this.updateValidation();
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
        const content = this.getRequiredChildElement(this.contentSlot);
        content.contentEditable = (!(state || this.disabled)).toString();
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
        const content = this.getRequiredChildElement(this.contentSlot);
        content.contentEditable = (!(state || this.readOnly)).toString();
    }
    /**
     * Gets the paragraph tag.
     */
    get paragraphTag() {
        return document.queryCommandValue('defaultParagraphSeparator');
    }
    /**
     * Sets the paragraph tag.
     */
    set paragraphTag(tag) {
        document.execCommand('defaultParagraphSeparator', false, tag.toLowerCase());
    }
    /**
     * Gets the denied tag list.
     */
    get deniedTags() {
        return this.deniedTagList;
    }
    /**
     * Set HTML denied tags.
     */
    set deniedTags(tags) {
        const content = this.getRequiredChildElement(this.contentSlot);
        this.deniedTagList = tags.map((tag) => tag.toLowerCase());
        if (this.removeDeniedNodes(content.children) > 0) {
            this.cachedHTML = content.innerHTML;
            this.updateValidation();
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
     * Formats the specified font name for the selection or at the insertion point.
     * @param name Font name.
     */
    fontNameAction(name) {
        const element = this.performSurrounding('font');
        this.cleanElement(element, 'font', 'fontFamily');
        element.style.fontFamily = name;
    }
    /**
     * Formats the specified font size for the selection or at the insertion point.
     * @param size Font size.
     */
    fontSizeAction(size) {
        const element = this.performSurrounding('font');
        this.cleanElement(element, 'font', 'fontSize');
        element.style.fontSize = size;
    }
    /**
     * Formats the specified font color for the selection or at the insertion point.
     * @param color Font color.
     */
    fontColorAction(color) {
        const element = this.performSurrounding('font');
        this.cleanElement(element, 'font', 'color');
        element.style.color = color;
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
     * Gets the active styles from the specified node.
     * @param node Element node.
     * @param map Predefined styles map.
     * @returns Returns the active styles map.
     */
    getStyles(node, map) {
        const content = this.getRequiredChildElement(this.contentSlot);
        const styles = map || { ...Element_1.defaultStyles };
        while (node && node !== content) {
            if (node instanceof HTMLElement) {
                Element_1.collectStylesByElement(styles, node);
                Element_1.collectStylesByCSS(styles, window.getComputedStyle(node));
            }
            node = node.parentElement;
        }
        return styles;
    }
    /**
     * Gets the active styles map from the focused node.
     * @returns Returns the active styles map.
     */
    getCurrentStyles() {
        const selection = window.getSelection();
        const styles = { ...Element_1.defaultStyles };
        if (selection.rangeCount) {
            this.getStyles(selection.focusNode, styles);
        }
        return styles;
    }
    /**
     * Move the focus to this element.
     */
    focus() {
        this.callRequiredChildMethod(this.contentSlot, 'focus', []);
    }
    /**
     * Reset the element value to its initial value.
     */
    reset() {
        const content = this.getRequiredChildElement(this.contentSlot);
        content.innerHTML = this.cachedHTML = this.defaultValue || '';
        this.updateValidation();
    }
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity() {
        return !this.required || (this.value !== void 0 && this.value.length !== 0);
    }
};
/**
 * Default styles.
 */
Element.defaultStyles = {
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
    fontColor: void 0
};
/**
 * Map of style keys by element name.
 */
Element.stylesByElementName = {
    b: [{ target: 'bold' }],
    strong: [{ target: 'bold' }],
    i: [{ target: 'italic' }],
    em: [{ target: 'italic' }],
    u: [{ target: 'underline' }],
    ins: [{ target: 'underline' }],
    s: [{ target: 'strikeThrough' }],
    strike: [{ target: 'strikeThrough' }],
    del: [{ target: 'strikeThrough' }],
    ul: [{ target: 'unorderedList' }],
    ol: [{ target: 'orderedList' }],
    p: [{ target: 'paragraph' }],
    h1: [{ target: 'heading1' }],
    h2: [{ target: 'heading2' }],
    h3: [{ target: 'heading3' }],
    h4: [{ target: 'heading4' }],
    h5: [{ target: 'heading5' }],
    h6: [{ target: 'heading6' }],
    font: [
        {
            target: 'faceName',
            source: 'face'
        },
        {
            target: 'fontSize',
            source: 'size'
        },
        {
            target: 'fontColor',
            source: 'color'
        }
    ]
};
/**
 * Map of styles by CSS declaration.
 */
Element.stylesByCSSDeclaration = {
    textAlign: {
        mapping: {
            left: 'alignLeft',
            center: 'alignCenter',
            right: 'alignRight',
            justify: 'alignJustify'
        }
    },
    fontSize: {
        target: 'fontSize'
    },
    fontFamily: {
        target: 'fontName'
    },
    color: {
        target: 'fontColor'
    }
};
__decorate([
    Class.Private()
], Element.prototype, "deniedTagList", void 0);
__decorate([
    Class.Private()
], Element.prototype, "cachedHTML", void 0);
__decorate([
    Class.Private()
], Element.prototype, "observer", void 0);
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
], Element.prototype, "unwrapElement", null);
__decorate([
    Class.Private()
], Element.prototype, "cleanElement", null);
__decorate([
    Class.Private()
], Element.prototype, "performSurrounding", null);
__decorate([
    Class.Private()
], Element.prototype, "performCommand", null);
__decorate([
    Class.Private()
], Element.prototype, "removeDeniedNodes", null);
__decorate([
    Class.Private()
], Element.prototype, "mutationHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "contentFocusHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "contentChangeHandler", null);
__decorate([
    Class.Private()
], Element.prototype, "contentSlotChangeHandler", null);
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
], Element.prototype, "paragraphTag", null);
__decorate([
    Class.Public()
], Element.prototype, "deniedTags", null);
__decorate([
    Class.Public()
], Element.prototype, "orientation", null);
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
], Element.prototype, "getStyles", null);
__decorate([
    Class.Public()
], Element.prototype, "getCurrentStyles", null);
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
    Class.Private()
], Element, "defaultStyles", void 0);
__decorate([
    Class.Private()
], Element, "stylesByElementName", void 0);
__decorate([
    Class.Private()
], Element, "stylesByCSSDeclaration", void 0);
__decorate([
    Class.Private()
], Element, "collectStylesByCSS", null);
__decorate([
    Class.Private()
], Element, "collectStylesByElement", null);
Element = Element_1 = __decorate([
    JSX.Describe('swe-editor'),
    Class.Describe()
], Element);
exports.Element = Element;
