"use client"

import { Link, ArrowUp, CheckCircle, XCircle, Play, ArrowRight } from "lucide-react"
import { Button } from "@/components/Button"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ReelCard from "@/components/ReelCard"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/app/contexts/SessionContext"

export default function ReelReviewPage() {
  const { setVideoLink, setReels, setMainVideoTranscript } = useSession()
  const [linkInput, setLinkInput] = useState("")
  const [linkValidation, setLinkValidation] = useState<{ isValid: boolean; message: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  // Community reels data
  const communityReels = [
    {
      videoSrc: "/introduction_to_rectangular_matrices_and_multiple_solutions.mp4",
      title: "Introduction to Rectangular Matrices and Multiple Solutions",
      author: "Narayan Topalli",
      authorInitials: "NT",
      timeAgo: "2 hours ago",
      category: "Linear Algebra",
      categoryEmoji: "📚",
      gradientFrom: "from-blue-50",
      gradientTo: "to-indigo-100"
    },
    {
      videoSrc: "/michel_goemans_on_gilbert_strang_s_extraordinary_mit_career.mp4",
      title: "Michel Goemans on Gilbert Strang's Extraordinary MIT Career",
      author: "Jon Jones",
      authorInitials: "JJ",
      timeAgo: "5 hours ago",
      category: "MIT",
      categoryEmoji: "🎓",
      gradientFrom: "from-green-50",
      gradientTo: "to-emerald-100"
    },
    {
      videoSrc: "/pavel_grinfeld_on_the_importance_of_linear_algebra_and_strang_s_legacy.mp4",
      title: "Pavel Grinfeld on the Importance of Linear Algebra and Strang's Legacy",
      author: "Aaron Judge",
      authorInitials: "AJ",
      timeAgo: "1 day ago",
      category: "Linear Algebra",
      categoryEmoji: "📚",
      gradientFrom: "from-purple-50",
      gradientTo: "to-pink-100"
    },
    {
      videoSrc: "/row_rank_and_column_rank_theorem.mp4",
      title: "Row Rank and Column Rank Theorem",
      author: "Lionel Messi",
      authorInitials: "LM",
      timeAgo: "3 days ago",
      category: "Linear Algebra",
      categoryEmoji: "📚",
      gradientFrom: "from-orange-50",
      gradientTo: "to-red-100"
    },
    {
      videoSrc: "/michel_goemans_on_gilbert_strang_s_unique_teaching_style.mp4",
      title: "Michel Goemans on Gilbert Strang's Unique Teaching Style",
      author: "Sarah Chen",
      authorInitials: "SC",
      timeAgo: "1 week ago",
      category: "Teaching",
      categoryEmoji: "👨‍🏫",
      gradientFrom: "from-cyan-50",
      gradientTo: "to-blue-100"
    },
    {
      videoSrc: "/pavel_grinfeld_s_personal_reflection_on_gilbert_strang_s_influence.mp4",
      title: "Pavel Grinfeld's Personal Reflection on Gilbert Strang's Influence",
      author: "Michael Rodriguez",
      authorInitials: "MR",
      timeAgo: "2 weeks ago",
      category: "Personal Stories",
      categoryEmoji: "💭",
      gradientFrom: "from-yellow-50",
      gradientTo: "to-orange-100"
    }
  ]

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


  const handleReelLecture = async (videoUrl: string) => {
    setLinkInput(videoUrl)
    validateLink(videoUrl)
    
    // Wait a moment for validation to complete
    setTimeout(async () => {
      await handleSubmit(videoUrl)
    }, 100)
  }

  const handleSubmit = async (videoUrl?: string) => {
    const urlToProcess = videoUrl || linkInput
    if (!urlToProcess.trim()) {
      return
    }

    // If we have a videoUrl, we need to validate it first
    if (videoUrl) {
      try {
        const urlObj = new URL(videoUrl)
        const domain = urlObj.hostname.toLowerCase()
        const supportedPlatforms = [
          "youtube.com", "www.youtube.com", "youtu.be"
        ]
        
        if (!supportedPlatforms.some((platform) => domain.includes(platform))) {
          setLinkValidation({ isValid: false, message: "Please enter a valid video platform URL" })
          return
        }
      } catch {
        setLinkValidation({ isValid: false, message: "Please enter a valid URL" })
        return
      }
    } else if (!linkValidation?.isValid) {
      return
    }

    setIsProcessing(true)

    try {
      const link = urlToProcess.split("&list=")[0]

      setVideoLink(link)

      console.log(link)

      const response = await fetch("/api/getReels", {
        method: "POST",
        body: JSON.stringify({ link: link }),
      })

      if (!response.ok) {
        setLinkValidation({ isValid: false, message: "Failed to get reels" })
        setIsProcessing(false)
        return;
      }

      const data = await response.json()

      // Store the main video transcript
      setMainVideoTranscript(data.data.transcript)

      const clips = data.data.clips

      const reels = []
      for (const clip of clips) {
        // Convert base64 clip bytes to video blob
        let videoBlob: Blob | null = null;
        if (clip.clip_bytes) {
          const binaryString = atob(clip.clip_bytes);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          videoBlob = new Blob([bytes], { type: 'video/mp4' });
        }
        
        const reel = {
          transcript: clip.topic,
          topics: clip.summary,
          videoBlob: videoBlob!,
        }
        reels.push(reel)
      }

      setReels(reels)
      setIsProcessing(false)

      console.log("Redirecting to summary page...")
      router.push("/summary")
    } catch (error) {
      console.error("Error processing video:", error)
      setLinkValidation({ isValid: false, message: "An error occurred while processing the video" })
      setIsProcessing(false)
    }
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col origin-top mt-16">
        <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 max-w-6xl mx-auto w-full text-center">
        <div className="mb-6">
          <span className="text-7xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
          Reel Review
          </span>
          <p className="text-xl mt-4 text-slate-600 font-bold max-w-2xl mx-auto leading-relaxed">
            Transform your lectures into engaging, shareable, straight-to-the-point learning moments
          </p>
        </div>

        <div className="flex flex-col items-center w-full">
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
                  onClick={() => handleSubmit()}
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
                Supports YouTube videos currently
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl mb-12 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">R</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Reels From The Community
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityReels.map((reel, index) => (
                  <ReelCard
                    key={index}
                    videoSrc={reel.videoSrc}
                    title={reel.title}
                    author={reel.author}
                    authorInitials={reel.authorInitials}
                    timeAgo={reel.timeAgo}
                    category={reel.category}
                    categoryEmoji={reel.categoryEmoji}
                    gradientFrom={reel.gradientFrom}
                    gradientTo={reel.gradientTo}
                    onPlay={() => handleReelLecture(reel.videoSrc)}
                  />
                ))}
              </div>
            </div>
        </div>

        <div className="w-full max-w-6xl mt-2">
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

                <div className="space-y-4 flex-1 flex flex-col">
                  {[
                    { title: "Newton's Laws Explained", duration: "45s" },
                    { title: "Thermodynamics Principles", duration: "38s" },
                    { title: "Quantum Mechanics Basics", duration: "52s" },
                    { title: "Gauss' Law Simplified", duration: "41s"},
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

            <div className="mt-20 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Learning?</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Join those who are already using ReelReview to make
                  lecture content easier to process and share.
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
                    <span className="text-sm">Share with friends</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
      </div>
      </main>
    </div>
    <Footer />
    </div>
  )
}
