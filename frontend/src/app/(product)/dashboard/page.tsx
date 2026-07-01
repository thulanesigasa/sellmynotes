import React from 'react';
import Link from 'next/link';

export default function DashboardInfoPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col justify-center pt-16 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="mx-auto max-w-3xl text-center">
          
          {/* Top Badge */}
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2"></span>
            Next-Gen Seller Dashboard
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Manage your Notes with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Smart Valuation
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg leading-8 text-gray-500 max-w-2xl mx-auto font-medium">
            Upload your study materials, automatically price them using our advanced pricing algorithm, track your earnings, and request payouts instantly.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
            >
              Go to Dashboard &rarr;
            </Link>
            <Link 
              href="/pricing" 
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
        
        {/* Feature Cards Grid */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1 */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
              <div className="absolute -right-4 -bottom-4 text-9xl font-black text-gray-50 opacity-50 select-none z-0 transition-transform duration-300 group-hover:-translate-y-4 group-hover:-translate-x-4">
                01
              </div>
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">
                  01 / Smart Valuation
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Smart Price Estimation
                </h3>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                  <div className="overflow-hidden">
                    <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                      Automatically estimate the market value of your notes based on length, complexity, and subject area using our advanced pricing algorithm.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
              <div className="absolute -right-4 -bottom-4 text-9xl font-black text-gray-50 opacity-50 select-none z-0 transition-transform duration-300 group-hover:-translate-y-4 group-hover:-translate-x-4">
                02
              </div>
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">
                  02 / Analytics
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Real-Time Sales Tracking
                </h3>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                  <div className="overflow-hidden">
                    <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                      Track your earnings and view purchase history in real-time. Gain insights into which study materials are performing best.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
              <div className="absolute -right-4 -bottom-4 text-9xl font-black text-gray-50 opacity-50 select-none z-0 transition-transform duration-300 group-hover:-translate-y-4 group-hover:-translate-x-4">
                03
              </div>
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">
                  03 / Payouts
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Instant Bank Transfers
                </h3>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                  <div className="overflow-hidden">
                    <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                      Withdraw your funds seamlessly. Request payouts directly to your South African bank account with transparent commission structures.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
