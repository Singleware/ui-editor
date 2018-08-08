import * as Control from '@singleware/ui-control';
import { Properties } from './properties';
import { Element } from './element';
/**
 * Editor action template class.
 */
export declare class Template extends Control.Component<Properties> {
    /**
     * Action states.
     */
    private states;
    /**
     * Action element.
     */
    private actionSlot;
    /**
     * Action styles.
     */
    private styles;
    /**
     * Action skeleton.
     */
    private skeleton;
    /**
     * Action elements.
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
     * Assign all element properties.
     */
    private assignProperties;
    /**
     * Default constructor.
     * @param properties Action properties.
     * @param children Action children.
     */
    constructor(properties?: Properties, children?: any[]);
    /**
     * Get disabled state.
     */
    /**
    * Set disabled state.
    */
    disabled: boolean;
    /**
     * Action element.
     */
    readonly element: Element;
}
