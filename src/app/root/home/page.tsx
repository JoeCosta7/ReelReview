"use client"

import { Upload, Link, ArrowUp, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/Button"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useState, useRef} from "react"
import { useRouter } from "next/navigation"

export default function ReelReviewPage() {
  const [activeMode, setActiveMode] = useState<"link" | "video">("link")
  const [linkInput, setLinkInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [linkValidation, setLinkValidation] = useState<{ isValid: boolean; message: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const validateLink = (url: string) => {
    if (!url.trim()) {
      setLinkValidation(null)
      return
    }

    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.toLowerCase()

      // Check for supported video platforms
      const supportedPlatforms = [
        "youtube.com",
        "www.youtube.com",
        "youtu.be",
        "vimeo.com",
        "www.vimeo.com",
        "dailymotion.com",
        "www.dailymotion.com",
        "twitch.tv",
        "www.twitch.tv",
        "facebook.com",
        "www.facebook.com",
      ]

      if (supportedPlatforms.some((platform) => domain.includes(platform))) {
        setLinkValidation({ isValid: true, message: "Valid video link detected!" })
      } else {
        setLinkValidation({ isValid: false, message: "Please enter a valid video platform URL" })
      }
    } catch {
      setLinkValidation({ isValid: false, message: "Please enter a valid URL" })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime", "video/x-msvideo"]
      if (validTypes.includes(file.type)) {
        setSelectedFile(file)
      } else {
        alert("Please select a valid video file (MP4, MOV, AVI)")
        event.target.value = ""
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async () => {
    if (activeMode === "link" && (!linkInput.trim() || !linkValidation?.isValid)) {
      return
    }
    if (activeMode === "video" && !selectedFile) {
      return
    }

    setIsProcessing(true)

    // Simulate processing time
    setTimeout(() => {
      router.push("/members")
    }, 2000)
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col origin-top">
        <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 max-w-6xl mx-auto w-full text-center">
        <div className="mb-12">
          <span className="text-7xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tight">
          ReelReview
          </span>
          <p className="text-xl  text-slate-600 font-bold max-w-2xl mx-auto leading-relaxed">
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
          <div className="flex bg-white rounded-xl p-2 mr-4 shadow-lg border border-slate-200">
            <Button
              variant={activeMode === "link" ? "primary" : "outline"}
              onClick={() => setActiveMode("link")}
              className={`px-8 py-3 mr-4 rounded-lg transition-all font-medium ${
                activeMode === "link"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Link className="w-5 h-5" />
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
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={linkInput}
                      onChange={(e) => {
                        setLinkInput(e.target.value)
                        validateLink(e.target.value)
                      }}
                      placeholder="https://youtube.com/watch?v=..."
                      className={`w-full bg-slate-50 border focus:ring-2 focus:ring-opacity-50 py-4 px-4 text-base shadow-sm rounded-lg outline-none transition-all ${
                        linkValidation?.isValid === false
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : linkValidation?.isValid === true
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    />
                    {linkValidation && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {linkValidation.isValid ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 font-medium shadow-sm rounded-lg text-base disabled:opacity-50"
                    disabled={!linkInput.trim() || !linkValidation?.isValid || isProcessing}
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowUp className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                {linkValidation && (
                  <p
                    className={`text-sm mt-3 text-center ${linkValidation.isValid ? "text-green-600" : "text-red-600"}`}
                  >
                    {linkValidation.message}
                  </p>
                )}
                <p className="text-sm text-slate-500 mt-3 text-center">
                  Supports YouTube, Vimeo, and most video platforms
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <div
                className="w-full max-w-2xl h-48 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center bg-white/80 hover:bg-white hover:border-blue-400 transition-all cursor-pointer shadow-sm"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-slate-800 font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600 font-medium">Drop your video here or click to browse</p>
                    <p className="text-sm text-slate-500 mt-1">Supports MP4, MOV, AVI and more</p>
                  </>
                )}
              </div>
              {selectedFile && (
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-medium shadow-sm rounded-lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Process Video
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        <div className="mt-16 w-full max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">See the Magic in Action</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Watch how ReelReview transforms a 60-minute lecture into engaging, shareable moments that capture the
                essence of your content
              </p>
            </div>

            <div className="flex flex-row gap-8 items-center justify-center">
              {/* Before box */}
              <div className="bg-white rounded-2xl p-3 shadow-lg border border-slate-200 w-80 h-96 flex flex-col">
                <div className="text-center mb-2">
                  <div className="inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold mb-1">
                    😴 Before: Traditional Lecture
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-1 flex-1 flex flex-col border border-slate-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm">▶️</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Advanced Physics Lecture</h4>
                        <p className="text-xs text-slate-600 font-medium">Duration: 1h 23m • 847 views</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-300 rounded-full h-2 mb-1 shadow-inner">
                    <div className="bg-slate-500 h-2 rounded-full w-1/4"></div>
                  </div>

                  <div className="bg-white/70 rounded-lg p-3 mb-3 border border-slate-200">
                    <h5 className="font-semibold text-slate-800 text-xs mb-2">Current Issues:</h5>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <span>Long, unstructured content</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <span>Hard to find key moments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <span>Low engagement rates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <span>Students lose focus easily</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-2 border border-red-200 flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-1">😴</div>
                      <p className="text-xs text-red-600 font-semibold">Low Engagement</p>
                      <p className="text-xs text-red-500">23% completion rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="text-6xl text-blue-500 font-bold">→</div>
              </div>

              {/* After box */}
              <div className="bg-white rounded-2xl p-3 shadow-lg border border-slate-200 w-80 h-96 flex flex-col">
                <div className="text-center mb-2">
                  <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-1">
                    🚀 After: Engaging Reels
                  </div>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  {[
                    { title: "Newton's Laws Explained", duration: "45s", views: "2.3K" },
                    { title: "Thermodynamics Principles", duration: "38s", views: "1.8K" },
                    { title: "Quantum Mechanics Basics", duration: "52s", views: "3.1K" },
                    { title: "Gauss' Law Simplified", duration: "41s", views: "2.7K" },
                  ].map((reel, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-xs">▶️</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-800 text-xs">{reel.title}</h5>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>⏱️ {reel.duration}</span>
                            <span>👀 {reel.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-green-600 space-y-0.5 bg-green-50 p-2 rounded-lg">
                  <p className="text-xs">✅ Bite-sized, focused content</p>
                  <p className="text-xs">✅ Key moments highlighted</p>
                  <p className="text-xs">✅ Higher engagement rates</p>
                  <p className="text-xs">✅ Easy to share & discover</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Content?</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Join thousands of educators and content creators who are already using ReelReview to make their
                  lectures more engaging and accessible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 text-blue-100">
                    <span className="text-xl">⚡</span>
                    <span className="text-sm">AI-powered processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <span className="text-xl">🎯</span>
                    <span className="text-sm">Smart moment detection</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <span className="text-xl">📱</span>
                    <span className="text-sm">Mobile-ready format</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        <Footer />
      </div>
      </main>
    </div>
    </div>
  )
}
