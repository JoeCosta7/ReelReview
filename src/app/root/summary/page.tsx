"use client";

import { Upload, Link, ArrowUp } from "lucide-react";
import { Button } from "@/components/Button";
import { useState, useRef } from "react";
import VideoViewer from "@/components/VideoViewer";
import BulletPoint from "@/components/BulletPoint";
import ReelCard from "@/components/ReelCard";
import Image from "next/image";
import { useSession } from "@/app/contexts/SessionContext";
import { useEffect } from "react";

export default function WhatWeDo() {
  const { videoLink, reels, getReelVideoUrl } = useSession()
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    if (videoLink) {
      const embedUrl = videoLink.replace("watch?v=", "embed/");
      setCurrentVideoSrc(embedUrl);
    }
  }, [videoLink]);

  useEffect(() => {
    if (reels) {
      console.log(reels);
    }
  }, [reels]);

  const iframeRef = useRef<HTMLIFrameElement>(
    null
  ) as React.RefObject<HTMLIFrameElement>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col origin-top">
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="ml-3 text-2xl font-bold text-slate-800">
            ReelReview
          </span>
        </div>
      </header>

      <main>
        <div className="flex flex-row w-full justify-center items-start gap-8">
          <div
            style={{
              width: "30dvw",
              height: "85dvh",
              padding: "8px",
            }}
          >
            <VideoViewer
              src={currentVideoSrc}
              iframeRef={iframeRef}
            />
          </div>
          <div className="w-[60dvw] flex flex-col items-center justify-start">
            <div className="w-full flex justify-center items-center mb-8">
              <button className="mr-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              onClick={() => {
                const embedUrl = videoLink.replace("watch?v=", "embed/");
                setCurrentVideoSrc(embedUrl);
              }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Video
              </button>
              <span className="text-4xl font-bold text-slate-800 text-center">
                Generated Reels
              </span>
            </div>
            <div className="w-full px-8">
              {reels && reels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
                  {reels.map((reel, index) => {
                    const videoUrl = getReelVideoUrl(index);
                    return (
                      <ReelCard
                        key={index}
                        transcript={reel.transcript}
                        topics={reel.topics}
                        videoUrl={videoUrl || ''}
                        onPlay={() => {
                          if (videoUrl) {
                            setCurrentVideoSrc(videoUrl);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <div className="text-lg font-medium mb-2">No reels generated yet</div>
                  <div className="text-sm">Upload a video to generate reels</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/*
      <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm font-medium">
            © 2025 ReelReview. Transform your lectures into bite-sized learning
            moments.
          </p>
        </div>
      </footer>
      */}
    </div>
  );
}
