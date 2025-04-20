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
import { User } from "lucide-react";
import LogoutButton from '@/components/ui/LogoutButton';
import { navItems, userMenuItems, dashboardRoutes } from '@/lib/routes';

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  
  // Helper function to determine if a route is active
  const isRouteActive = (path: string): boolean => {
    // Handle dashboard root as a special case
    if (path === dashboardRoutes.index) {
      return pathname === dashboardRoutes.index;
    }

    // For exact matches
    if (pathname === path) return true;
    
    // For subroutes (check if the pathname starts with the path)
    // Only consider it a match if it's a subroute and not just a partial string match
    if (path !== '/' && pathname.startsWith(path + '/')) return true;
    
    return false;
  };
  
  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-start px-4">
        <span className="text-xl font-bold text-primary pt-2.5">Finance Tracker</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={isRouteActive(item.path)}>
                  <Link href={item.path} className="flex items-center">
                    <Icon className="mx-2 h-5 w-5" />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
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
            {userMenuItems.map((item) => {
              if (item.isLogout) {
                return (
                  <DropdownMenuItem key={item.path}>
                    <LogoutButton />
                  </DropdownMenuItem>
                );
              }
              
              return (
                <DropdownMenuItem key={item.path} asChild>
                  <Link href={item.path}>{item.label}</Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
} 