import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Brain,
  Mail,
  Calendar,
  FileText,
  Search,
  CreditCard,
  Bell,
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
  
  // New function for Email button click
  const handleEmailClick = async () => {
    // Get username from localStorage
    const username = localStorage.getItem("username");
    if (!username) {
      alert("User not found. Please log in.");
      return;
    }
    // Query Supabase to check if the username exists in user_styles
    const { data, error } = await supabase
      .from("user_styles")
      .select("*")
      .eq("user_id", username);
    if (error) {
      console.error("Error checking user style:", error);
      alert("Something went wrong while checking your writing style.");
      return;
    }
    if (data && data.length > 0) {
      // Found a record; navigate to /emails page
      navigate("/emails");
    } else {
      // No record found; navigate to the analysis page
      navigate("/user-prompting");
    }
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
          <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => navigate('/news-feed')}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg bg-gray-700/50 hover:bg-gray-700">
            <Brain className="w-5 h-5" />
            <span>News Feed</span>
          </button>
            {/* Update the Email button to use handleEmailClick */}
            <button 
              onClick={handleEmailClick}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50">
              <Mail className="w-5 h-5" />
              <span>Email</span>
            </button>
            <button 
            onClick={() => navigate('/calendar')}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50">
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50">
              <FileText className="w-5 h-5" />
              <span>To Do List</span>
            </button>
            <button
              onClick={() => navigate("/research-assistant")}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700/50"
            >
              <Search className="w-5 h-5" />
              <span>Research</span>
            </button>
          </nav>
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">
              Welcome back, {user?.username}!
            </h2>
            <p className="mt-2 text-gray-400">
              Here's what your AI twin has been working on
            </p>
          </div>

          {/* (Other dashboard content, stats, recent activity, etc.) */}
        </main>
      </div>
    </div>
  );
}
