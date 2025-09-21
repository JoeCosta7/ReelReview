import React, { useState, useRef, useEffect } from "react";
import TranscriptQA from "./TranscriptQA";
import { MessageCircle, X } from "lucide-react";

interface VideoViewerProps {
  src: string | null;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  poster?: string;
  title?: string;
  summary?: string;
  mainTranscript?: any[];
  isMainVideo?: boolean;
  onQAModeChange?: (isQAMode: boolean) => void;
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
}: VideoViewerProps) {
  const [highlightedSegment, setHighlightedSegment] = useState<number | null>(null);
  const [showQA, setShowQA] = useState(false);
  const transcriptRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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
  return (
    <div
      style={{
        width: "100%",
        height: showQA && isMainVideo ? "100%" : "96%",
        display: "flex",
        gap: "16px",
        background: "#fff",
        borderRadius: showQA && isMainVideo ? "0px" : "8px",
        margin: showQA && isMainVideo ? "0px" : "5px",
        overflow: "hidden",
        boxShadow: showQA && isMainVideo ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Left side - Video/Iframe */}
      <div
        style={{
          flex: "0 0 auto",
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
              aspectRatio: "9/16",
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
              aspectRatio: "9/16",
              width: "100%",
              height: "auto",
              maxHeight: "100%",
              borderRadius: "8px",
              background: "#000",
            }}
          />
        )}
      </div>

      {/* Right side - Title and Summary */}
      <div
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  lineHeight: "1.3",
                }}
              >
                Video Transcript
              </h2>
              <button
                onClick={() => setShowQA(!showQA)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  backgroundColor: showQA ? "#ef4444" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = showQA ? "#dc2626" : "#2563eb";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = showQA ? "#ef4444" : "#3b82f6";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                }}
              >
                {showQA ? (
                  <>
                    <X className="w-4 h-4" />
                    Close
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    Ask
                  </>
                )}
              </button>
            </div>
            
            {showQA ? (
              <div style={{ flex: "1", display: "flex", gap: "16px", height: "calc(100% - 60px)" }}>
                <div style={{ flex: "1", height: "100%" }}>
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
