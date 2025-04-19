import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <DashboardSidebar user={session.user} />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <div className="flex-1 overflow-auto">
            <div className="px-6 py-6 max-w-6xl mx-auto w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
