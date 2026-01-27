import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, DollarSign, Heart, Zap, Users, Coffee } from "lucide-react";

const benefits = [
  { icon: Heart, title: "Health & Wellness", description: "Comprehensive medical, dental, and vision coverage for you and your family" },
  { icon: DollarSign, title: "Competitive Pay", description: "Industry-leading salaries with annual performance bonuses" },
  { icon: Clock, title: "Flexible Schedule", description: "Remote-first culture with flexible working hours" },
  { icon: Coffee, title: "Perks & Extras", description: "Free event tickets, team outings, and wellness stipends" },
  { icon: Zap, title: "Growth", description: "Professional development budget and career advancement opportunities" },
  { icon: Users, title: "Great Team", description: "Work alongside passionate, talented people who love live events" }
];

const openPositions = [
  {
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Remote / Lincoln, NE",
    type: "Full-time",
    description: "Build and scale our ticket marketplace platform serving millions of users."
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "Remote / Lincoln, NE",
    type: "Full-time",
    description: "Drive product strategy and roadmap for our buyer and seller experiences."
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote",
    type: "Full-time",
    description: "Ensure our enterprise partners achieve their goals with our platform."
  },
  {
    title: "Data Analyst",
    department: "Data",
    location: "Remote / Lincoln, NE",
    type: "Full-time",
    description: "Transform data into actionable insights that drive business decisions."
  },
  {
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Create compelling campaigns that connect fans with live events."
  },
  {
    title: "UX Designer",
    department: "Design",
    location: "Remote / Lincoln, NE",
    type: "Full-time",
    description: "Design intuitive, delightful experiences for millions of ticket buyers."
  },
  {
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build and maintain our cloud infrastructure for high availability."
  },
  {
    title: "Customer Support Representative",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    description: "Provide world-class support to our customers via phone, email, and chat."
  }
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Help us connect millions of fans with the live events they love. 
              We're looking for passionate people who want to make a difference.
            </p>
            <Button size="lg" className="text-lg px-8">
              View Open Positions
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why Work With Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-4">
                <div className="flex-shrink-0">
                  <benefit.icon className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Culture</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At GoTickets, we believe in working hard and celebrating together. Our team is united 
              by a shared passion for live entertainment and a commitment to excellence. We foster 
              an inclusive environment where everyone's voice is heard and valued. Whether you're 
              working from our Lincoln headquarters or remotely, you'll be part of a supportive 
              community that pushes each other to grow.
            </p>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Open Positions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {openPositions.map((position, index) => (
              <div 
                key={index} 
                className="p-6 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{position.title}</h3>
                    <p className="text-muted-foreground mb-3">{position.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Briefcase size={12} />
                        {position.department}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MapPin size={12} />
                        {position.location}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock size={12} />
                        {position.type}
                      </Badge>
                    </div>
                  </div>
                  <Button>Apply Now</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Don't See Your Role?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're always looking for talented people. Send us your resume and tell us how you can contribute.
            </p>
            <Button variant="outline" size="lg">
              Submit General Application
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
