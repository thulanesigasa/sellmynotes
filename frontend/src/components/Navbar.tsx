"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, Bell, Heart, Bookmark, FileText, BookOpen } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  profiles: {
    first_name: string;
    surname: string;
  };
  notes: {
    title: string;
  };
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id, type, is_read, created_at,
          profiles:actor_id (first_name, surname),
          notes:note_id (title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        // Safe mapping in case profiles or notes were deleted
        const safeData = data.filter(n => n.profiles && n.notes).map(n => ({
          ...n,
          profiles: Array.isArray(n.profiles) ? n.profiles[0] : n.profiles,
          notes: Array.isArray(n.notes) ? n.notes[0] : n.notes,
        })) as Notification[];
        
        setNotifications(safeData);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchNotifications(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchNotifications(session.user.id);
      } else {
        setNotifications([]);
      }
    });

    // Handle clicking outside of notification dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async () => {
    if (!session || notifications.filter(n => !n.is_read).length === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);
    } catch (e) {
      console.error("Failed to mark notifications as read", e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markAsRead();
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="hidden sm:flex sm:space-x-8">
              <Link href="/explore" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname === '/explore' ? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                Explore Feed
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/wishlist" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                  <Bookmark className="h-4 w-4 mr-1.5" />
                  Wishlist
                </Link>
                
                <Link href="/library" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  My Library
                </Link>
                
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={toggleNotifications}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50 relative focus:outline-none"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showNotifications && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No notifications yet.
                          </div>
                        ) : (
                          <ul className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <li key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''}`}>
                                <div className="flex space-x-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {notification.type === 'like' ? (
                                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                                    ) : (
                                      <Bookmark className="h-5 w-5 text-blue-500 fill-blue-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">
                                      <span className="font-semibold">{notification.profiles.first_name} {notification.profiles.surname}</span> 
                                      {notification.type === 'like' ? ' liked your note ' : ' added your note '}
                                      <span className="font-medium text-blue-600">"{notification.notes.title}"</span>
                                      {notification.type === 'wishlist' && ' to their wishlist'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center space-x-2 border-l border-gray-200 pl-4">
                  <Link href="/profile" className="text-sm text-gray-700 font-medium hidden md:block hover:text-blue-600 transition-colors">
                    {session.user.user_metadata?.username || session.user.email}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                    title="Log out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/pricing" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
                  View Pricing
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
