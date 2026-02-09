import { Loader2 } from "lucide-react";

export function ChatLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-muted animate-pulse" />
        <Loader2 className="w-12 h-12 absolute inset-0 text-[#E60000] animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground">Loading messages...</p>
    </div>
  );
}
