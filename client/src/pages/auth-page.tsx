import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const { user, loginMutation, registerMutation, demoLoginMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

  // Login Form
  const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({
      username: values.username,
      password: values.password,
    }, {
      onSuccess: () => {
        navigate("/dashboard");
      }
    });
  }

  // Registration Form
  const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Password must be at least 6 characters"),
  }).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate(values, {
      onSuccess: () => {
        navigate("/dashboard");
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {activeTab === "signin" ? "Sign in to PromptLab" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {activeTab === "signin" ? (
              <>
                Or{" "}
                <button 
                  className="font-medium text-primary hover:text-primary/80"
                  onClick={() => setActiveTab("signup")}
                >
                  create a new account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button 
                  className="font-medium text-primary hover:text-primary/80"
                  onClick={() => setActiveTab("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-6">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username or Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your username or email" 
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                              Forgot password?
                            </a>
                          </div>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              placeholder="Enter your password" 
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Remember me</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Button 
                      variant="default" 
                      className="w-full" 
                      type="button"
                      onClick={() => demoLoginMutation.mutate()}
                      disabled={demoLoginMutation.isPending}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                      </svg>
                      {demoLoginMutation.isPending ? "Starting demo..." : "Try Demo"}
                    </Button>
                    
                    <Button variant="outline" className="w-full" type="button">
                      <svg className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                        <path d="M10 6a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V7a1 1 0 011-1z" />
                      </svg>
                      Email Magic Link
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Choose a username" 
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email" 
                              placeholder="Enter your email" 
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              placeholder="Create a password" 
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              placeholder="Confirm your password" 
                              disabled={registerMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <p className="text-xs text-gray-500 text-center">
                    By signing up, you agree to our{" "}
                    <a href="#" className="text-primary hover:text-primary/80">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:text-primary/80">Privacy Policy</a>.
                  </p>
                </div>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or try instantly</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      variant="default" 
                      className="w-full" 
                      type="button"
                      onClick={() => demoLoginMutation.mutate()}
                      disabled={demoLoginMutation.isPending}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-white mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                      </svg>
                      {demoLoginMutation.isPending ? "Starting demo..." : "Try Demo (No Sign Up)"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
