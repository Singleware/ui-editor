/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Selection styles interface.
 */
export interface Styles {
  /**
   * Bold.
   */
  bold: boolean;
  /**
   * Italic.
   */
  italic: boolean;
  /**
   * Underline.
   */
  underline: boolean;
  /**
   * Strike-Through.
   */
  strikeThrough: boolean;
  /**
   * Unordered-List.
   */
  unorderedList: boolean;
  /**
   * Ordered-List.
   */
  orderedList: boolean;
  /**
   * Paragraph.
   */
  paragraph: boolean;
  /**
   * Heading 1.
   */
  heading1: boolean;
  /**
   * Heading 2.
   */
  heading2: boolean;
  /**
   * Heading 3.
   */
  heading3: boolean;
  /**
   * Heading 4.
   */
  heading4: boolean;
  /**
   * Heading 5.
   */
  heading5: boolean;
  /**
   * Heading 6.
   */
  heading6: boolean;
  /**
   * Align-Left.
   */
  alignLeft: boolean;
  /**
   * Align-Center.
   */
  alignCenter: boolean;
  /**
   * Align-Right.
   */
  alignRight: boolean;
  /**
   * Align-Justify.
   */
  alignJustify: boolean;
  /**
   * Font name.
   */
  fontName: string;
  /**
   * Font size.
   */
  fontSize: string;
  /**
   * Font color.
   */
  fontColor: string;
}
