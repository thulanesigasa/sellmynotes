import React from 'react';

export default function FAQPage() {
  const faqs = [
    {
      category: "General Questions",
      items: [
        { q: "What is SellMyNotes?", a: "SellMyNotes is a premium digital marketplace specifically designed for South African students to buy and sell high-quality, university-specific study materials, summaries, and past paper solutions." },
        { q: "Who can use the platform?", a: "Anyone can purchase notes! However, to sell notes, you must be a registered user with a valid South African bank account (to receive payouts via PayFast)." },
        { q: "Are the notes verified?", a: "While we do not manually read every document uploaded, our platform relies on a community review and rating system. Buyers leave reviews, ensuring that high-quality notes rank higher in search results." }
      ]
    },
    {
      category: "Buying Notes",
      items: [
        { q: "How do I purchase a document?", a: "Simply browse the Explore feed, click on a note you want, add it to your cart (or click Buy Now), and checkout securely using PayFast. You can pay via Credit Card, Instant EFT, or SnapScan." },
        { q: "What format will the notes be in?", a: "All study materials are strictly delivered in PDF format to ensure compatibility across all devices and to protect the formatting of the original author." },
        { q: "How long do I have access to my purchased notes?", a: "Forever! Once purchased, the notes are permanently added to the Library in your Dashboard. You can download them as many times as you like." },
        { q: "Can I preview notes before buying?", a: "Currently, you can view the title, description, course code, and institution. We are working on a feature that will allow sellers to upload a 1-page preview of their documents." }
      ]
    },
    {
      category: "Selling Notes",
      items: [
        { q: "How do I become a seller?", a: "Create a free account, navigate to your Dashboard, and click 'Upload'. Fill in the details about your notes (course code, description, price), upload the PDF, and publish!" },
        { q: "What is the commission rate?", a: "We charge an industry-low commission of just 7.43% per sale. This covers our platform maintenance and payment processing fees. You keep the rest." },
        { q: "How and when do I get paid?", a: "Earnings accumulate in your seller account. You can request a payout from your Dashboard at any time. Payouts are processed via EFT directly to your linked South African bank account within 2-3 business days." },
        { q: "Who sets the price?", a: "You do! You have complete control over the pricing of your notes. Our Smart Valuation engine can also suggest a competitive price based on document length and complexity if you are unsure." }
      ]
    },
    {
      category: "Technical & Support",
      items: [
        { q: "I purchased a note but can't download it.", a: "First, check your Dashboard Library. If the payment was successful, it will appear there. If you still have issues, please contact our support team with your order reference number." },
        { q: "Is my payment data secure?", a: "Absolutely. All payments are processed through PayFast, South Africa's leading secure payment gateway. We do not store your credit card or banking login details on our servers." }
      ]
    }
  ];

  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-4xl mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-6">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 mb-12">Find answers to the most common questions about buying, selling, and managing your account on SellMyNotes.</p>
        
        <div className="space-y-16">
          {faqs.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-blue-600 mb-6 pb-2 border-b border-gray-100">{section.category}</h2>
              <dl className="space-y-8">
                {section.items.map((faq, fIdx) => (
                  <div key={fIdx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <dt className="text-lg font-bold leading-7 text-gray-900 mb-2">{faq.q}</dt>
                    <dd className="text-base leading-7 text-gray-600">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-blue-600 text-white p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6">Our support team is here to help you with anything you need.</p>
          <a href="/contact" className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
