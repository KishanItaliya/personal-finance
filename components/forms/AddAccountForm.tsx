'use client';

import { useState, useEffect } from 'react';
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
import { dashboardRoutes } from '@/lib/routes';

// Define the validation schema using zod
const accountSchema = z.object({
  name: z.string().min(1, { message: 'Account name is required' }),
  type: z.string().min(1, { message: 'Account type is required' }),
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
  const [accountTypes, setAccountTypes] = useState<{label: string, value: string}[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  
  // Fetch account types from API
  useEffect(() => {
    const fetchAccountTypes = async () => {
      try {
        // Fallback to schema-defined types since we don't have a dedicated API yet
        setAccountTypes([
          { value: 'CHECKING', label: 'Checking' },
          { value: 'SAVINGS', label: 'Savings' },
          { value: 'CREDIT', label: 'Credit Card' },
          { value: 'INVESTMENT', label: 'Investment' },
          { value: 'CASH', label: 'Cash' },
          { value: 'OTHER', label: 'Other' },
        ]);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchAccountTypes();
  }, []);
  
  // Initialize react-hook-form
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: '',
      balance: '',
      institution: '',
      accountNumber: '',
      interestRate: '',
      creditLimit: '',
    }
  });
  
  // Watch the account type to conditionally render fields
  const accountType = form.watch('type');

  const onSubmit = async (data: AccountFormValues) => {
    setIsLoading(true);

    try {
      // Convert empty strings to null for optional fields
      const formattedData = {
        ...data,
        interestRate: data.interestRate === '' ? null : data.interestRate,
        creditLimit: data.creditLimit === '' ? null : data.creditLimit
      };

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      // Reset form and refresh data
      form.reset();
      router.refresh();
      router.push(dashboardRoutes.accounts.index);
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingTypes) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="md" center />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Account</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="My Checking Account" 
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
                    <FormLabel>Account Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Account Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Balance</FormLabel>
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
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Bank Name" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Last 4 digits only" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(accountType === 'SAVINGS' || accountType === 'INVESTMENT') && (
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
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
              )}

              {accountType === 'CREDIT' && (
                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Limit</FormLabel>
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
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader size="sm" className="mr-2" color="white" />
                    Saving
                  </span>
                ) : 'Add Account'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 