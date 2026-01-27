import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/AuthPage";
import Library from "@/pages/Library";
import Reader from "@/pages/Reader";
import Highlights from "@/pages/Highlights";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/">
        <Redirect to="/queue" />
      </Route>

      <Route path="/inbox">
        <ProtectedRoute component={() => <Library view="inbox" />} />
      </Route>
      
      <Route path="/queue">
        <ProtectedRoute component={() => <Library view="queue" />} />
      </Route>
      
      <Route path="/archive">
        <ProtectedRoute component={() => <Library view="archive" />} />
      </Route>

      <Route path="/highlights">
        <ProtectedRoute component={Highlights} />
      </Route>

      <Route path="/reader/:id">
        <ProtectedRoute component={Reader} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
