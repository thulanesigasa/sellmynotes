"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, FileText, RefreshCcw, Truck, ArrowRight } from 'lucide-react';

const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy', icon: Shield },
  { name: 'Terms of Service', href: '/terms', icon: FileText },
  { name: 'Refund Policy', href: '/refund', icon: RefreshCcw },
  { name: 'Shipping & Delivery', href: '/shipping', icon: Truck },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Decorative background element */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">Legal Hub</h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl">
            Everything you need to know about our policies, your rights, and how we protect your data.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {legalLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={`h-5 w-5 ${isActive ? 'text-blue-100' : 'text-gray-400 group-hover:text-blue-500'}`} />
                      {link.name}
                    </div>
                    {isActive && <ArrowRight className="h-4 w-4 opacity-70" />}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
