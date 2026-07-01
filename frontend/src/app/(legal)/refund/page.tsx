import React from 'react';

export default function RefundPage() {
  return (
    <div className="bg-white py-16 px-6 lg:px-8 min-h-screen">
      <div className="mx-auto max-w-4xl text-base leading-7 text-gray-700 mt-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-6">Refund & Returns Policy</h1>
        
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">General Rule for Digital Products</h2>
            <p className="text-lg leading-8">
              At SellMyNotes, we deal exclusively in digital goods (PDF documents). Because digital files can be instantly downloaded, copied, and consumed, we cannot accept "returns" in the traditional sense. 
            </p>
            <p className="text-lg leading-8 font-bold text-red-600 mt-4">
              Therefore, as a general rule, all sales are considered final and non-refundable once the file has been accessed or downloaded.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligible Reasons for a Refund</h2>
            <p className="mb-4">We are committed to maintaining a high-quality marketplace. We will grant exceptions and issue a full refund under the following specific circumstances:</p>
            <ul className="list-disc pl-6 space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <li><strong>Corrupted File:</strong> The PDF file is corrupted, unreadable, or completely blank, and the seller cannot provide a working version.</li>
              <li><strong>Misleading Description:</strong> The actual content of the notes is fundamentally and wildly different from what was advertised in the title, course code, and description (e.g., you bought what was described as "Calculus 101" but the document contains "History 200").</li>
              <li><strong>Duplicate Purchase:</strong> You accidentally purchased the exact same document twice due to a system glitch or network error.</li>
              <li><strong>Copyright Violation:</strong> The document is proven to be plagiarized or violates copyright laws, resulting in its removal from the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Non-Eligible Reasons</h2>
            <p className="mb-4">Refunds will <strong>NOT</strong> be granted for the following reasons:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li>"I changed my mind."</li>
              <li>"I accidentally bought this." (If the file has already been downloaded).</li>
              <li>"The notes didn't cover the specific chapter I needed." (It is the buyer's responsibility to read the description).</li>
              <li>"I don't like the seller's handwriting or formatting."</li>
              <li>"I dropped the course after buying the notes."</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request a Refund</h2>
            <p className="mb-4">
              If your situation falls under an eligible reason, you must submit a refund request within <strong>7 days</strong> of the original purchase date.
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Email <strong>support@sellmynotes.co.za</strong> with the subject line "Refund Request - [Your Order ID]".</li>
              <li>Include the email address associated with your account.</li>
              <li>Provide a clear, detailed explanation of why you are requesting a refund. Attach screenshots if the file is corrupted or misleading.</li>
            </ol>
            <p className="mt-6 text-sm text-gray-500 italic">
              Our team manually reviews all refund requests. We aim to respond within 48 hours. If approved, the refund will be processed back to your original payment method via PayFast, which may take 3-5 business days to reflect in your account.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
