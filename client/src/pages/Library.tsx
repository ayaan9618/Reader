import { useArticles } from "@/hooks/use-articles";
import { Sidebar, MobileNav, MobileHeader } from "@/components/Sidebar";
import { ArticleCard } from "@/components/ArticleCard";
import { Loader2, Search, Inbox, Layers, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LibraryProps {
  view: 'inbox' | 'queue' | 'archive';
}

const titles = {
  inbox: "Inbox",
  queue: "Reading Queue",
  archive: "Archive"
};

const icons = {
  inbox: Inbox,
  queue: Layers,
  archive: Archive
};

export default function Library({ view }: LibraryProps) {
  const [search, setSearch] = useState("");
  const { data: articles, isLoading, error } = useArticles(view, search);

  const Icon = icons[view];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <MobileHeader />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full p-4 md:p-8 pb-24">
            
            <header className="mb-8 space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground mb-2">
                <Icon size={20} />
                <span className="uppercase tracking-widest text-xs font-bold">Library</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{titles[view]}</h1>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9 bg-muted/50 border-none" 
                  placeholder="Filter articles..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </header>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                Error loading articles. Please try again.
              </div>
            ) : articles?.length === 0 ? (
              <div className="text-center py-20 border rounded-xl border-dashed">
                <Icon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">No articles found</h3>
                <p className="text-muted-foreground mt-1">
                  {search ? "Try a different search term" : "Save some articles to get started"}
                </p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden shadow-sm">
                {articles?.map((article: any) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}
