// components/LogoutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/login' });
  };
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </button>
  );
}