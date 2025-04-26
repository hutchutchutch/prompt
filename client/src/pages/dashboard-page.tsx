import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/dashboard-layout";
import { CalendarIcon, Timer, DollarSign, BarChart2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PromptTest } from "@/types";
import { Badge } from "@/components/ui/badge";
import { TaskCategorySelector } from "@/components/task-category-selector";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch recent tests
  const { data: recentTests, isLoading, error } = useQuery<PromptTest[]>({
    queryKey: ["/api/tests/recent"],
    staleTime: 60000, // 1 minute
  });

  // Status badges styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "running":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.username}
          </p>
        </div>
        <Button asChild>
          <Link href="/wizard">New Test</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                {recentTests?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">8.5</span>
              <span className="ml-1 text-sm text-gray-500">/10</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">$0.09</span>
              <span className="ml-1 text-sm text-gray-500">/test</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Saved Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">3</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Task Categories Section */}
      <div className="mb-8">
        <TaskCategorySelector />
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Tests</h2>
        
        {isLoading ? (
          <Card>
            <CardContent className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="h-40 flex items-center justify-center">
              <p className="text-sm text-gray-500">Error loading recent tests</p>
            </CardContent>
          </Card>
        ) : recentTests?.length === 0 ? (
          <Card>
            <CardContent className="h-40 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500 mb-4">You haven't run any tests yet</p>
              <Button asChild>
                <Link href="/wizard">Run your first test</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {recentTests?.map((test) => (
                <li key={test.id}>
                  <div className="block hover:bg-gray-50 cursor-pointer" onClick={() => 
                    navigate(test.status === "completed" ? `/results/${test.id}` : `/wizard/progress?testId=${test.id}`)
                  }>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-primary truncate">
                              {test.promptText.length > 50 
                                ? `${test.promptText.substring(0, 50)}...` 
                                : test.promptText}
                            </p>
                            <div className="ml-2">
                              {getStatusBadge(test.status)}
                            </div>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              <span>{formatDistanceToNow(new Date(test.createdAt), { addSuffix: true })}</span>
                            </div>
                            {test.redTeamEnabled && (
                              <div className="ml-4 flex items-center text-sm text-gray-500">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Red-team enabled</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
