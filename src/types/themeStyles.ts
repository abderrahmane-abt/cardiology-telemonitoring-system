export type UIStyleId = 'ICU_OBSIDIAN';     // Style 4: Hospital Critical Care Cockpit (IntelliVue)

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
  // Style 4: ICU_OBSIDIAN: Hospital Critical Care Cockpit (IntelliVue / Philips)
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
