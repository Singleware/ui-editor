/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Editor states interface.
 */
export interface States {
  /**
   * Editor name.
   */
  name: string;
  /**
   * Editor value.
   */
  value: string;
  /**
   * Determines whether the editor is required or not.
   */
  required: boolean;
  /**
   * Determines whether the editor is read only or not.
   */
  readOnly: boolean;
  /**
   * Determines whether the editor is disabled or not.
   */
  disabled: boolean;
  /**
   * HTML paragraph tag.
   */
  paragraphTag: string;
  /**
   * HTML denied tags.
   */
  deniedTags: string[];
}
