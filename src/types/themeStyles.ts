export type UIStyleId = 
  | 'MEDICARE_LIGHT'   // Style 1: Clean White Medical SaaS (Behance / Mara Bureau)
  | 'CARDIOCARE_OCEAN'  // Style 2: Deep Aquatic Bioluminescent Navy (NickelFox)
  | 'LUME_CYBER'        // Style 3: Cyber-Holo Neon X-Ray (Lume Cardiac)
  | 'ICU_OBSIDIAN';     // Style 4: Hospital Critical Care Cockpit (IntelliVue)

export interface UIStyleConfig {
  id: UIStyleId;
  name: string;
  shortLabel: string;
  tagline: string;
  inspiration: string;
  themeMode: 'light' | 'dark';
  
  // App Shell Colors
  appBg: string;
  mainText: string;
  subText: string;
  sidebarBg: string;
  sidebarBorder: string;
  topbarBg: string;
  topbarBorder: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  
  // Primary Accents
  accentPrimary: string;
  accentSecondary: string;
  accentDanger: string;
  accentWarning: string;
  
  // 3D Heart Material & Shader Configuration
  heart3D: {
    ventricleColor: number;
    aortaColor: number;
    pulmColor: number;
    atriaColor: number;
    coronaryColor: number;
    coronaryEmissive: number;
    coreLightColor: number;
    auraRingColor: number;
    roughness: number;
    metalness: number;
    clearcoat: number;
    transmission: number; // For holographic/glass look
    opacity: number;
    transparent: boolean;
    emissiveColor: number;
    emissiveIntensity: number;
    ambientLightIntensity: number;
    ambientGlowStyle: string;
  };
}

export const UI_STYLES: Record<UIStyleId, UIStyleConfig> = {
  // 1. MEDICARE_LIGHT: Clean White SaaS (Inspired by Mara Bureau & Medicare)
  MEDICARE_LIGHT: {
    id: 'MEDICARE_LIGHT',
    name: 'Style 1 : Medicare Clean',
    shortLabel: 'Medicare Blanc',
    tagline: 'Design épuré moderne, cartes blanches aux ombres douces et accents pastel',
    inspiration: 'Dribbble Mara Bureau & Medicare SaaS',
    themeMode: 'light',

    appBg: 'bg-slate-50',
    mainText: 'text-slate-900',
    subText: 'text-slate-500',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-slate-200/90',
    topbarBg: 'bg-white/95',
    topbarBorder: 'border-slate-200/80',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200/90 hover:border-slate-300',
    cardShadow: 'shadow-sm hover:shadow-md shadow-slate-200/60',

    accentPrimary: '#10b981',   // Emerald
    accentSecondary: '#0ea5e9', // Sky blue
    accentDanger: '#f43f5e',    // Coral Rose
    accentWarning: '#f59e0b',   // Amber

    heart3D: {
      ventricleColor: 0xe11d48, // Rich biological pinkish red
      aortaColor: 0xef4444,
      pulmColor: 0x3b82f6,
      atriaColor: 0xc2410c,
      coronaryColor: 0xffedd5,
      coronaryEmissive: 0xf97316,
      coreLightColor: 0xff2244,
      auraRingColor: 0x10b981,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.65,
      transmission: 0.0,
      opacity: 1.0,
      transparent: false,
      emissiveColor: 0x330505,
      emissiveIntensity: 0.15,
      ambientLightIntensity: 1.45,
      ambientGlowStyle: 'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.03) 42%, transparent 68%)'
    }
  },

  // 2. CARDIOCARE_OCEAN: Deep Aquatic Bioluminescent Navy (Inspired by NickelFox CardioCare)
  CARDIOCARE_OCEAN: {
    id: 'CARDIOCARE_OCEAN',
    name: 'Style 2 : CardioCare Ocean',
    shortLabel: 'CardioCare Nuit',
    tagline: 'Fond bleu nuit profond, bioluminescence cardiaque et verre fumé aquatique',
    inspiration: 'Dribbble NickelFox CardioCare',
    themeMode: 'dark',

    appBg: 'bg-[#070d1e]',
    mainText: 'text-slate-100',
    subText: 'text-sky-300/70',
    sidebarBg: 'bg-[#0a1226]',
    sidebarBorder: 'border-sky-900/40',
    topbarBg: 'bg-[#0a1226]/90',
    topbarBorder: 'border-sky-900/40',
    cardBg: 'bg-[#0e1833]/85',
    cardBorder: 'border-sky-800/40 hover:border-sky-500/50',
    cardShadow: 'shadow-lg shadow-sky-950/50',

    accentPrimary: '#06b6d4',   // Oceanic Cyan
    accentSecondary: '#38bdf8', // Light Sky
    accentDanger: '#f43f5e',    // Bioluminescent Coral
    accentWarning: '#f59e0b',   // Warm Amber

    heart3D: {
      ventricleColor: 0xdc2626, // Glowing deep crimson
      aortaColor: 0xe11d48,
      pulmColor: 0x2563eb,
      atriaColor: 0x9a3412,
      coronaryColor: 0x67e8f9,  // Glowing cyan-gold vessels
      coronaryEmissive: 0x06b6d4,
      coreLightColor: 0xf43f5e,
      auraRingColor: 0x06b6d4,  // Cyan pulse aura
      roughness: 0.22,
      metalness: 0.18,
      clearcoat: 0.9,
      transmission: 0.08,       // Slight fleshy subsurface translucency
      opacity: 0.98,
      transparent: true,
      emissiveColor: 0x660818,
      emissiveIntensity: 0.55,  // Glowing interior!
      ambientLightIntensity: 1.15,
      ambientGlowStyle: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.2) 0%, rgba(244, 63, 94, 0.1) 40%, transparent 70%)'
    }
  },

  // 3. LUME_CYBER: Holographic Neon X-Ray (Inspired by Lume Cardiac Monitoring)
  LUME_CYBER: {
    id: 'LUME_CYBER',
    name: 'Style 3 : Lume Cyber-XRay',
    shortLabel: 'Lume Cyber',
    tagline: 'Cœur holographique translucide cyan, artères néon incandescentes et noir pur',
    inspiration: 'Dribbble Lume Cardiac Monitoring',
    themeMode: 'dark',

    appBg: 'bg-[#040508]',
    mainText: 'text-cyan-50',
    subText: 'text-cyan-400/60',
    sidebarBg: 'bg-[#080a10]',
    sidebarBorder: 'border-cyan-500/20',
    topbarBg: 'bg-[#080a10]/95',
    topbarBorder: 'border-cyan-500/20',
    cardBg: 'bg-[#0d1017]/90',
    cardBorder: 'border-cyan-500/25 hover:border-cyan-400/60',
    cardShadow: 'shadow-lg shadow-cyan-950/40',

    accentPrimary: '#00f2fe',   // Electric Neon Cyan
    accentSecondary: '#4facfe', // Laser Blue
    accentDanger: '#ff3838',    // Laser Red
    accentWarning: '#ff9f43',   // Neon Orange

    heart3D: {
      ventricleColor: 0x0ea5e9, // Translucent glass/cyan body
      aortaColor: 0x38bdf8,
      pulmColor: 0x0284c7,
      atriaColor: 0x0369a1,
      coronaryColor: 0xff3838,  // Fiery glowing neon red internal network!
      coronaryEmissive: 0xff1744,
      coreLightColor: 0x00f2fe, // Neon cyan core light
      auraRingColor: 0x00f2fe,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      transmission: 0.75,       // High holographic glass translucency!
      opacity: 0.85,
      transparent: true,
      emissiveColor: 0x0284c7,
      emissiveIntensity: 0.45,
      ambientLightIntensity: 1.0,
      ambientGlowStyle: 'radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.22) 0%, rgba(255, 56, 56, 0.1) 45%, transparent 72%)'
    }
  },

  // 4. ICU_OBSIDIAN: Hospital Critical Care Cockpit (IntelliVue / Philips)
  ICU_OBSIDIAN: {
    id: 'ICU_OBSIDIAN',
    name: 'Style 4 : ICU Obsidian',
    shortLabel: 'ICU Hôpital',
    tagline: 'Moniteur de réanimation hospitalière, noir absolu OLED et trames haute visibilité',
    inspiration: 'Moniteurs Philips IntelliVue / GE Healthcare',
    themeMode: 'dark',

    appBg: 'bg-[#050811]',
    mainText: 'text-slate-100',
    subText: 'text-slate-400',
    sidebarBg: 'bg-[#070b16]',
    sidebarBorder: 'border-slate-800/80',
    topbarBg: 'bg-[#070b16]/95',
    topbarBorder: 'border-slate-800/80',
    cardBg: 'bg-[#0a0f1d]/90',
    cardBorder: 'border-slate-800/80 hover:border-slate-700',
    cardShadow: 'shadow-xl shadow-slate-950/60',

    accentPrimary: '#10b981',   // Surgical Green
    accentSecondary: '#06b6d4', // Cyan
    accentDanger: '#f43f5e',    // Ruby Alert
    accentWarning: '#f59e0b',   // Warning Amber

    heart3D: {
      ventricleColor: 0xbe123c, // Anatomical hospital red
      aortaColor: 0xe11d48,
      pulmColor: 0x2563eb,
      atriaColor: 0x9a3412,
      coronaryColor: 0xffedd5,
      coronaryEmissive: 0xf97316,
      coreLightColor: 0xff1e38,
      auraRingColor: 0x10b981,
      roughness: 0.32,
      metalness: 0.06,
      clearcoat: 0.7,
      transmission: 0.0,
      opacity: 1.0,
      transparent: false,
      emissiveColor: 0x450a0a,
      emissiveIntensity: 0.25,
      ambientLightIntensity: 1.25,
      ambientGlowStyle: 'radial-gradient(circle at 50% 50%, rgba(225, 29, 72, 0.15) 0%, rgba(225, 29, 72, 0.03) 45%, transparent 70%)'
    }
  }
};
