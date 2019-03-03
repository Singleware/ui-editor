import * as OSS from '@singleware/oss';
/**
 * Editor stylesheet class.
 */
export declare class Stylesheet extends OSS.Stylesheet {
    /**
     * Editor styles.
     */
    private element;
    /**
     * Horizontal editor styles.
     */
    private horizontal;
    /**
     * Vertical editor styles.
     */
    private vertical;
    /**
     * Toolbar styles.
     */
    private toolbar;
    /**
     * Horizontal editor, toolbar styles.
     */
    private horizontalToolbar;
    /**
     * Vertical editor, toolbar styles.
     */
    private verticalToolbar;
    /**
     * Content styles.
     */
    private content;
    /**
     * Slotted content styles.
     */
    private slottedContent;
    /**
     * Content selection.
     */
    private selection;
    /**
     * Default constructor.
     */
    constructor();
}
