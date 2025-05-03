/**
 * Accessibility utility functions
 */

/**
 * Focuses on the first focusable element within a container
 * @param containerId - The ID of the container to search within
 * @returns boolean - Whether focus was successfully set
 */
export const focusFirstElement = (containerId: string): boolean => {
  const container = document.getElementById(containerId);
  if (!container) return false;

  // Query for all focusable elements
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length > 0) {
    (focusableElements[0] as HTMLElement).focus();
    return true;
  }

  return false;
};

/**
 * Traps focus within a specified container
 * @param containerId - The ID of the container to trap focus within
 * @returns A cleanup function to remove the trap
 */
export const trapFocus = (containerId: string): () => void => {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  const focusableElements = Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ) as HTMLElement[];

  if (focusableElements.length === 0) return () => {};

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Save the previously focused element
  const previouslyFocused = document.activeElement as HTMLElement;

  // Handle keydown events for the container
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    // If shift+tab on first element, move to last element
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } 
    // If tab on last element, move to first element
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  // Set initial focus
  firstElement.focus();

  // Add event listener
  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    if (previouslyFocused && 'focus' in previouslyFocused) {
      previouslyFocused.focus();
    }
  };
};

/**
 * Announces a message to screen readers using an ARIA live region
 * @param message - The message to announce
 * @param priority - The priority of the announcement ('polite' or 'assertive')
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  // Check if the live region already exists
  let liveRegion = document.getElementById('screen-reader-announce');

  // Create it if it doesn't exist
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'screen-reader-announce';
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }

  // Set the priority (it might have changed)
  liveRegion.setAttribute('aria-live', priority);

  // Clear the region (needed for some screen readers to announce again)
  liveRegion.textContent = '';

  // Set the message after a small delay
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, 50);
}; 