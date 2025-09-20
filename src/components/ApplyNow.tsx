'use client';

import { useRouter } from "next/navigation";

export default function ApplyNow() {
    const router = useRouter();

    return (
        <button 
        onClick={() => router.push('/apply')} 
        className="inline-block bg-cornell-dark-brown text-white px-8 py-3 rounded-lg font-serif text-lg hover:scale-105 transition-all duration-200"
      >
        Apply Now
      </button>
    )
}