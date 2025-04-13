// app/(auth)/layout.tsx
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">Financial Tracker</span>
          </Link>
        </div>
      </div>
      
      {children}
    </div>
  );
}