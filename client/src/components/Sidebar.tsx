import { Link, useLocation } from "wouter";
import { 
  Inbox, 
  Layers, 
  Archive, 
  Highlighter, 
  LogOut, 
  Plus,
  BookOpen
} from "lucide-react";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useIngestArticle } from "@/hooks/use-articles";
import { useToast } from "@/hooks/use-toast";

export function Sidebar() {
  const [location] = useLocation();
  const logout = useLogout();
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const ingest = useIngestArticle();
  const { toast } = useToast();

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ingest.mutateAsync(url);
      setOpen(false);
      setUrl("");
      toast({ title: "Article saved", description: "It's now in your inbox." });
    } catch (err: any) {
      toast({ 
        title: "Failed to save", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const navItems = [
    { label: "Inbox", icon: Inbox, href: "/inbox" },
    { label: "Queue", icon: Layers, href: "/queue" },
    { label: "Archive", icon: Archive, href: "/archive" },
    { label: "Highlights", icon: Highlighter, href: "/highlights" },
  ];

  return (
    <aside className="w-64 h-screen border-r bg-card flex flex-col sticky top-0 hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-primary-foreground">
            <BookOpen size={18} strokeWidth={3} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Reader</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" size="lg">
              <Plus size={18} />
              Save Article
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save a new article</DialogTitle>
              <DialogDescription>
                Paste a URL below. We'll extract the content for distraction-free reading.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleIngest} className="space-y-4 pt-4">
              <Input 
                placeholder="https://example.com/article..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                className="text-base"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={ingest.isPending}>
                  {ingest.isPending ? "Saving..." : "Save Article"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"}
            `}>
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive gap-3"
          onClick={() => logout.mutate()}
        >
          <LogOut size={18} />
          Log out
        </Button>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const ingest = useIngestArticle();
  const { toast } = useToast();

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ingest.mutateAsync(url);
      setOpen(false);
      setUrl("");
      toast({ title: "Article saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="md:hidden border-b p-4 flex items-center justify-between bg-background sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-primary-foreground">
          <BookOpen size={18} strokeWidth={3} />
        </div>
        <span className="font-bold">Reader</span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus size={16} className="mr-2" /> Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Article</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleIngest} className="pt-4 space-y-4">
            <Input 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              placeholder="https://..."
            />
            <Button type="submit" className="w-full" disabled={ingest.isPending}>
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { label: "Inbox", icon: Inbox, href: "/inbox" },
    { label: "Queue", icon: Layers, href: "/queue" },
    { label: "Archive", icon: Archive, href: "/archive" },
    { label: "Notes", icon: Highlighter, href: "/highlights" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around p-2 z-20 pb-safe">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href} className={`
            flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors
            ${isActive ? "text-primary" : "text-muted-foreground"}
          `}>
            <item.icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
