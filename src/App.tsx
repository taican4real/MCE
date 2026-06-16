import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { logout as firebaseLogout } from "./lib/firebase";
import { mceRubrics } from "./data/mceData";
import { CustomPresentationSettings, ThemeId, AIOutline } from "./types";
import RegistrationGate from "./components/RegistrationGate";
import RubricSelector from "./components/RubricSelector";
import SlideViewer from "./components/SlideViewer";
import SlideCustomizer from "./components/SlideCustomizer";
import { Sparkles, CheckCircle, ExternalLink, AlertTriangle, BookOpen, Presentation, RefreshCw, Users, ShieldAlert, Key } from "lucide-react";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [settings, setSettings] = useState<CustomPresentationSettings>({
    title: "MCE 21st Century Learning Design Training Guide",
    presenterName: "HENRY OMOTAYO ADETUNJI.",
    institution: "DEXTER ACADEMY.",
    trainingFocus: "General K-12 Classrooms",
    slideTone: "Inspiring & Academic",
    customContext: "Provide practical K12 suggestions.",
    selectedRubrics: mceRubrics.map((r) => r.id),
  });

  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>("midnight");
  const [aiOutline, setAiOutline] = useState<AIOutline | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"slides" | "rubrics" | "admin">("slides");

  // Authentication State
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);

  // Status Loaders
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isExportingSlides, setIsExportingSlides] = useState<boolean>(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Initial Auth hook
  const isIframe = typeof window !== "undefined" && window.self !== window.top;

  useEffect(() => {
    // Restore custom registration session from LocalStorage
    try {
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("sandbox_user");
        const savedToken = localStorage.getItem("sandbox_token");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setToken(savedToken || `token_${parsed.uid}`);
          setNeedsAuth(false);
        } else {
          setUser(null);
          setToken(null);
          setNeedsAuth(true);
        }
      }
    } catch (e) {
      console.error("Failed to restore registration session:", e);
    }
  }, []);

  const handleLogout = async () => {
    setAppError(null);
    setToken(null);
    setUser(null);
    setExportUrl(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sandbox_user");
        localStorage.removeItem("sandbox_token");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // call our server-side API to customize outlines & notes using Gemini 3.5
  const handleGenerateAIOutline = async () => {
    setIsGeneratingAI(true);
    setAppError(null);
    setAiSuccessMessage(null);
    try {
      const res = await fetch("/api/mce/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presenterName: settings.presenterName,
          institution: settings.institution,
          trainingFocus: settings.trainingFocus,
          slideTone: settings.slideTone,
          customContext: settings.customContext,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Server-side Gemini generation failed.");
      }

      const outlineData: AIOutline = await res.json();
      setAiOutline(outlineData);
      
      // Update presentation values in text controls dynamically
      setSettings((prev) => ({
        ...prev,
        title: outlineData.titleSlide.title || prev.title,
      }));

      setAiSuccessMessage("Gemini AI customized speaker notes and study challenges successfully!");
      setTimeout(() => setAiSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      setAppError(err.message || "Failed to customize outline with Gemini. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleLogin = () => {
    setActiveTab("rubrics");
  };

  // Compile active checking list
  const activeRubrics = mceRubrics.filter((r) => settings.selectedRubrics.includes(r.id));

  // Build and Download a highly polished training guide & speaker notes package
  const handleExportToGoogleSlides = async () => {
    setIsExportingSlides(true);
    setAppError(null);
    setExportUrl(null);

    try {
      let content = `========================================================================\n`;
      content += `   MICROSOFT CERTIFIED EDUCATOR (MCE) - 21CLD STUDY GUIDE & EXAM OUTLINE\n`;
      content += `========================================================================\n\n`;
      content += `Customized for:   ${settings.presenterName || "MCE Professional Trainer"}\n`;
      content += `School/Academy:   ${settings.institution || "Dexter Academy"}\n`;
      content += `Target Focus:     ${settings.trainingFocus || "General Education Classrooms"}\n`;
      content += `Presentation Tone: ${settings.slideTone || "Professional Academic"}\n`;
      content += `Active Rubrics:   ${activeRubrics.map((r) => r.title).join(", ")}\n\n`;
      content += `------------------------------------------------------------------------\n`;
      content += `  I. SPEAKER SLIDES DECK OUTLINE & PRESENTER NOTES\n`;
      content += `------------------------------------------------------------------------\n\n`;

      if (aiOutline) {
        content += `SLIDE 1: COVER SLIDE\n`;
        content += `--------------------\n`;
        content += `Title:    ${aiOutline.titleSlide.title}\n`;
        content += `Subtitle: ${aiOutline.titleSlide.subtitle}\n`;
        content += `Presenter Notes:\n${aiOutline.titleSlide.notes || ""}\n\n`;

        aiOutline.slides.forEach((sl, idx) => {
          content += `SLIDE ${idx + 2}: ${sl.title}\n`;
          content += `--------------------\n`;
          if (sl.bulletPoints && sl.bulletPoints.length > 0) {
            content += `Key Concepts:\n`;
            sl.bulletPoints.forEach((pt) => {
              content += `  • ${pt}\n`;
            });
          } else {
            content += `Key Concepts: ${sl.header || ""}\n`;
          }
          if (sl.activityChallenge) {
            content += `Interactive 21CLD Challenge:\n  ${sl.activityChallenge}\n`;
          }
          if (sl.interactivePrompt) {
            content += `Audience Reflection Prompt:\n  ${sl.interactivePrompt}\n`;
          }
          content += `Presenter/Trainer Notes:\n${sl.notes || ""}\n\n`;
        });
      } else {
        content += `No AI-generation run yet. Run "Customize Presentation" in the portal dashboard to build real-time educator outlines.\n\n`;
      }

      content += `------------------------------------------------------------------------\n`;
      content += `  II. DETAILED CURRICULUM RUBRICS STANDARDS (21CLD)\n`;
      content += `------------------------------------------------------------------------\n\n`;

      activeRubrics.forEach((r) => {
        content += `RUBRIC: ${r.title.toUpperCase()}\n`;
        content += `Description: ${r.description}\n\n`;
        content += `Scoring Guide Levels:\n`;
        r.levels.forEach((lvl) => {
          content += `  [Level ${lvl.level}] ${lvl.title}\n`;
          content += `  Description: ${lvl.description}\n\n`;
        });
        content += `---\n\n`;
      });

      content += `========================================================================\n`;
      content += `Generated via MCE 21CLD Study Portal. All rights reserved. Keep practicing!\n`;
      content += `========================================================================\n`;

      // Trigger file download
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MCE-21CLD-Study-Guide.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setAiSuccessMessage("Study & Presentation guide exported successfully! File downloaded.");
      setTimeout(() => setAiSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error("Failed to build study notes:", err);
      setAppError("Error exporting local Study Guide file.");
    } finally {
      setIsExportingSlides(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-900 pb-12 font-sans">
      {/* Sleek Design Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">Microsoft Certified Educator (MCE)</h1>
            <p className="text-slate-400 text-xs sm:text-sm">21st Century Learning Design (21CLD) Professional Training Suite</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Tab navigation matching Sleek design pattern */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab("slides")}
                className={`flex items-center gap-1.5 text-xs px-3 sm:px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "slides"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Presentation className="w-3.5 h-3.5 text-slate-100" />
                Slides Deck Preview
              </button>
              <button
                onClick={() => setActiveTab("rubrics")}
                className={`flex items-center gap-1.5 text-xs px-3 sm:px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "rubrics"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-100" />
                Rubrics Study Library
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-1.5 text-xs px-3 sm:px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-slate-100" />
                Admin Dashboard
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold font-sans">Module</span>
              <span className="text-sm font-mono text-blue-400 font-bold">Rubric Analysis</span>
            </div>

            {user ? (
              <div id="user-profile-badge" className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-extrabold text-xs text-blue-300 tracking-tight max-w-[150px] truncate block" title={user.displayName}>
                    {user.displayName || "Participant"}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    ID: {user.uid}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-[9px] bg-red-950/70 hover:bg-red-900 border border-red-900/40 hover:text-white text-red-300 font-bold px-2 py-1 rounded transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("rubrics")}
                className="flex items-center gap-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-350 cursor-pointer text-xs font-bold transition-all"
              >
                <Key className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Register / Enter Code</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Error and Success banners */}
        {appError && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-800 text-xs shadow-xs animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error encountered:</span> {appError}
            </div>
          </div>
        )}

        {aiSuccessMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 text-emerald-800 text-xs shadow-xs animate-bounce-short">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Success:</span> {aiSuccessMessage}
            </div>
          </div>
        )}

        {exportUrl && (
          <div className="mb-8 bg-indigo-50 border border-indigo-200 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-indigo-900 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-xl shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19ZM17 11H7V9H17V11ZM17 15H7V13H17V15Z" fill="currentColor" />
                </svg>
              </div>
              <div className="text-xs">
                <span className="font-bold text-sm block">Google Slides Presentation Created!</span>
                The 11-slide certified training guide has been built as a real, editable presentation in your Google Drive.
              </div>
            </div>
            <a
              href={exportUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer hover:scale-[1.02]"
            >
              Open in Google Slides
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Mobile View switcher */}
        <div className="flex md:hidden bg-white p-1 rounded-xl border border-slate-200 mb-6 shadow-xs">
          <button
            onClick={() => setActiveTab("slides")}
            className={`flex-1 text-center text-xs py-2 rounded-lg font-bold transition-all ${
              activeTab === "slides" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Slides Preview
          </button>
          <button
            onClick={() => setActiveTab("rubrics")}
            className={`flex-1 text-center text-xs py-2 rounded-lg font-bold transition-all ${
              activeTab === "rubrics" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            MCE Rubrics
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 text-center text-xs py-2 rounded-lg font-bold transition-all ${
              activeTab === "admin" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Admin Panel
          </button>
        </div>

        {/* Major split layout */}
        {activeTab === "slides" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual previewer deck */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-md p-5 lg:p-6 space-y-6">
              <SlideViewer
                settings={settings}
                themeId={selectedThemeId}
                aiOutline={aiOutline}
                activeRubrics={activeRubrics}
                currentSlideIndex={currentSlideIndex}
                setCurrentSlideIndex={setCurrentSlideIndex}
                onEditSlideText={(key, value) => {
                  setSettings((prev) => ({ ...prev, [key]: value }));
                }}
              />
            </div>

            {/* Customizer settings bar */}
            <div className="lg:col-span-4">
              <SlideCustomizer
                settings={settings}
                setSettings={setSettings}
                selectedThemeId={selectedThemeId}
                setSelectedThemeId={setSelectedThemeId}
                onGenerateAIOutline={handleGenerateAIOutline}
                isGeneratingAI={isGeneratingAI}
                onExportToSlides={handleExportToGoogleSlides}
                isExportingSlides={isExportingSlides}
                userConnected={!needsAuth && !!user}
                authButton={
                  user ? (
                    <div className="w-full text-center py-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs space-y-1">
                      <p className="text-slate-400 text-[9px] uppercase tracking-wider font-extrabold">Registered Training Session</p>
                      <p className="font-mono font-black text-slate-800 tracking-wider text-sm">{user.uid}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab("rubrics")}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all text-center uppercase tracking-wider"
                    >
                      <Key className="w-4 h-4 text-white" />
                      <span>Register to Unlock</span>
                    </button>
                  )
                }
              />
            </div>
          </div>
        ) : activeTab === "rubrics" ? (
          <div className="animation-fade-in">
            {user ? (
              <RubricSelector 
                aiOutline={aiOutline} 
                user={user} 
                onLoginRequest={handleLogin} 
              />
            ) : (
              <RegistrationGate 
                onUnlock={(registeredUser) => {
                  setUser(registeredUser);
                  setToken("token_" + registeredUser.uid);
                  setNeedsAuth(false);
                  setAiSuccessMessage(`Access Granted! Welcome to the Rubrics study Library.`);
                  setTimeout(() => setAiSuccessMessage(null), 5000);
                }} 
              />
            )}
          </div>
        ) : (
          <div className="animation-fade-in">
            <AdminDashboard 
              user={user} 
              onLoginRequest={handleLogin} 
            />
          </div>
        )}
      </main>

      {/* Sleek Design Theme Footer Integration */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-6 flex-col sm:flex-row">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Scoring Grid Legend</span>
            <div className="flex flex-wrap gap-1.5 mt-2 font-bold text-xs">
              <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-400 border border-slate-200">L1: Basic</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-500 border border-slate-200">L2: Developing</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 border border-slate-200">L3: Proficient</span>
              <span className="px-2.5 py-1 bg-blue-600 rounded text-white shadow-xs">L4: Advanced / Target</span>
            </div>
          </div>
        </div>
        <div className="max-w-md">
          <p className="text-xs text-slate-600 italic border-l-4 border-blue-500 pl-4 leading-relaxed">
            <strong>Mastery Note:</strong> Level 4 reflects teaching that fosters collaboration, critical thinking, creativity, and strategic technology use. This is the goal of 21st-century pedagogy.
          </p>
          <span className="text-[9px] text-slate-400 block mt-2">
            Google Workspace Integration enabled for Slides & Drive.
          </span>
        </div>
      </footer>
    </div>
  );
}
