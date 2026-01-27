import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accessibility as AccessibilityIcon, Eye, Ear, Hand, Brain, Phone, Mail } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Visual Accessibility",
    items: [
      "High contrast mode support",
      "Scalable text up to 200% without loss of functionality",
      "Alternative text for all images",
      "Clear, readable fonts",
      "Color is not the sole means of conveying information"
    ]
  },
  {
    icon: Ear,
    title: "Auditory Accessibility",
    items: [
      "Captions for video content",
      "Visual alternatives for audio alerts",
      "No auto-playing audio content",
      "Transcript availability for multimedia"
    ]
  },
  {
    icon: Hand,
    title: "Motor Accessibility",
    items: [
      "Full keyboard navigation",
      "Large clickable areas",
      "No time-limited interactions",
      "Skip navigation links",
      "Focus indicators on all interactive elements"
    ]
  },
  {
    icon: Brain,
    title: "Cognitive Accessibility",
    items: [
      "Clear, simple language",
      "Consistent navigation",
      "Error prevention and recovery",
      "Predictable page layouts",
      "Progress indicators for multi-step processes"
    ]
  }
];

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AccessibilityIcon className="text-primary" size={32} />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Accessibility Statement</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                GoTickets is committed to ensuring digital accessibility for people with disabilities. 
                We continually improve the user experience for everyone and apply relevant accessibility 
                standards.
              </p>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Commitment</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At GoTickets, we believe that everyone deserves equal access to live entertainment. 
                  We are committed to providing a website and mobile applications that are accessible 
                  to the widest possible audience, regardless of technology or ability. We aim to comply 
                  with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Accessibility Features</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {features.map((feature) => (
                    <div key={feature.title} className="p-6 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <feature.icon className="text-primary" size={24} />
                        <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {feature.items.map((item, index) => (
                          <li key={index} className="text-muted-foreground text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Assistive Technologies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our website is designed to be compatible with the following assistive technologies:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
                  <li>Screen magnification software</li>
                  <li>Speech recognition software</li>
                  <li>Keyboard-only navigation</li>
                  <li>Switch control devices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Keyboard Navigation</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our website can be navigated using only a keyboard. Common keyboard shortcuts include:
                </p>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Key</th>
                        <th className="text-left py-2 text-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="py-2"><kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd></td>
                        <td className="py-2">Move to the next interactive element</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2"><kbd className="px-2 py-1 bg-muted rounded text-xs">Shift + Tab</kbd></td>
                        <td className="py-2">Move to the previous interactive element</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2"><kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd></td>
                        <td className="py-2">Activate links and buttons</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2"><kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd></td>
                        <td className="py-2">Toggle checkboxes and buttons</td>
                      </tr>
                      <tr>
                        <td className="py-2"><kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd></td>
                        <td className="py-2">Close modals and dialogs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Accessible Seating</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Many venues offer accessible seating options for guests with disabilities. When purchasing 
                  tickets, look for the accessibility icon or filter for "Accessible Seating" to find 
                  wheelchair-accessible locations, companion seats, and other accommodations. If you need 
                  assistance finding accessible seating, please contact our customer support team.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Ongoing Efforts</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We are continuously working to improve the accessibility of our platform. Our efforts include:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Regular accessibility audits and testing</li>
                  <li>Training our development team on accessibility best practices</li>
                  <li>Including people with disabilities in our user testing</li>
                  <li>Monitoring and addressing accessibility issues promptly</li>
                  <li>Staying current with accessibility standards and guidelines</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Known Limitations</h2>
                <p className="text-muted-foreground leading-relaxed">
                  While we strive for comprehensive accessibility, some content may have limitations:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Some older PDFs may not be fully accessible (we are working to remediate these)</li>
                  <li>Some third-party content may not meet our accessibility standards</li>
                  <li>Interactive seating maps are being enhanced for better screen reader support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Feedback & Assistance</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We welcome your feedback on the accessibility of GoTickets. If you encounter any 
                  accessibility barriers or have suggestions for improvement, please let us know:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="text-primary" size={20} />
                      <span className="font-semibold text-foreground">Phone Support</span>
                    </div>
                    <p className="text-muted-foreground text-sm">1-800-555-0123</p>
                    <p className="text-muted-foreground text-sm">Available 24/7</p>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="text-primary" size={20} />
                      <span className="font-semibold text-foreground">Email</span>
                    </div>
                    <p className="text-muted-foreground text-sm">accessibility@gotickets.com</p>
                    <p className="text-muted-foreground text-sm">Response within 24 hours</p>
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  This accessibility statement was last updated on January 1, 2026. We review and update 
                  this statement regularly to ensure it reflects our current accessibility practices.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Accessibility;
