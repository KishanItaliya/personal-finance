import React, { ElementType } from 'react';

interface ScreenReaderTextProps {
  /** The text to be read by screen readers */
  children: React.ReactNode;
  /** HTML element to render */
  as?: ElementType;
  /** Whether the element should be focusable */
  focusable?: boolean;
}

/**
 * Component that renders text that is only visible to screen readers
 */
export function ScreenReaderText({
  children,
  as: Component = 'span',
  focusable = false,
}: ScreenReaderTextProps) {
  return (
    <Component
      className="sr-only"
      tabIndex={focusable ? 0 : undefined}
    >
      {children}
    </Component>
  );
}

/**
 * Component that renders an element that is visible when focused
 * and only visible to screen readers when not focused
 */
export function ScreenReaderOnlyFocusable({
  children,
  as: Component = 'a',
}: ScreenReaderTextProps) {
  return (
    <Component
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:outline"
      tabIndex={0}
      href={Component === 'a' ? '#' : undefined}
      onClick={Component === 'a' ? (e: React.MouseEvent) => e.preventDefault() : undefined}
    >
      {children}
    </Component>
  );
}

export default ScreenReaderText; 