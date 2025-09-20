import React from "react";

interface BulletPointProps {
  title: string;
  buttonText: string;
  onButtonClick?: () => void;
  thumbSrc?: String;
}

export default function BulletPoint({
  title,
  buttonText,
  onButtonClick,
  thumbSrc,
}: BulletPointProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "12px",
        padding: "16px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        maxWidth: "320px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          width: "220px",
        }}
      >
        <div
          style={{
            width: "180px",
            height: "320px",
            borderRadius: "8px",
            overflow: "hidden",
            background: "#eee",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={onButtonClick}
        >
          {thumbSrc ? (
            <img
              src={typeof thumbSrc === "string" ? thumbSrc : ""}
              alt="Video thumbnail"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ color: "#aaa", fontSize: "2rem" }}>🎬</span>
          )}
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.6)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <polygon points="6,4 14,9 6,14" fill="#fff" />
            </svg>
          </span>
        </div>
        <div
          style={{
            fontWeight: 600,
            fontSize: "1.1rem",
            color: "#222",
            textAlign: "left",
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}
