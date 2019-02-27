import * as Control from '@singleware/ui-control';
import { Styles } from './styles';
/**
 * Editor element.
 */
export declare class Element extends Control.Element {
    /**
     * Default styles.
     */
    private static defaultStyles;
    /**
     * Map of style keys by element name.
     */
    private static stylesByElementName;
    /**
     * Map of styles by CSS declaration.
     */
    private static stylesByCSSDeclaration;
    /**
     * Collect all styles by its respective CSS declaration.
     * @param styles Styles map.
     * @param declarations CSS declarations.
     */
    private static collectStylesByCSS;
    /**
     * Collect all styles by its respective element name.
     * @param styles Styles map.
     * @param element HTML element.
     */
    private static collectStylesByElement;
    /**
     * List of denied tags in the editor.
     */
    private deniedTagList;
    /**
     * Cached HTML content.
     */
    private cachedHTML;
    /**
     * Content observer.
     */
    private observer;
    /**
     * Element styles.
     */
    private styles;
    /**
     * Toolbar element.
     */
    private toolbarSlot;
    /**
     * Content element.
     */
    private contentSlot;
    /**
     * Editor layout element.
     */
    private editorLayout;
    /**
     * Editor styles element.
     */
    private editorStyles;
    /**
     * Update all validation attributes.
     */
    private updateValidation;
    /**
     * Unwraps the specified element.
     * @param element Element instance.
     */
    private unwrapElement;
    /**
     * Cleans the specified element.
     * @param element Element instance.
     * @param tag Child tag name to be cleaned.
     * @param properties CSS properties to be cleaned.
     */
    private cleanElement;
    /**
     * Performs a surrounding in the current selection with the specified tag.
     * @param tag Tag name.
     * @returns Returns the affected element instance.
     * @throws Throws an error when there is no current selection.
     */
    private performSurrounding;
    /**
     * Performs the specified command with the given value.
     * @param name Command name.
     * @param value Command value.
     * @returns Returns the affected element instance.
     */
    private performCommand;
    /**
     * Filters the specified list to remove any denied node.
     * @param list List of nodes or elements.
     * @returns Returns the number of removed nodes.
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
    private contentFocusHandler;
    /**
     * Content change handler.
     */
    private contentChangeHandler;
    /**
     * Updates the current selection into the new input slot element.
     */
    private contentSlotChangeHandler;
    /**
     * Default constructor.
     */
    constructor();
    /**
     * Determines whether the element is empty or not.
     */
    readonly empty: boolean;
    /**
     * Gets the element name.
     */
    /**
    * Sets the element name.
    */
    name: string;
    /**
     * Gets the element value.
     */
    /**
    * Sets the element value.
    */
    value: string;
    /**
     * Default value for resets.
     */
    defaultValue: string;
    /**
     * Gets the required state of the element.
     */
    /**
    * Sets the required state of the element.
    */
    required: boolean;
    /**
     * Gets the read-only state of the element.
     */
    /**
    * Sets the read-only state of the element.
    */
    readOnly: boolean;
    /**
     * Gets the disabled state of the element.
     */
    /**
    * Sets the disabled state of the element.
    */
    disabled: boolean;
    /**
     * Gets the paragraph tag.
     */
    /**
    * Sets the paragraph tag.
    */
    paragraphTag: string;
    /**
     * Gets the denied tag list.
     */
    /**
    * Set HTML denied tags.
    */
    deniedTags: string[];
    /**
     * Gets the element orientation.
     */
    /**
    * Sets the element orientation.
    */
    orientation: string;
    /**
     * Formats the specified font name for the selection or at the insertion point.
     * @param name Font name.
     */
    fontNameAction(name: string): void;
    /**
     * Formats the specified font size for the selection or at the insertion point.
     * @param size Font size.
     */
    fontSizeAction(size: string): void;
    /**
     * Formats the specified font color for the selection or at the insertion point.
     * @param color Font color.
     */
    fontColorAction(color: string): void;
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
     * Gets the active styles from the specified node.
     * @param node Element node.
     * @param map Predefined styles map.
     * @returns Returns the active styles map.
     */
    getStyles(node: Node, map?: Styles): Styles;
    /**
     * Gets the active styles map from the focused node.
     * @returns Returns the active styles map.
     */
    getCurrentStyles(): Styles;
    /**
     * Move the focus to this element.
     */
    focus(): void;
    /**
     * Reset the element value to its initial value.
     */
    reset(): void;
    /**
     * Checks the element validity.
     * @returns Returns true when the element is valid, false otherwise.
     */
    checkValidity(): boolean;
}
