/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import { Styles } from './styles';
/**
 * Editor helper.
 */
export declare class Helper extends Class.Null {
    /**
     * Map of style keys by element name.
     */
    private static stylesByElementName;
    /**
     * Map of styles by CSS declaration.
     */
    private static stylesByCSSDeclaration;
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
    /**
     * Gets the representative string of the specified attribute list.
     * @param attributes List of attributes.
     * @returns Returns the representative string of the specified attribute list.
     */
    private static buildAttributes;
    /**
     * Gets the representative string of the specified node list.
     * @param nodes List of nodes.
     * @returns Returns the representative string of the specified node list.
     */
    static buildElement(nodes: NodeList, ignored: WeakSet<Node> | Set<Node>): string;
}
