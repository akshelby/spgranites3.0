import { format } from "date-fns";
import { Play, Pause, Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { Message } from "./types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  /** When true, staff messages appear on the right (outgoing) */
  isAdminView?: boolean;
}

export function MessageBubble({ message, isAdminView = false }: MessageBubbleProps) {
  const isStaff = message.sender_type === 'staff';
  // In admin view: staff = outgoing (right), customer = incoming (left)
  // In customer view: customer = outgoing (right), staff = incoming (left)
  const isOutgoing = isAdminView ? isStaff : !isStaff;
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
    <div className={cn("flex w-full px-3 mb-[2px]", isOutgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[80%] rounded-lg px-2.5 pt-1.5 pb-1 shadow-sm flex flex-col",
          isOutgoing
            ? "bg-[#005C4B] text-[#E9EDEF] rounded-tr-none"
            : "bg-[#202C33] text-[#E9EDEF] rounded-tl-none"
        )}
      >
        {/* Media content */}
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
          <div className="mb-1.5 flex items-center gap-3 bg-black/20 rounded-lg p-2">
            <button
              onClick={toggleAudio}
              className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="h-1 bg-black/20 rounded-full">
                <div className="h-1 bg-current rounded-full w-0" />
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
          <p className="text-[14px] leading-[19px] whitespace-pre-wrap break-words">{message.content_text}
            <span className="inline-block w-[70px]" />
          </p>
        )}

        {/* Timestamp + status — bottom-right, non-overlapping */}
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
