import React from 'react';

export default function ShippingPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Shipping & Delivery</h1>
        <p className="mt-6 text-lg leading-8">
          Because SellMyNotes is a purely digital marketplace for study materials, we do not ship any physical goods.
        </p>
        <h2 className="mt-10 text-2xl font-bold text-gray-900">Instant Digital Delivery</h2>
        <p className="mt-4">
          Once your payment has been successfully processed via our secure payment gateway, your purchased study materials will be instantly added to your digital Library. 
        </p>
        <p className="mt-4">
          You can access and download your PDFs at any time, from any device, by logging into your account and navigating to the Dashboard Library.
        </p>
      </div>
    </div>
  );
}
