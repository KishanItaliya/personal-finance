# Accessibility Components Usage Guide

This guide explains how to use the accessibility components we've created for the Personal Finance Dashboard.

## SkipLink Component

The `SkipLink` component provides a way for keyboard users to skip navigation and jump directly to the main content.

### Usage

```tsx
import SkipLink from "@/components/a11y/SkipLink";

function Layout({ children }) {
  return (
    <>
      <SkipLink targetId="main-content" />
      <header>
        {/* Navigation content */}
      </header>
      <main id="main-content">
        {children}
      </main>
    </>
  );
}
```

### Props

- `targetId`: The ID of the element to skip to
- `label`: (Optional) Custom label text (defaults to "Skip to main content")

## ScreenReaderText Component

The `ScreenReaderText` component displays text that is only visible to screen readers.

### Usage

```tsx
import { ScreenReaderText, ScreenReaderOnlyFocusable } from "@/components/a11y/ScreenReaderText";

function IconButton() {
  return (
    <button>
      <IconComponent />
      <ScreenReaderText>Delete item</ScreenReaderText>
    </button>
  );
}

function PageWithSkipLink() {
  return (
    <>
      <ScreenReaderOnlyFocusable>
        Skip to main content
      </ScreenReaderOnlyFocusable>
      {/* Page content */}
    </>
  );
}
```

### Props

- `children`: The text to be read by screen readers
- `as`: (Optional) HTML element to render (defaults to "span")
- `focusable`: (Optional) Whether the element should be focusable (defaults to false)

## FormField Component

The `FormField` component creates an accessible form field with label, help text, and error handling.

### Usage

```tsx
import FormField from "@/components/a11y/FormField";

function ExampleForm() {
  return (
    <form>
      <FormField
        id="name"
        label="Full Name"
        required
        helpText="Enter your first and last name"
        error={errors.name}
      >
        <input type="text" name="name" />
      </FormField>

      <FormField
        id="email"
        label="Email Address"
        required
      >
        <input type="email" name="email" />
      </FormField>
    </form>
  );
}
```

### Props

- `id`: ID for the input element
- `label`: Label text for the field
- `error`: (Optional) Error message for the field
- `required`: (Optional) Whether the field is required
- `helpText`: (Optional) Help text to provide additional context
- `disabled`: (Optional) Whether the field is disabled
- `children`: Child elements (should include the input)

## AccessibleModal Component

The `AccessibleModal` component creates a modal dialog that is fully accessible.

### Usage

```tsx
import { useState } from "react";
import AccessibleModal from "@/components/a11y/AccessibleModal";

function ExampleComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
      >
        <p>This is an accessible modal dialog.</p>
        <button onClick={() => setIsOpen(false)}>Close</button>
      </AccessibleModal>
    </>
  );
}
```

### Props

- `isOpen`: Whether the modal is open
- `onClose`: Function to call when the modal should close
- `title`: Modal title (for accessibility)
- `children`: Modal content
- `className`: (Optional) Additional CSS class names

## KeyboardNav Component

The `KeyboardNav` component adds keyboard navigation to any children.

### Usage

```tsx
import KeyboardNav, { KeyAction } from "@/components/a11y/KeyboardNav";

function KeyboardNavExample() {
  const handleNext = () => {
    // Handle next action
  };

  const handlePrevious = () => {
    // Handle previous action
  };

  const keyboardActions: KeyAction[] = [
    { key: "ArrowRight", action: handleNext },
    { key: "ArrowLeft", action: handlePrevious },
    { key: "n", action: handleNext },
    { key: "p", action: handlePrevious },
  ];

  return (
    <KeyboardNav actions={keyboardActions}>
      <div className="interactive-element">
        Use arrow keys or 'n' and 'p' to navigate
      </div>
    </KeyboardNav>
  );
}
```

### Props

- `children`: Child elements
- `actions`: Array of keyboard actions to handle
- `as`: (Optional) HTML element to render (defaults to "div")

## Accessibility Utilities

### Focus Management

```tsx
import { focusFirstElement, trapFocus, announceToScreenReader } from "@/lib/a11y";

// Focus the first focusable element in a container
focusFirstElement("modal-content");

// Trap focus within a modal and get cleanup function
const cleanup = trapFocus("modal-dialog");
// Later when modal closes
cleanup();

// Announce message to screen readers
announceToScreenReader("Item deleted successfully");
```

### useKeyboardNavigation Hook

```tsx
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

function KeyboardComponent() {
  const handleKeyDown = useKeyboardNavigation({
    "ArrowRight": (e) => {
      // Handle right arrow
    },
    "shift+tab": (e) => {
      // Handle shift+tab
    }
  });

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown}>
      Interactive element
    </div>
  );
}
```

## Best Practices

1. Always use semantic HTML elements when possible
2. Provide text alternatives for non-text content
3. Ensure all interactive elements are keyboard accessible
4. Use ARIA attributes only when necessary
5. Test with screen readers and keyboard navigation
6. Ensure sufficient color contrast
7. Announce dynamic content changes
8. Manage focus when content changes 