import { 
  LayoutDashboard, 
  ListChecks, 
  CreditCard, 
  Calculator, 
  Target, 
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  PlusCircle
} from "lucide-react";

/**
 * Application routes configuration
 * 
 * This file centralizes all routes used in the application.
 * Use these constants instead of hardcoding paths in components.
 */

/**
 * Auth routes
 */
export const authRoutes = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
};

/**
 * Dashboard routes
 */
export const dashboardRoutes = {
  index: '/dashboard',
  transactions: {
    index: '/dashboard/transactions',
    create: '/dashboard/transactions/create',
    edit: (id: string) => `/dashboard/transactions/${id}/edit`,
    view: (id: string) => `/dashboard/transactions/${id}`,
  },
  accounts: {
    index: '/dashboard/accounts',
    create: '/dashboard/accounts/create',
    edit: (id: string) => `/dashboard/accounts/${id}/edit`,
    view: (id: string) => `/dashboard/accounts/${id}`,
  },
  categories: {
    index: '/dashboard/categories',
    create: '/dashboard/categories/create',
    edit: (id: string) => `/dashboard/categories/${id}/edit`,
  },
  budgets: {
    index: '/dashboard/budgets',
    create: '/dashboard/budgets/create',
    edit: (id: string) => `/dashboard/budgets/${id}/edit`,
    view: (id: string) => `/dashboard/budgets/${id}`,
  },
  goals: {
    index: '/dashboard/goals',
    create: '/dashboard/goals/create',
    edit: (id: string) => `/dashboard/goals/${id}/edit`,
    view: (id: string) => `/dashboard/goals/${id}`,
  },
  reports: '/dashboard/reports',
};

/**
 * User routes
 */
export const userRoutes = {
  profile: '/profile',
  settings: '/settings',
};

/**
 * Quick action routes
 */
export const quickActionRoutes = [
  {
    label: 'Add a new transaction',
    path: dashboardRoutes.transactions.create,
    icon: PlusCircle,
  },
  {
    label: 'Create a new account',
    path: dashboardRoutes.accounts.create,
    icon: PlusCircle,
  },
  {
    label: 'Manage your categories',
    path: dashboardRoutes.categories.index,
    icon: PlusCircle,
  },
  {
    label: 'View financial reports',
    path: dashboardRoutes.reports,
    icon: PlusCircle,
  },
];

/**
 * Navigation items for the sidebar
 */
export const navItems = [
  {
    path: dashboardRoutes.index,
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: dashboardRoutes.transactions.index,
    label: 'Transactions',
    icon: ListChecks,
  },
  {
    path: dashboardRoutes.accounts.index,
    label: 'Accounts',
    icon: CreditCard,
  },
  {
    path: dashboardRoutes.categories.index,
    label: 'Categories',
    icon: Calculator,
  },
  {
    path: dashboardRoutes.budgets.index,
    label: 'Budgets',
    icon: ListChecks,
  },
  {
    path: dashboardRoutes.goals.index,
    label: 'Goals',
    icon: Target,
  },
  {
    path: dashboardRoutes.reports,
    label: 'Reports',
    icon: BarChart3,
  },
];

/**
 * User dropdown menu items
 */
export const userMenuItems = [
  {
    path: userRoutes.profile,
    label: 'Profile',
    icon: UserCircle,
  },
  {
    path: userRoutes.settings,
    label: 'Settings',
    icon: Settings,
  },
  {
    path: authRoutes.login,
    label: 'Logout',
    icon: LogOut,
    isLogout: true,
  },
]; 