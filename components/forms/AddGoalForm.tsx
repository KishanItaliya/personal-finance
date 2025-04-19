'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the validation schema using zod
const goalSchema = z.object({
  name: z.string().min(1, { message: 'Goal name is required' }),
  description: z.string().optional(),
  targetAmount: z.string().min(1, { message: 'Target amount is required' }),
  currentAmount: z.string().optional(),
  targetDate: z.string().min(1, { message: 'Target date is required' }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], {
    errorMap: () => ({ message: 'Please select a priority level' }),
  }),
  icon: z.string().optional(),
});

// Infer the type from the schema
type GoalFormValues = z.infer<typeof goalSchema>;

export default function AddGoalForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      description: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      priority: 'MEDIUM',
      icon: '',
    }
  });
  
  // Calculate progress
  const targetAmount = parseFloat(watch('targetAmount') || '0');
  const currentAmount = parseFloat(watch('currentAmount') || '0');
  const progressPercentage = targetAmount > 0 
    ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
    : 0;

  const onSubmit = async (data: GoalFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      // Reset form and refresh data
      reset();
      router.refresh();
      router.push('/dashboard/goals');
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Icon options (emojis for simplicity, but could be replaced with an icon library)
  const iconOptions = [
    { value: '💰', label: 'Money Bag' },
    { value: '🏠', label: 'House' },
    { value: '🚗', label: 'Car' },
    { value: '✈️', label: 'Travel' },
    { value: '🎓', label: 'Education' },
    { value: '💻', label: 'Technology' },
    { value: '👶', label: 'Family' },
    { value: '🏥', label: 'Health' },
    { value: '🎁', label: 'Gift' },
    { value: '⚽', label: 'Hobby' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">Create New Financial Goal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Goal Name</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Buy a House, Vacation Fund"
              />
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            )}
          />
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Amount</label>
          <Controller
            name="targetAmount"
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
          {errors.targetAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Current Amount</label>
          <Controller
            name="currentAmount"
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Date</label>
          <Controller
            name="targetDate"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            )}
          />
          {errors.targetDate && (
            <p className="mt-1 text-sm text-red-600">{errors.targetDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Icon</label>
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <div className="mt-1 grid grid-cols-5 gap-2">
                {iconOptions.map((icon) => (
                  <div
                    key={icon.value}
                    onClick={() => field.onChange(icon.value)}
                    className={`w-8 h-8 flex items-center justify-center text-xl rounded-full cursor-pointer border-2 ${
                      field.value === icon.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                    title={icon.label}
                  >
                    {icon.value}
                  </div>
                ))}
              </div>
            )}
          />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Add details about your financial goal..."
              />
            )}
          />
        </div>

        {targetAmount > 0 && (
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress: {progressPercentage}%</label>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>${currentAmount.toFixed(2)}</span>
              <span>${targetAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
} 