import React from 'react';

export default function FAQPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-3xl mt-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Frequently Asked Questions</h1>
        <dl className="mt-10 space-y-8 divide-y divide-gray-100">
          <div className="pt-8">
            <dt className="text-lg font-semibold leading-7 text-gray-900">How do I get paid?</dt>
            <dd className="mt-2 text-base leading-7 text-gray-600">You can request a payout directly to your South African bank account from your Seller Dashboard. We process payments securely via PayFast.</dd>
          </div>
          <div className="pt-8">
            <dt className="text-lg font-semibold leading-7 text-gray-900">Is my payment information safe?</dt>
            <dd className="mt-2 text-base leading-7 text-gray-600">Yes, completely. We use PayFast, one of South Africa's most trusted payment gateways, to handle all transactions. We do not store your credit card details.</dd>
          </div>
          <div className="pt-8">
            <dt className="text-lg font-semibold leading-7 text-gray-900">What format are the notes in?</dt>
            <dd className="mt-2 text-base leading-7 text-gray-600">All study materials are delivered as high-quality PDFs. They are instantly available in your library after purchase.</dd>
          </div>
          <div className="pt-8">
            <dt className="text-lg font-semibold leading-7 text-gray-900">What is the commission rate?</dt>
            <dd className="mt-2 text-base leading-7 text-gray-600">We take a low 7.43% commission on sales. Buyers pay no extra hidden fees.</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
