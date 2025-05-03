import { useEffect, useRef, KeyboardEvent, DependencyList } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyboardHandlers {
  [key: string]: KeyHandler;
}

/**
 * Hook to handle keyboard navigation within components
 * @param keyHandlers Object with keys as key combinations and values as handler functions
 * @param deps Dependencies array to control when handlers are updated
 */
export function useKeyboardNavigation(
  keyHandlers: KeyboardHandlers,
  deps: DependencyList = []
) {
  const handlersRef = useRef<KeyboardHandlers>(keyHandlers);

  // Update handlers if they change
  useEffect(() => {
    handlersRef.current = keyHandlers;
  }, [keyHandlers, ...deps]);

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Get key identifier
    const key = event.key.toLowerCase();
    const hasCtrl = event.ctrlKey;
    const hasShift = event.shiftKey;
    const hasAlt = event.altKey;
    
    // Create key combination identifier
    let keyCombo = key;
    if (hasCtrl) keyCombo = `ctrl+${keyCombo}`;
    if (hasShift) keyCombo = `shift+${keyCombo}`;
    if (hasAlt) keyCombo = `alt+${keyCombo}`;

    // Call handler if it exists
    if (handlersRef.current[keyCombo]) {
      handlersRef.current[keyCombo](event);
    } else if (handlersRef.current[key]) {
      handlersRef.current[key](event);
    }
  };

  return handleKeyDown;
}

export default useKeyboardNavigation; 