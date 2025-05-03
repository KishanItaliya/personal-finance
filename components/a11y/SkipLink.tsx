import React from 'react';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

export function SkipLink({ 
  targetId, 
  label = 'Skip to main content'
}: SkipLinkProps) {
  return (
    <a 
      href={`#${targetId}`}
      className="absolute left-0 top-0 -translate-y-full p-2 focus:translate-y-0 bg-primary text-primary-foreground z-50 transition-transform"
    >
      {label}
    </a>
  );
}

export default SkipLink; 