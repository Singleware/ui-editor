import * as Control from '@singleware/ui-control';
import { Styles } from './styles';
/**
 * Editor element.
 */
export declare class Element extends Control.Element {
    /**
     * Current selection range.
     */
    private currentRange?;
    /**
     * Current selection mark.
     */
    private currentMark?;
    /**
     * Current HTML content.
     */
    private currentHTML;
    /**
     * List of denied tags.
     */
    private deniedTagList;
    /**
     * Content observer.
     */
    private observer;
    /**
     * Map of unremovable nodes.
     */
    private unremovableMap;
    /**
     * Map of ignored nodes.
     */
    private ignoredMap;
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
     * Update all validation attributes based on the current content.
     */
    private updateValidation;
    /**
     * Starts the content observer.
     */
    private startContentObserver;
    /**
     * Stops the content observer and clear its records.
     */
    private stopContentObserver;
    /**
     * Preserves the current selection elements wrapping it into a new mark element.
     */
    private wrapSelectionRange;
    /**
     * Restores the previously preserved selection elements unwrapping the current mark element.
     */
    private unwrapSelectionRange;
    /**
     * Gets the current selection.
     * @returns Returns the selection object.
     * @throws Throws an error when the selection object doesn't exists.
     */
    private getSelection;
    /**
     * Saves the current selection range.
     */
    private saveSelectionRange;
    /**
     * Restores the previously saved selection range.
     */
    private restoreSelectionRange;
    /**
     * Removes the current saved selection range.
     */
    private removeSelectionRange;
    /**
     * Restores the previously saved selection range and unwraps the current mark element.
     */
    private restoreSelection;
    /**
     * Restores the current focus in the specified element.
     * @param element Element instance.
     */
    private restoreFocus;
    /**
     * Restores the first paragraph in the content element.
     * @param focused Determines whether the focus should be moved to the restored paragraph or not.
     * @returns Returns true when the paragraph was restored, false otherwise.
     */
    private restoreParagraph;
    /**
     * Restores any locked node form the specified node list.
     * @param parent Parent node for all nodes in the specified list of removed nodes.
     * @param next Next sibling node of the specified list of removed nodes.
     * @param list List of removed nodes or elements.
     * @returns Returns the number of restored nodes.
     */
    private restoreLockedNodes;
    /**
     * Remove any denied node for the specified node list.
     * @param list List of added nodes or elements.
     * @returns Returns the number of removed nodes.
     */
    private removeDeniedNodes;
    /**
     * Remove all given CSS properties from the specified list of nodes, when the node becomes without CSS, it will be removed.
     * @param list List of nodes or elements.
     * @param tag Expected tag name.
     * @param properties CSS properties to be cleaned.
     * @returns Returns the number of removed nodes.
     */
    private clearNodes;
    /**
     * Saves the current content changes.
     * @returns Returns true when the content changes was saved, false otherwise.
     */
    private saveChanges;
    /**
     * Gets the higher parent element that is connected to the document.
     * @param parent First parent element.
     * @returns Returns the higher parent element that is connected to the document.
     */
    private getConnectedParent;
    /**
     * Content change, event handler.
     * @param records Mutation record list.
     */
    private contentChangeHandler;
    /**
     * Updates the current selection into the new input slot element.
     */
    private contentSlotChangeHandler;
    /**
     * Performs a surrounding in the current selection with the specified tag.
     * @param tag Tag name.
     * @returns Returns the affected element instance.
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
     * Gets the preserve selection state.
     */
    /**
    * Sets the preserve selection state.
    */
    preserveSelection: boolean;
    /**
     * Gets the paragraph type.
     */
    /**
    * Sets the paragraph type.
    */
    paragraphType: string;
    /**
     * Gets the denied tag list.
     */
    /**
    * Sets the denied tag list.
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
     * Gets the selected range.
     */
    readonly selectedRange: Range | undefined;
    /**
     * Gets the selected text.
     */
    readonly selectedText: string | undefined;
    /**
     * Gets the selected HTML.
     */
    readonly selectedHTML: string | undefined;
    /**
     * Gets the selected styles.
     */
    readonly selectedStyles: Styles;
    /**
     * Sets the removal state for the specified element.
     * @param element Element instance.
     * @param state Determines whether the element can be removed by the user or not.
     * @param locker Locker object, should be used to unlock the element.
     * @throws Throws an error when the specified locker for the element is invalid.
     */
    setRemovalState(element: HTMLElement, state: boolean, locker?: any): void;
    /**
     * Sets the rendering state of the specified node.
     * @param node Node instance.
     * @param state Determines whether the node should be ignored by the renderer or not.
     * @param children Determines whether the node children should be affected or not.
     */
    setRenderingState(node: Node, state: boolean, children?: boolean): void;
    /**
     * Clears the current selection.
     */
    clearSelection(): void;
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
     * Change line height for the selection or at the insertion point.
     * @param height Line height.
     */
    lineHeightAction(height: string): void;
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
     * Sets a new zoom into the content element.
     */
    zoomAction(zoom: number): void;
}
