import React, { ReactNode, KeyboardEvent, useCallback } from 'react';

export interface KeyAction {
  key: string;
  action: () => void;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

interface KeyboardNavProps {
  /** Child elements */
  children: ReactNode;
  /** Array of keyboard actions to handle */
  actions: KeyAction[];
  /** HTML element to render */
  as?: React.ElementType;
  /** Additional props to pass to the element */
  [key: string]: unknown;
}

/**
 * Component that adds keyboard navigation to any children
 */
export function KeyboardNav({
  children,
  actions,
  as: Component = 'div',
  ...rest
}: KeyboardNavProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check for matching keyboard actions
      for (const { key, action, ctrlKey, shiftKey, altKey } of actions) {
        const keyMatches = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatches = Boolean(ctrlKey) === event.ctrlKey;
        const shiftMatches = Boolean(shiftKey) === event.shiftKey;
        const altMatches = Boolean(altKey) === event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          action();
          return;
        }
      }
    },
    [actions]
  );

  return (
    <Component onKeyDown={handleKeyDown} tabIndex={0} {...rest}>
      {children}
    </Component>
  );
}

export default KeyboardNav; 