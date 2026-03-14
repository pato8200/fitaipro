'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, MessageSquare, Send, Sparkles, ChevronRight, Loader2 } from 'lucide-react';

interface User {
  firstName: string;
  email: string;
}

export default function AITrainerPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Call real AI backend
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            page: 'ai-trainer',
            timestamp: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = "I apologize, but I'm having trouble connecting right now. Please try again in a moment. In the meantime, here are some quick tips:\n\n• Stay hydrated during workouts\n• Focus on proper form over heavy weights\n• Rest 60-90 seconds between sets\n• Warm up for 5-10 minutes before training";
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Mobile Back Button */}
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <a
          href="/dashboard"
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white p-4 rounded-full shadow-lg shadow-yellow-500/30 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-semibold">Back</span>
        </a>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-gray-950 border-b border-yellow-600/20 z-40 shadow-xl">
          <nav className="flex flex-col p-4 space-y-2">
            <a href="/dashboard" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Dashboard</a>
            <a href="/members" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Members</a>
            <a href="/classes" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Classes</a>
            <a href="/analytics" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Analytics</a>
            <a href="/ai-trainer" className="text-yellow-400 font-semibold py-2 px-4 rounded-lg bg-gray-900">AI Trainer</a>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <header className="border-b border-yellow-600/20 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-yellow-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">FitAI Pro</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/dashboard" className="text-gray-300 hover:text-yellow-400 transition font-medium">Dashboard</a>
              <a href="/members" className="text-gray-300 hover:text-yellow-400 transition font-medium">Members</a>
              <a href="/classes" className="text-gray-300 hover:text-yellow-400 transition font-medium">Classes</a>
              <a href="/analytics" className="text-gray-300 hover:text-yellow-400 transition font-medium">Analytics</a>
              <a href="/ai-trainer" className="text-yellow-400 font-semibold">AI Trainer</a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-yellow-400 transition"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-white font-medium">{user.firstName}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-gray-700 text-yellow-400 px-4 py-2 rounded-lg transition text-sm font-medium border border-yellow-600/20 hover:border-yellow-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">AI Personal Trainer</h2>
            <p className="text-gray-400">Get personalized workout plans and fitness advice powered by AI</p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300">
              <Sparkles className="w-10 h-10 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Custom Workouts</h3>
              <p className="text-gray-400 text-sm">AI-generated workout plans tailored to your goals and fitness level</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300">
              <MessageSquare className="w-10 h-10 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">24/7 Support</h3>
              <p className="text-gray-400 text-sm">Ask questions anytime and get instant, expert fitness advice</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300">
              <ChevronRight className="w-10 h-10 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Progress Tracking</h3>
              <p className="text-gray-400 text-sm">Monitor your improvements with detailed analytics</p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl overflow-hidden shadow-xl">
            {/* Chat Header */}
            <div className="border-b border-yellow-600/20 px-6 py-4">
              <h3 className="text-xl font-semibold text-yellow-400">Fitness Assistant</h3>
              <p className="text-gray-400 text-sm">Ask me anything about workouts, nutrition, or fitness goals</p>
            </div>

            {/* Chat Messages */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-20">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Start a conversation</p>
                  <p className="text-sm">Ask about workouts, nutrition, or fitness tips</p>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      msg.role === 'user' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-800 text-gray-200 border border-yellow-600/20'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-2xl px-6 py-4 border border-yellow-600/20">
                    <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-yellow-600/20 p-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about workouts, nutrition, or fitness..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !message.trim()}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'Create weight loss workout',
              'Build muscle routine',
              'Nutrition advice',
              'Cardio recommendations'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setMessage(suggestion)}
                className="bg-gray-800 hover:bg-gray-700 border border-yellow-600/20 hover:border-yellow-500/50 text-gray-300 hover:text-yellow-400 px-4 py-3 rounded-lg text-sm transition text-left"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
