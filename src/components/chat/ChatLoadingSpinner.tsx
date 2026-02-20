import { SPLoader } from "@/components/ui/SPLoader";

export function ChatLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <SPLoader size="sm" text="Loading messages..." />
    </div>
  );
}
