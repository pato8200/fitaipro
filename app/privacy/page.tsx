'use client';

import Link from 'next/link';
import { Dumbbell, Shield, Database, Eye, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-yellow-600/20 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                FitAI Pro
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/login" className="text-gray-300 hover:text-yellow-400 transition text-sm font-medium">
                Sign In
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 px-4 py-2 rounded-lg text-white text-sm font-semibold transition shadow-lg shadow-yellow-500/20">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-12 h-12 text-yellow-500" />
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
              <p className="text-gray-400">Last updated: March 13, 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                FitAI Pro ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our gym management platform 
                and AI personal training services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">2. Information We Collect</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Database className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">Personal Information</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Name, email address, phone number</li>
                      <li>Account credentials (username, password)</li>
                      <li>Payment information (processed securely by Stripe)</li>
                      <li>Gym membership details and fitness goals</li>
                      <li>Health and medical information (optional, for personalized training)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Eye className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">Usage Data</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Workout logs and exercise history</li>
                      <li>Class attendance and bookings</li>
                      <li>AI conversation history</li>
                      <li>Device and browser information</li>
                      <li>IP address and access times</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Process payments and send billing notifications</li>
                <li>Generate personalized AI workout plans</li>
                <li>Schedule and manage fitness classes</li>
                <li>Track your fitness progress and analytics</li>
                <li>Send service updates and promotional communications (with your consent)</li>
                <li>Respond to your comments and questions</li>
                <li>Protect against fraud and unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">4. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-4">We do NOT sell, trade, or rent your personal information to third parties. We may share data only in these situations:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With vendors who perform services on our behalf (e.g., Stripe for payments, email providers)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (users will be notified)</li>
                <li><strong>With Consent:</strong> When you explicitly agree to share information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">5. Data Security</h2>
              <div className="flex items-start space-x-3 mb-4">
                <Lock className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="leading-relaxed">
                    We implement industry-standard security measures to protect your personal information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li>Encryption in transit (HTTPS/TLS)</li>
                    <li>Secure password hashing (bcrypt)</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                    <li>Secure database management with PostgreSQL</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">6. Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintain your session and authentication</li>
                <li>Remember your preferences</li>
                <li>Analyze site usage and performance</li>
                <li>Improve user experience</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You can control cookie settings through your browser, but disabling cookies may limit your ability to use certain features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">7. Your Rights and Choices</h2>
              <p className="leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">8. GDPR Compliance (EU Users)</h2>
              <p className="leading-relaxed">
                If you are located in the European Economic Area, we process your data in accordance with GDPR requirements. 
                Our legal basis for processing includes contract performance, legitimate interests, and your consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">9. CCPA Compliance (California Users)</h2>
              <p className="leading-relaxed">
                California residents have additional rights under the California Consumer Privacy Act (CCPA), including 
                the right to know what personal information is collected, the right to delete, and the right to opt-out 
                of sales of personal information. We do not sell personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">10. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you become aware that a child has provided us with personal 
                information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">11. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure 
                appropriate safeguards are in place, such as Standard Contractual Clauses, to protect your data 
                in accordance with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">12. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p className="leading-relaxed mt-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days, 
                unless retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">13. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the new policy on our website</li>
                <li>Sending you an email notification</li>
                <li>Displaying a prominent notice in our app</li>
              </ul>
              <p className="leading-relaxed mt-4">
                The "Last updated" date at the top of this page indicates when changes were made.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">14. Third-Party Links</h2>
              <p className="leading-relaxed">
                Our service may contain links to third-party websites (e.g., Stripe for payments). We are not 
                responsible for the privacy practices of those sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">15. Contact Us</h2>
              <p className="leading-relaxed">
                For questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 space-y-2">
                <p>Email: <a href="mailto:privacy@fitaipro.com" className="text-yellow-400 hover:underline">privacy@fitaipro.com</a></p>
                <p>Data Protection Officer: <a href="mailto:dpo@fitaipro.com" className="text-yellow-400 hover:underline">dpo@fitaipro.com</a></p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-yellow-600/20 bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-3">Your Privacy Matters</h3>
            <p className="text-gray-400 leading-relaxed">
              We are committed to maintaining your trust and protecting your privacy. If you have any questions or 
              concerns about how we handle your data, please don't hesitate to reach out to us.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-yellow-600/20">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2026 FitAI Pro. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="/terms" className="hover:text-yellow-400 transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-yellow-400 transition">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
