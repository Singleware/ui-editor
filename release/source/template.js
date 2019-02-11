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
     * @param properties Editor properties.
     * @param children Editor children.
     */
    constructor(properties, children) {
        super(properties, children);
        /**
         * Editor states.
         */
        this.states = {
            name: '',
            value: '',
            required: false,
            disabled: false,
            deniedTags: [
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
            ]
        };
        /**
         * Mutation observer.
         */
        this.elementObserver = new MutationObserver(this.mutationHandler.bind(this));
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
:host([data-orientation='row']) > .wrapper {
  flex-direction: row;
}
:host > .wrapper,
:host([data-orientation='column']) > .wrapper {
  flex-direction: column;
}
:host > .wrapper > .toolbar {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  width: inherit;
}
:host([data-orientation='row']) > .wrapper > .toolbar {
  flex-direction: row;
}
:host > .wrapper > .toolbar
:host([data-orientation='column']) > .wrapper > .toolbar {
  flex-direction: column;
}
:host > .wrapper > .content,
:host > .wrapper > .content::slotted(*) {
  width: inherit;
  height: inherit;
}
:host > .wrapper > .content::slotted(*) {
  display: block;
  position: relative;
  overflow: auto;
}`));
        /**
         * Editor skeleton.
         */
        this.skeleton = (DOM.create("div", { slot: this.properties.slot, class: this.properties.class }, this.children));
        DOM.append(this.skeleton.attachShadow({ mode: 'closed' }), this.styles, this.wrapper);
        this.bindHandlers();
        this.bindProperties();
        this.assignProperties();
    }
    /**
     * Collect all styles by its respective CSS declaration.
     * @param styles Styles map.
     * @param declarations CSS declarations.
     */
    static collectStylesByCSS(styles, declarations) {
        for (const entry in this.stylesByCSSDeclaration) {
            const value = declarations[entry];
            const style = this.stylesByCSSDeclaration[entry];
            if (style) {
                if (style.targets) {
                    const property = style.targets[value];
                    if (property) {
                        styles[property] = value;
                    }
                }
                else if (style.target) {
                    styles[style.target] = value;
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
        const entries = this.stylesByElementName[element.tagName.toLowerCase()];
        if (entries) {
            for (const entry of entries) {
                const style = entries[entry];
                if (style && style.target) {
                    if (style.source) {
                        styles[style.target] = element.getAttribute(style.source);
                    }
                    else {
                        styles[style.target] = true;
                    }
                }
            }
        }
    }
    /**
     * Performs the specified command with the given value.
     * @param commandId Command to be performed
     * @param value Command value.
     */
    performAction(commandId, value) {
        this.getContentElement().focus();
        document.execCommand(commandId, false, value);
    }
    /**
     * Performs the specified command with the given value using CSS styles.
     * @param commandId Command to be performed
     * @param value Command value.
     */
    performActionWithCSS(commandId, value) {
        const status = document.queryCommandState('styleWithCSS');
        document.execCommand('styleWithCSS', false, true);
        this.performAction(commandId, value);
        document.execCommand('styleWithCSS', false, status);
    }
    /**
     * Gets the content element.
     */
    getContentElement() {
        const content = Control.getChildByProperty(this.contentSlot, 'contentEditable');
        if (!content) {
            throw new Error(`There is no content element assigned.`);
        }
        return content;
    }
    /**
     * Filters the specified node list to remove any denied node.
     * @param nodes Node list.
     */
    removeDeniedNodes(nodes) {
        for (const node of nodes) {
            if (node instanceof HTMLElement && this.deniedTags.includes(node.tagName)) {
                node.remove();
            }
        }
    }
    /**
     * Mutation handler.
     * @param records Mutation record list.
     */
    mutationHandler(records) {
        const content = this.getContentElement();
        for (const record of records) {
            if (record.target === content || (record.target instanceof HTMLElement && DOM.childOf(content, record.target))) {
                this.removeDeniedNodes(record.addedNodes);
            }
        }
    }
    /**
     * Content focus handler.
     */
    focusHandler() {
        const content = this.getContentElement();
        if (content.childNodes.length === 0 && this.paragraphTag !== 'br') {
            const range = document.createRange();
            const selection = window.getSelection();
            DOM.append(content, DOM.create(this.paragraphTag, {}, DOM.create('br', {})));
            range.setStart(content.firstChild, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    /**
     * Content change handler.
     */
    changeHandler() {
        const content = this.getContentElement();
        content.normalize();
        if (this.states.value !== content.innerHTML) {
            this.states.value = content.innerHTML;
            this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
        }
    }
    /**
     * Bind event handlers to update the custom element.
     */
    bindHandlers() {
        this.elementObserver.observe(this.skeleton, { childList: true, subtree: true });
        this.skeleton.addEventListener('focus', this.focusHandler.bind(this), true);
        this.skeleton.addEventListener('keyup', this.changeHandler.bind(this), true);
    }
    /**
     * Bind exposed properties to the custom element.
     */
    bindProperties() {
        this.bindComponentProperties(this.skeleton, [
            'name',
            'value',
            'required',
            'readOnly',
            'disabled',
            'paragraphTag',
            'deniedTags',
            'orientation',
            'formatAction',
            'fontNameAction',
            'fontSizeAction',
            'fontColorAction',
            'undoAction',
            'redoAction',
            'boldAction',
            'italicAction',
            'underlineAction',
            'strikeThroughAction',
            'unorderedListAction',
            'orderedListAction',
            'alignLeftAction',
            'alignCenterAction',
            'alignRightAction',
            'alignJustifyAction',
            'outdentAction',
            'indentAction',
            'cutAction',
            'copyAction',
            'pasteAction',
            'getStyles',
            'getCurrentStyles'
        ]);
    }
    /**
     * Assign all elements properties.
     */
    assignProperties() {
        this.assignComponentProperties(this.properties, ['name', 'value', 'required', 'disabled', 'deniedTag']);
        this.readOnly = this.properties.readOnly || false;
        this.paragraphTag = this.properties.paragraphTag || 'p';
        this.orientation = this.properties.orientation || 'column';
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
     * Get editor value.
     */
    get value() {
        return this.states.value;
    }
    /**
     * Set editor value.
     */
    set value(value) {
        const content = this.getContentElement();
        content.innerHTML = value;
        this.states.value = content.innerHTML;
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
        this.getContentElement().contentEditable = (!(state || this.disabled)).toString();
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
        this.getContentElement().contentEditable = (!(state || this.readOnly)).toString();
        Control.setChildrenProperty(this.toolbarSlot, 'disabled', state);
    }
    /**
     * Get HTML paragraph tag.
     */
    get paragraphTag() {
        return this.states.paragraphTag;
    }
    /**
     * Set HTML paragraph tag.
     */
    set paragraphTag(type) {
        this.performAction('defaultParagraphSeparator', (this.states.paragraphTag = type.toLowerCase()));
    }
    /**
     * Get HTML denied tag.
     */
    get deniedTags() {
        return this.states.deniedTags;
    }
    /**
     * Set HTML denied tags.
     */
    set deniedTags(tags) {
        this.deniedTags = tags.map((tag) => tag.toLowerCase());
    }
    /**
     * Get orientation mode.
     */
    get orientation() {
        return this.skeleton.dataset.orientation || 'row';
    }
    /**
     * Set orientation mode.
     */
    set orientation(mode) {
        this.skeleton.dataset.orientation = mode;
    }
    /**
     * Editor element.
     */
    get element() {
        return this.skeleton;
    }
    /**
     * Formats the specified tag from the selection or insertion point.
     * @param tag HTML tag.
     */
    formatAction(tag) {
        this.performAction('formatBlock', tag);
    }
    /**
     * Formats the specified font name for the selection or at the insertion point.
     * @param name Font name.
     */
    fontNameAction(name) {
        this.performActionWithCSS('fontName', name);
    }
    /**
     * Formats the specified font size for the selection or at the insertion point.
     * @param size Font size.
     */
    fontSizeAction(size) {
        this.performActionWithCSS('fontSize', size);
    }
    /**
     * Formats the specified font color for the selection or at the insertion point.
     * @param color Font color.
     */
    fontColorAction(color) {
        this.performActionWithCSS('foreColor', color);
    }
    /**
     * Undoes the last executed command.
     */
    undoAction() {
        this.performAction('undo');
    }
    /**
     * Redoes the previous undo command.
     */
    redoAction() {
        this.performAction('redo');
    }
    /**
     * Toggles bold on/off for the selection or at the insertion point.
     */
    boldAction() {
        this.performAction('bold');
    }
    /**
     * Toggles italics on/off for the selection or at the insertion point.
     */
    italicAction() {
        this.performAction('italic');
    }
    /**
     * Toggles underline on/off for the selection or at the insertion point.
     */
    underlineAction() {
        this.performAction('underline');
    }
    /**
     * Toggles strikeThrough on/off for the selection or at the insertion point.
     */
    strikeThroughAction() {
        this.performAction('strikeThrough');
    }
    /**
     * Creates a bulleted unordered list for the selection or at the insertion point.
     */
    unorderedListAction() {
        this.performAction('insertUnorderedList');
    }
    /**
     * Creates a numbered ordered list for the selection or at the insertion point.
     */
    orderedListAction() {
        this.performAction('insertOrderedList');
    }
    /**
     * Justifies the selection or insertion point to the left.
     */
    alignLeftAction() {
        this.performAction('justifyLeft');
    }
    /**
     * Justifies the selection or insertion point to the center.
     */
    alignCenterAction() {
        this.performAction('justifyCenter');
    }
    /**
     * Justifies the selection or insertion point to the right.
     */
    alignRightAction() {
        this.performAction('justifyRight');
    }
    /**
     * Justifies the selection or insertion point.
     */
    alignJustifyAction() {
        this.performAction('justifyFull');
    }
    /**
     * Outdents the line containing the selection or insertion point.
     */
    outdentAction() {
        this.performAction('outdent');
    }
    /**
     * Indents the line containing the selection or insertion point.
     */
    indentAction() {
        this.performAction('indent');
    }
    /**
     * Removes the current selection and copies it to the clipboard.
     */
    cutAction() {
        this.performAction('cut');
    }
    /**
     * Copies the current selection to the clipboard.
     */
    copyAction() {
        this.performAction('copy');
    }
    /**
     * Pastes the clipboard contents at the insertion point.
     */
    pasteAction() {
        this.performAction('paste');
    }
    /**
     * Gets the active styles map from the specified node.
     * @param node Child node.
     * @param map Current styles map.
     * @returns Returns the active styles map.
     */
    getStyles(node, map) {
        const content = this.getContentElement();
        const styles = map || { ...Template_1.defaultStyles };
        while (node && node !== content) {
            if (node instanceof HTMLElement) {
                Template_1.collectStylesByElement(styles, node);
                Template_1.collectStylesByCSS(styles, node.style);
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
        const styles = { ...Template_1.defaultStyles };
        if (selection.rangeCount) {
            this.getStyles(selection.focusNode, styles);
        }
        return styles;
    }
};
/**
 * Default styles.
 */
Template.defaultStyles = {
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
    fontName: '',
    fontSize: '',
    fontColor: ''
};
/**
 * Map of style keys by element name.
 */
Template.stylesByElementName = {
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
    font: [{ target: 'faceName', source: 'face' }, { target: 'fontSize', source: 'size' }, { target: 'fontColor', source: 'color' }]
};
/**
 * Map of styles by CSS declaration.
 */
Template.stylesByCSSDeclaration = {
    textAlign: {
        targets: {
            left: 'alignLeft',
            center: 'alignCenter',
            right: 'alignRight',
            justify: 'alignJustify'
        }
    },
    fontSize: { target: 'fontSize' },
    fontFamily: { target: 'fontName' },
    color: { target: 'fontColor' }
};
__decorate([
    Class.Private()
], Template.prototype, "states", void 0);
__decorate([
    Class.Private()
], Template.prototype, "elementObserver", void 0);
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
], Template.prototype, "performAction", null);
__decorate([
    Class.Private()
], Template.prototype, "performActionWithCSS", null);
__decorate([
    Class.Private()
], Template.prototype, "getContentElement", null);
__decorate([
    Class.Private()
], Template.prototype, "removeDeniedNodes", null);
__decorate([
    Class.Private()
], Template.prototype, "mutationHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "focusHandler", null);
__decorate([
    Class.Private()
], Template.prototype, "changeHandler", null);
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
], Template.prototype, "name", null);
__decorate([
    Class.Public()
], Template.prototype, "value", null);
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
], Template.prototype, "paragraphTag", null);
__decorate([
    Class.Public()
], Template.prototype, "deniedTags", null);
__decorate([
    Class.Public()
], Template.prototype, "orientation", null);
__decorate([
    Class.Public()
], Template.prototype, "element", null);
__decorate([
    Class.Public()
], Template.prototype, "formatAction", null);
__decorate([
    Class.Public()
], Template.prototype, "fontNameAction", null);
__decorate([
    Class.Public()
], Template.prototype, "fontSizeAction", null);
__decorate([
    Class.Public()
], Template.prototype, "fontColorAction", null);
__decorate([
    Class.Public()
], Template.prototype, "undoAction", null);
__decorate([
    Class.Public()
], Template.prototype, "redoAction", null);
__decorate([
    Class.Public()
], Template.prototype, "boldAction", null);
__decorate([
    Class.Public()
], Template.prototype, "italicAction", null);
__decorate([
    Class.Public()
], Template.prototype, "underlineAction", null);
__decorate([
    Class.Public()
], Template.prototype, "strikeThroughAction", null);
__decorate([
    Class.Public()
], Template.prototype, "unorderedListAction", null);
__decorate([
    Class.Public()
], Template.prototype, "orderedListAction", null);
__decorate([
    Class.Public()
], Template.prototype, "alignLeftAction", null);
__decorate([
    Class.Public()
], Template.prototype, "alignCenterAction", null);
__decorate([
    Class.Public()
], Template.prototype, "alignRightAction", null);
__decorate([
    Class.Public()
], Template.prototype, "alignJustifyAction", null);
__decorate([
    Class.Public()
], Template.prototype, "outdentAction", null);
__decorate([
    Class.Public()
], Template.prototype, "indentAction", null);
__decorate([
    Class.Public()
], Template.prototype, "cutAction", null);
__decorate([
    Class.Public()
], Template.prototype, "copyAction", null);
__decorate([
    Class.Public()
], Template.prototype, "pasteAction", null);
__decorate([
    Class.Public()
], Template.prototype, "getStyles", null);
__decorate([
    Class.Public()
], Template.prototype, "getCurrentStyles", null);
__decorate([
    Class.Private()
], Template, "defaultStyles", void 0);
__decorate([
    Class.Private()
], Template, "stylesByElementName", void 0);
__decorate([
    Class.Private()
], Template, "stylesByCSSDeclaration", void 0);
__decorate([
    Class.Private()
], Template, "collectStylesByCSS", null);
__decorate([
    Class.Private()
], Template, "collectStylesByElement", null);
Template = Template_1 = __decorate([
    Class.Describe()
], Template);
exports.Template = Template;
