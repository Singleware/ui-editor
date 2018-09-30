/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import { Styles } from './styles';

/**
 * Editor element interface.
 */
export interface Element extends HTMLDivElement {
  /**
   * Editor value.
   */
  value: any;
  /**
   * Required state.
   */
  required: boolean;
  /**
   * Read-only state.
   */
  readOnly: boolean;
  /**
   * Disabled state.
   */
  disabled: boolean;
  /**
   * HTML paragraph tag.
   */
  paragraphTag: string;
  /**
   * HTML denied tags.
   */
  deniedTags?: string[];
  /**
   * Orientation mode.
   */
  orientation: string;
  /**
   * Formats the specified tag from the selection or insertion point.
   * @param tag HTML tag.
   */
  formatAction: (tag: string) => void;
  /**
   * Undoes the last executed command.
   */
  undoAction: () => void;
  /**
   * Redoes the previous undo command.
   */
  redoAction: () => void;
  /**
   * Toggles bold on/off for the selection or at the insertion point.
   */
  boldAction: () => void;
  /**
   * Toggles italics on/off for the selection or at the insertion point.
   */
  italicAction: () => void;
  /**
   * Toggles underline on/off for the selection or at the insertion point.
   */
  underlineAction: () => void;
  /**
   * Toggles strikeThrough on/off for the selection or at the insertion point.
   */
  strikeThroughAction: () => void;
  /**
   * Creates a bulleted unordered list for the selection or at the insertion point.
   */
  unorderedListAction: () => void;
  /**
   * Creates a numbered ordered list for the selection or at the insertion point.
   */
  orderedListAction: () => void;
  /**
   * Justifies the selection or insertion point to the left.
   */
  alignLeftAction: () => void;
  /**
   * Justifies the selection or insertion point to the center.
   */
  alignCenterAction: () => void;
  /**
   * Justifies the selection or insertion point to the right.
   */
  alignRightAction: () => void;
  /**
   * Justifies the selection or insertion point.
   */
  alignJustifyAction: () => void;
  /**
   * Outdents the line containing the selection or insertion point.
   */
  outdentAction: () => void;
  /**
   * Indents the line containing the selection or insertion point.
   */
  indentAction: () => void;
  /**
   * Removes the current selection and copies it to the clipboard.
   */
  cutAction: () => void;
  /**
   * Copies the current selection to the clipboard.
   */
  copyAction: () => void;
  /**
   * Pastes the clipboard contents at the insertion point.
   */
  pasteAction: () => void;
  /**
   * Gets the active styles map from the specified node.
   * @param node Child node.
   * @param map Current styles map.
   * @returns Returns the active styles map.
   */
  getStyles: (node: Node, map?: Styles) => Styles;
  /**
   * Gets the active styles map from the focused node.
   * @returns Returns the active styles map.
   */
  getCurrentStyles: () => Styles;
}
