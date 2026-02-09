import { useState, useRef, useEffect } from "react";
import { Send, Mic, Square, Loader2, Paperclip, X, Image, Video, FileText, Headphones, Camera } from "lucide-react";
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
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    const text = message.trim();
    setMessage("");
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);
    setIsSending(true);
    try {
      await onSendMedia(file, type);
    } finally {
      setIsSending(false);
      e.target.value = "";
    }
  };

  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);
    setIsSending(true);
    try {
      // Treat documents as images for now (PDF preview etc.)
      await onSendMedia(file, 'image');
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
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: "audio/webm" });
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

  const attachOptions = [
    { icon: Image, label: "Gallery", color: "#BF59CF", onClick: () => imageInputRef.current?.click() },
    { icon: Camera, label: "Camera", color: "#E9446A", onClick: () => cameraInputRef.current?.click() },
    { icon: FileText, label: "Document", color: "#7C6AEF", onClick: () => documentInputRef.current?.click() },
    { icon: Headphones, label: "Audio", color: "#EE7B30", onClick: () => audioFileInputRef.current?.click() },
    { icon: Video, label: "Video", color: "#02C6A0", onClick: () => videoInputRef.current?.click() },
    { icon: Mic, label: "Voice Note", color: "#0195F7", onClick: () => { setShowAttachMenu(false); startRecording(); } },
  ];

  return (
    <div className="relative border-t border-[#222D34] bg-[#1F2C33] p-2 space-y-2">
      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'video')} />
      <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" className="hidden" onChange={handleDocumentSelect} />
      <input ref={audioFileInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileSelect(e, 'audio')} />

      {/* Attachment Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-full left-0 right-0 bg-[#1F2C33] border-t border-[#222D34] p-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="grid grid-cols-3 gap-4">
            {attachOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={opt.onClick}
                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-[#2A3942] transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${opt.color}20` }}
                >
                  <opt.icon className="w-6 h-6" style={{ color: opt.color }} />
                </div>
                <span className="text-[11px] text-[#8696A0]">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recording bar */}
      {isRecording && (
        <div className="flex items-center justify-between bg-red-950/30 rounded-xl px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#E60000] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#E60000]">Recording...</span>
            <span className="text-sm text-[#8696A0]">{formatTime(recordingTime)}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={stopRecording} className="text-[#E60000] hover:text-[#E60000] hover:bg-red-950/40">
            <Square className="w-4 h-4 fill-current" />
          </Button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="min-h-[40px] max-h-[120px] resize-none rounded-2xl pl-3 pr-10 bg-[#2A3942] border-none text-[#E9EDEF] placeholder:text-[#8696A0] focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled || isSending || isRecording}
            rows={1}
          />
          {/* Paperclip inside textarea */}
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            disabled={disabled || isSending || isRecording}
            className="absolute right-2 bottom-2 text-[#8696A0] hover:text-[#E9EDEF] transition-colors disabled:opacity-50"
          >
            {showAttachMenu ? <X className="w-5 h-5" /> : <Paperclip className="w-5 h-5 rotate-45" />}
          </button>
        </div>

        {/* Mic / Send button */}
        {message.trim() ? (
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-[#00A884] hover:bg-[#00A884]/90 shrink-0"
            onClick={handleSend}
            disabled={disabled || isSending || isRecording}
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-10 w-10 rounded-full shrink-0",
              isRecording ? "text-[#E60000] bg-red-950/40" : "text-[#8696A0] hover:text-[#E9EDEF] hover:bg-[#2A3942]"
            )}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isSending}
          >
            <Mic className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
}
