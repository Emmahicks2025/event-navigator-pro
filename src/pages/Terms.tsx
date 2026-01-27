import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last Updated: January 1, 2026</p>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using the GoTickets website, mobile applications, or any services provided by 
                  GoTickets ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do 
                  not agree to these Terms, please do not use our Services. These Terms apply to all visitors, 
                  users, and others who access or use the Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  GoTickets operates an online marketplace that connects buyers and sellers of tickets to live 
                  events, including concerts, sports, theater, and other entertainment events. GoTickets is not 
                  the original seller of tickets and does not set ticket prices. Prices are set by individual 
                  sellers and may be above or below the face value of the tickets.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To use certain features of our Services, you may be required to create an account. When 
                  creating an account, you agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Ticket Purchases</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All ticket sales are final. When you purchase tickets through GoTickets, you agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Pay the full purchase price, including all applicable taxes and fees</li>
                  <li>Provide valid payment information</li>
                  <li>Use the tickets only for personal, non-commercial purposes</li>
                  <li>Comply with all venue rules and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. GoTickets Buyer Guarantee</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All purchases are backed by the GoTickets Buyer Guarantee, which ensures that: (a) your 
                  tickets will be delivered in time for the event; (b) your tickets will provide valid entry 
                  to the event; and (c) your tickets will be the same or comparable to what you ordered. If 
                  these conditions are not met, you will receive a full refund or replacement tickets at our 
                  discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Selling Tickets</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When listing tickets for sale on GoTickets, you represent and warrant that:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>You own the tickets or are authorized to sell them</li>
                  <li>The tickets are valid and authentic</li>
                  <li>The information you provide about the tickets is accurate</li>
                  <li>You will transfer the tickets to the buyer promptly after sale</li>
                  <li>You will not sell tickets for more than the maximum price allowed by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Fees and Payments</h2>
                <p className="text-muted-foreground leading-relaxed">
                  GoTickets charges service fees on all transactions. Buyers pay service fees at the time of 
                  purchase, which are displayed before checkout. Sellers pay commission fees on successful 
                  sales, which are deducted from the payment amount. All fees are non-refundable except as 
                  required by our Buyer Guarantee or applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Prohibited Activities</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Violating any applicable laws or regulations</li>
                  <li>Selling counterfeit, stolen, or fraudulent tickets</li>
                  <li>Misrepresenting your identity or affiliation</li>
                  <li>Interfering with the proper functioning of our Services</li>
                  <li>Attempting to circumvent our security measures</li>
                  <li>Using automated systems to access our Services without permission</li>
                  <li>Engaging in any form of market manipulation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, GOTICKETS SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
                  WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER 
                  INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OUR SERVICES.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless GoTickets, its affiliates, officers, 
                  directors, employees, and agents from and against any claims, liabilities, damages, losses, 
                  and expenses, including reasonable legal fees, arising out of or in any way connected with 
                  your access to or use of our Services or your violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. If we make material changes, we 
                  will notify you by email or by posting a notice on our website. Your continued use of our 
                  Services after such notification constitutes your acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of 
                  Nebraska, without regard to its conflict of law provisions. Any legal action or proceeding 
                  relating to these Terms shall be brought exclusively in the state or federal courts located 
                  in Lancaster County, Nebraska.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms, please contact us at:<br />
                  GoTickets, Inc.<br />
                  123 Main Street<br />
                  Lincoln, NE 68508<br />
                  Email: legal@gotickets.com<br />
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

export default Terms;
