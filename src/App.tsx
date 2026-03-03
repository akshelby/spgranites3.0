import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { TabProvider } from "@/contexts/TabContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { VisitorTracker } from "@/components/VisitorTracker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { toast } from "sonner";
import '@/i18n';

import HomePage from "./pages/HomePage";

const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const CatalogsPage = lazy(() => import("./pages/CatalogsPage"));
const EstimationPage = lazy(() => import("./pages/EstimationPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Auth = lazy(() => import("./pages/Auth"));
import AuthCallback from "./pages/AuthCallback";
const StoneVisualizerPage = lazy(() => import("./pages/StoneVisualizerPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminEnquiries = lazy(() => import("./pages/admin/AdminEnquiries"));
const AdminEstimations = lazy(() => import("./pages/admin/AdminEstimations"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminCatalogs = lazy(() => import("./pages/admin/AdminCatalogs"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminCarousel = lazy(() => import("./pages/admin/AdminCarousel"));
const AdminLocations = lazy(() => import("./pages/admin/AdminLocations"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminChat = lazy(() => import("./pages/admin/AdminChat"));
const AdminContactNumbers = lazy(() => import("./pages/admin/AdminContactNumbers"));
const AdminCRMOverview = lazy(() => import("./pages/admin/AdminCRMOverview"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminSiteSettings = lazy(() => import("./pages/admin/AdminSiteSettings"));
const CompletedWorksPage = lazy(() => import("./pages/CompletedWorksPage"));
const AdminCompletedWorks = lazy(() => import("./pages/admin/AdminCompletedWorks"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error && (error.message.includes('401') || error.message.includes('403') || error.message.includes('404'))) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function AppContent() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      toast.error('Something went wrong. Please refresh and try again.');
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  return (
    <TooltipProvider>
    <SiteSettingsProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <TabProvider>
              <VisitorTracker />
              <Suspense fallback={null}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/catalogs" element={<CatalogsPage />} />
                <Route path="/estimation" element={<EstimationPage />} />
                <Route path="/visualizer" element={<StoneVisualizerPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/completed-works" element={<CompletedWorksPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />

                {/* Protected Routes */}
                <Route path="/my-reviews" element={<ProtectedRoute><TestimonialsPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><AdminCategories /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/enquiries" element={<ProtectedRoute requiredRole="admin"><AdminEnquiries /></ProtectedRoute>} />
                <Route path="/admin/estimations" element={<ProtectedRoute requiredRole="admin"><AdminEstimations /></ProtectedRoute>} />
                <Route path="/admin/reviews" element={<ProtectedRoute requiredRole="admin"><AdminReviews /></ProtectedRoute>} />
                <Route path="/admin/testimonials" element={<ProtectedRoute requiredRole="admin"><AdminTestimonials /></ProtectedRoute>} />
                <Route path="/admin/services" element={<ProtectedRoute requiredRole="admin"><AdminServices /></ProtectedRoute>} />
                <Route path="/admin/catalogs" element={<ProtectedRoute requiredRole="admin"><AdminCatalogs /></ProtectedRoute>} />
                <Route path="/admin/banners" element={<ProtectedRoute requiredRole="admin"><AdminBanners /></ProtectedRoute>} />
                <Route path="/admin/carousel" element={<ProtectedRoute requiredRole="admin"><AdminCarousel /></ProtectedRoute>} />
                <Route path="/admin/locations" element={<ProtectedRoute requiredRole="admin"><AdminLocations /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
                <Route path="/admin/chat" element={<ProtectedRoute requiredRole="admin"><AdminChat /></ProtectedRoute>} />
                <Route path="/admin/contact-numbers" element={<ProtectedRoute requiredRole="admin"><AdminContactNumbers /></ProtectedRoute>} />
                <Route path="/admin/crm" element={<ProtectedRoute requiredRole="admin"><AdminCRMOverview /></ProtectedRoute>} />
                <Route path="/admin/crm/customers" element={<ProtectedRoute requiredRole="admin"><AdminCustomers /></ProtectedRoute>} />
                <Route path="/admin/crm/leads" element={<ProtectedRoute requiredRole="admin"><AdminLeads /></ProtectedRoute>} />
                <Route path="/admin/completed-works" element={<ProtectedRoute requiredRole="admin"><AdminCompletedWorks /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSiteSettings /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              </TabProvider>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SiteSettingsProvider>
    </TooltipProvider>

  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
