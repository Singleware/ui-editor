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
    fontColor: void 0
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
   * Cached HTML content.
   */
  @Class.Private()
  private cachedHTML = '';

  /**
   * Content observer.
   */
  @Class.Private()
  private observer = new MutationObserver(this.mutationHandler.bind(this));

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
   * Update all validation attributes.
   */
  @Class.Private()
  private updateValidation(): void {
    this.updatePropertyState('empty', this.empty);
    this.updatePropertyState('invalid', !this.empty && !this.checkValidity());
  }

  /**
   * Performs the specified command with the given value.
   * @param commandId Command to be performed
   * @param value Command value.
   */
  @Class.Private()
  private performAction(commandId: string, value?: any): void {
    this.focus();
    document.execCommand(commandId, false, value);
  }

  /**
   * Performs the specified command with the given value using CSS styles.
   * @param commandId Command to be performed
   * @param value Command value.
   */
  @Class.Private()
  private performActionWithCSS(commandId: string, value?: any): void {
    const status = document.queryCommandState('styleWithCSS');
    document.execCommand('styleWithCSS', false, true as any);
    this.performAction(commandId, value);
    document.execCommand('styleWithCSS', false, status as any);
  }

  /**
   * Filters the specified list to remove any denied node.
   * @param list List of nodes or elements.
   * @returns Returns the number of removed nodes.
   */
  @Class.Private()
  private removeDeniedNodes(list: NodeList | HTMLCollection): number {
    let total = 0;
    for (const item of list) {
      if (item instanceof HTMLElement) {
        if (this.deniedTags.includes(item.tagName)) {
          item.remove();
          total++;
        } else {
          total += this.removeDeniedNodes(item.children);
        }
      }
    }
    return total;
  }

  /**
   * Mutation handler.
   * @param records Mutation record list.
   */
  @Class.Private()
  private mutationHandler(records: MutationRecord[]): void {
    const content = this.getRequiredChildElement(this.contentSlot);
    let changed = false;
    for (const record of records) {
      if (record.target === content || (record.target instanceof HTMLElement && JSX.childOf(content, record.target))) {
        if (this.removeDeniedNodes(record.addedNodes) > 0) {
          changed = true;
        }
      }
    }
    if (changed) {
      this.cachedHTML = content.innerHTML;
      this.updateValidation();
    }
  }

  /**
   * Content focus handler.
   */
  @Class.Private()
  private contentFocusHandler(): void {
    const content = this.getRequiredChildElement(this.contentSlot);
    if (content.childNodes.length === 0 && this.paragraphTag !== 'br') {
      const selection = window.getSelection();
      const range = document.createRange();
      JSX.append(content, JSX.create(this.paragraphTag, {}, JSX.create('br', {})));
      range.setStart(content.firstChild as HTMLElement, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Content change handler.
   */
  @Class.Private()
  private contentChangeHandler(): void {
    const content = this.getRequiredChildElement(this.contentSlot);
    if (this.cachedHTML !== content.innerHTML) {
      const event = new Event('change', { bubbles: true, cancelable: true });
      if (this.dispatchEvent(event)) {
        this.cachedHTML = content.innerHTML;
      } else {
        content.innerHTML = this.cachedHTML;
      }
    }
  }

  /**
   * Updates the current selection into the new input slot element.
   */
  @Class.Private()
  private contentSlotChangeHandler(): void {
    const content = this.getRequiredChildElement(this.contentSlot);
    content.contentEditable = (!this.readOnly && !this.disabled).toString();
    this.cachedHTML = content.innerHTML;
    this.updateValidation();
  }

  /**
   * Default constructor.
   */
  constructor() {
    super();
    JSX.append(this.attachShadow({ mode: 'closed' }), this.editorStyles, this.editorLayout);
    this.observer.observe(Class.resolve(this), { childList: true, subtree: true });
    this.contentSlot.addEventListener('focus', this.contentFocusHandler.bind(this), true);
    this.contentSlot.addEventListener('keyup', this.contentChangeHandler.bind(this), true);
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
    const content = this.getRequiredChildElement(this.contentSlot);
    content.innerHTML = this.cachedHTML = value || '';
    this.updateValidation();
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
    const content = this.getRequiredChildElement(this.contentSlot);
    content.contentEditable = (!(state || this.disabled)).toString();
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
    const content = this.getRequiredChildElement(this.contentSlot);
    content.contentEditable = (!(state || this.readOnly)).toString();
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
    if (this.removeDeniedNodes(content.children) > 0) {
      this.cachedHTML = content.innerHTML;
      this.updateValidation();
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
   * Formats the specified tag from the selection or insertion point.
   * @param tag HTML tag.
   */
  @Class.Public()
  public formatAction(tag: string): void {
    this.performAction('formatBlock', tag);
  }

  /**
   * Formats the specified font name for the selection or at the insertion point.
   * @param name Font name.
   */
  @Class.Public()
  public fontNameAction(name: string): void {
    this.performActionWithCSS('fontName', name);
  }

  /**
   * Formats the specified font size for the selection or at the insertion point.
   * @param size Font size.
   */
  @Class.Public()
  public fontSizeAction(size: string): void {
    this.performActionWithCSS('fontSize', size);
  }

  /**
   * Formats the specified font color for the selection or at the insertion point.
   * @param color Font color.
   */
  @Class.Public()
  public fontColorAction(color: string): void {
    this.performActionWithCSS('foreColor', color);
  }

  /**
   * Undoes the last executed command.
   */
  @Class.Public()
  public undoAction(): void {
    this.performAction('undo');
  }

  /**
   * Redoes the previous undo command.
   */
  @Class.Public()
  public redoAction(): void {
    this.performAction('redo');
  }

  /**
   * Toggles bold on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public boldAction(): void {
    this.performAction('bold');
  }

  /**
   * Toggles italics on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public italicAction(): void {
    this.performAction('italic');
  }

  /**
   * Toggles underline on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public underlineAction(): void {
    this.performAction('underline');
  }

  /**
   * Toggles strikeThrough on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public strikeThroughAction(): void {
    this.performAction('strikeThrough');
  }

  /**
   * Creates a bulleted unordered list for the selection or at the insertion point.
   */
  @Class.Public()
  public unorderedListAction(): void {
    this.performAction('insertUnorderedList');
  }

  /**
   * Creates a numbered ordered list for the selection or at the insertion point.
   */
  @Class.Public()
  public orderedListAction(): void {
    this.performAction('insertOrderedList');
  }

  /**
   * Justifies the selection or insertion point to the left.
   */
  @Class.Public()
  public alignLeftAction(): void {
    this.performAction('justifyLeft');
  }

  /**
   * Justifies the selection or insertion point to the center.
   */
  @Class.Public()
  public alignCenterAction(): void {
    this.performAction('justifyCenter');
  }

  /**
   * Justifies the selection or insertion point to the right.
   */
  @Class.Public()
  public alignRightAction(): void {
    this.performAction('justifyRight');
  }

  /**
   * Justifies the selection or insertion point.
   */
  @Class.Public()
  public alignJustifyAction(): void {
    this.performAction('justifyFull');
  }

  /**
   * Outdents the line containing the selection or insertion point.
   */
  @Class.Public()
  public outdentAction(): void {
    this.performAction('outdent');
  }

  /**
   * Indents the line containing the selection or insertion point.
   */
  @Class.Public()
  public indentAction(): void {
    this.performAction('indent');
  }

  /**
   * Removes the current selection and copies it to the clipboard.
   */
  @Class.Public()
  public cutAction(): void {
    this.performAction('cut');
  }

  /**
   * Copies the current selection to the clipboard.
   */
  @Class.Public()
  public copyAction(): void {
    this.performAction('copy');
  }

  /**
   * Pastes the clipboard contents at the insertion point.
   */
  @Class.Public()
  public pasteAction(): void {
    this.performAction('paste');
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
    this.callRequiredChildMethod(this.contentSlot, 'focus', []);
  }

  /**
   * Reset the element value to its initial value.
   */
  @Class.Public()
  public reset(): void {
    const content = this.getRequiredChildElement(this.contentSlot);
    content.innerHTML = this.cachedHTML = this.defaultValue || '';
    this.updateValidation();
  }

  /**
   * Checks the element validity.
   * @returns Returns true when the element is valid, false otherwise.
   */
  @Class.Public()
  public checkValidity(): boolean {
    return !this.required || (this.value !== void 0 && this.value.length !== 0);
  }
}
