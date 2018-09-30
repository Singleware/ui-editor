/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Selection styles interface.
 */
export interface Styles {
  /**
   * Bold selection.
   */
  bold: boolean;
  /**
   * Italic selection.
   */
  italic: boolean;
  /**
   * Underline selection.
   */
  underline: boolean;
  /**
   * Strike-Through selection.
   */
  strikeThrough: boolean;
  /**
   * Unordered-List selection.
   */
  unorderedList: boolean;
  /**
   * Ordered-List selection.
   */
  orderedList: boolean;
  /**
   * Paragraph selection.
   */
  paragraph: boolean;
  /**
   * Heading 1 selection.
   */
  heading1: boolean;
  /**
   * Heading 2 selection.
   */
  heading2: boolean;
  /**
   * Heading 3 selection.
   */
  heading3: boolean;
  /**
   * Heading 4 selection.
   */
  heading4: boolean;
  /**
   * Heading 5 selection.
   */
  heading5: boolean;
  /**
   * Heading 6 selection.
   */
  heading6: boolean;
  /**
   * Align-Left selection.
   */
  alignLeft: boolean;
  /**
   * Align-Center selection.
   */
  alignCenter: boolean;
  /**
   * Align-Right selection.
   */
  alignRight: boolean;
  /**
   * Align-Justify selection.
   */
  alignJustify: boolean;
}
