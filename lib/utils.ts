import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  // Handle null, undefined or NaN values
  if (amount === null || amount === undefined) {
    return '₹0.00';
  }

  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN
  if (isNaN(numericAmount)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericAmount);
}

/**
 * Check if a value is positive
 * Used for styling financial amounts (green for positive, red for negative)
 */
export function isPositiveAmount(amount: number | string | null | undefined): boolean {
  if (amount === null || amount === undefined) {
    return true;
  }
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return true;
  }
  
  return numericAmount >= 0;
}
