import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2, CheckCircle2, AlertCircle } from 'lucide-react';
import { VOICE_COMMAND_DEFINITIONS } from '../data/structuredStudioData';
import { audioNotification } from '../utils/audioNotification';

interface VoiceCommandControllerProps {
  onActionDispatched?: (action: string, spokenText: string) => void;
}

export const VoiceCommandController: React.FC<VoiceCommandControllerProps> = ({
  onActionDispatched,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastSpoken, setLastSpoken] = useState<string>('');
  const [matchedAction, setMatchedAction] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const resultsLength = event.results.length;
        const currentResult = event.results[resultsLength - 1];
        const transcript = currentResult[0].transcript.trim().toLowerCase();
        setLastSpoken(transcript);

        if (currentResult.isFinal) {
          // Look for matching command
          for (const cmd of VOICE_COMMAND_DEFINITIONS) {
            if (transcript.includes(cmd.command) || transcript.endsWith(cmd.command)) {
              setMatchedAction(cmd.action);
              audioNotification.playHotkeyTriggerSound();

              // Dispatch into kbt-hotkey event bus
              window.dispatchEvent(
                new CustomEvent('kbt-hotkey', { detail: { action: cmd.action, source: 'voice' } })
              );

              if (onActionDispatched) {
                onActionDispatched(cmd.action, transcript);
              }

              setTimeout(() => {
                setMatchedAction(null);
              }, 2500);
              break;
            }
          }
        }
      };

      recognition.onerror = (err: any) => {
        if (err.error !== 'no-speech') {
          console.warn('Speech recognition warning:', err.error);
        }
      };

      recognition.onend = () => {
        // Automatically restart if user hasn't explicitly stopped it
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not initialize Web Speech API:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isListening, onActionDispatched]);

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      setLastSpoken('');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Failed to start speech recognition:', e);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        title={
          isSupported
            ? isListening
              ? `Voice Commands Active: Speak "start recording", "toggle camera", "fast export", etc.`
              : 'Enable AI Voice Commands (Hands-Free Studio Control)'
            : 'Web Speech API not supported in this browser'
        }
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border shadow-sm ${
          isListening
            ? 'bg-purple-950/80 text-purple-200 border-purple-500 ring-2 ring-purple-500/40 animate-pulse'
            : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-700/80'
        } ${!isSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {isListening ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono text-[11px]">Voice: ON</span>
          </>
        ) : (
          <>
            <MicOff className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono text-[11px]">Voice: OFF</span>
          </>
        )}
      </button>

      {/* Floating HUD badge when speaking */}
      {isListening && lastSpoken && (
        <div className="absolute top-full left-0 mt-2 z-30 px-3 py-1.5 rounded-xl bg-zinc-950/95 border border-purple-500/60 shadow-xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap text-xs animate-in fade-in slide-in-from-top-1">
          <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="text-zinc-300 font-medium">"{lastSpoken}"</span>
          {matchedAction && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-mono text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {matchedAction}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
