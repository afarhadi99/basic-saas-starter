// src/components/shared/navbar.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types/db_types';
import { LogOut, Settings, User as UserIcon, Home, Crown, DollarSign, BarChart3, MessageCircle } from 'lucide-react';
import { logout } from '@/lib/actions/auth.actions';

interface NavItem {
  name: string;
  url: string;
  icon: any;
}

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  const isMarketing = pathname === '/' || pathname === '/pricing';
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUser(data);
      }
      
      setLoading(false);
    }
    
    getUser();
  }, []);

  // Set active tab based on current pathname
  useEffect(() => {
    if (pathname === '/') setActiveTab('Home');
    else if (pathname === '/pricing') setActiveTab('Pricing');
    else if (pathname === '/chat') setActiveTab('NBA Chat');
    else if (pathname === '/dashboard') setActiveTab('Dashboard');
    else if (pathname === '/premium') setActiveTab('Premium');
  }, [pathname]);

  // Define navigation items based on user state and current page
  const getNavItems = (): NavItem[] => {
    if (isMarketing) {
      return [
        { name: 'Home', url: '/', icon: Home },
        { name: 'NBA Chat', url: '/chat', icon: MessageCircle },
        { name: 'Pricing', url: '/pricing', icon: DollarSign },
      ];
    } else {
      return [
        { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
        { name: 'NBA Chat', url: '/chat', icon: MessageCircle },
        { name: 'Premium', url: '/premium', icon: Crown },
      ];
    }
  };

  const navItems = getNavItems();

  const AnimatedNavBar = ({ items }: { items: NavItem[] }) => (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;

        return (
          <Link
            key={item.name}
            href={item.url}
            onClick={() => setActiveTab(item.name)}
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
              "text-gray-300 hover:text-white",
              isActive && "text-white",
            )}
          >
            <span className="hidden md:inline">{item.name}</span>
            <span className="md:hidden">
              <Icon size={18} strokeWidth={2.5} />
            </span>
            {isActive && (
              <motion.div
                layoutId="lamp"
                className="absolute inset-0 w-full bg-white/10 rounded-full -z-10"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-t-full">
                  <div className="absolute w-12 h-6 bg-orange-500/20 rounded-full blur-md -top-2 -left-2" />
                  <div className="absolute w-8 h-6 bg-red-500/20 rounded-full blur-md -top-1" />
                  <div className="absolute w-4 h-4 bg-orange-500/20 rounded-full blur-sm top-0 left-2" />
                </div>
              </motion.div>
            )}
          </Link>
        );
      })}
    </div>
  );
  
  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 py-6",
      isMarketing 
        ? "bg-black/80 backdrop-blur-md border-b border-black" 
        : "bg-black/90 backdrop-blur-md border-b border-black"
    )}>
      <div className="container flex items-center justify-between mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
              <Image 
                src="/logo.png"
                alt="Betting Buddy Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            BETTING BUDDY
          </span>
        </Link>
        
        {/* Animated Navigation */}
        <div className="flex items-center">
          <AnimatedNavBar items={navItems} />
        </div>
        
        {/* User Actions */}
        <div className="flex items-center gap-4">
          {isMarketing ? (
            // Marketing navigation
            <>
              {!loading && user ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg">Sign up</Button>
                  </Link>
                </>
              )}
            </>
          ) : (
            // Authenticated navigation - User dropdown only
            <>
              {!loading && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ''} alt={user.full_name || 'User'} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white">{user.full_name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 border-black">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.full_name && <p className="font-medium text-white">{user.full_name}</p>}
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-black" />
                    <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/10">
                      <Link href="/account" className="w-full flex justify-between items-center">
                        Account <Settings className="h-4 w-4" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-white/10">
                      <form action={logout} className="w-full">
                        <button type="submit" className="w-full flex justify-between items-center">
                          Logout <LogOut className="h-4 w-4" />
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
