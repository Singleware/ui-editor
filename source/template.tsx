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
    required: false,
    readOnly: false,
    disabled: false
  } as States;

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
  ) as HTMLElement;

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
:host > .wrapper[data-orientation='row'] {
  flex-direction: row;
}
:host > .wrapper,
:host > .wrapper[data-orientation='column'] {
  flex-direction: column;
}
:host > .wrapper > .toolbar {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  width: inherit;
}
:host > .wrapper[data-orientation='row'] > .toolbar {
  flex-direction: row;
}
:host > .wrapper > .toolbar
:host > .wrapper[data-orientation='column'] > .toolbar {
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
  private get content(): HTMLElement {
    const content = Control.getChildByProperty(this.contentSlot, 'contentEditable');
    if (!content) {
      throw new Error(`There is no content element assigned.`);
    }
    return content;
  }

  /**
   * Notify editor changes.
   */
  @Class.Private()
  private notifyChanges(): void {
    this.skeleton.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
  }

  /**
   * Bind event handlers to update the custom element.
   */
  @Class.Private()
  private bindHandlers(): void {}

  /**
   * Bind exposed properties to the custom element.
   */
  @Class.Private()
  private bindProperties(): void {
    Object.defineProperties(this.skeleton, {
      name: super.bindDescriptor(this, Template.prototype, 'name'),
      value: super.bindDescriptor(this, Template.prototype, 'value'),
      required: super.bindDescriptor(this, Template.prototype, 'required'),
      readOnly: super.bindDescriptor(this, Template.prototype, 'readOnly'),
      disabled: super.bindDescriptor(this, Template.prototype, 'disabled'),
      orientation: super.bindDescriptor(this, Template.prototype, 'orientation'),
      formatAction: super.bindDescriptor(this, Template.prototype, 'formatAction'),
      undoAction: super.bindDescriptor(this, Template.prototype, 'undoAction'),
      redoAction: super.bindDescriptor(this, Template.prototype, 'redoAction'),
      boldAction: super.bindDescriptor(this, Template.prototype, 'boldAction'),
      italicAction: super.bindDescriptor(this, Template.prototype, 'italicAction'),
      underlineAction: super.bindDescriptor(this, Template.prototype, 'underlineAction'),
      strikeThroughAction: super.bindDescriptor(this, Template.prototype, 'strikeThroughAction'),
      unorderedListAction: super.bindDescriptor(this, Template.prototype, 'unorderedListAction'),
      orderedListAction: super.bindDescriptor(this, Template.prototype, 'orderedListAction'),
      alignLeftAction: super.bindDescriptor(this, Template.prototype, 'alignLeftAction'),
      alignCenterAction: super.bindDescriptor(this, Template.prototype, 'alignCenterAction'),
      alignRightAction: super.bindDescriptor(this, Template.prototype, 'alignRightAction'),
      alignJustifyAction: super.bindDescriptor(this, Template.prototype, 'alignJustifyAction'),
      outdentAction: super.bindDescriptor(this, Template.prototype, 'outdentAction'),
      indentAction: super.bindDescriptor(this, Template.prototype, 'indentAction'),
      cutAction: super.bindDescriptor(this, Template.prototype, 'cutAction'),
      copyAction: super.bindDescriptor(this, Template.prototype, 'copyAction'),
      pasteAction: super.bindDescriptor(this, Template.prototype, 'pasteAction')
    });
  }

  /**
   * Assign all elements properties.
   */
  @Class.Private()
  private assignProperties(): void {
    Control.assignProperties(this, this.properties, ['name', 'value', 'required', 'disabled']);
    this.orientation = this.properties.orientation || 'column';
    this.readOnly = this.properties.readOnly || false;
  }

  /**
   * Default constructor.
   * @param properties Form properties.
   * @param children Form children.
   */
  constructor(properties?: Properties, children?: any[]) {
    super(properties, children);
    DOM.append((this.skeleton as HTMLDivElement).attachShadow({ mode: 'closed' }), this.styles, this.wrapper);
    this.bindHandlers();
    this.bindProperties();
    this.assignProperties();
  }

  /**
   * Get HTML value.
   */
  @Class.Public()
  public get value(): string {
    return this.contentSlot.innerHTML;
  }

  /**
   * Set HTML value.
   */
  public set value(value: string) {
    this.contentSlot.innerHTML = value;
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
    Control.setChildrenProperty(this.contentSlot, 'contentEditable', !(state || this.disabled));
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
    Control.setChildrenProperty(this.contentSlot, 'contentEditable', !(state || this.readOnly));
    Control.setChildrenProperty(this.toolbarSlot, 'disabled', state);
  }

  /**
   * Get orientation mode.
   */
  @Class.Public()
  public get orientation(): string {
    return this.wrapper.dataset.orientation || 'row';
  }

  /**
   * Set orientation mode.
   */
  public set orientation(mode: string) {
    this.wrapper.dataset.orientation = mode;
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
    document.execCommand('formatAction', false, tag);
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Undoes the last executed command.
   */
  @Class.Public()
  public undoAction(): void {
    document.execCommand('undo');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Redoes the previous undo command.
   */
  @Class.Public()
  public redoAction(): void {
    document.execCommand('redo');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Toggles bold on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public boldAction(): void {
    document.execCommand('bold');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Toggles italics on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public italicAction(): void {
    document.execCommand('italic');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Toggles underline on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public underlineAction(): void {
    document.execCommand('underline');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Toggles strikeThrough on/off for the selection or at the insertion point.
   */
  @Class.Public()
  public strikeThroughAction(): void {
    document.execCommand('strikeThrough');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Creates a bulleted unordered list for the selection or at the insertion point.
   */
  @Class.Public()
  public unorderedListAction(): void {
    document.execCommand('insertUnorderedList');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Creates a numbered ordered list for the selection or at the insertion point.
   */
  @Class.Public()
  public orderedListAction(): void {
    document.execCommand('insertOrderedList');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Justifies the selection or insertion point to the left.
   */
  @Class.Public()
  public alignLeftAction(): void {
    document.execCommand('justifyLeft');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Justifies the selection or insertion point to the center.
   */
  @Class.Public()
  public alignCenterAction(): void {
    document.execCommand('justifyCenter');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Justifies the selection or insertion point to the right.
   */
  @Class.Public()
  public alignRightAction(): void {
    document.execCommand('justifyRight');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Justifies the selection or insertion point.
   */
  @Class.Public()
  public alignJustifyAction(): void {
    document.execCommand('justifyFull');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Outdents the line containing the selection or insertion point.
   */
  @Class.Public()
  public outdentAction(): void {
    document.execCommand('outdent');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Indents the line containing the selection or insertion point.
   */
  @Class.Public()
  public indentAction(): void {
    document.execCommand('indent');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Removes the current selection and copies it to the clipboard.
   */
  @Class.Public()
  public cutAction(): void {
    document.execCommand('cut');
    this.content.focus();
    this.notifyChanges();
  }

  /**
   * Copies the current selection to the clipboard.
   */
  @Class.Public()
  public copyAction(): void {
    document.execCommand('copy');
    this.content.focus();
  }

  /**
   * Pastes the clipboard contents at the insertion point.
   */
  @Class.Public()
  public pasteAction(): void {
    document.execCommand('paste');
    this.content.focus();
    this.notifyChanges();
  }
}
