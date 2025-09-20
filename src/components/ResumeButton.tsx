'use client';

import downloadResumeTemplate from "@/actions/downloadResumeTemplate";

export default function ResumeButton({ className, children }: { className: string, children: React.ReactNode }) {

  const handleDownload = async () => {
    const result = await downloadResumeTemplate();
    if (result.success) {
      const url = result.url;
      if (url) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'Resume_Guide_2024.pdf';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
    }
  }

    return (
      <button 
        onClick={() => handleDownload()} 
        className={`inline-block bg-cornell-dark-brown text-white px-8 py-3 rounded-lg font-serif text-lg hover:scale-105 transition-all duration-200 ${className}`}
      >
        {children}
      </button>
    )
}