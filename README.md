# Personal Finance Dashboard

A modern, secure, and user-friendly personal finance management application built with Next.js, TypeScript, and Tailwind CSS. This application helps users track their income and expenses, manage budgets, and visualize their financial data.

## Features

- 🔐 **Secure Authentication**: User authentication powered by NextAuth.js
- 💰 **Financial Management**: Track income, expenses, and transfers
- 📊 **Interactive Dashboard**: View financial overview with accounts and recent transactions
- 📋 **Budget Planning**: Create and manage budgets with category-based allocation
- 🎯 **Financial Goals**: Set and track progress towards your financial goals
- 📁 **Account Management**: Manage multiple financial accounts in one place
- 🏷️ **Category Organization**: Organize transactions with customizable categories
- 📈 **Visual Reports**: Analyze spending patterns through visual reports
- 📱 **Responsive Design**: Optimized for all devices from mobile to desktop
- 🔄 **Custom Loaders**: Consistent loading states across the application

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/), a collection of reusable components built with Radix UI and Tailwind CSS:

- **Cards**: Display account balances, transactions, and other information
- **Forms**: Modern form components with built-in validation
- **Date Picker**: Calendar-based date selection
- **Sidebar**: Responsive navigation with collapsible states
- **Breadcrumbs**: Context-aware navigation paths
- **Dropdown Menus**: User profile and additional actions
- **Buttons**: Various button styles for different actions
- **Tables**: Structured data presentation
- **Inputs**: Form controls with proper validation states
- **Loader**: Custom SyncLoader-style component for consistent loading states

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React framework with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [Prisma](https://www.prisma.io/) ORM with PostgreSQL
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://github.com/colinhacks/zod)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/) (recommended)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (or your preferred database supported by Prisma)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/KishanItaliya/personal-finance.git
   cd personal-finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="your_database_url"
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
personal-finance-dashboard/
├── app/                       # Next.js app directory (App Router)
│   ├── api/                   # API routes
│   ├── auth/                  # Authentication pages
│   ├── dashboard/             # Dashboard and main app pages
│   │   ├── accounts/          # Account management
│   │   ├── budgets/           # Budget management
│   │   ├── categories/        # Categories management
│   │   ├── goals/             # Financial goals
│   │   ├── reports/           # Financial reports
│   │   └── transactions/      # Transaction management
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Home page
├── components/                # React components
│   ├── forms/                 # Form components
│   │   ├── AddAccountForm.tsx
│   │   ├── AddBudgetForm.tsx
│   │   ├── AddCategoryForm.tsx
│   │   ├── AddGoalForm.tsx
│   │   └── AddTransactionForm.tsx
│   ├── ui/                    # UI components (shadcn/ui)
│   │   ├── loader.tsx         # Custom loader component
│   │   └── ...                # Other UI components
│   └── ...                    # Other component categories
├── lib/                       # Utility functions and configurations
│   ├── prisma.ts              # Prisma client configuration
│   └── utils.ts               # Utility functions
├── prisma/                    # Database schema and migrations
│   └── schema.prisma          # Prisma schema
├── public/                    # Static assets
├── styles/                    # Global styles
├── auth.ts                    # NextAuth configuration
├── middleware.ts              # Next.js middleware
├── next.config.js             # Next.js configuration
├── package.json               # Project dependencies
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Key Pages

- **Dashboard**: Overview of financial status, accounts, and recent transactions
- **Transactions**: Add, view, and manage transactions
- **Accounts**: Manage financial accounts (checking, savings, credit cards, etc.)
- **Categories**: Organize transaction categories
- **Budgets**: Create and track budgets
- **Goals**: Set and monitor financial goals
- **Reports**: View financial reports and analytics

## Custom Components

### Loader Component

The application includes a custom loader component (`components/ui/loader.tsx`) that provides consistent loading states throughout the application:

- Supports multiple sizes (sm, md, lg)
- Customizable colors (indigo, blue, green, red, etc.)
- Modeled after the popular SyncLoader style
- Used in all forms, page loading states, and button loading states

### Form Handling

All form components and API routes include proper handling of optional decimal fields:

- Empty string values for decimal fields (like interestRate, creditLimit) are converted to null
- Prevents Prisma validation errors for empty decimal fields
- Consistent handling of form submission data

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Form Components

The application includes several form components:

- **AddTransactionForm**: Create new transactions
- **AddAccountForm**: Add new financial accounts
- **AddCategoryForm**: Create transaction categories
- **AddBudgetForm**: Set up budgets with category allocations
- **AddGoalForm**: Create financial goals with progress tracking

## Recent Updates

- Added custom Loader component with SyncLoader-style animation
- Fixed handling of empty decimal fields in forms and API routes
- Enhanced UI consistency with standardized loading states
- Improved form validation and error handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue in the [GitHub repository](https://github.com/KishanItaliya/personal-finance).
