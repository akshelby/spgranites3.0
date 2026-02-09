import { useState, useRef, useEffect } from "react";
import { Send, Image, Video, Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  onSendMedia: (file: File, type: 'image' | 'video' | 'audio') => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onSendMedia, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    const text = message.trim();
    setMessage(""); // Clear immediately
    setIsSending(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSending(true);
    try {
      await onSendMedia(file, type);
    } finally {
      setIsSending(false);
      e.target.value = "";
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        
        stream.getTracks().forEach(track => track.stop());
        
        setIsSending(true);
        try {
          await onSendMedia(audioFile, 'audio');
        } finally {
          setIsSending(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border-t border-[#222D34] bg-[#1F2C33] p-2 space-y-2">
      {isRecording && (
        <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#E60000] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#E60000]">Recording...</span>
            <span className="text-sm text-muted-foreground">{formatTime(recordingTime)}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={stopRecording}
            className="text-[#E60000] hover:text-[#E60000] hover:bg-red-100"
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="min-h-[40px] max-h-[120px] resize-none rounded-2xl pr-4 bg-[#2A3942] border-none text-[#E9EDEF] placeholder:text-[#8696A0] focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled || isSending || isRecording}
            rows={1}
          />
        </div>

        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'video')}
          />

          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#2A3942]"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSending || isRecording}
          >
            <Image className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#2A3942]"
            onClick={() => videoInputRef.current?.click()}
            disabled={disabled || isSending || isRecording}
          >
            <Video className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-9 w-9 rounded-full",
              isRecording 
                ? "text-[#E60000] bg-red-950/40" 
                : "text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#2A3942]"
            )}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isSending}
          >
            <Mic className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-[#00A884] hover:bg-[#00A884]/90"
            onClick={handleSend}
            disabled={!message.trim() || disabled || isSending || isRecording}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
