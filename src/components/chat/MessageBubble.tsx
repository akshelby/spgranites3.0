import { format } from "date-fns";
import { Play, Pause, Check, CheckCheck, Clock, AlertCircle, Mic } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Message } from "./types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isAdminView?: boolean;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function AudioPlayer({ src, isOutgoing }: { src: string; isOutgoing: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animFrameRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    if (audioRef.current && isPlaying) {
      const ct = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      if (isFinite(dur) && dur > 0) {
        setProgress((ct / dur) * 100);
        setCurrentTime(ct);
      }
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, updateProgress]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    if (isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = pct * audioRef.current.duration;
      setProgress(pct * 100);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const waveformBars = 28;

  return (
    <div className="flex items-center gap-2.5 min-w-[220px] py-1">
      <button
        onClick={togglePlay}
        data-testid="button-audio-play"
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
          isOutgoing ? "bg-[#00a884] hover:bg-[#00c49a]" : "bg-[#3b4a54] hover:bg-[#4a5b66]"
        )}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white fill-white" />
        ) : (
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="relative h-6 flex items-end gap-[2px] cursor-pointer"
          data-testid="audio-waveform"
        >
          {Array.from({ length: waveformBars }).map((_, i) => {
            const barProgress = (i / waveformBars) * 100;
            const played = barProgress < progress;
            const heights = [3, 5, 8, 4, 10, 6, 12, 5, 14, 7, 9, 4, 11, 6, 8, 13, 5, 10, 7, 15, 6, 9, 4, 11, 8, 5, 12, 7];
            const h = heights[i % heights.length];
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-colors duration-150",
                  played
                    ? (isOutgoing ? "bg-[#b3d9d2]" : "bg-[#00a884]")
                    : (isOutgoing ? "bg-[#005C4B]/50" : "bg-[#3b4a54]")
                )}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#8696A0]">
            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
          </span>
          <Mic className="w-3 h-3 text-[#8696A0]" />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
      />
    </div>
  );
}

export function MessageBubble({ message, isAdminView = false }: MessageBubbleProps) {
  const isStaff = message.sender_type === 'staff';
  const isOutgoing = isAdminView ? isStaff : !isStaff;

  return (
    <div className={cn("flex w-full px-3 mb-[2px]", isOutgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[80%] rounded-lg px-2.5 pt-1.5 pb-1 shadow-sm flex flex-col",
          isOutgoing
            ? "bg-[#005C4B] text-[#E9EDEF] rounded-tr-none"
            : "bg-[#202C33] text-[#E9EDEF] rounded-tl-none"
        )}
      >
        {message.media_url && message.media_type === 'image' && (
          <div className="mb-1.5 max-w-[280px]">
            <img
              src={message.media_url}
              alt="Shared image"
              className="rounded-lg w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.media_url!, '_blank')}
            />
          </div>
        )}

        {message.media_url && message.media_type === 'video' && (
          <div className="mb-1.5 max-w-[280px]">
            <video
              src={message.media_url}
              className="rounded-lg w-full h-auto aspect-video"
              controls
            />
          </div>
        )}

        {message.media_url && message.media_type === 'audio' && (
          <AudioPlayer src={message.media_url} isOutgoing={isOutgoing} />
        )}

        {message.content_text && (
          <p className="text-[14px] leading-[19px] whitespace-pre-wrap break-words">{message.content_text}
            <span className="inline-block w-[70px]" />
          </p>
        )}

        <span className="self-end text-[11px] flex items-center gap-1 text-[#8696A0] -mt-3.5 mr-0.5">
          {format(new Date(message.created_at), "h:mm a")}
          {isOutgoing && (
            message._status === 'sending' ? (
              <Clock className="w-3 h-3" />
            ) : message._status === 'failed' ? (
              <AlertCircle className="w-3 h-3 text-red-400" />
            ) : (
              <CheckCheck className="w-3 h-3" />
            )
          )}
        </span>
      </div>
    </div>
  );
}
