import { useState } from "react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const login = useLogin();
  const register = useRegister();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ username, password });
      setLocation("/inbox");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync({ username, password });
      setLocation("/inbox");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="mb-8 flex items-center gap-3 animate-in fade-in zoom-in duration-500">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
          <BookOpen size={24} strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Reader</h1>
      </div>

      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Enter your credentials to continue reading.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={login.isPending}>
                  {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Get started with your distraction-free reading list.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    minLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={register.isPending}>
                  {register.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
