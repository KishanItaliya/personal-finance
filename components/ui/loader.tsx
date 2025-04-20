'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  center?: boolean;
}

export const Loader = ({
  size = 'md',
  color = 'gray',
  className,
  center = false,
}: LoaderProps) => {
  // Size mappings
  const sizeMap = {
    sm: {
      dotSize: 'h-1.5 w-1.5',
      wrapper: 'gap-1',
    },
    md: {
      dotSize: 'h-2.5 w-2.5',
      wrapper: 'gap-1.5',
    },
    lg: {
      dotSize: 'h-3.5 w-3.5',
      wrapper: 'gap-2',
    },
  };

  // Color mappings
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    teal: 'bg-teal-500',
    gray: 'bg-gray-500',
    white: 'bg-white',
  };

  const bgColor = colorMap[color] || 'bg-indigo-500';
  const { dotSize, wrapper } = sizeMap[size];

  return (
    <div className={cn(
      "flex items-center", 
      wrapper, 
      center && "justify-center w-full h-full min-h-[100px]",
      className
    )}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "rounded-full animate-loader-bounce",
            dotSize,
            bgColor
          )}
          style={{
            animationDelay: `${index * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Loader; 