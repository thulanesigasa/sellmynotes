import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-100 pb-8 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-2">Privacy Policy</h1>
        <p className="text-sm font-medium text-blue-600">Last Updated: July 1, 2026</p>
      </div>

      <div className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:font-medium prose-p:text-gray-600 prose-li:text-gray-600">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction and Scope</h2>
            <p>
              At sellmynotes ("we," "our," or "us"), your privacy is our absolute priority. We are fiercely committed to protecting your personal data, respecting your right to privacy, and ensuring that your experience on our educational marketplace is completely secure. This highly detailed Privacy Policy explains explicitly how we collect, use, process, store, disclose, and safeguard your information when you visit our website, mobile application, or use any of our related services (collectively, the "Platform").
            </p>
            <p className="mt-4">
              By accessing, browsing, registering for, or using the sellmynotes Platform in any capacity, you acknowledge that you have read, understood, and agree to be bound by the terms of this Privacy Policy. If you do not agree with these terms in their entirety, you must immediately cease all use of the Platform. This Privacy Policy has been carefully drafted to comply fully with the Protection of Personal Information Act 4 of 2013 (POPIA) of South Africa, the General Data Protection Regulation (GDPR), and other relevant global data protection frameworks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Detailed Information Collection</h2>
            <p>We believe in transparency. We may collect vast arrays of information about you in a variety of ways, categorized as follows:</p>
            <ul className="list-disc pl-6 mt-4 space-y-4">
              <li>
                <strong>Personal Identification Data:</strong> When you voluntarily register for an account, we collect personally identifiable information. This includes, but is not limited to, your full legal name, email address, mobile phone number, university or institution of study, degree program, graduation year, profile picture, and chosen username. You may also provide this information when you enter competitions, sign up for newsletters, or contact our support team.
              </li>
              <li>
                <strong>Financial and Transactional Data:</strong> When you purchase study materials or receive payouts as a seller, we process financial data. <strong>Crucially: all credit card and banking transactions are processed securely by our PCI-DSS compliant third-party payment processor, PayFast.</strong> We do not store, process, or transmit your actual credit card numbers on our servers. For sellers, we collect and securely store your South African banking details (Account Name, Account Number, Branch Code, Bank Name) solely for the explicit purpose of processing your earnings payouts via Electronic Funds Transfer (EFT).
              </li>
              <li>
                <strong>Derivative and Usage Data:</strong> Our servers automatically collect intricate data when you access the Platform. This includes your IP address, browser type and version, operating system, device identifiers, referring URLs, exit pages, the specific pages you viewed, the time and date of your visits, the time spent on each page, clickstream data, search queries entered, and other diagnostic data. This helps us map user journeys and optimize server load.
              </li>
              <li>
                <strong>User Generated Content (UGC):</strong> Any study notes, summaries, flashcards, reviews, comments, forum posts, direct messages, or other material you upload, publish, or transmit through the Platform is collected and stored by us.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Comprehensive Use of Your Information</h2>
            <p>Having accurate, detailed information about you permits us to provide a seamless, efficient, and highly customized educational marketplace experience. Specifically, we may use the information we collect about you via the Platform to:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Create, verify, and securely manage your user account.</li>
              <li>Process your purchases, track your downloads, and manage seller payouts with absolute accuracy.</li>
              <li>Generate receipts, invoices, and detailed transaction histories for your records.</li>
              <li>Email you regarding critical account updates, security alerts, order confirmations, or password resets.</li>
              <li>Deliver targeted advertising, personalized newsletters, and customized promotional offers based on your study habits and course selections.</li>
              <li>Dramatically improve platform security, detect fraud, prevent unauthorized access, and mitigate malicious bot activity.</li>
              <li>Monitor, analyze, and aggregate usage trends to improve UI/UX design and platform functionality.</li>
              <li>Administer surveys, sweepstakes, promotions, or academic contests.</li>
              <li>Resolve buyer-seller disputes, troubleshoot technical problems, and respond effectively to customer support inquiries.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Exhaustive Disclosure of Your Information</h2>
            <p>We are not data brokers; we do not sell, trade, or rent your personal identification information to third parties for their independent marketing purposes. However, we may disclose your information in the following strictly controlled situations:</p>
            <ul className="list-disc pl-6 mt-4 space-y-4">
              <li>
                <strong>By Law or to Protect Rights:</strong> We will disclose your information if we believe the release is necessary to respond to legal processes (such as a subpoena, court order, or search warrant), to investigate or remedy potential violations of our Terms of Service, to prevent academic fraud, or to protect the rights, property, and physical safety of sellmynotes, our users, or others.
              </li>
              <li>
                <strong>Trusted Third-Party Service Providers:</strong> We share your data with heavily vetted third parties that perform vital services for us. This includes payment processors (PayFast), cloud hosting providers (AWS/Supabase), email delivery services (SendGrid/Postmark), customer support platforms, and advanced data analytics tools (Google Analytics). These third parties are bound by strict confidentiality agreements and are prohibited from using your data for any other purpose.
              </li>
              <li>
                <strong>Interactions with Other Users:</strong> If you interact with other users on the Platform (e.g., by leaving a review on a purchased note), those users may see your username, profile photo, and the content of your review. If you are a seller, buyers will see your username and university affiliation.
              </li>
              <li>
                <strong>Business Transfers and Corporate Restructuring:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, acquisition, or bankruptcy proceeding. In such events, you will be notified via email of any change in ownership or uses of your personal information.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies, Web Beacons, and Tracking Technologies</h2>
            <p>
              The sellmynotes Platform utilizes cookies, web beacons (also known as clear gifs or pixel tags), log files, and other tracking technologies to enhance your experience. 
            </p>
            <p className="mt-4">
              <strong>Session Cookies:</strong> These are temporary cookies that expire when you close your browser. They are essential for maintaining your login state and keeping items in your shopping cart as you navigate the site.
            </p>
            <p className="mt-4">
              <strong>Persistent Cookies:</strong> These remain on your hard drive for an extended period. We use them to remember your preferences (such as your chosen university or dark mode settings) for future visits.
            </p>
            <p className="mt-4">
              You possess the ability to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer. However, please be acutely aware that disabling cookies will severely degrade your experience on sellmynotes, potentially preventing you from logging in, checking out, or accessing your purchased notes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Fortified Security Measures</h2>
            <p>
              We employ military-grade administrative, technical, and physical security measures to protect your personal information. Our database utilizes Supabase Auth for secure JWT-based authentication, end-to-end SSL/TLS encryption for all data transmission, and strict Row Level Security (RLS) policies to ensure users can only access their own data.
            </p>
            <p className="mt-4">
              Furthermore, we conduct regular penetration testing and vulnerability scanning. However, while we have taken extraordinary steps to secure your data, please be aware that no security measures are 100% impenetrable. We cannot guarantee the absolute security of any information you transmit to us online, and you do so at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention Policy</h2>
            <p>
              We will retain your personal information only for as long as is strictly necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your transaction records to comply with South African tax laws), resolve protracted disputes, and enforce our legal agreements and policies.
            </p>
            <p className="mt-4">
              If you request account deletion, we will purge your personal data within 30 days, except for anonymized transactional records which must be kept for financial auditing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Extensive Data Rights under POPIA</h2>
            <p>As a South African entity, we are fully compliant with the Protection of Personal Information Act (POPIA). You are endowed with the following irrevocable rights:</p>
            <ul className="list-disc pl-6 mt-4 space-y-4">
              <li><strong>The Right to Access (Section 23):</strong> You may request a comprehensive, human-readable copy of the exact personal information we hold about you. We will provide this within a reasonable timeframe, free of charge.</li>
              <li><strong>The Right to Rectification (Section 24):</strong> You have the absolute right to request that we correct any inaccurate, outdated, or incomplete personal information. You can do this yourself via the Dashboard, or contact us.</li>
              <li><strong>The Right to Erasure / Right to be Forgotten:</strong> You may demand the permanent deletion of your personal data when it is no longer necessary for the purposes for which it was collected, subject to legal retention exceptions.</li>
              <li><strong>The Right to Object (Section 11):</strong> You may object, on reasonable grounds relating to your particular situation, to the processing of your personal information, especially regarding direct marketing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Policy Regarding Minors</h2>
            <p>
              The sellmynotes Platform is designed for university and college students. We do not knowingly solicit information from or market to children under the age of 18 without parental consent. If you are under 18, you must have the explicit permission of your parent or legal guardian to use this site. If we become aware that we have collected personal information from a minor without verified parental consent, we will immediately deactivate the account and securely purge the data from our records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications and Updates</h2>
            <p>
              The digital landscape evolves rapidly. Therefore, we reserve the unilateral right to make changes, amendments, or complete overhauls to this Privacy Policy at any time and for any reason. We will actively alert you about significant material changes by updating the "Last Updated" date, placing a prominent banner on our homepage, or sending a direct email notification. Your continued use of the Platform after such modifications constitutes your acknowledgement and binding acceptance of the revised Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Legal Contact Information</h2>
            <p>If you have highly specific questions, concerns, complaints, or wish to exercise your POPIA data rights, please contact our dedicated Data Protection Officer (DPO) at:</p>
            <div className="bg-gray-50 p-6 rounded-2xl mt-4 border border-gray-200">
              <p className="font-bold text-gray-900">sellmynotes Legal & Compliance Department</p>
              <p className="mt-2">Email: <strong>legal@sellmynotes.co.za</strong></p>
              <p className="mt-2">Physical Address: Kelvin, Sandton, Johannesburg, South Africa, 2090</p>
              <p className="mt-2 text-sm text-gray-500">Please allow up to 72 hours for a formal response to data rights inquiries.</p>
            </div>
          </section>
      </div>
    </div>
  );
}
