'use client';

import { useScrollDirection } from '@/hooks/useScrollDirection';
import CCCLogo from './CCCLogo';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
//TODO
  const navigationLinks = [
    { name: 'Home', href: '/home' },
    { name: 'What We Do', href: '/what-we-do' },
    { name: 'Executive Board', href: '/members' },
    { name: 'Resources', href: '/gallery' },
    { name: 'Apply', href: '/apply' },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="ml-3 text-2xl font-bold text-slate-800">ReelReview</span>
        </div>

        <div className="flex items-center gap-3">
          {/*<Button variant="outline" className="text-slate-600 hover:text-slate-800 font-medium">
            Log In
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-sm">Register</Button>*/}
        </div>
      </header>
  );
}
