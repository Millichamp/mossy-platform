"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleLogin = () => router.push('/login');
  const handleRegister = () => router.push('/register');
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-green-600">Mossy</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/buy" className="text-gray-700 hover:text-green-600 transition">
              Buy
            </Link>
            <Link href="/sell" className="text-gray-700 hover:text-green-600 transition">
              Sell
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-green-600 transition">
              Services
            </Link>
            <Link href="/messages" className="text-gray-700 hover:text-green-600 transition">
              Messages
            </Link>
          </div>

          {/* Auth Buttons/User Info */}
          <div className="flex space-x-4 items-center">
            {loading ? null : user ? (
              <>
                <NotificationCenter />
                
                {/* Account Icon */}
                <Link 
                  href="/dashboard"
                  className="text-gray-700 hover:text-green-600 transition p-2 rounded-full hover:bg-gray-100"
                  title="Account Dashboard"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-green-600 hover:text-green-700 transition"
                >
                  Log in
                </button>
                <button
                  onClick={handleRegister}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}