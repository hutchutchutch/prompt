import { useAuth } from "@/hooks/use-auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const isMobile = useMobile();
  
  // User avatar display - show first letter of username if available
  const userInitial = user?.username ? user.username[0].toUpperCase() : "U";
  const isDemo = user?.role === "demo";
  
  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="bg-primary text-primary-foreground text-center py-1 px-4 text-sm font-medium flex items-center justify-center">
          <span className="mr-2">🔍</span>
          <span>Demo Mode - Explore PromptLab features with pre-loaded data</span>
        </div>
      )}
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-card dark:bg-[hsl(var(--sidebar-dark-background))] border-r border-border dark:border-[hsl(var(--sidebar-dark-border))]">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <svg className="h-8 w-8 text-primary dark:text-[hsl(var(--sidebar-dark-primary))]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
              </svg>
              <span className="ml-2 text-xl font-bold text-card-foreground dark:text-[hsl(var(--sidebar-dark-foreground))]">PromptLab</span>
            </div>
            <div className="mt-5 flex-1 px-2">
              <SidebarNav />
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t border-border dark:border-[hsl(var(--sidebar-dark-border))] p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="inline-block h-9 w-9 rounded-full bg-muted dark:bg-[hsl(var(--sidebar-dark-accent))] text-muted-foreground dark:text-[hsl(var(--sidebar-dark-accent-foreground))] flex items-center justify-center">
                  {userInitial}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-card-foreground dark:text-[hsl(var(--sidebar-dark-foreground))] group-hover:text-foreground">
                    {user?.username}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-[hsl(var(--sidebar-dark-foreground))]/80">
                    {user?.role === "admin" ? "Admin" : user?.role === "demo" ? "Demo User" : "Pro Subscriber"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-card border-b border-border flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-primary dark:text-[hsl(var(--sidebar-dark-primary))]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
          </svg>
          <span className="ml-2 text-xl font-bold">PromptLab</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex-1 flex flex-col min-h-0 bg-card dark:bg-[hsl(var(--sidebar-dark-background))] h-full">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <svg className="h-8 w-8 text-primary dark:text-[hsl(var(--sidebar-dark-primary))]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                  </svg>
                  <span className="ml-2 text-xl font-bold text-card-foreground dark:text-[hsl(var(--sidebar-dark-foreground))]">PromptLab</span>
                </div>
                <div className="mt-5 flex-1 px-2">
                  <SidebarNav />
                </div>
              </div>
              <div className="flex-shrink-0 flex border-t border-border dark:border-[hsl(var(--sidebar-dark-border))] p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div className="inline-block h-9 w-9 rounded-full bg-muted dark:bg-[hsl(var(--sidebar-dark-accent))] text-muted-foreground dark:text-[hsl(var(--sidebar-dark-accent-foreground))] flex items-center justify-center">
                      {userInitial}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-card-foreground dark:text-[hsl(var(--sidebar-dark-foreground))] group-hover:text-foreground">
                        {user?.username}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground dark:text-[hsl(var(--sidebar-dark-foreground))]/80">
                        {user?.role === "admin" ? "Admin" : user?.role === "demo" ? "Demo User" : "Pro Subscriber"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop project selector header */}
      <div className="hidden md:flex md:pl-64 h-16 border-b border-border bg-card">
        <div className="flex-1 px-4 flex justify-between items-center">
          <div className="flex-1 flex items-center">
            <div className="max-w-xs w-64">
              <label htmlFor="project-select" className="sr-only">Select Project</label>
              <select 
                id="project-select" 
                className="block w-full pl-3 pr-10 py-2 text-base bg-card border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option>All Projects</option>
                <option>Summarization Benchmark</option>
                <option>Classification Model Comparison</option>
                <option>Content Generation Tests</option>
              </select>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            {/* Add any additional header elements here */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
