/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as JSX from '@singleware/jsx';
import * as Control from '@singleware/ui-control';

import { Stylesheet } from './stylesheet';
import { Styles } from './styles';

/**
 * Editor element.
 */
@JSX.Describe('swe-editor')
@Class.Describe()
export class Element extends Control.Element {
  /**
   * Default styles.
   */
  @Class.Private()
  private static defaultStyles = {
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
    fontName: void 0,
    fontSize: void 0,
    fontColor: void 0,
    lineHeight: void 0,
    zoom: 1.0
  } as Styles;

  /**
   * Map of style keys by element name.
   */
  @Class.Private()
  private static stylesByElementName = {
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
    font: [
      {
        target: 'faceName',
        source: 'face'
      },
      {
        target: 'fontSize',
        source: 'size'
      },
      {
        target: 'fontColor',
        source: 'color'
      }
    ]
  } as any;

  /**
   * Map of styles by CSS declaration.
   */
  @Class.Private()
  private static stylesByCSSDeclaration = {
    textAlign: {
      mapping: {
        left: 'alignLeft',
        center: 'alignCenter',
        right: 'alignRight',
        justify: 'alignJustify'
      }
    },
    lineHeight: {
      target: 'lineHeight'
    },
    fontSize: {
      target: 'fontSize'
    },
    fontFamily: {
      target: 'fontName'
    },
    color: {
      target: 'fontColor'
    }
  } as any;

  /**
   * Collect all styles by its respective CSS declaration.
   * @param styles Styles map.
   * @param declarations CSS declarations.
   */
  @Class.Private()
  private static collectStylesByCSS(styles: Styles, declarations: CSSStyleDeclaration): void {
    let style, property;
    for (const entry in this.stylesByCSSDeclaration) {
      if ((style = this.stylesByCSSDeclaration[entry])) {
        if (style.target) {
          if ((styles as any)[style.target] === void 0) {
            (styles as any)[style.target] = (declarations as any)[entry];
          }
        } else if (style.mapping) {
          if ((property = style.mapping[(declarations as any)[entry]])) {
            (styles as any)[property] = true;
          }
        }
      }
    }
  }

  /**
   * Collect all styles by its respective element name.
   * @param styles Styles map.
   * @param element HTML element.
   */
  @Class.Private()
  private static collectStylesByElement(styles: Styles, element: HTMLElement): void {
    const entries = this.stylesByElementName[element.tagName.toLowerCase()] || [];
    for (const entry of entries) {
      if (entry && entry.target) {
        if (entry.source) {
          if ((styles as any)[entry.target] === void 0 && element.hasAttribute(entry.source)) {
            (styles as any)[entry.target] = element.getAttribute(entry.source);
          }
        } else {
          (styles as any)[entry.target] = true;
        }
      }
    }
  }

  /**
   * List of denied tags in the editor.
   */
  @Class.Private()
  private deniedTagList = [
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
  ];

  /**
   * Saved selection range.
   */
  @Class.Private()
  private selectionRange?: Range;

  /**
   * Saved selection element.
   */
  @Class.Private()
  private selectionElement?: HTMLElement;

  /**
   * Cached HTML content.
   */
  @Class.Private()
  private cachedHTML = '';

  /**
   * Content observer.
   */
  @Class.Private()
  private observer = new MutationObserver(this.contentChangeHandler.bind(this));

  /**
   * Map of locked nodes.
   */
  @Class.Private()
  private lockedMap = new WeakMap<Node, any>();

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
  private contentSlot = (
    <slot name="content" class="content" style="zoom:1.0" onSlotChange={this.contentSlotChangeHandler.bind(this)} />
  ) as HTMLSlotElement;

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
  private updateContentValidation(): void {
    this.updatePropertyState('empty', this.empty);
    this.updatePropertyState('invalid', !this.empty && !this.checkValidity());
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
   * Unwraps the specified element.
   * @param element Element instance.
   */
  @Class.Private()
  private unwrapElement(element: HTMLElement): void {
    const parent = element.parentNode;
    if (parent) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
    }
    element.remove();
  }

  /**
   * Saves the current selection range and wraps into a new selection element.
   */
  @Class.Private()
  private saveSelection(): void {
    if (this.preserveSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0 && !(this.selectionRange = selection.getRangeAt(0)).collapsed) {
        this.selectionElement = <mark class="selection">{this.selectionRange.extractContents()}</mark> as HTMLElement;
        this.stopContentObserver();
        this.selectionRange.insertNode(this.selectionElement);
        this.startContentObserver();
      }
    }
  }

  /**
   * Unwraps the previous saved selection element.
   */
  @Class.Private()
  private unwrapSelection(): void {
    if (this.preserveSelection && this.selectionElement) {
      this.stopContentObserver();
      this.unwrapElement(this.selectionElement);
      this.startContentObserver();
      this.selectionElement = void 0;
    }
  }

  /**
   * Clears the previously saved selection.
   */
  @Class.Private()
  private clearSelection(): void {
    if (this.preserveSelection) {
      this.selectionElement = void 0;
      this.selectionRange = void 0;
    }
  }

  /**
   * Restores the previous saved selection range.
   */
  @Class.Private()
  private restoreSelection(): void {
    if (this.preserveSelection && this.selectionRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.selectionRange);
      this.selectionRange = void 0;
    }
  }

  /**
   * Remove any denied node for the specified node list.
   * @param list List of added nodes or elements.
   * @returns Returns the number of removed nodes.
   */
  @Class.Private()
  private clearDeniedNodes(list: NodeList | HTMLCollection): number {
    let total = 0;
    for (let i = list.length - 1; i > -1; --i) {
      const node = list.item(i);
      if (node instanceof HTMLElement) {
        if (this.deniedTags.includes(node.tagName)) {
          node.remove();
          total++;
        } else {
          total += this.clearDeniedNodes(node.children);
        }
      }
    }
    return total;
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
        if (this.lockedMap.has(node)) {
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
   * Saves the current content changes.
   * @returns Returns true when the content changes was saved, false otherwise.
   */
  @Class.Private()
  private saveContentChanges(): boolean {
    const content = this.getRequiredChildElement(this.contentSlot);
    if (this.cachedHTML !== content.innerHTML) {
      const event = new Event('change', { bubbles: true, cancelable: true });
      if (this.dispatchEvent(event)) {
        this.cachedHTML = content.innerHTML;
        this.updateContentValidation();
        return true;
      } else {
        this.stopContentObserver();
        content.innerHTML = this.cachedHTML;
        this.startContentObserver();
      }
    }
    return false;
  }

  /**
   * Remove any element that corresponds to the specified tag name and an empty style attribute.
   * @param list List of nodes or elements.
   * @param tag Expected tag name.
   * @param properties CSS properties to be cleaned.
   * @returns Returns the number of removed nodes.
   */
  @Class.Private()
  private clearElement(list: NodeList | HTMLCollection, tag: string, ...properties: string[]): number {
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
            this.unwrapElement(node);
            total++;
          }
        }
        total += this.clearElement(node.children, tag, ...properties);
      }
    }
    return total;
  }

  /**
   * Performs a surrounding in the current selection with the specified tag.
   * @param tag Tag name.
   * @returns Returns the affected element instance.
   * @throws Throws an error when there is no selection.
   */
  @Class.Private()
  private performSurrounding(tag: string): HTMLElement {
    this.focus();
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
      throw new Error(`There is no selected text.`);
    }
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
    const selection = window.getSelection();
    document.execCommand(name, false, value);
    this.saveContentChanges();
    return selection.focusNode.parentElement as HTMLElement;
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
    let updated = false;
    this.stopContentObserver();
    for (const record of records) {
      const parent = this.getConnectedParent(record.target as HTMLElement) || content;
      updated = this.restoreLockedNodes(parent, record.nextSibling, record.removedNodes) > 0 || updated;
      updated = this.clearDeniedNodes(record.addedNodes) > 0 || updated;
    }
    if (updated) {
      this.cachedHTML = content.innerHTML;
      this.updateContentValidation();
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
    this.cachedHTML = content.innerHTML;
    this.clearSelection();
    this.stopContentObserver();
    this.startContentObserver();
    this.updateContentValidation();
  }

  /**
   * Default constructor.
   */
  constructor() {
    super();
    JSX.append(this.attachShadow({ mode: 'closed' }), this.editorStyles, this.editorLayout);
    this.contentSlot.addEventListener('focus', this.unwrapSelection.bind(this), true);
    this.contentSlot.addEventListener('keyup', this.saveContentChanges.bind(this), true);
    this.contentSlot.addEventListener('blur', this.saveSelection.bind(this), true);
    this.paragraphTag = 'p';
  }

  /**
   * Determines whether the element is empty or not.
   */
  @Class.Public()
  public get empty(): boolean {
    return this.cachedHTML.length === 0;
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
    return this.cachedHTML;
  }

  /**
   * Sets the element value.
   */
  public set value(value: string) {
    this.clearSelection();
    this.getRequiredChildElement(this.contentSlot).innerHTML = this.cachedHTML = value || '';
    this.updateContentValidation();
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
    this.updateContentValidation();
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
    this.updatePropertyState('preserveselection', state);
  }

  /**
   * Gets the paragraph tag.
   */
  @Class.Public()
  public get paragraphTag(): string {
    return document.queryCommandValue('defaultParagraphSeparator');
  }

  /**
   * Sets the paragraph tag.
   */
  public set paragraphTag(tag: string) {
    document.execCommand('defaultParagraphSeparator', false, tag.toLowerCase());
  }

  /**
   * Gets the denied tag list.
   */
  @Class.Public()
  public get deniedTags(): string[] {
    return this.deniedTagList;
  }

  /**
   * Set HTML denied tags.
   */
  public set deniedTags(tags: string[]) {
    const content = this.getRequiredChildElement(this.contentSlot);
    this.deniedTagList = tags.map((tag: string) => tag.toLowerCase());
    if (this.clearDeniedNodes(content.children) > 0) {
      this.saveContentChanges();
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
   * Locks the specified element, locked elements can't be affected by user actions in the editor.
   * @param element Element that will be locked.
   * @param locker Locker object, must be used to unlock the element.
   * @throws Throws an error when the element is already locked.
   */
  @Class.Public()
  public lockElement(element: HTMLElement, locker: any = null): void {
    if (this.lockedMap.has(element)) {
      throw new Error(`The specified element is already locked.`);
    }
    this.lockedMap.set(element, locker);
  }

  /**
   * Unlocks the specified element, unlocked elements can be affected by user actions in the editor.
   * @param element Element that will be unlocked.
   * @param locker Locked object used to lock the following element.
   * @throws Throws an error when the element doesn't found or if the specified locked is invalid.
   */
  @Class.Public()
  public unlockElement(element: HTMLElement, locker: any = null): void {
    const entry = this.lockedMap.get(element);
    if (entry !== locker) {
      throw new Error(`Element doesn't found or invalid locker argument.`);
    }
    this.lockedMap.delete(element);
  }

  /**
   * Gets the active styles from the specified node.
   * @param node Element node.
   * @param map Predefined styles map.
   * @returns Returns the active styles map.
   */
  @Class.Public()
  public getStyles(node: Node, map?: Styles): Styles {
    const content = this.getRequiredChildElement(this.contentSlot);
    const styles = map || { ...Element.defaultStyles };
    styles.zoom = parseFloat(this.contentSlot.style.zoom || '1.0');
    while (node && node !== content) {
      if (node instanceof HTMLElement) {
        Element.collectStylesByElement(styles, node);
        Element.collectStylesByCSS(styles, window.getComputedStyle(node));
      }
      node = node.parentElement as HTMLElement;
    }
    return styles;
  }

  /**
   * Gets the active styles map from the focused node.
   * @returns Returns the active styles map.
   */
  @Class.Public()
  public getCurrentStyles(): Styles {
    const selection = window.getSelection();
    const styles = { ...Element.defaultStyles };
    if (selection.rangeCount) {
      this.getStyles(selection.focusNode, styles);
    }
    return styles;
  }

  /**
   * Move the focus to this element.
   */
  @Class.Public()
  public focus(): void {
    this.unwrapSelection();
    this.callRequiredChildMethod(this.contentSlot, 'focus', []);
    this.restoreSelection();
  }

  /**
   * Reset the element value to its initial value.
   */
  @Class.Public()
  public reset(): void {
    this.clearSelection();
    this.getRequiredChildElement(this.contentSlot).innerHTML = this.cachedHTML = this.defaultValue || '';
    this.updateContentValidation();
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
    this.clearElement(element.children, 'span', 'fontFamily');
    this.saveContentChanges();
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
    this.clearElement(element.children, 'span', 'fontSize');
    this.saveContentChanges();
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
    this.clearElement(element.children, 'span', 'color');
    this.saveContentChanges();
    element.style.color = color;
    element.normalize();
  }

  /**
   * Formats the specified line height for the selection or at the insertion point.
   * @param height Line height.
   */
  @Class.Public()
  public lineHeightAction(height: string): void {
    const element = this.performSurrounding('p');
    this.saveContentChanges();
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
