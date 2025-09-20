'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MiddleProgressBar() {
  const [progress, setProgress] = useState(0);
  const processingTime = 30000; 

  useEffect(() => {
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / processingTime, 1);

    // EaseInOutCubic: fast start, slow middle, fast end
    const eased = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    setProgress(eased * 100);

    if (elapsed < processingTime) {
      requestAnimationFrame(animate); // schedule next frame
    } else {
      // redirect when done
      window.location.href = "/what-we-do";
    }
  };

  requestAnimationFrame(animate);

  // No cleanup needed because rAF stops when t >= 1
}, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Processing Your Reels 
      </h1>

      {/* Progress bar container */}
      <div className="w-full max-w-xl h-6 bg-gray-300 rounded-full overflow-hidden">
        {/* Progress bar */}
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-16 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="mt-4 text-gray-600">{Math.round(progress)}%</p>
    </div>
  );
}