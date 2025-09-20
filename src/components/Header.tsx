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
    <>
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center h-32">
            {/* Logo: left on lg, centered on mobile */}
            <div
              className="flex items-center absolute left-1/2 -translate-x-1/2 lg:static lg:left-0 lg:translate-x-0 hover:scale-105 transition-all duration-200"
              onClick={() => router.push('/home')}
            >
              <CCCLogo width={96} height={96} />
            </div>

            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex w-max items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {navigationLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => router.push(link.href)}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`relative text-gray-800 hover:text-blue-900 transition-colors duration-200 font-serif text-lg ${
                    isActiveLink(link.href) ? 'text-gray-900' : ''
                  }`}
                >
                  {link.name}
                  {(isActiveLink(link.href)) && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-black"></div>
                  )}
                  {(!isActiveLink(link.href) && hoveredLink === link.href) && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-900"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Right Logo */}
            <div className="hidden lg:flex items-center">
              <CCCLogo width={144} height={144} src="/Logo2.png" />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden flex items-center justify-center w-8 h-8 absolute right-4"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-full h-0.5 bg-gray-700 transition-transform duration-200 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}></div>
                <div className={`w-full h-0.5 bg-gray-700 transition-opacity duration-200 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}></div>
                <div className={`w-full h-0.5 bg-gray-700 transition-transform duration-200 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}></div>
              </div>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}>
            <div className="py-4 space-y-2 border-t border-gray-200">
              {navigationLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    router.push(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-gray-800 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 font-serif text-base ${
                    isActiveLink(link.href) ? 'text-gray-900 bg-gray-50' : ''
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-32 md:h-32"></div>
    </>
  );
}
