"use client";

import { Upload, Link, ArrowUp } from "lucide-react";
import { Button } from "@/components/Button";
import { useState, useRef } from "react";
import VideoViewer from "@/components/VideoViewer";
import BulletPoint from "@/components/BulletPoint";
import SkillTree from "@/components/SkillTree";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useSession } from "@/app/contexts/SessionContext";
import { useEffect } from "react";

export default function WhatWeDo() {
  const { videoLink, reels, getReelVideoUrl, mainVideoTranscript } = useSession()
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState<number | null>(null);
  const [isQAMode, setIsQAMode] = useState(false);

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

  useEffect(() => {
    if (isQAMode) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    }
  }, [isQAMode]);

  const iframeRef = useRef<HTMLIFrameElement>(
    null
  ) as React.RefObject<HTMLIFrameElement>;

  return (
    <div className="summary-container min-h-screen flex flex-col">
      {!isQAMode && <Header />}

      <main className={`flex-1 overflow-hidden transition-all duration-300 ${isQAMode ? 'pt-0 pb-0' : 'pt-20 pb-20'}`}>
        <div className={`flex flex-col lg:flex-row w-full h-full transition-all duration-300 ${isQAMode ? 'px-2' : 'px-4 lg:px-6'}`}>
          <div
            className={`${isQAMode ? 'w-full' : 'w-full lg:w-1/2'} h-full flex-shrink-0`}
            style={{
              height: isQAMode ? "100vh" : "calc(100vh - 80px)",
              minHeight: isQAMode ? "100vh" : "400px",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <div className="instagram-card bg-gradient-to-br from-pink-100/80 to-orange-100/80 rounded-2xl shadow-xl border-2 border-purple-300/60 overflow-hidden h-full mt-2 backdrop-blur-sm">
              <VideoViewer
                src={currentVideoSrc}
                iframeRef={iframeRef}
                title={currentReelIndex !== null && reels[currentReelIndex] ? reels[currentReelIndex].transcript : undefined}
                summary={currentReelIndex !== null && reels[currentReelIndex] ? reels[currentReelIndex].topics : undefined}
                mainTranscript={mainVideoTranscript}
                isMainVideo={currentReelIndex === null && !!currentVideoSrc && currentVideoSrc.includes('embed/')}
                onQAModeChange={setIsQAMode}
                videoBlob={currentReelIndex !== null && reels[currentReelIndex] ? reels[currentReelIndex].videoBlob : undefined}
                videoUrl={currentVideoSrc || undefined}
              />
            </div>
          </div>
          
          {!isQAMode && (
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-start lg:pl-6 pt-4 lg:pt-0">
              <div 
                className="w-full h-full"
                style={{
                  height: isQAMode ? "100vh" : "calc(100vh - 80px)",
                  minHeight: isQAMode ? "100vh" : "400px",
                }}
              >
                {reels && reels.length > 0 ? (
                  <div className="instagram-card bg-gradient-to-br from-orange-100/80 to-yellow-100/80 rounded-2xl shadow-xl border-2 border-purple-300/60 p-4 h-full overflow-hidden mt-2 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-200/60">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold text-gray-800">Your Reels</h2>
                        <div className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                          <span className="text-xs font-medium text-purple-600">{reels.length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="skill-tree-container">
                      <div className="content-wrapper">
                        <SkillTree
                          reels={reels}
                          getReelVideoUrl={getReelVideoUrl}
                          onReelPlay={(index, videoUrl) => {
                            setCurrentVideoSrc(videoUrl);
                            setCurrentReelIndex(index);
                          }}
                          onOriginalVideoPlay={() => {
                            const embedUrl = videoLink.replace("watch?v=", "embed/");
                            setCurrentVideoSrc(embedUrl);
                            setCurrentReelIndex(null);
                          }}
                          selectedIndex={currentReelIndex}
                          isOriginalVideoSelected={currentReelIndex === null && !!currentVideoSrc && currentVideoSrc.includes('embed/')}
                          originalVideoTitle="Original Video"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="instagram-card bg-gradient-to-br from-pink-100/80 to-orange-100/80 rounded-2xl shadow-xl border-2 border-purple-300/60 p-8 flex flex-col items-center justify-center h-64 mt-2 backdrop-blur-sm">
                    <div className="story-highlight mb-4">
                      <div className="story-highlight-inner">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-700 mb-2">
                      No reels generated yet
                    </div>
                    <div className="text-sm text-gray-500 text-center max-w-xs">
                      Upload a video to generate personalized reels
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
