import React from "react";
import { SiZalo } from "react-icons/si";

// ---------------------------------------------------------------------------
// Social icons (used in Footer & SocialFloating)
// ---------------------------------------------------------------------------

export const ZaloIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <SiZalo className={className} />
);



export const TiktokIcon = () => (
  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.17.96 1.09 2.3 1.8 3.73 1.96v4.07c-1.78-.17-3.47-.99-4.66-2.35-.04-.04-.07-.08-.13-.15v7.37c-.03 2.1-.73 4.22-2.18 5.75-1.72 1.86-4.32 2.76-6.84 2.37-2.33-.31-4.52-1.74-5.69-3.83-1.42-2.45-1.41-5.7.03-8.13 1.28-2.23 3.66-3.72 6.22-3.89v4.09c-1.37.16-2.67.97-3.26 2.22-.64 1.3-.43 3.05.5 4.17.99 1.15 2.64 1.57 4.02.99 1.06-.41 1.77-1.47 1.8-2.62V.02z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Chatbot icons (used in AIChatbot)
// ---------------------------------------------------------------------------

export const HouseIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const SafeIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M20 12h2" />
    <path d="M2 12h2" />
  </svg>
);

export const GateIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 20V4" />
    <path d="M22 20V4" />
    <path d="M2 7h20" />
    <path d="M2 12h20" />
    <path d="M2 17h20" />
  </svg>
);

export const DoorIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M14 12v.01" />
  </svg>
);
