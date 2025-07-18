"use client";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {/* Hero Section with overlayed Search Bar */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&q=80"
          alt="Modern UK Home"
          fill
          className="object-cover object-center z-0"
          priority
          placeholder="blur"
          blurDataURL="/placeholder-property.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-emerald-800/60 to-green-600/50 z-10" />
        <div className="relative z-20 flex flex-col items-center text-center px-4 w-full">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Buy and Sell Homes Without Estate Agents
          </h1>
          <p className="text-lg md:text-2xl text-white mb-8 max-w-2xl drop-shadow">
            Save thousands in fees. Deal directly. Get expert services when you need them.
          </p>
          <div className="flex gap-4 mb-12">
            <Link href="/sell">
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
                Start Selling
              </button>
            </Link>
            <Link href="/buy">
              <button className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-gradient-to-r hover:from-white hover:to-gray-100 hover:text-green-600 transition-all duration-200 transform hover:scale-105">
                Browse Properties
              </button>
            </Link>
          </div>
          {/* Animated scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* Trust Indicators Bar */}
      <section className="max-w-5xl mx-auto mt-16 mb-8 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-3 text-center text-base font-semibold justify-center">
          <div className="flex flex-col items-center">
            <span className="mb-1 text-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10l4.5 4.5L21 5" /></svg>
            </span>
            <span className="text-emerald-600">500+ Properties Listed</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="mb-1 text-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 12v4m8-8h-4m-8 0H4" /></svg>
            </span>
            <span className="text-emerald-600">£2M+ Saved in Fees</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="mb-1 text-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.75l-6.16 3.24 1.18-6.88L2 9.51l6.92-1.01L12 2.5l3.08 6.01 6.92 1.01-5.02 4.6 1.18 6.88z" /></svg>
            </span>
            <span className="text-emerald-600">4.8★ Average Rating</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="mb-1 text-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 01.88 7.9c.08.32.12.66.12 1a4 4 0 11-8 0c0-.34.04-.68.12-1A4 4 0 018 7" /></svg>
            </span>
            <span className="text-emerald-600">On-Demand Services Marketplace</span>
          </div>
        </div>
      </section>

      {/* Featured Properties Carousel */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Recently Listed Properties</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {/* Example property cards */}
            {[
              {
                img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
                price: "£1,200,000",
                location: "Chelsea, London",
                beds: 4,
                baths: 3,
                listed: "2 days ago"
              },
              {
                img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
                price: "£850,000",
                location: "Richmond, London",
                beds: 3,
                baths: 2,
                listed: "2 days ago"
              },
              {
                img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
                price: "£650,000",
                location: "Manchester",
                beds: 2,
                baths: 2,
                listed: "2 days ago"
              },
              {
                img: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80",
                price: "£1,100,000",
                location: "Bristol",
                beds: 5,
                baths: 4,
                listed: "2 days ago"
              }
            ].map((p, i) => (
              <div key={i} className="min-w-[320px] bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl hover:from-white hover:to-gray-100 transition-all duration-300 overflow-hidden border border-gray-200">
                <Image src={p.img} alt={p.location} width={320} height={200} className="object-cover w-full h-48" />
                <div className="p-4">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold text-lg mb-1">{p.price}</div>
                  <div className="text-gray-700 mb-1">{p.location}</div>
                  <div className="text-gray-500 text-sm mb-2">{p.beds} beds • {p.baths} baths</div>
                  <div className="text-xs text-gray-400">Listed {p.listed}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto mb-16 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
            <span className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </span>
            <h3 className="font-semibold text-lg mb-2">List or Browse</h3>
            <p>Upload your property in minutes or browse listings</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
            <span className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </span>
            <h3 className="font-semibold text-lg mb-2">Connect Directly</h3>
            <p>Chat with buyers/sellers without middlemen</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
            <span className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <h3 className="font-semibold text-lg mb-2">Complete the Deal</h3>
            <p>Access trusted services only when needed</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Why Choose Mossy?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* No Estate Agent Fees */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center">
            <span className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 12v4m8-8h-4m-8 0H4" /></svg>
            </span>
            <h3 className="font-semibold text-lg mb-2">No Estate Agent Fees</h3>
            <p>Sell your home and save thousands in commission.</p>
          </div>
          {/* Direct Communication */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center">
            <span className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m10 0V6a4 4 0 00-8 0v2m8 0H7" /></svg>
            </span>
            <h3 className="font-semibold text-lg mb-2">Direct Communication</h3>
            <p>Chat directly with buyers and sellers—no middlemen.</p>
          </div>
          {/* Trusted Services */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center">
            <span className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <h3 className="font-semibold text-lg mb-2">Trusted On-Demand Services</h3>
            <p>Access conveyancing, photography, and compliance services as you need them.</p>
          </div>
        </div>
      </section>

      {/* On-Demand Property Services Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">On-Demand Property Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Conveyancing */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition">
            <span className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0v1a3 3 0 003 3 3 3 0 003-3v-1" /></svg>
            </span>
            <h3 className="font-semibold text-lg mb-2">Conveyancing</h3>
            <p className="mb-4">Get instant quotes from trusted solicitors and manage your transaction online.</p>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition">Get Quotes</button>
          </div>
          {/* Photography */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition">
            <span className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h2l2-3h6l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2zm9 4a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
            <h3 className="font-semibold text-lg mb-2">Photography</h3>
            <p className="mb-4">Book professional property photography and floorplans at the click of a button.</p>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition">Book Now</button>
          </div>
          {/* EPCs */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition">
            <span className="bg-emerald-100 p-4 rounded-full mb-4">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#10b981"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <h3 className="font-semibold text-lg mb-2">EPCs & Certificates</h3>
            <p className="mb-4">Order Energy Performance Certificates and compliance checks fast and easily.</p>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition">Order EPC</button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-emerald-50 rounded-xl shadow p-6 flex flex-col items-center text-center">
              <div className="text-emerald-600 text-3xl mb-2">“</div>
              <p className="mb-4 text-lg">Selling with Mossy was so easy and I saved over £5,000 in fees. Highly recommend!</p>
              <div className="font-semibold">Sarah J.</div>
              <div className="text-gray-400 text-sm">London</div>
            </div>
            {/* Testimonial 2 */}
            <div className="bg-emerald-50 rounded-xl shadow p-6 flex flex-col items-center text-center">
              <div className="text-emerald-600 text-3xl mb-2">“</div>
              <p className="mb-4 text-lg">I loved being able to talk directly to buyers. The process was transparent and stress-free.</p>
              <div className="font-semibold">James W.</div>
              <div className="text-gray-400 text-sm">Manchester</div>
            </div>
            {/* Testimonial 3 */}
            <div className="bg-emerald-50 rounded-xl shadow p-6 flex flex-col items-center text-center">
              <div className="text-emerald-600 text-3xl mb-2">“</div>
              <p className="mb-4 text-lg">The on-demand services were a game changer. Everything I needed was just a click away.</p>
              <div className="font-semibold">Priya S.</div>
              <div className="text-gray-400 text-sm">Bristol</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="bg-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Save Thousands on Your Next Move?</h2>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl">Join Mossy today and experience a better way to buy and sell property—without the middlemen, with all the support you need.</p>
          <div className="flex gap-4">
            <Link href="/register">
              <button className="bg-white text-emerald-600 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-emerald-100 transition">Get Started</button>
            </Link>
            <Link href="/sell">
              <button className="bg-emerald-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-emerald-700 transition">List Your Property</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-200 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-extrabold text-emerald-400 mb-2">Mossy</span>
            <span className="text-gray-400 text-sm">Buy & Sell Homes Without Estate Agents</span>
          </div>
          <nav className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm items-center">
            <Link href="/buy" className="hover:text-emerald-400">Buy</Link>
            <Link href="/sell" className="hover:text-emerald-400">Sell</Link>
            <Link href="/services" className="hover:text-emerald-400">Services</Link>
            <Link href="/register" className="hover:text-emerald-400">Register</Link>
            <Link href="/login" className="hover:text-emerald-400">Login</Link>
          </nav>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500">&copy; {new Date().getFullYear()} Mossy. All rights reserved.</div>
      </footer>
    </main>
  );
}
