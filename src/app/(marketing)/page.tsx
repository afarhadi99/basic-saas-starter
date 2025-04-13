// src/app/(marketing)/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <>
      {/* Hero section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-ghibli-gradient">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Easy and Fast Supabase + Stripe Starter
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Use this for a quick start with Supabase and Stripe subscription payments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">View Plans</Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="hidden md:block absolute top-1/4 left-10 w-24 h-24 bg-primary/10 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="hidden md:block absolute bottom-1/4 right-10 w-32 h-32 bg-secondary/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="hidden md:block absolute top-1/2 right-1/4 w-16 h-16 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </section>
      
      {/* Features section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Inspired Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-xl p-6 bg-background-light border border-primary/20 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Magical Experience</h3>
              <p className="text-muted-foreground">
                Enjoy a seamless, delightful user experience designed with the same care and attention to detail.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="rounded-xl p-6 bg-background-light border border-secondary/20 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Your data is protected by industry-leading security practices, keeping your information as safe as a hidden forest sanctuary.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="rounded-xl p-6 bg-background-light border border-accent/20 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Time-Saving</h3>
              <p className="text-muted-foreground">
                Automate your workflow and save precious time, giving you more moments to appreciate the beauty around you.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of adventurers who have already discovered the magic of our platform. Start your free trial today.
          </p>
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
