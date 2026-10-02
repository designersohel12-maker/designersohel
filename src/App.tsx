import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Menu,
  X,
  ArrowUpRight,
  SlidersHorizontal,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import { supabasePublicClient } from './lib/supabaseClient';
import {
  CV_DATA,
  DEFAULT_BEST_WORKS,
  DEFAULT_PORTFOLIO_PROJECTS,
  BestWorkItem,
  PortfolioProjectItem,
  PortfolioCategory,
} from './data/cvData';
import { HeroPortrait } from './components/HeroPortrait';
import { AutoThreeGrid, VisualWorkItem } from './components/AutoThreeGrid';
import { PortfolioMediaCard } from './components/PortfolioMediaCard';
import { PortfolioManagerModal } from './components/PortfolioManagerModal';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

const PORTFOLIO_CATEGORIES: { id: PortfolioCategory; label: string }[] = [
  { id: 'motion', label: 'Motion Design' },
  { id: 'social', label: 'Social Media Post Design' },
  { id: 'print', label: 'Print Design' },
];

export default function App() {
  // Navigation & Active Section state
  const [activeSection, setActiveSection] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Continuous Typewriter Effect for "GRAPHIC & MOTION DESIGNER"
  const fullDesignation = CV_DATA.designation;
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth & Database state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [heroPhotoUrl, setHeroPhotoUrl] = useState<string | null>(() => {
    return localStorage.getItem('sohel_hero_photo_v1');
  });
  const [bestWorks, setBestWorks] = useState<BestWorkItem[]>(() => {
    const saved = localStorage.getItem('sohel_best_works_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback to default
      }
    }
    return DEFAULT_BEST_WORKS;
  });
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProjectItem[]>(
    () => {
      const saved = localStorage.getItem('sohel_portfolio_projects_v1');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // fallback to default
        }
      }
      return DEFAULT_PORTFOLIO_PROJECTS;
    }
  );

  // Modals: Full Category "See More" Gallery, Lightbox Viewer, and Portfolio Manager
  const [seeMoreCategory, setSeeMoreCategory] = useState<PortfolioCategory | null>(
    null
  );
  const [lightboxWork, setLightboxWork] = useState<VisualWorkItem | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);

  // 1. Continuous Smooth Typewriter Animation
  useEffect(() => {
    const typeSpeed = isDeleting ? 45 : 85;
    const pauseBeforeDelete = 2200;
    const pauseBeforeRetype = 500;

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < fullDesignation.length) {
          setTypedText(fullDesignation.slice(0, typedText.length + 1));
        } else {
          window.setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(fullDesignation.slice(0, typedText.length - 1));
        } else {
          window.setTimeout(() => setIsDeleting(false), pauseBeforeRetype);
        }
      }
    }, typeSpeed);

    return () => window.clearTimeout(timer);
  }, [typedText, isDeleting, fullDesignation]);

  // 2. Scroll Spy for Active Section Highlighting
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 4. Live Firestore & Optional Supabase Sync
  useEffect(() => {
    // Public query for Best Works
    const bwQuery = query(
      collection(db, 'best_works'),
      where('visibility', '==', 'public')
    );
    const unsubBw = onSnapshot(
      bwQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const docs: BestWorkItem[] = snapshot.docs
            .map((d) => {
              const data = d.data();
              return {
                id: d.id,
                mediaUrl: String(data.mediaUrl || ''),
                mediaType: (data.mediaType === 'video' ? 'video' : 'image') as
                  | 'image'
                  | 'video',
                order: Number(data.order ?? 1),
                visibility: 'public' as const,
                ownerId: String(data.ownerId || ''),
              };
            })
            .sort((a, b) => a.order - b.order);
          setBestWorks(docs);
          localStorage.setItem('sohel_best_works_v1', JSON.stringify(docs));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'best_works');
      }
    );

    // Public query for Portfolio Projects
    const ppQuery = query(
      collection(db, 'portfolio_projects'),
      where('visibility', '==', 'public')
    );
    const unsubPp = onSnapshot(
      ppQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const docs: PortfolioProjectItem[] = snapshot.docs
            .map((d) => {
              const data = d.data();
              return {
                id: d.id,
                category: (['motion', 'social', 'print'].includes(data.category)
                  ? data.category
                  : 'motion') as PortfolioCategory,
                mediaUrl: String(data.mediaUrl || ''),
                mediaType: (data.mediaType === 'video' ? 'video' : 'image') as
                  | 'image'
                  | 'video',
                order: Number(data.order ?? 1),
                visibility: 'public' as const,
                ownerId: String(data.ownerId || ''),
              };
            })
            .sort((a, b) => a.order - b.order);
          setPortfolioProjects(docs);
          localStorage.setItem('sohel_portfolio_projects_v1', JSON.stringify(docs));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'portfolio_projects');
      }
    );

    // Public query for Site Profile (Hero Photo)
    const profileQuery = query(
      collection(db, 'site_profile'),
      where('visibility', '==', 'public')
    );
    const unsubProfile = onSnapshot(
      profileQuery,
      (snapshot) => {
        const mainDoc = snapshot.docs.find((d) => d.id === 'main') || snapshot.docs[0];
        if (mainDoc) {
          const url = mainDoc.data().heroPhotoUrl;
          if (typeof url === 'string' && url.length > 0) {
            setHeroPhotoUrl(url);
            localStorage.setItem('sohel_hero_photo_v1', url);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'site_profile');
      }
    );

    // Optional Supabase public fetch if user configured VITE_SUPABASE_PUBLISHABLE_KEY
    if (supabasePublicClient) {
      supabasePublicClient
        .from('best_works')
        .select('*')
        .eq('visibility', 'public')
        .order('sort_order', { ascending: true })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setBestWorks(
              data.map((row) => ({
                id: String(row.id),
                mediaUrl: String(row.media_url),
                mediaType: row.media_type === 'video' ? 'video' : 'image',
                order: Number(row.sort_order ?? 1),
                visibility: 'public',
              }))
            );
          }
        });
    }

    return () => {
      unsubBw();
      unsubPp();
      unsubProfile();
    };
  }, []);

  // Handlers for Admin Sign-In / Sign-Out
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Update Hero Personal Photo (persists to local storage immediately + Firestore if signed in as admin)
  const handleUpdateHeroPhoto = async (dataUrl: string) => {
    const sanitized = dataUrl.slice(0, 890000);
    setHeroPhotoUrl(sanitized);
    localStorage.setItem('sohel_hero_photo_v1', sanitized);

    if (currentUser) {
      const path = 'site_profile/main';
      try {
        await setDoc(doc(db, 'site_profile', 'main'), {
          heroPhotoUrl: sanitized,
          visibility: 'public',
          ownerId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  };

  // Add Best Work
  const handleAddBestWork = async (
    mediaUrl: string,
    mediaType: 'image' | 'video'
  ) => {
    const sanitizedUrl = mediaUrl.slice(0, 890000);
    const id = `bw_${Date.now()}`;
    const nextOrder = bestWorks.length + 1;
    const newItem: BestWorkItem = {
      id,
      mediaUrl: sanitizedUrl,
      mediaType,
      order: nextOrder,
      visibility: 'public',
      ownerId: currentUser?.uid || 'local',
    };

    const updated = [...bestWorks, newItem];
    setBestWorks(updated);
    localStorage.setItem('sohel_best_works_v1', JSON.stringify(updated));

    if (currentUser) {
      const path = `best_works/${id}`;
      try {
        await setDoc(doc(db, 'best_works', id), {
          mediaUrl: sanitizedUrl,
          mediaType,
          order: nextOrder,
          visibility: 'public',
          ownerId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  // Delete Best Work
  const handleDeleteBestWork = async (id: string) => {
    const updated = bestWorks.filter((b) => b.id !== id);
    setBestWorks(updated);
    localStorage.setItem('sohel_best_works_v1', JSON.stringify(updated));

    if (currentUser && !id.startsWith('bw_1') && !id.startsWith('bw_2')) {
      const path = `best_works/${id}`;
      try {
        await deleteDoc(doc(db, 'best_works', id));
      } catch {
        // Ignore if item only existed locally
      }
    }
  };

  // Add Portfolio Project
  const handleAddPortfolioProject = async (
    category: PortfolioCategory,
    mediaUrl: string,
    mediaType: 'image' | 'video'
  ) => {
    const sanitizedUrl = mediaUrl.slice(0, 890000);
    const id = `pp_${Date.now()}`;
    const nextOrder = portfolioProjects.length + 1;
    const newItem: PortfolioProjectItem = {
      id,
      category,
      mediaUrl: sanitizedUrl,
      mediaType,
      order: nextOrder,
      visibility: 'public',
      ownerId: currentUser?.uid || 'local',
    };

    const updated = [...portfolioProjects, newItem];
    setPortfolioProjects(updated);
    localStorage.setItem('sohel_portfolio_projects_v1', JSON.stringify(updated));

    if (currentUser) {
      const path = `portfolio_projects/${id}`;
      try {
        await setDoc(doc(db, 'portfolio_projects', id), {
          category,
          mediaUrl: sanitizedUrl,
          mediaType,
          order: nextOrder,
          visibility: 'public',
          ownerId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  };

  // Update Portfolio Project Category
  const handleUpdatePortfolioCategory = async (
    id: string,
    newCategory: PortfolioCategory
  ) => {
    const updated = portfolioProjects.map((p) =>
      p.id === id ? { ...p, category: newCategory } : p
    );
    setPortfolioProjects(updated);
    localStorage.setItem('sohel_portfolio_projects_v1', JSON.stringify(updated));

    if (currentUser) {
      const path = `portfolio_projects/${id}`;
      try {
        await updateDoc(doc(db, 'portfolio_projects', id), {
          category: newCategory,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Local item fallback
      }
    }
  };

  // Delete Portfolio Project
  const handleDeletePortfolioProject = async (id: string) => {
    const updated = portfolioProjects.filter((p) => p.id !== id);
    setPortfolioProjects(updated);
    localStorage.setItem('sohel_portfolio_projects_v1', JSON.stringify(updated));

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'portfolio_projects', id));
      } catch {
        // Local item fallback
      }
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#051310] text-[#E6FBF6] flex flex-col">
      {/* =====================================================================
          2. MAIN NAVIGATION (Strict 3-Zone Top Bar Contract)
          ===================================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#051310]/85 backdrop-blur-md border-b border-[#06D6A0]/15">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="text-base sm:text-lg font-display font-bold tracking-tight text-[#E6FBF6] hover:text-[#06D6A0] transition-colors whitespace-nowrap"
          >
            {CV_DATA.name}
          </a>

          {/* Zone 2: 6 clean text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={`relative py-1 transition-colors duration-150 whitespace-nowrap ${
                    isActive
                      ? 'text-[#06D6A0]'
                      : 'text-[#8AB5AA] hover:text-[#E6FBF6]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06D6A0] rounded-full"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary action + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setManagerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#06D6A0]/35 bg-[#0C4137]/40 text-xs font-medium text-[#E6FBF6] hover:border-[#06D6A0] hover:text-[#06D6A0] transition-colors duration-150 cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#06D6A0]" />
              <span className="hidden sm:inline">Manage Works</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              className="md:hidden h-10 w-10 rounded-lg border border-[#06D6A0]/25 flex items-center justify-center text-[#E6FBF6] hover:border-[#06D6A0] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="md:hidden border-b border-[#06D6A0]/20 bg-[#051310] px-6 py-4 flex flex-col gap-3"
            >
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                  className={`py-2 text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'text-[#06D6A0]'
                      : 'text-[#8AB5AA] hover:text-[#E6FBF6]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {/* ===================================================================
            3. HOME SECTION (Split-Screen Hero) + 4. BEST WORK SECTION
            =================================================================== */}
        <section
          id="home"
          className="relative overflow-hidden pt-14 pb-24 lg:pt-20 lg:pb-32 border-b border-[#06D6A0]/12"
        >
          {/* Subtle atmospheric background glow inspired by Monestra reference */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-1/4 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#0C4137]/35 blur-[130px]"
          />

          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Side: Name + Continuous Typewriter Designation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 space-y-6 text-left"
              >
                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#E6FBF6] leading-[1.06] text-balance">
                  {CV_DATA.name}
                </h1>

                {/* Typewriter Animated Designation */}
                <div className="min-h-[2.5rem] sm:min-h-[3rem] flex items-center">
                  <p className="font-display text-lg sm:text-2xl lg:text-3xl font-semibold tracking-wide text-[#06D6A0] flex items-center">
                    <span>{typedText}</span>
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block h-6 sm:h-7 w-[2.5px] bg-[#06D6A0] animate-pulse"
                    />
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => scrollToSection('portfolio')}
                    className="px-6 py-3 rounded-lg bg-[#06D6A0] text-sm font-semibold text-[#051310] hover:bg-[#06D6A0]/90 transition-colors duration-150 cursor-pointer whitespace-nowrap"
                  >
                    Portfolio
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('contact')}
                    className="px-6 py-3 rounded-lg border border-[#06D6A0]/35 bg-[#0C4137]/30 text-sm font-medium text-[#E6FBF6] hover:border-[#06D6A0] hover:text-[#06D6A0] transition-colors duration-150 cursor-pointer whitespace-nowrap"
                  >
                    Contact
                  </button>
                </div>
              </motion.div>

              {/* Right Side: Personal Photo */}
              <div className="lg:col-span-5">
                <HeroPortrait
                  photoUrl={heroPhotoUrl}
                  onUploadPhoto={handleUpdateHeroPhoto}
                />
              </div>
            </div>

            {/* 4. BEST WORK SECTION (Directly below Hero, Independent Data Source) */}
            <div className="mt-24 lg:mt-32 pt-16 border-t border-[#06D6A0]/15">
              <div className="text-center mb-12">
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#E6FBF6]">
                  BEST WORK
                </h2>
              </div>

              <AutoThreeGrid
                items={bestWorks}
                intervalMs={3000}
                aspectClass="aspect-[4/3]"
                onSelectWork={(item) => setLightboxWork(item)}
              />
            </div>
          </div>
        </section>

        {/* ===================================================================
            5, 6, 7. PORTFOLIO SECTION (Independent, 3 Categories, 3 Previews Each,
                     3s Auto-Rotation, Zero Extra Text, See More Button)
            =================================================================== */}
        <section
          id="portfolio"
          className="py-24 lg:py-32 border-b border-[#06D6A0]/12"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center text-center mb-16 space-y-8">
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#E6FBF6]">
                PORTFOLIO
              </h2>

              {/* Category Jump Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {PORTFOLIO_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`cat-${cat.id}`);
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 rounded-lg border border-[#06D6A0]/30 bg-[#0C4137]/35 text-xs sm:text-sm font-medium text-[#E6FBF6] hover:bg-[#06D6A0] hover:text-[#051310] hover:border-[#06D6A0] transition-colors duration-150 cursor-pointer whitespace-nowrap"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Each Category as an Independent Vertical Section */}
            <div className="space-y-24">
              {PORTFOLIO_CATEGORIES.map((category) => {
                const categoryItems = portfolioProjects.filter(
                  (p) => p.category === category.id
                );
                const aspectClass =
                  category.id === 'social' ? 'aspect-square' : 'aspect-[4/3]';

                return (
                  <div
                    key={category.id}
                    id={`cat-${category.id}`}
                    className="scroll-mt-24 flex flex-col items-center"
                  >
                    {/* Stylish Category Button/Tab Header */}
                    <div className="mb-10 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setSeeMoreCategory(category.id)}
                        className="px-6 py-2.5 rounded-lg bg-[#0C4137]/55 border border-[#06D6A0]/35 font-display text-base sm:text-lg font-semibold text-[#E6FBF6] hover:border-[#06D6A0] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {category.label}
                      </button>
                    </div>

                    {/* 3 Center-Aligned Previews + 3s Auto-Rotation + See More Button */}
                    <AutoThreeGrid
                      items={categoryItems}
                      intervalMs={3000}
                      aspectClass={aspectClass}
                      onSelectWork={(item) => setLightboxWork(item)}
                      onSeeMore={() => setSeeMoreCategory(category.id)}
                      seeMoreLabel="See More"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            8. SKILLS SECTION (Exact CV Skills + Professional Qualifications)
            =================================================================== */}
        <section
          id="skills"
          className="py-24 lg:py-32 border-b border-[#06D6A0]/12"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              {/* Left Column: Software Skills from CV */}
              <div className="lg:col-span-6 space-y-8">
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#E6FBF6]">
                  SKILLS
                </h2>

                <div className="space-y-6">
                  {CV_DATA.skills.map((skill) => (
                    <div key={skill.name} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-[#E6FBF6]">
                          {skill.name}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#0C4137]/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.barFill}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-[#06D6A0]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Professional Qualification from CV */}
              <div className="lg:col-span-6 space-y-8">
                <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#E6FBF6]">
                  PROFESSIONAL QUALIFICATION
                </h3>

                <div className="divide-y divide-[#06D6A0]/15 border-t border-b border-[#06D6A0]/15">
                  {CV_DATA.qualifications.map((q) => (
                    <div
                      key={q.title}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <span className="font-display text-sm sm:text-base font-semibold text-[#E6FBF6]">
                        {q.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8AB5AA]">
                        <span>{q.institution}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">{q.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            9. EXPERIENCE SECTION (Exact CV Timeline, Zero Invented Data)
            =================================================================== */}
        <section
          id="experience"
          className="py-24 lg:py-32 border-b border-[#06D6A0]/12"
        >
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#E6FBF6] mb-14">
              EXPERIENCE
            </h2>

            <div className="divide-y divide-[#06D6A0]/15 border-t border-b border-[#06D6A0]/15">
              {CV_DATA.experience.map((exp, index) => (
                <motion.div
                  key={`${exp.company}-${exp.period}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium tracking-wide text-[#06D6A0]">
                      {exp.role}
                    </p>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#E6FBF6]">
                      {exp.company}
                    </h3>
                  </div>

                  <div className="text-sm sm:text-base font-mono-tabular text-[#8AB5AA] whitespace-nowrap">
                    {exp.period}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            10. ABOUT SECTION (Exact CV Summary, Education, Interests, References)
            =================================================================== */}
        <section
          id="about"
          className="py-24 lg:py-32 border-b border-[#06D6A0]/12"
        >
          <div className="mx-auto max-w-6xl px-6 space-y-20">
            {/* Designer Profile Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-4">
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#E6FBF6]">
                  ABOUT
                </h2>
              </div>
              <div className="lg:col-span-8 space-y-6">
                <p className="text-lg sm:text-xl leading-relaxed text-[#E6FBF6] font-normal max-w-[68ch]">
                  {CV_DATA.about}
                </p>

                {/* Interests (Unboxed clean metadata with typographic separators) */}
                <div className="pt-4 border-t border-[#06D6A0]/15 flex flex-wrap items-center gap-3 text-sm text-[#8AB5AA]">
                  <span className="font-semibold text-[#E6FBF6]">INTERESTS:</span>
                  {CV_DATA.interests.map((interest, idx) => (
                    <React.Fragment key={interest}>
                      <span>{interest}</span>
                      {idx < CV_DATA.interests.length - 1 && (
                        <span aria-hidden="true" className="text-[#06D6A0]">
                          ·
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Education from CV */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-12 border-t border-[#06D6A0]/15">
              <div className="lg:col-span-4">
                <h3 className="font-display text-2xl font-bold tracking-tight text-[#E6FBF6]">
                  EDUCATION
                </h3>
              </div>
              <div className="lg:col-span-8 divide-y divide-[#06D6A0]/15 border-t border-b border-[#06D6A0]/15">
                {CV_DATA.education.map((edu) => (
                  <div
                    key={edu.degree}
                    className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <h4 className="font-display text-base sm:text-lg font-bold text-[#E6FBF6]">
                        {edu.degree}
                      </h4>
                      <p className="text-sm text-[#8AB5AA]">{edu.institution}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-mono-tabular text-[#8AB5AA] whitespace-nowrap">
                      <span>{edu.period}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#06D6A0]">{edu.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* References from CV */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-12 border-t border-[#06D6A0]/15">
              <div className="lg:col-span-4">
                <h3 className="font-display text-2xl font-bold tracking-tight text-[#E6FBF6]">
                  REFERENCE
                </h3>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {CV_DATA.references.map((ref) => (
                  <div
                    key={ref.name}
                    className="space-y-1.5 border-l-2 border-[#06D6A0]/40 pl-4"
                  >
                    <h4 className="font-display text-base font-bold text-[#E6FBF6]">
                      {ref.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#8AB5AA]">{ref.role}</p>
                    <p className="text-xs sm:text-sm font-mono-tabular text-[#06D6A0]">
                      Mobile : {ref.mobile}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            11 & 12. CONTACT SECTION & SOCIAL MEDIA LINKS
            =================================================================== */}
        <section id="contact" className="py-24 lg:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-4">
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#E6FBF6]">
                  CONTACT
                </h2>
                <p className="text-sm sm:text-base text-[#8AB5AA]">
                  {CV_DATA.name} · {CV_DATA.designation}
                </p>
              </div>

              <div className="lg:col-span-7 space-y-8">
                <div className="divide-y divide-[#06D6A0]/15 border-t border-b border-[#06D6A0]/15">
                  <a
                    href={`tel:${CV_DATA.contact.phone}`}
                    className="py-5 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <Phone className="h-4 w-4 text-[#06D6A0]" />
                      <span className="text-sm text-[#8AB5AA]">Phone</span>
                    </div>
                    <span className="font-mono-tabular text-base sm:text-lg font-medium text-[#E6FBF6] group-hover:text-[#06D6A0] transition-colors">
                      {CV_DATA.contact.phone}
                    </span>
                  </a>

                  <a
                    href={`mailto:${CV_DATA.contact.email}`}
                    className="py-5 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <Mail className="h-4 w-4 text-[#06D6A0]" />
                      <span className="text-sm text-[#8AB5AA]">Email</span>
                    </div>
                    <span className="text-base sm:text-lg font-medium text-[#E6FBF6] group-hover:text-[#06D6A0] transition-colors break-all">
                      {CV_DATA.contact.email}
                    </span>
                  </a>

                  <div className="py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <MapPin className="h-4 w-4 text-[#06D6A0]" />
                      <span className="text-sm text-[#8AB5AA]">Location</span>
                    </div>
                    <span className="text-base sm:text-lg font-medium text-[#E6FBF6]">
                      {CV_DATA.contact.location}
                    </span>
                  </div>
                </div>

                {/* Social Links (Behance & Facebook) */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <a
                    href={CV_DATA.socials.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-sm font-semibold text-[#051310] hover:bg-[#06D6A0]/90 transition-colors whitespace-nowrap"
                  >
                    <span>Behance</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>

                  <a
                    href={CV_DATA.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#06D6A0]/35 bg-[#0C4137]/30 text-sm font-medium text-[#E6FBF6] hover:border-[#06D6A0] hover:text-[#06D6A0] transition-colors whitespace-nowrap"
                  >
                    <span>Facebook</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          CLEAN MINIMAL FOOTER
          ===================================================================== */}
      <footer className="border-t border-[#06D6A0]/15 bg-[#040E0C] py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-display text-sm font-bold tracking-wide text-[#E6FBF6]">
              {CV_DATA.name}
            </span>
            <span className="text-xs text-[#8AB5AA]">
              © {new Date().getFullYear()} {CV_DATA.name}. All rights reserved.
            </span>
          </div>

          {/* Circular Brand-Tinted Social Icon Buttons (LinkedIn, Behance, Facebook, Instagram) */}
          <div className="flex items-center gap-4">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="group h-12 w-12 rounded-full bg-[#081018] border border-[#0A66C2]/40 hover:border-[#0A66C2] flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(10,102,194,0.35)]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-[#0A66C2] transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
              </svg>
            </a>

            {/* Behance */}
            <a
              href={CV_DATA.socials.behance}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Behance"
              title="Behance"
              className="group h-12 w-12 rounded-full bg-[#081018] border border-[#1769FF]/40 hover:border-[#1769FF] flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(23,105,255,0.35)]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-[#1769FF] transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M22 7h-7V5h7v2Zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.722 1.17 2.487 2.753 2.487 1.158 0 1.964-.558 2.275-1.458h2.728Zm-7.668-4h4.818c-.105-1.351-.936-2.219-2.365-2.219-1.466 0-2.277.868-2.453 2.219Zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.189 8.061ZM3 11h3.584c2.508 0 2.906-3-.312-3H3v3Zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016Z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href={CV_DATA.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
              className="group h-12 w-12 rounded-full bg-[#081018] border border-[#1877F2]/40 hover:border-[#1877F2] flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(24,119,242,0.35)]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-[#1877F2] transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="group h-12 w-12 rounded-full bg-[#081018] border border-[#E1306C]/40 hover:border-[#E1306C] flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(225,48,108,0.35)]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-[#E1306C] transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3Z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          7. "SEE MORE" FULL CATEGORY GALLERY MODAL
          ===================================================================== */}
      <AnimatePresence>
        {seeMoreCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#051310]/95 backdrop-blur-xl overflow-y-auto p-6 sm:p-10"
          >
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between pb-8 mb-10 border-b border-[#06D6A0]/20">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#E6FBF6]">
                  {
                    PORTFOLIO_CATEGORIES.find((c) => c.id === seeMoreCategory)
                      ?.label
                  }
                </h2>
                <button
                  type="button"
                  onClick={() => setSeeMoreCategory(null)}
                  aria-label="Close full gallery"
                  className="h-10 w-10 rounded-full border border-[#06D6A0]/30 flex items-center justify-center text-[#E6FBF6] hover:border-[#06D6A0] hover:text-[#06D6A0] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {portfolioProjects
                  .filter((p) => p.category === seeMoreCategory)
                  .map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <PortfolioMediaCard
                        mediaUrl={item.mediaUrl}
                        mediaType={item.mediaType}
                        motionPreset={item.motionPreset}
                        aspectClass={
                          seeMoreCategory === 'social'
                            ? 'aspect-square'
                            : 'aspect-[4/3]'
                        }
                        onClick={() => setLightboxWork(item)}
                      />
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          FULLSCREEN LIGHTBOX MEDIA VIEWER (Zero Clutter)
          ===================================================================== */}
      <AnimatePresence>
        {lightboxWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxWork(null)}
            className="fixed inset-0 z-50 bg-[#051310]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10"
          >
            <button
              type="button"
              onClick={() => setLightboxWork(null)}
              aria-label="Close preview"
              className="fixed top-6 right-6 z-50 h-11 w-11 rounded-full bg-[#071D18] border border-[#06D6A0]/40 flex items-center justify-center text-[#E6FBF6] hover:text-[#06D6A0] hover:border-[#06D6A0] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[86vh] flex items-center justify-center overflow-hidden rounded-2xl border border-[#06D6A0]/25 bg-[#071D18]"
            >
              {lightboxWork.mediaType === 'video' ||
              /\.(mp4|webm|ogg)(\?.*)?$/i.test(lightboxWork.mediaUrl) ? (
                <video
                  src={lightboxWork.mediaUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-h-[84vh] w-auto max-w-full object-contain"
                />
              ) : (
                <img
                  src={lightboxWork.mediaUrl}
                  alt="Artwork fullscreen view"
                  referrerPolicy="no-referrer"
                  className="max-h-[84vh] w-auto max-w-full object-contain"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          ADMIN / PORTFOLIO CONTENT MANAGER MODAL
          ===================================================================== */}
      <PortfolioManagerModal
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        userEmail={currentUser?.email || null}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        heroPhotoUrl={heroPhotoUrl}
        onUpdateHeroPhoto={handleUpdateHeroPhoto}
        bestWorks={bestWorks}
        onAddBestWork={handleAddBestWork}
        onDeleteBestWork={handleDeleteBestWork}
        portfolioProjects={portfolioProjects}
        onAddPortfolioProject={handleAddPortfolioProject}
        onUpdatePortfolioCategory={handleUpdatePortfolioCategory}
        onDeletePortfolioProject={handleDeletePortfolioProject}
      />
    </div>
  );
}
