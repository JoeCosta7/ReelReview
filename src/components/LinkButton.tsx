'use client';

export default function LinkButton({ className, href, children }: { className: string, href: string, children: React.ReactNode }) {

    return (
        <button 
        onClick={() => window.open(href, '_blank')} 
        className={`inline-block bg-cornell-dark-brown text-white px-8 py-3 rounded-lg font-serif text-lg hover:scale-105 transition-all duration-200 ${className}`}
      >
        {children}
      </button>
    )
}