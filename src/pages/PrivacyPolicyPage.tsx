import { MainLayout } from '@/components/layout';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export default function PrivacyPolicyPage() {
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
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-center mt-2 mb-2 sm:mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground text-center mb-8 sm:mb-12 text-sm sm:text-base">Last updated: February 2026</p>

            <div className="space-y-6 sm:space-y-8 text-sm sm:text-base text-foreground/85 leading-relaxed">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, including your name, email address, phone number, shipping address, and payment information when you create an account, place an order, or contact us. We also collect information about your browsing activity on our website.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
                <p>We use your information to process orders and payments, communicate about your orders and account, provide customer support, send promotional offers (with your consent), improve our website and services, and comply with legal obligations.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">3. Information Sharing</h2>
                <p>We do not sell your personal information. We may share your information with service providers who assist with order fulfillment, payment processing, and delivery. We may also share information when required by law or to protect our rights.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">4. Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure. We use SSL encryption for data transmission and secure servers for data storage.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">5. Cookies</h2>
                <p>We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze website traffic. You can control cookie settings through your browser preferences.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">6. Your Rights</h2>
                <p>You have the right to access, update, or delete your personal information. You can manage your account settings or contact us to exercise these rights. You may also opt out of marketing communications at any time.</p>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">7. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at:</p>
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
