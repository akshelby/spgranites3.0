import { format } from "date-fns";
import { Play, Pause, Image as ImageIcon, Video } from "lucide-react";
import { useState, useRef } from "react";
import { Message } from "./types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isStaff = message.sender_type === 'staff';
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className={cn("flex flex-col gap-1", isStaff ? "items-start" : "items-end")}>
      <span className="text-xs text-muted-foreground px-1">
        {isStaff ? (message.sender_name || "Support") : "You"}
      </span>
      
      <div
        className={cn(
          "max-w-[280px] rounded-2xl px-4 py-2.5 shadow-sm",
          isStaff
            ? "bg-[#001F3F] text-white rounded-bl-md"
            : "bg-[#E60000] text-white rounded-br-md"
        )}
      >
        {/* Media content */}
        {message.media_url && message.media_type === 'image' && (
          <div className="mb-2 -mx-2 -mt-1">
            <img
              src={message.media_url}
              alt="Shared image"
              className="rounded-xl max-w-full cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.media_url!, '_blank')}
            />
          </div>
        )}

        {message.media_url && message.media_type === 'video' && (
          <div className="mb-2 -mx-2 -mt-1 relative group cursor-pointer">
            <video
              src={message.media_url}
              className="rounded-xl max-w-full"
              controls
            />
          </div>
        )}

        {message.media_url && message.media_type === 'audio' && (
          <div className="mb-2 flex items-center gap-3 bg-white/10 rounded-xl p-2">
            <button
              onClick={toggleAudio}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="h-1 bg-white/30 rounded-full">
                <div className="h-1 bg-white rounded-full w-0" />
              </div>
            </div>
            <audio
              ref={audioRef}
              src={message.media_url}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          </div>
        )}

        {/* Text content */}
        {message.content_text && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content_text}</p>
        )}
      </div>

      <span className="text-[10px] text-muted-foreground px-1">
        {format(new Date(message.created_at), "h:mm a")}
      </span>
    </div>
  );
}
