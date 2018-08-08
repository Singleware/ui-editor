/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */

/**
 * Action properties interface.
 */
export interface Properties {
  /**
   * Action classes.
   */
  class?: string;
  /**
   * Action slot.
   */
  slot?: string;
  /**
   * Determines whether the action is disabled or not.
   */
  disabled?: boolean;
  /**
   * Action children.
   */
  children?: {};
}
