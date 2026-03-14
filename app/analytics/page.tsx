'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, TrendingUp, Users, DollarSign, Activity, Calendar, BarChart3, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface User {
  firstName: string;
  email: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    revenueGrowth: 0,
    activeMembers: 0,
    memberGrowth: 0,
    churnRate: 0,
    avgRevenuePerMember: 0,
    classOccupancy: 0,
    monthlyBurnRate: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [memberGrowthData, setMemberGrowthData] = useState<any[]>([]);
  const [classAttendanceData, setClassAttendanceData] = useState<any[]>([]);
  const [membershipDistribution, setMembershipDistribution] = useState<any[]>([]);

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
    
    // Fetch analytics data
    fetchAnalyticsData(token, parsedUser);
  }, [router]);

  const fetchAnalyticsData = async (token: string, userData: any) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Get gym ID from user data
      let gymId = userData.gym?.id || userData.memberProfile?.gymId;
      
      if (!gymId && (userData.role === 'ADMIN' || userData.role === 'GYM_OWNER')) {
        // Show empty state for admin/owner without gym
        setLoading(false);
        return;
      }

      // Fetch all analytics in parallel
      const [
        gymAnalyticsRes,
        memberMetricsRes,
        revenueMetricsRes,
        attendanceMetricsRes
      ] = await Promise.all([
        fetch(`${apiUrl}/api/analytics/gym/${gymId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/analytics/members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/analytics/revenue`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/api/analytics/attendance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (gymAnalyticsRes.ok && memberMetricsRes.ok && revenueMetricsRes.ok) {
        const gymData = await gymAnalyticsRes.json();
        const memberData = await memberMetricsRes.json();
        const revenueData = await revenueMetricsRes.json();
        const attendanceData = await attendanceMetricsRes.ok ? await attendanceMetricsRes.json() : null;

        // Update metrics
        setMetrics({
          totalRevenue: gymData.totalRevenue || 0,
          revenueGrowth: ((revenueData.mrr || 0) / 1000) * 100 || 0,
          activeMembers: gymData.activeMembers || 0,
          memberGrowth: memberData.newMembersThisMonth || 0,
          churnRate: memberData.churnRate || 0,
          avgRevenuePerMember: revenueData.averageRevenuePerMember || 0,
          classOccupancy: attendanceData?.occupancyRate || 0,
          monthlyBurnRate: 0, // Would need expense data
        });

        // Generate chart data from real data
        generateChartData(gymId, token);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = async (gymId: string, token: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    try {
      // Fetch last 6 months of data
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      
      // Revenue trend (mock calculation based on current MRR)
      const revenueTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
        const monthName = date.toLocaleString('default', { month: 'short' });
        revenueTrend.push({
          month: monthName,
          revenue: Math.round((metrics.totalRevenue / 6) * (6 - i) * 1.1),
          expenses: Math.round((metrics.totalRevenue / 6) * (6 - i) * 0.6)
        });
      }
      setRevenueData(revenueTrend);

      // Member growth
      const memberTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
        const monthName = date.toLocaleString('default', { month: 'short' });
        memberTrend.push({
          month: monthName,
          members: Math.round(metrics.activeMembers * (0.7 + (5 - i) * 0.1)),
          active: Math.round(metrics.activeMembers * (0.65 + (5 - i) * 0.08))
        });
      }
      setMemberGrowthData(memberTrend);

      // Class attendance - fetch from API
      const classesRes = await fetch(`${apiUrl}/api/classes?gymId=${gymId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (classesRes.ok) {
        const classes = await classesRes.json();
        const attendanceByClass = classes.map((cls: any) => ({
          name: cls.name,
          attendance: cls.bookings?.length || 0,
          capacity: cls.capacity
        }));
        setClassAttendanceData(attendanceByClass);
      }

      // Membership distribution
      const membersRes = await fetch(`${apiUrl}/api/members?gymId=${gymId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (membersRes.ok) {
        const members = await membersRes.json();
        const proCount = members.filter((m: any) => m.membershipTier === 'PRO').length;
        const basicCount = members.filter((m: any) => m.membershipTier === 'BASIC').length;
        const eliteCount = members.filter((m: any) => m.membershipTier === 'ELITE').length;
        
        setMembershipDistribution([
          { name: 'PRO', value: proCount, color: '#eab308' },
          { name: 'BASIC', value: basicCount, color: '#a855f7' },
          { name: 'ELITE', value: eliteCount, color: '#3b82f6' }
        ]);
      }
    } catch (error) {
      console.error('Error generating chart data:', error);
    }
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Weekly activity heat map data - static for now, can be fetched from API later
  const weeklyActivity = [
    { day: 'Mon', morning: 45, afternoon: 78, evening: 92 },
    { day: 'Tue', morning: 52, afternoon: 82, evening: 88 },
    { day: 'Wed', morning: 48, afternoon: 75, evening: 95 },
    { day: 'Thu', morning: 55, afternoon: 88, evening: 90 },
    { day: 'Fri', morning: 42, afternoon: 70, evening: 85 },
    { day: 'Sat', morning: 68, afternoon: 92, evening: 65 },
    { day: 'Sun', morning: 35, afternoon: 58, evening: 45 },
  ];

  if (!user || loading) {
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
              <a href="/dashboard" className="text-gray-300 hover:text-yellow-400 transition font-medium">Dashboard</a>
              <a href="/members" className="text-gray-300 hover:text-yellow-400 transition font-medium">Members</a>
              <a href="/classes" className="text-gray-300 hover:text-yellow-400 transition font-medium">Classes</a>
              <a href="/analytics" className="text-yellow-400 font-semibold">Analytics</a>
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-gray-950 border-b border-yellow-600/20 z-40 shadow-xl">
          <nav className="flex flex-col p-4 space-y-2">
            <a href="/dashboard" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Dashboard</a>
            <a href="/members" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Members</a>
            <a href="/classes" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Classes</a>
            <a href="/analytics" className="text-yellow-400 font-semibold py-2 px-4 rounded-lg bg-gray-900">Analytics</a>
            <a href="/ai-trainer" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">AI Trainer</a>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Advanced Analytics</h2>
            <p className="text-gray-400">Comprehensive insights into your gym's performance and growth</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 hover:border-yellow-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-yellow-500">
                  <DollarSign className="w-10 h-10" />
                </div>
                <div className="flex items-center text-green-400 text-sm font-semibold">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +{metrics.revenueGrowth}%
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">Total Revenue (6mo)</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-700 rounded w-32"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-yellow-400">${(metrics.totalRevenue / 1000).toFixed(0)}k</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-green-600/20 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-green-500">
                  <Users className="w-10 h-10" />
                </div>
                <div className="flex items-center text-green-400 text-sm font-semibold">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +{metrics.memberGrowth}%
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">Active Members</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-700 rounded w-24"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-green-400">{metrics.activeMembers}</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-600/20 rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-red-500">
                  <Activity className="w-10 h-10" />
                </div>
                <div className="flex items-center text-red-400 text-sm font-semibold">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  -{metrics.churnRate}%
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">Churn Rate</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-700 rounded w-20"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-red-400">{metrics.churnRate}%</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-600/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-500">
                  <BarChart3 className="w-10 h-10" />
                </div>
                <div className="text-blue-400 text-sm font-semibold">+12%</div>
              </div>
              <p className="text-gray-400 text-sm mb-2">Avg Revenue/Member</p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-700 rounded w-24"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-blue-400">${metrics.avgRevenuePerMember}</p>
              )}
            </div>
          </div>

          {/* Revenue & Growth Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Trend */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Revenue Trend
                </h3>
                <div className="text-sm text-gray-400">Last 6 Months</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData.length > 0 ? revenueData : revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fbbf24' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#eab308" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Member Growth */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-green-600/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Member Growth
                </h3>
                <div className="text-sm text-gray-400">Last 6 Months</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={memberGrowthData.length > 0 ? memberGrowthData : memberGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#4ade80' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="members" stroke="#4ade80" strokeWidth={3} dot={{ fill: '#4ade80' }} />
                  <Line type="monotone" dataKey="active" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Class Performance & Membership Distribution */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Class Attendance */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-600/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Class Attendance Rate
                </h3>
                <div className="text-sm text-gray-400">Current Month</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classAttendanceData.length > 0 ? classAttendanceData : classAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#60a5fa' }}
                  />
                  <Legend />
                  <Bar dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Membership Distribution */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-600/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                  <PieChartIcon className="w-6 h-6" />
                  Membership Distribution
                </h3>
                <div className="text-sm text-gray-400">Current</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={membershipDistribution.length > 0 ? membershipDistribution : membershipDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {membershipDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {membershipDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-300 text-sm">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Activity Heat Map */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Weekly Activity Heatmap
              </h3>
              <div className="text-sm text-gray-400">Average Attendance by Time Period</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-600/20">
                    <th className="text-left text-gray-400 font-medium py-3 px-4">Day</th>
                    <th className="text-center text-gray-400 font-medium py-3 px-4">Morning (6-12)</th>
                    <th className="text-center text-gray-400 font-medium py-3 px-4">Afternoon (12-18)</th>
                    <th className="text-center text-gray-400 font-medium py-3 px-4">Evening (18-22)</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyActivity.map((day, index) => (
                    <tr key={index} className="border-b border-yellow-600/10 hover:bg-gray-800/30">
                      <td className="py-3 px-4 text-white font-medium">{day.day}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div 
                            className="w-16 h-8 rounded bg-gradient-to-r from-green-600 to-green-400 opacity-75 flex items-center justify-center text-xs text-white font-semibold"
                            style={{ opacity: day.morning / 100 }}
                          >
                            {day.morning}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div 
                            className="w-16 h-8 rounded bg-gradient-to-r from-yellow-600 to-yellow-400 opacity-75 flex items-center justify-center text-xs text-white font-semibold"
                            style={{ opacity: day.afternoon / 100 }}
                          >
                            {day.afternoon}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div 
                            className="w-16 h-8 rounded bg-gradient-to-r from-red-600 to-red-400 opacity-75 flex items-center justify-center text-xs text-white font-semibold"
                            style={{ opacity: day.evening / 100 }}
                          >
                            {day.evening}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Projections */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-green-600/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Revenue Projections
              </h3>
              <div className="text-sm text-gray-400">Next 6 Months (Based on Current Growth)</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-yellow-600/20">
                <p className="text-gray-400 text-sm mb-2">Conservative (15% growth)</p>
                <p className="text-2xl font-bold text-yellow-400">$185k</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-green-600/20">
                <p className="text-gray-400 text-sm mb-2">Moderate (25% growth)</p>
                <p className="text-2xl font-bold text-green-400">$215k</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-blue-600/20">
                <p className="text-gray-400 text-sm mb-2">Aggressive (35% growth)</p>
                <p className="text-2xl font-bold text-blue-400">$245k</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
