import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { TabProvider } from "@/contexts/TabContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { VisitorTracker } from "@/components/VisitorTracker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import '@/i18n';

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import CatalogsPage from "./pages/CatalogsPage";
import EstimationPage from "./pages/EstimationPage";
import CartPage from "./pages/CartPage";
import ChatPage from "./pages/ChatPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import Auth from "./pages/Auth";
import StoneVisualizerPage from "./pages/StoneVisualizerPage";
import AboutPage from "./pages/AboutPage";
import PaymentPage from "./pages/PaymentPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import NotFound from "./pages/NotFound";
import GridFitLogin from "./pages/GridFitLogin";

// Admin Pages
import {
  AdminDashboard,
  AdminProducts,
  AdminCategories,
  AdminOrders,
  AdminEnquiries,
  AdminEstimations,
  AdminReviews,
  AdminTestimonials,
  AdminServices,
  AdminCatalogs,
  AdminBanners,
  AdminCarousel,
  AdminLocations,
  AdminUsers,
  AdminAnalytics,
  AdminChat,
  AdminContactNumbers,
  AdminCRMOverview,
  AdminCustomers,
  AdminLeads,
} from "./pages/admin";

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

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <TabProvider>
              <VisitorTracker />
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
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/auth" element={<Auth />} />
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

                {/* GridFit standalone */}
                <Route path="/gridfit" element={<GridFitLogin onLogin={(data: any) => console.log('GridFit login:', data)} />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </TabProvider>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
