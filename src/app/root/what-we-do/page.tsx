"use client";

import { Upload, Link, ArrowUp } from "lucide-react";
import { Button } from "@/components/Button";
import { useState, useRef } from "react";
import VideoViewer from "@/components/VideoViewer";
import BulletPoint from "@/components/BulletPoint";
import Image from "next/image";

export default async function WhatWeDo() {
  const [activeMode, setActiveMode] = useState<"link" | "video">("link");
  const [linkInput, setLinkInput] = useState("");

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
              position: "relative",
            }}
          >
            <VideoViewer
              src="https://www.youtube.com/embed/fCZXuSeyuPA"
              iframeRef={iframeRef}
            />
          </div>
          <div className="w-[60dvw] flex flex-col items-center justify-center">
            <div className="w-full flex justify-center items-center mb-4">
              <span className="text-4xl font-bold text-slate-800 text-center">
                Summary from the lecture
              </span>
            </div>
            <div
              className="w-full flex flex-wrap items-start gap-4 ml-20"
              style={{
                maxHeight: "80dvh",
                overflowY: "auto",
              }}
            >
              <BulletPoint
                thumbSrc="https://img.youtube.com/vi/YRFCGzhhHKw/default.jpg"
                title={"Why ReelReview?"}
                buttonText={"Watch"}
                onButtonClick={() => {
                  iframeRef.current.src =
                    "https://www.youtube.com/embed/YRFCGzhhHKw";
                }}
              />
              <BulletPoint
                thumbSrc="https://www.youtube.com/embed/OYtr9uxKJJg"
                title={"How YouTubers overreact to everything"}
                buttonText={"Watch"}
                onButtonClick={() => {
                  iframeRef.current.src =
                    "https://www.youtube.com/embed/5eSiFN9pr1o";
                }}
              />
              <BulletPoint
                thumbSrc="https://www.youtube.com/embed/rksDFrc93X0"
                title={"Steph Curry is goated"}
                buttonText={"Watch"}
                onButtonClick={() => {
                  iframeRef.current.src =
                    "https://www.youtube.com/embed/3HKEp7IF4jY";
                }}
              />
              <BulletPoint
                thumbSrc="https://www.youtube.com/embed/rksDFrc93X0"
                title={"Steph Curry is goated"}
                buttonText={"Watch"}
                onButtonClick={() => {
                  iframeRef.current.src =
                    "https://www.youtube.com/embed/3HKEp7IF4jY";
                }}
              />
              <BulletPoint
                thumbSrc="https://www.youtube.com/embed/rksDFrc93X0"
                title={"Steph Curry is goated"}
                buttonText={"Watch"}
                onButtonClick={() => {
                  iframeRef.current.src =
                    "https://www.youtube.com/embed/3HKEp7IF4jY";
                }}
              />
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
