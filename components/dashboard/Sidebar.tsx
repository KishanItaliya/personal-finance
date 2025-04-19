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
import { navItems, userMenuItems } from '@/lib/routes';

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
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={pathname === item.path}>
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