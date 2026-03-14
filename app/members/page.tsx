'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Users, Plus, Search, MoreVertical, Mail, Phone } from 'lucide-react';

interface User {
  firstName: string;
  email: string;
}

export default function MembersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    proTier: 0,
    basicTier: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
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
    
    // Fetch members from backend
    fetchMembers(token, parsedUser);
  }, [router]);

  const fetchMembers = async (token: string, userData: any) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Get gym ID from user data
      let gymId = userData.gym?.id || userData.memberProfile?.gymId;
      
      if (!gymId && (userData.role === 'ADMIN' || userData.role === 'GYM_OWNER')) {
        // For admin/owner without gym, show empty state
        setMembers([]);
        setStats({ total: 0, active: 0, proTier: 0, basicTier: 0 });
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/members?gymId=${gymId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data);
        
        // Calculate stats
        setStats({
          total: data.length,
          active: data.filter((m: any) => m.status === 'ACTIVE').length,
          proTier: data.filter((m: any) => m.membershipTier === 'PRO').length,
          basicTier: data.filter((m: any) => m.membershipTier === 'BASIC').length,
        });
      } else {
        console.error('Failed to fetch members');
        setMembers([]);
        setStats({ total: 0, active: 0, proTier: 0, basicTier: 0 });
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
      setStats({ total: 0, active: 0, proTier: 0, basicTier: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteMember = (id: number) => {
    if (confirm('Are you sure you want to delete this member?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setShowAddModal(true);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-yellow-400 text-xl font-semibold">Loading...</div>
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
            <a href="/members" className="text-yellow-400 font-semibold py-2 px-4 rounded-lg bg-gray-900">Members</a>
            <a href="/classes" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Classes</a>
            <a href="/analytics" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">Analytics</a>
            <a href="/ai-trainer" className="text-gray-300 hover:text-yellow-400 transition font-medium py-2 px-4 rounded-lg hover:bg-gray-900">AI Trainer</a>
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
              <a href="/members" className="text-yellow-400 font-semibold">Members</a>
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Members Management</h2>
              <p className="text-gray-400">Manage your gym members and their memberships</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg shadow-yellow-500/30"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-xl p-6">
              <Users className="w-8 h-8 text-yellow-500 mb-4" />
              <p className="text-gray-400 text-sm mb-2">Total Members</p>
              <p className="text-3xl font-bold text-yellow-400">{loading ? '-' : stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-green-600/20 rounded-xl p-6">
              <Users className="w-8 h-8 text-green-500 mb-4" />
              <p className="text-gray-400 text-sm mb-2">Active</p>
              <p className="text-3xl font-bold text-green-400">{loading ? '-' : stats.active}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-600/20 rounded-xl p-6">
              <Users className="w-8 h-8 text-blue-500 mb-4" />
              <p className="text-gray-400 text-sm mb-2">PRO Tier</p>
              <p className="text-3xl font-bold text-blue-400">{loading ? '-' : stats.proTier}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-600/20 rounded-xl p-6">
              <Users className="w-8 h-8 text-purple-500 mb-4" />
              <p className="text-gray-400 text-sm mb-2">Basic Tier</p>
              <p className="text-3xl font-bold text-purple-400">{loading ? '-' : stats.basicTier}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search members by name or email..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-yellow-600/20">
                  <tr>
                    <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm">Member</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm hidden sm:table-cell">Tier</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm hidden md:table-cell">Status</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-4 text-sm hidden lg:table-cell">Joined</th>
                    <th className="text-right text-gray-400 font-medium px-6 py-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-600/10">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Loading members...
                        </div>
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No members found. Add your first member to get started!
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-800/30 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{member.user?.firstName || 'N/A'} {member.user?.lastName || ''}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-gray-400 text-sm flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {member.user?.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.membershipTier === 'PRO' 
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-600/20' 
                              : 'bg-purple-900/30 text-purple-400 border border-purple-600/20'
                          }`}>
                            {member.membershipTier || 'BASIC'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.status === 'ACTIVE' 
                              ? 'bg-green-900/30 text-green-400 border border-green-600/20' 
                              : 'bg-red-900/30 text-red-400 border border-red-600/20'
                          }`}>
                            {member.status || 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-gray-400 text-sm">
                            {member.startDate ? new Date(member.startDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="text-blue-400 hover:text-blue-300 transition"
                              title="Edit member"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-400 hover:text-red-300 transition"
                              title="Delete member"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-yellow-400">
                  {selectedMember ? 'Edit Member' : 'Add New Member'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedMember(null);
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={selectedMember?.name || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={selectedMember?.email || ''}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Membership Tier</label>
                    <select
                      defaultValue={selectedMember?.tier || 'BASIC'}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="BASIC">Basic</option>
                      <option value="PRO">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Status</label>
                    <select
                      defaultValue={selectedMember?.status || 'ACTIVE'}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold transition border border-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-yellow-500/30"
                  >
                    {selectedMember ? 'Save Changes' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
