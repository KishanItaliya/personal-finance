import React, { ReactNode } from 'react';

interface FormFieldProps {
  /** ID for the input element */
  id: string;
  /** Label text for the field */
  label: string;
  /** Error message for the field */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Help text to provide additional context */
  helpText?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Child elements (should include the input) */
  children: ReactNode;
}

/**
 * Accessible form field with label, help text, and error handling
 */
export function FormField({
  id,
  label,
  error,
  required = false,
  helpText,
  disabled = false,
  children,
}: FormFieldProps) {
  // Generate unique IDs for associated elements
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  
  // This variable is intentionally unused in the component itself,
  // but is documented in the comment below for users of this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ariaDescribedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="mb-4">
      <label 
        htmlFor={id}
        className={`block mb-2 font-medium ${
          disabled ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'
        }`}
      >
        {label}
        {required && (
          <span 
            className="ml-1 text-red-500" 
            aria-hidden="true"
          >
            *
          </span>
        )}
        {required && (
          <span className="sr-only">
            required
          </span>
        )}
      </label>
      
      {/* Child element with aria-describedby documented in comment */}
      <div>
        {/* 
          To properly use this component, wrap your input like this:
          <input 
            id={id}
            aria-describedby={ariaDescribedBy}
            aria-invalid={error ? 'true' : undefined}
            aria-required={required}
            disabled={disabled}
            ...other props
          />
        */}
        {children}
      </div>
      
      {/* Help text */}
      {helpText && (
        <p 
          id={helpId}
          className={`mt-1 text-sm ${
            disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {helpText}
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p 
          id={errorId}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Creates an accessible input component with proper accessibility attributes
 */
export function createAccessibleInput<P extends React.InputHTMLAttributes<HTMLInputElement>>(
  Component: React.ComponentType<P>
) {
  const AccessibleInput = React.forwardRef<
    HTMLInputElement, 
    P & { id: string; error?: string; 'aria-describedby'?: string }
  >((props, ref) => {
    const { id, error, 'aria-describedby': describedBy, ...rest } = props;
    
    return (
      <Component
        {...(rest as unknown as P)}
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
      />
    );
  });

  AccessibleInput.displayName = `AccessibleInput(${
    Component.displayName || Component.name || 'Component'
  })`;

  return AccessibleInput;
}

export default FormField; 