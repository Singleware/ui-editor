/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';

import { Styles } from './styles';

/**
 * Editor global settings.
 */
@Class.Describe()
export class Settings extends Class.Null {
  /**
   * Default styles.
   */
  @Class.Public()
  public static defaultStyles = {
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
    orderedList: false,
    paragraph: false,
    heading1: false,
    heading2: false,
    heading3: false,
    heading4: false,
    heading5: false,
    heading6: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
    fontName: void 0,
    fontSize: void 0,
    fontColor: void 0,
    lineHeight: void 0,
    zoom: 1.0
  } as Styles;

  /**
   * List of denied tags in the editor.
   */
  @Class.Public()
  public static defaultDeniedTags = [
    'html',
    'head',
    'meta',
    'base',
    'basefont',
    'title',
    'body',
    'frame',
    'frameset',
    'noframes',
    'iframe',
    'script',
    'noscript',
    'applet',
    'embed',
    'object',
    'param',
    'form',
    'fieldset',
    'legend',
    'label',
    'select',
    'optgroup',
    'option',
    'textarea',
    'input',
    'output',
    'button',
    'datalist'
  ];
}
