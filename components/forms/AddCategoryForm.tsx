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
import { announceToScreenReader } from '@/lib/a11y';
import { KeyboardNav, KeyAction } from '@/components/a11y/KeyboardNav';
import { ScreenReaderText } from '@/components/a11y/ScreenReaderText';

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

      // Announce success to screen readers
      announceToScreenReader('Category created successfully');
      
      // Reset form and refresh data
      form.reset();
      router.refresh();
      router.push('/dashboard/categories');
    } catch (error) {
      console.error('Error adding category:', error);
      announceToScreenReader('Error creating category. Please try again.');
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

  // Create keyboard navigation actions for color picker
  const colorKeyboardActions: KeyAction[] = [
    { key: "ArrowRight", action: () => navigateColorPicker(1) },
    { key: "ArrowLeft", action: () => navigateColorPicker(-1) },
    { key: "ArrowDown", action: () => navigateColorPicker(5) }, // Move down a row (5 colors per row)
    { key: "ArrowUp", action: () => navigateColorPicker(-5) }, // Move up a row
    { key: "Enter", action: () => selectFocusedColor() },
    { key: " ", action: () => selectFocusedColor() } // Space key
  ];

  // State to track focused color in keyboard navigation
  const [focusedColorIndex, setFocusedColorIndex] = useState(-1);
  
  // Function to navigate through colors with keyboard
  const navigateColorPicker = (direction: number) => {
    let newIndex = focusedColorIndex + direction;
    
    // Handle wrapping around
    if (newIndex < 0) {
      newIndex = colorOptions.length - 1;
    } else if (newIndex >= colorOptions.length) {
      newIndex = 0;
    }
    
    setFocusedColorIndex(newIndex);
    
    // Announce the color to screen readers
    if (newIndex >= 0 && newIndex < colorOptions.length) {
      announceToScreenReader(`Selected ${colorOptions[newIndex].label}`);
    }
  };
  
  // Function to select the currently focused color
  const selectFocusedColor = () => {
    if (focusedColorIndex >= 0 && focusedColorIndex < colorOptions.length) {
      form.setValue('color', colorOptions[focusedColorIndex].value);
      announceToScreenReader(`Color set to ${colorOptions[focusedColorIndex].label}`);
    }
  };

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
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-6"
            aria-labelledby="form-heading"
          >
            <h2 id="form-heading" className="sr-only">Category Information Form</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="category-name">Category Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        id="category-name"
                        placeholder="e.g., Groceries, Rent, Salary" 
                        aria-required="true"
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
                    <FormLabel htmlFor="category-type">Category Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger id="category-type">
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
                    <FormLabel id="color-picker-label">Color</FormLabel>
                    <FormControl>
                      <KeyboardNav actions={colorKeyboardActions}>
                        <div 
                          role="radiogroup"
                          aria-labelledby="color-picker-label"
                          className="mt-1 grid grid-cols-5 gap-2"
                          tabIndex={0}
                        >
                          {colorOptions.map((color, index) => (
                            <div
                              key={color.value}
                              role="radio"
                              aria-checked={field.value === color.value}
                              tabIndex={index === focusedColorIndex ? 0 : -1}
                              onClick={() => {
                                field.onChange(color.value);
                                announceToScreenReader(`Selected ${color.label}`);
                              }}
                              onFocus={() => setFocusedColorIndex(index)}
                              className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                                field.value === color.value
                                  ? 'border-gray-800 dark:border-white'
                                  : 'border-transparent'
                              } focus:outline-none focus:ring-2 focus:ring-primary`}
                              style={{ backgroundColor: color.value }}
                              aria-label={color.label}
                            >
                              <ScreenReaderText>
                                {color.label} color
                              </ScreenReaderText>
                            </div>
                          ))}
                        </div>
                      </KeyboardNav>
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
                    <FormLabel htmlFor="category-icon">Icon (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        id="category-icon"
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
                      <FormLabel htmlFor="parent-category">Parent Category (optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger id="parent-category">
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
              <Button 
                type="submit" 
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader size="sm" className="mr-2" color="white" aria-hidden="true" />
                    Saving
                  </span>
                ) : 'Save Category'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 