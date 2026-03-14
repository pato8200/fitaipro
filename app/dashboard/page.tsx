'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gym?: {
    id: string;
    name: string;
  };
  memberProfile?: {
    gymId: string;
  };
}

interface DashboardStats {
  totalMembers?: number;
  activeMembers?: number;
  totalClasses?: number;
  totalRevenue?: number;
  newMembersThisMonth?: number;
  churnRate?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Determine gym ID from user data
    let gymId: string | null = null;
    
    // Check if user has direct gym assignment
    if (parsedUser.gym?.id) {
      gymId = parsedUser.gym.id;
    } 
    // Check if user has memberProfile with gymId
    else if (parsedUser.memberProfile?.gymId) {
      gymId = parsedUser.memberProfile.gymId;
    }
    // For admins/owners who might not have a gym assigned yet
    else if (parsedUser.role === 'ADMIN' || parsedUser.role === 'GYM_OWNER') {
      // Allow navigation but show warning - MUST set loading to false!
      setError(`⚠️ No gym assigned to your account. Some features may not work until you're assigned to a gym.`);
      setLoading(false); // ← CRITICAL: Reset loading so UI shows
      return;
    }
    
    // Fetch stats if we have a gym ID
    if (gymId) {
      fetchDashboardStats(gymId);
    } else {
      setError('User gym information not found. Please make sure you are assigned to a gym.');
      setLoading(false); // ← CRITICAL: Reset loading so UI shows
    }
  }, [router]);

  const fetchDashboardStats = async (gymId: string) => {
    try {
      setLoading(true); // Set loading at start of fetch
      setError(null); // Clear previous errors
      const token = localStorage.getItem('token');
      
      const apiUrl = 'https://fitai-pro-api.onrender.com';
      
      const response = await fetch(`${apiUrl}/api/analytics/gym/${gymId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied - You do not have permission to view this data');
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else {
          throw new Error('Failed to fetch dashboard statistics');
        }
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
        <div className="text-yellow-400 text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-yellow-600/20 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-yellow-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">FitAI Pro</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/dashboard" className="text-yellow-400 font-semibold">Dashboard</a>
              <a href="/members" className="text-gray-300 hover:text-yellow-400 transition font-medium">Members</a>
              <a href="/classes" className="text-gray-300 hover:text-yellow-400 transition font-medium">Classes</a>
              <a href="/analytics" className="text-gray-300 hover:text-yellow-400 transition font-medium">Analytics</a>
              <a href="/ai-trainer" className="text-gray-300 hover:text-yellow-400 transition font-medium">AI Trainer</a>
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
              <div className="text-right">
                <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-gray-950 border-b border-yellow-600/20 z-40 shadow-xl">
          <nav className="flex flex-col p-4 space-y-2">
            <a href="/dashboard" className="text-yellow-400 font-semibold py-2 px-4 rounded-lg bg-gray-900">Dashboard</a>
            <a href="/members" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Members</a>
            <a href="/classes" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Classes</a>
            <a href="/analytics" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Analytics</a>
            <a href="/ai-trainer" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">AI Trainer</a>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 rounded-xl p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-200 font-semibold">Error Loading Data</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
              {user?.gym?.id && (
                <button
                  onClick={() => fetchDashboardStats(user!.gym!.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium ml-4"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-gray-400">Here's what's happening with your fitness business today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 shadow-lg hover:border-yellow-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-green-400 text-sm font-semibold">+12%</div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Total Members</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-700 rounded w-24"></div>
              </div>
            ) : (
              <p className="text-4xl font-bold text-yellow-400">
                {stats.totalMembers || 0}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 shadow-lg hover:border-yellow-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-yellow-500 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-green-400 text-sm font-semibold">+5%</div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Active Members</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-700 rounded w-24"></div>
              </div>
            ) : (
              <p className="text-4xl font-bold text-yellow-400">
                {stats.activeMembers || 0}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 shadow-lg hover:border-yellow-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-blue-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-blue-400 text-sm font-semibold">+2</div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Total Classes</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-700 rounded w-24"></div>
              </div>
            ) : (
              <p className="text-4xl font-bold text-yellow-400">
                {stats.totalClasses || 0}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 shadow-lg hover:border-yellow-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-yellow-500 mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-green-400 text-sm font-semibold">+8%</div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Monthly Revenue</h3>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-700 rounded w-32"></div>
              </div>
            ) : (
              <p className="text-4xl font-bold text-yellow-400">
                ${stats.totalRevenue?.toFixed(0) || '0'}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <a href="/members" className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 group">
            <div className="text-yellow-500 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-2 group-hover:text-yellow-300 transition">
              Manage Members
            </h3>
            <p className="text-gray-400">View and manage all gym members</p>
          </a>

          <a href="/classes" className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 group">
            <div className="text-yellow-500 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-2 group-hover:text-yellow-300 transition">
              Schedule Classes
            </h3>
            <p className="text-gray-400">Create and manage fitness classes</p>
          </a>

          <a href="/analytics" className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 group">
            <div className="text-yellow-500 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-2 group-hover:text-yellow-300 transition">
              Analytics
            </h3>
            <p className="text-gray-400">View detailed business insights</p>
          </a>

          <a href="/ai-trainer" className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 group">
            <div className="text-yellow-500 mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-2 group-hover:text-yellow-300 transition">
              AI Personal Trainer
            </h3>
            <p className="text-gray-400">Generate custom workouts with AI</p>
          </a>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b border-yellow-600/10">
              <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center border border-green-600/30">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">New member joined</p>
                <p className="text-gray-400 text-sm">Member1 Test registered for Basic Membership</p>
              </div>
              <div className="text-gray-500 text-sm">2 hours ago</div>
            </div>

            <div className="flex items-center space-x-4 pb-4 border-b border-yellow-600/10">
              <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-600/30">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Class scheduled</p>
                <p className="text-gray-400 text-sm">Morning HIIT class added to schedule</p>
              </div>
              <div className="text-gray-500 text-sm">5 hours ago</div>
            </div>

            <div className="flex items-center space-x-4 pb-4 border-b border-yellow-600/10">
              <div className="w-12 h-12 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-600/30">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Payment received</p>
                <p className="text-gray-400 text-sm">Monthly subscription payment processed</p>
              </div>
              <div className="text-gray-500 text-sm">1 day ago</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
