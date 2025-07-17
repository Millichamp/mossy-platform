export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-green-800 mb-6">
          Welcome to Mossy
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          The modern way to buy and sell property - no estate agents, no hassle.
        </p>
        <div className="space-x-4">
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
            List Your Property
          </button>
          <button className="bg-white text-green-600 border-2 border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition">
            Browse Properties
          </button>
        </div>
      </div>
    </main>
  );
}