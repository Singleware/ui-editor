import * as Control from '@singleware/ui-control';
import { Properties } from './properties';
import { Element } from './element';
import { Styles } from './styles';
/**
 * Editor template class.
 */
export declare class Template extends Control.Component<Properties> {
    /**
     * Editor states.
     */
    private states;
    /**
     * Mutation observer.
     */
    private elementObserver;
    /**
     * Toolbar element.
     */
    private toolbarSlot;
    /**
     * Content element.
     */
    private contentSlot;
    /**
     * Wrapper element.
     */
    private wrapper;
    /**
     * Editor styles.
     */
    private styles;
    /**
     * Editor skeleton.
     */
    private skeleton;
    /**
     * Gets the content element.
     */
    private getContent;
    /**
     * Filters the specified node list to remove any denied node.
     * @param nodes Node list.
     */
    private removeDeniedNodes;
    /**
     * Mutation handler.
     * @param records Mutation record list.
     */
    private mutationHandler;
    /**
     * Content focus handler.
     */
    private focusHandler;
    /**
     * Content change handler.
     */
    private changeHandler;
    /**
     * Bind event handlers to update the custom element.
     */
    private bindHandlers;
    /**
     * Bind exposed properties to the custom element.
     */
    private bindProperties;
    /**
     * Assign all elements properties.
     */
    private assignProperties;
    /**
     * Default constructor.
     * @param properties Editor properties.
     * @param children Editor children.
     */
    constructor(properties?: Properties, children?: any[]);
    /**
     * Get editor name.
     */
    /**
    * Set editor name.
    */
    name: string;
    /**
     * Get editor value.
     */
    /**
    * Set editor value.
    */
    value: string;
    /**
     * Get required state.
     */
    /**
    * Set required state.
    */
    required: boolean;
    /**
     * Get read-only state.
     */
    /**
    * Set read-only state.
    */
    readOnly: boolean;
    /**
     * Get disabled state.
     */
    /**
    * Set disabled state.
    */
    disabled: boolean;
    /**
     * Get HTML paragraph tag.
     */
    /**
    * Set HTML paragraph tag.
    */
    paragraphTag: string;
    /**
     * Get HTML denied tag.
     */
    /**
    * Set HTML denied tags.
    */
    deniedTags: string[];
    /**
     * Get orientation mode.
     */
    /**
    * Set orientation mode.
    */
    orientation: string;
    /**
     * Editor element.
     */
    readonly element: Element;
    /**
     * Formats the specified tag from the selection or insertion point.
     * @param tag HTML tag.
     */
    formatAction(tag: string): void;
    /**
     * Undoes the last executed command.
     */
    undoAction(): void;
    /**
     * Redoes the previous undo command.
     */
    redoAction(): void;
    /**
     * Toggles bold on/off for the selection or at the insertion point.
     */
    boldAction(): void;
    /**
     * Toggles italics on/off for the selection or at the insertion point.
     */
    italicAction(): void;
    /**
     * Toggles underline on/off for the selection or at the insertion point.
     */
    underlineAction(): void;
    /**
     * Toggles strikeThrough on/off for the selection or at the insertion point.
     */
    strikeThroughAction(): void;
    /**
     * Creates a bulleted unordered list for the selection or at the insertion point.
     */
    unorderedListAction(): void;
    /**
     * Creates a numbered ordered list for the selection or at the insertion point.
     */
    orderedListAction(): void;
    /**
     * Justifies the selection or insertion point to the left.
     */
    alignLeftAction(): void;
    /**
     * Justifies the selection or insertion point to the center.
     */
    alignCenterAction(): void;
    /**
     * Justifies the selection or insertion point to the right.
     */
    alignRightAction(): void;
    /**
     * Justifies the selection or insertion point.
     */
    alignJustifyAction(): void;
    /**
     * Outdents the line containing the selection or insertion point.
     */
    outdentAction(): void;
    /**
     * Indents the line containing the selection or insertion point.
     */
    indentAction(): void;
    /**
     * Removes the current selection and copies it to the clipboard.
     */
    cutAction(): void;
    /**
     * Copies the current selection to the clipboard.
     */
    copyAction(): void;
    /**
     * Pastes the clipboard contents at the insertion point.
     */
    pasteAction(): void;
    /**
     * Gets the active styles map from the specified node.
     * @param node Child node.
     * @param map Current styles map.
     * @returns Returns the active styles map.
     */
    getStyles(node: Node, map?: Styles): Styles;
    /**
     * Gets the active styles map from the focused node.
     * @returns Returns the active styles map.
     */
    getCurrentStyles(): Styles;
    /**
     * Default styles.
     */
    private static defaultStyles;
    /**
     * Map of styles by tag.
     */
    private static stylesByTag;
    /**
     * Map of styles by CSS.
     */
    private static stylesByCSS;
    /**
     * Determines whether the specified element is child of the specified parent element.
     * @param element Child element.
     * @param parent Parent element.
     * @returns Returns true when the specified element is child of the specified parent element, false otherwise.
     */
    private static isChildOf;
    /**
     * Collect all styles by its respective CSS declaration.
     * @param styles Styles map.
     * @param css CSS declarations.
     */
    private static collectStylesByCSS;
    /**
     * Collect all styles by its respective element names.
     * @param styles Styles map.
     * @param element HTML element.
     */
    private static collectStylesByElement;
}
