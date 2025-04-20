'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import { PlusCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

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
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
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
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      totalAmount: '',
      period: 'MONTHLY',
      budgetCategories: [{ categoryId: '', plannedAmount: '' }],
    }
  });
  
  // Setup field array for budget categories
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "budgetCategories",
  });

  // Watch total amount to calculate remaining
  const totalAmount = form.watch('totalAmount');
  const budgetCategories = form.watch('budgetCategories');
  
  // Calculate allocated amount
  const allocatedAmount = budgetCategories.reduce((sum, category) => {
    const amount = parseFloat(category.plannedAmount) || 0;
    return sum + amount;
  }, 0);
  
  // Calculate remaining amount
  const remainingAmount = parseFloat(totalAmount || '0') - allocatedAmount;
  
  // Calculate percentage allocation
  const allocationPercentage = parseFloat(totalAmount) > 0 
    ? Math.min(Math.round((allocatedAmount / parseFloat(totalAmount)) * 100), 100)
    : 0;

  const onSubmit = async (data: BudgetFormValues) => {
    setIsLoading(true);

    try {
      // Format dates for API
      const formattedData = {
        ...data,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
      };

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to create budget');
      }

      // Reset form and refresh data
      form.reset();
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
    <Card>
      <CardHeader>
        <CardTitle>Create New Budget</CardTitle>
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
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="e.g., Monthly Household Budget" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Period</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          fromDate={form.watch('startDate')}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Total Budget Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        {...field}
                        placeholder="0.00" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Budget Categories</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ categoryId: '', plannedAmount: '' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                  <Badge variant={remainingAmount < 0 ? "destructive" : "outline"}>
                    Allocated: ${allocatedAmount.toFixed(2)}
                  </Badge>
                  <Badge variant={remainingAmount < 0 ? "destructive" : "secondary"}>
                    Remaining: ${remainingAmount.toFixed(2)}
                  </Badge>
                </div>
              </div>
              
              <Progress value={allocationPercentage} className="h-2 mb-4" />

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 mb-4 items-start">
                  <div className="col-span-7">
                    <FormField
                      control={form.control}
                      name={`budgetCategories.${index}.categoryId`}
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseCategories.map(category => (
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
                  </div>
                  
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name={`budgetCategories.${index}.plannedAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              placeholder="0.00" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="col-span-1">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {typeof form.formState.errors.budgetCategories?.message === 'string' && (
                <p className="text-sm text-red-600 mt-2">{form.formState.errors.budgetCategories.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading || remainingAmount < 0}
                variant={remainingAmount < 0 ? "destructive" : "default"}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader size="sm" className="mr-2" color="white" />
                    Saving
                  </span>
                ) : 'Create Budget'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 