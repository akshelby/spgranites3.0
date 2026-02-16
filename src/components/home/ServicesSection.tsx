import { motion } from 'framer-motion';
import { ChefHat, Building2, Scissors, ArrowUpRight } from 'lucide-react';

const services = [
  {
    icon: ChefHat,
    title: 'Kitchen Countertops',
    description: 'Transform your kitchen with premium granite and quartz surfaces, precision-cut and polished to perfection.',
    gradient: 'from-[hsl(220,60%,20%)] to-[hsl(220,50%,35%)]',
  },
  {
    icon: Building2,
    title: 'Commercial Projects',
    description: 'Large-scale stone installations for offices, hotels, and commercial spaces with professional project management.',
    gradient: 'from-[hsl(0,0%,15%)] to-[hsl(0,0%,30%)]',
  },
  {
    icon: Scissors,
    title: 'Custom Stone Fabrication',
    description: 'Bespoke stone cutting, shaping, and finishing tailored to your exact specifications and design vision.',
    gradient: 'from-destructive to-[hsl(0,72%,40%)]',
  },
];

export function ServicesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-muted/30 relative overflow-hidden" data-testid="services-section">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14 lg:mb-16"
        >
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em]">
            What We Do
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 sm:mt-3 tracking-tight">
            Our Services
          </h2>
          <div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-destructive to-destructive/40" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.5 }}
              className="group relative bg-card rounded-2xl p-6 sm:p-8 lg:p-10 border border-border/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden"
              data-testid={`service-card-${index}`}
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-muted/80 to-transparent rounded-bl-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-5 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 tracking-tight flex items-center gap-2">
                {service.title}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
