import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-4xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-12">Last Updated: July 1, 2026</p>

        <div className="space-y-10 prose prose-blue max-w-none">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing, registering for, or using the SellMyNotes platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not use our services. These terms apply to all visitors, users, buyers, and sellers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
            <p>
              To buy or sell notes, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You are strictly responsible for safeguarding the password you use to access the service and for any activities under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Seller Obligations & Copyright</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Original Content Only:</strong> You may only upload and sell study materials, notes, or summaries that you have personally created. You explicitly guarantee that you own the copyright to the materials.</li>
              <li><strong>No Plagiarism:</strong> Uploading notes copied from textbooks, professors' slides, or other students without permission is strictly prohibited and constitutes copyright infringement.</li>
              <li><strong>License to SellMyNotes:</strong> By uploading your content, you retain ownership, but you grant SellMyNotes a non-exclusive, worldwide, royalty-free license to host, display, distribute, and facilitate the sale of your content to buyers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Buyer Obligations</h2>
            <p>
              When you purchase a document on SellMyNotes, you are granted a limited, personal, non-exclusive, non-transferable license to download and view the material for your own personal educational use. You may NOT reproduce, distribute, broadcast, or sell the purchased materials to others. Doing so will result in immediate account termination and potential legal action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Fees and Payouts</h2>
            <p>
              SellMyNotes charges a commission of 7.43% on every successful sale. This fee is automatically deducted before earnings are credited to the seller's account. Sellers may request a payout to their South African bank account. Payouts are subject to a minimum withdrawal threshold and standard bank processing times.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
            <p>Users of the platform agree NOT to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Use the platform for any illegal purpose or to violate any local, provincial, or national laws.</li>
              <li>Harass, abuse, or harm another person through reviews or platform communications.</li>
              <li>Attempt to bypass the payment system to conduct transactions off-platform.</li>
              <li>Upload malicious code, viruses, or PDFs containing harmful scripts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
