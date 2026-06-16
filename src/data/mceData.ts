export interface RubricLevel {
  level: number;
  title: string;
  description: string;
  example: string;
}

export interface RubricCategory {
  id: string;
  number: number;
  title: string;
  description: string;
  levels: RubricLevel[];
}

export const mceRubrics: RubricCategory[] = [
  {
    id: "collaboration",
    number: 1,
    title: "Facilitate Students' Collaboration",
    description: "Assess the level at which learning activities promote student collaboration, joint responsibility, and substantive decision-making.",
    levels: [
      {
        level: 1,
        title: "Students Work Individually",
        description: "Students complete tasks alone without interacting with others.",
        example: "A teacher asks each student to write an essay on climate change and submit it individually."
      },
      {
        level: 2,
        title: "Students Work Together (Share Info)",
        description: "Students may discuss ideas but do not make shared decisions.",
        example: "Students sit in groups discussing climate change but each writes and submits their own essay."
      },
      {
        level: 3,
        title: "Students Have Shared Responsibility",
        description: "Students work together and are responsible for completing a common task.",
        example: "A group of students creates a presentation on climate change. Each member researches a different aspect and contributes to the final presentation."
      },
      {
        level: 4,
        title: "Shared Responsibility + Substantive Decision-Making",
        description: "Students work together and make important decisions about the work process and outcome.",
        example: "Students decide what climate issue to investigate, assign roles, choose digital tools, design solutions, and present recommendations to stakeholders."
      }
    ]
  },
  {
    id: "communication",
    number: 2,
    title: "Facilitate Skilled Communication",
    description: "Assess whether communication shows extended delivery and includes evidence supporting arguments, tailored for real-world audiences.",
    levels: [
      {
        level: 1,
        title: "Limited Communication",
        description: "Students provide simple answers or responses.",
        example: "Students answer multiple-choice questions about environmental pollution."
      },
      {
        level: 2,
        title: "Extended Communication",
        description: "Students communicate more than a single answer.",
        example: "Students write a one-page report describing causes of pollution."
      },
      {
        level: 3,
        title: "Extended Communication with Evidence",
        description: "Students support their ideas with facts and reasoning.",
        example: "Students write a report using statistics and research findings to explain pollution effects."
      },
      {
        level: 4,
        title: "Tailored for Real Audience",
        description: "Students communicate with evidence and tailor their message for a real audience.",
        example: "Students create a persuasive video campaign for community leaders on reducing plastic waste."
      }
    ]
  },
  {
    id: "knowledge_construction",
    number: 3,
    title: "Facilitate Knowledge Construction",
    description: "Assess if students generate ideas/understandings of deep topics and can apply them to real-world problems.",
    levels: [
      {
        level: 1,
        title: "Reproduction of Information",
        description: "Students simply recall facts.",
        example: "Memorizing and listing the parts of a computer."
      },
      {
        level: 2,
        title: "Basic Processing",
        description: "Students summarize or organize information.",
        example: "Students create a chart comparing laptop and desktop computers."
      },
      {
        level: 3,
        title: "Knowledge Construction",
        description: "Students interpret, analyze, and draw conclusions.",
        example: "Students analyze how different devices affect productivity and learning."
      },
      {
        level: 4,
        title: "Application to Real-World Problems",
        description: "Students create new ideas or solutions.",
        example: "Students design a technology plan for improving learning in their school."
      }
    ]
  },
  {
    id: "self_regulation",
    number: 4,
    title: "Facilitate Self-Regulation",
    description: "Assess if assignments are long-term, if students have planning/tracking tools, and if they reflect on outcomes.",
    levels: [
      {
        level: 1,
        title: "Teacher Controls Everything",
        description: "The teacher determines all activities and timelines.",
        example: "Students complete a worksheet during a single class period."
      },
      {
        level: 2,
        title: "Short-Term Planning",
        description: "Students have some responsibility for managing their work.",
        example: "Students complete a project over two days using a teacher-provided checklist."
      },
      {
        level: 3,
        title: "Long-Term Planning and Monitoring",
        description: "Students plan, monitor, and evaluate their progress.",
        example: "Students maintain a project journal while completing a two-week assignment."
      },
      {
        level: 4,
        title: "Independent Goal Setting & Reflection",
        description: "Students set goals, monitor progress, revise strategies, and reflect.",
        example: "Students create personal learning goals, track progress, and adjust plans based on feedback."
      }
    ]
  },
  {
    id: "problem_solving",
    number: 5,
    title: "Facilitate Real-World Problem Solving and Innovation",
    description: "Assess if students investigate authentic issues, devise practical solutions, and initiate innovation.",
    levels: [
      {
        level: 1,
        title: "No Real-World Connection",
        description: "Tasks are purely academic.",
        example: "Students solve textbook mathematics problems."
      },
      {
        level: 2,
        title: "Real-World Context",
        description: "Problems are connected to real life but solutions remain theoretical.",
        example: "Students discuss traffic congestion in their city."
      },
      {
        level: 3,
        title: "Real Problem Solving",
        description: "Students investigate authentic issues.",
        example: "Students collect traffic data around the school and identify causes of congestion."
      },
      {
        level: 4,
        title: "Innovation and Implementation",
        description: "Students develop and implement solutions.",
        example: "Students design a traffic-awareness campaign and present recommendations to local authorities."
      }
    ]
  },
  {
    id: "ict_tools",
    number: 6,
    title: "Facilitate Students' Use of ICT Tools",
    description: "Assess if technology supports active knowledge construction and collaboration, or facilitates creation of new knowledge.",
    levels: [
      {
        level: 1,
        title: "ICT for Basic Learning",
        description: "Technology is used only to consume information.",
        example: "Students watch a YouTube video about ecosystems."
      },
      {
        level: 2,
        title: "ICT Supports Knowledge Construction",
        description: "Technology helps students analyze or organize information.",
        example: "Students use Excel to organize ecosystem data."
      },
      {
        level: 3,
        title: "ICT Supports Collaboration & Construction",
        description: "Students use technology collaboratively.",
        example: "Students work together in Google Docs to create a research report."
      },
      {
        level: 4,
        title: "ICT Enables Creation of New Knowledge",
        description: "Students use technology to design, create, and share innovative products.",
        example: "Students develop a website or mobile app that educates the community about environmental conservation."
      }
    ]
  },
  {
    id: "ict_learning",
    number: 7,
    title: "Facilitate Students' Use of ICT for Learning",
    description: "Assess if students select appropriate ICT tools strategically and independently rather than having everything teacher-directed.",
    levels: [
      {
        level: 1,
        title: "Teacher Uses ICT",
        description: "Technology is primarily used by the teacher.",
        example: "The teacher presents lessons using PowerPoint."
      },
      {
        level: 2,
        title: "Students Use ICT Under Direction",
        description: "Students use technology for guided activities.",
        example: "Students complete an online quiz assigned by the teacher."
      },
      {
        level: 3,
        title: "Students Select Appropriate ICT Tools",
        description: "Students choose suitable technology tools for learning.",
        example: "Students decide whether to use Canva, PowerPoint, or Google Slides for a presentation."
      },
      {
        level: 4,
        title: "Strategic & Independent ICT Use",
        description: "Students independently select, evaluate, and use technology to achieve learning goals.",
        example: "Students choose various digital tools (AI, spreadsheets, video editors, websites) to research, analyze data, create solutions, and communicate results to a real audience."
      }
    ]
  }
];

export const mceSummaryTableHeaders = ["Level", "Description", "Focus Theme"];

export const mceSummaryTableRows = [
  { level: "Level 1", desc: "Basic / Teacher-directed", color: "bg-red-50 text-red-700 border-red-200" },
  { level: "Level 2", desc: "Developing / Limited student involvement", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { level: "Level 3", desc: "Proficient / Students actively engage and contribute", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { level: "Level 4", desc: "Advanced / Student-centered, real-world, innovative, and independent", color: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold" }
];
