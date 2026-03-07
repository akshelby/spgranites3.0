import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface FloatingActionButtonProps {
  isAIChatOpen: boolean;
  onToggle: () => void;
}

export function FloatingActionButton({ isAIChatOpen, onToggle }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <motion.button
        onClick={onToggle}
        className={`ai-assistant-btn relative w-7 h-7 rounded-full flex items-center justify-center shadow-lg ${isAIChatOpen ? 'ai-chat-active' : ''}`}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        title="AI Assistant"
      >
        {!isAIChatOpen && (
          <>
            <span className="ai-glow-ring" />
            <span className="ai-glow-ring ai-glow-ring-delay" />
          </>
        )}
        <span className="ai-btn-inner relative z-10 w-full h-full rounded-full flex items-center justify-center">
          {isAIChatOpen ? (
            <X className="w-3.5 h-3.5 text-white" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-white" />
          )}
        </span>
      </motion.button>
    </div>
  );
}
