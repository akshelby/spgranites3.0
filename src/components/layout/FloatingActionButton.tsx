import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { WhatsAppButton } from './WhatsAppButton';

interface FloatingActionButtonProps {
  isAIChatOpen: boolean;
  onToggle: () => void;
}

export function FloatingActionButton({ isAIChatOpen, onToggle }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      <WhatsAppButton />

      <motion.button
        onClick={onToggle}
        className={`ai-assistant-btn relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg ${isAIChatOpen ? 'ai-chat-active' : ''}`}
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
            <X className="w-5 h-5 text-white" />
          ) : (
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </span>
      </motion.button>
    </div>
  );
}
