// src/app/(auth)/login/page.tsx
import { LoginForm } from './login-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Card className="w-full ghibli-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
