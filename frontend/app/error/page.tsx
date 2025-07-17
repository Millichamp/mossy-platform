"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  otp_expired: "The verification link has expired. Please request a new one.",
  access_denied: "Access denied. Please try again or contact support.",
  default: "An unknown error occurred. Please try again.",
};

export default function ErrorPage() {
  const params = useSearchParams();
  const errorCode = params.get("error_code");
  const errorDescription = params.get("error_description");
  const message = errorCode && errorMessages[errorCode] ? errorMessages[errorCode] : errorMessages.default;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h1>
        <p className="mb-4 text-gray-700">{message}</p>
        {errorDescription && <p className="mb-4 text-gray-500 text-sm">{decodeURIComponent(errorDescription)}</p>}
        <Link href="/register" className="w-full inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition">Try Again</Link>
      </div>
    </main>
  );
}
