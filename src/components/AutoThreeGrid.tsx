import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PortfolioMediaCard } from './PortfolioMediaCard';

export interface VisualWorkItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  motionPreset?: string;
}

interface AutoThreeGridProps {
  items: VisualWorkItem[];
  intervalMs?: number;
  aspectClass?: string;
  onSelectWork: (item: VisualWorkItem) => void;
  onSeeMore?: () => void;
  seeMoreLabel?: string;
}

/**
 * Displays 3 visual work cards simultaneously, center-aligned, minimal UI.
 * Automatically transitions to the next set of works every 3 seconds (3000ms),
 * and supports manual navigation (Prev / Next / Dots).
 * Strictly zero text labels inside cards.
 */
export const AutoThreeGrid: React.FC<AutoThreeGridProps> = ({
  items,
  intervalMs = 3000,
  aspectClass = 'aspect-[4/3]',
  onSelectWork,
  onSeeMore,
  seeMoreLabel = 'See More',
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = items.length;

  const advanceNext = useCallback(() => {
    if (total <= 3) return;
    setStartIndex((prev) => (prev + 1) % total);
  }, [total]);

  const advancePrev = useCallback(() => {
    if (total <= 3) return;
    setStartIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 3) return;
    const timer = window.setInterval(advanceNext, intervalMs);
    return () => window.clearInterval(timer);
  }, [advanceNext, intervalMs, isPaused, total]);

  if (total === 0) {
    return null;
  }

  // Pick exactly 3 visible items wrapping around cleanly
  const visibleItems: VisualWorkItem[] = [];
  const count = Math.min(3, total);
  for (let i = 0; i < count; i++) {
    visibleItems.push(items[(startIndex + i) % total]);
  }

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3-Card Center-Aligned Visual Grid */}
      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center justify-items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleItems.map((item, idx) => (
              <motion.div
                key={`${item.id}-${(startIndex + idx) % total}`}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <PortfolioMediaCard
                  mediaUrl={item.mediaUrl}
                  mediaType={item.mediaType}
                  motionPreset={item.motionPreset}
                  aspectClass={aspectClass}
                  onClick={() => onSelectWork(item)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Manual Interaction Controls + Optional See More Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
          {total > 3 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={advancePrev}
                aria-label="Previous works"
                className="h-10 w-10 rounded-full border border-[#06D6A0]/25 bg-[#071F1A]/80 text-[#E6FBF6] hover:border-[#06D6A0] hover:text-[#06D6A0] flex items-center justify-center transition-colors duration-150 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {items.map((item, idx) => {
                  const isActive = idx === startIndex % total;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStartIndex(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'w-6 bg-[#06D6A0]'
                          : 'w-1.5 bg-[#E6FBF6]/25 hover:bg-[#E6FBF6]/50'
                      }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={advanceNext}
                aria-label="Next works"
                className="h-10 w-10 rounded-full border border-[#06D6A0]/25 bg-[#071F1A]/80 text-[#E6FBF6] hover:border-[#06D6A0] hover:text-[#06D6A0] flex items-center justify-center transition-colors duration-150 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {onSeeMore && (
            <button
              type="button"
              onClick={onSeeMore}
              className="px-6 py-2.5 rounded-lg border border-[#06D6A0]/40 bg-[#0C4137]/40 text-sm font-medium text-[#E6FBF6] hover:bg-[#06D6A0] hover:text-[#051310] hover:border-[#06D6A0] transition-colors duration-200 cursor-pointer whitespace-nowrap"
            >
              {seeMoreLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
