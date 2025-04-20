import React from 'react';
import AddAccountForm from '@/components/forms/AddAccountForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | Personal Finance Dashboard',
  description: 'Create a new financial account',
};

export default function CreateAccountPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Account</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <AddAccountForm />
      </div>
    </div>
  );
}
