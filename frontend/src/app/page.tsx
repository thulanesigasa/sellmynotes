import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Welcome to <span className="text-blue-600">SellMyNotes.co.za</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The premium marketplace for South African students to securely sell and buy study materials.
        </p>
        
        <div className="pt-8">
          <Link 
            href="/upload" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Go to Seller Dashboard (Upload)
          </Link>
        </div>
      </div>
    </main>
  );
}
