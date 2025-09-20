import Image from 'next/image';

interface CCCLogoProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  src?: string;
}

export default function CCCLogo({ 
  width = 64, 
  height = 64, 
  className = '', 
  alt = 'LALALALA Logo',
  src = '/Logo1.png'
}: CCCLogoProps) {
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
