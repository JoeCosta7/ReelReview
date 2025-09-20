"use client"

import { Upload, Link, ArrowUp } from "lucide-react"
import { Button } from "@/components/Button"
import { useState } from "react"

export default function ReelReviewPage() {
  const [activeMode, setActiveMode] = useState<"link" | "video">("link")
  const [linkInput, setLinkInput] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col origin-top">
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="ml-3 text-2xl font-bold text-slate-800">ReelReview</span>
        </div>

        <div className="flex items-center gap-3">
          {/*<Button variant="outline" className="text-slate-600 hover:text-slate-800 font-medium">
            Log In
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-sm">Register</Button>*/}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 max-w-6xl mx-auto w-full text-center">
        <div className="mb-12">
          <h1 className="text-8xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tight">
            ReelReview
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Transform your lectures into engaging, bite-sized learning moments with AI-powered video processing
          </p>
        </div>

        <div className="max-w-7xl mb-12">
          <div className="flex items-center justify-center gap-4 text-base flex-wrap">
            <div className="flex items-center bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-200">
              <span className="text-xl mr-2">📹</span>
              <span className="font-semibold text-slate-700">Upload lecture</span>
            </div>
            <div className="text-blue-500 text-xl font-bold">→</div>
            <div className="flex items-center bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-200">
              <span className="text-xl mr-2">📁</span>
              <span className="font-semibold text-slate-700">We transcribe</span>
            </div>
            <div className="text-blue-500 text-xl font-bold">→</div>
            <div className="flex items-center bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-200">
              <span className="text-xl mr-2">✂️</span>
              <span className="font-semibold text-slate-700">AI finds moments</span>
            </div>
            <div className="text-blue-500 text-xl font-bold">→</div>
            <div className="flex items-center bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-200">
              <span className="text-xl mr-2">📱</span>
              <span className="font-semibold text-slate-700">Get reels</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex bg-white rounded-xl p-2 shadow-lg border border-slate-200">
            <Button
              variant={activeMode === "link" ? "primary" : "outline"}
              onClick={() => setActiveMode("link")}
              className={`px-8 py-3 rounded-lg transition-all font-medium ${
                activeMode === "link"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Link className="w-5 h-5 mr-2" />
              Insert Link
            </Button>
            <Button
              variant={activeMode === "video" ? "primary" : "outline"}
              onClick={() => setActiveMode("video")}
              className={`px-8 py-3 mr-2 rounded-lg transition-all font-medium ${
                activeMode === "video"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Upload className="w-5 h-5 ml-2" />
              Upload Video
            </Button>
          </div>

          {activeMode === "link" ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
              <div className="w-full bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Paste Your Video Link</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 py-4 px-4 text-base shadow-sm rounded-lg outline-none transition-all"
                  />
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 font-medium shadow-sm rounded-lg text-base"
                    disabled={!linkInput.trim()}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="w-full max-w-2xl h-48 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center bg-white/80 hover:bg-white hover:border-blue-400 transition-all cursor-pointer shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-slate-600 font-medium">Drop your video here or click to browse</p>
                <p className="text-sm text-slate-500 mt-1">Supports MP4, MOV, AVI and more</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm font-medium">
            © 2025 ReelReview. Transform your lectures into bite-sized learning moments.
          </p>
        </div>
      </footer>
    </div>
  )
}
