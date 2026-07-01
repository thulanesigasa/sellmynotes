import React from 'react';
import { Mail, Clock, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-3xl mt-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Contact Us</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 border-b border-gray-100 pb-8">
          Have a question, concern, or just want to say hi? We'd love to hear from you.
        </p>
        <div className="mt-8 space-y-6">
          <div className="flex items-center text-gray-700">
            <Mail className="h-6 w-6 text-blue-600 mr-4" />
            <span className="text-lg">support@sellmynotes.co.za</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Clock className="h-6 w-6 text-blue-600 mr-4" />
            <span className="text-lg">Monday - Friday, 9:00 AM - 5:00 PM (SAST)</span>
          </div>
          <div className="flex items-center text-gray-700">
            <MapPin className="h-6 w-6 text-blue-600 mr-4" />
            <span className="text-lg">Johannesburg, South Africa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
