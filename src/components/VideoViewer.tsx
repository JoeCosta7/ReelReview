import React from "react";

interface VideoViewerProps {
  src: string;
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
    </div>
  );
}
