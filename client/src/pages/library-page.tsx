import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  Search, 
  Shield, 
  Eye, 
  RefreshCw, 
  Trash2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SavedPrompt } from "@/types";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";

export default function LibraryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletePromptId, setDeletePromptId] = useState<number | null>(null);
  
  // Fetch saved prompts
  const { data: savedPrompts, isLoading, error } = useQuery<SavedPrompt[]>({
    queryKey: ["/api/library"],
  });
  
  // Delete saved prompt mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/library/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete prompt");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      toast({
        title: "Prompt deleted",
        description: "The prompt has been removed from your library",
      });
      setDeletePromptId(null);
    },
    onError: (error) => {
      toast({
        title: "Error deleting prompt",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Filter prompts based on search term
  const filteredPrompts = searchTerm.trim() === ""
    ? savedPrompts
    : savedPrompts?.filter(prompt => 
        prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prompt.category && prompt.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  const handleDelete = (id: number) => {
    setDeletePromptId(id);
  };
  
  const confirmDelete = () => {
    if (deletePromptId) {
      deleteMutation.mutate(deletePromptId);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Your Prompt Library</h1>
        <div className="flex items-center space-x-2">
          <div className="relative rounded-md shadow-sm">
            <Input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <Button asChild>
            <Link href="/wizard">
              New Test
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="h-40 flex items-center justify-center">
            <p className="text-sm text-gray-500">Error loading your prompt library</p>
          </CardContent>
        </Card>
      ) : !savedPrompts || savedPrompts.length === 0 ? (
        <Card>
          <CardContent className="h-40 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-500 mb-4">Your library is empty</p>
            <Button asChild>
              <Link href="/wizard">Create your first prompt</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredPrompts?.length === 0 ? (
        <Card>
          <CardContent className="h-40 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-500 mb-4">No prompts match your search</p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPrompts?.map((prompt) => (
              <li key={prompt.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-primary truncate">{prompt.name}</p>
                        {prompt.category && (
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                            in {prompt.category}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-y-2">
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>
                            Last updated {formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {prompt.nextScheduled && (
                          <div className="flex items-center text-sm text-gray-500 mr-4">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>
                              Next run: {formatDistanceToNow(new Date(prompt.nextScheduled), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          <Shield className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>Vulnerabilities: None</span>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          Test #{prompt.testId}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0 flex items-center space-x-4">
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Score: 9.2
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/results/${prompt.testId}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Results</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/wizard?testId=${prompt.testId}`}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              <span>Re-run Test</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(prompt.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deletePromptId !== null} onOpenChange={(open) => !open && setDeletePromptId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this prompt from your library.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
