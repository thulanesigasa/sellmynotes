import React from 'react';
import { Download, MonitorPlay, Infinity, ShieldCheck, MailCheck, HardDrive, Zap, Clock, CheckCircle2 } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-5xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-6">Comprehensive Digital Shipping & Delivery Policy</h1>
        
        <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl mb-12">
          <p className="text-xl font-medium text-blue-900">
            <strong>Critical Notice:</strong> sellmynotes operates exclusively as a digital marketplace for educational goods. <strong>We do absolutely not sell, store, print, or ship any physical products, books, hardcopy notes, or printed materials to any physical address.</strong> All deliveries are 100% digital and instant.
          </p>
        </div>

        <div className="space-y-16">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">The Digital Delivery Lifecycle: Step-by-Step</h2>
            <p className="text-lg text-gray-600 mb-8">We have engineered our platform to ensure that the moment you part with your money, you receive your educational materials instantly. Here is exactly how the process works:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6">
                  <MonitorPlay className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Phase 1: Secure Checkout</h3>
                <p className="text-sm text-gray-600">When you decide to purchase a note, you are routed through our secure PayFast gateway. You can pay via Credit/Debit Card, Instant EFT, or SnapScan. Your payment is verified in milliseconds using bank-grade 256-bit encryption.</p>
              </div>
              <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6">
                  <Zap className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Phase 2: Instant Unlock Protocol</h3>
                <p className="text-sm text-gray-600">Upon successful payment confirmation via PayFast's webhook, our servers instantly generate a secure, unique download token associated directly with your authenticated user account ID. The PDF is instantly unlocked.</p>
              </div>
              <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6">
                  <Infinity className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Phase 3: Perpetual Access</h3>
                <p className="text-sm text-gray-600">You are redirected back to the app. The unlocked document is permanently added to your Dashboard Library. You can log in anytime, from any device, to view or re-download your materials without ever paying again.</p>
              </div>
            </div>
          </section>

          <section className="pt-12 border-t border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Strict File Formats, Compatibility, and Quality Assurance</h2>
            <div className="space-y-6">
              <p className="text-lg">
                To ensure a consistent, high-quality experience for all users, all documents sold on the sellmynotes platform are strictly mandated to be delivered in <strong>Portable Document Format (PDF / .pdf)</strong>. 
              </p>
              <p className="text-lg font-bold text-gray-900">
                Why do we strictly enforce the PDF format?
              </p>
              <ul className="list-disc pl-6 space-y-4 text-gray-600">
                <li><strong>Absolute Formatting Preservation:</strong> PDFs ensure that complex mathematical equations, intricate scientific diagrams, engineering tables, and specific text formatting are preserved exactly as the seller authored them. A Word document might break formatting depending on your version of Office; a PDF will not.</li>
                <li><strong>Universal Cross-Platform Compatibility:</strong> PDFs are universally supported. You can view your purchased notes seamlessly on a Windows PC, Mac, iPad, Android tablet, or smartphone without needing specialized, expensive, or proprietary software.</li>
                <li><strong>Enhanced Security:</strong> PDFs allow us to maintain a secure environment. They are significantly less susceptible to carrying malicious scripts or macro viruses that can sometimes be embedded in other document formats like Word (.docx) or Excel (.xlsx).</li>
                <li><strong>Print Readiness:</strong> While we deliver digitally, we know students love to highlight physical paper. PDFs are perfectly optimized for A4 printing at your local university library or home printer.</li>
              </ul>
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl text-sm border border-gray-200 flex items-start">
                <CheckCircle2 className="h-6 w-6 text-green-500 mr-4 flex-shrink-0" />
                <p>
                  <strong>Software Requirements:</strong> To view your purchased notes, you simply need a standard PDF reader. This is built natively into almost all modern web browsers (Google Chrome, Safari, Microsoft Edge). Alternatively, you can use highly recommended free software like Adobe Acrobat Reader DC, Apple Preview, or Foxit Reader.
                </p>
              </div>
            </div>
          </section>

          <section className="pt-12 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Troubleshooting: What to do if Delivery Fails?</h2>
                <p className="mb-4 text-lg text-gray-600">
                  Our system architecture processes 99.9% of transactions instantly. However, very occasionally, network latency, browser timeouts, or bank communication delays can prevent the immediate unlocking of a document. 
                </p>
                <p className="mb-6 text-gray-600">
                  If your bank account reflects a charge, but the document is mysteriously missing from your Library, please follow these systematic steps:
                </p>
                <ol className="list-decimal pl-6 space-y-4 text-gray-800 font-medium">
                  <li><strong>Patience is key:</strong> Wait exactly 5 minutes for the PayFast webhook to resolve and communicate with our database.</li>
                  <li><strong>Hard Refresh:</strong> Hard-refresh your Dashboard Library page (Press Ctrl+F5 on Windows, or Cmd+Shift+R on Mac) to clear your browser cache.</li>
                  <li><strong>Check Email:</strong> Check your registered email address inbox (and spam/junk folder) for a PayFast purchase confirmation receipt.</li>
                  <li><strong>Contact Support:</strong> If the file still hasn't appeared after 15 minutes, please immediately contact our technical support team at <strong>support@sellmynotes.co.za</strong>. Provide your PayFast transaction ID, and a human agent will manually unlock the document for you within hours.</li>
                </ol>
              </div>
              <div className="bg-gray-900 rounded-3xl p-8 text-white h-full flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldCheck className="h-48 w-48 text-white" />
                </div>
                <ShieldCheck className="h-12 w-12 text-blue-400 mb-6 relative z-10" />
                <h3 className="text-3xl font-bold mb-4 relative z-10">The sellmynotes Delivery Guarantee</h3>
                <p className="text-gray-300 mb-8 text-lg relative z-10">
                  We guarantee that if you pay for a document, you will receive it. Period. If a severe technical glitch prevents delivery and our support team cannot manually unlock the file for you within 48 hours, you are entitled to a full, unquestioned, expedited refund to your bank account.
                </p>
                <div className="flex items-center text-sm text-gray-400 relative z-10">
                  <HardDrive className="h-6 w-6 mr-3 text-blue-400" />
                  Files are securely hosted on enterprise-grade AWS S3 infrastructure ensuring 99.99% uptime.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
