import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Ticket, 
  CreditCard, 
  Truck, 
  RefreshCcw, 
  Shield, 
  User,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    icon: Ticket,
    title: "Buying Tickets",
    description: "How to find, purchase, and receive your tickets",
    articles: 12
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Payment methods, pricing, and billing questions",
    articles: 8
  },
  {
    icon: Truck,
    title: "Ticket Delivery",
    description: "Delivery methods, timelines, and tracking",
    articles: 10
  },
  {
    icon: RefreshCcw,
    title: "Refunds & Exchanges",
    description: "Cancellation policies and refund requests",
    articles: 6
  },
  {
    icon: Shield,
    title: "Buyer Guarantee",
    description: "Understanding your protection and coverage",
    articles: 5
  },
  {
    icon: User,
    title: "Account & Profile",
    description: "Managing your account settings and preferences",
    articles: 7
  }
];

const popularArticles = [
  "How do I access my tickets?",
  "What is the GoTickets Buyer Guarantee?",
  "How long does ticket delivery take?",
  "Can I get a refund if the event is canceled?",
  "How do I transfer tickets to someone else?",
  "What payment methods do you accept?",
  "How do I contact customer support?",
  "Are all tickets on GoTickets authentic?"
];

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How Can We Help?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Search our knowledge base or browse categories below
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                placeholder="Search for help articles..." 
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((category) => (
              <div 
                key={category.title}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
              >
                <category.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-muted-foreground mb-3">{category.description}</p>
                <span className="text-sm text-primary">{category.articles} articles</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Popular Articles</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-background rounded-xl border border-border divide-y divide-border">
              {popularArticles.map((article, index) => (
                <button 
                  key={index}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-foreground">{article}</span>
                  <ChevronRight className="text-muted-foreground flex-shrink-0" size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Still Need Help?</h2>
          <p className="text-muted-foreground text-center mb-12">
            Our support team is available 24/7 to assist you
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground mb-4">Speak with a representative</p>
              <a href="tel:1-800-555-0123" className="text-primary font-semibold hover:underline">
                1-800-555-0123
              </a>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-4">Chat with our support team</p>
              <Button>Start Chat</Button>
            </div>
            <div className="p-6 bg-card rounded-xl border border-border text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-4">Get help via email</p>
              <a href="mailto:support@gotickets.com" className="text-primary font-semibold hover:underline">
                support@gotickets.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/faqs" className="text-muted-foreground hover:text-primary flex items-center gap-1">
              View FAQs
              <ExternalLink size={14} />
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary flex items-center gap-1">
              Contact Form
              <ExternalLink size={14} />
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary flex items-center gap-1">
              Terms of Service
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;
