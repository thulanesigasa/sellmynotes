import React from 'react';

export default function RefundPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-gray-100 pb-8 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-6">Comprehensive Refund & Returns Policy</h1>
        <p className="text-xl text-gray-500 pb-8">Please read this highly detailed document carefully before making any purchases on the sellmynotes platform. It strictly outlines your rights, limitations, and responsibilities regarding refunds for digital educational goods.</p>
      </div>

      <div className="space-y-12 prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:font-medium prose-p:text-gray-600 prose-li:text-gray-600">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">1. The Absolute General Rule for Digital Goods</h2>
            <p className="text-lg leading-8 mb-4">
              At sellmynotes, our marketplace facilitates the transaction of exclusively digital, downloadable goods—specifically PDF documents containing intellectual property, study materials, and educational summaries. 
            </p>
            <p className="text-lg leading-8 mb-4">
              Because digital files are immediately delivered, instantly downloaded, and can be infinitely copied, consumed, or stored locally on your device, we cannot accept "returns" in the traditional sense that a physical retail store would accept a returned t-shirt or textbook. Once you have downloaded a file, we cannot revoke your knowledge of its contents, nor can we technically ensure you have permanently deleted all copies from your hard drives, cloud storage, or physical printouts.
            </p>
            <div className="p-8 bg-red-50 border-l-8 border-red-600 rounded-r-2xl mt-6 shadow-sm">
              <h3 className="text-2xl font-bold text-red-900 mb-2">THE DEFAULT POLICY:</h3>
              <p className="text-lg text-red-800">
                Therefore, the default, baseline policy of sellmynotes is that <strong>ALL SALES ARE STRICTLY FINAL AND NON-REFUNDABLE</strong> once the file has been successfully processed and made available in your Dashboard Library. By clicking 'Buy Now', you waive your right to a cooling-off period due to the instantaneous nature of digital delivery.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Extremely Limited Eligible Exceptions for a Refund</h2>
            <p className="mb-6 text-lg">We recognize that technical errors happen, files can become corrupted during upload, and occasionally rogue sellers may misrepresent their work. To maintain a high-quality, trustworthy marketplace, we will grant exceptions and issue a full refund <strong>ONLY</strong> under the following specific, verifiable, and strictly enforced circumstances:</p>
            
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-blue-600 mb-3">Exception A: Technically Corrupted File</h3>
                <p className="text-gray-700">If the PDF file you download is technically corrupted, completely unreadable by standard PDF viewers (like Adobe Acrobat), entirely blank, throws parsing errors, or was maliciously password-protected by the author post-upload, and our technical support team cannot provide you with a working version from the seller within 48 hours, you are entitled to a full refund.</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-blue-600 mb-3">Exception B: Grossly Misleading Description</h3>
                <p className="text-gray-700">If the actual content of the document is fundamentally, objectively, and wildly different from what was explicitly advertised by the seller in the title, course code, and description. For example, if you purchased a document described as "Advanced Engineering Calculus 300 Complete Semester Summary" but the downloaded document only contains high school algebra or a single page of illegible scribbles, this qualifies as gross misrepresentation and fraud.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-blue-600 mb-3">Exception C: Accidental Duplicate Purchase</h3>
                <p className="text-gray-700">If you accidentally purchased the exact same document twice (resulting in two identical financial charges on your bank statement for the exact same note ID) due to a system glitch, browser refresh error, or network timeout during checkout, we will refund the duplicate charge immediately upon verification of the logs.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-blue-600 mb-3">Exception D: Verified Copyright Violation</h3>
                <p className="text-gray-700">If the document you purchased is proven to be plagiarized, stolen from another author, copied from a textbook, or violates copyright laws, resulting in a DMCA takedown and its administrative removal from the platform, all affected buyers who purchased the fraudulent material within the last 30 days are eligible for a refund.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Non-Eligible Reasons (STRICTLY ENFORCED)</h2>
            <p className="mb-4 text-lg">To protect our hardworking student sellers from exploitation and theft, refunds will <strong>categorically NOT</strong> be granted for subjective, academic, or buyer-error reasons. This includes, but is absolutely not limited to:</p>
            <ul className="list-disc pl-6 space-y-4 text-gray-800 bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <li><strong>"I changed my mind."</strong> Buyer's remorse is not a legally valid reason for returning consumed digital goods.</li>
              <li><strong>"I accidentally bought this."</strong> The checkout process requires multiple confirmations. If the file has been unlocked in your library, we cannot verify if you have read it. Please review your cart carefully before executing payment.</li>
              <li><strong>"The notes didn't cover the specific chapter I needed."</strong> It is the buyer's sole responsibility to read the description and determine if the notes cover the required syllabus before purchasing.</li>
              <li><strong>"I don't like the seller's handwriting, formatting, or study style."</strong> Subjective dissatisfaction with the author's aesthetic choices, neatness, or pedagogical style does not qualify for a refund. You are encouraged to use the community rating system to warn others.</li>
              <li><strong>"I failed my test after reading these notes."</strong> sellmynotes does not guarantee academic outcomes.</li>
              <li><strong>"I dropped the course after buying the notes."</strong> Changes in your personal academic schedule or university registration do not invalidate the digital transaction.</li>
              <li><strong>"I found free notes online later."</strong> Finding alternative resources post-purchase does not entitle you to a refund for materials already purchased and delivered.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">4. The Formal Refund Request Process</h2>
            <p className="mb-4 text-lg">
              If you firmly believe your situation falls under one of the strictly eligible reasons (Section 2), you must submit a formal, documented refund request within <strong>7 calendar days</strong> of the original transaction date. Requests made after 7 days will be automatically and systematically denied.
            </p>
            <div className="bg-blue-900 text-white p-10 rounded-3xl mt-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">How to submit a formal claim:</h3>
              <ol className="list-decimal pl-6 space-y-5 font-medium text-lg">
                <li>Send an email directly to <strong>support@sellmynotes.co.za</strong>.</li>
                <li>You MUST use the exact subject line: <strong>"URGENT Refund Request - Order ID: [Insert Your PayFast Transaction ID]"</strong>.</li>
                <li>Send the email from the exact email address associated with your sellmynotes account.</li>
                <li>Provide a comprehensive, detailed explanation of exactly why you are requesting a refund, referencing the specific clause in Section 2.</li>
                <li><strong>CRITICAL: Attach visual proof.</strong> If claiming the file is corrupted, blank, or grossly misleading, you MUST attach screenshots of the downloaded PDF proving your claim. Claims without visual evidence will be dismissed.</li>
              </ol>
            </div>
            <p className="mt-8 text-gray-600 text-lg">
              Our dedicated dispute resolution team manually reviews all refund requests to ensure total fairness to both the buyer and the seller. We aim to respond with a final decision within 48 to 72 business hours. 
            </p>
            <p className="mt-4 text-gray-800 font-bold text-lg">
              If approved, the refund will be processed back to your original payment method via PayFast. Depending on your specific South African bank's clearing cycles, it may take 3 to 7 business days for the funds to reflect in your account. The document will simultaneously be permanently removed from your Dashboard Library.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Chargebacks, Fraud, and Account Bans</h2>
            <p className="text-lg text-gray-700 leading-8">
              Filing a fraudulent chargeback or dispute directly with your bank or credit card provider, rather than following this established refund policy, is a severe violation of our Terms of Service. In the event of an unjustified chargeback, your sellmynotes account will be immediately, automatically, and permanently suspended. Furthermore, we will systematically submit all transaction records, IP logs, device fingerprints, and download history to the bank and PayFast to aggressively contest the dispute. We urge you to contact our support team to resolve issues amicably first.
            </p>
          </section>
      </div>
    </div>
  );
}
