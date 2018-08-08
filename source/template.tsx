/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as DOM from '@singleware/jsx';
import * as Control from '@singleware/ui-control';

import { Properties } from './properties';
import { Element } from './element';

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
  };

  /**
   * Toolbar element.
   */
  @Class.Private()
  private toolbarSlot: HTMLSlotElement = <slot name="toolbar" class="toolbar" /> as HTMLSlotElement;

  /**
   * Content element.
   */
  @Class.Private()
  private contentSlot: HTMLSlotElement = <slot name="content" class="content" /> as HTMLSlotElement;

  /**
   * Wrapper element.
   */
  @Class.Private()
  private wrapper: HTMLElement = (
    <div class="wrapper">
      {this.toolbarSlot}
      {this.contentSlot}
    </div>
  ) as HTMLElement;

  /**
   * Editor styles.
   */
  @Class.Private()
  private styles: HTMLStyleElement = (
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
:host > .wrapper > .content {
  display: block;
  overflow: auto;
}`}
    </style>
  ) as HTMLStyleElement;

  /**
   * Editor skeleton.
   */
  @Class.Private()
  private skeleton: Element = (
    <div slot={this.properties.slot} class={this.properties.class}>
      {this.children}
    </div>
  ) as Element;

  /**
   * Editor elements.
   */
  @Class.Private()
  private elements: ShadowRoot = DOM.append(
    (this.skeleton as HTMLDivElement).attachShadow({ mode: 'closed' }),
    this.styles,
    this.wrapper
  ) as ShadowRoot;

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
      name: super.bindDescriptor(Template.prototype, 'name'),
      value: super.bindDescriptor(Template.prototype, 'value'),
      required: super.bindDescriptor(Template.prototype, 'required'),
      readOnly: super.bindDescriptor(Template.prototype, 'readOnly'),
      disabled: super.bindDescriptor(Template.prototype, 'disabled'),
      orientation: super.bindDescriptor(Template.prototype, 'orientation')
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
}
