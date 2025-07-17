import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <span className="text-gray-500 text-sm">© {new Date().getFullYear()} Mossy. All rights reserved.</span>
        <div className="flex gap-6 mt-2 md:mt-0">
          <Link href="/provider-dashboard" className="text-green-600 hover:underline text-sm font-medium">
            Service Provider Account
          </Link>
        </div>
      </div>
    </footer>
  );
}
