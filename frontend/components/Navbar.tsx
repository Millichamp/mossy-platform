"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {

  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleLogin = () => router.push('/login');
  const handleRegister = () => router.push('/register');
  const handleDashboard = () => router.push('/dashboard');
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
            {user && user.role === 'service_provider' && (
              <Link href="/dashboard" className="text-gray-700 hover:text-green-600 transition">
                Provider Dashboard
              </Link>
            )}
            {user && user.role === 'seller' && (
              <Link href="/dashboard" className="text-gray-700 hover:text-green-600 transition">
                Seller Dashboard
              </Link>
            )}
            {user && user.role === 'buyer' && (
              <Link href="/dashboard" className="text-gray-700 hover:text-green-600 transition">
                Buyer Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons/User Info */}
          <div className="flex space-x-4 items-center">
            {loading ? null : user ? (
              <>
                <span className="text-gray-700 text-sm font-medium">
                  {user.name || user.email} <span className="ml-1 text-xs text-gray-400">({user.role})</span>
                </span>
                <button
                  onClick={handleDashboard}
                  className="text-green-600 hover:text-green-700 transition"
                >
                  Dashboard
                </button>
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
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
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