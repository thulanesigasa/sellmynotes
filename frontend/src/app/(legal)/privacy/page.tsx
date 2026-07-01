import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Privacy Policy</h1>
        <p className="mt-6 text-lg leading-8">
          Your privacy is critically important to us. At SellMyNotes, we have a few fundamental principles:
        </p>
        <ul className="mt-8 space-y-4 list-disc pl-5">
          <li>We don't ask you for personal information unless we truly need it for billing and account management.</li>
          <li>We don't share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
          <li>We don't store personal information on our servers unless required for the on-going operation of one of our services.</li>
          <li>Your payment data is securely handled by PayFast and never stored on our database.</li>
        </ul>
      </div>
    </div>
  );
}
