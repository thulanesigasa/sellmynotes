import React from 'react';
import { Download, MonitorPlay, Infinity } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-4xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-6">Shipping & Delivery Policy</h1>
        
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-12">
          <p className="text-lg font-medium text-blue-900">
            <strong>Important Notice:</strong> SellMyNotes is an exclusive marketplace for digital educational goods. We do not sell, store, or ship any physical products.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How Digital Delivery Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                  <MonitorPlay className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Secure Checkout</h3>
                <p className="text-sm text-gray-600">Complete your purchase using our PayFast gateway. Your payment is verified in milliseconds.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                  <Download className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. Instant Access</h3>
                <p className="text-sm text-gray-600">You are immediately redirected. The PDF is instantly unlocked and added to your Dashboard Library.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                  <Infinity className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3. Lifetime Downloads</h3>
                <p className="text-sm text-gray-600">Log in anytime, from any device, to view or re-download your purchased materials forever.</p>
              </div>
            </div>
          </section>

          <section className="pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">File Formats and Requirements</h2>
            <p className="mb-4">
              All documents sold on our platform are strictly delivered in <strong>PDF (.pdf) format</strong>. This ensures that formatting, mathematical equations, diagrams, and text are preserved exactly as the seller intended, regardless of what device you are using.
            </p>
            <p>
              To view your purchased notes, you will need a standard PDF reader (such as Adobe Acrobat Reader, Apple Preview, or a modern web browser like Chrome, Safari, or Edge).
            </p>
          </section>

          <section className="pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting Delivery Issues</h2>
            <p className="mb-4">
              While our system processes 99.9% of transactions instantly, occasionally network issues can delay the unlocking of a document. If you have been charged but do not see the note in your Library:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Wait 5 minutes and refresh your Dashboard Library page.</li>
              <li>Check the email address associated with your account for a purchase confirmation.</li>
              <li>If the file still hasn't appeared, please contact our support team immediately at <strong>support@sellmynotes.co.za</strong> with your PayFast transaction ID, and we will manually unlock the document for you.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
