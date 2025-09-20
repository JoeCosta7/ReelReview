import React from "react";

interface VideoViewerProps {
  src: string | null;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  poster?: string;
}

export default function VideoViewer({
  src,
  iframeRef,
  poster,
}: VideoViewerProps) {
  return (
    <div
      style={{
        width: "auto",
        height: "96%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#000",
        borderRadius: "8px",
        margin: "5px",
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
            height: "90%",
            margin: "auto",
            maxHeight: "100dvh",
            maxWidth: "100vw",
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
            height: "90%",
            margin: "auto",
            maxHeight: "100dvh",
            maxWidth: "100vw",
            borderRadius: "8px",
            background: "#000",
          }}
        />
      )}
    </div>
  );
}
