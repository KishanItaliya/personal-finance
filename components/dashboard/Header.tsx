'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, Plus } from 'lucide-react';
import { dashboardRoutes } from '@/lib/routes';

interface RouteSegment {
  name: string;
  path: string;
  isActive: boolean;
}

const generateBreadcrumbItems = (pathname: string): RouteSegment[] => {
  if (pathname === '/') return [];

  const segments = pathname.split('/').filter(Boolean);
  
  return segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    const isActive = index === segments.length - 1;
    
    // Format segment name (capitalize first letter, replace hyphens with spaces)
    const name = segment
      .replace(/-/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());
    
    return {
      name,
      path,
      isActive,
    };
  });
};

interface DashboardHeaderProps {
  showAddTransactionButton?: boolean;
}

export function DashboardHeader({ showAddTransactionButton = true }: DashboardHeaderProps) {
  const pathname = usePathname();
  const breadcrumbItems = generateBreadcrumbItems(pathname);

  return (
    <div className="flex h-16 items-center gap-4 border-b px-6 shrink-0">
      <SidebarTrigger />
      
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={dashboardRoutes.index}>
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumbItems.map((segment) => (
            <React.Fragment key={segment.path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {segment.isActive ? (
                  <BreadcrumbPage>{segment.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={segment.path}>
                    {segment.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* {showAddTransactionButton && (
        <div className="ml-auto">
          <Button size="sm" variant="outline" asChild>
            <Link href={dashboardRoutes.transactions.create}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        </div>
      )} */}
    </div>
  );
} 