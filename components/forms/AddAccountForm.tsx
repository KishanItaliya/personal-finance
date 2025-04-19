'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the validation schema using zod
const accountSchema = z.object({
  name: z.string().min(1, { message: 'Account name is required' }),
  type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT', 'INVESTMENT', 'CASH', 'OTHER'], {
    errorMap: () => ({ message: 'Please select an account type' }),
  }),
  balance: z.string().min(1, { message: 'Balance is required' }),
  institution: z.string().optional(),
  accountNumber: z.string().optional(),
  interestRate: z.string().optional(),
  creditLimit: z.string().optional(),
});

// Infer the type from the schema
type AccountFormValues = z.infer<typeof accountSchema>;

export default function AddAccountForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'CHECKING',
      balance: '',
      institution: '',
      accountNumber: '',
      interestRate: '',
      creditLimit: '',
    }
  });
  
  // Watch the account type to conditionally render fields
  const accountType = watch('type');

  const onSubmit = async (data: AccountFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      // Reset form and refresh data
      reset();
      router.refresh();
      router.push('/dashboard/accounts');
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">Add New Account</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Account Name</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Account Type</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
                <option value="CREDIT">Credit Card</option>
                <option value="INVESTMENT">Investment</option>
                <option value="CASH">Cash</option>
                <option value="OTHER">Other</option>
              </select>
            )}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Balance</label>
          <Controller
            name="balance"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                step="0.01"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            )}
          />
          {errors.balance && (
            <p className="mt-1 text-sm text-red-600">{errors.balance.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Institution</label>
          <Controller
            name="institution"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Account Number</label>
          <Controller
            name="accountNumber"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            )}
          />
        </div>

        {(accountType === 'SAVINGS' || accountType === 'INVESTMENT') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
            <Controller
              name="interestRate"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              )}
            />
          </div>
        )}

        {accountType === 'CREDIT' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
            <Controller
              name="creditLimit"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
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
          {isLoading ? 'Saving...' : 'Add Account'}
        </button>
      </div>
    </form>
  );
} 