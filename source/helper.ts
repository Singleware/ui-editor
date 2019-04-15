/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as JSX from '@singleware/jsx';

import { Styles } from './styles';

/**
 * Editor helper.
 */
@Class.Describe()
export class Helper extends Class.Null {
  /**
   * Map of styles by tag name.
   */
  @Class.Private()
  private static stylesByTagName = {
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
  @Class.Private()
  private static stylesByCSSDeclaration = {
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
  @Class.Private()
  private static emptyElements = new Set([
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

  /**
   * Gets the representative string of the specified attribute list.
   * @param attributes List of attributes.
   * @returns Returns the representative string of the specified attribute list.
   */
  @Class.Private()
  private static buildHTMLAttributes(attributes: NamedNodeMap): string {
    const list = [];
    for (let i = 0; i < attributes.length; ++i) {
      const attribute = <Attr>attributes.item(i);
      if (attribute.value !== null) {
        list.push(`${attribute.name}="${JSX.escape(attribute.value)}"`);
      } else {
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
  @Class.Public()
  public static buildHTMLNodes(nodes: NodeList, ignore: WeakMap<Node, boolean>): string {
    const list = [];
    for (const node of nodes) {
      if (node instanceof HTMLElement) {
        const children = this.buildHTMLNodes(node.childNodes, ignore);
        if (ignore.has(node)) {
          if (ignore.get(node) !== true && children.length > 0) {
            list.push(children);
          }
        } else {
          const tagName = node.tagName.toLowerCase();
          const attributes = this.buildHTMLAttributes(node.attributes);
          if (children.length > 0) {
            list.push(`<${tagName}${attributes.length ? ` ${attributes}` : ''}>${children}</${tagName}>`);
          } else {
            list.push(`<${tagName}${attributes.length ? ` ${attributes}` : ''}${this.emptyElements.has(tagName) ? '' : '/'}>`);
          }
        }
      } else {
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
  @Class.Public()
  public static collectStylesByCSS(styles: Styles, declarations: CSSStyleDeclaration): void {
    let style, property;
    for (const entry in this.stylesByCSSDeclaration) {
      if ((style = (<any>this.stylesByCSSDeclaration)[entry])) {
        if (style.target) {
          if ((<any>styles)[style.target] === void 0) {
            (<any>styles)[style.target] = (<any>declarations)[entry];
          }
        } else if (style.mapping) {
          if ((property = style.mapping[(<any>declarations)[entry]])) {
            (<any>styles)[property] = true;
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
  @Class.Public()
  public static collectStylesByElement(styles: Styles, element: HTMLElement): void {
    const entries = (<any>this.stylesByTagName)[element.tagName] || [];
    for (const entry of entries) {
      if (entry && entry.target) {
        if (entry.source) {
          if ((<any>styles)[entry.target] === void 0 && element.hasAttribute(entry.source)) {
            (<any>styles)[entry.target] = element.getAttribute(entry.source);
          }
        } else {
          (<any>styles)[entry.target] = true;
        }
      }
    }
  }
}
