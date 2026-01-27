import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last Updated: January 1, 2026</p>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  GoTickets, Inc. ("GoTickets," "we," "us," or "our") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                  when you use our website, mobile applications, and services (collectively, the "Services"). 
                  Please read this policy carefully to understand our views and practices regarding your 
                  personal data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Account information: name, email address, phone number, password</li>
                  <li>Payment information: credit card details, billing address</li>
                  <li>Transaction information: tickets purchased, events attended</li>
                  <li>Communication data: messages, feedback, support inquiries</li>
                  <li>Seller information: bank account details for payments</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">2.2 Information Collected Automatically</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Device information: IP address, browser type, operating system</li>
                  <li>Usage data: pages visited, features used, time spent on site</li>
                  <li>Location data: general location based on IP address</li>
                  <li>Cookies and similar technologies: preferences, session data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Process transactions and deliver tickets</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send important updates about your purchases</li>
                  <li>Personalize your experience and recommend events</li>
                  <li>Improve our Services and develop new features</li>
                  <li>Prevent fraud and ensure security</li>
                  <li>Comply with legal obligations</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Ticket Sellers:</strong> To facilitate transactions and ticket delivery</li>
                  <li><strong>Event Organizers:</strong> For event entry and verification</li>
                  <li><strong>Service Providers:</strong> Payment processors, email providers, analytics</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures to protect your personal information, 
                  including SSL encryption, secure data centers, access controls, and regular security 
                  audits. However, no method of transmission over the Internet is 100% secure, and we 
                  cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Rights and Choices</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience, analyze 
                  usage, and serve personalized content. You can manage your cookie preferences through 
                  your browser settings. For more details, please see our Cookie Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as necessary to fulfill the purposes 
                  outlined in this Privacy Policy, unless a longer retention period is required by law. 
                  Transaction data is typically retained for 7 years for legal and tax purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our Services are not intended for children under 13. We do not knowingly collect 
                  personal information from children under 13. If we learn that we have collected 
                  information from a child under 13, we will take steps to delete it promptly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. California Privacy Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  California residents have additional rights under the California Consumer Privacy Act 
                  (CCPA), including the right to know what personal information we collect, the right to 
                  delete personal information, the right to opt-out of the sale of personal information, 
                  and the right to non-discrimination.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. International Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your information in accordance 
                  with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material 
                  changes by posting the new Privacy Policy on our website and updating the "Last Updated" 
                  date. Your continued use of our Services after such changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy or our privacy practices, contact us at:<br />
                  GoTickets, Inc.<br />
                  Attn: Privacy Team<br />
                  123 Main Street<br />
                  Lincoln, NE 68508<br />
                  Email: privacy@gotickets.com<br />
                  Phone: 1-800-555-0123
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

export default Privacy;
