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
/**
 * Editor helper.
 */
let Helper = class Helper extends Class.Null {
    /**
     * Gets the representative string of the specified attribute list.
     * @param attributes List of attributes.
     * @returns Returns the representative string of the specified attribute list.
     */
    static buildHTMLAttributes(attributes) {
        const list = [];
        for (let i = 0; i < attributes.length; ++i) {
            const attribute = attributes.item(i);
            if (attribute.value !== null) {
                list.push(`${attribute.name}="${JSX.escape(attribute.value)}"`);
            }
            else {
                list.push(`${attribute.value}`);
            }
        }
        return list.join(' ');
    }
    /**
     * Gets the representative string of the specified node list.
     * @param nodes List of nodes.
     * @param ignore Map of ignored elements and its children.
     * @returns Returns the representative string of the specified node list.
     */
    static buildHTMLNodes(nodes, ignore) {
        const list = [];
        for (const node of nodes) {
            if (node instanceof HTMLElement) {
                const children = this.buildHTMLNodes(node.childNodes, ignore);
                if (ignore.has(node)) {
                    if (ignore.get(node) !== true && children.length > 0) {
                        list.push(children);
                    }
                }
                else {
                    const tagName = node.tagName.toLowerCase();
                    const attributes = this.buildHTMLAttributes(node.attributes);
                    if (children.length > 0) {
                        list.push(`<${tagName}${attributes.length ? ` ${attributes}` : ''}>${children}</${tagName}>`);
                    }
                    else {
                        list.push(`<${tagName}${attributes.length ? ` ${attributes}` : ''}${this.emptyElements.has(tagName) ? '' : '/'}>`);
                    }
                }
            }
            else {
                list.push(node.textContent || '');
            }
        }
        return list.join('');
    }
    /**
     * Collect all styles by its respective CSS declaration form the specified CSS declarations.
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
     * Collect all styles by its respective element name form the specified element instance.
     * @param styles Styles map.
     * @param element Element instance.
     */
    static collectStylesByElement(styles, element) {
        const entries = this.stylesByTagName[element.tagName] || [];
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
};
/**
 * Map of styles by tag name.
 */
Helper.stylesByTagName = {
    B: [{ target: 'bold' }],
    STRONG: [{ target: 'bold' }],
    I: [{ target: 'italic' }],
    EM: [{ target: 'italic' }],
    U: [{ target: 'underline' }],
    INS: [{ target: 'underline' }],
    S: [{ target: 'strikeThrough' }],
    STRIKE: [{ target: 'strikeThrough' }],
    DEL: [{ target: 'strikeThrough' }],
    UL: [{ target: 'unorderedList' }],
    OL: [{ target: 'orderedList' }],
    P: [{ target: 'paragraph' }],
    H1: [{ target: 'heading1' }],
    H2: [{ target: 'heading2' }],
    H3: [{ target: 'heading3' }],
    H4: [{ target: 'heading4' }],
    H5: [{ target: 'heading5' }],
    H6: [{ target: 'heading6' }],
    FONT: [{ target: 'faceName', source: 'face' }, { target: 'fontSize', source: 'size' }, { target: 'fontColor', source: 'color' }]
};
/**
 * Map of styles by CSS declaration.
 */
Helper.stylesByCSSDeclaration = {
    lineHeight: { target: 'lineHeight' },
    fontSize: { target: 'fontSize' },
    fontFamily: { target: 'fontName' },
    color: { target: 'fontColor' },
    textAlign: {
        mapping: {
            left: 'alignLeft',
            center: 'alignCenter',
            right: 'alignRight',
            justify: 'alignJustify'
        }
    }
};
/**
 * Set of elements without children.
 */
Helper.emptyElements = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
]);
__decorate([
    Class.Private()
], Helper, "stylesByTagName", void 0);
__decorate([
    Class.Private()
], Helper, "stylesByCSSDeclaration", void 0);
__decorate([
    Class.Private()
], Helper, "emptyElements", void 0);
__decorate([
    Class.Private()
], Helper, "buildHTMLAttributes", null);
__decorate([
    Class.Public()
], Helper, "buildHTMLNodes", null);
__decorate([
    Class.Public()
], Helper, "collectStylesByCSS", null);
__decorate([
    Class.Public()
], Helper, "collectStylesByElement", null);
Helper = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;
