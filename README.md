# Subscription Starter

A modern SaaS subscription starter template with Next.js, Supabase Auth, and Stripe integration.

![Subscription Starter Banner](https://img.mytsi.org/i/z8GY981.png)

## Overview

Subscription Starter is a complete boilerplate for building subscription-based SaaS applications. It includes user authentication, subscription management, and a beautiful UI - everything you need to launch your SaaS product quickly and efficiently.

## Tech Stack

This project leverages modern technologies for a performant and developer-friendly experience:

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with App Router and Server Components
- **Authentication & Database**: [Supabase](https://supabase.io/)
- **Payments & Subscriptions**: [Stripe](https://stripe.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation

## Features

- ✅ **User Authentication**: Sign up, login, and user profile management
- ✅ **Subscription Management**: Tiered pricing plans with monthly/yearly billing
- ✅ **Stripe Integration**: Secure payment processing with webhooks
- ✅ **Responsive Design**: Looks great on all devices
- ✅ **Dark Mode Support**: Light and dark theme options
- ✅ **TypeScript**: Type-safe code for better developer experience
- ✅ **Server Components**: Leverages Next.js 15 server components for improved performance
- ✅ **Row Level Security**: Secure database access with Supabase RLS

## Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm
- A [Supabase](https://supabase.com/) account
- A [Stripe](https://stripe.com/) account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/subscription-starter.git
cd subscription-starter
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory and add the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application URL (important for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

The project follows a modular structure using the Next.js App Router:

```
/src
  /app
    /(marketing) - Public marketing pages
      /page.tsx - Landing page
      /pricing/page.tsx - Pricing page
      /layout.tsx - Layout for marketing pages
    /(auth) - Authentication pages
      /login/
        /page.tsx - Login page
        /login-form.tsx - Login form component
      /signup/
        /page.tsx - Signup page
        /signup-form.tsx - Signup form component
      /layout.tsx - Layout for auth pages
      /auth/callback/route.ts - Auth callback handler
    /(app) - Auth-protected application pages
      /dashboard/page.tsx - User dashboard
      /account/
        /page.tsx - Account settings page
        /manage-subscription-button.tsx - Client component for subscription management
        /update-profile-form.tsx - Client component for profile updates
        /success-toast.tsx - Toast notification for successful payments
      /premium/page.tsx - Subscription-protected content
      /layout.tsx - Layout for app pages (includes auth check)
    /api - API routes
      /webhooks/stripe/route.ts - Stripe webhook handler
      /create-checkout-session/route.ts - Create checkout session endpoint
      /create-customer-portal/route.ts - Customer portal session endpoint
      /check-session-status/route.ts - Check Stripe session status endpoint
  /components
    /ui - Shadcn UI components
    /account - Account-related components
    /shared
      /navbar.tsx - Navigation bar component
      /footer.tsx - Footer component
    /pricing
      /pricing-client.tsx - Client component for pricing page
    /checkout
      /checkout-modal.tsx - Stripe checkout modal component
  /lib
    /actions - Server actions
      /auth.actions.ts - Authentication server actions
      /stripe.actions.ts - Stripe server actions
    /supabase
      /client.ts - Browser Supabase client
      /server.ts - Server Supabase client
      /middleware.ts - Auth middleware helper
      /admin.ts - Admin client with service role
      /subscriptions.ts - Subscription helper functions
    /stripe
      /client.ts - Stripe initialization
    /validators - Zod validation schemas
      /auth.ts - Authentication validators
    /config
      /pricing.ts - Pricing configuration
    /utils.ts - Utility functions
    /theme.ts - Theme configuration
  /middleware.ts - Next.js middleware for auth protection
  /types
    /db_types.ts - Database and entity type definitions
```

## Understanding Route Groups and Protection

This project uses Next.js App Router with three main route groups:

1. `(marketing)` - Public pages accessible to everyone
2. `(auth)` - Authentication pages for login and signup
3. `(app)` - Protected pages requiring authentication

### How Auth Protection Works

Auth protection is implemented at two levels:

1. **Route Group Layout**: The `(app)/layout.tsx` file checks for authentication and redirects unauthenticated users to login:

```tsx
// src/app/(app)/layout.tsx
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16 pb-8">
        {children}
      </main>
    </div>
  );
}
```

2. **Middleware**: The `middleware.ts` file in the root directory provides an additional layer of protection:

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};
```

The `updateSession` function checks authentication and redirects accordingly:

```typescript
// src/lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  // ...
  const protectedPaths = ['/dashboard', '/account', '/premium'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect unauthenticated users from protected routes to login
  if (!user && isProtectedPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  // ...
}
```

## How to Add New Pages

### Adding a Regular Auth-Protected Page

To add a new page that requires authentication:

1. Create a new file in the `(app)` route group:

```tsx
// src/app/(app)/new-page/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function NewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // The (app) layout already ensures user is authenticated,
  // so you can safely use the user object here
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">New Page</h1>
      <p>Welcome, {user.email}!</p>
      {/* Your page content */}
    </div>
  );
}
```

### Adding a Subscription-Protected Page

To add a page that requires an active subscription:

1. Create a new file in the `(app)` route group:

```tsx
// src/app/(app)/subscribers-only/page.tsx
import { createClient } from '@/lib/supabase/server';
import { isUserSubscribed } from '@/lib/supabase/subscriptions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function SubscribersOnlyPage() {
  const subscribed = await isUserSubscribed();
  
  // Show upgrade prompt if user isn't subscribed
  if (!subscribed) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Subscribers Only</CardTitle>
            <CardDescription>
              This content requires an active subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Upgrade your account to access this exclusive content.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // User is subscribed, show the content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Subscribers Only</h1>
      <p className="mb-6">Thank you for subscribing! Here's your exclusive content:</p>
      
      {/* Your exclusive content */}
      <div className="bg-primary/10 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Premium Feature</h2>
        <p>This is an example of premium content that only subscribers can see.</p>
      </div>
    </div>
  );
}
```

### Adding a Tier-Specific Protected Page

To restrict content to specific subscription tiers (e.g., Business tier only):

```tsx
// src/app/(app)/business-features/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionTier } from '@/lib/supabase/subscriptions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function BusinessFeaturesPage() {
  const tier = await getSubscriptionTier();
  
  // Only allow business tier users
  if (tier !== 'business') {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Business Plan Required</CardTitle>
            <CardDescription>
              This content requires a Business plan subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Your current plan: {tier.toUpperCase()}
            </p>
            <p className="text-muted-foreground mb-4">
              Upgrade to our Business plan to access these features.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/pricing">Upgrade Plan</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // User has business tier, show the content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Business Features</h1>
      <p className="mb-6">Welcome to the exclusive Business tier features!</p>
      
      {/* Business-specific content */}
    </div>
  );
}
```

## Customizing the UI

### Editing the Landing Page

To modify the landing page, edit the `src/app/(marketing)/page.tsx` file. This page uses client components and contains the hero section, features section, and call-to-action.

### Customizing the Pricing Page

1. Update pricing tiers and plans in `src/lib/config/pricing.ts`:

```typescript
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Essential features for individuals',
    features: [
      'Basic dashboard access',
      'Limited access to features',
      'Community support',
      // Add or modify features
    ],
    popular: false,
    pricing: {
      monthly: {
        priceId: null,
        amount: null,
      },
      yearly: {
        priceId: null,
        amount: null,
      },
    },
  },
  // Modify other tiers or add new ones
];
```

2. Ensure you update the `STRIPE_PRICE_IDS` in the same file with your actual Stripe price IDs.

3. The pricing page itself is in `src/app/(marketing)/pricing/page.tsx` and uses the client component `PricingClient` which you can customize.

### Modifying the Dashboard

Edit `src/app/(app)/dashboard/page.tsx` to change the dashboard layout, add new cards, or modify existing components.

## Setting up Supabase

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/) and create a new project
2. Note your project URL and API keys from the project settings
3. Add these to your `.env.local` file

### 2. Database Schema Setup

Run the following SQL in the Supabase SQL Editor to set up your database schema:

```sql
-- Create ENUM types for subscription status and pricing details
CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
CREATE TYPE public.pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE public.pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');

-- USERS Table: Stores public user profile information.
CREATE TABLE public.users (
 id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 full_name text,
 avatar_url text,
 billing_address jsonb,
 payment_method jsonb
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access." ON public.users FOR SELECT USING (true);
CREATE POLICY "Can update own user data." ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Can view own user data." ON public.users FOR SELECT USING (auth.uid() = id);

-- Function to automatically create a public user profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
 INSERT INTO public.users (id, full_name, avatar_url)
 VALUES (
   new.id,
   new.raw_user_meta_data->>'full_name',
   new.raw_user_meta_data->>'avatar_url'
 );
 RETURN new;
END;
$$;

-- Trigger the function after user creation
CREATE TRIGGER on_auth_user_created
 AFTER INSERT ON auth.users
 FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CUSTOMERS Table: Maps Supabase auth users to Stripe customer IDs.
CREATE TABLE public.customers (
 id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 stripe_customer_id text UNIQUE
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- PRODUCTS Table: Stores product information synced from Stripe.
CREATE TABLE public.products (
 id text PRIMARY KEY, -- Stripe Product ID
 active boolean,
 name text,
 description text,
 image text,          -- Stripe Product Image URL
 metadata jsonb
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access." ON public.products FOR SELECT USING (true);

-- PRICES Table: Stores price information synced from Stripe.
CREATE TABLE public.prices (
 id text PRIMARY KEY, -- Stripe Price ID
 product_id text REFERENCES public.products(id) ON DELETE CASCADE,
 active boolean,
 description text,
 unit_amount bigint, -- Amount in cents/smallest currency unit
 currency text CHECK (char_length(currency) = 3),
 type public.pricing_type,
 interval public.pricing_plan_interval,
 interval_count integer,
 trial_period_days integer,
 metadata jsonb
);
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access." ON public.prices FOR SELECT USING (true);

-- SUBSCRIPTIONS Table: Stores user subscription information synced from Stripe.
CREATE TABLE public.subscriptions (
 id text PRIMARY KEY, -- Stripe Subscription ID
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 status public.subscription_status,
 metadata jsonb,
 price_id text REFERENCES public.prices(id),
 quantity integer,
 cancel_at_period_end boolean,
 created timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
 current_period_start timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
 current_period_end timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
 ended_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
 cancel_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
 canceled_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
 trial_start timestamp with time zone DEFAULT timezone('utc'::text, now()),
 trial_end timestamp with time zone DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Can view own subscription data." ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
```

### 3. Authentication Settings

1. Go to Authentication > URL Configuration
2. Set Site URL to your application URL (e.g., `http://localhost:3000` for development)
3. Add a redirect URL: `http://localhost:3000/auth/callback` (add your production URL as well when deploying)
4. Configure email templates if desired

## Setting up Stripe

### 1. Create Stripe Products and Prices

1. Log in to the [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to Products > Add Product
3. Create your product tiers (e.g., Pro, Business)
4. For each product, add pricing plans:
   - Create both monthly and yearly plans if needed
   - Set the appropriate prices
   - Note the Price IDs (e.g., `price_1234567890`) for each plan

### 2. Configure Stripe Webhook

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add an endpoint with your webhook URL:
   - For production: `https://your-domain.com/api/webhooks/stripe`
   - For local development, use Stripe CLI (see below)
3. Select events to listen for:
   - `product.created`, `product.updated`
   - `price.created`, `price.updated`
   - `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.paid`, `invoice.payment_succeeded`
4. After creating the endpoint, get your Webhook Signing Secret and add it to your `.env.local` file

### 3. Update Price IDs in Config

Open `src/lib/config/pricing.ts` and update the price IDs with your actual Stripe price IDs:

```typescript
// src/lib/config/pricing.ts
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: 'price_1234567890', // Replace with actual Pro monthly price ID
  PRO_YEARLY: 'price_0987654321',  // Replace with actual Pro yearly price ID
  BUSINESS_MONTHLY: 'price_2468101214', // Replace with actual Business monthly price ID
  BUSINESS_YEARLY: 'price_1357911131', // Replace with actual Business yearly price ID
};
```

### 4. Local Development with Stripe CLI

To test webhooks locally:

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Log in:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```
4. The CLI will output a webhook signing secret. Add this to your `.env.local` file as `STRIPE_WEBHOOK_SECRET`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abcdefghijklm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (keep secret) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | `pk_test_123456789` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (keep secret) | `sk_test_123456789` |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook signing secret | `whsec_123456789` |
| `NEXT_PUBLIC_SITE_URL` | Your application URL | `http://localhost:3000` |

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Sign up for [Vercel](https://vercel.com) and import your repository
3. Set the environment variables in the Vercel dashboard
4. Deploy the project

After deployment, update your Supabase and Stripe configurations with your production URL:
1. Update the Site URL and redirect URLs in Supabase Auth settings
2. Update the webhook endpoint URL in Stripe
3. Update the `NEXT_PUBLIC_SITE_URL` environment variable

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Stripe](https://stripe.com/)
- [Shadcn UI](https://ui.shadcn.com/)