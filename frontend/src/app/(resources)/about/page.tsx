import React from 'react';

export default function AboutPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-4xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-8">About sellmynotes</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-lg leading-8 text-gray-600 mb-4">
              sellmynotes was born out of a simple observation in university libraries across South Africa: top-performing students spend hundreds of hours crafting incredible, comprehensive study notes, only for them to sit on a hard drive once the semester ends. Meanwhile, thousands of other students struggle to find localized, high-quality study materials tailored to their specific courses.
            </p>
            <p className="text-lg leading-8 text-gray-600">
              We realized there was a massive gap in the South African education ecosystem. There was no central, secure, and premium platform for these students to share their knowledge and get rewarded for their hard work. In 2026, we launched sellmynotes to change that.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg leading-8 text-gray-600">
              Our mission is to democratize academic success by making top-tier study materials accessible to everyone, while empowering creators to earn a meaningful income from their dedication. We believe that hard work should be rewarded, and that knowledge should be shared.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Quality First</h3>
                <p className="text-sm text-gray-600">We prioritize high-quality, accurate, and comprehensive study materials. Our community rating system ensures the best notes rise to the top.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Security & Trust</h3>
                <p className="text-sm text-gray-600">From processing payments via PayFast to securely hosting files and protecting intellectual property, trust is the foundation of our platform.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Student Empowerment</h3>
                <p className="text-sm text-gray-600">We exist to help students succeed—whether that means passing a tough module or paying off textbook fees by selling notes.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Are Different</h2>
            <p className="text-lg leading-8 text-gray-600 mb-4">
              Unlike generic international document-sharing sites, sellmynotes is built specifically for the South African academic context. We integrate locally trusted payment gateways, allow students to categorize by South African institutions, and take an industry-low commission fee (just 7.43%) so sellers keep more of what they earn.
            </p>
          </section>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the Movement</h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Whether you're looking to ace your next exam or turn your distinction-level notes into cash, you belong here.
            </p>
            <a href="/signup" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors">
              Start Your Journey Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
