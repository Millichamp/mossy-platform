"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProviderDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'service_provider')) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'service_provider') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Service Provider Account</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="mb-2"><span className="font-semibold">Business Name:</span> {user.name || user.email}</p>
          <p className="mb-2"><span className="font-semibold">Email:</span> {user.email}</p>
          <p className="mb-2"><span className="font-semibold">Account Type:</span> {user.role}</p>
          {/* Add more provider-specific info and links here */}
        </div>
      </div>
    </main>
  );
}
