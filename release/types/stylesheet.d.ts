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
     * Editor toolbar styles.
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
     * Editor content styles.
     */
    private content;
    /**
     * Editor slotted content styles.
     */
    private slottedContent;
    /**
     * Default constructor.
     */
    constructor();
}
