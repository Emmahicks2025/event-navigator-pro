import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const faqCategories = [
  {
    title: "Buying Tickets",
    faqs: [
      {
        question: "How do I purchase tickets on GoTickets?",
        answer: "To purchase tickets, simply search for the event you want to attend, select your preferred seats from the interactive seating map, and proceed to checkout. You can pay using all major credit cards, PayPal, or Apple Pay. Your tickets will be delivered electronically to your email and account."
      },
      {
        question: "Are the tickets on GoTickets authentic?",
        answer: "Yes, all tickets sold on GoTickets are 100% authentic and guaranteed. We work with verified sellers and have strict verification processes in place. Every purchase is backed by our Buyer Guarantee, which ensures you'll receive valid tickets before the event."
      },
      {
        question: "What is the GoTickets Buyer Guarantee?",
        answer: "Our Buyer Guarantee is your protection when purchasing tickets. It ensures that: (1) You'll receive your tickets in time for the event, (2) Your tickets will be valid for entry, (3) Your tickets will be the same or comparable to what you ordered. If any of these conditions aren't met, you'll receive a full refund or replacement tickets."
      },
      {
        question: "Can I choose my exact seats?",
        answer: "Yes! Our interactive seating maps allow you to view and select specific seats. You can see the section, row, and seat numbers before purchasing. Some listings may show a general section rather than exact seats, which will be noted in the listing details."
      },
      {
        question: "Why are ticket prices different from face value?",
        answer: "GoTickets is a secondary marketplace where tickets are sold by fans and verified sellers. Prices are set by individual sellers based on demand, seat location, and availability. Prices may be above or below the original face value depending on these factors."
      }
    ]
  },
  {
    title: "Ticket Delivery",
    faqs: [
      {
        question: "How will I receive my tickets?",
        answer: "Most tickets are delivered electronically via email or directly to your GoTickets account. You can access your tickets through our mobile app or website. Some tickets may be shipped physically or available for pickup, which will be clearly indicated before purchase."
      },
      {
        question: "How long does ticket delivery take?",
        answer: "Electronic tickets are typically delivered within minutes to a few hours after purchase. For events further out, tickets may be delivered closer to the event date (usually within 24-48 hours before). Physical tickets are shipped via express mail and tracking information is provided."
      },
      {
        question: "What if I don't receive my tickets?",
        answer: "If you haven't received your tickets, first check your spam folder and GoTickets account. If they're still not there, contact our support team immediately. Our Buyer Guarantee ensures you'll receive your tickets or a full refund."
      },
      {
        question: "Can I transfer my tickets to someone else?",
        answer: "Yes, most electronic tickets can be transferred to another person directly through your GoTickets account. Simply go to your orders, select the tickets you want to transfer, and enter the recipient's email address. They'll receive instructions to claim the tickets."
      }
    ]
  },
  {
    title: "Refunds & Cancellations",
    faqs: [
      {
        question: "Can I get a refund on my ticket purchase?",
        answer: "All sales on GoTickets are final. However, if an event is canceled and not rescheduled, you'll receive a full refund including all fees. If an event is postponed or rescheduled, your tickets will typically be valid for the new date."
      },
      {
        question: "What happens if an event is canceled?",
        answer: "If an event is officially canceled (not postponed), you'll receive a full refund to your original payment method within 7-10 business days. We'll email you as soon as we're notified of the cancellation."
      },
      {
        question: "What if an event is postponed or rescheduled?",
        answer: "For postponed or rescheduled events, your original tickets will be valid for the new date. If you can't attend the new date, some venues may offer refund options - check your email for event-specific instructions."
      },
      {
        question: "I can't attend the event. What are my options?",
        answer: "While we don't offer refunds for change of plans, you can list your tickets for resale on our platform. This allows you to potentially recoup your costs by selling to another fan. There are no upfront fees to list tickets for sale."
      }
    ]
  },
  {
    title: "Selling Tickets",
    faqs: [
      {
        question: "How do I sell tickets on GoTickets?",
        answer: "To sell tickets, go to our 'Sell Tickets' page and fill out the listing form with your event details, seat information, and asking price. Once submitted, our team will review and approve your listing. When your tickets sell, you'll receive payment via your preferred method."
      },
      {
        question: "What fees do sellers pay?",
        answer: "Sellers pay a small commission fee when their tickets sell, which is deducted from the sale price. There are no upfront fees to list tickets. The exact fee percentage is displayed before you confirm your listing."
      },
      {
        question: "How do I get paid for sold tickets?",
        answer: "Payments are processed within 5-7 business days after the event takes place. You can choose to receive payment via direct deposit, PayPal, or check. Payment is released after the event to ensure buyers successfully used their tickets."
      },
      {
        question: "Can I set my own price?",
        answer: "Yes, sellers have full control over their listing price. However, we recommend pricing competitively based on similar listings for the event. Our platform may provide suggested pricing based on market data to help you sell quickly."
      }
    ]
  },
  {
    title: "Account & Security",
    faqs: [
      {
        question: "How do I create an account?",
        answer: "Click 'Sign In' at the top of the page, then select 'Create Account.' You can register using your email address or sign in with Google. Your account lets you track orders, save favorite events, and access exclusive presale opportunities."
      },
      {
        question: "Is my payment information secure?",
        answer: "Absolutely. We use industry-standard SSL encryption and never store your full credit card details on our servers. We're PCI-DSS compliant and partner with trusted payment processors to ensure your financial information is protected."
      },
      {
        question: "How do I reset my password?",
        answer: "Click 'Sign In,' then 'Forgot Password.' Enter your email address and we'll send you a link to create a new password. For security, this link expires after 24 hours."
      },
      {
        question: "Can I change my email address?",
        answer: "Yes, you can update your email address in your account settings. Go to your profile, click 'Edit,' and enter your new email address. You'll need to verify the new email before the change takes effect."
      }
    ]
  }
];

const FAQs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Find answers to common questions about buying, selling, and using GoTickets.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                placeholder="Search FAQs..." 
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h2 className="text-2xl font-bold text-foreground mb-6">{category.title}</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${category.title}-${index}`}
                      className="bg-card border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="text-foreground font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you're looking for? Our support team is available 24/7 to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/help">Visit Help Center</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQs;
