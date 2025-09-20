import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      // Determine scroll direction
      if (scrollY > lastScrollY) {
        setScrollDirection('down');
        setIsVisible(false);
      } else if (scrollY < lastScrollY) {
        setScrollDirection('up');
        setIsVisible(true);
      }
      
      // Show header when at top
      if (scrollY <= 10) {
        setIsVisible(true);
      }
      
      setScrollY(scrollY);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrollDirection, scrollY, isVisible };
} 