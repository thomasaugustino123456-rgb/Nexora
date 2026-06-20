import React from "react";
import { SocialCircle, Screen } from "../types";

interface NexusLinkRendererProps {
  text: string;
  setActiveScreen?: (s: Screen) => void;
  circles?: SocialCircle[];
  showToast?: (m: string, t?: any) => void;
  onLinkClick?: () => void;
}

export function NexusLinkRenderer({
  text,
  setActiveScreen,
  circles = [],
  showToast,
  onLinkClick
}: NexusLinkRendererProps) {
  if (!text) return null;

  // regex to capture n/ followed by alphanumeric, dashes, or underscores
  const regex = /n\/([a-zA-Z0-9_\-]+)/g;
  const parts = text.split(regex);
  if (parts.length <= 1) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          const groupSlug = part;
          
          const handleLinkClick = () => {
            const matched = circles.find(
              (c) =>
                c.name.toLowerCase().replace(/[\s_\-]+/g, "") === groupSlug.toLowerCase().replace(/[\s_\-]+/g, "") ||
                c.id === groupSlug
            );

            if (matched) {
              localStorage.setItem("nexora_shortcut_circle_id", matched.id);
            } else {
              localStorage.setItem("nexora_shortcut_circle_name", groupSlug);
            }

            // Dispatch global CustomEvent for real-time routing
            window.dispatchEvent(new CustomEvent("nexora_route_group"));

            if (setActiveScreen) {
              setActiveScreen("social");
            }

            if (onLinkClick) {
              onLinkClick();
            }
          };

          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleLinkClick();
              }}
              className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded-md transition-all inline-flex items-center gap-0.5 mx-0.5 border border-indigo-200 cursor-pointer"
            >
              n/{part}
            </button>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
