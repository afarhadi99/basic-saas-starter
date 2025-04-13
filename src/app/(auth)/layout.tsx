// src/app/(auth)/layout.tsx
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ghibli-gradient">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Link href="/" className="absolute top-8 left-8 text-lg font-semibold">
          Subscription<span className="text-primary">Starter</span>
        </Link>
        
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      
      <div className="p-4 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Alisher Farhadi. All rights reserved.
        </p>
      </div>
    </div>
  );
}
