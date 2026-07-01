import React from 'react';

export default function RefundPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Refund Policy</h1>
        <p className="mt-6 text-lg leading-8">
          Due to the digital nature of the products sold on SellMyNotes, all sales are generally considered final. Once a PDF is downloaded, we cannot revoke access, making standard refunds difficult.
        </p>
        <h2 className="mt-10 text-2xl font-bold text-gray-900">Exceptions for Refunds</h2>
        <p className="mt-4">
          We do, however, offer refunds on a case-by-case basis if:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-5">
          <li>The material delivered is significantly different from its description.</li>
          <li>The downloaded file is corrupted or unreadable.</li>
          <li>The material contains malicious or severely inappropriate content.</li>
        </ul>
        <p className="mt-6 font-medium text-gray-900">
          To request a refund, you must contact support within 7 days of purchase.
        </p>
      </div>
    </div>
  );
}
