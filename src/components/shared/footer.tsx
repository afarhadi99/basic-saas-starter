// src/components/shared/footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-ghibli-footer py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-lg font-semibold">
            Subscription<span className="text-primary">Starter</span>
            </Link>
            <p className="text-muted-foreground mt-2 text-sm">
              Lightweight Supabase and Stripe subscription starter
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
            <Link href="/pricing" className="hover:text-primary transition">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-primary transition">
              Login
            </Link>
            <Link href="/signup" className="hover:text-primary transition">
              Sign up
            </Link>
            <Link href="#" className="hover:text-primary transition">
              Terms
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            © {new Date().getFullYear()} Alisher Farhadi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
