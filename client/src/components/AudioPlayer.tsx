import { Play, Pause, X, Rewind, FastForward } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { cn } from "@/lib/utils";
import type { SpeechControls } from "@/hooks/use-speech";

interface AudioPlayerProps {
  controls: SpeechControls;
  title: string;
}

export function AudioPlayer({ controls, title }: AudioPlayerProps) {
  const { play, pause, cancel, isPlaying, progress, rate, setRate } = controls;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-foreground text-background p-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 border border-border/10">
      
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium truncate pr-4 opacity-90">
          Now Playing: {title}
        </div>
        <button onClick={cancel} className="text-background/50 hover:text-background">
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-background hover:bg-background/10 h-8 w-8"
            onClick={() => setRate(Math.max(0.5, rate - 0.25))}
          >
            <span className="text-xs font-bold">{rate}x</span>
          </Button>

          <Button 
            size="icon" 
            className="rounded-full h-10 w-10 bg-background text-foreground hover:bg-background/90"
            onClick={isPlaying ? pause : play}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-background hover:bg-background/10 h-8 w-8"
            onClick={() => setRate(Math.min(3, rate + 0.25))}
          >
             <FastForward size={16} />
          </Button>
        </div>

        {/* Progress Bar (Visual Only for now as Web Speech API lacks seek) */}
        <div className="flex-1 h-1 bg-background/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
