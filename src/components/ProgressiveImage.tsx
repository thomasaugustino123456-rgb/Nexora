import React from "react";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  plain?: boolean;
}

export function ProgressiveImage({ src, alt, className = "", aspectRatioClass = "aspect-[3/2]", plain = false }: ProgressiveImageProps) {
  return (
    <div 
      className={`relative overflow-hidden ${
        plain 
          ? "bg-transparent border-none shadow-none" 
          : "bg-blue-950/5 rounded-2xl border border-blue-100/50"
      } ${aspectRatioClass} ${className}`} 
      id={`prog-img-${src.split("/").pop()?.split(".")[0] || "custom"}`}
    >
      <img
        src={src}
        alt={alt}
        loading="eager"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain relative z-0"
      />
    </div>
  );
}

