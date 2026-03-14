'use client';

import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Last updated: March 13, 2026</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing or using FitAI Pro ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of the terms, then you may not access the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">2. Description of Service</h2>
              <p className="leading-relaxed mb-4">
                FitAI Pro is an AI-powered gym management system that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Gym management and member tracking</li>
                <li>AI-powered workout generation</li>
                <li>Class scheduling and booking</li>
                <li>Payment processing and billing</li>
                <li>Analytics and reporting</li>
                <li>Member engagement tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">3. User Accounts</h2>
              <p className="leading-relaxed mb-4">
                To use our Service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Providing accurate and complete information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">4. Subscription and Billing</h2>
              <p className="leading-relaxed mb-4">
                FitAI Pro offers tiered subscription plans:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Starter Plan ($49/month):</strong> Up to 100 members, basic features</li>
                <li><strong>Professional Plan ($149/month):</strong> Unlimited members, full AI suite</li>
                <li><strong>Enterprise Plan ($399/month):</strong> Multi-location, white-label options</li>
              </ul>
              <p className="leading-relaxed mt-4">
                All payments are processed through Stripe. Subscriptions automatically renew unless cancelled 
                at least 24 hours before the end of the current period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">5. Acceptable Use</h2>
              <p className="leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the service for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on others' intellectual property rights</li>
                <li>Transmit harmful code or malware</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Resell or redistribute the service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">6. AI-Powered Features Disclaimer</h2>
              <p className="leading-relaxed mb-4">
                Our AI personal trainer features provide general fitness guidance. You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI advice is not a substitute for professional medical advice</li>
                <li>You should consult with healthcare professionals before starting any fitness program</li>
                <li>We are not liable for injuries resulting from following AI recommendations</li>
                <li>AI suggestions may not be suitable for all fitness levels or medical conditions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">7. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content, features, and functionality of FitAI Pro are owned by FitAI Pro and protected 
                by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">8. Termination</h2>
              <p className="leading-relaxed">
                We reserve the right to terminate or suspend your account at our sole discretion, without notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">9. Limitation of Liability</h2>
              <p className="leading-relaxed">
                FitAI Pro shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages resulting from your use or inability to use the service, unauthorized access to your data, 
                or any other matter relating to the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">10. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes 
                via email or through prominent notices on our platform. Your continued use of the service after 
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">11. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States, 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">12. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms, please contact us at:
                <br />
                Email: <a href="mailto:legal@fitaipro.com" className="text-yellow-400 hover:underline">legal@fitaipro.com</a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-yellow-600/20">
            <p className="text-gray-400 text-sm">
              By using FitAI Pro, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
