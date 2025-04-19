'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the validation schema using zod
const goalSchema = z.object({
  name: z.string().min(1, { message: 'Goal name is required' }),
  description: z.string().optional(),
  targetAmount: z.string().min(1, { message: 'Target amount is required' }),
  currentAmount: z.string().optional(),
  targetDate: z.date({
    required_error: "Target date is required",
  }),
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
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      description: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      priority: 'MEDIUM',
      icon: '',
    }
  });
  
  // Calculate progress
  const targetAmount = parseFloat(form.watch('targetAmount') || '0');
  const currentAmount = parseFloat(form.watch('currentAmount') || '0');
  const progressPercentage = targetAmount > 0 
    ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
    : 0;

  const onSubmit = async (data: GoalFormValues) => {
    setIsLoading(true);

    try {
      // Format date for API
      const formattedData = {
        ...data,
        targetDate: data.targetDate.toISOString().split('T')[0],
      };

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      // Reset form and refresh data
      form.reset();
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
    <Card>
      <CardHeader>
        <CardTitle>Create New Financial Goal</CardTitle>
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
                    <FormLabel>Goal Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="e.g., Buy a House, Vacation Fund" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
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

              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount</FormLabel>
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

              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date</FormLabel>
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
                          fromDate={new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <div className="mt-1 grid grid-cols-5 gap-2">
                        {iconOptions.map((icon) => (
                          <div
                            key={icon.value}
                            onClick={() => field.onChange(icon.value)}
                            className={`w-8 h-8 flex items-center justify-center text-xl rounded-full cursor-pointer border-2 ${
                              field.value === icon.value
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-200'
                            }`}
                            title={icon.label}
                          >
                            {icon.value}
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Add details about your financial goal..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {targetAmount > 0 && (
                <div className="col-span-full space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>Progress: {progressPercentage}%</FormLabel>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${currentAmount.toFixed(2)}</span>
                    <span>${targetAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 