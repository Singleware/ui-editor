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
 * Editor action template class.
 */
@Class.Describe()
export class Template extends Control.Component<Properties> {
  /**
   * Action states.
   */
  @Class.Private()
  private states = {
    disabled: false
  };

  /**
   * Action element.
   */
  @Class.Private()
  private actionSlot: HTMLSlotElement = <slot name="action" class="action" /> as HTMLSlotElement;

  /**
   * Action styles.
   */
  @Class.Private()
  private styles: HTMLStyleElement = (
    <style>
      {`:host {
  display: block;
}`}
    </style>
  ) as HTMLStyleElement;

  /**
   * Action skeleton.
   */
  @Class.Private()
  private skeleton: Element = (
    <div slot={this.properties.slot} class={this.properties.class}>
      {this.children}
    </div>
  ) as Element;

  /**
   * Action elements.
   */
  @Class.Private()
  private elements: ShadowRoot = DOM.append(
    (this.skeleton as HTMLDivElement).attachShadow({ mode: 'closed' }),
    this.styles,
    this.actionSlot
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
      disabled: super.bindDescriptor(this, Template.prototype, 'disabled')
    });
  }

  /**
   * Assign all element properties.
   */
  @Class.Private()
  private assignProperties(): void {
    Control.assignProperties(this, this.properties, ['disabled']);
  }

  /**
   * Default constructor.
   * @param properties Action properties.
   * @param children Action children.
   */
  constructor(properties?: Properties, children?: any[]) {
    super(properties, children);
    this.bindHandlers();
    this.bindProperties();
    this.assignProperties();
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
    Control.setChildrenProperty(this.actionSlot, 'disabled', (this.states.disabled = state));
  }

  /**
   * Action element.
   */
  @Class.Public()
  public get element(): Element {
    return this.skeleton;
  }
}
