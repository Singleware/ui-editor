/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
import * as Class from '@singleware/class';
import { Styles } from './styles';
/**
 * Editor global settings.
 */
export declare class Settings extends Class.Null {
    /**
     * Default styles.
     */
    static defaultStyles: Styles;
    /**
     * List of denied tags in the editor.
     */
    static defaultDeniedTags: string[];
}
