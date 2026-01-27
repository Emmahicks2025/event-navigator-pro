import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, ExternalLink, Calendar } from "lucide-react";

const pressReleases = [
  {
    date: "January 15, 2026",
    title: "GoTickets Surpasses 10 Million Tickets Sold in 2025",
    excerpt: "Record-breaking year sees 40% growth in transactions as live events industry continues strong recovery.",
    category: "Company News"
  },
  {
    date: "December 10, 2025",
    title: "GoTickets Launches Enhanced Buyer Protection Program",
    excerpt: "New program offers industry-leading guarantees including 200% refund for invalid tickets.",
    category: "Product"
  },
  {
    date: "November 5, 2025",
    title: "GoTickets Expands Partnership with Major League Baseball",
    excerpt: "Multi-year agreement makes GoTickets an official ticket resale partner for all 30 MLB teams.",
    category: "Partnership"
  },
  {
    date: "October 20, 2025",
    title: "GoTickets Named to Forbes' Best Employers List",
    excerpt: "Recognition highlights company's commitment to employee wellbeing and inclusive culture.",
    category: "Awards"
  },
  {
    date: "September 8, 2025",
    title: "GoTickets Introduces Mobile-First Ticket Transfer Technology",
    excerpt: "New feature enables instant, secure ticket transfers directly within the mobile app.",
    category: "Product"
  },
  {
    date: "August 15, 2025",
    title: "GoTickets Reports Q2 Revenue Growth of 35%",
    excerpt: "Strong performance driven by concert and sports ticket sales across all major markets.",
    category: "Financial"
  }
];

const mediaContacts = [
  {
    name: "Sarah Johnson",
    title: "VP of Communications",
    email: "press@gotickets.com"
  },
  {
    name: "Michael Chen",
    title: "Media Relations Manager",
    email: "media@gotickets.com"
  }
];

const Press = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Press & Media
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Get the latest news, announcements, and media resources from GoTickets. 
              For press inquiries, please contact our communications team.
            </p>
          </div>
        </div>
      </section>

      {/* Media Kit Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Media Kit</h2>
              <p className="text-muted-foreground">
                Download our official logos, brand guidelines, and company fact sheet.
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Download size={18} />
              Download Media Kit
            </Button>
          </div>
        </div>
      </section>

      {/* Press Releases Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Press Releases</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {pressReleases.map((release, index) => (
              <article 
                key={index} 
                className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge variant="secondary">{release.category}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar size={14} />
                    {release.date}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary cursor-pointer">
                  {release.title}
                </h3>
                <p className="text-muted-foreground mb-4">{release.excerpt}</p>
                <Button variant="link" className="p-0 h-auto flex items-center gap-1">
                  Read Full Release
                  <ExternalLink size={14} />
                </Button>
              </article>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline">View All Press Releases</Button>
          </div>
        </div>
      </section>

      {/* Media Contacts Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Media Contacts</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {mediaContacts.map((contact, index) => (
              <div key={index} className="p-6 bg-background rounded-lg border border-border text-center">
                <h3 className="text-xl font-semibold text-foreground mb-1">{contact.name}</h3>
                <p className="text-muted-foreground mb-4">{contact.title}</p>
                <a 
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail size={16} />
                  {contact.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Facts Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Company Facts</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 border-l-4 border-primary">
                <h3 className="font-semibold text-foreground">Founded</h3>
                <p className="text-muted-foreground">2010 in Lincoln, Nebraska</p>
              </div>
              <div className="p-4 border-l-4 border-primary">
                <h3 className="font-semibold text-foreground">Headquarters</h3>
                <p className="text-muted-foreground">Lincoln, Nebraska</p>
              </div>
              <div className="p-4 border-l-4 border-primary">
                <h3 className="font-semibold text-foreground">Employees</h3>
                <p className="text-muted-foreground">500+ across the United States</p>
              </div>
              <div className="p-4 border-l-4 border-primary">
                <h3 className="font-semibold text-foreground">Events Listed</h3>
                <p className="text-muted-foreground">50,000+ concerts, sports, theater & more</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Press;
