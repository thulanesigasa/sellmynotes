import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Terms of Service</h1>
        <p className="mt-6 text-lg leading-8">
          By accessing or using the SellMyNotes website, you agree to be bound by these terms of service and all applicable laws and regulations.
        </p>
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">1. Account Responsibilities</h2>
            <p className="mt-3">You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">2. Content Ownership & Copyright</h2>
            <p className="mt-3">Sellers retain all copyright and ownership rights to their uploaded notes. By uploading, you grant SellMyNotes a license to distribute the content to buyers. You must not upload copyrighted material that does not belong to you.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">3. Conduct</h2>
            <p className="mt-3">Users agree not to exploit the platform, distribute malware, or engage in any fraudulent activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
