import React, { useEffect, useRef, useState } from 'react';
import { trapFocus } from '@/lib/a11y';

interface AccessibleModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to call when the modal should close */
  onClose: () => void;
  /** Modal title (for accessibility) */
  title: string;
  /** Modal content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: AccessibleModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalId = useRef(`modal-${Math.random().toString(36).substr(2, 9)}`);

  // Handle mounting/unmounting with animation
  useEffect(() => {
    if (isOpen && !mounted) {
      setMounted(true);
    } else if (!isOpen && mounted) {
      const timer = setTimeout(() => {
        setMounted(false);
      }, 300); // Match this with your exit animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

  // Handle focus trapping
  useEffect(() => {
    if (!isOpen || !mounted) return;

    // Trap focus inside modal
    const cleanup = trapFocus(modalId.current);
    
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener for escape key
    document.addEventListener('keydown', handleEscape);
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    
    // Cleanup
    return () => {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, mounted, onClose]);

  // Handle clicks outside modal
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } transition-opacity duration-300`}
      onClick={handleOutsideClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        id={modalId.current}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${modalId.current}-title`}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform ${
          isOpen ? 'scale-100' : 'scale-95'
        } transition-transform duration-300 ${className}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 
            id={`${modalId.current}-title`} 
            className="text-xl font-semibold"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AccessibleModal; 