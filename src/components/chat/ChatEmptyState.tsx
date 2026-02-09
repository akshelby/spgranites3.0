import { MessageCircle } from "lucide-react";

interface ChatEmptyStateProps {
  refId: string;
}

export function ChatEmptyState({ refId }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#001F3F]/10 flex items-center justify-center">
        <MessageCircle className="w-8 h-8 text-[#001F3F]" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-[#1A1A1A]">Welcome to S P Granites Support!</h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Your reference ID is <span className="font-mono font-semibold text-[#E60000]">{refId}</span>. 
          Start a conversation and our team will respond shortly.
        </p>
      </div>
    </div>
  );
}
