import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground mb-8">Last Updated: January 1, 2026</p>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. What Are Cookies?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile) 
                  when you visit a website. They are widely used to make websites work more efficiently and 
                  to provide information to website owners. Cookies help us recognize your device, remember 
                  your preferences, and improve your overall experience on our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Essential Cookies</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These cookies are necessary for the website to function properly. They enable core 
                  functionality such as security, network management, and account access. You cannot 
                  opt out of these cookies as the website cannot function properly without them.
                </p>
                <div className="bg-card p-4 rounded-lg border border-border mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Cookie Name</th>
                        <th className="text-left py-2 text-foreground">Purpose</th>
                        <th className="text-left py-2 text-foreground">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="py-2">session_id</td>
                        <td className="py-2">Maintains user session</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2">csrf_token</td>
                        <td className="py-2">Security protection</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="py-2">auth_token</td>
                        <td className="py-2">Authentication</td>
                        <td className="py-2">30 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">2.2 Performance Cookies</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These cookies collect information about how visitors use our website, such as which 
                  pages are visited most often and if users receive error messages. This data helps us 
                  improve website performance and user experience.
                </p>
                <div className="bg-card p-4 rounded-lg border border-border mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Cookie Name</th>
                        <th className="text-left py-2 text-foreground">Purpose</th>
                        <th className="text-left py-2 text-foreground">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="py-2">_ga</td>
                        <td className="py-2">Google Analytics tracking</td>
                        <td className="py-2">2 years</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2">_gid</td>
                        <td className="py-2">Google Analytics session</td>
                        <td className="py-2">24 hours</td>
                      </tr>
                      <tr>
                        <td className="py-2">performance_id</td>
                        <td className="py-2">Page load performance</td>
                        <td className="py-2">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">2.3 Functional Cookies</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These cookies allow the website to remember choices you make (such as your language 
                  preference or region) and provide enhanced, personalized features.
                </p>
                <div className="bg-card p-4 rounded-lg border border-border mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Cookie Name</th>
                        <th className="text-left py-2 text-foreground">Purpose</th>
                        <th className="text-left py-2 text-foreground">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="py-2">locale</td>
                        <td className="py-2">Language preference</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2">currency</td>
                        <td className="py-2">Currency preference</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr>
                        <td className="py-2">recent_searches</td>
                        <td className="py-2">Search history</td>
                        <td className="py-2">30 days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">2.4 Targeting/Advertising Cookies</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These cookies are used to deliver advertisements more relevant to you and your interests. 
                  They are also used to limit the number of times you see an advertisement and to help 
                  measure the effectiveness of advertising campaigns.
                </p>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Cookie Name</th>
                        <th className="text-left py-2 text-foreground">Purpose</th>
                        <th className="text-left py-2 text-foreground">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="py-2">_fbp</td>
                        <td className="py-2">Facebook advertising</td>
                        <td className="py-2">3 months</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2">ads_prefs</td>
                        <td className="py-2">Ad preferences</td>
                        <td className="py-2">1 year</td>
                      </tr>
                      <tr>
                        <td className="py-2">targeting_id</td>
                        <td className="py-2">Personalized ads</td>
                        <td className="py-2">6 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Third-Party Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In addition to our own cookies, we may also use various third-party cookies to report 
                  usage statistics, deliver advertisements, and provide other services. These third parties 
                  include analytics providers (like Google Analytics), advertising networks, and social 
                  media platforms. These third parties have their own privacy policies governing their 
                  use of cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Managing Cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to choose whether or not to accept cookies. You can manage your 
                  cookie preferences in the following ways:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                  <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings</li>
                  <li><strong>Cookie Consent:</strong> Use our cookie consent tool to customize your preferences</li>
                  <li><strong>Opt-Out Tools:</strong> Use industry opt-out tools like the NAI Consumer Opt-Out</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Please note that if you choose to block or delete cookies, some features of our website 
                  may not function properly, and your user experience may be affected.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Cookie Consent</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you first visit our website, you will be shown a cookie consent banner that allows 
                  you to accept or customize your cookie preferences. Your consent is stored and will be 
                  remembered for future visits. You can change your preferences at any time by clicking 
                  the "Cookie Settings" link in our website footer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Updates to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in technology, 
                  legislation, or our data practices. When we make changes, we will update the "Last 
                  Updated" date at the top of this policy. We encourage you to periodically review this 
                  page for the latest information on our cookie practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about our use of cookies or this Cookie Policy, please 
                  contact us at:<br />
                  GoTickets, Inc.<br />
                  123 Main Street<br />
                  Lincoln, NE 68508<br />
                  Email: privacy@gotickets.com<br />
                  Phone: 1-800-555-0123
                </p>
              </section>

              <section className="pt-8 border-t border-border">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button>Manage Cookie Preferences</Button>
                  <Button variant="outline">Accept All Cookies</Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;
