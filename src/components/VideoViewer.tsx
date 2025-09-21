import React, { useState, useRef, useEffect } from "react";
import TranscriptQA from "./TranscriptQA";
import { MessageCircle, X, Share2, Download, Twitter, Linkedin, Instagram } from "lucide-react";
import { shareReelViaSocial, downloadReelVideo, ShareData } from "@/utils/shareUtils";

interface VideoViewerProps {
  src: string | null;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  poster?: string;
  title?: string;
  summary?: string;
  mainTranscript?: any[];
  isMainVideo?: boolean;
  onQAModeChange?: (isQAMode: boolean) => void;
  videoBlob?: Blob;
  videoUrl?: string;
}

export default function VideoViewer({
  src,
  iframeRef,
  poster,
  title,
  summary,
  mainTranscript,
  isMainVideo,
  onQAModeChange,
  videoBlob,
  videoUrl,
}: VideoViewerProps) {
  const [highlightedSegment, setHighlightedSegment] = useState<number | null>(null);
  const [showQA, setShowQA] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const transcriptRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const handleHighlightSegment = (segmentIndex: number) => {
    setHighlightedSegment(segmentIndex);
    // Clear highlight after 5 seconds
    setTimeout(() => {
      setHighlightedSegment(null);
    }, 5000);
  };

  const handleScrollToSegment = (segmentIndex: number) => {
    const element = transcriptRefs.current[segmentIndex];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Notify parent component when Q&A mode changes
  useEffect(() => {
    if (onQAModeChange) {
      onQAModeChange(showQA && (isMainVideo ?? false));
    }
  }, [showQA, isMainVideo, onQAModeChange]);


  const handleSocialShare = (platform: 'twitter' | 'linkedin' | 'instagram') => {
    if (!title || !summary) return;
    
    const shareData: ShareData = {
      title,
      text: summary,
      url: videoUrl,
    };
    shareReelViaSocial(shareData, platform as 'twitter' | 'linkedin' | 'instagram');
    setShowShareMenu(false);
  };

  const handleDownload = () => {
    if (videoBlob && title) {
      downloadReelVideo(videoBlob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`);
    }
    setShowShareMenu(false);
  };
  return (
    <div
      className="flex flex-col lg:flex-row"
      style={{
        width: "100%",
        height: showQA && isMainVideo ? "100%" : "100%",
        gap: "16px",
        background: "#fff",
        borderRadius: showQA && isMainVideo ? "0px" : "8px",
        margin: showQA && isMainVideo ? "0px" : "0px",
        overflow: "hidden",
        boxShadow: showQA && isMainVideo ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Left side - Video/Iframe */}
      <div
        className="video-container w-full lg:w-1/2 relative"
        style={{
          flex: "0 0 auto",
          background: "#000",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {!src ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">No video selected</div>
              <div className="text-sm">Click on a reel to play it</div>
            </div>
          </div>
        ) : src.startsWith('blob:') ? (
          <video
            src={src}
            controls
            style={{
              aspectRatio: "16/9",
              width: "100%",
              height: "auto",
              maxHeight: "100%",
              borderRadius: "8px",
              background: "#000",
            }}
          />
        ) : (
          <iframe
            src={src}
            ref={iframeRef}
            style={{
              aspectRatio: "16/9",
              width: "100%",
              height: "auto",
              maxHeight: "100%",
              borderRadius: "8px",
              background: "#000",
            }}
          />
        )}
        
        {/* Share button overlay - only show for reels (not main video) */}
        {src && !isMainVideo && title && summary && (
          <div className="absolute top-4 right-4">
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 font-semibold text-sm"
                title="Share reel"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              
              {showShareMenu && (
                <div ref={shareMenuRef} className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-2">
                    {videoBlob && (
                      <button
                        onClick={handleDownload}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Video
                      </button>
                    )}
                    
                    {videoBlob && <div className="border-t border-gray-200 my-1"></div>}
                    
                    <button
                      onClick={() => handleSocialShare('twitter')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Twitter className="w-4 h-4 text-blue-500" />
                      Share on Twitter
                    </button>
                    
                    <button
                      onClick={() => handleSocialShare('linkedin')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      Share on LinkedIn
                    </button>
                    
                    <button
                      onClick={() => handleSocialShare('instagram')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 rounded-md transition-colors"
                    >
                      <Instagram className="w-4 h-4 text-pink-500" />
                      Share on Instagram
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right side - Title and Summary */}
      <div
        className="w-full lg:w-1/2"
        style={{
          flex: "1",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          overflow: "auto",
        }}
      >
        {isMainVideo && mainTranscript && mainTranscript.length > 0 ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Header Section */}
            <div style={{ marginBottom: "20px" }}>              
              {/* Ask Questions Button - Prominent Position */}
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                marginBottom: "16px" 
              }}>
                <button
                  onClick={() => setShowQA(!showQA)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    backgroundColor: showQA ? "#ef4444" : "#8b5cf6",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                    minWidth: "140px",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = showQA ? "#dc2626" : "#7c3aed";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(139, 92, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = showQA ? "#ef4444" : "#8b5cf6";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.3)";
                  }}
                >
                  {showQA ? (
                    <>
                      <X className="w-5 h-5" />
                      Close QA
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Ask A Question
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {showQA ? (
              <div style={{ flex: "1", display: "flex", gap: "20px", height: "calc(100% - 80px)" }}>
                <div style={{ flex: "1", height: "100%", minHeight: "400px" }}>
                  <TranscriptQA
                    transcript={mainTranscript}
                    onHighlightSegment={handleHighlightSegment}
                    onScrollToSegment={handleScrollToSegment}
                  />
                </div>
                <div
                  style={{
                    flex: "1",
                    fontSize: "16px",
                    color: "#4b5563",
                    lineHeight: "1.6",
                    height: "100%",
                    overflowY: "auto",
                    paddingRight: "8px",
                    borderLeft: "1px solid #e5e7eb",
                    paddingLeft: "16px",
                  }}
                >
                  {mainTranscript.map((segment, index) => (
                    <div
                      key={index}
                      ref={(el) => { transcriptRefs.current[index] = el; }}
                      style={{
                        marginBottom: "12px",
                        padding: "8px",
                        borderRadius: "6px",
                        backgroundColor: highlightedSegment === index ? "#fef3c7" : "transparent",
                        border: highlightedSegment === index ? "2px solid #f59e0b" : "2px solid transparent",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          fontWeight: "500",
                          marginBottom: "4px",
                        }}
                      >
                        {segment.timestamp}
                      </div>
                      <div>{segment.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: "16px",
                  color: "#4b5563",
                  lineHeight: "1.6",
                  height: "calc(100% - 60px)",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {mainTranscript.map((segment, index) => (
                  <div
                    key={index}
                    ref={(el) => { transcriptRefs.current[index] = el; }}
                    style={{
                      marginBottom: "12px",
                      padding: "8px",
                      borderRadius: "6px",
                      backgroundColor: highlightedSegment === index ? "#fef3c7" : "transparent",
                      border: highlightedSegment === index ? "2px solid #f59e0b" : "2px solid transparent",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontWeight: "500",
                        marginBottom: "4px",
                      }}
                    >
                      {segment.timestamp}
                    </div>
                    <div>{segment.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {title && (
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginBottom: "16px",
                  lineHeight: "1.3",
                }}
              >
                {title}
              </h2>
            )}
            {summary && (
              <div
                style={{
                  fontSize: "16px",
                  color: "#4b5563",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {summary}
              </div>
            )}
            {!title && !summary && (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">No content selected</div>
                  <div className="text-sm">Click on a reel to view its details</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
