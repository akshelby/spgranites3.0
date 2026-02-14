import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onRecordingComplete: (url: string, transcription?: string) => void;
  existingUrl?: string;
}

export function VoiceRecorder({ onRecordingComplete, existingUrl }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await uploadRecording(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const uploadRecording = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAudioUrl(dataUrl);
        onRecordingComplete(dataUrl);
        toast.success('Voice recording saved!');
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to process recording');
        setIsUploading(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      toast.error('Failed to process recording');
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    onRecordingComplete('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 p-6 bg-muted/30 rounded-lg">
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing recording...</p>
          </div>
        ) : !audioUrl ? (
          <>
            {/* Recording Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center transition-all',
                isRecording
                  ? 'bg-destructive text-destructive-foreground animate-pulse'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>

            {/* Recording Time */}
            {isRecording && (
              <div className="text-center">
                <p className="text-2xl font-mono font-semibold text-destructive">
                  {formatTime(recordingTime)}
                </p>
                <p className="text-sm text-muted-foreground">Recording...</p>
              </div>
            )}

            {!isRecording && (
              <p className="text-sm text-muted-foreground">
                Tap to start recording your requirements
              </p>
            )}
          </>
        ) : (
          <>
            {/* Playback Controls */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={deleteRecording}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Recording saved • {formatTime(recordingTime)}
            </p>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Record a voice note describing your project requirements, dimensions, or any special requests
      </p>
    </div>
  );
}
