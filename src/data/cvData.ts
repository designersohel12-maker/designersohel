export type MediaType = 'image' | 'video' | 'motion-canvas';
export type PortfolioCategory = 'motion' | 'social' | 'print';

export interface BestWorkItem {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  motionPreset?: 'emerald-ribbons' | 'kinetic-grid' | 'luxury-monogram';
  order: number;
  visibility: 'public' | 'private';
  ownerId?: string;
}

export interface PortfolioProjectItem {
  id: string;
  category: PortfolioCategory;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  motionPreset?: 'emerald-ribbons' | 'kinetic-grid' | 'luxury-monogram' | 'broadcast-reel' | 'orbital-prism' | 'architectural-wave';
  order: number;
  visibility: 'public' | 'private';
  ownerId?: string;
}

// Helper to create crisp, self-contained high-resolution SVG artworks for additional gallery slots
function svgToDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const ARTWORK_SVG = {
  bestWorkEditorial: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
      <defs>
        <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#04110E"/>
          <stop offset="55%" stop-color="#0C4137"/>
          <stop offset="100%" stop-color="#051814"/>
        </linearGradient>
        <radialGradient id="glow1" cx="70%" cy="30%" r="55%">
          <stop offset="0%" stop-color="#06D6A0" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#0C4137" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06D6A0"/>
          <stop offset="100%" stop-color="#E6FBF6"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg1)"/>
      <rect width="1200" height="900" fill="url(#glow1)"/>
      <g stroke="#E6FBF6" stroke-opacity="0.08" stroke-width="1">
        <line x1="150" y1="0" x2="150" y2="900"/>
        <line x1="600" y1="0" x2="600" y2="900"/>
        <line x1="1050" y1="0" x2="1050" y2="900"/>
        <line x1="0" y1="180" x2="1200" y2="180"/>
        <line x1="0" y1="720" x2="1200" y2="720"/>
      </g>
      <circle cx="600" cy="450" r="240" fill="none" stroke="url(#gold1)" stroke-width="2" stroke-opacity="0.6"/>
      <circle cx="600" cy="450" r="170" fill="#051310" stroke="#06D6A0" stroke-width="1.5" stroke-opacity="0.35"/>
      <path d="M 440 530 L 600 290 L 760 530 Z" fill="none" stroke="#06D6A0" stroke-width="6"/>
      <path d="M 490 530 L 600 365 L 710 530 Z" fill="#06D6A0" fill-opacity="0.18" stroke="#E6FBF6" stroke-width="2"/>
      <rect x="460" y="570" width="280" height="4" fill="#06D6A0" rx="2"/>
    </svg>
  `),
  socialHealthcare: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
      <defs>
        <linearGradient id="shBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#07221C"/>
          <stop offset="100%" stop-color="#04100D"/>
        </linearGradient>
        <linearGradient id="shAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06D6A0"/>
          <stop offset="100%" stop-color="#0C4137"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1080" fill="url(#shBg)"/>
      <rect x="90" y="90" width="900" height="900" rx="36" fill="none" stroke="#06D6A0" stroke-opacity="0.22" stroke-width="2"/>
      <circle cx="540" cy="540" r="290" fill="url(#shAccent)" fill-opacity="0.18"/>
      <circle cx="540" cy="540" r="210" fill="none" stroke="#E6FBF6" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="8 8"/>
      <g fill="#06D6A0">
        <rect x="495" y="360" width="90" height="360" rx="24"/>
        <rect x="360" y="495" width="360" height="90" rx="24"/>
      </g>
      <circle cx="540" cy="540" r="42" fill="#051310"/>
      <circle cx="540" cy="540" r="16" fill="#E6FBF6"/>
    </svg>
  `),
  socialFurnitureGrid: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
      <defs>
        <linearGradient id="sfBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0C4137"/>
          <stop offset="100%" stop-color="#051310"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1080" fill="url(#sfBg)"/>
      <rect x="120" y="120" width="400" height="520" rx="20" fill="#051310" stroke="#06D6A0" stroke-opacity="0.35" stroke-width="2"/>
      <rect x="560" y="120" width="400" height="240" rx="20" fill="#06D6A0" fill-opacity="0.15" stroke="#E6FBF6" stroke-opacity="0.2" stroke-width="1.5"/>
      <rect x="560" y="400" width="400" height="560" rx="20" fill="#071F1A" stroke="#06D6A0" stroke-opacity="0.3" stroke-width="2"/>
      <rect x="120" y="680" width="400" height="280" rx="20" fill="#E6FBF6" fill-opacity="0.06" stroke="#E6FBF6" stroke-opacity="0.2" stroke-width="1.5"/>
      <circle cx="320" cy="380" r="110" fill="none" stroke="#06D6A0" stroke-width="5"/>
      <path d="M 240 450 Q 320 300 400 450" fill="none" stroke="#E6FBF6" stroke-width="4"/>
      <circle cx="760" cy="680" r="120" fill="#06D6A0" fill-opacity="0.2"/>
      <rect x="680" y="600" width="160" height="160" rx="16" fill="none" stroke="#E6FBF6" stroke-width="3"/>
    </svg>
  `),
  socialMinimalPoster: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
      <rect width="1080" height="1080" fill="#051310"/>
      <circle cx="540" cy="540" r="380" fill="#0C4137" fill-opacity="0.55"/>
      <path d="M 260 720 C 360 360, 720 360, 820 720" fill="none" stroke="#06D6A0" stroke-width="12" stroke-linecap="round"/>
      <path d="M 320 720 C 400 440, 680 440, 760 720" fill="none" stroke="#E6FBF6" stroke-width="4" stroke-opacity="0.7" stroke-linecap="round"/>
      <circle cx="540" cy="370" r="46" fill="#06D6A0"/>
      <rect x="220" y="780" width="640" height="2" fill="#E6FBF6" fill-opacity="0.25"/>
    </svg>
  `),
  socialApparelLook: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
      <rect width="1080" height="1080" fill="#071B16"/>
      <g transform="translate(140, 140)">
        <rect width="800" height="800" fill="#051310" stroke="#06D6A0" stroke-opacity="0.4" stroke-width="2"/>
        <polygon points="400,120 680,640 120,640" fill="#0C4137" stroke="#06D6A0" stroke-width="3"/>
        <polygon points="400,220 590,580 210,580" fill="none" stroke="#E6FBF6" stroke-width="2" stroke-opacity="0.6"/>
        <circle cx="400" cy="440" r="64" fill="#06D6A0"/>
      </g>
    </svg>
  `),
  printBrandBook: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
      <rect width="1200" height="900" fill="#061713"/>
      <g transform="translate(160, 130)">
        <rect x="0" y="0" width="430" height="640" rx="8" fill="#E6FBF6" fill-opacity="0.95"/>
        <rect x="430" y="0" width="430" height="640" rx="8" fill="#0C4137" stroke="#06D6A0" stroke-opacity="0.3" stroke-width="2"/>
        <line x1="430" y1="0" x2="430" y2="640" stroke="#051310" stroke-width="6"/>
        <circle cx="215" cy="320" r="110" fill="#0C4137"/>
        <path d="M 165 320 L 215 240 L 265 320 L 215 400 Z" fill="#06D6A0"/>
        <rect x="520" y="140" width="250" height="240" fill="none" stroke="#06D6A0" stroke-width="3"/>
        <rect x="520" y="420" width="250" height="12" fill="#E6FBF6" fill-opacity="0.5" rx="4"/>
        <rect x="520" y="450" width="180" height="12" fill="#06D6A0" fill-opacity="0.7" rx="4"/>
      </g>
    </svg>
  `),
  printPackaging: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
      <rect width="1200" height="900" fill="#051310"/>
      <g transform="translate(220, 120)">
        <rect x="60" y="80" width="280" height="500" rx="12" fill="#0C4137" stroke="#06D6A0" stroke-width="2.5"/>
        <rect x="100" y="140" width="200" height="220" fill="#051310" stroke="#E6FBF6" stroke-opacity="0.25"/>
        <circle cx="200" cy="250" r="54" fill="#06D6A0"/>
        <rect x="400" y="180" width="300" height="400" rx="12" fill="#082821" stroke="#E6FBF6" stroke-opacity="0.25" stroke-width="2"/>
        <path d="M 460 380 L 550 260 L 640 380 Z" fill="#06D6A0" fill-opacity="0.85"/>
        <rect x="460" y="420" width="180" height="8" fill="#E6FBF6" fill-opacity="0.4" rx="4"/>
      </g>
    </svg>
  `),
  printPosterSeries: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
      <rect width="1200" height="900" fill="#071D18"/>
      <g transform="translate(130, 110)">
        <rect x="0" y="0" width="280" height="680" rx="6" fill="#051310" stroke="#06D6A0" stroke-opacity="0.4" stroke-width="2"/>
        <circle cx="140" cy="260" r="90" fill="#06D6A0"/>
        <circle cx="140" cy="420" r="90" fill="none" stroke="#E6FBF6" stroke-width="3"/>
        <rect x="330" y="0" width="280" height="680" rx="6" fill="#0C4137" stroke="#E6FBF6" stroke-opacity="0.25" stroke-width="2"/>
        <polygon points="470,150 570,510 370,510" fill="#E6FBF6" fill-opacity="0.9"/>
        <rect x="660" y="0" width="280" height="680" rx="6" fill="#051310" stroke="#06D6A0" stroke-opacity="0.4" stroke-width="2"/>
        <path d="M 710 200 C 800 200, 800 480, 890 480" fill="none" stroke="#06D6A0" stroke-width="14" stroke-linecap="round"/>
      </g>
    </svg>
  `),
  printStationery: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
      <rect width="1200" height="900" fill="#04100D"/>
      <rect x="160" y="110" width="480" height="680" rx="8" fill="#0C4137" stroke="#06D6A0" stroke-opacity="0.35" stroke-width="2"/>
      <rect x="220" y="180" width="120" height="12" fill="#06D6A0" rx="4"/>
      <rect x="220" y="210" width="260" height="6" fill="#E6FBF6" fill-opacity="0.3" rx="3"/>
      <rect x="700" y="160" width="340" height="210" rx="10" fill="#051310" stroke="#06D6A0" stroke-width="2.5"/>
      <circle cx="870" cy="265" r="42" fill="none" stroke="#06D6A0" stroke-width="4"/>
      <rect x="700" y="430" width="340" height="210" rx="10" fill="#E6FBF6"/>
      <circle cx="870" cy="535" r="42" fill="#0C4137"/>
    </svg>
  `),
  printEditorialSpread: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
      <rect width="1200" height="900" fill="#061914"/>
      <rect x="140" y="120" width="920" height="660" rx="12" fill="#051310" stroke="#06D6A0" stroke-opacity="0.3" stroke-width="2"/>
      <line x1="600" y1="120" x2="600" y2="780" stroke="#06D6A0" stroke-opacity="0.25" stroke-width="2"/>
      <circle cx="370" cy="450" r="150" fill="#0C4137"/>
      <circle cx="370" cy="450" r="95" fill="#06D6A0" fill-opacity="0.85"/>
      <rect x="670" y="240" width="310" height="220" rx="8" fill="#0C4137"/>
      <rect x="670" y="500" width="310" height="10" fill="#E6FBF6" fill-opacity="0.4" rx="4"/>
      <rect x="670" y="530" width="240" height="10" fill="#06D6A0" fill-opacity="0.6" rx="4"/>
    </svg>
  `),
};

// Independent data source for Home > BEST WORK section (6 items so 3-item window rotates smoothly every 3s)
export const DEFAULT_BEST_WORKS: BestWorkItem[] = [
  {
    id: 'bw_1',
    mediaUrl: '/src/assets/images/portfolio_motion_luxury_1790929343718.jpg',
    mediaType: 'image',
    motionPreset: 'emerald-ribbons',
    order: 1,
    visibility: 'public',
  },
  {
    id: 'bw_2',
    mediaUrl: '/src/assets/images/portfolio_social_lifestyle_1790929373544.jpg',
    mediaType: 'image',
    order: 2,
    visibility: 'public',
  },
  {
    id: 'bw_3',
    mediaUrl: '/src/assets/images/portfolio_print_identity_1790929410997.jpg',
    mediaType: 'image',
    order: 3,
    visibility: 'public',
  },
  {
    id: 'bw_4',
    mediaUrl: '/src/assets/images/portfolio_motion_kinetic_1790929358432.jpg',
    mediaType: 'image',
    motionPreset: 'kinetic-grid',
    order: 4,
    visibility: 'public',
  },
  {
    id: 'bw_5',
    mediaUrl: '/src/assets/images/portfolio_social_fashion_1790929395938.jpg',
    mediaType: 'image',
    order: 5,
    visibility: 'public',
  },
  {
    id: 'bw_6',
    mediaUrl: ARTWORK_SVG.bestWorkEditorial,
    mediaType: 'image',
    motionPreset: 'luxury-monogram',
    order: 6,
    visibility: 'public',
  },
];

// Independent data source for PORTFOLIO section across the 3 categories (6 items per category = 18 items)
export const DEFAULT_PORTFOLIO_PROJECTS: PortfolioProjectItem[] = [
  // Category 1: Motion Design (6 items)
  {
    id: 'pm_1',
    category: 'motion',
    mediaUrl: '/src/assets/images/portfolio_motion_luxury_1790929343718.jpg',
    mediaType: 'image',
    motionPreset: 'emerald-ribbons',
    order: 1,
    visibility: 'public',
  },
  {
    id: 'pm_2',
    category: 'motion',
    mediaUrl: '/src/assets/images/portfolio_motion_kinetic_1790929358432.jpg',
    mediaType: 'image',
    motionPreset: 'kinetic-grid',
    order: 2,
    visibility: 'public',
  },
  {
    id: 'pm_3',
    category: 'motion',
    mediaUrl: ARTWORK_SVG.bestWorkEditorial,
    mediaType: 'image',
    motionPreset: 'luxury-monogram',
    order: 3,
    visibility: 'public',
  },
  {
    id: 'pm_4',
    category: 'motion',
    mediaUrl: '/src/assets/images/portfolio_motion_luxury_1790929343718.jpg',
    mediaType: 'image',
    motionPreset: 'broadcast-reel',
    order: 4,
    visibility: 'public',
  },
  {
    id: 'pm_5',
    category: 'motion',
    mediaUrl: '/src/assets/images/portfolio_motion_kinetic_1790929358432.jpg',
    mediaType: 'image',
    motionPreset: 'orbital-prism',
    order: 5,
    visibility: 'public',
  },
  {
    id: 'pm_6',
    category: 'motion',
    mediaUrl: ARTWORK_SVG.bestWorkEditorial,
    mediaType: 'image',
    motionPreset: 'architectural-wave',
    order: 6,
    visibility: 'public',
  },

  // Category 2: Social Media Post Design (6 items)
  {
    id: 'ps_1',
    category: 'social',
    mediaUrl: '/src/assets/images/portfolio_social_lifestyle_1790929373544.jpg',
    mediaType: 'image',
    order: 1,
    visibility: 'public',
  },
  {
    id: 'ps_2',
    category: 'social',
    mediaUrl: '/src/assets/images/portfolio_social_fashion_1790929395938.jpg',
    mediaType: 'image',
    order: 2,
    visibility: 'public',
  },
  {
    id: 'ps_3',
    category: 'social',
    mediaUrl: ARTWORK_SVG.socialHealthcare,
    mediaType: 'image',
    order: 3,
    visibility: 'public',
  },
  {
    id: 'ps_4',
    category: 'social',
    mediaUrl: ARTWORK_SVG.socialFurnitureGrid,
    mediaType: 'image',
    order: 4,
    visibility: 'public',
  },
  {
    id: 'ps_5',
    category: 'social',
    mediaUrl: ARTWORK_SVG.socialMinimalPoster,
    mediaType: 'image',
    order: 5,
    visibility: 'public',
  },
  {
    id: 'ps_6',
    category: 'social',
    mediaUrl: ARTWORK_SVG.socialApparelLook,
    mediaType: 'image',
    order: 6,
    visibility: 'public',
  },

  // Category 3: Print Design (6 items)
  {
    id: 'pp_1',
    category: 'print',
    mediaUrl: '/src/assets/images/portfolio_print_identity_1790929410997.jpg',
    mediaType: 'image',
    order: 1,
    visibility: 'public',
  },
  {
    id: 'pp_2',
    category: 'print',
    mediaUrl: ARTWORK_SVG.printBrandBook,
    mediaType: 'image',
    order: 2,
    visibility: 'public',
  },
  {
    id: 'pp_3',
    category: 'print',
    mediaUrl: ARTWORK_SVG.printPackaging,
    mediaType: 'image',
    order: 3,
    visibility: 'public',
  },
  {
    id: 'pp_4',
    category: 'print',
    mediaUrl: ARTWORK_SVG.printPosterSeries,
    mediaType: 'image',
    order: 4,
    visibility: 'public',
  },
  {
    id: 'pp_5',
    category: 'print',
    mediaUrl: ARTWORK_SVG.printStationery,
    mediaType: 'image',
    order: 5,
    visibility: 'public',
  },
  {
    id: 'pp_6',
    category: 'print',
    mediaUrl: ARTWORK_SVG.printEditorialSpread,
    mediaType: 'image',
    order: 6,
    visibility: 'public',
  },
];

// 100% Exact CV Data — Nothing invented
export const CV_DATA = {
  name: 'MD. SOHEL RANA',
  designation: 'GRAPHIC & MOTION DESIGNER',
  about:
    'Creative Graphic Designer with experience in healthcare, furniture, and clothing brands. I deliver clean, impactful visuals that strengthen identity, support marketing goals, and connect with audiences through consistent, thoughtful design.',
  contact: {
    phone: '+88001670509840',
    email: 'soheldesigner90@gmail.com',
    location: 'MIRPUR - 12, DHAKA -1216',
  },
  socials: {
    behance: 'https://www.behance.net/mdsohelrana1990',
    behanceDisplay: 'www.behance.net/mdsohelrana1990',
    facebook: 'https://www.facebook.com/Sohail4648',
    facebookDisplay: 'facebook.com/Sohail4648',
  },
  skills: [
    { name: 'Photoshop', barFill: 92 },
    { name: 'Illustrator', barFill: 92 },
    { name: 'Premier Pro', barFill: 88 },
    { name: 'After Effect', barFill: 90 },
    { name: 'Figma', barFill: 86 },
  ],
  qualifications: [
    {
      title: 'GOOGLE UX DESIGN',
      institution: 'Coursera',
      duration: '6 month',
    },
    {
      title: 'UI/UX DESIGN',
      institution: 'TALENTIVE IT',
      duration: '6 month',
    },
    {
      title: 'GRAPHIC DESIGN',
      institution: 'Creative Clan',
      duration: '6 month',
    },
    {
      title: 'MOTION GRAPHIC',
      institution: 'graphic design live class',
      duration: '6 month',
    },
    {
      title: 'ENGLISH SPOKEN',
      institution: 'F.M method',
      duration: '6 month',
    },
  ],
  experience: [
    {
      role: 'SENIOR GRAPHIC & MOTION DESIGNER',
      company: 'JK LIFESTYLE',
      period: '2024 - PRESENT',
    },
    {
      role: 'SENIOR GRAPHIC & MOTION DESIGNER',
      company: 'ISHO LIMITED',
      period: '2023 - 2024',
    },
    {
      role: 'UI DESIGNER',
      company: 'DARAZ BANGLADESH',
      period: '2021 - 2023',
    },
    {
      role: 'GRAPHIC & MOTION DESIGNER',
      company: 'RISE CLOTHING BRAND',
      period: '2019 - 2021',
    },
    {
      role: 'GRAPHIC DESIGNER',
      company: 'TEXMART TRADING COMPANY',
      period: '2017 - 2019',
    },
  ],
  education: [
    {
      degree: 'MASTER OF BUSINESS ADMINISTRATION (MBA)',
      institution: 'Bangladesh University of Business and Technology',
      period: '2014 - 2016',
      result: 'RESULT : 3.23',
    },
    {
      degree: 'BACHELOR OF BUSINESS STUDIES (BSS)',
      institution: 'National University',
      period: '2007 - 2013',
      result: 'RESULT : 2nd Class',
    },
    {
      degree: 'HIGHER SECONDARY CERTIFICATE (HSC)',
      institution: 'Adamjee Cantonment College',
      period: '2005 - 2007',
      result: 'RESULT : 4.10',
    },
    {
      degree: 'SECONDARY SCHOOL CERTIFICATE (SSC)',
      institution: 'Adamjee Cantonment College',
      period: '2003 - 2005',
      result: 'RESULT : 4.19',
    },
  ],
  interests: ['Travel', 'Music', 'Videography', 'Gaming'],
  references: [
    {
      name: 'NAJIUR RAHMAN',
      role: 'HEAD OF MARKETING RISE',
      mobile: '01733-101137',
    },
    {
      name: 'SALIM AL DEEN FATHME',
      role: 'LEAD DESIGNER IN DARAZ',
      mobile: '01611-225700',
    },
  ],
};
