"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';
import { Check, X } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    surname: '',
    phone: '',
    institution: '',
    currentStudy: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Dynamic phone parsing for South Africa (+27)
    if (name === 'phone') {
      let phoneVal = value;
      if (phoneVal.startsWith('0')) {
        phoneVal = '+27' + phoneVal.substring(1);
      }
      setFormData(prev => ({ ...prev, [name]: phoneVal }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Password validation checks
  const isLengthValid = formData.password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(formData.password);
  
  const isPasswordValid = isLengthValid && hasLetter && hasNumber && hasSpecial;

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password) {
        toast.error("Please enter both email and password.");
        return;
      }
      if (!isPasswordValid) {
        toast.error("Please ensure your password meets all requirements.");
        return;
      }
    } else if (step === 2) {
      if (!formData.firstName || !formData.surname || !formData.phone) {
        toast.error("Please fill in all personal details.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;

    if (!formData.institution || !formData.currentStudy) {
      toast.error("Please fill in all educational details.");
      return;
    }

    setLoading(true);
    toast.loading("Creating your account...");

    try {
      // 1. Check if username exists (we use a generated one or first name + random)
      const username = `${formData.firstName.toLowerCase()}${Math.floor(Math.random() * 10000)}`;

      // 2. Sign up via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            surname: formData.surname,
            phone_number: formData.phone,
            institution: formData.institution,
            current_study: formData.currentStudy,
            username: username
          }
        }
      });

      if (error) {
        throw error;
      }

      toast.dismiss();
      toast.success("Account created successfully! Please check your email to verify.");
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }: { isValid: boolean, text: string }) => (
    <div className={`flex items-center text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
      {isValid ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
      {text}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" richColors />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join the premium marketplace for South African students
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className={`text-xs font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Account</div>
              <div className={`text-xs font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Personal</div>
              <div className={`text-xs font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Education</div>
            </div>
            <div className="mt-2 flex gap-2">
              <div className={`h-2 w-full rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`h-2 w-full rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`h-2 w-full rounded ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
          </div>

          <form onSubmit={step === 3 ? handleSignup : (e) => e.preventDefault()} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1">
                    <input name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1">
                    <input name="password" type="password" required value={formData.password} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                </div>

                {/* Password Strength Meter */}
                {formData.password.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                    <ValidationItem isValid={isLengthValid} text="At least 8 characters" />
                    <ValidationItem isValid={hasLetter} text="Contains at least one letter" />
                    <ValidationItem isValid={hasNumber} text="Contains at least one number" />
                    <ValidationItem isValid={hasSpecial} text="Contains a special character" />
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <div className="mt-1">
                    <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Surname</label>
                  <div className="mt-1">
                    <input name="surname" type="text" required value={formData.surname} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number (South Africa)</label>
                  <div className="mt-1">
                    <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="+27..." className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Institution (High School or University)</label>
                  <div className="mt-1">
                    <input name="institution" type="text" required value={formData.institution} onChange={handleChange} placeholder="e.g. Pretoria High School" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Study (Grade or Degree)</label>
                  <div className="mt-1">
                    <input name="currentStudy" type="text" required value={formData.currentStudy} onChange={handleChange} placeholder="e.g. Grade 11 or BSc Computer Science" className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Complete Sign up
                </button>
              )}
            </div>
          </form>
          
          {step === 1 && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
