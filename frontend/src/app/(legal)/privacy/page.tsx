import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-4xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last Updated: July 1, 2026</p>

        <div className="space-y-10 prose prose-blue max-w-none">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              At SellMyNotes ("we," "our," or "us"), your privacy is our priority. We are committed to protecting your personal data and ensuring that your experience on our platform is secure. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>
            <p className="mt-4">
              By accessing or using SellMyNotes, you agree to the terms of this Privacy Policy. If you do not agree with the terms, please do not access the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways, including:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, phone number, and university, that you voluntarily give to us when you register.</li>
              <li><strong>Financial Data:</strong> Data related to your payment method. Note that all purchases are processed by our third-party payment processor, PayFast. We do not store credit card details on our servers. For sellers, we may collect banking details solely for the purpose of transferring your earnings.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, browser type, operating system, and access times.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Create and manage your account.</li>
              <li>Process your purchases, transactions, and seller payouts.</li>
              <li>Email you regarding your account, order confirmations, or password resets.</li>
              <li>Improve platform security and prevent fraudulent transactions.</li>
              <li>Monitor and analyze usage and trends to improve your experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Disclosure of Your Information</h2>
            <p>We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners. We may disclose your information if required by law, such as to comply with a subpoena, or similar legal process in South Africa.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures (including Supabase Auth and Row Level Security) to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Data Rights</h2>
            <p>You have the right to request access to the personal data we hold about you, request corrections to it, or request its deletion. You can manage your profile details directly from your Dashboard. If you wish to completely delete your account and all associated data, please contact our support team.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
