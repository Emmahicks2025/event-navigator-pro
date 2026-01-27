import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index";
import EventDetail from "./pages/EventDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Category from "./pages/Category";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import EventsList from "./pages/admin/EventsList";
import EventForm from "./pages/admin/EventForm";
import VenuesList from "./pages/admin/VenuesList";
import VenueForm from "./pages/admin/VenueForm";
import SectionsManager from "./pages/admin/SectionsManager";
import OrdersList from "./pages/admin/OrdersList";
import FeaturedManager from "./pages/admin/FeaturedManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="events" element={<EventsList />} />
                <Route path="events/new" element={<EventForm />} />
                <Route path="events/:id" element={<EventForm />} />
                <Route path="venues" element={<VenuesList />} />
                <Route path="venues/new" element={<VenueForm />} />
                <Route path="venues/:id" element={<VenueForm />} />
                <Route path="venues/:venueId/sections" element={<SectionsManager />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="featured" element={<FeaturedManager />} />
              </Route>

              {/* Auth */}
              <Route path="/auth" element={<Auth />} />

              {/* Public Routes */}
              <Route path="/" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><Index /></div>
                  <Footer />
                </div>
              } />
              <Route path="/event/:id" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><EventDetail /></div>
                  <Footer />
                </div>
              } />
              <Route path="/cart" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><Cart /></div>
                  <Footer />
                </div>
              } />
              <Route path="/checkout" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><Checkout /></div>
                  <Footer />
                </div>
              } />
              <Route path="/order-confirmation" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><OrderConfirmation /></div>
                  <Footer />
                </div>
              } />
              <Route path="/category/:slug" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><Category /></div>
                  <Footer />
                </div>
              } />
              <Route path="/search" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><Search /></div>
                  <Footer />
                </div>
              } />
              <Route path="*" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><NotFound /></div>
                  <Footer />
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
