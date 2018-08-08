import * as Control from '@singleware/ui-control';
import { Properties } from './properties';
import { Element } from './element';
/**
 * Editor template class.
 */
export declare class Template extends Control.Component<Properties> {
    /**
     * Editor states.
     */
    private states;
    /**
     * Toolbar element.
     */
    private toolbarSlot;
    /**
     * Content element.
     */
    private contentSlot;
    /**
     * Wrapper element.
     */
    private wrapper;
    /**
     * Editor styles.
     */
    private styles;
    /**
     * Editor skeleton.
     */
    private skeleton;
    /**
     * Editor elements.
     */
    private elements;
    /**
     * Bind event handlers to update the custom element.
     */
    private bindHandlers;
    /**
     * Bind exposed properties to the custom element.
     */
    private bindProperties;
    /**
     * Assign all elements properties.
     */
    private assignProperties;
    /**
     * Default constructor.
     * @param properties Form properties.
     * @param children Form children.
     */
    constructor(properties?: Properties, children?: any[]);
    /**
     * Get HTML value.
     */
    /**
    * Set HTML value.
    */
    value: string;
    /**
     * Get editor name.
     */
    /**
    * Set editor name.
    */
    name: string;
    /**
     * Get required state.
     */
    /**
    * Set required state.
    */
    required: boolean;
    /**
     * Get read-only state.
     */
    /**
    * Set read-only state.
    */
    readOnly: boolean;
    /**
     * Get disabled state.
     */
    /**
    * Set disabled state.
    */
    disabled: boolean;
    /**
     * Get orientation mode.
     */
    /**
    * Set orientation mode.
    */
    orientation: string;
    /**
     * Editor element.
     */
    readonly element: Element;
}
