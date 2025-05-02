// This file fixes TypeScript issues with conditionally rendered elements in JSX
import React, { ReactElement, JSXElementConstructor } from 'react';

/**
 * A helper function to safely render conditional React elements.
 * This solves TypeScript errors when using conditional rendering with && operator.
 * 
 * @param condition The condition to check
 * @param element The element to render if condition is true
 * @returns The element if condition is true, null otherwise
 */
export function renderWhen<P>(
    condition: boolean,
    element: ReactElement<P, string | JSXElementConstructor<any>>
): ReactElement<P, string | JSXElementConstructor<any>> | null {
    return condition ? element : null;
}

/**
 * A type predicate function to help TypeScript recognize filtered arrays of React elements.
 * Use this with Array.filter() to remove nulls and undefined values from an array of elements.
 */
export function isReactElement<P>(
    item: ReactElement<P, string | JSXElementConstructor<any>> | boolean | null | undefined
): item is ReactElement<P, string | JSXElementConstructor<any>> {
    return item !== null && item !== undefined && item !== false && item !== true;
}

/**
 * Wrap conditional elements in this function to satisfy TypeScript
 * Example: <>{conditionalElement(myCondition, <MyComponent/>)}</>
 */
export function conditionalElement<P>(
    condition: boolean,
    element: ReactElement<P, string | JSXElementConstructor<any>>
): ReactElement<P, string | JSXElementConstructor<any>> | null {
    return condition ? element : null;
}
