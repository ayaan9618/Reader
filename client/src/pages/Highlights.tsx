import { useHighlights, useDeleteHighlight } from "@/hooks/use-highlights";
import { Sidebar, MobileNav, MobileHeader } from "@/components/Sidebar";
import { Loader2, Trash2, Quote, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Highlights() {
  const { data: highlights, isLoading } = useHighlights();
  const deleteHighlight = useDeleteHighlight();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <MobileHeader />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full p-4 md:p-8 pb-24">
            
            <header className="mb-8 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Highlights</h1>
              <p className="text-muted-foreground">Your collection of favorite passages.</p>
            </header>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : highlights?.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-dashed">
                <Quote className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">No highlights yet</h3>
                <p className="text-muted-foreground mt-1">Select text in any article to highlight it.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {highlights?.map((highlight: any) => (
                  <div key={highlight.id} className="bg-card p-6 rounded-xl border shadow-sm flex flex-col hover:border-primary/50 transition-colors">
                    <div className="flex-1 mb-4">
                      <Quote className="h-6 w-6 text-primary/40 mb-3" />
                      <blockquote className="font-serif text-lg leading-relaxed text-foreground/90">
                        "{highlight.textContent}"
                      </blockquote>
                    </div>
                    
                    <div className="pt-4 border-t flex items-center justify-between mt-auto">
                      <div className="text-sm">
                        <Link href={`/reader/${highlight.articleId}`} className="font-medium hover:underline block truncate max-w-[150px]">
                          {highlight.articleTitle}
                        </Link>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar size={10} />
                          {format(new Date(highlight.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteHighlight.mutate(highlight.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
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
