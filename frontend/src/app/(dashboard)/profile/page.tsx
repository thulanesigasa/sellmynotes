"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { User, Mail, Phone, GraduationCap, BookOpen, Save } from 'lucide-react';

interface ProfileData {
  full_name: string;
  surname: string;
  phone_number: string;
  university: string;
  current_study: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    surname: '',
    phone_number: '',
    university: '',
    current_study: ''
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      setEmail(session.user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          surname: data.surname || '',
          phone_number: data.phone_number || '',
          university: data.university || '',
          current_study: data.current_study || ''
        });
      }
    } catch (error: any) {
      toast.error('Failed to load profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Dynamic phone parsing for South Africa (+27)
    if (name === 'phone_number') {
      let phoneVal = value;
      if (phoneVal.startsWith('0')) {
        phoneVal = '+27' + phoneVal.substring(1);
      }
      setProfile(prev => ({ ...prev, [name]: phoneVal }));
      return;
    }

    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    toast.loading('Saving profile...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          surname: profile.surname,
          phone_number: profile.phone_number,
          university: profile.university,
          current_study: profile.current_study
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast.dismiss();
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Failed to update profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />
      
      <div className="mb-10 flex items-center space-x-4">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information and settings.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <form onSubmit={handleSave} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Account Details section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-2">
                <User className="h-5 w-5 mr-2 text-gray-400" />
                Personal Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name (Full Name)</label>
                <input 
                  name="full_name" 
                  type="text" 
                  required 
                  value={profile.full_name} 
                  onChange={handleChange} 
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                <input 
                  name="surname" 
                  type="text" 
                  required 
                  value={profile.surname} 
                  onChange={handleChange} 
                  className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    disabled 
                    value={email} 
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed" 
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    name="phone_number" 
                    type="tel" 
                    required 
                    value={profile.phone_number} 
                    onChange={handleChange} 
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* Educational Details section */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-2">
                <GraduationCap className="h-5 w-5 mr-2 text-gray-400" />
                Educational Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University / Institution</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    name="university" 
                    type="text" 
                    required 
                    value={profile.university} 
                    onChange={handleChange} 
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Study (Grade or Degree)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    name="current_study" 
                    type="text" 
                    required 
                    value={profile.current_study} 
                    onChange={handleChange} 
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
