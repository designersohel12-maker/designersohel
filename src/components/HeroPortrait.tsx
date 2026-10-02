import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Camera } from 'lucide-react';

interface HeroPortraitProps {
  photoUrl: string | null;
  onUploadPhoto: (dataUrl: string) => void;
}

export const HeroPortrait: React.FC<HeroPortraitProps> = ({
  photoUrl,
  onUploadPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress/resize gently on canvas if needed so it fits well within Firestore's 900KB limit while preserving exact aspect ratio
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1100;
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          // Preserve PNG transparency for cutout photo (My Photo.png)
          const optimized = canvas.toDataURL('image/png', 0.92);
          onUploadPhoto(optimized.length < 850000 ? optimized : canvas.toDataURL('image/webp', 0.88));
        } else {
          onUploadPhoto(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const [isDragging, setIsDragging] = React.useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1100;
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/png', 0.92);
          onUploadPhoto(
            optimized.length < 850000
              ? optimized
              : canvas.toDataURL('image/webp', 0.88)
          );
        } else {
          onUploadPhoto(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-[330px] sm:max-w-[380px] lg:max-w-[410px] flex flex-col items-center p-6"
    >
      {/* Interactive group wrapper for circle + 2 animated outer strokes (1 full circle stroke + 1 dotted stroke) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        whileHover={{ scale: 1.04, y: -8 }}
        transition={{
          y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        title="Click or drag & drop My Photo 2.png here"
        className="group relative w-full aspect-square flex items-center justify-center cursor-pointer"
      >
        {/* Ambient radial glow behind circular portrait */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-tr from-[#0C4137]/70 via-[#06D6A0]/25 to-transparent blur-2xl transition-all duration-500 group-hover:via-[#06D6A0]/45 group-hover:scale-110"
        />

        {/* OUTER STROKE 2: Animated Dotted Circular Stroke (ডট ডট স্ট্রোক) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 520 520"
          className="pointer-events-none absolute -inset-6 sm:-inset-8 w-[calc(100%+3rem)] sm:w-[calc(100%+4rem)] h-[calc(100%+3rem)] sm:h-[calc(100%+4rem)] animate-[spin_22s_linear_infinite_reverse] transition-transform duration-500 group-hover:scale-105"
        >
          <circle
            cx="260"
            cy="260"
            r="252"
            fill="none"
            stroke="#06D6A0"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="1 18"
            className="opacity-75 transition-opacity duration-300 group-hover:opacity-100"
          />
        </svg>

        {/* OUTER STROKE 1: Animated Full / Nearly-Complete Circular Stroke (পরিপূর্ণ গোল বৃত্ত স্ট্রোক) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 520 520"
          className="pointer-events-none absolute -inset-3 sm:-inset-4 w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)] h-[calc(100%+1.5rem)] sm:h-[calc(100%+2rem)] animate-[spin_10s_linear_infinite] transition-transform duration-500 group-hover:scale-[1.03]"
        >
          <defs>
            <linearGradient id="fullCircleStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06D6A0" stopOpacity="1" />
              <stop offset="55%" stopColor="#E6FBF6" stopOpacity="0.85" />
              <stop offset="88%" stopColor="#06D6A0" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#06D6A0" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {/* Continuous full base ring */}
          <circle
            cx="260"
            cy="260"
            r="252"
            fill="none"
            stroke="#06D6A0"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
          {/* Fuller animated arc ring (92% complete circle rotating smoothly) */}
          <circle
            cx="260"
            cy="260"
            r="252"
            fill="none"
            stroke="url(#fullCircleStrokeGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="1440 145"
          />
        </svg>

        {/* Main Complete Circular Portrait Frame */}
        <div
          className={`relative h-full w-full overflow-hidden rounded-full bg-gradient-to-b from-[#0C4137]/75 via-[#07211B]/95 to-[#051310] border-[2.5px] ${
            isDragging
              ? 'border-[#E6FBF6] shadow-[0_0_65px_rgba(6,214,160,0.55)]'
              : 'border-[#06D6A0]/65 group-hover:border-[#06D6A0]'
          } shadow-[0_24px_80px_rgba(0,0,0,0.7)] group-hover:shadow-[0_0_55px_rgba(6,214,160,0.38)] transition-all duration-500 flex items-end justify-center`}
        >
          {/* Inner studio spotlight rim */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_32%,rgba(6,214,160,0.26),transparent_68%)] transition-opacity duration-500 group-hover:opacity-100 opacity-80"
          />

          {photoUrl ? (
            <img
              src={photoUrl}
              alt="MD. SOHEL RANA — Graphic & Motion Designer"
              referrerPolicy="no-referrer"
              className="relative z-10 h-full w-full object-contain object-bottom pt-3 px-2 select-none transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-[0_18px_32px_rgba(6,214,160,0.32)]"
            />
          ) : (
            /* High-precision portrait matching MD. Sohel Rana's cutout photo (My Photo 2.png) */
            <div className="relative z-10 h-full w-full flex flex-col items-center justify-end pt-4 px-4 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2">
              <svg
                viewBox="0 0 500 560"
                className="h-full w-full object-contain object-bottom drop-shadow-[0_16px_36px_rgba(0,0,0,0.65)]"
                role="img"
                aria-label="MD. SOHEL RANA Portrait Composition"
              >
                <defs>
                  <linearGradient id="panjabiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#232726" />
                    <stop offset="50%" stopColor="#161918" />
                    <stop offset="100%" stopColor="#0C0E0D" />
                  </linearGradient>
                  <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8F8466" />
                    <stop offset="100%" stopColor="#635A43" />
                  </linearGradient>
                  <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#CB9368" />
                    <stop offset="100%" stopColor="#A97249" />
                  </linearGradient>
                  <linearGradient id="goldEmbroidery" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#EBC173" />
                    <stop offset="50%" stopColor="#CA9742" />
                    <stop offset="100%" stopColor="#9E6F25" />
                  </linearGradient>
                </defs>

                {/* Shoulders & Black Panjabi */}
                <path
                  d="M 75 560 L 98 395 C 108 350, 152 322, 205 308 L 295 304 C 355 318, 405 355, 422 412 L 440 560 Z"
                  fill="url(#panjabiGrad)"
                  stroke="#2E3533"
                  strokeWidth="1.5"
                />

                {/* Gold Embroidered Collar & Placket */}
                <path
                  d="M 195 306 Q 250 335 305 295 L 315 315 Q 250 355 188 325 Z"
                  fill="none"
                  stroke="url(#goldEmbroidery)"
                  strokeWidth="8.5"
                />
                <path
                  d="M 212 330 L 195 540 L 235 545 L 252 333 Z"
                  fill="#111312"
                  stroke="url(#goldEmbroidery)"
                  strokeWidth="6"
                />
                <line
                  x1="224"
                  y1="336"
                  x2="210"
                  y2="535"
                  stroke="url(#goldEmbroidery)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />

                {/* Neck */}
                <path d="M 210 265 L 210 315 L 290 310 L 290 265 Z" fill="url(#skinGrad)" />

                {/* Back Hair locks */}
                <path
                  d="M 162 185 C 148 225, 152 265, 168 285 C 175 255, 172 215, 172 185 Z"
                  fill="#141817"
                />
                <path
                  d="M 332 185 C 348 225, 345 268, 325 288 C 318 255, 322 215, 322 185 Z"
                  fill="#141817"
                />

                {/* Head & Face */}
                <ellipse cx="248" cy="182" rx="74" ry="92" fill="url(#skinGrad)" />

                {/* Full Beard & Mustache */}
                <path
                  d="M 174 192 C 172 248, 192 308, 248 312 C 304 308, 322 248, 320 192 C 312 222, 298 248, 278 256 C 258 262, 238 262, 218 256 C 198 248, 184 222, 174 192 Z"
                  fill="#151A19"
                />
                <path
                  d="M 212 222 Q 248 210 284 222 Q 248 218 212 222 Z"
                  fill="#151A19"
                />
                {/* Warm Smile */}
                <path
                  d="M 218 226 Q 248 244 278 226 Q 248 234 218 226 Z"
                  fill="#F5EBE6"
                />

                {/* Eyes & Eyebrows */}
                <path d="M 200 156 Q 218 148 234 155" fill="none" stroke="#181818" strokeWidth="4" strokeLinecap="round" />
                <path d="M 262 155 Q 278 148 296 156" fill="none" stroke="#181818" strokeWidth="4" strokeLinecap="round" />
                <circle cx="218" cy="168" r="6" fill="#1A1412" />
                <circle cx="278" cy="168" r="6" fill="#1A1412" />

                {/* Knitted Olive Prayer Cap (Tupi) */}
                <path
                  d="M 173 142 C 175 84, 320 84, 322 142 C 275 126, 220 126, 173 142 Z"
                  fill="url(#capGrad)"
                  stroke="#4A4331"
                  strokeWidth="2"
                />
                <path
                  d="M 176 130 Q 248 112 319 130"
                  fill="none"
                  stroke="#4A4331"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />
              </svg>
            </div>
          )}
        </div>
      </motion.div>

      {/* Hidden file input for 1-click personal photo selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Action button below circular portrait to select/update personal photo */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Select or update personal portrait photo (My Photo 2.png)"
        className="mt-9 z-20 flex items-center gap-2 rounded-full bg-[#051310]/90 backdrop-blur-md border border-[#06D6A0]/40 px-4 py-2 text-xs font-medium text-[#E6FBF6] opacity-90 hover:opacity-100 hover:border-[#06D6A0] hover:text-[#06D6A0] transition-all duration-200 cursor-pointer whitespace-nowrap"
      >
        <Camera className="h-3.5 w-3.5 text-[#06D6A0]" />
        <span>{photoUrl ? 'Change Photo' : 'Select My Photo 2.png'}</span>
      </button>
    </motion.div>
  );
};
