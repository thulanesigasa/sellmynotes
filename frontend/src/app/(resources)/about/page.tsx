import React from 'react';

export default function AboutPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">About SellMyNotes</h1>
        <p className="mt-6 text-xl leading-8">
          SellMyNotes was built by students, for students. We recognized a massive gap in the South African education ecosystem: there was no central, secure, and premium platform for top-performing students to share their knowledge and get rewarded for their hard work.
        </p>
        <div className="mt-10 max-w-2xl space-y-6">
          <p>
            Our mission is simple: to democratize academic success by making high-quality study materials accessible to everyone, while empowering creators to earn from their dedication. We vet, we verify, and we ensure that every transaction is secure.
          </p>
          <p>
            Join thousands of students across the country who are already studying smarter and earning on SellMyNotes.
          </p>
        </div>
      </div>
    </div>
  );
}
