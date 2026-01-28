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
import Cities from "./pages/Cities";
import SellTickets from "./pages/SellTickets";
import NotFound from "./pages/NotFound";

// Static Pages
import About from "./pages/About";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Blog from "./pages/Blog";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import FAQs from "./pages/FAQs";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Accessibility from "./pages/Accessibility";

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
import PerformersList from "./pages/admin/PerformersList";
import PerformerForm from "./pages/admin/PerformerForm";
import CategoriesList from "./pages/admin/CategoriesList";
import InventoryList from "./pages/admin/InventoryList";
import InventoryForm from "./pages/admin/InventoryForm";
import SellRequestsList from "./pages/admin/SellRequestsList";
import BulkUpload from "./pages/admin/BulkUpload";
import EventsImport from "./pages/admin/EventsImport";

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
                <Route path="performers" element={<PerformersList />} />
                <Route path="performers/new" element={<PerformerForm />} />
                <Route path="performers/:id" element={<PerformerForm />} />
                <Route path="categories" element={<CategoriesList />} />
                <Route path="inventory" element={<InventoryList />} />
                <Route path="inventory/new" element={<InventoryForm />} />
                <Route path="inventory/:id" element={<InventoryForm />} />
                <Route path="sell-requests" element={<SellRequestsList />} />
                <Route path="bulk-upload" element={<BulkUpload />} />
                <Route path="import-events" element={<EventsImport />} />
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
              <Route path="/cities" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><Cities /></div>
                  <Footer />
                </div>
              } />
              <Route path="/sell" element={
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <div className="flex-1"><SellTickets /></div>
                  <Footer />
                </div>
              } />
              
              {/* Static Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<Press />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/accessibility" element={<Accessibility />} />
              
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
