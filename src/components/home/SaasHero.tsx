import { motion } from 'framer-motion';

const waveBarVariants = {
  animate: (i: number) => ({
    scaleY: [1, 1.8 + Math.random(), 0.6, 1.4, 1],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      delay: i * 0.1,
      ease: 'easeInOut' as const,
    },
  }),
};

export function SaasHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[hsl(0_0%_96%)] dark:bg-background">
      {/* Subtle radial glow */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(265_80%_65%/0.08)] blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 py-16 lg:py-0 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-[1.1] tracking-tight"
            >
              Think it,
              <br />
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                speak it,
              </span>
              <br />
              send it
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Use your voice to write 3x faster in every application. AI commands,
              auto-edits, 100+ languages.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8"
            >
              <button className="relative group px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_4px_20px_hsl(265_80%_55%/0.35)] hover:shadow-[0_6px_30px_hsl(265_80%_55%/0.5)] transition-all duration-300 hover:scale-105 active:scale-[0.98]">
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />
                Try Flow Now
              </button>
            </motion.div>
          </motion.div>

          {/* Right Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Dark floating card */}
              <div className="w-72 sm:w-80 rounded-3xl bg-[hsl(0_0%_12%)] dark:bg-[hsl(0_0%_14%)] p-6 shadow-[0_20px_60px_hsl(0_0%_0%/0.25)]">
                {/* Recording UI Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Voice Recording</p>
                    <p className="text-[hsl(0_0%_55%)] text-xs">Listening...</p>
                  </div>
                  <div className="ml-auto w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                </div>

                {/* Waveform */}
                <div className="flex items-center justify-center gap-[3px] h-16 mb-6">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      animate="animate"
                      variants={waveBarVariants}
                      className="w-[3px] h-4 rounded-full bg-gradient-to-t from-purple-500 to-indigo-400 origin-center"
                    />
                  ))}
                </div>

                {/* Chat bubble */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl rounded-bl-md px-4 py-3 shadow-[0_4px_15px_hsl(265_80%_55%/0.3)]">
                  <p className="text-white text-sm leading-relaxed">
                    "Hey Caty, I'll meet you at 6pm"
                  </p>
                </div>

                {/* Time indicator */}
                <p className="text-[hsl(0_0%_45%)] text-[11px] mt-3 text-right">0:03</p>
              </div>

              {/* Decorative floating dots */}
              <motion.div
                animate={{ y: [0, -8, 0], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-purple-500/20 backdrop-blur-sm"
              />
              <motion.div
                animate={{ y: [0, 6, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-3 -left-6 w-6 h-6 rounded-full bg-indigo-500/20 backdrop-blur-sm"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
