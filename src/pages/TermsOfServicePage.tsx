import { MainLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export default function TermsOfServicePage() {
  const settings = useSiteSettings();

  return (
    <MainLayout>
      <section className="py-10 sm:py-14 lg:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider text-center">Legal</p>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-center mt-2 mb-2 sm:mb-4">Terms of Service</h1>
            <p className="text-muted-foreground text-center mb-8 sm:mb-12 text-sm sm:text-base">Last updated: February 2026</p>

            <div className="space-y-6 sm:space-y-8 text-sm sm:text-base text-foreground/85 leading-relaxed">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
                <p>By accessing and using the {settings.company_name} website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website or services.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">2. Products and Pricing</h2>
                <p>All product descriptions and prices are subject to change without notice. We make every effort to display accurate product colors and images, but actual colors may vary due to monitor settings and natural stone variations. Prices are listed in Indian Rupees (INR) and are exclusive of applicable taxes and delivery charges unless stated otherwise.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">3. Orders and Payment</h2>
                <p>By placing an order, you are making an offer to purchase the products. We reserve the right to accept or decline any order. Payment must be completed before order processing begins. We accept various payment methods as displayed during checkout.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">4. Shipping and Delivery</h2>
                <p>Delivery times are estimates and may vary based on location and product availability. {settings.company_name} is not responsible for delays caused by circumstances beyond our control. Risk of loss passes to the buyer upon delivery. Special handling charges may apply for large or heavy stone products.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">5. Returns and Refunds</h2>
                <p>Due to the custom nature of stone products, returns are accepted only for damaged or defective items. Claims must be reported within 48 hours of delivery with photographic evidence. Refunds will be processed to the original payment method within 7-10 business days after approval.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">6. Estimation Services</h2>
                <p>Estimations provided through our website are approximate and for reference purposes only. Final pricing may vary based on actual measurements, material availability, and site conditions. Estimations are valid for 30 days from the date of issue.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">7. Intellectual Property</h2>
                <p>All content on this website, including text, images, logos, and design elements, is the property of {settings.company_name} and is protected by applicable intellectual property laws. Unauthorized use or reproduction is strictly prohibited.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">8. Limitation of Liability</h2>
                <p>{settings.company_name} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the amount paid by you for the specific product or service in question.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">9. Contact Information</h2>
                <p>For questions about these Terms of Service, please contact us at:</p>
                <ul className="mt-2 space-y-1">
                  <li>Email: {settings.email_primary}</li>
                  <li>Phone: {settings.phone_primary}</li>
                  <li>Address: {settings.address_line1}, {settings.address_line2}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
