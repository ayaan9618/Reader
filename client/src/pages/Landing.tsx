import { Link } from "wouter";
import { BookOpen, Sparkles, Highlighter, Zap, ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={22} />
            <span className="font-semibold tracking-tight">Reader</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <Link href="/auth">
              <span className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">Sign in</span>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="ml-2">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles size={16} />
              <span>Read smarter, not harder</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Save. Read. Grow.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              One place for all your reading. Save articles, newsletters, and feeds. 
              Read with superpowers and capture knowledge as you go.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-6 gap-2 group">
                  Get Started
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-2xl border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <BookOpen className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Save anything for later</h3>
            <p className="text-muted-foreground leading-relaxed">
              Save articles, threads, and PDFs. Advanced parsing lets you read without distraction.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <Highlighter className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Highlights</h3>
            <p className="text-muted-foreground leading-relaxed">
              Capture key insights with one click. Build your personal knowledge base over time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 rounded-2xl border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <Zap className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Switch between audio and text</h3>
            <p className="text-muted-foreground leading-relaxed">
              Turn articles into a playlist with natural-sounding voices. Seamlessly switch modes.
            </p>
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <div id="how" className="max-w-6xl mx-auto px-6 pb-10 md:pb-20">
        <div className="grid md:grid-cols-3 gap-6 md:gap-10">
          <div className="p-6 rounded-xl border bg-card">
            <div className="text-sm font-medium text-primary mb-2">1. Save</div>
            <div className="text-foreground font-semibold mb-2">Add any article link</div>
            <p className="text-muted-foreground">Paste or share URLs. Content is cleaned for a focused reading view.</p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <div className="text-sm font-medium text-primary mb-2">2. Read</div>
            <div className="text-foreground font-semibold mb-2">Focus without distractions</div>
            <p className="text-muted-foreground">Comfortable typography, themes, and progress tracking keep you in flow.</p>
          </div>
          <div className="p-6 rounded-xl border bg-card">
            <div className="text-sm font-medium text-primary mb-2">3. Remember</div>
            <div className="text-foreground font-semibold mb-2">Highlight and reflect</div>
            <p className="text-muted-foreground">Capture highlights and notes to build your personal knowledge library.</p>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl border bg-card text-center">
            <div className="text-2xl font-bold text-primary mb-2">Power Queuing</div>
            <p className="text-muted-foreground text-sm">Reorder, triage, filter, shuffle your reading list</p>
          </div>
          <div className="p-6 rounded-xl border bg-card text-center">
            <div className="text-2xl font-bold text-primary mb-2">Offline Search</div>
            <p className="text-muted-foreground text-sm">Search full text and within articles, even offline</p>
          </div>
          <div className="p-6 rounded-xl border bg-card text-center">
            <div className="text-2xl font-bold text-primary mb-2">Tagging</div>
            <p className="text-muted-foreground text-sm">Organize your library for quick recall</p>
          </div>
          <div className="p-6 rounded-xl border bg-card text-center">
            <div className="text-2xl font-bold text-primary mb-2">Audio Highlights</div>
            <p className="text-muted-foreground text-sm">Highlight while you listen without looking at the screen</p>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <blockquote className="text-2xl md:text-3xl font-serif italic text-muted-foreground mb-4">
          “A reader lives a thousand lives before he dies. The man who never reads lives only one.”
        </blockquote>
        <cite className="text-sm text-muted-foreground">– George R.R. Martin</cite>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your reading?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join readers who are building their knowledge library, one article at a time.
          </p>
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8 py-6 gap-2 group">
              Start Reading
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>

      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen size={18} />
            <span>Reader</span>
            <span>•</span>
            <span>Developed by GitHub </span>
            <a href="https://github.com/ayaan9618" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground hover:underline">
              <Github size={16} />
              <span>@ayaan9618</span>
            </a>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <Link href="/auth">
              <span className="cursor-pointer hover:text-foreground">Sign in</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
