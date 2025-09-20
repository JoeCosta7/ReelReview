import React from "react";

interface BulletPointProps {
  title: string;
  buttonText: string;
  onButtonClick?: () => void;
  videoSrc?: String;
}

export default function BulletPoint({
  title,
  buttonText,
  onButtonClick,
  videoSrc,
}: BulletPointProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "8px 0",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#333",
        }}
      />
      <span style={{ fontSize: "1rem", color: "#222" }}>{title}</span>
      <button
        style={{
          padding: "6px 16px",
          borderRadius: "4px",
          border: "none",
          background: "#0078d4",
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
}
