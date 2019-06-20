/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as JSX from '@singleware/jsx';
import * as Control from '@singleware/ui-control';
import * as Select from '@singleware/ui-select';
import * as Fieldset from '@singleware/ui-fieldset';
import * as Field from '@singleware/ui-field';
import * as Form from '@singleware/ui-form';

import * as Test from '@module/index';

/**
 * View class.
 */
@Class.Describe()
export class View extends Control.Component<Control.Properties> {
  /**
   * Font select.
   */
  @Class.Private()
  private fontSelect = (
    <Select.Component
      class="select"
      options={['Arial', 'Courier New', 'Time New Roman']}
      onChange={() => this.content.fontNameAction(this.fontSelect.value as string)}
    >
      <button slot="input" class="button">
        Default font
      </button>
      <div slot="result" class="result" />
    </Select.Component>
  ) as Select.Element;

  /**
   * Bold button.
   */
  @Class.Private()
  private boldButton = (
    <button class="button" onClick={() => this.content.boldAction()}>
      B
    </button>
  ) as HTMLButtonElement;

  /**
   * Italic button.
   */
  @Class.Private()
  private italicButton = (
    <button class="button" onClick={() => this.content.italicAction()}>
      I
    </button>
  ) as HTMLButtonElement;

  /**
   * Underline button.
   */
  @Class.Private()
  private underlineButton = (
    <button class="button" onClick={() => this.content.underlineAction()}>
      U
    </button>
  ) as HTMLButtonElement;

  /**
   * Strike-through button.
   */
  @Class.Private()
  private strikeThroughButton = (
    <button class="button" onClick={() => this.content.strikeThroughAction()}>
      S
    </button>
  ) as HTMLButtonElement;

  /**
   * Ordered list button.
   */
  @Class.Private()
  private orderedListButton = (
    <button class="button" onClick={() => this.content.orderedListAction()}>
      OL
    </button>
  ) as HTMLButtonElement;

  /**
   * Unordered list button.
   */
  @Class.Private()
  private unorderedListButton = (
    <button class="button" onClick={() => this.content.unorderedListAction()}>
      UL
    </button>
  ) as HTMLButtonElement;

  /**
   * Align-left button.
   */
  @Class.Private()
  private alignLeftButton = (
    <button class="button" onClick={() => this.content.alignLeftAction()}>
      Left
    </button>
  ) as HTMLButtonElement;

  /**
   * Align-center button.
   */
  @Class.Private()
  private alignCenterButton = (
    <button class="button" onClick={() => this.content.alignCenterAction()}>
      Center
    </button>
  ) as HTMLButtonElement;

  /**
   * Align-right button.
   */
  @Class.Private()
  private alignRightButton = (
    <button class="button" onClick={() => this.content.alignRightAction()}>
      Right
    </button>
  ) as HTMLButtonElement;

  /**
   * Align-justify button.
   */
  @Class.Private()
  private alignJustifyButton = (
    <button class="button" onClick={() => this.content.alignJustifyAction()}>
      Justify
    </button>
  ) as HTMLButtonElement;

  /**
   * Test content.
   */
  @Class.Private()
  private content = (
    <Test.Component class="editor" preserveSelection>
      <Fieldset.Component slot="toolbar" class="toolbar">
        {this.fontSelect}
        {this.boldButton}
        {this.italicButton}
        {this.underlineButton}
        {this.strikeThroughButton}
        {this.orderedListButton}
        {this.unorderedListButton}
        {this.alignLeftButton}
        {this.alignCenterButton}
        {this.alignRightButton}
        {this.alignJustifyButton}
        <button class="button" onClick={() => this.content.indentAction()}>
          Indent
        </button>
        <button class="button" onClick={() => this.content.outdentAction()}>
          Outdent
        </button>
      </Fieldset.Component>
      <div slot="content" class="content" onMouseUp={this.onUpdateToolbar.bind(this)} onKeyUp={this.onUpdateToolbar.bind(this)} />
    </Test.Component>
  ) as Test.Element;

  /**
   * Test control.
   */
  @Class.Private()
  private control = (
    <Form.Component onSubmit={this.onSubmit.bind(this)}>
      <Fieldset.Component slot="header">
        <h2>Controls</h2>
      </Fieldset.Component>
      <Fieldset.Component slot="footer">
        <button type="submit" class="button">
          Apply
        </button>
      </Fieldset.Component>
    </Form.Component>
  ) as Form.Element;

  /**
   * View element.
   */
  @Class.Private()
  private skeleton = (
    <div class="experiment">
      <div class="content">{this.content}</div>
      <div class="control">{this.control}</div>
    </div>
  ) as HTMLElement;

  /**
   * Update toolbar, event handler.
   */
  @Class.Private()
  private onUpdateToolbar(): void {
    const styles = this.content.selectedStyles;
    this.fontSelect.value = styles.fontName;
    this.boldButton.classList.toggle('pushed', styles.bold);
    this.italicButton.classList.toggle('pushed', styles.italic);
    this.underlineButton.classList.toggle('pushed', styles.underline);
    this.strikeThroughButton.classList.toggle('pushed', styles.strikeThrough);
    this.orderedListButton.classList.toggle('pushed', styles.orderedList);
    this.alignLeftButton.classList.toggle('pushed', styles.alignLeft);
    this.alignCenterButton.classList.toggle('pushed', styles.alignCenter);
    this.alignRightButton.classList.toggle('pushed', styles.alignRight);
    this.alignJustifyButton.classList.toggle('pushed', styles.alignJustify);
  }

  /**
   * Submit event handler.
   */
  @Class.Private()
  private onSubmit(): void {
    const options = this.control.value;
  }

  /**
   * Default constructor.
   * @param properties Default properties.
   */
  constructor(properties: Control.Properties) {
    super(properties);
  }

  /**
   * View element.
   */
  @Class.Public()
  public get element(): HTMLElement {
    return this.skeleton;
  }
}
