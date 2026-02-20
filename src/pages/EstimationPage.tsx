import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, Gem, Ruler, Clock } from 'lucide-react';
import { EstimationForm } from '@/components/estimation/EstimationForm';

const features = [
  {
    icon: Calculator,
    title: 'Free Estimation',
    description: 'Get a detailed quote at no cost',
  },
  {
    icon: Gem,
    title: 'Premium Materials',
    description: 'Quality granite, marble & quartz',
  },
  {
    icon: Ruler,
    title: 'Custom Sizing',
    description: 'Tailored to your exact dimensions',
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: 'Quote within 24-48 hours',
  },
];

export default function EstimationPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-6">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground font-medium text-xs sm:text-sm uppercase tracking-wide"
          >
            Free Quote
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl lg:text-4xl font-display font-bold mt-1 mb-1 sm:mb-2"
            data-testid="text-estimation-title"
          >
            Get Your Free Estimation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto"
          >
            Fill out the form below and our team will provide a comprehensive estimation.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-8"
        >
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="pt-3 sm:pt-4 pb-3 px-2 sm:px-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 sm:mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-semibold mb-0.5">{feature.title}</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <Card>
            <CardContent className="p-4 sm:p-6">
              <EstimationForm />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
