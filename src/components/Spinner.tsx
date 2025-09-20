import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600`}
          role="status"
          aria-label="Loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse`}></div>
      </div>
    </div>
  );
};

export default Spinner; 