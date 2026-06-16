import React, { useState, useEffect, useRef } from "react";
import { User } from "firebase/auth";
import { saveParticipantScore } from "../lib/firestoreUtils";
import { RubricCategory, mceRubrics } from "../data/mceData";
import { AIOutline } from "../types";
import {
  BookOpen,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Target,
  AlertTriangle,
  RotateCcw,
  Lock,
  Check,
  X,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Timer
} from "lucide-react";

const DIMENSION_STYLES: Record<string, {
  pillBg: string;
  lightBg: string;
  textColor: string;
  borderColor: string;
  accentText: string;
}> = {
  collaboration: {
    pillBg: "bg-blue-500",
    lightBg: "bg-blue-50/50",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
    accentText: "text-blue-600"
  },
  communication: {
    pillBg: "bg-indigo-500",
    lightBg: "bg-indigo-50/50",
    textColor: "text-indigo-800",
    borderColor: "border-indigo-200",
    accentText: "text-indigo-600"
  },
  knowledge_construction: {
    pillBg: "bg-cyan-500",
    lightBg: "bg-cyan-50/50",
    textColor: "text-cyan-800",
    borderColor: "border-cyan-200",
    accentText: "text-cyan-600"
  },
  self_regulation: {
    pillBg: "bg-emerald-500",
    lightBg: "bg-emerald-50/50",
    textColor: "text-emerald-800",
    borderColor: "border-emerald-200",
    accentText: "text-emerald-600"
  },
  problem_solving: {
    pillBg: "bg-rose-500",
    lightBg: "bg-rose-50/50",
    textColor: "text-rose-800",
    borderColor: "border-rose-200",
    accentText: "text-rose-600"
  },
  ict_tools: {
    pillBg: "bg-violet-500",
    lightBg: "bg-violet-50/50",
    textColor: "text-violet-800",
    borderColor: "border-violet-200",
    accentText: "text-violet-600"
  },
  ict_learning: {
    pillBg: "bg-purple-500",
    lightBg: "bg-purple-50/50",
    textColor: "text-purple-800",
    borderColor: "border-purple-200",
    accentText: "text-purple-600"
  }
};

interface ChallengeQuestion {
  id: string;
  category: string;
  categoryTitle: string;
  number: number;
  index: number;
  scenarioText: string;
  correctAnswer: number;
  justification: string;
  checklistNote?: string;
}

// 35 high-fidelity scenarios (5 per each of the 21CLD rubrics)
const CALIBRATION_CHALLENGES: ChallengeQuestion[] = [
  // === 1. COLLABORATION (1-5) ===
  {
    id: "collaboration-1",
    category: "collaboration",
    categoryTitle: "Collaboration",
    number: 1,
    index: 0,
    scenarioText: "Students are placed in pairs and must research different parts of photosynthesis, sharing facts on a Google slide. They then assemble their slides into 1 document together.",
    correctAnswer: 3,
    justification: "This is Level 3 because students work together and share responsibility to complete a common presentation, but they research pre-assigned sections independently without making joint, substantive decisions.",
    checklistNote: "To achieve Level 4, students must negotiate goals, structure, and finalize resources interactively rather than splitting the work into pre-assigned parts."
  },
  {
    id: "collaboration-2",
    category: "collaboration",
    categoryTitle: "Collaboration",
    number: 2,
    index: 1,
    scenarioText: "Over three weeks, students work in teams of four to design a school vegetable garden. They negotiate the layout, budget, and plant selection together, and divide tasks individually to produce a single proposal for the principal.",
    correctAnswer: 4,
    justification: "This is Level 4. The project incorporates shared responsibility, substantive decision-making about the garden design/materials, and their roles are highly interdependent to produce a coherent single presentation.",
    checklistNote: "Level 4 is characterized by shared responsibility, joint substantive decision-making, and interdependent tasks."
  },
  {
    id: "collaboration-3",
    category: "collaboration",
    categoryTitle: "Collaboration",
    number: 3,
    index: 2,
    scenarioText: "Students sit in groups of three discussing global warming ideas, but each student compiles their own separate research essay with individual grades.",
    correctAnswer: 2,
    justification: "This is Level 2. Students work together in pairs or groups, discussing ideas or materials, but they do not share responsibility for a joint finalized product.",
    checklistNote: "Sharing discussion or ideas is Level 2; a common deliverable/goal makes it Level 3."
  },
  {
    id: "collaboration-4",
    category: "collaboration",
    categoryTitle: "Collaboration",
    number: 4,
    index: 3,
    scenarioText: "Working in teams, each student is assigned a specific page on nutritional habits. At the end of the lesson, they simply staple their individual pages together with no team edits.",
    correctAnswer: 2,
    justification: "This is Level 2 because although there is an assembled booklet, students operate entirely independently with no joint substantive decisions or interdependent roles.",
    checklistNote: "For Level 3, there must be a common task with shared responsibility for the final quality and layout of the product."
  },
  {
    id: "collaboration-5",
    category: "collaboration",
    categoryTitle: "Collaboration",
    number: 5,
    index: 4,
    scenarioText: "Teams of students develop an interactive review game. They must negotiate the theme, allocate coding tasks based on player input vs visual rendering, and co-evaluate the final code together.",
    correctAnswer: 4,
    justification: "This is Level 4. There is clear shared responsibility, active substantive decision-making on rules & layout, and their roles are highly interdependent (code cannot execute without graphics and vice versa).",
    checklistNote: "Substantive decision-making + Interdependence = Level 4 Collaboration."
  },

  // === 2. SKILLED COMMUNICATION (6-10) ===
  {
    id: "communication-1",
    category: "communication",
    categoryTitle: "Skilled Communication",
    number: 1,
    index: 5,
    scenarioText: "Students write a formal persuasive argument using historical data and citation guidelines to convince the local school board to adapt the academic calendar.",
    correctAnswer: 4,
    justification: "This is Level 4 because students create extended communication with supporting evidence and specifically customize their language and design for a real external audience: the school board.",
    checklistNote: "Level 4 is reached when students use evidence-backed communication targeted to an actual, real-world audience."
  },
  {
    id: "communication-2",
    category: "communication",
    categoryTitle: "Skilled Communication",
    number: 2,
    index: 6,
    scenarioText: "Students record a 3-minute video reflection explaining what they learned about gravity. They turn it in directly to the teacher via Google Drive.",
    correctAnswer: 2,
    justification: "This is Level 2. The reflection is extended communication (more than a single word or answer), but it does not require systematic research evidence, and it's addressed only to the teacher for grading.",
    checklistNote: "For Level 3, students must support claims with evidence; for Level 4, they must also customize their communication for a specific audience."
  },
  {
    id: "communication-3",
    category: "communication",
    categoryTitle: "Skilled Communication",
    number: 3,
    index: 7,
    scenarioText: "Students take a multiple-choice chemistry test on the periodic table of elements, recording instant factual scores.",
    correctAnswer: 1,
    justification: "This is Level 1. Communication is not extended; students only click choices or write single words or simple numbers.",
    checklistNote: "Level 2 requires students to generate extended communication (a paragraph, audio recording, presentation)."
  },
  {
    id: "communication-4",
    category: "communication",
    categoryTitle: "Skilled Communication",
    number: 4,
    index: 8,
    scenarioText: "Students write a comprehensive, four-page laboratory report explaining water salinity changes, using empirical figures and chemical notation, submitted to the teacher.",
    correctAnswer: 3,
    justification: "This is Level 3 because students produce extended communication backed by substantial evidence, but the audience is simply the teacher for grading, with no audience customization required.",
    checklistNote: "Level 3 requires evidence; Level 4 requires evidence AND a custom-targeted audience."
  },
  {
    id: "communication-5",
    category: "communication",
    categoryTitle: "Skilled Communication",
    number: 5,
    index: 9,
    scenarioText: "Students create custom infographic posters illustrating marine litter statistics and set up an exhibition at the town square to inform local residents.",
    correctAnswer: 4,
    justification: "This is Level 4. It features extended communication with evidence (statistical indices), customized beautifully for a specific external audience (town residents) instead of standard classroom submissions.",
    checklistNote: "Infographics tailored for civic public display satisfy MCE Level 4 requirements perfectly."
  },

  // === 3. KNOWLEDGE CONSTRUCTION (11-15) ===
  {
    id: "knowledge_construction-1",
    category: "knowledge_construction",
    categoryTitle: "Knowledge Construction",
    number: 1,
    index: 10,
    scenarioText: "Students analyze local forest soil temperature records, predict next decade crop suitability, and compile their findings with charts into a team guide.",
    correctAnswer: 3,
    justification: "This is Level 3. Students interpret, analyze, and build a new model of crop suitability. However, they stop at drawing conclusions and do not apply this new knowledge to a separate context.",
    checklistNote: "Knowledge construction requires analysis, synthesis, evaluation, or interpretation. Level 4 requires applying it to a separate, new context."
  },
  {
    id: "knowledge_construction-2",
    category: "knowledge_construction",
    categoryTitle: "Knowledge Construction",
    number: 2,
    index: 11,
    scenarioText: "In a physics class, students research the benefits of solar energy vs nuclear energy and use their findings to outline a transition strategy for a completely different system (e.g., space station colonies).",
    correctAnswer: 4,
    justification: "This is Level 4. Students construct knowledge by comparing complex energy profiles and then apply that specific knowledge to a totally new, separate context: the space colony design.",
    checklistNote: "To achieve Level 4, the learning activity must require students to apply constructed knowledge to a different, newly introduced target scenario."
  },
  {
    id: "knowledge_construction-3",
    category: "knowledge_construction",
    categoryTitle: "Knowledge Construction",
    number: 3,
    index: 12,
    scenarioText: "Students are instructed to copy from a glossary and memorize the definitions of fifteen key physics terms on electromagnetism.",
    correctAnswer: 1,
    justification: "This is Level 1. There is no active knowledge construction; students simply reproduce or memorize pre-existing definitions without building new analyses or models.",
    checklistNote: "If the task is purely about recall, reproducing notes, or copy-pasting, it is Level 1."
  },
  {
    id: "knowledge_construction-4",
    category: "knowledge_construction",
    categoryTitle: "Knowledge Construction",
    number: 4,
    index: 13,
    scenarioText: "Students compile an excel table sorting a list of major 19th-century inventions by their launch year and geographical region.",
    correctAnswer: 2,
    justification: "This is Level 2. Organizing, summarizing, or graphing information is classified as basic processing of information. It does not hit true Level 3 until students interpret, summarize deep patterns, or draw original deductions.",
    checklistNote: "Summarizing or visual sorting without drawing deep arguments is Level 2."
  },
  {
    id: "knowledge_construction-5",
    category: "knowledge_construction",
    categoryTitle: "Knowledge Construction",
    number: 5,
    index: 14,
    scenarioText: "Students interrogate historical letters written during the industrial revolution to deduce labor movements, and then use those findings to outline a modern union charter for gig-economy workers.",
    correctAnswer: 4,
    justification: "This is Level 4 because students construct original knowledge by interpreting primary sources, and then apply those deduced principles directly to a completely new context: modern gig workers.",
    checklistNote: "Knowledge application to a different, newly introduced domain indicates Level 4."
  },

  // === 4. SELF-REGULATION (16-20) ===
  {
    id: "self_regulation-1",
    category: "self_regulation",
    categoryTitle: "Self-Regulation",
    number: 1,
    index: 15,
    scenarioText: "Students complete a physics experiment over 3 weeks, using a detailed checklist with deadlines set by themselves, and rate their progress on a journal.",
    correctAnswer: 3,
    justification: "This is Level 3 because the activity is long-term (weeks) and students monitor their own progress using journals and deadlines. However, they are not setting original learning goals or responding to critical feedback loops.",
    checklistNote: "Level 4 requires real feedback-driven revision loops where work is adjusted based on teacher, peer, or system critique."
  },
  {
    id: "self_regulation-2",
    category: "self_regulation",
    categoryTitle: "Self-Regulation",
    number: 2,
    index: 16,
    scenarioText: "In a creative writing workshop, students draft a descriptive essay. The teacher provides structured peer feedback rubrics, allowing students to assess their draft, set personal improvement goals, and submit a revised final draft.",
    correctAnswer: 4,
    justification: "This is Level 4. It incorporates a long-term writing project with monitoring tracking, student goal adjustment, and a dedicated feedback loop where students explicitly revise their work based on peer evaluation.",
    checklistNote: "Fostering actual revision loops based on assessment/formative feedback is the hallmark of Level 4 Self-Regulation."
  },
  {
    id: "self_regulation-3",
    category: "self_regulation",
    categoryTitle: "Self-Regulation",
    number: 3,
    index: 17,
    scenarioText: "Students are handed a homework sheet on geometry to fill out and submit during the afternoon class session on the very same day.",
    correctAnswer: 1,
    justification: "This is Level 1. The task is short-term (hours/day) and entirely structured by the teacher with no opportunity for students to define progress milestones, monitor progress, or execute revisions.",
    checklistNote: "Activities must be of long-term duration (at least one week) to unlock Level 2 and above Self-Regulation."
  },
  {
    id: "self_regulation-4",
    category: "self_regulation",
    categoryTitle: "Self-Regulation",
    number: 4,
    index: 18,
    scenarioText: "Students work on a 2-day historical roleplay. The teacher provides a detailed checklist of items, and students self-record when they complete each item.",
    correctAnswer: 2,
    justification: "This is Level 2. The activity is short-term (less than a week), but it does feature monitoring tools (the checklist) where students have some autonomy over tracking completed items.",
    checklistNote: "Short-term with monitoring/planning indicators is Level 2."
  },
  {
    id: "self_regulation-5",
    category: "self_regulation",
    categoryTitle: "Self-Regulation",
    number: 5,
    index: 19,
    scenarioText: "Over an intensive 4-week programming sprint, teams use a digital board to track weekly milestones, assess code against static compiler feedback, and release a revised final build incorporating formal tester critiques.",
    correctAnswer: 4,
    justification: "This is Level 4. It features a long-term project (4 weeks), active student progress monitoring (digital board), and a direct feedback loop where code is updated and revised based on testing feedback.",
    checklistNote: "Revising work in response to feedback is critical for Level 4."
  },

  // === 5. PROBLEM SOLVING & INNOVATION (21-25) ===
  {
    id: "problem_solving-1",
    category: "problem_solving",
    categoryTitle: "Real-World Problem Solving & Innovation",
    number: 1,
    index: 20,
    scenarioText: "Students collect traffic congestion data around their school, model traffic lights timing theoretically, and present the recommendations to local municipal transit authorities.",
    correctAnswer: 4,
    justification: "This is Level 4. Students tackle an authentic real-world issue, investigate data, and execute innovation by designing and communicating custom recommendations directly to stakeholders.",
    checklistNote: "Innovation and implementation require the implementation of a solution in the real-world, or communicating details to an external audience who can apply it."
  },
  {
    id: "problem_solving-2",
    category: "problem_solving",
    categoryTitle: "Real-World Problem Solving & Innovation",
    number: 2,
    index: 21,
    scenarioText: "Students study a map of an ancient city, identify historic flooding zones, and complete mathematics equations calculating the expected velocity of floodwaters.",
    correctAnswer: 1,
    justification: "This is Level 1. This task is purely academic and instructional. There is no actual problem-solving or investigation of current, real issues; it is standard historical analysis and textbook equations.",
    checklistNote: "Level 2 context must be connected to a real-world problem, Level 3 requires active research/solutions, and Level 4 requires implementing the solution."
  },
  {
    id: "problem_solving-3",
    category: "problem_solving",
    categoryTitle: "Real-World Problem Solving & Innovation",
    number: 3,
    index: 22,
    scenarioText: "Students audit energy usage at their school, analyze local billing rates, and present a detailed LED retrofitting prospectus to their school board's operations manager.",
    correctAnswer: 4,
    justification: "This is Level 4 because students work on an authentic, real-world school problem and present their structured plan directly to an external decision-maker who can implement the energy savings.",
    checklistNote: "Presenting solutions to individuals with the authority to implement them constitutes Level 4 MCE Problem Solving."
  },
  {
    id: "problem_solving-4",
    category: "problem_solving",
    categoryTitle: "Real-World Problem Solving & Innovation",
    number: 4,
    index: 23,
    scenarioText: "Students view a documentary about global ocean microplastics and write a brief written summary outlining the general dangers listed in the film.",
    correctAnswer: 2,
    justification: "This is Level 2. The task is connected to a real-world context (ocean microplastics), but students are simply summarizing general points rather than actively investigating a specific, actionable local problem or designing solutions.",
    checklistNote: "Real-world context without active problem solving or local data collection is Level 2."
  },
  {
    id: "problem_solving-5",
    category: "problem_solving",
    categoryTitle: "Real-World Problem Solving & Innovation",
    number: 5,
    index: 24,
    scenarioText: "Students design a mobile app prototype that connects local restaurants with food shelters to distribute surplus food, and test it live with a shelter coordinator to gather feedback.",
    correctAnswer: 4,
    justification: "This is Level 4. It deals with a real-world issue, constructs an innovative, practical digital solution, and implements/tests it directly with the real-world end-user in context.",
    checklistNote: "Testing in the field with a real recipient qualifies as Level 4 implementation."
  },

  // === 6. STUDENTS' USE OF ICT TOOLS (26-30) ===
  {
    id: "ict_tools-1",
    category: "ict_tools",
    categoryTitle: "Students' Use of ICT Tools",
    number: 1,
    index: 25,
    scenarioText: "Students collaboratively build an interactive dashboard using a climate simulator web tool. They alter CO2 variables as a team and publish their findings on an interactive map platform to educate their peers.",
    correctAnswer: 4,
    justification: "This is Level 4. Students don't just consume ICT; they utilize it to actively construct new models of knowledge (simulators) and build innovative digital artifacts shared on maps.",
    checklistNote: "Level 4 ICT focuses on designing new digital products or tools, rather than just organizing data or consuming media."
  },
  {
    id: "ict_tools-2",
    category: "ict_tools",
    categoryTitle: "Students' Use of ICT Tools",
    number: 2,
    index: 26,
    scenarioText: "Students use a web browser to search for definitions of solar energy. They copy and paste these definitions onto a single Word document to print.",
    correctAnswer: 1,
    justification: "This is Level 1. Technology is being used solely to search, recall, and copy-paste factual information. This does not involve technology-supported knowledge construction.",
    checklistNote: "Technology must support active interpretation, analysis, or evaluation of information to transcend Level 1."
  },
  {
    id: "ict_tools-3",
    category: "ict_tools",
    categoryTitle: "Students' Use of ICT Tools",
    number: 3,
    index: 27,
    scenarioText: "Students watch a pre-recorded science documentary about deep-sea hydrothermal vents on a projector screen during class.",
    correctAnswer: 1,
    justification: "This is Level 1. ICT is used purely for passive information consumption; students do not interact with the technology to organize data or build arguments.",
    checklistNote: "Passive watching or listening keeps the activity in Level 1."
  },
  {
    id: "ict_tools-4",
    category: "ict_tools",
    categoryTitle: "Students' Use of ICT Tools",
    number: 4,
    index: 28,
    scenarioText: "Students enter census data into a statistical graphing application to analyze housing wealth correlations on their individual computers.",
    correctAnswer: 2,
    justification: "This is Level 2. The student uses ICT to support knowledge construction (data analysis/correlation), but does so independently without collaboration or joint production of a digital product.",
    checklistNote: "Individual ICT knowledge construction is Level 2. Level 3 requires collaboration via ICT tools."
  },
  {
    id: "ict_tools-5",
    category: "ict_tools",
    categoryTitle: "Students' Use of ICT Tools",
    number: 5,
    index: 29,
    scenarioText: "Students collaboratively edit a shared Google Slide deck, compiling energy consumption charts to present their findings as a group.",
    correctAnswer: 3,
    justification: "This is Level 3 because the ICT tools directly support collaborative knowledge construction (real-time shared slides), but they are not designing a new digital product (e.g. an app, database, website, or simulator) themselves.",
    checklistNote: "Shared editing of slides or documents is Level 3; designing new tools or functional software artifacts is Level 4."
  },

  // === 7. STUDENTS' USE OF ICT FOR LEARNING (31-35) ===
  {
    id: "ict_learning-1",
    category: "ict_learning",
    categoryTitle: "Students' Use of ICT for Learning",
    number: 1,
    index: 30,
    scenarioText: "For a local history research campaign, students must choose whether a podcast, interactive map website, or video essay fits their content best, selecting their own software and tools autonomously.",
    correctAnswer: 3,
    justification: "This is Level 3. Students have the strategic autonomy to select the appropriate digital tools that match their custom project goals, rather than following a strict, mandated standard by the teacher.",
    checklistNote: "Student autonomy in choosing tech tools for specific cognitive outcomes leads straight to Level 3."
  },
  {
    id: "ict_learning-2",
    category: "ict_learning",
    categoryTitle: "Students' Use of ICT for Learning",
    number: 2,
    index: 31,
    scenarioText: "Students collaborate on a project. Initially, they choose their own design tools to layout ideas, and they must justify why their selected software is optimal for their team's presentation requirements.",
    correctAnswer: 4,
    justification: "This is Level 4. It involves student-choice of ICT, strategic evaluation/justification of why these tools are optimal, and using them to collaborate on constructing knowledge to accomplish learning objectives.",
    checklistNote: "Strategic and self-directed ICT select with collaborative integration is characteristic of Level 4."
  },
  {
    id: "ict_learning-3",
    category: "ict_learning",
    categoryTitle: "Students' Use of ICT for Learning",
    number: 3,
    index: 32,
    scenarioText: "The teacher displays chemical bonding equations on a smartboard to explain ionic structures to thirty seated students.",
    correctAnswer: 1,
    justification: "This is Level 1. The teacher is the primary user of technology. Students only observe; they do not interact with the device directly themselves.",
    checklistNote: "For Level 2, students must be the active users of technology."
  },
  {
    id: "ict_learning-4",
    category: "ict_learning",
    categoryTitle: "Students' Use of ICT for Learning",
    number: 4,
    index: 33,
    scenarioText: "Students are instructed to log in to an educational spelling website and complete the specific pre-assigned lesson set up by the teacher.",
    correctAnswer: 2,
    justification: "This is Level 2. Students use technology to complete a pre-assigned, teacher-directed quiz without any strategic choice of software, devices, or design tools themselves.",
    checklistNote: "Using prescribed software with no student choice is Level 2."
  },
  {
    id: "ict_learning-5",
    category: "ict_learning",
    categoryTitle: "Students' Use of ICT for Learning",
    number: 5,
    index: 34,
    scenarioText: "Students select and configure their own digital publishing stack (such as a CMS, podcast recorder, or visual board), defend why this custom suite is perfect for their campaign, and use it to execute their collaborative research project.",
    correctAnswer: 4,
    justification: "This is Level 4 because students strategically select, justify, and integrate complex ICT tools independently to drive their collaborative knowledge construction project.",
    checklistNote: "Evaluating, choosing, and applying tools independently for complex collaborative goals is Level 4."
  }
];

interface RubricSelectorProps {
  aiOutline: AIOutline | null;
  user: User | null;
  onLoginRequest?: () => void;
}

export default function RubricSelector({ aiOutline, user, onLoginRequest }: RubricSelectorProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("collaboration");
  
  // Exam States: "not_started" | "running" | "ended"
  const [examState, setExamState] = useState<"not_started" | "running" | "ended">("not_started");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isGraded, setIsGraded] = useState<boolean>(false);
  
  // Timer: 50 minutes = 3000 seconds
  const [timeLeft, setTimeLeft] = useState<number>(3000);
  const [timeUsed, setTimeUsed] = useState<number>(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  
  // Filter for Graded state review list: "all" | "correct" | "incorrect"
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "incorrect">("all");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic augmentation with user's customized slides metadata if available
  const questions = CALIBRATION_CHALLENGES.map((q) => {
    if (q.number === 1 && aiOutline?.rubricsExtra) {
      const extra = aiOutline.rubricsExtra.find(
        (e) => e.rubricId === q.category || e.rubricId.toLowerCase().includes(q.category)
      );
      if (extra && extra.practiceScenario) {
        return {
          ...q,
          scenarioText: extra.practiceScenario,
          correctAnswer: extra.diagnosticAnswer || q.correctAnswer,
          justification: extra.diagnosticJustification || q.justification,
        };
      }
    }
    return q;
  });

  // Ticking effect
  useEffect(() => {
    if (examState === "running") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time out auto submit
            if (timerRef.current) clearInterval(timerRef.current);
            handleForceSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  const handleStartExam = () => {
    setAnswers({});
    setTimeLeft(3000);
    setTimeUsed(0);
    setActiveQuestionIndex(0);
    setExamState("running");
    setIsGraded(false);
    setShowConfirmSubmit(false);
    setSelectedCategoryId("collaboration");
  };

  const handleForceSubmit = async () => {
    // Overrides timer & calculates remaining seconds
    const secondsWorked = 3000 - Math.max(0, timeLeft);
    setTimeUsed(secondsWorked);
    setExamState("ended");
    setIsGraded(true);
    setShowConfirmSubmit(false);

    if (user) {
      try {
        const scoreCorrectCount = questions.reduce((acc, q) => {
          const ans = answers[q.index];
          return ans === q.correctAnswer ? acc + 1 : acc;
        }, 0);
        const computedScore = Math.round((scoreCorrectCount / 35) * 1000);
        const ansCount = Object.keys(answers).length;

        await saveParticipantScore(
          user.uid,
          user.displayName || user.email?.split("@")[0] || "Anonymous Participant",
          user.email || "",
          computedScore,
          secondsWorked,
          ansCount
        );
      } catch (err) {
        console.error("Failed to save participant score to Firestore:", err);
      }
    }
  };

  const handleOpenConfirmSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const handleCancelConfirmSubmit = () => {
    setShowConfirmSubmit(false);
  };

  const handleConfirmSubmit = () => {
    handleForceSubmit();
  };

  const handleResetExam = () => {
    setExamState("not_started");
    setAnswers({});
    setIsGraded(false);
    setTimeLeft(3000);
    setShowConfirmSubmit(false);
  };

  const currentCategory =
    mceRubrics.find((r) => r.id === selectedCategoryId) || mceRubrics[0];

  const dimStyle = DIMENSION_STYLES[selectedCategoryId] || DIMENSION_STYLES.collaboration;

  const currentQuestion = questions[activeQuestionIndex];
  const userSelectedLevel = answers[activeQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === 35;

  // Grade compilation (graded strictly out of 1000)
  const correctCount = questions.reduce((acc, q) => {
    const ans = answers[q.index];
    return ans === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  const finalScore = Math.round((correctCount / 35) * 1000);
  const isPassed = finalScore >= 700;

  // Navigation handlers
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const firstIndex = questions.findIndex((q) => q.category === categoryId);
    if (firstIndex !== -1) {
      setActiveQuestionIndex(firstIndex);
    }
  };

  const handleSelectQuestionIndex = (index: number) => {
    setActiveQuestionIndex(index);
    const q = questions[index];
    setSelectedCategoryId(q.category);
  };

  const handleSelectLevelAnswer = (level: number) => {
    if (examState !== "running") return;
    setAnswers((prev) => ({ ...prev, [activeQuestionIndex]: level }));
  };

  const handleNextQuestion = () => {
    const nextIndex = (activeQuestionIndex + 1) % 35;
    handleSelectQuestionIndex(nextIndex);
  };

  const handlePrevQuestion = () => {
    const prevIndex = (activeQuestionIndex - 1 + 35) % 35;
    handleSelectQuestionIndex(prevIndex);
  };

  // Human countdown converter
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Color dynamic timer class
  const getTimerColorClass = () => {
    if (timeLeft <= 60) return "text-red-600 bg-red-50 border-red-200 animate-pulse font-extrabold";
    if (timeLeft <= 300) return "text-amber-600 bg-amber-50 border-amber-200 font-bold";
    return "text-slate-700 bg-slate-50 border-slate-200";
  };

  // Filtered review list based on check status
  const filteredQuestions = questions.filter((q) => {
    const isCorrect = answers[q.index] === q.correctAnswer;
    if (reviewFilter === "correct") return isCorrect;
    if (reviewFilter === "incorrect") return !isCorrect;
    return true;
  });

  return (
    <div id="rubric-browser-container" className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 lg:p-8">
      
      {/* 1. Header showing core target indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-8 ${dimStyle.pillBg} rounded-full shrink-0`} />
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              21CLD MCE Rubrics & Calibration Challenge
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Calibrate your pedagogical alignment against 35 scenarios with standard MCE thresholds.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-100 shrink-0">
          <Target className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span className="font-semibold">Test Standard: Microsoft 21CLD</span>
        </div>
      </div>

      {/* 2. Top-level categories menu */}
      <div className="flex flex-wrap gap-2 mb-6">
        {mceRubrics.map((r) => {
          const isSelected = r.id === selectedCategoryId;
          const rStyle = DIMENSION_STYLES[r.id] || DIMENSION_STYLES.collaboration;
          return (
            <button
              key={r.id}
              onClick={() => handleSelectCategory(r.id)}
              id={`tab-${r.id}`}
              className={`text-xs px-3.5 py-2.5 rounded-xl border transition-all font-semibold cursor-pointer ${
                isSelected
                  ? `${rStyle.pillBg} text-white border-transparent shadow-sm scale-[1.02]`
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {r.number}. {r.title.replace("Facilitate Students' ", "").replace("Facilitate ", "")}
            </button>
          );
        })}
      </div>

      {/* 3. Main interactive workspace: Rubric guide (left) & Challenging applet (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Core Rubric definitions column (dynamic based on selected Category) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4">
          <div className={`bg-slate-50 border-l-4 ${dimStyle.borderColor} p-4 rounded-r-xl border border-y-slate-200/60 border-r-slate-200/60`}>
            <h3 className="text-sm font-bold text-slate-800">
              {currentCategory.number}. {currentCategory.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {currentCategory.description}
            </p>
          </div>

          <div className="space-y-3">
            {currentCategory.levels.map((lvl) => {
              const isLvl4 = lvl.level === 4;
              return (
                <div
                  key={lvl.level}
                  className={`p-4 rounded-xl border transition-all ${
                    isLvl4
                      ? `${dimStyle.lightBg} border-l-4 ${dimStyle.borderColor} border-y-slate-200 border-r-slate-200 shadow-xs`
                      : "bg-white border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isLvl4
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      Level {lvl.level}
                    </span>
                    {isLvl4 && (
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-200/50">
                        <Target className="w-3" /> Target Design
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">
                    {lvl.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {lvl.description}
                  </p>
                  <div className={`p-2.5 ${dimStyle.lightBg} text-[11px] text-slate-600 rounded-lg border ${dimStyle.borderColor} italic`}>
                    <span className="font-bold text-slate-700 not-italic mr-1">Active Case:</span>
                    "{lvl.example}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Concept Calibration sidebar block */}
        <div className="lg:col-span-6 xl:col-span-5">
          
          {/* STATE A: NOT STARTED (Splash Entrance) */}
          {examState === "not_started" && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-5 shadow-xs">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-blue-200">
                <Award className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Concept Calibration Challenge
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Test your evaluation skills against 35 distinct 21CLD classroom activity case setups.
                </p>
              </div>

              {/* Assessment Guidelines */}
              <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-left space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Exam Parameters
                </h4>
                
                <ul className="space-y-2 text-[11px] text-slate-600 leading-normal font-sans">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>35 Scenario Case Problems</strong> covering all seven core rubrics (exactly five cases for each category).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>50 Minutes Ticking Timer</strong>. The tool auto-grades and submits once the clock hits limits.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>1000 Maximum Point Scale</strong>. Each answer carries identical scoring weights.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>700/1000 Passing Score (70%)</strong> which reflects official MCE certification standards.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Blind Mode Enabled</strong>. Answers and academic explanations remain strictly locked until you fully submit.</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleStartExam}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Calibration Exam (50 Mins)
              </button>
            </div>
          )}

          {/* STATE B: RUNNING EXAM */}
          {examState === "running" && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[560px]">
              <div>
                
                {/* Header indicators row */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-extrabold uppercase text-slate-700 tracking-wider">
                      Interactive Challenge Mode
                    </span>
                  </div>

                  {/* 50 Mins Countdown Clock */}
                  <div className={`px-3 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${getTimerColorClass()}`}>
                    <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* Progress metrics */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1.5 font-sans font-semibold">
                  <span>Questions Progress</span>
                  <span>{answeredCount} of 35 answered</span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full mb-5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${(answeredCount / 35) * 100}%` }}
                  />
                </div>

                {/* Grid matrix of all 35 scenario badges */}
                <div className="grid grid-cols-7 gap-1.5 mb-5 select-none">
                  {questions.map((q, idx) => {
                    const isActive = idx === activeQuestionIndex;
                    const isAnswered = answers[idx] !== undefined;
                    let badgeClass = "bg-white text-slate-500 border-slate-200 hover:bg-slate-100";
                    
                    if (isActive) {
                      badgeClass = `${dimStyle.pillBg} text-white font-black shadow-xs scale-105 border-transparent`;
                    } else if (isAnswered) {
                      badgeClass = "bg-indigo-100/70 text-indigo-800 font-bold border-indigo-200/50";
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleSelectQuestionIndex(idx)}
                        className={`text-[10px] py-2 rounded-lg border text-center transition-all cursor-pointer font-sans font-semibold ${badgeClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Question Details header box */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                      Rubric {currentQuestion.category.toUpperCase().replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                      Case {currentQuestion.number} of 5
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    Target Classroom Activity:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-blue-500 pl-3">
                    "{currentQuestion.scenarioText}"
                  </p>
                </div>

                {/* Rating select selection keys */}
                <p className="text-xs font-bold text-slate-700 mb-2.5">
                  Select the 21CLD Rating Level for this Case:
                </p>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[1, 2, 3, 4].map((num) => {
                    const isSelected = userSelectedLevel === num;
                    let btnStyle = "border-slate-200 hover:bg-slate-100 text-slate-700 bg-white";
                    if (isSelected) {
                      btnStyle = `${dimStyle.pillBg} text-white font-extrabold border-transparent scale-[1.02] shadow-sm`;
                    }

                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSelectLevelAnswer(num)}
                        className={`text-xs py-3 rounded-lg border text-center transition-all font-bold cursor-pointer ${btnStyle}`}
                      >
                        L{num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Nav Row with Submit triggers */}
              <div className="space-y-3 pt-3 border-t border-slate-200 mt-3">
                
                {/* Back and Forward actions */}
                <div className="flex justify-between items-center gap-2">
                  <button
                    onClick={handlePrevQuestion}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev Case
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Slide {activeQuestionIndex + 1} / 35
                  </span>
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Next Case <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Submit button always visible, showing progress */}
                <div className="pt-1.5">
                  {!showConfirmSubmit ? (
                    <button
                      onClick={handleOpenConfirmSubmit}
                      className="w-full text-xs font-black py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-750 hover:to-teal-800 text-white shadow-md transition-all cursor-pointer transform hover:scale-[1.01] flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      Submit & Grade Calibration Exam
                    </button>
                  ) : (
                    <div className="bg-white border border-rose-200 rounded-xl p-3 text-center space-y-2.5 animate-fadeIn">
                      <p className="text-xs text-slate-700 leading-normal">
                        Are you sure you want to finish your attempt? <br />
                        <span className="font-semibold text-rose-600">
                          {answeredCount}/35 questions answered.
                        </span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelConfirmSubmit}
                          className="flex-1 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                        >
                          Keep Working
                        </button>
                        <button
                          onClick={handleConfirmSubmit}
                          className="flex-1 py-1.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                        >
                          Confirm & Grade
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STATE C: GRADED RESULTS */}
          {examState === "ended" && isGraded && (
            <div className="bg-slate-50 border border-slate-300 rounded-2xl p-5 shadow-md flex flex-col justify-between min-h-[560px]">
              <div>
                
                {/* Result Hero Header */}
                <div className="text-center p-5 bg-white border border-slate-200 rounded-2xl shadow-xs mb-5">
                  <Award className={`w-12 h-12 mx-auto mb-2 ${isPassed ? "text-emerald-500" : "text-amber-500"}`} />
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider font-mono">
                    Final Calibration Score
                  </h3>
                  <div className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                    {finalScore} <span className="text-lg text-slate-400 font-normal">/ 1000</span>
                  </div>

                  {/* Status Banner */}
                  <div className={`mt-3 py-1.5 px-4 rounded-full text-xs font-black inline-flex items-center gap-1.5 ${
                    isPassed
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                      : "bg-amber-50 text-amber-950 border border-amber-200"
                  }`}>
                    {isPassed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        PASSED (Target &gt;= 700)
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        PRACTICE REQUIRED (Target &gt;= 700)
                      </>
                    )}
                  </div>

                  {/* Completion specs */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 text-left gap-2 text-[10px] text-slate-500 font-mono">
                    <div>
                      <span>Correct: </span>
                      <strong className="text-slate-800 font-sans">{correctCount} / 35</strong>
                    </div>
                    <div>
                      <span>Time Used: </span>
                      <strong className="text-slate-800 font-sans">{formatTime(timeUsed)}</strong>
                    </div>
                  </div>

                  {/* Leaderboard sync feedback */}
                  {!user ? (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10.5px] text-amber-900 text-left space-y-2 font-sans leading-relaxed">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-650 shrink-0 mt-0.5" />
                        <div>
                          <strong>Score Not Saved</strong>: Please connect your Google account to post this challenge score to the training leaderboard.
                        </div>
                      </div>
                      {onLoginRequest && (
                        <button
                          onClick={onLoginRequest}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg transition-all cursor-pointer text-center text-[10px] uppercase tracking-wider"
                        >
                          Connect Google Training Account
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10.5px] text-emerald-900 text-left flex items-start gap-2 font-sans leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        Logged in as <strong>{user.email}</strong>. This score has been posted to the calibration leaderboard successfully!
                      </div>
                    </div>
                  )}
                </div>

                {/* Filter and selection review breakdown list */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 px-1">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Scenarios Review
                  </h4>

                  {/* Filter tabs */}
                  <div className="inline-flex rounded-lg bg-slate-250 p-0.5 border border-slate-205 text-[10px]">
                    <button
                      onClick={() => setReviewFilter("all")}
                      className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                        reviewFilter === "all" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      All ({questions.length})
                    </button>
                    <button
                      onClick={() => setReviewFilter("correct")}
                      className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                        reviewFilter === "correct" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Correct ({correctCount})
                    </button>
                    <button
                      onClick={() => setReviewFilter("incorrect")}
                      className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                        reviewFilter === "incorrect" ? "bg-white text-rose-805 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Missed ({35 - correctCount})
                    </button>
                  </div>
                </div>

                {/* Scrollable review feed with clean justifications */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {filteredQuestions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-white border border-slate-250/60 rounded-xl italic">
                      No matching cases in this category.
                    </div>
                  ) : (
                    filteredQuestions.map((q) => {
                      const userAns = answers[q.index];
                      const isCorrect = userAns === q.correctAnswer;
                      const qStyle = DIMENSION_STYLES[q.category] || DIMENSION_STYLES.collaboration;

                      return (
                        <div
                          key={q.id}
                          className={`p-3.5 rounded-xl border bg-white shadow-3xs text-left transition-all relative ${
                            isCorrect ? "border-emerald-200" : "border-rose-300"
                          }`}
                        >
                          {/* Score stamp */}
                          <div className="absolute top-3 right-3 shrink-0">
                            {isCorrect ? (
                              <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-150">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="p-1 rounded-full bg-rose-50 text-rose-600 border border-rose-150 animate-pulse">
                                <X className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="text-[9px] uppercase font-bold text-slate-400 mb-1 leading-normal font-mono">
                            Q{q.index + 1}: {q.categoryTitle} - Scenario {q.number}
                          </div>

                          <p className="text-[11px] text-slate-600 italic leading-relaxed mb-2.5">
                            "{q.scenarioText}"
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100 font-mono">
                            <span className="text-slate-500 font-sans">Answered:</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                              isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}>
                              {userAns ? `L${userAns}` : "Skipped"}
                            </span>
                            {!isCorrect && (
                              <>
                                <span className="text-slate-300 font-normal">|</span>
                                <span className="text-slate-500 font-sans">Correct standard:</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-extrabold shadow-3xs">
                                  L{q.correctAnswer}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Pedagogical support justification statement */}
                          <div className={`p-2.5 rounded-lg text-[10.5px] leading-relaxed border ${qStyle.borderColor} ${qStyle.lightBg} text-slate-700`}>
                            <span className="font-bold text-slate-800 block mb-0.5 font-sans">Academic Justification:</span>
                            {q.justification}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* Try Again controls */}
              <div className="pt-4 border-t border-slate-200 mt-4">
                <button
                  onClick={handleResetExam}
                  className="w-full text-xs font-bold py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Calibration Challenge
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
