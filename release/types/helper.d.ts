/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import { Styles } from './styles';
/**
 * Editor helper.
 */
export declare class Helper extends Class.Null {
    /**
     * Map of styles by tag name.
     */
    private static stylesByTagName;
    /**
     * Map of styles by CSS declaration.
     */
    private static stylesByCSSDeclaration;
    /**
     * Set of elements without children.
     */
    private static emptyElements;
    /**
     * Gets the representative string of the specified attribute list.
     * @param attributes List of attributes.
     * @returns Returns the representative string of the specified attribute list.
     */
    private static buildHTMLAttributes;
    /**
     * Gets the representative string of the specified node list.
     * @param nodes List of nodes.
     * @param ignore Map of ignored elements and its children.
     * @returns Returns the representative string of the specified node list.
     */
    static buildHTMLNodes(nodes: NodeList, ignore: WeakMap<Node, boolean>): string;
    /**
     * Collect all styles by its respective CSS declaration form the specified CSS declarations.
     * @param styles Styles map.
     * @param declarations CSS declarations.
     */
    static collectStylesByCSS(styles: Styles, declarations: CSSStyleDeclaration): void;
    /**
     * Collect all styles by its respective element name form the specified element instance.
     * @param styles Styles map.
     * @param element Element instance.
     */
    static collectStylesByElement(styles: Styles, element: HTMLElement): void;
}
