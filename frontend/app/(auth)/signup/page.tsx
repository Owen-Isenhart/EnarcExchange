/**
 * Signup Page
 */

'use client';

import { use, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SignupSchema, type SignupForm } from '@/utils/validators';
import { ZodError } from 'zod';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const { addNotification } = useUiStore();
  const [formData, setFormData] = useState<SignupForm>({
    email: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = SignupSchema.parse(formData);
      signup(validated, {
        onSuccess: () => {
          router.push('/dashboard');
        },
      });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <Input
              label="Username"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/70">
            Already have an account?{' '}
            <Link href="/login" className="text-[#154734] hover:text-[#154734]/80">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
