/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Editor properties interface.
 */
export interface Properties {
  /**
   * Editor classes.
   */
  class?: string;
  /**
   * Editor slot.
   */
  slot?: string;
  /**
   * Editor name.
   */
  name?: string;
  /**
   * Editor value.
   */
  value?: any;
  /**
   * Editor default value.
   */
  defaultValue?: any;
  /**
   * Determines whether the editor is required or not.
   */
  required?: boolean;
  /**
   * Determines whether the editor is read-only or not.
   */
  readOnly?: boolean;
  /**
   * Determines whether the editor is disabled or not.
   */
  disabled?: boolean;
  /**
   * Determines whether the selection should be preserved when the editor content isn't focused.
   */
  preserveSelection?: boolean;
  /**
   * HTML paragraph tag.
   */
  paragraphTag?: string;
  /**
   * HTML denied tags.
   */
  deniedTags?: string[];
  /**
   * Editor orientation.
   */
  orientation?: string;
  /**
   * Editor children.
   */
  children?: {};
  /**
   * Editor change event.
   */
  onChange?: (event: Event) => void;
}
