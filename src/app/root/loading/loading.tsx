'use client'

import { useEffect, useState } from "react";
import TopLoader from "nextjs-toploader";

export default async function Loading() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processingTime = 10000; // 10 seconds

  useEffect(() => {
    setProcessing(true);
    let startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / processingTime, 1); // normalize 0 -> 1

      // Custom easing: fast start, slow middle, fast end (easeInOutCubic-ish)
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      setProgress(eased * 100);

      if (t >= 1) {
        setProcessing(false);
        clearInterval(interval);
      }
    }, 16); // roughly 60fps

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* TopLoader with dynamic progress */}
      <TopLoader
        showSpinner={false}
        color="#3b82f6"
        speed={200}
      />

      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Processing Your Video
      </h1>
      <p className="text-gray-600">
        Please wait while we process your video...
      </p>
    </div>
  );
}


