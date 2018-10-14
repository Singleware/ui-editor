/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as DOM from '@singleware/jsx';
import * as Control from '@singleware/ui-control';

import { Properties } from './properties';
import { Element } from './element';
import { States } from './states';
import { Styles } from './styles';

/**
 * Editor template class.
 */
@Class.Describe()
export class Template extends Control.Component<Properties> {
  /**
   * Editor states.
   */
  @Class.Private()
  private states = {
    name: '',
    value: '',
    required: false,
    disabled: false,
    deniedTags: [
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
    ]
  } as States;

  /**
   * Mutation observer.
   */
  @Class.Private()
  private elementObserver = new MutationObserver(this.mutationHandler.bind(this));

  /**
   * Toolbar element.
   */
  @Class.Private()
  private toolbarSlot = <slot name="toolbar" class="toolbar" /> as HTMLSlotElement;

  /**
   * Content element.
   */
  @Class.Private()
  private contentSlot = <slot name="content" class="content" /> as HTMLSlotElement;

  /**
   * Wrapper element.
   */
  @Class.Private()
  private wrapper = (
    <div class="wrapper">
      {this.toolbarSlot}
      {this.contentSlot}
    </div>
  ) as HTMLDivElement;

  /**
   * Editor styles.
   */
  @Class.Private()
  private styles = (
    <style>
      {`:host > .wrapper {
  display: flex;
  width: inherit;
  height: inherit;
}
:host([data-orientation='row']) > .wrapper {
  flex-direction: row;
}
:host > .wrapper,
:host([data-orientation='column']) > .wrapper {
  flex-direction: column;
}
:host > .wrapper > .toolbar {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  width: inherit;
}
:host([data-orientation='row']) > .wrapper > .toolbar {
  flex-direction: row;
}
:host > .wrapper > .toolbar
:host([data-orientation='column']) > .wrapper > .toolbar {
  flex-direction: column;
}
:host > .wrapper > .content,
:host > .wrapper > .content::slotted(*) {
  width: inherit;
  height: inherit;
}
:host > .wrapper > .content::slotted(*) {
  display: block;
  position: relative;
  overflow: auto;
}`}
    </style>
  ) as HTMLStyleElement;

  /**
   * Editor skeleton.
   */
  @Class.Private()
  private skeleton = (
    <div slot={this.properties.slot} class={this.properties.class}>
      {this.children}
    </div>
  ) as Element;

  /**
   * Gets the content element.
   */
  @Class.Private()
  private getContentElement(): HTMLElement {
    const content = Control.getChildByProperty(this.contentSlot, 'contentEditable');
    if (!content) {
      throw new Error(`There is no content element assigned.`);
    }
    return content;
  }

  /**
   * Filters the specified node list to remove any denied node.
   * @param nodes Node list.
   */
  @Class.Private()
  private removeDeniedNodes(nodes: NodeList): void {
    for (const node of nodes) {
      if (node instanceof HTMLElement && this.deniedTags.includes(node.tagName)) {
        node.remove();
      }
    }
  }

  /**
   * Mutation handler.
   * @param records Mutation record list.
   */
  @Class.Private()
  private mutationHandler(records: MutationRecord[]): void {
    const content = this.getContentElement();
    for (const record of records) {
      if (record.target === content || (record.target instanceof HTMLElement && Template.isChildOf(record.target, content))) {
        this.removeDeniedNodes(record.addedNodes);
      }
    }
  }

  /**
   * Content focus handler.
   */
  @Class.Private()
  private focusHandler(): void {
    const content = this.getContentElement();
    if (content.childNodes.length === 0 && this.paragraphTag !== 'br') {
      const range = document.createRange();
      const selection = window.getSelection();
      DOM.append(content, DOM.create(this.paragraphTag, {}, DOM.create('br', {})));
      range.setStart(content.firstChild as HTMLParagraphElement, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  /**
   * Content change handler.
   */
  @Class.Private()
  private changeHandler(): void {
    const content = this.getContentElement();
    content.normalize();
    if (this.states.value !== content.innerHTML) {
      this.states.value = content.innerHTML;
      this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
    }
  }

  /**
   * Bind event handlers to update the custom element.
   */
  @Class.Private()
  private bindHandlers(): void {
    this.elementObserver.observe(this.skeleton, { childList: true, subtree: true });
    this.skeleton.addEventListener('focus', this.focusHandler.bind(this), true);
    this.skeleton.addEventListener('keyup', this.changeHandler.bind(this), true);
  }

  /**
   * Bind exposed properties to the custom element.
   */
  @Class.Private()
  private bindProperties(): void {
    this.bindComponentProperties(this.skeleton, [
      'name',
      'value',
      'required',
      'readOnly',
      'disabled',
      'paragraphTag',
      'deniedTags',
      'orientation',
      'formatAction',
      'undoAction',
      'redoAction',
      'boldAction',
      'italicAction',
      'underlineAction',
      'strikeThroughAction',
      'unorderedListAction',
      'orderedListAction',
      'alignLeftAction',
      'alignCenterAction',
      'alignRightAction',
      'alignJustifyAction',
      'outdentAction',
      'indentAction',
      'cutAction',
      'copyAction',
      'pasteAction',
      'getStyles',
      'getCurrentStyles'
    ]);
  }

  /**
   * Assign all elements properties.
   */
  @Class.Private()
  private assignProperties(): void {
    this.assignComponentProperties(this.properties, ['name', 'value', 'required', 'disabled', 'deniedTag']);
    this.readOnly = this.properties.readOnly || false;
    this.paragraphTag = this.properties.paragraphTag || 'p';
    this.orientation = this.properties.orientation || 'column';
  }

  /**
   * Default constructor.
   * @param properties Editor properties.
   * @param children Editor children.
   */
  constructor(properties?: Properties, children?: any[]) {
    super(properties, children);
    DOM.append(this.skeleton.attachShadow({ mode: 'closed' }), this.styles, this.wrapper);
    this.bindHandlers();
    this.bindProperties();
    this.assignProperties();
  }

  /**
   * Get editor name.
   */
  @Class.Public()
  public get name(): string {
    return this.states.name;
  }

  /**
   * Set editor name.
   */
  public set name(name: string) {
    this.states.name = name;
  }

  /**
   * Get editor value.
   */
  @Class.Public()
  public get value(): string {
    return this.states.value;
  }

  /**
   * Set editor value.
   */
  public set value(value: string) {
    const content = this.getContentElement();
    content.innerHTML = value;
    this.states.value = content.innerHTML;
  }

  /**
   * Get required state.
   */
  @Class.Public()
  public get required(): boolean {
    return this.states.required;
  }

  /**
   * Set required state.
   */
  public set required(state: boolean) {
    this.states.required = state;
  }

  /**
   * Get read-only state.
   */
  @Class.Public()
  public get readOnly(): boolean {
    return this.states.readOnly;
  }

  /**
   * Set read-only state.
   */
  public set readOnly(state: boolean) {
    this.states.readOnly = state;
    this.getContentElement().contentEditable = (!(state || this.disabled)).toString();
  }

  /**
   * Get disabled state.
   */
  @Class.Public()
  public get disabled(): boolean {
    return this.states.disabled;
  }

  /**
   * Set disabled state.
   */
  public set disabled(state: boolean) {
    this.states.disabled = state;
    this.getContentElement().contentEditable = (!(state || this.readOnly)).toString();
    Control.setChildrenProperty(this.toolbarSlot, 'disabled', state);
  }

  /**
   * Get HTML paragraph tag.
   */
  @Class.Public()
  public get paragraphTag(): string {
    return this.states.paragraphTag;
  }

  /**
   * Set HTML paragraph tag.
   */
  public set paragraphTag(type: string) {
    document.execCommand('defaultParagraphSeparator', false, (this.states.paragraphTag = type.toLowerCase()));
  }

  /**
   * Get HTML denied tag.
   */
  @Class.Public()
  public get deniedTags(): string[] {
    return this.states.deniedTags;
  }

  /**
   * Set HTML denied tags.
   */
  public set deniedTags(tags: string[]) {
    this.deniedTags = tags.map((tag: string) => tag.toLowerCase());
  }

  /**
   * Get orientation mode.
   */
  @Class.Public()
  public get orientation(): string {
    return this.skeleton.dataset.orientation || 'row';
  }

  /**
   * Set orientation mode.
   */
  public set orientation(mode: string) {
    this.skeleton.dataset.orientation = mode;
  }

  /**
   * Editor element.
   */
  @Class.Public()
  public get element(): Element {
    return this.skeleton;
  }

  /**
   * Formats the specified tag from the selection or insertion point.
   * @param tag HTML tag.
   */
  @Class.Public()
  public formatAction(tag: string): void {
    this.getContentElement().focus();
    document.execCommand('formatBlock', false, tag);
  }

  /**
   * Undoes the last executed command.
   */
  @Class.Public()
  public undoAction(): void {
    this.getContentElement().focus();
    document.execCommand('undo');
  }

  /**
   * Redoes the previous undo command.
   */
  @Class.Public()
  public redoAction(): void {
    this.getContentElement().focus();
    document.execCommand('redo');
  }

  /**
   * Toggles bold on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public boldAction(): void {
    this.getContentElement().focus();
    document.execCommand('bold');
  }

  /**
   * Toggles italics on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public italicAction(): void {
    this.getContentElement().focus();
    document.execCommand('italic');
  }

  /**
   * Toggles underline on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public underlineAction(): void {
    document.execCommand('underline');
    this.getContentElement().focus();
  }

  /**
   * Toggles strikeThrough on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public strikeThroughAction(): void {
    this.getContentElement().focus();
    document.execCommand('strikeThrough');
  }

  /**
   * Creates a bulleted unordered list for the selection or at the insertion point.
   */
  @Class.Public()
  public unorderedListAction(): void {
    document.execCommand('insertUnorderedList');
    this.getContentElement().focus();
  }

  /**
   * Creates a numbered ordered list for the selection or at the insertion point.
   */
  @Class.Public()
  public orderedListAction(): void {
    this.getContentElement().focus();
    document.execCommand('insertOrderedList');
  }

  /**
   * Justifies the selection or insertion point to the left.
   */
  @Class.Public()
  public alignLeftAction(): void {
    this.getContentElement().focus();
    document.execCommand('justifyLeft');
  }

  /**
   * Justifies the selection or insertion point to the center.
   */
  @Class.Public()
  public alignCenterAction(): void {
    this.getContentElement().focus();
    document.execCommand('justifyCenter');
  }

  /**
   * Justifies the selection or insertion point to the right.
   */
  @Class.Public()
  public alignRightAction(): void {
    this.getContentElement().focus();
    document.execCommand('justifyRight');
  }

  /**
   * Justifies the selection or insertion point.
   */
  @Class.Public()
  public alignJustifyAction(): void {
    this.getContentElement().focus();
    document.execCommand('justifyFull');
  }

  /**
   * Outdents the line containing the selection or insertion point.
   */
  @Class.Public()
  public outdentAction(): void {
    this.getContentElement().focus();
    document.execCommand('outdent');
  }

  /**
   * Indents the line containing the selection or insertion point.
   */
  @Class.Public()
  public indentAction(): void {
    this.getContentElement().focus();
    document.execCommand('indent');
  }

  /**
   * Removes the current selection and copies it to the clipboard.
   */
  @Class.Public()
  public cutAction(): void {
    this.getContentElement().focus();
    document.execCommand('cut');
  }

  /**
   * Copies the current selection to the clipboard.
   */
  @Class.Public()
  public copyAction(): void {
    this.getContentElement().focus();
    document.execCommand('copy');
  }

  /**
   * Pastes the clipboard contents at the insertion point.
   */
  @Class.Public()
  public pasteAction(): void {
    this.getContentElement().focus();
    document.execCommand('paste');
  }

  /**
   * Gets the active styles map from the specified node.
   * @param node Child node.
   * @param map Current styles map.
   * @returns Returns the active styles map.
   */
  @Class.Public()
  public getStyles(node: Node, map?: Styles): Styles {
    const content = this.getContentElement();
    const styles = map || ({ ...Template.defaultStyles } as Styles);
    while (node && node !== content) {
      if (node instanceof HTMLElement) {
        Template.collectStylesByElement(styles, node);
        Template.collectStylesByCSS(styles, node.style);
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
    const styles = { ...Template.defaultStyles };
    if (selection.rangeCount) {
      this.getStyles(selection.focusNode, styles);
    }
    return styles;
  }

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
    alignJustify: false
  } as Styles;

  /**
   * Map of styles by tag.
   */
  @Class.Private()
  private static stylesByTag = {
    b: 'bold',
    strong: 'bold',
    i: 'italic',
    em: 'italic',
    u: 'underline',
    ins: 'underline',
    s: 'strikeThrough',
    strike: 'strikeThrough',
    del: 'strikeThrough',
    ul: 'unorderedList',
    ol: 'orderedList',
    p: 'paragraph',
    h1: 'heading1',
    h2: 'heading2',
    h3: 'heading3',
    h4: 'heading4',
    h5: 'heading5',
    h6: 'heading6'
  } as any;

  /**
   * Map of styles by CSS.
   */
  @Class.Private()
  private static stylesByCSS = {
    textAlign: {
      left: 'alignLeft',
      center: 'alignCenter',
      right: 'alignRight',
      justify: 'alignJustify'
    }
  } as any;

  /**
   * Determines whether the specified element is child of the specified parent element.
   * @param element Child element.
   * @param parent Parent element.
   * @returns Returns true when the specified element is child of the specified parent element, false otherwise.
   */
  @Class.Private()
  private static isChildOf(child: HTMLElement, parent: HTMLElement): boolean {
    while (child.parentElement) {
      if (child.parentElement === parent) {
        return true;
      }
      child = child.parentElement;
    }
    return false;
  }

  /**
   * Collect all styles by its respective CSS declaration.
   * @param styles Styles map.
   * @param css CSS declarations.
   */
  @Class.Private()
  private static collectStylesByCSS(styles: Styles, css: CSSStyleDeclaration): void {
    for (const declaration in this.stylesByCSS) {
      const property = this.stylesByCSS[declaration][(css as any)[declaration]];
      if (property in styles) {
        (styles as any)[property] = true;
      }
    }
  }

  /**
   * Collect all styles by its respective element names.
   * @param styles Styles map.
   * @param element HTML element.
   */
  @Class.Private()
  private static collectStylesByElement(styles: Styles, element: HTMLElement): void {
    const property = this.stylesByTag[element.tagName.toLowerCase()];
    if (property in styles) {
      (styles as any)[property] = true;
    }
  }
}
