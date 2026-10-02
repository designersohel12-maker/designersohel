import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface PortfolioMediaCardProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  motionPreset?: string;
  aspectClass?: string;
  onClick?: () => void;
}

/**
 * Pure visual media card for Best Work and Portfolio sections.
 * Strictly obeys Rule #6 & #21: NO project titles, descriptions, dates, client names, or labels
 * inside the preview card. Focuses 100% on the visual Design or Motion work.
 */
export const PortfolioMediaCard: React.FC<PortfolioMediaCardProps> = ({
  mediaUrl,
  mediaType,
  motionPreset,
  aspectClass = 'aspect-[4/3]',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  const isVideoFile =
    mediaType === 'video' ||
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl) ||
    mediaUrl.startsWith('data:video/');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open visual work preview"
      className={`group relative w-full ${aspectClass} overflow-hidden rounded-2xl bg-[#071F1A] border border-[#06D6A0]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06D6A0] transition-transform duration-200 ease-out hover:scale-[1.015] cursor-pointer block`}
    >
      {isVideoFile ? (
        <video
          src={mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : !imgError ? (
        <img
          src={mediaUrl}
          alt="Portfolio artwork"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[#0C4137] via-[#07221C] to-[#051310] flex items-center justify-center">
          <div className="h-20 w-20 rounded-full border border-[#06D6A0]/40 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-[#06D6A0]/30" />
          </div>
        </div>
      )}

      {/* Subtle animated motion graphics overlay when item is a Motion Design preset */}
      {motionPreset && !isVideoFile && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {motionPreset === 'emerald-ribbons' && (
            <svg
              className="h-full w-full opacity-75"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="mGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06D6A0" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#E6FBF6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <circle
                cx="200"
                cy="150"
                r="78"
                fill="none"
                stroke="url(#mGrad1)"
                strokeWidth="2"
                className=" origin-center animate-[spin_14s_linear_infinite]"
                strokeDasharray="120 60"
              />
              <circle
                cx="200"
                cy="150"
                r="52"
                fill="none"
                stroke="#06D6A0"
                strokeOpacity="0.45"
                strokeWidth="1.5"
                className="origin-center animate-[spin_10s_linear_infinite_reverse]"
                strokeDasharray="60 40"
              />
            </svg>
          )}

          {motionPreset === 'kinetic-grid' && (
            <svg
              className="h-full w-full opacity-75"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid slice"
            >
              <rect
                x="110"
                y="60"
                width="180"
                height="180"
                rx="16"
                fill="none"
                stroke="#06D6A0"
                strokeOpacity="0.55"
                strokeWidth="2"
                className="origin-center animate-[pulse_3s_ease-in-out_infinite]"
              />
              <rect
                x="140"
                y="90"
                width="120"
                height="120"
                rx="8"
                fill="none"
                stroke="#E6FBF6"
                strokeOpacity="0.4"
                strokeWidth="1.5"
                className="origin-center animate-[spin_18s_linear_infinite]"
              />
            </svg>
          )}

          {(motionPreset === 'luxury-monogram' ||
            motionPreset === 'broadcast-reel' ||
            motionPreset === 'orbital-prism' ||
            motionPreset === 'architectural-wave') && (
            <svg
              className="h-full w-full opacity-70"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid slice"
            >
              <circle
                cx="200"
                cy="150"
                r="68"
                fill="none"
                stroke="#06D6A0"
                strokeOpacity="0.5"
                strokeWidth="2"
                className="origin-center animate-[ping_3.5s_cubic-bezier(0,0,0.2,1)_infinite]"
              />
            </svg>
          )}

          {/* Minimal motion play indicator icon in corner (affordance only, zero text) */}
          <div className="absolute bottom-3.5 right-3.5 h-8 w-8 rounded-full bg-[#051310]/75 backdrop-blur-md border border-[#06D6A0]/40 flex items-center justify-center text-[#06D6A0] transition-transform duration-200 group-hover:scale-110">
            <Play className="h-3.5 w-3.5 fill-[#06D6A0] ml-0.5" />
          </div>
        </div>
      )}

      {isVideoFile && (
        <div className="pointer-events-none absolute bottom-3.5 right-3.5 h-8 w-8 rounded-full bg-[#051310]/75 backdrop-blur-md border border-[#06D6A0]/40 flex items-center justify-center text-[#06D6A0]">
          <Play className="h-3.5 w-3.5 fill-[#06D6A0] ml-0.5" />
        </div>
      )}

      {/* Subtle hover border illumination */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-[#06D6A0]/0 transition-colors duration-200 group-hover:border-[#06D6A0]/50" />
    </button>
  );
};
