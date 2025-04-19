import React from 'react';
import AddAccountForm from '@/components/forms/AddAccountForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | Personal Finance Dashboard',
  description: 'Create a new financial account',
};

export default function CreateAccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Account</h1>
          <a
            href="/dashboard/accounts"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Accounts
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <AddAccountForm />
        </div>
      </div>
    </div>
  );
}
