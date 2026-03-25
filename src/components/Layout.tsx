import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useUser();

  if (!user) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background bg-grid scanline">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-12 flex items-center border-b border-border px-4">
            <SidebarTrigger className="text-muted-foreground hover:text-primary" />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
