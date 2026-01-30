import { useEffect, useState } from "react";
import { useLocation, Redirect } from "wouter";
import { useIngestArticle } from "@/hooks/use-articles";
import { useUser } from "@/hooks/use-auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ShareHandler() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const ingest = useIngestArticle();
  const { toast } = useToast();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract URL from query parameters
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url');
    const sharedTitle = params.get('title');
    const sharedText = params.get('text');

    // If not logged in, redirect to auth
    if (!userLoading && !user) {
      // Store share data in sessionStorage to restore after login
      if (sharedUrl) {
        sessionStorage.setItem('pendingShare', JSON.stringify({
          url: sharedUrl,
          title: sharedTitle || '',
          text: sharedText || ''
        }));
      }
      setLocation('/auth');
      return;
    }

    // If logged in and have URL, save the article
    if (user && sharedUrl && status === 'processing') {
      handleShare(sharedUrl);
    } else if (user && !sharedUrl) {
      // No URL provided, redirect to home
      setStatus('error');
      setError('No URL provided');
      setTimeout(() => setLocation('/home'), 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  const handleShare = async (url: string) => {
    try {
      await ingest.mutateAsync(url);
      setStatus('success');
      toast({ title: "Article saved", description: "Successfully saved to your library" });
      
      // Redirect to home after 1.5 seconds
      setTimeout(() => {
        setLocation('/home');
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to save article');
      toast({ 
        title: "Error", 
        description: err.message || "Failed to save article", 
        variant: "destructive" 
      });
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        setLocation('/home');
      }, 3000);
    }
  };

  // Check for pending share after login
  useEffect(() => {
    if (user && !userLoading && status === 'processing') {
      const pendingShare = sessionStorage.getItem('pendingShare');
      if (pendingShare) {
        try {
          const { url } = JSON.parse(pendingShare);
          sessionStorage.removeItem('pendingShare');
          handleShare(url);
        } catch (err) {
          console.error('Failed to parse pending share:', err);
          setStatus('error');
          setError('Failed to process shared article');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-6">
        {status === 'processing' && (
          <>
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Saving article...</h2>
            <p className="text-muted-foreground">Please wait while we save this article to your library.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">Article saved!</h2>
            <p className="text-muted-foreground">Redirecting to your library...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Failed to save</h2>
            <p className="text-muted-foreground">{error || 'An error occurred'}</p>
            <Button onClick={() => setLocation('/home')} variant="outline" className="mt-4">
              Go to Library
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
