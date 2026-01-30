import { useEffect, useRef, useState, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { useArticle, useUpdateArticle } from "@/hooks/use-articles";
import { useCreateHighlight } from "@/hooks/use-highlights";
import { useSpeech } from "@/hooks/use-speech";
import { ArrowLeft, Loader2, Play, Pause, Highlighter, MoreVertical, Archive, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Reader() {
  const [, params] = useRoute("/reader/:id");
  const id = parseInt(params?.id || "0");
  const { data: article, isLoading } = useArticle(id);
  const updateArticle = useUpdateArticle(id);
  const createHighlight = useCreateHighlight();
  const { toast } = useToast();
  
  const speechControls = useSpeech();
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Auto-hide header on scroll (Matter-style)
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const current = latest;
    const previous = lastScrollY.current;
    
    if (current < previous && current > 100) {
      // Scrolling up
      setHeaderVisible(true);
    } else if (current > previous && current > 200) {
      // Scrolling down
      setHeaderVisible(false);
    }
    lastScrollY.current = current;
  });

  // Highlight tooltip state
  const [highlightTooltip, setHighlightTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: "" });

  // Setup speech text when article loads
  useEffect(() => {
    if (article?.textContent) {
      speechControls.setText(article.textContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.textContent]);

  // Handle text selection for highlights (Matter-style floating tooltip)
  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setHighlightTooltip({ visible: false, x: 0, y: 0, text: "" });
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 5) {
      setHighlightTooltip({ visible: false, x: 0, y: 0, text: "" });
      return;
    }

    // Get selection position for tooltip
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setHighlightTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
    });
  }, []);

  // Close tooltip on click outside
  useEffect(() => {
    if (!highlightTooltip.visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.highlight-tooltip')) {
        window.getSelection()?.removeAllRanges();
        setHighlightTooltip({ visible: false, x: 0, y: 0, text: "" });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [highlightTooltip.visible]);

  const handleHighlight = useCallback(async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (text.length < 5) return;

    try {
      await createHighlight.mutateAsync({
        articleId: id,
        textContent: text,
        colorHex: "#FFD60A",
      });
      toast({ description: "Highlight saved" });
      selection.removeAllRanges();
      setHighlightTooltip({ visible: false, x: 0, y: 0, text: "" });
    } catch (err) {
      toast({ variant: "destructive", description: "Failed to save highlight" });
    }
  }, [id, createHighlight, toast]);

  // Save read progress on scroll
  const updateArticleRef = useRef(updateArticle);
  updateArticleRef.current = updateArticle;

  useEffect(() => {
    let ticking = false;
    let lastProgress = 0;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
          
          // Only update if progress changed significantly (avoid too many updates)
          if (Math.abs(progress - lastProgress) > 0.05 && progress > 0.1 && progress < 0.99) {
            lastProgress = progress;
            updateArticleRef.current.mutate({ readProgress: progress });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      if (progress > 0.1) {
        updateArticleRef.current.mutate({ readProgress: progress });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );

  if (!article) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-muted-foreground">Article not found</div>
    </div>
  );

  return (
    <div 
      className="min-h-screen bg-background text-foreground relative" 
      onMouseUp={handleSelection}
      onTouchEnd={handleSelection}
    >
      {/* Reading Progress Bar (Matter-style thin top bar) */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-primary/80 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Auto-hiding Header (Matter-style) */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: headerVisible ? 0 : -64 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href={`/${article.status === 'inbox' ? 'home' : article.status || 'queue'}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              <ArrowLeft size={18} />
            </Button>
          </Link>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={speechControls.isPlaying ? speechControls.pause : speechControls.play}
              className={`h-9 w-9 p-0 ${speechControls.isPlaying ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {speechControls.isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => {
                    updateArticle.mutate({ status: 'archive' });
                    window.history.back();
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Article
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Floating Highlight Tooltip (Matter-style) */}
      {highlightTooltip.visible && (
        <motion.div
          initial={{ opacity: 0, y: highlightTooltip.y - 10, scale: 0.95 }}
          animate={{ opacity: 1, y: highlightTooltip.y - 50, scale: 1 }}
          exit={{ opacity: 0, y: highlightTooltip.y - 10, scale: 0.95 }}
          className="fixed z-50 highlight-tooltip"
          style={{ left: highlightTooltip.x, top: highlightTooltip.y }}
        >
          <div className="flex items-center gap-1 bg-foreground text-background px-3 py-1.5 rounded-full shadow-xl -translate-x-1/2">
            <button
              className="h-7 px-3 text-sm font-medium text-background hover:bg-background/20 rounded-full transition-colors flex items-center gap-1.5"
              onClick={handleHighlight}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Highlighter size={14} />
              Highlight
            </button>
            <button
              className="h-7 w-7 p-0 text-background hover:bg-background/20 rounded-full transition-colors flex items-center justify-center"
              onClick={() => {
                window.getSelection()?.removeAllRanges();
                setHighlightTooltip({ visible: false, x: 0, y: 0, text: "" });
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Content (Matter-style reading width) */}
      <article className="max-w-[680px] mx-auto px-6 pt-20 pb-32">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] mb-6 text-foreground tracking-tight">
            {article.title}
          </h1>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-3 flex-wrap">
            {article.author && (
              <span className="font-medium text-foreground/80">{article.author}</span>
            )}
            {article.domain && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span>{article.domain}</span>
              </>
            )}
            <span className="text-muted-foreground/50">•</span>
            <span>{format(new Date(article.publishedDate || article.savedAt), "MMM d, yyyy")}</span>
          </div>
        </header>

        {/* The Article Body (Matter-style typography) */}
        <div 
          className="prose prose-xl prose-neutral dark:prose-invert mx-auto focus:outline-none selection:bg-primary/20 selection:text-foreground"
          dangerouslySetInnerHTML={{ __html: article.contentClean || article.contentRaw || "" }} 
        />
        
        {/* End of article actions */}
        <div className="mt-24 pt-12 border-t border-border/50 flex justify-center">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              updateArticle.mutate({ status: 'archive' });
              window.history.back();
            }}
          >
            <Archive size={16} />
            Archive Article
          </Button>
        </div>
      </article>

      {/* Floating Audio Player when active */}
      {(speechControls.isPlaying || speechControls.isPaused) && (
        <AudioPlayer controls={speechControls} title={article.title} />
      )}
    </div>
  );
}
