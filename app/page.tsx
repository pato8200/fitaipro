'use client';

import { 
  Dumbbell, 
  BarChart3, 
  CreditCard, 
  Users, 
  Calendar,
  Smartphone,
  Menu,
  X,
  Check,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-yellow-600/20 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">FitAI Pro</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-yellow-400 transition text-sm font-medium">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-yellow-400 transition text-sm font-medium">Pricing</a>
              <a href="#about" className="text-gray-300 hover:text-yellow-400 transition text-sm font-medium">About</a>
              <a href="/login" className="text-gray-300 hover:text-yellow-400 px-4 py-2 rounded-lg transition text-sm font-medium border border-gray-700 hover:border-yellow-600">
                Sign In
              </a>
              <a href="/register" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 px-4 py-2 rounded-lg text-white text-sm font-semibold transition shadow-lg shadow-yellow-500/20">
                Get Started
              </a>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-300 hover:text-yellow-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <a href="#features" className="block text-gray-300 hover:text-yellow-400 transition py-2">Features</a>
              <a href="#pricing" className="block text-gray-300 hover:text-yellow-400 transition py-2">Pricing</a>
              <a href="#about" className="block text-gray-300 hover:text-yellow-400 transition py-2">About</a>
              <a href="/login" className="block text-gray-300 hover:text-yellow-400 py-2 border border-gray-700 rounded-lg text-center">Sign In</a>
              <a href="/register" className="block bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 rounded-lg text-white text-center font-semibold">Get Started</a>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            AI-Powered Gym
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">Management System</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto px-4">
            Streamline operations, boost member retention, and grow your fitness business with intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <a href="/register" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-white font-semibold text-base sm:text-lg transition inline-block shadow-xl shadow-yellow-500/30 transform hover:scale-105">
              Start Free Trial
            </a>
            <a href="#features" className="border-2 border-yellow-600/50 hover:border-yellow-500 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-yellow-400 font-semibold text-base sm:text-lg transition inline-block hover:bg-yellow-500/10">
              Learn More
            </a>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">Powerful Features</h3>
            <p className="text-gray-400">Everything you need to run your gym efficiently</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <BarChart3 className="w-10 h-10" />,
                title: 'Smart Analytics',
                description: 'Real-time insights into member engagement and business performance'
              },
              {
                icon: <Dumbbell className="w-10 h-10" />,
                title: 'AI Workouts',
                description: 'Generate custom workout plans powered by advanced AI algorithms'
              },
              {
                icon: <CreditCard className="w-10 h-10" />,
                title: 'Automated Billing',
                description: 'Seamless subscription management with Stripe integration'
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: 'Member Management',
                description: 'Complete CRM for tracking members, attendance, and progress'
              },
              {
                icon: <Calendar className="w-10 h-10" />,
                title: 'Class Scheduling',
                description: 'Easy-to-use system for managing group fitness classes'
              },
              {
                icon: <Smartphone className="w-10 h-10" />,
                title: 'Mobile Ready',
                description: 'Fully responsive design that works on all devices'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 sm:p-8 border border-yellow-600/20 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 group">
                <div className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h4 className="text-lg sm:text-xl font-semibold text-yellow-400 mb-3">{feature.title}</h4>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mt-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h3>
            <p className="text-gray-400">Choose the plan that fits your gym</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$49',
                description: 'Perfect for small gyms',
                features: ['Up to 100 members', 'Basic AI workouts', 'Email support', 'Core analytics']
              },
              {
                name: 'Professional',
                price: '$149',
                description: 'For growing facilities',
                features: ['Unlimited members', 'Full AI suite', 'Priority support', 'Advanced analytics', 'Custom branding'],
                popular: true
              },
              {
                name: 'Enterprise',
                price: '$399',
                description: 'Large chains & franchises',
                features: ['Multi-location', 'Custom AI models', '24/7 support', 'White-label option', 'API access', 'Dedicated manager']
              }
            ].map((plan, index) => (
              <div key={index} className={`rounded-2xl p-6 sm:p-8 relative ${plan.popular ? 'bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 border-2 border-yellow-400 shadow-2xl shadow-yellow-500/30' : 'bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20'}`}>
                {plan.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-6 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">Most Popular</div>}
                <h4 className={`text-xl sm:text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-yellow-400'}`}>{plan.name}</h4>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-yellow-100' : 'text-gray-400'}`}>{plan.description}</p>
                <div className="mb-6">
                  <span className={`text-4xl sm:text-5xl font-bold ${plan.popular ? 'text-white' : 'text-yellow-400'}`}>{plan.price}</span>
                  <span className={`${plan.popular ? 'text-yellow-200' : 'text-gray-400'}`}>/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.popular ? 'text-yellow-300' : 'text-yellow-500'}`} />
                      <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-300'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold transition ${plan.popular ? 'bg-white text-yellow-700 hover:bg-yellow-50' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-400 hover:to-yellow-500 shadow-lg shadow-yellow-500/20'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-32 py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-yellow-600/20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-2">Why Choose FitAI Pro?</h3>
            <p className="text-gray-400">Proven results for fitness businesses</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center px-4">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">$15.6B</div>
              <div className="text-gray-400 text-sm sm:text-base">Global fitness app market by 2032</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">40%</div>
              <div className="text-gray-400 text-sm sm:text-base">Reduction in member churn</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">3x</div>
              <div className="text-gray-400 text-sm sm:text-base">Increase in member engagement</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 text-center">
          <div className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 rounded-2xl py-16 px-8 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/30">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Gym?</h3>
            <p className="text-yellow-100 mb-8 text-lg">Join hundreds of fitness businesses using FitAI Pro</p>
            <a href="/register" className="inline-block bg-white text-yellow-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-50 transition shadow-xl">
              Start Your Free Trial
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-32 pt-12 pb-8 border-t border-yellow-600/20">
          <div className="text-center text-gray-500 text-sm space-y-4">
            <p>&copy; 2025 FitAI Pro. All rights reserved.</p>
            <div className="flex justify-center space-x-6">
              <a href="/terms" className="hover:text-yellow-400 transition">Terms of Service</a>
              <a href="/privacy" className="hover:text-yellow-400 transition">Privacy Policy</a>
              <a href="/login" className="hover:text-yellow-400 transition">Sign In</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
