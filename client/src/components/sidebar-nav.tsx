import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  LogOut, 
  Settings
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "New Evaluation",
    href: "/wizard",
    icon: FileText,
  },
  {
    title: "History",
    href: "/library",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Check if user has admin role
  const isAdmin = user?.role === "admin";
  
  // Add admin link if user is an admin
  const items = isAdmin ? [
    ...navItems,
    {
      title: "Admin",
      href: "/admin",
      icon: Settings,
    },
  ] : navItems;

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {items.map((item) => (
        <div key={item.href} className="w-full">
          <Link href={item.href}>
            <div
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                location === item.href
                  ? "bg-primary/10 text-primary dark:bg-[hsl(var(--sidebar-dark-primary))]/20 dark:text-[hsl(var(--sidebar-dark-primary))]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground dark:text-[hsl(var(--sidebar-dark-foreground))]/80 dark:hover:bg-[hsl(var(--sidebar-dark-accent))] dark:hover:text-[hsl(var(--sidebar-dark-foreground))]"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.title}</span>
            </div>
          </Link>
        </div>
      ))}
      
      <button
        onClick={() => logoutMutation.mutate()}
        className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground dark:text-[hsl(var(--sidebar-dark-foreground))]/80 dark:hover:bg-[hsl(var(--sidebar-dark-accent))] dark:hover:text-[hsl(var(--sidebar-dark-foreground))] mt-auto"
      >
        <LogOut className="mr-3 h-5 w-5" />
        <span>Sign out</span>
      </button>
    </nav>
  );
}
