import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Upload, LogIn, LogOut, Copy, Check } from 'lucide-react';
import {
  BestWorkItem,
  PortfolioProjectItem,
  PortfolioCategory,
} from '../data/cvData';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabaseClient';

interface PortfolioManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  heroPhotoUrl: string | null;
  onUpdateHeroPhoto: (url: string) => void;
  bestWorks: BestWorkItem[];
  onAddBestWork: (mediaUrl: string, mediaType: 'image' | 'video') => Promise<void>;
  onDeleteBestWork: (id: string) => Promise<void>;
  portfolioProjects: PortfolioProjectItem[];
  onAddPortfolioProject: (
    category: PortfolioCategory,
    mediaUrl: string,
    mediaType: 'image' | 'video'
  ) => Promise<void>;
  onUpdatePortfolioCategory: (
    id: string,
    newCategory: PortfolioCategory
  ) => Promise<void>;
  onDeletePortfolioProject: (id: string) => Promise<void>;
}

export const PortfolioManagerModal: React.FC<PortfolioManagerModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onSignIn,
  onSignOut,
  heroPhotoUrl,
  onUpdateHeroPhoto,
  bestWorks,
  onAddBestWork,
  onDeleteBestWork,
  portfolioProjects,
  onAddPortfolioProject,
  onUpdatePortfolioCategory,
  onDeletePortfolioProject,
}) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'best_work' | 'photo' | 'schema'>(
    'portfolio'
  );
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory>('motion');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUploadToDataUrl = (
    e: React.ChangeEvent<HTMLInputElement>,
    onReady: (url: string, detectedType: 'image' | 'video') => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawUrl = ev.target?.result as string;
      if (isVideo) {
        onReady(rawUrl, 'video');
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
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
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/webp', 0.86);
          onReady(compressed, 'image');
        } else {
          onReady(rawUrl, 'image');
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrlInput.trim()) return;
    setIsSubmitting(true);
    try {
      if (activeTab === 'best_work') {
        await onAddBestWork(mediaUrlInput.trim(), mediaType);
      } else if (activeTab === 'portfolio') {
        await onAddPortfolioProject(selectedCategory, mediaUrlInput.trim(), mediaType);
      }
      setMediaUrlInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#051310]/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#071D18] border border-[#06D6A0]/30 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#06D6A0]/15 bg-[#051310]/60">
          <div>
            <h2 className="text-lg font-display font-bold text-[#E6FBF6]">
              Portfolio Content Manager
            </h2>
            <p className="text-xs text-[#8AB5AA]">
              Update Portfolio Works, Best Work, and Hero Photo without touching code
            </p>
          </div>

          <div className="flex items-center gap-3">
            {userEmail ? (
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#06D6A0]/30 text-xs font-medium text-[#E6FBF6] hover:border-[#06D6A0] transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="h-3.5 w-3.5 text-[#06D6A0]" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06D6A0] text-xs font-semibold text-[#051310] hover:bg-[#06D6A0]/90 transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Admin Sign In</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close manager"
              className="h-9 w-9 rounded-lg border border-[#06D6A0]/20 flex items-center justify-center text-[#E6FBF6] hover:border-[#06D6A0] hover:text-[#06D6A0] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#06D6A0]/15 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'border-[#06D6A0] text-[#06D6A0]'
                : 'border-transparent text-[#8AB5AA] hover:text-[#E6FBF6]'
            }`}
          >
            Portfolio Categories ({portfolioProjects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('best_work')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'best_work'
                ? 'border-[#06D6A0] text-[#06D6A0]'
                : 'border-transparent text-[#8AB5AA] hover:text-[#E6FBF6]'
            }`}
          >
            Best Work ({bestWorks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'photo'
                ? 'border-[#06D6A0] text-[#06D6A0]'
                : 'border-transparent text-[#8AB5AA] hover:text-[#E6FBF6]'
            }`}
          >
            Hero Personal Photo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-[#06D6A0] text-[#06D6A0]'
                : 'border-transparent text-[#8AB5AA] hover:text-[#E6FBF6]'
            }`}
          >
            Database Schema
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {(activeTab === 'portfolio' || activeTab === 'best_work') && (
            <>
              <form
                onSubmit={handleAddSubmit}
                className="rounded-xl bg-[#051310]/80 border border-[#06D6A0]/20 p-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {activeTab === 'portfolio' && (
                    <div>
                      <label className="block text-xs font-medium text-[#8AB5AA] mb-1.5">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) =>
                          setSelectedCategory(e.target.value as PortfolioCategory)
                        }
                        className="w-full rounded-lg bg-[#071D18] border border-[#06D6A0]/30 px-3 py-2 text-xs text-[#E6FBF6] focus:outline-none focus:border-[#06D6A0]"
                      >
                        <option value="motion">Motion Design</option>
                        <option value="social">Social Media Post Design</option>
                        <option value="print">Print Design</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#8AB5AA] mb-1.5">
                      Media Format
                    </label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                      className="w-full rounded-lg bg-[#071D18] border border-[#06D6A0]/30 px-3 py-2 text-xs text-[#E6FBF6] focus:outline-none focus:border-[#06D6A0]"
                    >
                      <option value="image">Image (JPG / PNG / WEBP)</option>
                      <option value="video">Video (MP4 / WebM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8AB5AA] mb-1.5">
                      Upload File from Device
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm"
                      onChange={(e) =>
                        handleFileUploadToDataUrl(e, (url, detected) => {
                          setMediaUrlInput(url);
                          setMediaType(detected);
                        })
                      }
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#06D6A0]/40 bg-[#0C4137]/30 px-3 py-2 text-xs font-medium text-[#E6FBF6] hover:border-[#06D6A0] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#06D6A0]" />
                      <span>Choose Image / Video</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                    placeholder="Or paste direct image / video URL (.jpg, .png, .webp, .mp4, .webm)..."
                    className="flex-1 rounded-lg bg-[#071D18] border border-[#06D6A0]/30 px-3.5 py-2 text-xs text-[#E6FBF6] placeholder-[#8AB5AA]/50 focus:outline-none focus:border-[#06D6A0]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !mediaUrlInput.trim()}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-[#06D6A0] px-5 py-2 text-xs font-semibold text-[#051310] hover:bg-[#06D6A0]/90 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      {activeTab === 'best_work' ? 'Add to Best Work' : 'Add to Portfolio'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Current Items List */}
              {activeTab === 'portfolio' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {portfolioProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="rounded-xl bg-[#051310] border border-[#06D6A0]/20 overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[4/3] w-full bg-[#071D18] overflow-hidden">
                        {proj.mediaType === 'video' ? (
                          <video
                            src={proj.mediaUrl}
                            muted
                            loop
                            autoPlay
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={proj.mediaUrl}
                            alt="Portfolio item"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-2.5 flex items-center justify-between gap-2">
                        <select
                          value={proj.category}
                          onChange={(e) =>
                            onUpdatePortfolioCategory(
                              proj.id,
                              e.target.value as PortfolioCategory
                            )
                          }
                          className="flex-1 rounded bg-[#071D18] border border-[#06D6A0]/25 px-2 py-1 text-[11px] text-[#E6FBF6] focus:outline-none"
                        >
                          <option value="motion">Motion</option>
                          <option value="social">Social Media</option>
                          <option value="print">Print</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onDeletePortfolioProject(proj.id)}
                          aria-label="Delete project"
                          className="p-1.5 rounded text-[#8AB5AA] hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {bestWorks.map((bw) => (
                    <div
                      key={bw.id}
                      className="rounded-xl bg-[#051310] border border-[#06D6A0]/20 overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[4/3] w-full bg-[#071D18] overflow-hidden">
                        {bw.mediaType === 'video' ? (
                          <video
                            src={bw.mediaUrl}
                            muted
                            loop
                            autoPlay
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={bw.mediaUrl}
                            alt="Best work item"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-xs text-[#8AB5AA] font-mono-tabular">
                          #{bw.order}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteBestWork(bw.id)}
                          aria-label="Delete best work"
                          className="p-1.5 rounded text-[#8AB5AA] hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'photo' && (
            <div className="rounded-xl bg-[#051310]/80 border border-[#06D6A0]/20 p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="h-44 w-36 rounded-xl bg-[#071D18] border border-[#06D6A0]/30 overflow-hidden flex items-end justify-center shrink-0">
                {heroPhotoUrl ? (
                  <img
                    src={heroPhotoUrl}
                    alt="Current Hero Portrait"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain object-bottom"
                  />
                ) : (
                  <span className="text-xs text-[#8AB5AA] p-4 text-center my-auto">
                    Default Vector Portrait Active
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-base font-display font-bold text-[#E6FBF6]">
                  Hero Section Personal Photo (My Photo.png)
                </h3>
                <p className="text-xs text-[#8AB5AA] leading-relaxed max-w-md">
                  Select your cutout portrait photo (My Photo.png) to display on the right
                  side of the Home hero section with its original proportions preserved.
                </p>
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    handleFileUploadToDataUrl(e, (url) => {
                      onUpdateHeroPhoto(url);
                    })
                  }
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => heroInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg bg-[#06D6A0] px-4 py-2 text-xs font-semibold text-[#051310] hover:bg-[#06D6A0]/90 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload My Photo.png</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8AB5AA]">
                  Cloud Database is active. For optional external Supabase table mirroring
                  (Project: <span className="text-[#E6FBF6] font-mono-tabular">eebjummyojlyxfcolixp</span>), copy this SQL schema:
                </p>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 rounded-lg border border-[#06D6A0]/30 px-3 py-1.5 text-xs font-medium text-[#E6FBF6] hover:border-[#06D6A0] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedSchema ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#06D6A0]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#06D6A0]" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="rounded-xl bg-[#051310] border border-[#06D6A0]/20 p-4 text-xs font-mono-tabular text-[#8AB5AA] overflow-x-auto">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
