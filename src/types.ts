import { User } from "firebase/auth";

export interface AIOutline {
  titleSlide: {
    title: string;
    subtitle: string;
    welcomeMessage: string;
  };
  rubricsExtra: {
    rubricId: string;
    slideSubheading: string;
    presenterNote: string;
    targetLevel4Emphasis: string;
    practiceScenario: string;
    diagnosticAnswer: number;
    diagnosticJustification: string;
  }[];
}

export interface CustomPresentationSettings {
  title: string;
  presenterName: string;
  institution: string;
  trainingFocus: string;
  slideTone: string;
  customContext: string;
  selectedRubrics: string[];
}

export type ThemeId = "midnight" | "slate" | "emerald" | "lavender";

export interface SlideTheme {
  id: ThemeId;
  name: string;
  bgColor: string;  // CSS class
  textColor: string; // CSS class
  ambientBg: string; // CSS class
  accentColor: string; // CSS class
  targetBadgeColor: string; // CSS class
  dividerColor: string; // CSS class
  cardBg: string; // CSS class
  // Hex equivalents for Google Slides API mapping
  rgbBg: { red: number; green: number; blue: number };
  rgbText: { red: number; green: number; blue: number };
  rgbAccent: { red: number; green: number; blue: number };
  rgbCard: { red: number; green: number; blue: number };
}

export const SLIDE_THEMES: SlideTheme[] = [
  {
    id: "midnight",
    name: "Midnight Executive",
    bgColor: "bg-slate-900",
    textColor: "text-slate-100",
    ambientBg: "bg-slate-950",
    accentColor: "text-blue-400 border-blue-500/30",
    targetBadgeColor: "bg-blue-900/40 text-blue-300 border-blue-400/30",
    dividerColor: "border-slate-800",
    cardBg: "bg-slate-900 border-slate-800",
    rgbBg: { red: 0.06, green: 0.09, blue: 0.16 },
    rgbText: { red: 0.95, green: 0.96, blue: 0.98 },
    rgbAccent: { red: 0.38, green: 0.61, blue: 1.0 },
    rgbCard: { red: 0.09, green: 0.13, blue: 0.24 },
  },
  {
    id: "slate",
    name: "Charcoal Minimal",
    bgColor: "bg-stone-900",
    textColor: "text-stone-100",
    ambientBg: "bg-stone-950",
    accentColor: "text-amber-400 border-amber-500/30",
    targetBadgeColor: "bg-amber-900/40 text-amber-300 border-amber-400/30",
    dividerColor: "border-stone-800",
    cardBg: "bg-stone-900 border-stone-800",
    rgbBg: { red: 0.11, green: 0.11, blue: 0.11 },
    rgbText: { red: 0.96, green: 0.96, blue: 0.94 },
    rgbAccent: { red: 0.96, green: 0.64, blue: 0.12 },
    rgbCard: { red: 0.15, green: 0.15, blue: 0.15 },
  },
  {
    id: "emerald",
    name: "Emerald Academic",
    bgColor: "bg-emerald-950",
    textColor: "text-emerald-50",
    ambientBg: "bg-stone-950",
    accentColor: "text-yellow-400 border-yellow-500/20",
    targetBadgeColor: "bg-yellow-950/60 text-yellow-300 border-yellow-400/30",
    dividerColor: "border-emerald-900",
    cardBg: "bg-emerald-900/30 border-emerald-900/50",
    rgbBg: { red: 0.02, green: 0.15, blue: 0.11 },
    rgbText: { red: 0.95, green: 0.98, blue: 0.96 },
    rgbAccent: { red: 0.98, green: 0.82, blue: 0.2 },
    rgbCard: { red: 0.04, green: 0.25, blue: 0.18 },
  },
  {
    id: "lavender",
    name: "Minimalist Light",
    bgColor: "bg-slate-50",
    textColor: "text-slate-900",
    ambientBg: "bg-white",
    accentColor: "text-indigo-600 border-indigo-200",
    targetBadgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dividerColor: "border-slate-200",
    cardBg: "bg-white border-slate-200",
    rgbBg: { red: 0.97, green: 0.98, blue: 1.0 },
    rgbText: { red: 0.06, green: 0.09, blue: 0.16 },
    rgbAccent: { red: 0.31, green: 0.27, blue: 0.9 },
    rgbCard: { red: 1.0, green: 1.0, blue: 1.0 },
  },
];
