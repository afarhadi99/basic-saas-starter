# Subscription Starter

A modern SaaS subscription starter template with Next.js, Supabase Auth, and Stripe integration.

![Subscription Starter Banner](/screenshot.png)

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
- **Toast Notifications**: [Sonner](https://sonner.emilkowal.ski/)
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
    /(marketing) - Public pages (landing, pricing)
      /page.tsx - Landing page
      /pricing/page.tsx - Pricing page
    /(auth) - Authentication pages
      /login/page.tsx - Login page
      /signup/page.tsx - Signup page
      /auth/callback/route.ts - Auth callback handler
    /(app) - Authenticated application pages
      /dashboard/page.tsx - User dashboard
      /account/page.tsx - Account settings
      /premium/page.tsx - Premium content (subscription protected)
    /api - API routes
      /webhooks/stripe/route.ts - Stripe webhook handler
      /create-checkout-session/route.ts - Create checkout session endpoint
      /create-customer-portal/route.ts - Create customer portal endpoint
  /components
    /ui - Shadcn UI components
    /shared - Shared components (navbar, footer, etc.)
  /lib
    /supabase
      /client.ts - Browser client
      /server.ts - Server client
      /middleware.ts - Auth middleware helper
      /admin.ts - Admin client with service role
      /subscriptions.ts - Subscription helpers
    /stripe
      /client.ts - Stripe initialization
    /actions - Server actions
    /validators - Zod validation schemas
    /config - Application configuration
    /utils - Utility functions
  /middleware.ts - Next.js middleware for auth protection
  /types - TypeScript type definitions
```

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

