import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      name: 'High-Quality Notes',
      description: 'Access top-tier study materials crafted by top students across South African institutions.',
      icon: BookOpen,
    },
    {
      name: 'Secure Transactions',
      description: 'Every purchase is securely processed through PayFast, giving you peace of mind.',
      icon: ShieldCheck,
    },
    {
      name: 'Instant Delivery',
      description: 'Download your watermarked PDFs immediately after a successful checkout.',
      icon: Zap,
    },
    {
      name: 'Social Feed',
      description: 'Like, save, and wishlist your favorite notes to come back to them later.',
      icon: Heart,
    },
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Study Smarter</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to excel in your studies
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            SellMyNotes provides a premium platform for students to share knowledge and earn from their hard work.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center">
                    <feature.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/explore" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Explore the Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
