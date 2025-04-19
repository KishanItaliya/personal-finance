'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type CategoryParent = {
  id: string;
  name: string;
  type: string;
};

// Define the validation schema using zod
const categorySchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Please select a category type' }),
  }),
  color: z.string().optional(),
  icon: z.string().optional(),
  parentCategoryId: z.string().optional(),
});

// Infer the type from the schema
type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AddCategoryForm({
  parentCategories
}: {
  parentCategories: CategoryParent[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'EXPENSE',
      color: '#6366F1', // Default color (indigo)
      icon: '',
      parentCategoryId: '',
    }
  });
  
  // Watch the category type to filter parent categories
  const categoryType = watch('type');

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      // Reset form and refresh data
      reset();
      router.refresh();
      router.push('/dashboard/categories');
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Define available colors for the color picker
  const colorOptions = [
    { value: '#EF4444', label: 'Red' },
    { value: '#F97316', label: 'Orange' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#84CC16', label: 'Lime' },
    { value: '#10B981', label: 'Emerald' },
    { value: '#06B6D4', label: 'Cyan' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#6366F1', label: 'Indigo' },
    { value: '#8B5CF6', label: 'Violet' },
    { value: '#EC4899', label: 'Pink' },
  ];

  // Filter parent categories based on selected type
  const filteredParentCategories = parentCategories.filter(
    category => category.type === categoryType
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">Add New Category</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category Name</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Groceries, Rent, Salary"
              />
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category Type</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            )}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Color</label>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <div className="mt-1 grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    onClick={() => field.onChange(color.value)}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      field.value === color.value
                        ? 'border-gray-800'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  ></div>
                ))}
              </div>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Icon (optional)</label>
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Icon name or emoji"
              />
            )}
          />
        </div>

        {filteredParentCategories.length > 0 && (
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700">Parent Category (optional)</label>
            <Controller
              name="parentCategoryId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">None (Top Level Category)</option>
                  {filteredParentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Add Category'}
        </button>
      </div>
    </form>
  );
} 