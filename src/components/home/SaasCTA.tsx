import { motion } from 'framer-motion';

export function SaasCTA() {
  return (
    <section className="py-20 sm:py-28 bg-[hsl(0_0%_96%)] dark:bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-tight">
            Start speaking.
            <br />
            Start moving faster.
          </h2>
          <p className="mt-5 text-muted-foreground text-base sm:text-lg">
            Join thousands of professionals who write at the speed of thought.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8"
          >
            <button className="relative group px-10 py-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_4px_20px_hsl(265_80%_55%/0.35)] hover:shadow-[0_6px_30px_hsl(265_80%_55%/0.5)] transition-all duration-300 hover:scale-105 active:scale-[0.98]">
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />
              Get Started Free
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
