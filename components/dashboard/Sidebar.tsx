'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  CreditCard, 
  LayoutDashboard, 
  ListChecks, 
  Target, 
  User, 
  Calculator,
} from "lucide-react";
import LogoutButton from '@/components/ui/LogoutButton';

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="mx-2 h-5 w-5" />,
  },
  {
    path: '/dashboard/transactions',
    label: 'Transactions',
    icon: <ListChecks className="mx-2 h-5 w-5" />,
  },
  {
    path: '/dashboard/accounts',
    label: 'Accounts',
    icon: <CreditCard className="mx-2 h-5 w-5" />,
  },
  {
    path: '/dashboard/categories',
    label: 'Categories',
    icon: <Calculator className="mx-2 h-5 w-5" />,
  },
  {
    path: '/dashboard/budgets',
    label: 'Budgets',
    icon: <ListChecks className="mx-2 h-5 w-5" />,
  },
  {
    path: '/dashboard/goals',
    label: 'Goals',
    icon: <Target className="mx-2 h-5 w-5" />,
  },
  {
    path: '/dashboard/reports',
    label: 'Reports',
    icon: <BarChart3 className="mx-2 h-5 w-5" />,
  },
];

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  
  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-start px-4">
        <span className="text-xl font-bold text-primary pt-2.5">Finance Tracker</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={pathname === item.path}>
                <Link href={item.path} className="flex items-center">
                  {item.icon}
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-full justify-start gap-2">
              <User className="h-4 w-4" />
              {user.name || user.email}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
} 