"use client";

import React from 'react';
import { Mail, Clock, MapPin, Phone, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-5xl mt-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">Contact Our Team</h1>
          <p className="text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Whether you are having trouble downloading a file, need help setting up your seller account, or just want to provide feedback, our South African-based support team is ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Get in Touch directly</h2>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">Email Support</h3>
                  <p className="mt-1 text-gray-600">support@sellmynotes.co.za</p>
                  <p className="mt-1 text-sm text-gray-500">Expected response time: Under 24 hours.</p>
                </div>
              </div>



              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">Business Hours</h3>
                  <p className="mt-1 text-gray-600">Monday - Friday: 08:00 - 17:00 (SAST)</p>
                  <p className="mt-1 text-sm text-gray-500">Weekend support is limited to urgent billing issues.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">Headquarters</h3>
                  <p className="mt-1 text-gray-600">Kelvin, Sandton</p>
                  <p className="mt-1 text-gray-600">South Africa, 2090</p>
                  <p className="mt-1 text-sm text-gray-500">Please note: We do not accept walk-ins.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Form UI */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="john@student.ac.za" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white">
                  <option>I need help downloading my purchase</option>
                  <option>I have a question about selling notes</option>
                  <option>Billing or Payment issue</option>
                  <option>Report a copyright violation</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none" placeholder="Please describe your issue in detail..."></textarea>
              </div>

              <button type="button" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
