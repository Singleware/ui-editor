/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as JSX from '@singleware/jsx';
import * as Control from '@singleware/ui-control';

import { Stylesheet } from './stylesheet';
import { Settings } from './settings';
import { Helper } from './helper';
import { Styles } from './styles';

/**
 * Editor element.
 */
@JSX.Describe('swe-editor')
@Class.Describe()
export class Element extends Control.Element {
  /**
   * Current selection range.
   */
  @Class.Private()
  private currentRange?: Range;

  /**
   * Current selection mark.
   */
  @Class.Private()
  private currentMark?: HTMLElement | null;

  /**
   * Current HTML content.
   */
  @Class.Private()
  private currentHTML = '';

  /**
   * List of denied tags.
   */
  @Class.Private()
  private deniedTagList = [...Settings.defaultDeniedTags];

  /**
   * Content observer.
   */
  @Class.Private()
  private observer = new MutationObserver(this.contentChangeHandler.bind(this));

  /**
   * Map of unremovable nodes.
   */
  @Class.Private()
  private unremovableMap = new WeakMap<Node, any>();

  /**
   * Map of ignored nodes.
   */
  @Class.Private()
  private ignoredMap = new WeakMap<Node, boolean>();

  /**
   * Element styles.
   */
  @Class.Private()
  private styles = new Stylesheet();

  /**
   * Toolbar element.
   */
  @Class.Private()
  private toolbarSlot = <slot name="toolbar" class="toolbar" /> as HTMLSlotElement;

  /**
   * Content element.
   */
  @Class.Private()
  private contentSlot = <slot name="content" class="content" onSlotChange={this.contentSlotChangeHandler.bind(this)} /> as HTMLSlotElement;

  /**
   * Editor layout element.
   */
  @Class.Private()
  private editorLayout = (
    <div class="editor">
      {this.toolbarSlot}
      {this.contentSlot}
    </div>
  ) as HTMLLabelElement;

  /**
   * Editor styles element.
   */
  @Class.Private()
  private editorStyles = <style type="text/css">{this.styles.toString()}</style> as HTMLStyleElement;

  /**
   * Update all validation attributes based on the current content.
   */
  @Class.Private()
  private updateValidation(): void {
    this.updatePropertyState('invalid', !this.empty && !this.checkValidity());
    this.updatePropertyState('empty', this.empty);
  }

  /**
   * Starts the content observer.
   */
  @Class.Private()
  private startContentObserver(): void {
    this.observer.observe(this.getRequiredChildElement(this.contentSlot), {
      childList: true,
      subtree: true
    });
  }

  /**
   * Stops the content observer and clear its records.
   */
  @Class.Private()
  private stopContentObserver(): void {
    this.observer.disconnect();
    this.observer.takeRecords();
  }

  /**
   * Preserves the current selection elements wrapping it into a new mark element.
   */
  @Class.Private()
  private wrapSelectionRange(): void {
    if (this.currentRange && !this.currentRange.collapsed && this.preserveSelection) {
      this.stopContentObserver();
      this.currentMark = <mark data-swe-editor-selection>{this.currentRange.extractContents()}</mark> as HTMLElement;
      this.currentRange.insertNode(this.currentMark);
      this.setRenderingState(this.currentMark, false);
      this.startContentObserver();
    }
  }

  /**
   * Restores the previously preserved selection elements unwrapping the current mark element.
   */
  @Class.Private()
  private unwrapSelectionRange(): void {
    if (this.currentMark) {
      this.stopContentObserver();
      JSX.unwrap(this.currentMark);
      this.startContentObserver();
      this.currentMark = void 0;
    }
  }

  /**
   * Gets the current selection.
   * @returns Returns the selection object.
   * @throws Throws an error when the selection object doesn't exists.
   */
  @Class.Private()
  private getSelection(): Selection {
    const selection = window.getSelection();
    if (!selection) {
      throw new Error(`There's no selection.`);
    }
    return selection;
  }

  /**
   * Saves the current selection range.
   */
  @Class.Private()
  private saveSelectionRange(): void {
    const selection = this.getSelection();
    if (selection.rangeCount > 0) {
      this.currentRange = selection.getRangeAt(0);
    }
  }

  /**
   * Restores the previously saved selection range.
   */
  @Class.Private()
  private restoreSelectionRange(): void {
    if (this.currentRange && this.preserveSelection) {
      const selection = this.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.currentRange);
    }
  }

  /**
   * Removes the current saved selection range.
   */
  @Class.Private()
  private removeSelectionRange(): void {
    if (this.currentRange) {
      this.getSelection().removeRange(this.currentRange);
      this.currentRange = void 0;
    }
  }

  /**
   * Restores the previously saved selection range and unwraps the current mark element.
   */
  @Class.Private()
  private restoreSelection(): void {
    this.unwrapSelectionRange();
    this.restoreSelectionRange();
  }

  /**
   * Restores the current focus in the specified element.
   * @param element Element instance.
   */
  @Class.Private()
  private restoreFocus(element: HTMLElement): Range {
    const selection = this.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    return range;
  }

  /**
   * Restores the first paragraph in the content element.
   * @param focused Determines whether the focus should be moved to the restored paragraph or not.
   * @returns Returns true when the paragraph was restored, false otherwise.
   */
  @Class.Private()
  private restoreParagraph(focused: boolean): boolean {
    const content = this.getRequiredChildElement(this.contentSlot);
    if (content.firstChild === null) {
      const paragraph = JSX.create(this.paragraphType, {}) as HTMLElement;
      if (paragraph.tagName !== 'BR') {
        JSX.append(paragraph, <br />);
      }
      content.appendChild(paragraph);
      this.currentHTML = content.innerHTML;
      if (focused) {
        this.restoreFocus(paragraph);
      }
      return true;
    }
    return false;
  }

  /**
   * Restores any locked node form the specified node list.
   * @param parent Parent node for all nodes in the specified list of removed nodes.
   * @param next Next sibling node of the specified list of removed nodes.
   * @param list List of removed nodes or elements.
   * @returns Returns the number of restored nodes.
   */
  @Class.Private()
  private restoreLockedNodes(parent: Node, next: Node | null, list: NodeList | HTMLCollection): number {
    let total = 0;
    for (let i = list.length - 1; i > -1; --i) {
      const node = list.item(i);
      if (node instanceof HTMLElement) {
        if (this.unremovableMap.has(node)) {
          parent.insertBefore(node, next && next.isConnected ? next : parent.lastChild);
          total++;
        } else {
          total += this.restoreLockedNodes(parent, next, node.children);
        }
      }
    }
    return total;
  }

  /**
   * Remove any denied node for the specified node list.
   * @param list List of added nodes or elements.
   * @returns Returns the number of removed nodes.
   */
  @Class.Private()
  private removeDeniedNodes(list: NodeList | HTMLCollection): number {
    let total = 0;
    for (let i = list.length - 1; i > -1; --i) {
      const node = list.item(i);
      if (node instanceof HTMLElement) {
        if (this.deniedTags.includes(node.tagName)) {
          node.remove();
          total++;
        } else {
          total += this.removeDeniedNodes(node.children);
        }
      }
    }
    return total;
  }

  /**
   * Remove all given CSS properties from the specified list of nodes, when the node becomes without CSS, it will be removed.
   * @param list List of nodes or elements.
   * @param tag Expected tag name.
   * @param properties CSS properties to be cleaned.
   * @returns Returns the number of removed nodes.
   */
  @Class.Private()
  private clearNodes(list: NodeList | HTMLCollection, tag: string, ...properties: string[]): number {
    let total = 0;
    for (let i = list.length - 1; i > -1; --i) {
      const node = list.item(i);
      if (node instanceof HTMLElement) {
        if (node.tagName.toLowerCase() === tag) {
          for (const property of properties) {
            (node.style as any)[property] = null;
          }
          const styles = node.getAttribute('style');
          if (styles === null || styles.length === 0) {
            JSX.unwrap(node);
            total++;
          }
        }
        total += this.clearNodes(node.children, tag, ...properties);
      }
    }
    return total;
  }

  /**
   * Saves the current content changes.
   * @returns Returns true when the content changes was saved, false otherwise.
   */
  @Class.Private()
  private saveChanges(): boolean {
    const content = this.getRequiredChildElement(this.contentSlot);
    if (this.currentHTML !== content.innerHTML) {
      const event = new Event('change', { bubbles: true, cancelable: true });
      if (this.dispatchEvent(event)) {
        this.currentHTML = content.innerHTML;
        this.updateValidation();
        return true;
      } else {
        this.stopContentObserver();
        content.innerHTML = this.currentHTML;
        if ((this.currentMark = content.querySelector<HTMLElement>('[data-swe-editor-selection]'))) {
          this.currentRange = this.restoreFocus(this.currentMark);
        }
        this.startContentObserver();
      }
    }
    return false;
  }

  /**
   * Gets the higher parent element that is connected to the document.
   * @param parent First parent element.
   * @returns Returns the higher parent element that is connected to the document.
   */
  @Class.Private()
  private getConnectedParent(parent: HTMLElement): HTMLElement {
    while (parent && !parent.isConnected) {
      parent = parent.parentElement as HTMLElement;
    }
    return parent;
  }

  /**
   * Content change, event handler.
   * @param records Mutation record list.
   */
  @Class.Private()
  private contentChangeHandler(records: MutationRecord[]): void {
    const content = this.getRequiredChildElement(this.contentSlot);
    const focused = JSX.childOf(content, this.getSelection().focusNode as Node);
    let updated = false;
    this.stopContentObserver();
    for (const record of records) {
      const parent = this.getConnectedParent(record.target as HTMLElement) || content;
      updated = this.restoreLockedNodes(parent, record.nextSibling, record.removedNodes) > 0 || updated;
      updated = this.removeDeniedNodes(record.addedNodes) > 0 || updated;
    }
    if (this.restoreParagraph(focused) || updated) {
      this.currentHTML = content.innerHTML;
      this.updateValidation();
    }
    this.startContentObserver();
  }

  /**
   * Updates the current selection into the new input slot element.
   */
  @Class.Private()
  private contentSlotChangeHandler(): void {
    const content = this.getRequiredChildElement(this.contentSlot);
    content.contentEditable = (!this.readOnly && !this.disabled).toString();
    this.currentHTML = content.innerHTML;
    this.restoreParagraph(JSX.childOf(content, this.getSelection().focusNode as Node));
    this.updateValidation();
    this.clearSelection();
    this.stopContentObserver();
    this.startContentObserver();
  }

  /**
   * Performs a surrounding in the current selection with the specified tag.
   * @param tag Tag name.
   * @returns Returns the affected element instance.
   */
  @Class.Private()
  private performSurrounding(tag: string): HTMLElement {
    this.focus();
    const selection = this.getSelection();
    const range = selection.getRangeAt(0);
    let element;
    if (range.startContainer instanceof HTMLElement && range.startContainer.tagName.toLowerCase() === tag) {
      element = range.startContainer;
    } else if (range.endContainer instanceof HTMLElement && range.endContainer.tagName.toLowerCase() === tag) {
      element = range.endContainer;
    }
    if (!element) {
      const newer = document.createRange();
      range.surroundContents((element = JSX.create(tag, {}) as HTMLElement));
      newer.selectNodeContents(element);
      selection.removeRange(range);
      selection.addRange(newer);
    }
    return element;
  }

  /**
   * Performs the specified command with the given value.
   * @param name Command name.
   * @param value Command value.
   * @returns Returns the affected element instance.
   */
  @Class.Private()
  private performCommand(name: string, value?: any): HTMLElement {
    this.focus();
    const selection = this.getSelection();
    document.execCommand(name, false, value);
    this.saveChanges();
    return (selection.focusNode as Node).parentElement as HTMLElement;
  }

  /**
   * Default constructor.
   */
  constructor() {
    super();
    JSX.append(this.attachShadow({ mode: 'closed' }), this.editorStyles, this.editorLayout);
    this.contentSlot.addEventListener('keyup', this.saveChanges.bind(this), true);
    this.contentSlot.addEventListener('focus', this.restoreSelection.bind(this), true);
    this.contentSlot.addEventListener('mousedown', this.clearSelection.bind(this), true);
    this.contentSlot.addEventListener('mouseup', this.saveSelectionRange.bind(this), true);
    this.contentSlot.addEventListener('blur', this.wrapSelectionRange.bind(this), true);
    this.paragraphType = 'p';
  }

  /**
   * Determines whether the element is empty or not.
   */
  @Class.Public()
  public get empty(): boolean {
    return this.getRequiredChildElement(this.contentSlot).innerText.length === 0;
  }

  /**
   * Gets the element name.
   */
  @Class.Public()
  public get name(): string {
    return this.getAttribute('name') || '';
  }

  /**
   * Sets the element name.
   */
  public set name(name: string) {
    this.setAttribute('name', name);
  }

  /**
   * Gets the element value.
   */
  @Class.Public()
  public get value(): string {
    return Helper.buildHTMLNodes(this.getRequiredChildElement(this.contentSlot).childNodes, this.ignoredMap);
  }

  /**
   * Sets the element value.
   */
  public set value(value: string) {
    const content = this.getRequiredChildElement(this.contentSlot);
    const focused = JSX.childOf(content, this.getSelection().focusNode as Node);
    this.currentHTML = content.innerHTML = value || '';
    this.restoreParagraph(focused);
    this.updateValidation();
    this.clearSelection();
  }

  /**
   * Default value for resets.
   */
  @Class.Public()
  public defaultValue = '';

  /**
   * Gets the required state of the element.
   */
  @Class.Public()
  public get required(): boolean {
    return this.hasAttribute('required');
  }

  /**
   * Sets the required state of the element.
   */
  public set required(state: boolean) {
    this.updatePropertyState('required', state);
    this.updateValidation();
  }

  /**
   * Gets the read-only state of the element.
   */
  @Class.Public()
  public get readOnly(): boolean {
    return this.hasAttribute('readonly');
  }

  /**
   * Sets the read-only state of the element.
   */
  public set readOnly(state: boolean) {
    this.updatePropertyState('readonly', state);
    this.getRequiredChildElement(this.contentSlot).contentEditable = (!(state || this.disabled)).toString();
  }

  /**
   * Gets the disabled state of the element.
   */
  @Class.Public()
  public get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  /**
   * Sets the disabled state of the element.
   */
  public set disabled(state: boolean) {
    this.updatePropertyState('disabled', state);
    this.getRequiredChildElement(this.contentSlot).contentEditable = (!(state || this.readOnly)).toString();
  }

  /**
   * Gets the preserve selection state.
   */
  @Class.Public()
  public get preserveSelection(): boolean {
    return this.hasAttribute('preserveselection');
  }

  /**
   * Sets the preserve selection state.
   */
  public set preserveSelection(state: boolean) {
    if (!state) {
      this.unwrapSelectionRange();
    }
    this.updatePropertyState('preserveselection', state);
  }

  /**
   * Gets the paragraph type.
   */
  @Class.Public()
  public get paragraphType(): string {
    return document.queryCommandValue('defaultParagraphSeparator');
  }

  /**
   * Sets the paragraph type.
   */
  public set paragraphType(type: string) {
    document.execCommand('defaultParagraphSeparator', false, type.toLowerCase());
  }

  /**
   * Gets the denied tag list.
   */
  @Class.Public()
  public get deniedTags(): string[] {
    return this.deniedTagList;
  }

  /**
   * Sets the denied tag list.
   */
  public set deniedTags(tags: string[]) {
    const content = this.getRequiredChildElement(this.contentSlot);
    this.deniedTagList = tags.map((tag: string) => tag.toLowerCase());
    if (this.removeDeniedNodes(content.children) > 0) {
      this.saveChanges();
    }
  }

  /**
   * Gets the element orientation.
   */
  @Class.Public()
  public get orientation(): string {
    return this.getAttribute('orientation') || 'row';
  }

  /**
   * Sets the element orientation.
   */
  public set orientation(orientation: string) {
    this.setAttribute('orientation', orientation);
  }

  /**
   * Gets the selected range.
   */
  @Class.Public()
  public get selectedRange(): Range | undefined {
    return this.currentRange;
  }

  /**
   * Gets the selected text.
   */
  @Class.Public()
  public get selectedText(): string | undefined {
    if (this.currentRange) {
      return this.currentRange.cloneContents().textContent || '';
    }
    return void 0;
  }

  /**
   * Gets the selected HTML.
   */
  @Class.Public()
  public get selectedHTML(): string | undefined {
    if (this.currentRange) {
      return Helper.buildHTMLNodes(this.currentRange.cloneContents().childNodes, this.ignoredMap);
    }
    return void 0;
  }

  /**
   * Gets the selected styles.
   */
  @Class.Public()
  public get selectedStyles(): Styles {
    const selection = window.getSelection() as Selection;
    const styles = { ...Settings.defaultStyles };
    if (selection.focusNode) {
      const content = this.getRequiredChildElement(this.contentSlot);
      let current = selection.focusNode;
      styles.zoom = parseFloat(this.contentSlot.style.zoom || '1.0');
      while (current && current !== content) {
        if (current instanceof HTMLElement) {
          Helper.collectStylesByElement(styles, current);
          Helper.collectStylesByCSS(styles, window.getComputedStyle(current));
        }
        current = current.parentElement as HTMLElement;
      }
    }
    return styles;
  }

  /**
   * Sets the removal state for the specified element.
   * @param element Element instance.
   * @param state Determines whether the element can be removed by the user or not.
   * @param locker Locker object, should be used to unlock the element.
   * @throws Throws an error when the specified locker for the element is invalid.
   */
  @Class.Public()
  public setRemovalState(element: HTMLElement, state: boolean, locker: any = null): void {
    const entry = this.unremovableMap.get(element);
    if (state) {
      if (entry !== locker) {
        throw new Error(`Element doesn't found or invalid locker argument.`);
      }
      this.unremovableMap.delete(element);
    } else {
      if (entry && entry !== locker) {
        throw new Error(`Element already locked by another locker.`);
      }
      this.unremovableMap.set(element, locker);
    }
  }

  /**
   * Sets the rendering state of the specified node.
   * @param node Node instance.
   * @param state Determines whether the node should be ignored by the renderer or not.
   * @param children Determines whether the node children should be affected or not.
   */
  @Class.Public()
  public setRenderingState(node: Node, state: boolean, children?: boolean): void {
    if (state) {
      this.ignoredMap.delete(node);
    } else {
      this.ignoredMap.set(node, children || false);
    }
  }

  /**
   * Clears the current selection.
   */
  @Class.Public()
  public clearSelection(): void {
    this.unwrapSelectionRange();
    this.removeSelectionRange();
  }

  /**
   * Move the focus to this element.
   */
  @Class.Public()
  public focus(): void {
    this.unwrapSelectionRange();
    this.callRequiredChildMethod(this.contentSlot, 'focus', []);
    this.restoreSelectionRange();
  }

  /**
   * Reset the element value to its initial value.
   */
  @Class.Public()
  public reset(): void {
    const content = this.getRequiredChildElement(this.contentSlot);
    const focused = JSX.childOf(content, this.getSelection().focusNode as Node);
    this.currentHTML = content.innerHTML = this.defaultValue || '';
    this.restoreParagraph(focused);
    this.updateValidation();
    this.clearSelection();
  }

  /**
   * Checks the element validity.
   * @returns Returns true when the element is valid, false otherwise.
   */
  @Class.Public()
  public checkValidity(): boolean {
    return !this.required || (this.value !== void 0 && this.value.length !== 0);
  }

  /**
   * Formats the specified font name for the selection or at the insertion point.
   * @param name Font name.
   */
  @Class.Public()
  public fontNameAction(name: string): void {
    const element = this.performSurrounding('span');
    this.clearNodes(element.children, 'span', 'fontFamily');
    this.saveChanges();
    element.style.fontFamily = name;
    element.normalize();
  }

  /**
   * Formats the specified font size for the selection or at the insertion point.
   * @param size Font size.
   */
  @Class.Public()
  public fontSizeAction(size: string): void {
    const element = this.performSurrounding('span');
    this.clearNodes(element.children, 'span', 'fontSize');
    this.saveChanges();
    element.style.fontSize = size;
    element.normalize();
  }

  /**
   * Formats the specified font color for the selection or at the insertion point.
   * @param color Font color.
   */
  @Class.Public()
  public fontColorAction(color: string): void {
    const element = this.performSurrounding('span');
    this.clearNodes(element.children, 'span', 'color');
    this.saveChanges();
    element.style.color = color;
    element.normalize();
  }

  /**
   * Change line height for the selection or at the insertion point.
   * @param height Line height.
   */
  @Class.Public()
  public lineHeightAction(height: string): void {
    const element = this.performSurrounding('p');
    this.saveChanges();
    element.style.lineHeight = height;
  }

  /**
   * Formats the specified tag from the selection or insertion point.
   * @param tag HTML tag.
   */
  @Class.Public()
  public formatAction(tag: string): void {
    this.performCommand('formatBlock', tag);
  }

  /**
   * Undoes the last executed command.
   */
  @Class.Public()
  public undoAction(): void {
    this.performCommand('undo');
  }

  /**
   * Redoes the previous undo command.
   */
  @Class.Public()
  public redoAction(): void {
    this.performCommand('redo');
  }

  /**
   * Toggles bold on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public boldAction(): void {
    this.performCommand('bold');
  }

  /**
   * Toggles italics on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public italicAction(): void {
    this.performCommand('italic');
  }

  /**
   * Toggles underline on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public underlineAction(): void {
    this.performCommand('underline');
  }

  /**
   * Toggles strikeThrough on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public strikeThroughAction(): void {
    this.performCommand('strikeThrough');
  }

  /**
   * Creates a bulleted unordered list for the selection or at the insertion point.
   */
  @Class.Public()
  public unorderedListAction(): void {
    this.performCommand('insertUnorderedList');
  }

  /**
   * Creates a numbered ordered list for the selection or at the insertion point.
   */
  @Class.Public()
  public orderedListAction(): void {
    this.performCommand('insertOrderedList');
  }

  /**
   * Justifies the selection or insertion point to the left.
   */
  @Class.Public()
  public alignLeftAction(): void {
    this.performCommand('justifyLeft');
  }

  /**
   * Justifies the selection or insertion point to the center.
   */
  @Class.Public()
  public alignCenterAction(): void {
    this.performCommand('justifyCenter');
  }

  /**
   * Justifies the selection or insertion point to the right.
   */
  @Class.Public()
  public alignRightAction(): void {
    this.performCommand('justifyRight');
  }

  /**
   * Justifies the selection or insertion point.
   */
  @Class.Public()
  public alignJustifyAction(): void {
    this.performCommand('justifyFull');
  }

  /**
   * Outdents the line containing the selection or insertion point.
   */
  @Class.Public()
  public outdentAction(): void {
    this.performCommand('outdent');
  }

  /**
   * Indents the line containing the selection or insertion point.
   */
  @Class.Public()
  public indentAction(): void {
    this.performCommand('indent');
  }

  /**
   * Removes the current selection and copies it to the clipboard.
   */
  @Class.Public()
  public cutAction(): void {
    this.performCommand('cut');
  }

  /**
   * Copies the current selection to the clipboard.
   */
  @Class.Public()
  public copyAction(): void {
    this.performCommand('copy');
  }

  /**
   * Pastes the clipboard contents at the insertion point.
   */
  @Class.Public()
  public pasteAction(): void {
    this.performCommand('paste');
  }

  /**
   * Sets a new zoom into the content element.
   */
  @Class.Public()
  public zoomAction(zoom: number): void {
    this.contentSlot.style.zoom = zoom.toFixed(2);
  }
}
