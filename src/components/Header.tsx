'use client';

import { useScrollDirection } from '@/hooks/useScrollDirection';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';

export default function Header() {
  const { isVisible } = useScrollDirection();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isVisible) {
      setIsMobileMenuOpen(false);
    }
  }, [isVisible]);

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Reel Review
            </span>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="relative px-6 py-2.5 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 border-2 border-gray-300 hover:border-transparent font-semibold transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl overflow-hidden group"
              onClick={() => {}}
            >
              <span className="relative z-10">Log In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
