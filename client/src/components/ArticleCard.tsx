import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2, Archive, Inbox, ExternalLink, Play } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useDeleteArticle, useUpdateArticle } from "@/hooks/use-articles";
import { useToast } from "@/hooks/use-toast";

interface ArticleCardProps {
  article: any;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const deleteMutation = useDeleteArticle();
  const updateMutation = useUpdateArticle(article.id);
  const { toast } = useToast();

  const handleStatusChange = (status: 'inbox' | 'queue' | 'archive') => {
    updateMutation.mutate({ status });
    toast({ description: `Moved to ${status}` });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteMutation.mutate(article.id);
    }
  };

  // Estimate read time: 200 words per minute
  const readTime = Math.ceil((article.wordCount || 0) / 200);

  return (
    <div className="group relative bg-card hover:bg-muted/30 border-b last:border-0 p-6 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/reader/${article.id}`} className="block">
            <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {article.title}
            </h3>
          </Link>
          
          <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground">
            {article.domain && (
              <span className="flex items-center gap-1 text-foreground/80 font-medium">
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${article.domain}&sz=32`} 
                  alt="" 
                  className="w-4 h-4 opacity-70"
                />
                {article.domain}
              </span>
            )}
            <span>•</span>
            <span>{readTime} min read</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(article.savedAt), { addSuffix: true })}</span>
            
            {article.readProgress > 0 && article.readProgress < 1 && (
              <span className="text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full text-xs">
                {Math.round(article.readProgress * 100)}% read
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link href={`/reader/${article.id}`}>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Play size={16} fill="currentColor" className="opacity-50" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(article.url, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open Original
              </DropdownMenuItem>
              {article.status !== 'queue' && (
                <DropdownMenuItem onClick={() => handleStatusChange('queue')}>
                  <Inbox className="mr-2 h-4 w-4" /> Move to Queue
                </DropdownMenuItem>
              )}
              {article.status !== 'archive' && (
                <DropdownMenuItem onClick={() => handleStatusChange('archive')}>
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
