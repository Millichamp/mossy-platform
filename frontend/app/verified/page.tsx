"use client";

import Link from "next/link";

export default function VerifiedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Email Verified!</h1>
        <p className="mb-6 text-gray-700">Thank you for verifying your email. You can now log in to Mossy and start using your account.</p>
        <Link href="/login" className="w-full inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">Login</Link>
      </div>
    </main>
  );
}
