import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-20 bg-background">
        <section className="px-6">
          <div className="max-w-3xl mx-auto prose-sm">
            <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
            <p className="text-sm text-muted mb-4">Last updated: April 7, 2026</p>

            <div className="space-y-8 text-sm text-muted leading-relaxed">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">1. Information We Collect</h2>
                <p className="mb-3">When you use our audit service or contact us, we may collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email address</li>
                  <li>Shopify store URL</li>
                  <li>Name (when provided via contact or consultation forms)</li>
                  <li>Information about your operational challenges (when voluntarily shared)</li>
                  <li>Usage data and analytics (page views, form interactions)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
                <p className="mb-3">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Generate and deliver your preliminary audit report</li>
                  <li>Send the audit report to your email address</li>
                  <li>Respond to your inquiries and consultation requests</li>
                  <li>Improve our services and website experience</li>
                  <li>Send occasional follow-up communications (with your consent)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">3. Public Data Usage</h2>
                <p>
                  Our audit service reviews publicly accessible information from Shopify storefronts.
                  We do not access, collect, or store any private Shopify admin data, customer data,
                  financial records, or internal business information.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">4. Data Sharing</h2>
                <p>
                  We do not sell, rent, or share your personal information with third parties
                  for marketing purposes. We may share data with service providers who assist
                  in operating our website and delivering our services (e.g., email delivery,
                  cloud hosting), subject to confidentiality obligations.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">5. Data Security</h2>
                <p>
                  We implement reasonable security measures to protect your information.
                  However, no method of transmission over the internet is 100% secure.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">6. Your Rights</h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request access to the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">7. Contact</h2>
                <p>
                  For privacy-related inquiries, contact us at{" "}
                  <a href="mailto:privacy@bconsultedfirst.com" className="text-primary hover:text-accent">
                    privacy@bconsultedfirst.com
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
