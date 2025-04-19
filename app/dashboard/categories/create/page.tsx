import React from 'react';
import AddCategoryForm from '@/components/forms/AddCategoryForm';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Create Category | Personal Finance Dashboard',
  description: 'Create a new transaction category',
};

export default async function CreateCategoryPage() {
  const session = await auth();
  
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Unauthorized access</p>
          <p className="mt-2">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch existing categories to use as parent categories
  const parentCategories = await prisma.category.findMany({
    where: {
      userId: session.user.id,
      parentCategoryId: null,
    },
    select: {
      id: true,
      name: true,
      type: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Category</h1>
          <a
            href="/dashboard/categories"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Categories
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <AddCategoryForm parentCategories={parentCategories} />
        </div>
      </div>
    </div>
  );
} 