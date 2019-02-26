/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import * as OSS from '@singleware/oss';

/**
 * Editor stylesheet class.
 */
@Class.Describe()
export class Stylesheet extends OSS.Stylesheet {
  /**
   * Editor styles.
   */
  @Class.Private()
  private element = this.select(':host>.editor');

  /**
   * Horizontal editor styles.
   */
  @Class.Private()
  private horizontal = this.select(':host([orientation="row"])>.editor');

  /**
   * Vertical editor styles.
   */
  @Class.Private()
  private vertical = this.select(':host>.editor', ':host([orientation="column"])>.editor');

  /**
   * Editor toolbar styles.
   */
  @Class.Private()
  private toolbar = this.select(':host>.editor>.toolbar');

  /**
   * Horizontal editor, toolbar styles.
   */
  @Class.Private()
  private horizontalToolbar = this.select(':host>.editor>.toolbar', ':host([orientation="column"])>.editor>.toolbar');

  /**
   * Vertical editor, toolbar styles.
   */
  @Class.Private()
  private verticalToolbar = this.select(':host([orientation="row"])>.editor>.toolbar');

  /**
   * Editor content styles.
   */
  @Class.Private()
  private content = this.select(':host>.editor>.content', ':host>.editor>.content::slotted(*)');

  /**
   * Editor slotted content styles.
   */
  @Class.Private()
  private slottedContent = this.select(':host>.editor>.content::slotted(*)');

  /**
   * Default constructor.
   */
  constructor() {
    super();
    this.element.display = 'flex';
    this.element.height = 'inherit';
    this.element.width = 'inherit';
    this.horizontal.flexDirection = 'row';
    this.vertical.flexDirection = 'column';
    this.toolbar.display = 'flex';
    this.toolbar.flexGrow = 0;
    this.toolbar.flexShrink = 0;
    this.horizontalToolbar.flexDirection = 'row';
    this.horizontalToolbar.width = 'inherit';
    this.verticalToolbar.flexDirection = 'column';
    this.verticalToolbar.height = 'inherit';
    this.content.width = 'inherit';
    this.content.height = 'inherit';
    this.slottedContent.display = 'block';
    this.slottedContent.position = 'relative';
    this.slottedContent.overflow = 'auto';
  }
}
