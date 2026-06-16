import React from "react";
import { RubricCategory, mceSummaryTableRows } from "../data/mceData";
import { CustomPresentationSettings, SLIDE_THEMES, ThemeId, AIOutline } from "../types";
import { ChevronLeft, ChevronRight, Play, Eye, Clipboard, HelpCircle, Target } from "lucide-react";

interface SlideViewerProps {
  settings: CustomPresentationSettings;
  themeId: ThemeId;
  aiOutline: AIOutline | null;
  activeRubrics: RubricCategory[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (idx: number) => void;
  onEditSlideText: (key: string, value: string) => void;
}

export default function SlideViewer({
  settings,
  themeId,
  aiOutline,
  activeRubrics,
  currentSlideIndex,
  setCurrentSlideIndex,
  onEditSlideText,
}: SlideViewerProps) {
  const activeTheme = SLIDE_THEMES.find((t) => t.id === themeId) || SLIDE_THEMES[0];

  // Map out the complete dynamic slide list
  const slidesList: {
    type: "title" | "intro" | "rubric" | "table" | "conclusion";
    title: string;
    rubricRef?: RubricCategory;
  }[] = [
    { type: "title", title: settings.title || "MCE Professional Presentation" },
    { type: "intro", title: "MCE Rubrics Guide Overview" },
    ...activeRubrics.map((r) => ({
      type: "rubric" as const,
      title: `${r.number}. ${r.title}`,
      rubricRef: r,
    })),
    { type: "table", title: "Quick Summary Table" },
    { type: "conclusion", title: "Targeting Level 4 & Conclusion" },
  ];

  const totalSlides = slidesList.length;
  const currentSlide = slidesList[currentSlideIndex] || slidesList[0];

  const handleNext = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // Extract custom notes for the current slide
  let speakerNotes = "Use this slide to welcome participants to the MCE Professional Training workshop. Encourage mutual sharing and joint expectations.";
  if (currentSlide.type === "intro") {
    speakerNotes = "Brief the background of MCE. Emphasize that the 21CLD scoring rubric measures lesson designs rather than student behavior directly.";
  } else if (currentSlide.type === "rubric" && currentSlide.rubricRef) {
    const extra = aiOutline?.rubricsExtra.find(
      (e) => e.rubricId === currentSlide.rubricRef?.id || e.rubricId.toLowerCase().includes(currentSlide.rubricRef?.id || "")
    );
    speakerNotes = extra?.presenterNote || `Discuss how the lesson rubrics move from static tasks (Level 1) to collaborative, real-world, and student-powered projects (Level 4). Highlighting Level 4 as the main priority.`;
  } else if (currentSlide.type === "table") {
    speakerNotes = "Perfect visual reference to bookmark or print out. Quickly review the four major levels during planning meetings.";
  } else if (currentSlide.type === "conclusion") {
    speakerNotes = "Conclude the presentation. Restate the why: Level 4 is the sweet spot because it embeds collaboration, self-regulation, communication, and real problem-solving directly into daily school curricula.";
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Slide Deck Previewer
          </span>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-4.5 h-4.5 text-indigo-500" />
            Slide {currentSlideIndex + 1} of {totalSlides} : {currentSlide.title.replace("Facilitate ", "").substring(0, 30)}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="p-1 px-2.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-40 text-xs font-semibold cursor-pointer select-none"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentSlideIndex === totalSlides - 1}
            className="p-1 px-2.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-40 text-xs font-semibold cursor-pointer select-none"
          >
            Next
          </button>
        </div>
      </div>

      {/* Primary visual canvas simulating the Google Slide */}
      <div
        id="presentation-slide-stage"
        className={`aspect-[16/9] w-full rounded-2xl p-6 md:p-8 lg:p-12 shadow-xl border relative flex flex-col justify-between overflow-hidden transition-all duration-300 ${activeTheme.bgColor} ${activeTheme.textColor}`}
      >
        {/* Subtle slide watermark/theme element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full filter blur-xl transform translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[0.02] rounded-full filter blur-2xl transform -translate-x-10 translate-y-10" />

        {/* Dynamic Slide Content matching Slide Types */}
        {currentSlide.type === "title" && (
          <div className="my-auto space-y-4 max-w-2xl md:max-w-3xl animate-fade-in">
            <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/85 border border-white/15">
              Microsoft Certified Educator Series
            </div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {settings.title}
            </h1>
            <p className="text-xs md:text-sm text-white/70 max-w-xl font-light">
              {aiOutline?.titleSlide.welcomeMessage || "Implementing 21st Century Learning Design (21CLD) for authentic student-centered outcomes."}
            </p>
            <div className={`pt-4 border-t ${activeTheme.dividerColor} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
              <div>
                <span className="text-[10px] text-white/50 block font-semibold uppercase">Presenter</span>
                <span className="text-xs font-bold">{settings.presenterName}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 block font-semibold uppercase">Institution</span>
                <span className="text-xs font-bold">{settings.institution}</span>
              </div>
            </div>
          </div>
        )}

        {currentSlide.type === "intro" && (
          <div className="my-auto space-y-4 max-w-3xl animate-fade-in">
            <h2 className="text-lg md:text-2xl font-bold tracking-tight">
              21CLD: What is an MCE Rubric?
            </h2>
            <div className="w-12 border-b-2 border-amber-400" />
            <p className="text-xs md:text-sm leading-relaxed text-white/80 max-w-2xl">
              In the context of the <strong>Microsoft Certified Educator (MCE)</strong> program, a <strong>Rubric</strong> is a scoring guide used to assess the level at which learning activities promote 21st-century learning skills.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-amber-300">Level Scaling</span>
                <p className="text-[11px] text-white/70 mt-1">Each rubric has four levels (1–4), with Level 1 being the lowest and Level 4 being the highest level of student-centered learning.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-emerald-400">Target Level 4</span>
                <p className="text-[11px] text-white/70 mt-1">Level 4 is the ultimate target because it marks student-directed, real-world, innovative solutions utilizing technology strategically.</p>
              </div>
            </div>
          </div>
        )}

        {currentSlide.type === "rubric" && currentSlide.rubricRef && (
          <div className="my-auto space-y-4 max-w-full animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">
                  Dimension {currentSlide.rubricRef.number} of 7
                </span>
                <h2 className="text-base md:text-xl font-bold tracking-tight">
                  {currentSlide.rubricRef.title}
                </h2>
              </div>
              <div className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border uppercase inline-flex items-center gap-1.5 ${activeTheme.targetBadgeColor}`}>
                <Target className="w-3.5 h-3.5" /> Aim For Level 4
              </div>
            </div>

            <p className="text-[11px] md:text-xs opacity-75 max-w-3xl leading-snug">
              {currentSlide.rubricRef.description}
            </p>

            {/* Visual Stepper illustrating 1-4 level cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mt-2">
              {currentSlide.rubricRef.levels.map((lvl) => {
                const isTarget = lvl.level === 4;
                return (
                  <div
                    key={lvl.level}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between min-h-[100px] md:min-h-[120px] transition-all ${
                      isTarget
                        ? "bg-emerald-900/40 border-emerald-500 text-white"
                        : "bg-white/5 border-white/10 text-white/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${isTarget ? "bg-emerald-600" : "bg-white/15"}`}>
                          L{lvl.level}
                        </span>
                        {isTarget && (
                          <span className="text-[8px] bg-emerald-700 text-emerald-100 font-bold px-1 rounded">Target</span>
                        )}
                      </div>
                      <h4 className="text-[10px] font-bold truncate leading-tight">{lvl.title}</h4>
                      <p className="text-[9px] opacity-75 leading-tight mt-1 line-clamp-3">
                        {lvl.description}
                      </p>
                    </div>
                    <div className="border-t border-white/10 pt-1.5 mt-1.5 text-[8px] opacity-60">
                      e.g. {lvl.example.substring(0, 35)}...
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentSlide.type === "table" && (
          <div className="my-auto space-y-4 max-w-3xl animate-fade-in">
            <h2 className="text-lg md:text-2xl font-bold tracking-tight">
              21CLD Quick Summary Guide
            </h2>
            <p className="text-[11px] opacity-75 leading-relaxed">
              Use this rapid matrix during lesson planning sessions to cross-evaluate collaboration, communication, and ICT.
            </p>
            <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
              <table className="w-full text-left text-[11px] md:text-xs">
                <thead>
                  <tr className="border-b border-white/15 bg-white/10 font-bold">
                    <th className="p-2.5 text-center w-16">Level</th>
                    <th className="p-2.5">Scoring Descriptor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {mceSummaryTableRows.map((row) => {
                    const isL4 = row.level.includes("4");
                    return (
                      <tr key={row.level} className={isL4 ? "bg-emerald-950/40 text-emerald-300" : ""}>
                        <td className="p-2 text-center font-bold">{row.level}</td>
                        <td className="p-2">{row.desc}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentSlide.type === "conclusion" && (
          <div className="my-auto space-y-4 max-w-3xl animate-fade-in">
            <div className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Strategic Takeaways
            </div>
            <h2 className="text-lg md:text-2xl font-bold tracking-tight">
              Reaching 21st Century Professional Excellence
            </h2>
            <div className="w-12 border-b-2 border-indigo-400" />
            <p className="text-xs md:text-sm leading-relaxed opacity-85">
              Emphasis for MCE trainers: <strong>Level 4 remains the absolute gold standard</strong>. It moves the classroom from passive listening to dynamic real-world environments where student agency and strategic ICT use are embedded.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs opacity-75 list-disc list-inside">
              <li>Students aren't just consumers; they are creators.</li>
              <li>Assignments transition to long-term collaborative solutions.</li>
              <li>Technology selection is driven by Student Autonomy.</li>
              <li>Solutions target real obstacles with global/local significance.</li>
            </ul>
          </div>
        )}

        {/* Slide Footnote placeholder */}
        <div className="flex sm:flex-row justify-between items-center text-[8px] md:text-[9px] opacity-40 border-t border-white/5 pt-2.5 mt-auto">
          <span>{settings.title} | {settings.institution}</span>
          <span>© 2026 MCE Learning Guide - Slide {currentSlideIndex + 1}</span>
        </div>
      </div>

      {/* Slide Thumbnails selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {slidesList.map((slide, idx) => {
          const isSelected = idx === currentSlideIndex;
          return (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] whitespace-nowrap shrink-0 transition-all ${
                isSelected
                  ? "bg-slate-900 border-slate-900 text-white font-semibold shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Slide {idx + 1}: {slide.type.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Speaker Notes Card beneath the Slide */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 text-slate-700">
        <Clipboard className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Interactive Speaker Discussion Notes (Customized via AI)
          </span>
          <p className="text-xs leading-relaxed text-slate-600">
            {speakerNotes}
          </p>
          {currentSlide.type === "rubric" && (
            <div className="mt-3 bg-white border border-amber-200 p-2.5 rounded-lg">
              <span className="text-[9px] font-bold text-slate-800 uppercase block mb-1">
                Classroom Calibration Tip:
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Ask trainees to evaluate lessons by checking if students make joint decisions on the layout, tools and deadlines. If decisions are pre-guided, restrict to Level 2 or 3.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
