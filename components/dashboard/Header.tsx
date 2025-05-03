'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import { dashboardRoutes } from '@/lib/routes';
import { announceToScreenReader } from '@/lib/a11y';

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
  // Keeping the prop for future use but not using it currently
  showAddTransactionButton?: boolean;
}

export function DashboardHeader({ 
  // Using default parameter but not referencing it in the component body
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showAddTransactionButton = true 
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const breadcrumbItems = generateBreadcrumbItems(pathname);

  // Announce page changes to screen readers
  React.useEffect(() => {
    // Get current page name from the last breadcrumb item or default to Dashboard
    const currentPage = breadcrumbItems.length > 0 
      ? breadcrumbItems[breadcrumbItems.length - 1].name 
      : 'Dashboard';
      
    announceToScreenReader(`Navigated to ${currentPage} page`);
  }, [pathname, breadcrumbItems]);

  return (
    <div className="flex h-16 items-center gap-4 border-b px-6 shrink-0">
      <SidebarTrigger aria-label="Toggle sidebar menu" />
      
      <Breadcrumb aria-label="Breadcrumb navigation">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={dashboardRoutes.index} aria-label="Home">
                <Home className="h-4 w-4" aria-hidden="true" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumbItems.map((segment) => (
            <React.Fragment key={segment.path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {segment.isActive ? (
                  <BreadcrumbPage aria-current="page">{segment.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={segment.path}>{segment.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Add Transaction button commented out for now */}
      {/* {showAddTransactionButton && (
        <div className="ml-auto">
          <Button size="sm" variant="outline" asChild>
            <Link href={dashboardRoutes.transactions.create}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add Transaction
            </Link>
          </Button>
        </div>
      )} */}
    </div>
  );
} 