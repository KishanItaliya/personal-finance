'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type Category = {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
};

// Define the validation schema using zod
const budgetCategorySchema = z.object({
  categoryId: z.string().min(1, { message: 'Category is required' }),
  plannedAmount: z.string().min(1, { message: 'Amount is required' }),
});

const budgetSchema = z.object({
  name: z.string().min(1, { message: 'Budget name is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  totalAmount: z.string().min(1, { message: 'Total amount is required' }),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY'], {
    errorMap: () => ({ message: 'Please select a budget period' }),
  }),
  budgetCategories: z.array(budgetCategorySchema).min(1, { message: 'At least one category is required' }),
});

// Infer the type from the schema
type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function AddBudgetForm({
  categories
}: {
  categories: Category[];
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
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      totalAmount: '',
      period: 'MONTHLY',
      budgetCategories: [{ categoryId: '', plannedAmount: '' }],
    }
  });
  
  // Setup field array for budget categories
  const { fields, append, remove } = useFieldArray({
    control,
    name: "budgetCategories",
  });

  // Watch total amount to calculate remaining
  const totalAmount = watch('totalAmount');
  const budgetCategories = watch('budgetCategories');
  
  // Calculate allocated amount
  const allocatedAmount = budgetCategories.reduce((sum, category) => {
    const amount = parseFloat(category.plannedAmount) || 0;
    return sum + amount;
  }, 0);
  
  // Calculate remaining amount
  const remainingAmount = parseFloat(totalAmount || '0') - allocatedAmount;

  const onSubmit = async (data: BudgetFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create budget');
      }

      // Reset form and refresh data
      reset();
      router.refresh();
      router.push('/dashboard/budgets');
    } catch (error) {
      console.error('Error adding budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter to only show expense categories
  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">Create New Budget</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Budget Name</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Monthly Household Budget"
              />
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Budget Period</label>
          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            )}
          />
          {errors.period && (
            <p className="mt-1 text-sm text-red-600">{errors.period.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            )}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            )}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">Total Budget Amount</label>
          <Controller
            name="totalAmount"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                step="0.01"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="0.00"
              />
            )}
          />
          {errors.totalAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.totalAmount.message}</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Categories</h3>
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2 items-center">
            <span className="text-sm font-medium">Allocated:</span>
            <span className="text-sm">${allocatedAmount.toFixed(2)}</span>
          </div>
          <div className="flex space-x-2 items-center">
            <span className="text-sm font-medium">Remaining:</span>
            <span className={`text-sm ${remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${remainingAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-7">
              <Controller
                name={`budgetCategories.${index}.categoryId`}
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.budgetCategories?.[index]?.categoryId && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.budgetCategories[index]?.categoryId?.message}
                </p>
              )}
            </div>
            
            <div className="col-span-4">
              <Controller
                name={`budgetCategories.${index}.plannedAmount`}
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    step="0.01"
                    {...field}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                )}
              />
              {errors.budgetCategories?.[index]?.plannedAmount && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.budgetCategories[index]?.plannedAmount?.message}
                </p>
              )}
            </div>
            
            <div className="col-span-1 flex items-center">
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove category"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}

        {errors.budgetCategories && typeof errors.budgetCategories.message === 'string' && (
          <p className="mt-1 text-sm text-red-600">{errors.budgetCategories.message}</p>
        )}
        
        <button
          type="button"
          onClick={() => append({ categoryId: '', plannedAmount: '' })}
          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || remainingAmount < 0}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Create Budget'}
        </button>
      </div>
    </form>
  );
} 