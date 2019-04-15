import * as Control from '@singleware/ui-control';
import { Properties } from './properties';
import { Element } from './element';
import { Styles } from './styles';
/**
 * Editor component class.
 */
export declare class Component<T extends Properties = Properties> extends Control.Component<T> {
    /**
     * Element instance.
     */
    private skeleton;
    /**
     * Gets the element.
     */
    readonly element: Element;
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
     * Gets the element default value.
     */
    /**
    * Sets the element default value.
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
     * Gets the paragraph tag.
     */
    /**
    * Sets the paragraph tag.
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
     * Change the font name for the selection or at the insertion point.
     * @param name Font name.
     */
    fontNameAction(name: string): void;
    /**
     * Change the font size for the selection or at the insertion point.
     * @param size Font size.
     */
    fontSizeAction(size: string): void;
    /**
     * Change the font color for the selection or at the insertion point.
     * @param color Font color.
     */
    fontColorAction(color: string): void;
    /**
     * Change line height for the selection or at the insertion point.
     * @param height Line height.
     */
    lineHeightAction(height: string): void;
    /**
     * Formats the specified tag for the selection or insertion point.
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
