import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Brain,
  Mail,
  Calendar,
  FileText,
  Search,
  Settings,
  LogOut,
  User as UserIcon,  // Alias the icon to avoid conflict
  CreditCard,
  Bell,
  Zap
} from 'lucide-react';
import type { User } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setUser(profile);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
              DigiTwin
            </span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg bg-gray-700/50 hover:bg-gray-700">
              <Brain className="w-5 h-5" />
              <span>AI Assistant</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50">
              <Mail className="w-5 h-5" />
              <span>Email</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50">
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50">
              <FileText className="w-5 h-5" />
              <span>Documents</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50">
              <Search className="w-5 h-5" />
              <span>Research</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50">
              <Zap className="w-5 h-5" />
              <span>Automations</span>
            </button>
          </nav>

          <div className="p-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.subscription} Plan</p>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <CreditCard className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Welcome section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">
              Welcome back, {user?.username}!
            </h2>
            <p className="mt-2 text-gray-400">
              Here's what your AI twin has been working on
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Emails Processed', value: '127', icon: Mail },
              { label: 'Meetings Scheduled', value: '8', icon: Calendar },
              { label: 'Documents Analyzed', value: '34', icon: FileText },
              { label: 'Tasks Automated', value: '56', icon: Zap }
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  title: 'Email Summary Generated',
                  description: 'Weekly team updates processed and summarized',
                  time: '2 hours ago'
                },
                {
                  icon: Calendar,
                  title: 'Meeting Scheduled',
                  description: 'Project review with design team',
                  time: '4 hours ago'
                },
                {
                  icon: FileText,
                  title: 'Document Analysis',
                  description: 'Q1 Report analyzed and key insights extracted',
                  time: '6 hours ago'
                }
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <activity.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    <p className="text-sm text-gray-400">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
