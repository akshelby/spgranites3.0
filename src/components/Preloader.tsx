import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const smoothEase = [0.25, 0.1, 0.25, 1] as const;

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('spg_preloader_shown');
    if (hasVisited) {
      setVisible(false);
      return;
    }

    const start = Date.now();
    const duration = 1800;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));
      if (p < 1) requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem('spg_preloader_shown', '1');
        }, 300);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: smoothEase }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          style={{ pointerEvents: 'auto' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: smoothEase }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: smoothEase }}
            >
              <h1 className="brand-name-hero text-5xl sm:text-6xl leading-none">SP Granites</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: smoothEase }}
              className="mt-3 flex items-center gap-3"
            >
              <span className="brand-divider !w-8" />
              <span className="brand-tagline text-xs sm:text-sm text-muted-foreground tracking-[0.25em] uppercase font-medium">Premium Stone Works</span>
              <span className="brand-divider !w-8" style={{ background: 'linear-gradient(270deg, #dc2626, transparent)' }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-8 w-48 sm:w-56"
            >
              <div className="h-[2px] w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-primary origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
