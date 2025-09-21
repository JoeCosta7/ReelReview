"use client";

import { Upload, Link, ArrowUp } from "lucide-react";
import { Button } from "@/components/Button";
import { useState, useRef, useEffect } from "react";
import VideoViewer from "@/components/VideoViewer";
import ReelCard from "@/components/ReelCard";
import { useSession } from "@/app/contexts/SessionContext";

export default function WhatWeDo() {
  const { videoLink, reels, getReelVideoUrl } = useSession();
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string | null>(null);

  // ✅ 選択されたカードを管理
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  const ICON_CLR_LIST = [
    "#1CB0F6", // bright sky blue
    "#13C4A3", // playful teal green
    "#FFB800", // sunny yellow-orange
    "#FF6B6B", // coral red
    "#845EC2", // fun violet purple
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col origin-top">
      <header className="relative w-full h-0">
        <div className="absolute top-10 left-10 flex items-center bg-white px-3 py-2 rounded-md shadow-sm">
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
              marginTop: "15dvh",
              width: "30dvw",
              top: "15dvh",
              height: "85dvh",
              padding: "8px",
            }}
          >
            <VideoViewer src={currentVideoSrc} iframeRef={iframeRef} />
          </div>

          <div className="w-[60dvw] flex flex-col items-center justify-start">
            <div className="w-full px-8">
              {reels && reels.length > 0 ? (
                <div className="flex flex-col gap-4 max-h-[100vh] overflow-y-auto hide-scrollbar">
                  {reels.map((reel, index) => {
                    const videoUrl = getReelVideoUrl(index);
                    return (
                      <div key={index} className="z-20">
                        {/* z-index 追加 */}
                        <ReelCard
                          transcript={reel.transcript}
                          topics={reel.topics}
                          videoUrl={videoUrl || ""}
                          onPlay={() => {
                            if (videoUrl) {
                              setCurrentVideoSrc(videoUrl);
                            }
                          }}
                          iconClr={ICON_CLR_LIST[index % ICON_CLR_LIST.length]}
                          selected={selectedIndex === index} // ✅ 選択判定
                          setSelected={() => setSelectedIndex(index)} // ✅ クリックで更新
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <div className="text-lg font-medium mb-2">
                    No reels generated yet
                  </div>
                  <div className="text-sm">
                    Upload a video to generate reels
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
