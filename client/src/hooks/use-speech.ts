import { useState, useEffect, useRef, useCallback } from "react";

export interface SpeechControls {
  play: () => void;
  pause: () => void;
  cancel: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number; // 0 to 1 (approximate)
  rate: number;
  setRate: (rate: number) => void;
  setText: (text: string) => void;
}

export function useSpeech(): SpeechControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [text, setTextState] = useState("");
  const [rate, setRate] = useState(1);
  const [progress, setProgress] = useState(0); // Rough progress
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synth = window.speechSynthesis;

  const cancel = useCallback(() => {
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  }, [synth]);

  // Re-create utterance when text changes
  useEffect(() => {
    if (!text) return;
    
    // Cleanup previous
    cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    
    // Attempt to select a better voice
    const voices = synth.getVoices();
    // Prefer Google US English, or generic English
    const preferredVoice = voices.find(v => v.name.includes("Google US English")) || 
                           voices.find(v => v.lang.startsWith("en-US")) ||
                           voices.find(v => v.lang.startsWith("en"));
    if (preferredVoice) utterance.voice = preferredVoice;

    // Events
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
      setIsPlaying(false);
    };

    utterance.onresume = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(1);
    };

    // Progress estimation using boundary events (words)
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Approximate: charIndex / totalLength
        const percent = event.charIndex / text.length;
        setProgress(Math.min(percent, 0.99));
      }
    };

    utteranceRef.current = utterance;
    
    return () => {
      cancel();
    };
  }, [text, rate, cancel, synth]);

  const play = useCallback(() => {
    if (isPaused) {
      synth.resume();
      return;
    }
    if (synth.speaking) {
      synth.cancel();
    }
    if (utteranceRef.current) {
      synth.speak(utteranceRef.current);
    }
  }, [isPaused, synth]);

  const pause = useCallback(() => {
    if (synth.speaking) {
      synth.pause();
    }
  }, [synth]);

  return {
    play,
    pause,
    cancel,
    isPlaying,
    isPaused,
    progress,
    rate,
    setRate,
    setText: setTextState,
  };
}
