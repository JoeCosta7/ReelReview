"use client"

import { useState, useRef, useEffect } from "react"

interface ReelCardProps {
  videoSrc: string
  title: string
  author: string
  authorInitials: string
  timeAgo: string
  category: string
  categoryEmoji: string
  gradientFrom: string
  gradientTo: string
  onPlay?: () => void
}

export default function ReelCard({
  videoSrc,
  title,
  author,
  authorInitials,
  timeAgo,
  category,
  categoryEmoji,
  gradientFrom,
  gradientTo,
  onPlay
}: ReelCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [duration, setDuration] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleLoadedMetadata = () => {
        if (video.duration && !isNaN(video.duration)) {
          setDuration(formatTime(video.duration))
        }
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      
      // If metadata is already loaded
      if (video.duration && !isNaN(video.duration)) {
        setDuration(formatTime(video.duration))
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [videoSrc])

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleShare = () => {
    setIsShared(!isShared)
  }

  const handlePlay = () => {
    if (onPlay) {
      onPlay()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className={`aspect-[9/12] bg-gradient-to-br ${gradientFrom} ${gradientTo} relative overflow-hidden`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
          onClick={handlePlay}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium">
          {categoryEmoji} {category}
        </div>
        {duration && (
          <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm font-semibold">
            {duration}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-full flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{authorInitials}</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">{author}</p>
              <p className="text-xs text-gray-500">{timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <button 
              onClick={handleLike}
              className={`hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
            >
              <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={handleShare}
              className={`hover:text-blue-500 transition-colors ${isShared ? 'text-blue-500' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight flex-1">
          {title}
        </h3>
      </div>
    </div>
  )
}