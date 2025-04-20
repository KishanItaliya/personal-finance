'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

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
  const form = useForm<CategoryFormValues>({
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
  const categoryType = form.watch('type');

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
      form.reset();
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
    <Card>
      <CardHeader>
        <CardTitle>Add New Category</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="e.g., Groceries, Rent, Salary" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Icon name or emoji" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {filteredParentCategories.length > 0 && (
                <FormField
                  control={form.control}
                  name="parentCategoryId"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Parent Category (optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="None (Top Level Category)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None (Top Level Category)</SelectItem>
                          {filteredParentCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader size="sm" className="mr-2" color="white" />
                    Saving
                  </span>
                ) : 'Add Category'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 