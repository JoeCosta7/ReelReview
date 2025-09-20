import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  src?: string;
}

export default function Logo({ 
  width = 64, 
  height = 64, 
  className = '', 
  alt = 'Logo',
  src = '/Logo1.png'
}: LogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority={false}
    />
  );
}
