'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Calendar, Plus, Clock, Users, MapPin } from 'lucide-react';

interface User {
  firstName: string;
  email: string;
}

export default function ClassesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState([
    { 
      id: 1, 
      name: 'Morning HIIT', 
      category: 'Cardio', 
      level: 'Intermediate',
      trainer: 'Sarah Johnson',
      time: '06:00 AM',
      duration: '60 min',
      capacity: 20,
      enrolled: 15,
      date: 'Today'
    },
    { 
      id: 2, 
      name: 'Power Yoga', 
      category: 'Flexibility', 
      level: 'All Levels',
      trainer: 'Mike Chen',
      time: '09:00 AM',
      duration: '75 min',
      capacity: 15,
      enrolled: 12,
      date: 'Today'
    },
    { 
      id: 3, 
      name: 'Strength Training', 
      category: 'Strength', 
      level: 'Beginner',
      trainer: 'Emma Wilson',
      time: '05:00 PM',
      duration: '60 min',
      capacity: 12,
      enrolled: 8,
      date: 'Tomorrow'
    },
  ]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Check authentication and load user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleDeleteClass = (id: number) => {
    if (confirm('Are you sure you want to delete this class?')) {
      setClasses(classes.filter(c => c.id !== id));
    }
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
            <a href="/classes" className="text-yellow-400 font-semibold py-2 px-4 rounded-lg bg-gray-900">Classes</a>
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
              <a href="/members" className="text-gray-300 hover:text-yellow-400 transition font-medium">Members</a>
              <a href="/classes" className="text-yellow-400 font-semibold">Classes</a>
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
              <h2 className="text-3xl font-bold text-white mb-2">Class Schedule</h2>
              <p className="text-gray-400">Manage and schedule fitness classes</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-lg shadow-yellow-500/30"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Class</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-xl p-6">
              <Calendar className="w-8 h-8 text-yellow-500 mb-4" />
              <p className="text-gray-400 text-sm mb-2">Total Classes</p>
              <p className="text-3xl font-bold text-yellow-400">3</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-green-600/20 rounded-xl p-6">
              <Users className="w-8 h-8 text-green-500 mb-4" />
              <p className="text-gray-400 text-sm mb-2">Enrolled</p>
              <p className="text-3xl font-bold text-green-400">35</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-600/20 rounded-xl p-6">
              <Clock className="w-8 h-8 text-blue-500 mb-4" />
              <p className="text-gray-400 text-sm mb-2">Today</p>
              <p className="text-3xl font-bold text-blue-400">2</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-600/20 rounded-xl p-6">
              <MapPin className="w-8 h-8 text-purple-500 mb-4" />
              <p className="text-gray-400 text-sm mb-2">Available Spots</p>
              <p className="text-3xl font-bold text-purple-400">12</p>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div key={classItem.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 group">
                {/* Class Header */}
                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 px-6 py-4 border-b border-yellow-600/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">{classItem.category}</span>
                    <span className="text-xs text-gray-400">{classItem.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition">{classItem.name}</h3>
                </div>

                {/* Class Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span>{classItem.time} • {classItem.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <Users className="w-4 h-4 text-yellow-500" />
                    <span>{classItem.trainer}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 text-yellow-500" />
                    <span>Level: {classItem.level}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Enrolled</span>
                      <span className="text-yellow-400 font-semibold">{classItem.enrolled}/{classItem.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-yellow-500/20">
                      Edit Class
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classItem.id)}
                      className="px-4 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-semibold transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-600/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-yellow-400">Create New Class</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Class Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="e.g., Morning HIIT"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Category</label>
                    <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                      <option value="Cardio">Cardio</option>
                      <option value="Strength">Strength</option>
                      <option value="Flexibility">Flexibility</option>
                      <option value="Yoga">Yoga</option>
                      <option value="HIIT">HIIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Level</label>
                    <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Trainer</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="e.g., Sarah Johnson"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Duration (min)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="60"
                      defaultValue="60"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Capacity</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="20"
                      defaultValue="20"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg font-semibold transition border border-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white py-3 rounded-lg font-semibold transition shadow-lg shadow-yellow-500/30"
                  >
                    Create Class
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
