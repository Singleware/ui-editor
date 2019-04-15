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
