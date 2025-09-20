'use client';

import { useState, useEffect } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import Image from 'next/image';

export default function EyeSection() {
  const { scrollDirection } = useScrollDirection();
  const [eyeImage, setEyeImage] = useState('/eye-open.jpg');

  useEffect(() => {
    if (scrollDirection === 'up') {
      setEyeImage('/eye-close.jpg');
    } else if (scrollDirection === 'down') {
      setEyeImage('/eye-open.jpg');
    }
  }, [scrollDirection]);

  return (
    <section className="pb-16 bg-white flex justify-center">
      <Image
        src={eyeImage} 
        alt="Eye" 
        width={200}
        height={200}
        className="w-xs h-auto"
      />
    </section>
  );
}
