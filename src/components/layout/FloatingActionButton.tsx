import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function FloatingActionButton() {
  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent('open-chat-widget'));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <motion.button
        onClick={handleOpenChat}
        className="ai-assistant-btn relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
        title="AI Assistant"
      >
        <span className="ai-glow-ring" />
        <span className="ai-glow-ring ai-glow-ring-delay" />
        <span className="ai-btn-inner relative z-10 w-full h-full rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </span>
      </motion.button>
    </div>
  );
}
