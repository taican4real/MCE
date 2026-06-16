import React, { useState } from "react";
import { CustomPresentationSettings, ThemeId, SLIDE_THEMES, SlideTheme } from "../types";
import { mceRubrics } from "../data/mceData";
import { Sparkles, Calendar, User, School, FileCheck, CheckSquare, Square, Settings, Palette } from "lucide-react";

interface SlideCustomizerProps {
  settings: CustomPresentationSettings;
  setSettings: React.Dispatch<React.SetStateAction<CustomPresentationSettings>>;
  selectedThemeId: ThemeId;
  setSelectedThemeId: React.Dispatch<React.SetStateAction<ThemeId>>;
  onGenerateAIOutline: () => Promise<void>;
  isGeneratingAI: boolean;
  onExportToSlides: () => Promise<void>;
  isExportingSlides: boolean;
  userConnected: boolean;
  authButton: React.ReactNode;
}

export default function SlideCustomizer({
  settings,
  setSettings,
  selectedThemeId,
  setSelectedThemeId,
  onGenerateAIOutline,
  isGeneratingAI,
  onExportToSlides,
  isExportingSlides,
  userConnected,
  authButton,
}: SlideCustomizerProps) {
  const [showAdvance, setShowAdvance] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleRubric = (id: string) => {
    setSettings((prev) => {
      const selected = prev.selectedRubrics.includes(id)
        ? prev.selectedRubrics.filter((r) => r !== id)
        : [...prev.selectedRubrics, id];
      return { ...prev, selectedRubrics: selected };
    });
  };

  const handleSelectAllRubrics = (all: boolean) => {
    setSettings((prev) => ({
      ...prev,
      selectedRubrics: all ? mceRubrics.map((r) => r.id) : [],
    }));
  };

  return (
    <div id="slide-customizer-panel" className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 lg:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Presentation Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Customize content text, style parameters, and use Gemini to generate custom speaker notes.
        </p>
      </div>

      {/* Basic configurations */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Presentation Title
          </label>
          <input
            type="text"
            name="title"
            value={settings.title}
            onChange={handleInputChange}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white text-slate-800"
            placeholder="MCE Professional Training Course"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Presenter Name
            </label>
            <input
              type="text"
              name="presenterName"
              value={settings.presenterName}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white text-slate-800"
              placeholder="E.g. Dr. Jane Doe"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-slate-400" />
              Institution / School
            </label>
            <input
              type="text"
              name="institution"
              value={settings.institution}
              onChange={handleInputChange}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white text-slate-800"
              placeholder="E.g. Academic Learning Academy"
            />
          </div>
        </div>

        {/* Theme select */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            Slide Template Color Theme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SLIDE_THEMES.map((theme) => {
              const isSelected = theme.id === selectedThemeId;
              let dotColor = "bg-slate-900";
              if (theme.id === "slate") dotColor = "bg-stone-800";
              if (theme.id === "emerald") dotColor = "bg-emerald-800";
              if (theme.id === "lavender") dotColor = "bg-indigo-600";

              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  id={`theme-btn-${theme.id}`}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-4.5 h-4.5 rounded-full ${dotColor} mb-2`}></span>
                  <span className="text-[10px] font-semibold text-slate-700 leading-none truncate w-full">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Rubrics */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-slate-400" />
              Dimensions to Include
            </label>
            <div className="flex gap-2 text-[10px]">
              <button
                onClick={() => handleSelectAllRubrics(true)}
                className="text-blue-600 hover:underline font-bold cursor-pointer"
              >
                All
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => handleSelectAllRubrics(false)}
                className="text-slate-500 hover:underline font-bold cursor-pointer"
              >
                None
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {mceRubrics.map((r) => {
              const checked = settings.selectedRubrics.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => handleToggleRubric(r.id)}
                  className="flex items-center gap-2.5 text-left text-xs text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {checked ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className="truncate leading-none">
                    {r.number}. {r.title.replace("Facilitate Students' ", "").replace("Facilitate ", "")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced AI configuration toggler */}
      <div className="border-t border-slate-100 pt-4">
        <button
          onClick={() => setShowAdvance(!showAdvance)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all cursor-pointer"
        >
          {showAdvance ? "Hide Advanced AI Prompt Wizard -" : "Show Advanced AI Prompt Wizard +"}
        </button>

        {showAdvance && (
          <div className="space-y-4 mt-4 animation-fade-in">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Target Training Focus
              </label>
              <input
                type="text"
                name="trainingFocus"
                value={settings.trainingFocus}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white text-slate-800"
                placeholder="E.g. Focus on high school math & science lessons"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Audience Presentation Tone
              </label>
              <select
                name="slideTone"
                value={settings.slideTone}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white text-slate-800"
              >
                <option value="Inspiring & Academic">Inspiring & Academic</option>
                <option value="Corporate & Professional">Corporate & Professional</option>
                <option value="Clean & Minimalist">Clean & Minimalist</option>
                <option value="Active Edu-Tech">Active EduTech Workshop</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Custom Context (Extra Rules)
              </label>
              <textarea
                name="customContext"
                value={settings.customContext}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white text-slate-800"
                placeholder="E.g. Emphasize digital equity and AI tools selection."
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
        <button
          onClick={onGenerateAIOutline}
          disabled={isGeneratingAI}
          id="btn-ai-generate"
          className="w-full text-xs py-3 rounded-xl font-bold text-white bg-slate-900 border border-slate-900 shadow-md hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          {isGeneratingAI ? "Consulting Gemini AI..." : "Enhance Slides with Gemini AI"}
        </button>

        <div className="pt-2">
          {/* Header/Connector state */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Google Workspace Sync
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                userConnected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {userConnected ? "Sync Enabled" : "Not Connected"}
            </span>
          </div>

          {!userConnected ? (
            <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl flex flex-col items-center text-center gap-2.5">
              <p className="text-[10px] text-slate-500 leading-normal">
                To export this custom presentation directly as a real edit-ready slide deck in your Google Drive, connect your account below.
              </p>
              {authButton}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onExportToSlides}
                disabled={isExportingSlides || settings.selectedRubrics.length === 0}
                id="btn-export-slides"
                className="w-full text-xs py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isExportingSlides ? (
                  <>
                    <span className="w-4.5 h-4.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    Exporting Presentation...
                  </>
                ) : (
                  <>
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19ZM17 11H7V9H17V11ZM17 15H7V13H17V15Z" fill="currentColor" />
                    </svg>
                    Publish to Google Slides
                  </>
                )}
              </button>
              {settings.selectedRubrics.length === 0 && (
                <p className="text-[9px] text-red-500 text-center font-semibold">
                  (Must choose at least one rubric category to include)
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
