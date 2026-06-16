import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { initAuth, googleSignIn, logout as firebaseLogout } from "./lib/firebase";
import { exportToGoogleSlides } from "./lib/slidesExporter";
import { mceRubrics } from "./data/mceData";
import { CustomPresentationSettings, ThemeId, AIOutline } from "./types";
import GsiSignInButton from "./components/GsiSignInButton";
import RubricSelector from "./components/RubricSelector";
import SlideViewer from "./components/SlideViewer";
import SlideCustomizer from "./components/SlideCustomizer";
import { Sparkles, CheckCircle, ExternalLink, AlertTriangle, BookOpen, Presentation, RefreshCw, Users } from "lucide-react";
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
  const [user, setUser] = useState<User | null>(null);
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
  useEffect(() => {
    // Check if user is signed in on load
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAppError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setAppError("Google Authentication failed. Please check your network and pop-up blocker.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setAppError(null);
    setToken(null);
    setUser(null);
    setExportUrl(null);
    await firebaseLogout();
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

  // Publish to real Google Slides
  const handleExportToGoogleSlides = async () => {
    if (!token) {
      setAppError("Please connect your Google Account first.");
      return;
    }

    setIsExportingSlides(true);
    setAppError(null);
    setExportUrl(null);

    try {
      const activeRubricsList = mceRubrics.filter((r) => settings.selectedRubrics.includes(r.id));
      const presentationId = await exportToGoogleSlides(
        token,
        settings,
        selectedThemeId,
        aiOutline,
        activeRubricsList
      );
      
      const link = `https://docs.google.com/presentation/d/${presentationId}/edit`;
      setExportUrl(link);
    } catch (err: any) {
      console.error("Slides export failed:", err);
      setAppError(err.message || "Google Slides export failed. Ensure Google service access is authorized.");
    } finally {
      setIsExportingSlides(false);
    }
  };

  // Compile active checking list
  const activeRubrics = mceRubrics.filter((r) => settings.selectedRubrics.includes(r.id));

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

            <GsiSignInButton
              onSignIn={handleLogin}
              onLogout={handleLogout}
              isLoggingIn={isLoggingIn}
              user={user}
            />
          </div>
        </div>
      </header>

      {/* Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Error and Success banners */}
        {appError && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-800 text-xs">
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
                userConnected={!needsAuth && !!token}
                authButton={
                  <GsiSignInButton
                    onSignIn={handleLogin}
                    onLogout={handleLogout}
                    isLoggingIn={isLoggingIn}
                    user={user}
                  />
                }
              />
            </div>
          </div>
        ) : activeTab === "rubrics" ? (
          <div className="animation-fade-in">
            <RubricSelector 
              aiOutline={aiOutline} 
              user={user} 
              onLoginRequest={handleLogin} 
            />
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
