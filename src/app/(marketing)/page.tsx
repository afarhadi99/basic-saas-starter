// src/app/(marketing)/page.tsx
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import { Users } from 'lucide-react'
import { GlowingEffect } from '@/components/ui/glowing-effect'; // Adjust path as needed
// Add this import at the top with your other imports
import { NBAChatbot } from '@/components/nba-chatbot';



// Animated Counter Component - Fixed TypeScript errors
const AnimatedCounter = ({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '',
  decimals = 0,
  separator = ','
}: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
  decimals?: number;
  separator?: string;
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reset and start animation when entering viewport
          setCount(0);
          setIsVisible(true);
        } else {
          // Stop animation and reset when leaving viewport
          setIsVisible(false);
          setCount(0);
          if (animationFrameRef.current !== undefined) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
          }
        }
      },
      { 
        threshold: 0.3, // Trigger when 30% of element is visible
        rootMargin: '-50px 0px -50px 0px' // Add some margin for better UX
      }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        // Easing function for stock-ticker effect (fast start, slow end)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeOut * end);
        
        // Add some randomness during animation for stock-ticker feel
        const randomOffset = progress < 0.8 ? Math.random() * (end * 0.1) : 0;
        setCount(Math.min(currentCount + randomOffset, end));
        
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        animationFrameRef.current = undefined;
      }
    };

    // Small delay before starting animation for better visual effect
    const timeoutId = setTimeout(() => {
      if (isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, end, duration]);

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    if (separator && num >= 1000) {
      return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    return fixed;
  };

  return (
    <div ref={counterRef} className="animated-counter">
      {prefix}{formatNumber(count)}{suffix}
    </div>
  );
};

export default function BettingBuddyLandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleCardFlip = (cardIndex: number) => {
    setFlippedCards(prev => 
      prev.includes(cardIndex) 
        ? prev.filter(i => i !== cardIndex)
        : [...prev, cardIndex]
    );
  };

  return (
    <>
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0,255,255,0.1) 0%, transparent 50%),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-gradient-to-r from-green-400 via-cyan-500 to-blue-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 min-h-screen flex items-center pt-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                {/* CYBERPUNK TERMINAL BADGE */}
                <div className="terminal-badge">
                  <div className="terminal-header">
                    <div className="terminal-buttons">
                      <span className="terminal-button red"></span>
                      <span className="terminal-button yellow"></span>
                      <span className="terminal-button green"></span>
                    </div>
                    <span className="terminal-title">neural_network.exe</span>
                  </div>
                  <div className="terminal-content">
                    <div className="typing-text">
                      <span className="text-green-400">{'>'}</span> 
                      <span className="text-cyan-400">Initializing AI...</span>
                      <span className="cursor">|</span>
                    </div>
                    <div className="typing-text" style={{ animationDelay: '1s' }}>
                      <span className="text-green-400">{'>'}</span> 
                      <span className="text-yellow-400">Processing 50,000+ data points...</span>
                    </div>
                    <div className="typing-text" style={{ animationDelay: '2s' }}>
                      <span className="text-green-400">{'>'}</span> 
                      <span className="text-green-400">STATUS: ONLINE</span>
                    </div>
                  </div>
                </div>

                {/* GLITCH TEXT HEADLINES */}
                <div className="space-y-6">
                  <h2 className="glitch-text-container">
                    <span className="glitch-text glitch-text-orange" data-text="69% WIN RATE">
                      70% WIN RATE
                    </span>
                    <span className="glitch-text glitch-text-white" data-text="NBA AI">
                      NBA AI
                    </span>
                    <span className="glitch-text glitch-text-neon" data-text="PREDICTIONS">
                      PREDICTIONS
                    </span>
                  </h2>
                  
                  <div className="space-y-6 mt-12">
  <h2 className="text-3xl lg:text-4xl font-bold text-white">
    Want better sports bets?
  </h2>
  
  <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
    We use <span className="text-orange-400 font-semibold">powerful AI</span> and years of NBA analytics to give you smarter picks with{" "}
    <span className="line-through text-gray-500">guesswork</span>{" "}
    <span className="text-green-400 font-semibold">results</span>.
  </p>
  
  <p className="text-lg text-gray-400">
    Our predictions beat the average. <span className="text-white font-bold">Stop guessing. Start winning.</span>
  </p>
  
  <div className="pt-6">
    <Link href="/signup">
      <Button className="group relative bg-gradient-to-r from-red-500 via-purple-500 to-blue-600 hover:from-red-600 hover:via-purple-600 hover:to-blue-700 text-white px-10 py-6 text-2xl font-black rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 overflow-hidden">
        <span className="relative z-10 flex items-center gap-3">
          <Users className="w-6 h-6" />
          BUDDY UP TODAY!
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Button>
    </Link>
  </div>
</div>


                </div>
              </div>

              {/* Right Content - 3D Basketball Scene */}
              <div className="relative lg:block hidden">
                <div className="relative bg-black/50 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden">
                  {/* Scene Header */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-white font-bold text-lg glitch-text-small" data-text="AI Basketball Analysis">AI Basketball Analysis</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-orange-400 text-sm">Scanning Court</span>
                    </div>
                  </div>

                  {/* 3D Basketball Scene Container */}
                  <div className="relative h-80 mb-6">
                    {/* 3D Basketball */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 basketball-container">
                      <div className="basketball">
                        <div className="basketball-lines">
                          <div className="line horizontal-1"></div>
                          <div className="line horizontal-2"></div>
                          <div className="line vertical-1"></div>
                          <div className="line vertical-2"></div>
                          <div className="line arc-1"></div>
                          <div className="line arc-2"></div>
                        </div>
                        <div className="basketball-shadow"></div>
                      </div>
                    </div>

                    {/* Floating Data Points */}
                    <div className="absolute top-8 left-8 floating-stat-1">
                      <div className="bg-orange-500/20 border border-orange-500/40 rounded-xl px-4 py-2 backdrop-blur-sm">
                        <div className="text-orange-400 text-sm font-bold">Field Goal %</div>
                        <div className="text-white text-lg font-black">47.3%</div>
                      </div>
                    </div>

                    <div className="absolute top-16 right-12 floating-stat-2">
                      <div className="bg-blue-500/20 border border-blue-500/40 rounded-xl px-4 py-2 backdrop-blur-sm">
                        <div className="text-blue-400 text-sm font-bold">3PT %</div>
                        <div className="text-white text-lg font-black">38.1%</div>
                      </div>
                    </div>

                    <div className="absolute bottom-20 left-16 floating-stat-3">
                      <div className="bg-green-500/20 border border-green-500/40 rounded-xl px-4 py-2 backdrop-blur-sm">
                        <div className="text-green-400 text-sm font-bold">Win Prob</div>
                        <div className="text-white text-lg font-black">69.2%</div>
                      </div>
                    </div>

                    <div className="absolute bottom-12 right-8 floating-stat-4">
                      <div className="bg-purple-500/20 border border-purple-500/40 rounded-xl px-4 py-2 backdrop-blur-sm">
                        <div className="text-purple-400 text-sm font-bold">O/U</div>
                        <div className="text-white text-lg font-black">228.5</div>
                      </div>
                    </div>

                    {/* Particle Effects */}
                    <div className="absolute inset-0 particles">
                      <div className="particle particle-1"></div>
                      <div className="particle particle-2"></div>
                      <div className="particle particle-3"></div>
                      <div className="particle particle-4"></div>
                      <div className="particle particle-5"></div>
                      <div className="particle particle-6"></div>
                    </div>

                    {/* Court Lines Background */}
                    <div className="absolute inset-0 court-bg opacity-10">
                      <svg width="100%" height="100%" viewBox="0 0 400 300" className="text-orange-400">
                        <defs>
                          <pattern id="court-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <rect width="40" height="40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#court-pattern)"/>
                        <circle cx="200" cy="150" r="60" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <rect x="50" y="50" width="300" height="200" rx="20" fill="none" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>

                  {/* AI Analysis Display */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-orange-400 text-sm font-semibold">🏀 NEXT GAME PREDICTION</span>
                      <span className="text-green-400 text-sm glitch-text-small" data-text="72.4% Confidence">72.4% Confidence</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold text-lg">LAL</div>
                        <div className="text-white text-xl font-black">-3.5</div>
                        <div className="text-xs text-gray-400">EV: +0.14</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-400 text-2xl">🏀</div>
                        <div className="text-gray-400 text-sm">VS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 font-bold text-lg">GSW</div>
                        <div className="text-white text-xl font-black">+3.5</div>
                        <div className="text-xs text-gray-400">EV: -0.09</div>
                      </div>
                    </div>
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-bold">🎯 AI Pick: LAL -3.5</span>
                        <span className="text-green-400 font-bold">Kelly: 4.8%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Tech Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60 blur-xl animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full opacity-40 blur-xl animate-pulse [animation-delay:1s]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="live-demo" className="py-32 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-8">
              <span className="text-green-400">🎯</span>
              <span className="text-green-400 font-medium">Live AI Predictions in Action</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-6">
              Watch Our AI
              <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                WORK IN REAL-TIME
              </span>
            </h2>
          </div>

          {/* Interactive Flip Cards - Live Performance Stats */}
          <div className="grid grid-cols-2 gap-6 py-6 max-w-4xl mx-auto mb-20">
            {/* Card 1 - Moneyline Accuracy */}
            <div className="flip-card h-32" onClick={() => toggleCardFlip(0)}>
              <div className={`flip-card-inner ${flippedCards.includes(0) ? 'flipped' : ''}`}>
                <div className="flip-card-front bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-3xl font-black text-green-400 mb-1">69.2%</div>
                    <div className="text-sm text-gray-400">Moneyline Accuracy</div>
                    <div className="text-xs text-green-300 mt-1">+2.1% this month</div>
                  </div>
                </div>
                <div className="flip-card-back bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-green-400 font-bold text-lg mb-2">Moneyline Accuracy</div>
                    <div className="text-gray-300 text-sm">Predicts which team wins outright. 69.2% means we correctly pick the winner in 7 out of 10 games.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Under/Over Accuracy */}
            <div className="flip-card h-32" onClick={() => toggleCardFlip(1)}>
              <div className={`flip-card-inner ${flippedCards.includes(1) ? 'flipped' : ''}`}>
                <div className="flip-card-front bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-3xl font-black text-blue-400 mb-1">55.7%</div>
                    <div className="text-sm text-gray-400">Under/Over Accuracy</div>
                    <div className="text-xs text-blue-300 mt-1">+1.8% this month</div>
                  </div>
                </div>
                <div className="flip-card-back bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-blue-400 font-bold text-lg mb-2">Under/Over Accuracy</div>
                    <div className="text-gray-300 text-sm">Predicts total points scored. 55.7% beats the 52.4% needed to overcome betting juice.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Expected Value */}
            <div className="flip-card h-32" onClick={() => toggleCardFlip(2)}>
              <div className={`flip-card-inner ${flippedCards.includes(2) ? 'flipped' : ''}`}>
                <div className="flip-card-front bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-3xl font-black text-purple-400 mb-1">+EV</div>
                    <div className="text-sm text-gray-400">Expected Value</div>
                    <div className="text-xs text-purple-300 mt-1">Calculated Live</div>
                  </div>
                </div>
                <div className="flip-card-back bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-purple-400 font-bold text-lg mb-2">Expected Value</div>
                    <div className="text-gray-300 text-sm">Mathematical edge over bookmakers. +EV means profitable bets over time.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 - Kelly Criterion */}
            <div className="flip-card h-32" onClick={() => toggleCardFlip(3)}>
              <div className={`flip-card-inner ${flippedCards.includes(3) ? 'flipped' : ''}`}>
                <div className="flip-card-front bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-3xl font-black text-orange-400 mb-1">Kelly</div>
                    <div className="text-sm text-gray-400">Criterion Ready</div>
                    <div className="text-xs text-orange-300 mt-1">Auto Bankroll</div>
                  </div>
                </div>
                <div className="flip-card-back bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="text-orange-400 font-bold text-lg mb-2">Kelly Criterion</div>
                    <div className="text-gray-300 text-sm">Optimal bet sizing formula. Maximizes growth while minimizing bankruptcy risk.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Performance Showcase WITH ANIMATED NUMBERS + GLOWING EFFECT */}
<div className="mt-20 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 relative">
  {/* Add GlowingEffect */}
  <GlowingEffect
    disabled={false}
    proximity={200}
    spread={30}
    blur={2}
    glow={true}
    movementDuration={1.5}
    borderWidth={2}
    className="rounded-3xl"
  />
  
  <div className="text-center mb-12">
    <h3 className="text-3xl font-bold text-white mb-4">16 Seasons of Proven Performance</h3>
    <p className="text-gray-300 text-lg">From 2007-08 season to present, our AI has been battle-tested</p>
  </div>
  
  <div className="grid md:grid-cols-4 gap-8 text-center">
    <div className="group relative">
      {/* Individual card glowing effect */}
      <GlowingEffect
        disabled={false}
        proximity={150}
        spread={25}
        blur={1}
        glow={true}
        movementDuration={1}
        borderWidth={1}
        className="rounded-2xl"
      />
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 relative z-10">
        <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
          <AnimatedCounter 
            end={13847} 
            duration={2500} 
            separator="," 
          />
        </div>
        <div className="text-gray-400 text-lg">Games Analyzed</div>
        <div className="text-green-400 text-sm mt-1">Since 2007-08</div>
      </div>
    </div>
    
    <div className="group relative">
      <GlowingEffect
        disabled={false}
        proximity={150}
        spread={25}
        blur={1}
        glow={true}
        movementDuration={1}
        borderWidth={1}
        className="rounded-2xl"
      />
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 relative z-10">
        <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
          <AnimatedCounter 
            end={9574} 
            duration={2300} 
            separator="," 
          />
        </div>
        <div className="text-gray-400 text-lg">Correct Predictions</div>
        <div className="text-blue-400 text-sm mt-1">Moneyline Winners</div>
      </div>
    </div>
    
    <div className="group relative">
      <GlowingEffect
        disabled={false}
        proximity={150}
        spread={25}
        blur={1}
        glow={true}
        movementDuration={1}
        borderWidth={1}
        className="rounded-2xl"
      />
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 relative z-10">
        <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
          <AnimatedCounter 
            end={142} 
            duration={2800} 
            prefix="+" 
            suffix="%" 
          />
        </div>
        <div className="text-gray-400 text-lg">ROI Following Kelly</div>
        <div className="text-purple-400 text-sm mt-1">16-Season Average</div>
      </div>
    </div>
    
    <div className="group relative">
      <GlowingEffect
        disabled={false}
        proximity={150}
        spread={25}
        blur={1}
        glow={true}
        movementDuration={1}
        borderWidth={1}
        className="rounded-2xl"
      />
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 relative z-10">
        <div className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
          <AnimatedCounter 
            end={89.7} 
            duration={2600} 
            suffix="%" 
            decimals={1} 
          />
        </div>
        <div className="text-gray-400 text-lg">Profitable Seasons</div>
        <div className="text-orange-400 text-sm mt-1">14 of 16 seasons</div>
      </div>
    </div>
  </div>
</div>
        </div>
      </section>

      {/* Advanced Features Showcase */}
      <section id="features" className="py-32 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-8">
              <span className="text-blue-400">⚡</span>
              <span className="text-blue-400 font-medium">Advanced Neural Network Technology</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-6">
              The Science Behind
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                OUR PREDICTIONS
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Neural Network Feature */}
            <div className="group relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <span className="text-4xl">🧠</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Neural Network AI</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Our deep learning model processes team data from the 2007-08 season to present, 
                matched with historical odds to predict winning bets with industry-leading accuracy.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-400 font-semibold">16 seasons of training data</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-400 font-semibold">50,000+ variables per game</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-cyan-400 font-semibold">Real-time model updates</span>
                </div>
              </div>
            </div>

            {/* Expected Value Calculator */}
            <div className="group relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Expected Value Engine</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Every prediction comes with calculated expected value for team moneylines, 
                giving you mathematical insight into the profitability of each bet.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 font-semibold">Real-time EV calculations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-400 font-semibold">Profit probability analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-cyan-400 font-semibold">Market inefficiency detection</span>
                </div>
              </div>
            </div>

            {/* Kelly Criterion Integration */}
            <div className="group relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Kelly Criterion Optimizer</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Automatic bankroll management using the Kelly Criterion. Get the optimal bet size 
                or use our conservative 50% recommendation for safer long-term growth.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-orange-400 font-semibold">Optimal bet sizing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400 font-semibold">Risk-adjusted recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400 font-semibold">Bankroll protection built-in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accuracy Breakdown Section */}
      <section className="py-32 bg-gradient-to-r from-gray-900/10 via-black to-gray-900/10 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-6">
              Proven Track Record
              <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                BY THE NUMBERS
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Accuracy Charts */}
            <div className="space-y-8">
              {/* Moneyline Accuracy */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Moneyline Predictions</h3>
                    <p className="text-gray-400">Industry-leading accuracy rate</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-green-400">69.2%</div>
                    <div className="text-sm text-gray-400">Last 500 games</div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full w-[69%] relative">
                    <div className="absolute right-0 top-0 h-4 w-4 bg-white rounded-full transform translate-x-2"></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Under/Over Accuracy */}
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Under/Over Predictions</h3>
                    <p className="text-gray-400">Consistently profitable over time</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-blue-400">55.7%</div>
                    <div className="text-sm text-gray-400">Last 500 games</div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                  <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-4 rounded-full w-[56%] relative">
                    <div className="absolute right-0 top-0 h-4 w-4 bg-white rounded-full transform translate-x-2"></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="space-y-6">
              <div className="bg-black/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">Why Our Numbers Matter</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Long-term Profitability</h4>
                      <p className="text-gray-300 text-sm">69% accuracy on moneylines translates to consistent profits when combined with proper bankroll management.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Edge Over Market</h4>
                      <p className="text-gray-300 text-sm">Even 55% accuracy on totals provides mathematical edge when odds are typically 52.4% implied probability.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Conservative Approach</h4>
                      <p className="text-gray-300 text-sm">Our recommendation to bet 50% of Kelly Criterion reduces variance while maintaining profitability.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-8">
              <span className="text-green-400">💎</span>
              <span className="text-green-400 font-medium">Access Professional AI Predictions</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-6">
              Choose Your
              <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                WINNING PLAN
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Start with our proven 69% moneyline accuracy and 55% under/over performance
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Starter Plan */}
            <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-600/50 hover:border-orange-500/50 transition-all duration-500 hover:transform hover:scale-105 group">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-4">
                  <span className="text-orange-400 text-sm font-bold">🏀 ROOKIE</span>
                </div>
                <div className="text-6xl font-black text-white mb-4">
                  $29<span className="text-2xl text-gray-400">/mo</span>
                </div>
                <p className="text-gray-400">Perfect for beginners ready to start winning</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">5 daily AI predictions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Expected value calculations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Basic Kelly Criterion</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✗</span>
                  </div>
                  <span className="text-gray-500">Live chat support</span>
                </div>
              </div>

              <Link href="/signup?plan=rookie">
                <Button className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-orange-500 hover:to-orange-600 text-white py-4 text-lg font-bold rounded-2xl transition-all duration-300 group-hover:shadow-lg">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Pro Plan - Featured */}
            <div className="relative bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-orange-500 transform scale-105 shadow-2xl shadow-orange-500/20">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-full text-sm font-black shadow-lg">
                  🔥 MOST POPULAR
                </div>
              </div>

              <div className="text-center mb-8 pt-4">
                <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 rounded-full px-4 py-2 mb-4">
                  <span className="text-orange-400 text-sm font-bold">⭐ ALL-STAR</span>
                </div>
                <div className="text-6xl font-black text-white mb-4">
                  $69<span className="text-2xl text-gray-400">/mo</span>
                </div>
                <p className="text-gray-300">For serious bettors seeking maximum profits</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white font-medium">Unlimited AI predictions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white font-medium">Advanced EV analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white font-medium">Full Kelly Criterion suite</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white font-medium">Live confidence updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white font-medium">Priority support</span>
                </div>
              </div>

              <Link href="/signup?plan=allstar">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 text-lg font-black rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  🚀 UNLOCK 69% ACCURACY
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/50 hover:border-purple-500 transition-all duration-500 hover:transform hover:scale-105 group">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-4">
                  <span className="text-purple-400 text-sm font-bold">👑 LEGEND</span>
                </div>
                <div className="text-6xl font-black text-white mb-4">
                  $149<span className="text-2xl text-gray-400">/mo</span>
                </div>
                <p className="text-gray-400">Professional-grade AI predictions</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Everything in All-Star</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Neural network insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">Custom bet strategies</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">1-on-1 strategy calls</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-300">VIP community access</span>
                </div>
              </div>

              <Link href="/signup?plan=legend">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 text-lg font-bold rounded-2xl transition-all duration-300 group-hover:shadow-lg">
                  Join Elite Circle
                </Button>
              </Link>
            </div>
          </div>

          {/* Guarantee */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-8 py-4">
              <span className="text-3xl">🛡️</span>
              <div className="text-left">
                <div className="text-green-400 font-bold text-lg">30-Day Performance Guarantee</div>
                <div className="text-gray-400 text-sm">If our AI doesn't outperform market odds, full refund</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="py-32 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-6">
              Real Bettors,
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                REAL RESULTS
              </span>
            </h2>
            <p className="text-xl text-gray-300">See how our 69% accuracy transforms bankrolls</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="group bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-500 hover:transform hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-2xl">
                  M
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl">Marcus Johnson</h4>
                  <p className="text-yellow-400 text-sm font-medium">+$47,329 following Kelly Criterion</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                "The neural network predictions are unreal. I've never seen anything close to 69% accuracy. 
                Following the Kelly recommendations exactly, I'm up huge this season."
              </p>
              <div className="flex text-yellow-400 text-xl">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="group bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-500 hover:transform hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center font-black text-white text-2xl">
                  S
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl">Sarah Chen</h4>
                  <p className="text-green-400 text-sm font-medium">+$23,847 using conservative approach</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                "I bet 50% of Kelly recommendations and it's been perfect. The expected value calculations 
                show exactly why each bet makes sense. Mathematical betting finally works."
              </p>
              <div className="flex text-yellow-400 text-xl">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="group bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:transform hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center font-black text-white text-2xl">
                  D
                </div>
                <div>
                  <h4 className="text-white font-bold text-xl">David Rodriguez</h4>
                  <p className="text-purple-400 text-sm font-medium">+$89,442 over 16 months</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                "16 seasons of training data shows. The AI caught patterns I never could. 
                This isn't gambling - it's data science applied to basketball."
              </p>
              <div className="flex text-yellow-400 text-xl">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-r from-orange-500 via-red-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl lg:text-7xl font-black text-white mb-8">
            Start Your
            <span className="block">70% WIN STREAK</span>
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-4xl mx-auto">
            Join the data revolution. Get neural network predictions, expected value calculations, 
            and Kelly Criterion optimization. Your mathematical edge starts today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 px-12 py-6 text-xl font-black rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                🧠 ACCESS AI PREDICTIONS
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-white/90 text-lg max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>69% Moneyline Accuracy</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>16 Seasons of Data</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Kelly Criterion Built-in</span>
            </div>
          </div>
        </div>
      </section>

{/* Add NBA Chatbot - floating button */}
      <NBAChatbot />
      
      {/* CSS Styles for Cyberpunk Effects + 3D Basketball + Flip Cards + Animated Numbers */}
      <style jsx>{`
        /* ANIMATED COUNTER STYLES */
        .animated-counter {
          font-variant-numeric: tabular-nums;
          font-feature-settings: 'tnum';
        }

        /* FLIP CARD STYLES */
        .flip-card {
          perspective: 1000px;
          cursor: pointer;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }

        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }

        /* TERMINAL BADGE */
        .terminal-badge {
          display: inline-block;
          background: rgba(0,0,0,0.9);
          border: 1px solid rgba(0,255,255,0.5);
          border-radius: 8px;
          overflow: hidden;
          font-family: 'Courier New', monospace;
          box-shadow: 0 0 20px rgba(0,255,255,0.3);
          margin-bottom: 2rem;
        }

        .terminal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(40,40,40,0.9);
          padding: 8px 12px;
          border-bottom: 1px solid rgba(0,255,255,0.3);
        }

        .terminal-buttons {
          display: flex;
          gap: 6px;
        }

        .terminal-button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .terminal-button.red { background: #ff5f56; }
        .terminal-button.yellow { background: #ffbd2e; }
        .terminal-button.green { background: #27ca3f; }

        .terminal-title {
          color: rgba(255,255,255,0.8);
          font-size: 12px;
        }

        .terminal-content {
          padding: 12px;
          background: rgba(0,0,0,0.8);
        }

        .typing-text {
          display: block;
          font-size: 12px;
          margin-bottom: 4px;
          opacity: 0;
          animation: type-in 0.5s ease-in forwards;
        }

        .cursor {
          animation: blink 1s infinite;
        }

        .pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #ff0000;
          border-radius: 50%;
          margin-left: 8px;
          animation: pulse 1s infinite;
        }

        @keyframes type-in {
          to { opacity: 1; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* GLITCH TEXT EFFECTS */
        .glitch-text-container {
          position: relative;
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.1;
          margin: 0;
        }

        .glitch-text {
          position: relative;
          display: block;
          animation: glitch 2s infinite;
        }

        .glitch-text-orange {
          background: linear-gradient(45deg, #ff4500, #ff1493, #8a2be2);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .glitch-text-white {
          color: #fff;
        }

        .glitch-text-neon {
          background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 20px rgba(0,255,255,0.5);
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-text::before {
          animation: glitch-1 0.5s infinite;
          color: #ff00ff;
          z-index: -1;
        }

        .glitch-text::after {
          animation: glitch-2 0.5s infinite;
          color: #00ffff;
          z-index: -2;
        }

        .glitch-text-small {
          position: relative;
        }

        .glitch-text-small::before {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 2px;
          color: #ff00ff;
          z-index: -1;
          animation: glitch-small 0.3s infinite;
        }

        .glitch-number {
          position: relative;
        }

        .glitch-number::before {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 1px;
          color: #ff00ff;
          z-index: -1;
          animation: number-glitch 0.5s infinite;
        }

        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(2px, -2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(-2px, 2px); }
        }

        @keyframes glitch-small {
          0%, 100% { opacity: 1; transform: translate(0); }
          50% { opacity: 0.8; transform: translate(1px, -1px); }
        }

        @keyframes number-glitch {
          0%, 100% { opacity: 1; transform: translate(0); }
          50% { opacity: 0.7; transform: translate(1px, -1px); }
        }

        /* 3D Basketball Styles */
        .basketball-container {
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .basketball {
          width: 120px;
          height: 120px;
          position: relative;
          transform-style: preserve-3d;
          animation: basketballSpin 8s linear infinite;
        }

        .basketball::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            #ff8c42 0%,
            #ff6b1a 30%,
            #e55100 60%,
            #bf360c 100%);
          box-shadow: 
            inset -20px -20px 40px rgba(0,0,0,0.3),
            inset 20px 20px 40px rgba(255,255,255,0.1),
            0 0 60px rgba(255,140,66,0.4);
        }

        .basketball-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .line {
          position: absolute;
          background: #2c1810;
          border-radius: 2px;
        }

        .horizontal-1 {
          top: 50%;
          left: 10%;
          width: 80%;
          height: 3px;
          transform: translateY(-50%);
        }

        .horizontal-2 {
          top: 30%;
          left: 15%;
          width: 70%;
          height: 2px;
          transform: translateY(-50%) rotateZ(15deg);
        }

        .vertical-1 {
          left: 50%;
          top: 10%;
          width: 3px;
          height: 80%;
          transform: translateX(-50%);
        }

        .vertical-2 {
          left: 30%;
          top: 15%;
          width: 2px;
          height: 70%;
          transform: translateX(-50%) rotateZ(15deg);
        }

        .arc-1 {
          top: 20%;
          left: 20%;
          width: 60%;
          height: 60%;
          border: 2px solid #2c1810;
          border-radius: 50%;
          background: transparent;
        }

        .arc-2 {
          top: 25%;
          left: 25%;
          width: 50%;
          height: 50%;
          border: 2px solid #2c1810;
          border-radius: 50%;
          background: transparent;
        }

        .basketball-shadow {
          position: absolute;
          bottom: -140px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 20px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: shadowPulse 8s ease-in-out infinite;
        }

        /* Floating Stats Animations */
        .floating-stat-1 {
          animation: float1 6s ease-in-out infinite;
        }

        .floating-stat-2 {
          animation: float2 6s ease-in-out infinite 1s;
        }

        .floating-stat-3 {
          animation: float3 6s ease-in-out infinite 2s;
        }

        .floating-stat-4 {
          animation: float4 6s ease-in-out infinite 3s;
        }

        /* Particle Effects */
        .particles {
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ff8c42;
          border-radius: 50%;
          opacity: 0.6;
        }

        .particle-1 {
          top: 20%;
          left: 30%;
          animation: particleFloat1 4s ease-in-out infinite;
        }

        .particle-2 {
          top: 60%;
          right: 25%;
          animation: particleFloat2 5s ease-in-out infinite 1s;
        }

        .particle-3 {
          bottom: 30%;
          left: 20%;
          animation: particleFloat3 6s ease-in-out infinite 2s;
        }

        .particle-4 {
          top: 40%;
          right: 40%;
          animation: particleFloat1 3s ease-in-out infinite 1.5s;
        }

        .particle-5 {
          top: 80%;
          left: 60%;
          animation: particleFloat2 4.5s ease-in-out infinite 0.5s;
        }

        .particle-6 {
          top: 10%;
          left: 70%;
          animation: particleFloat3 5.5s ease-in-out infinite 2.5s;
        }

        /* Keyframe Animations */
        @keyframes basketballSpin {
          0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          25% {
            transform: rotateX(90deg) rotateY(90deg) rotateZ(90deg);
          }
          50% {
            transform: rotateX(180deg) rotateY(180deg) rotateZ(180deg);
          }
          75% {
            transform: rotateX(270deg) rotateY(270deg) rotateZ(270deg);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
          }
        }

        @keyframes shadowPulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateX(-50%) scale(1.2);
            opacity: 0.6;
          }
        }

        @keyframes float1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-10px) translateX(5px); }
          66% { transform: translateY(5px) translateX(-3px); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(8px) translateX(-5px); }
          66% { transform: translateY(-12px) translateX(3px); }
        }

        @keyframes float3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-8px) translateX(-3px); }
          66% { transform: translateY(10px) translateX(5px); }
        }

        @keyframes float4 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(12px) translateX(3px); }
          66% { transform: translateY(-6px) translateX(-5px); }
        }

        @keyframes particleFloat1 {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) scale(1.5);
            opacity: 0.8;
          }
        }

        @keyframes particleFloat2 {
          0%, 100% { 
            transform: translateX(0px) scale(1);
            opacity: 0.4;
          }
          50% { 
            transform: translateX(15px) scale(1.2);
            opacity: 0.7;
          }
        }

        @keyframes particleFloat3 {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.5;
          }
          50% { 
            transform: translateY(-15px) translateX(-10px) scale(1.3);
            opacity: 0.9;
          }
        }

        /* Court background styling */
        .court-bg {
          background: linear-gradient(45deg, 
            rgba(255,140,66,0.05) 0%, 
            rgba(255,107,26,0.03) 50%, 
            rgba(229,81,0,0.02) 100%);
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 1024px) {
          .glitch-text-container {
            font-size: 3rem;
          }
        }

        @media (max-width: 768px) {
          .glitch-text-container {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </>
  );
}
