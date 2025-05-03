import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/Header';
import { authRoutes } from '@/lib/routes';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect(authRoutes.login);
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <nav aria-label="Main Navigation">
          <DashboardSidebar user={session.user} />
        </nav>
        
        <div className="flex-1 flex flex-col">
          <header>
            <DashboardHeader />
          </header>
          
          <main id="main-content" className="flex-1 overflow-auto">
            <div className="px-6 py-6 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
