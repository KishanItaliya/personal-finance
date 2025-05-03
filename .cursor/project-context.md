# Personal Finance Dashboard - Project Context

## Project Overview
This is a personal finance dashboard built with Next.js, TypeScript, and various financial libraries. It helps users track expenses, income, investments, and overall financial health.

## Key Technologies
- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- Prisma (for database)
- Authentication (likely NextAuth)

## Project Structure
- `/app`: Next.js app router pages and layouts
- `/components`: Reusable UI components
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and shared logic
- `/services`: API services and data fetching
- `/types`: TypeScript type definitions
- `/prisma`: Database schema and migrations

## Naming Conventions
- Components: PascalCase (ExpenseChart.tsx)
- Hooks: camelCase with 'use' prefix (useTransactions.ts)
- Utilities: camelCase (formatCurrency.ts)
- Pages: kebab-case (expense-tracker.tsx)

## Common Patterns
- Components generally use functional components with TypeScript interfaces
- API calls are typically abstracted into service files
- Forms likely use React Hook Form for validation
- State management uses React hooks (useState, useReducer, useContext)

## Future Plans
- Expand financial tracking capabilities
- Add more visualization options
- Improve user experience and accessibility
- Add integration with financial APIs 