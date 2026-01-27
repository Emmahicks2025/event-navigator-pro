import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Users, Trophy, Heart, Target, Zap } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Every transaction is backed by our 100% buyer guarantee. Your tickets will arrive before the event, guaranteed."
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Our dedicated support team is available 24/7 to ensure you have the best experience from purchase to event."
  },
  {
    icon: Trophy,
    title: "Excellence",
    description: "We partner with the best venues and sellers to bring you premium access to the events you love."
  },
  {
    icon: Heart,
    title: "Passion",
    description: "We're fans too. We understand the excitement of live events and work tirelessly to connect you with unforgettable experiences."
  },
  {
    icon: Target,
    title: "Innovation",
    description: "Cutting-edge technology powers our platform, making ticket buying seamless, secure, and stress-free."
  },
  {
    icon: Zap,
    title: "Speed",
    description: "Instant ticket delivery and real-time inventory updates ensure you never miss out on the events you want."
  }
];

const stats = [
  { value: "10M+", label: "Tickets Sold" },
  { value: "50K+", label: "Events Listed" },
  { value: "99.9%", label: "Customer Satisfaction" },
  { value: "24/7", label: "Support Available" }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About GoTickets
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Founded in 2010, GoTickets has grown to become one of the most trusted ticket marketplaces 
              in the world. We connect millions of fans with the live events they love, from concerts 
              and sports to theater and comedy.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              To make live entertainment accessible to everyone by providing a safe, transparent, 
              and reliable marketplace where fans can buy and sell tickets with confidence. We believe 
              that every person deserves the opportunity to experience the magic of live events.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="p-6 bg-background rounded-lg border border-border">
                <value.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                GoTickets was born from a simple frustration: the difficulty of finding reliable, 
                fairly-priced tickets to live events. Our founders, lifelong music and sports fans, 
                set out to create a marketplace that prioritized trust and transparency.
              </p>
              <p>
                Starting from a small office in Lincoln, Nebraska, we've grown to serve millions 
                of customers across the United States. Our team has expanded from 3 passionate 
                individuals to over 500 dedicated employees, all united by our love for live entertainment.
              </p>
              <p>
                Today, GoTickets is proud to be a leader in the secondary ticket market, known for 
                our industry-leading buyer guarantee, exceptional customer service, and commitment 
                to fair pricing. We continue to innovate and improve, always keeping our customers 
                at the heart of everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
