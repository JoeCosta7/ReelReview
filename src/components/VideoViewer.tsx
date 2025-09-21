import React from "react";

interface VideoViewerProps {
  src: string | null;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  poster?: string;
  title?: string;
  summary?: string;
  mainTranscript?: any[];
  isMainVideo?: boolean;
}

export default function VideoViewer({
  src,
  iframeRef,
  poster,
  title,
  summary,
  mainTranscript,
  isMainVideo,
}: VideoViewerProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "96%",
        display: "flex",
        gap: "16px",
        background: "#fff",
        borderRadius: "8px",
        margin: "5px",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "16px",
                lineHeight: "1.3",
              }}
            >
              Video Transcript
            </h2>
            <div
              style={{
                fontSize: "16px",
                color: "#4b5563",
                lineHeight: "1.6",
                maxHeight: "70vh",
                overflowY: "auto",
                paddingRight: "8px",
              }}
            >
              {mainTranscript.map((segment, index) => (
                <div key={index} style={{ marginBottom: "12px" }}>
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
