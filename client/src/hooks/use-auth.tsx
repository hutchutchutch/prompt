import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthContextType = {
  user: Omit<SelectUser, "password"> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<SelectUser, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<SelectUser, "password">, Error, RegisterData>;
  demoLoginMutation: UseMutationResult<Omit<SelectUser, "password">, Error, void>;
};

// Extended user schema with email validation
const registerSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email address"),
  confirm_password: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Check for demo user in session storage
  const getDemoUser = () => {
    try {
      const storedUser = sessionStorage.getItem('demoUser');
      if (storedUser) {
        return JSON.parse(storedUser) as Omit<SelectUser, "password">;
      }
    } catch (err) {
      console.error("Error reading demo user from session storage:", err);
      sessionStorage.removeItem('demoUser');
    }
    return null;
  };
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<Omit<SelectUser, "password"> | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        // First check for demo user in session storage
        const demoUser = getDemoUser();
        if (demoUser) {
          return demoUser;
        }
        
        // Otherwise try the API
        const res = await fetch("/api/user");
        console.log("[useAuth] /api/user response status:", res.status);
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error("Failed to fetch user");
        }
        return await res.json();
      } catch (error) {
        console.error("Error in auth query:", error);
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back",
        description: "You've successfully logged in",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      // Remove confirm_password before sending to server
      const { confirm_password, ...registerData } = credentials;
      const res = await apiRequest("POST", "/api/register", registerData);
      return await res.json();
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created",
        description: "Your account has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Check if we have a demo user in session storage
      const isDemoMode = !!sessionStorage.getItem('demoUser');
      
      // If in demo mode, just clear the session storage
      if (isDemoMode) {
        sessionStorage.removeItem('demoUser');
        return;
      }
      
      // Otherwise, perform a real logout API call
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear any demo user data in session storage (just to be safe)
      sessionStorage.removeItem('demoUser');
      
      // Reset cached user data
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
      
      // Redirect to the auth page
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const demoLoginMutation = useMutation({
    mutationFn: async () => {
      // Call demo-login to set up the demo session
      const res = await apiRequest("POST", "/api/demo-login");
      if (!res.ok) {
        throw new Error("Failed to activate demo mode");
      }
      
      // Get the user data from the response
      const userData = await res.json();
      
      // Store demo user data in session storage for persistence
      sessionStorage.setItem('demoUser', JSON.stringify({
        ...userData,
        isDemoUser: true
      }));
      
      return userData;
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      // Update the user data in cache
      queryClient.setQueryData(["/api/user"], user);
      
      toast({
        title: "Demo Mode Activated",
        description: "Welcome to PromptLab demo",
        variant: "default",
      });
      
      // Force a full page reload to dashboard to ensure clean state with demo data
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      console.error("Demo login error:", error);
      // Clear any existing demo data to be safe
      sessionStorage.removeItem('demoUser');
      
      toast({
        title: "Demo login failed",
        description: "Failed to start demo mode. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        demoLoginMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
