import { useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { useArticle, useUpdateArticle } from "@/hooks/use-articles";
import { useCreateHighlight } from "@/hooks/use-highlights";
import { useSpeech } from "@/hooks/use-speech";
import { ArrowLeft, Loader2, Play, Pause, Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, useScroll, useSpring } from "framer-motion";

export default function Reader() {
  const [, params] = useRoute("/reader/:id");
  const id = parseInt(params?.id || "0");
  const { data: article, isLoading } = useArticle(id);
  const updateArticle = useUpdateArticle(id);
  const createHighlight = useCreateHighlight();
  const { toast } = useToast();
  
  const speechControls = useSpeech();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Setup speech text when article loads
  useEffect(() => {
    if (article?.textContent) {
      speechControls.setText(article.textContent);
    }
  }, [article, speechControls.setText]);

  // Handle text selection for highlights
  const handleSelection = async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString();
    if (text.length < 5) return;

    // Small delay to allow user to finish selecting
    // In a real app, we'd show a floating tooltip here
    if (confirm("Create highlight?")) {
      try {
        await createHighlight.mutateAsync({
          articleId: id,
          textContent: text,
          colorHex: "#FFD60A", // primary yellow
        });
        toast({ description: "Highlight saved" });
        selection.removeAllRanges();
      } catch (err) {
        toast({ variant: "destructive", description: "Failed to save highlight" });
      }
    }
  };

  // Save read progress on unmount or periodically
  useEffect(() => {
    return () => {
      // Calculate scroll percentage as rough progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      if (progress > 0.1) {
        updateArticle.mutate({ readProgress: progress });
      }
    };
  }, [id]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );

  if (!article) return <div>Article not found</div>;

  return (
    <div className="min-h-screen bg-background text-foreground" onMouseUp={handleSelection}>
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Nav */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 h-14 flex items-center justify-between">
        <Link href={`/${article.status || 'queue'}`}>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft size={16} /> Back
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={speechControls.isPlaying ? speechControls.pause : speechControls.play}
            className={speechControls.isPlaying ? "text-primary" : "text-muted-foreground"}
          >
            {speechControls.isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span className="hidden sm:inline ml-2">{speechControls.isPlaying ? "Pause" : "Listen"}</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-6">
            {article.title}
          </h1>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-4">
            {article.author && <span className="font-medium text-foreground">{article.author}</span>}
            {article.domain && <span>{article.domain}</span>}
            <span>{format(new Date(article.publishedDate || article.savedAt), "MMM d, yyyy")}</span>
          </div>
        </header>

        {/* The Article Body */}
        <div 
          className="prose prose-lg prose-neutral dark:prose-invert mx-auto focus:outline-none"
          dangerouslySetInnerHTML={{ __html: article.contentClean || article.contentRaw || "" }} 
        />
        
        {/* End of article actions */}
        <div className="mt-20 pt-10 border-t flex justify-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              updateArticle.mutate({ status: 'archive' });
              window.history.back();
            }}
          >
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
