import { motion } from 'framer-motion';
import { Mic, Sparkles, Globe } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Voice Commands',
    description:
      'Speak naturally and watch your words appear on screen. Dictate emails, messages, and documents effortlessly.',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Sparkles,
    title: 'Smart Auto-Edit',
    description:
      'AI-powered editing that fixes grammar, adjusts tone, and polishes your text in real time as you speak.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description:
      'Speak in 100+ languages and dialects. Real-time translation and transcription with native accuracy.',
    gradient: 'from-blue-500 to-cyan-500',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export function SaasFeatures() {
  return (
    <section className="py-20 sm:py-28 bg-[hsl(0_0%_96%)] dark:bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
            Supercharge your workflow
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
            Three powerful tools that make writing feel like a conversation.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={cardVariants}
                className="group relative rounded-2xl bg-card p-7 shadow-[6px_6px_16px_hsl(0_0%_82%/0.5),-6px_-6px_16px_hsl(0_0%_100%/0.8)] dark:shadow-[6px_6px_16px_hsl(0_0%_0%/0.3),-6px_-6px_16px_hsl(0_0%_20%/0.2)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
