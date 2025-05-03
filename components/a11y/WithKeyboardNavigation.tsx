import React, { ComponentType, forwardRef } from 'react';
import useKeyboardNavigation from '@/hooks/useKeyboardNavigation';

// Define more specific types
export interface WithKeyboardNavigationProps {
  onKeyAction?: (action: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  [key: string]: unknown;
}

/**
 * Higher-order component that adds keyboard navigation to any component
 * @param WrappedComponent The component to wrap
 * @param keyMap Map of keys to actions
 * @returns Enhanced component with keyboard navigation
 */
export function withKeyboardNavigation<
  P extends WithKeyboardNavigationProps,
  R = unknown
>(
  WrappedComponent: ComponentType<P>,
  keyMap: Record<string, string> = {}
) {
  // Create a properly named wrapper component that uses the keyboard navigation hook
  function WithKeyboardNavigationComponent(props: Omit<P, 'ref'>, ref: React.Ref<R>) {
    const { onKeyAction, ...restProps } = props;
    
    // Type-safe action handler
    const actionHandler = onKeyAction && typeof onKeyAction === 'function' 
      ? onKeyAction 
      : (_: string) => {};
    
    // Type-safe keyDown handler
    const keyDownHandler = props.onKeyDown && typeof props.onKeyDown === 'function'
      ? props.onKeyDown
      : (_: React.KeyboardEvent) => {};
    
    // Create handlers from the key map
    const keyHandlers: Record<string, (event: React.KeyboardEvent) => void> = {};
    
    // Populate the key handlers
    Object.entries(keyMap).forEach(([key, action]) => {
      keyHandlers[key] = (event: React.KeyboardEvent) => {
        event.preventDefault();
        actionHandler(action);
      };
    });

    // Use the keyboard navigation hook
    const handleKeyDown = useKeyboardNavigation(keyHandlers);

    return (
      <WrappedComponent
        {...(restProps as unknown as P)}
        ref={ref}
        onKeyDown={(e: React.KeyboardEvent) => {
          handleKeyDown(e);
          // Call the original onKeyDown if it exists
          keyDownHandler(e);
        }}
      />
    );
  }

  // Create the forwarded ref component with a proper display name
  const ComponentWithRef = forwardRef(WithKeyboardNavigationComponent);
  
  // Set display name for debugging
  ComponentWithRef.displayName = `WithKeyboardNavigation(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return ComponentWithRef;
}

export default withKeyboardNavigation; 