import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Basic API check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Generate MCE presentation outline, speaker notes, and interactive quiz training content
app.post("/api/mce/generate-outline", async (req, res) => {
  try {
    const { presenterName, institution, trainingFocus, slideTone, customContext } = req.body;

    if (!geminiApiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured. Please add it to your secrets.",
      });
    }

    const systemPrompt = `You are an expert MCE (Microsoft Certified Educator) Trainer.
Your task is to take standard MCE 21st Century Learning Design (21CLD) Rubrics and produce tailored training slide content, speaker notes, and an interactive real-world school scenario (a concrete diagnostic exercise/quiz) to assess the level for that rubric.

You should produce customized content in JSON format matching the schema requested. The tone of the slides must be highly professional and tailored to: "${slideTone || "Inspiring & Professional"}" for the presenter "${presenterName || "Educator"}" at "${institution || "MCE Training Clinic"}".
Focus area requested: "${trainingFocus || "General training"}"
Extra custom guidelines: "${customContext || "None"}"`;

    const userPrompt = `Generate tailored speaker notes, advanced teaching tips, and 1 real-world lesson scenario for each of the 7 MCE rubrics:
1. Facilitate Students' Collaboration (Level 1-4)
2. Facilitate Skilled Communication (Level 1-4)
3. Facilitate Knowledge Construction (Level 1-4)
4. Facilitate Self-Regulation (Level 1-4)
5. Facilitate Real-World Problem Solving and Innovation (Level 1-4)
6. Facilitate Students' Use of ICT Tools (Level 1-4)
7. Facilitate Students' Use of ICT for Learning (Level 1-4)

For each rubric, provide:
- A customized 'slideSubheading' that fits the overall tone.
- A customized 'presenterNote' with specific, high-impact strategies for teaching this rubric.
- A 'targetLevel4Emphasis' explaining how Level 4 is achieved in this exact category.
- A 'practiceScenario' which is a realistic school assignment description.
- A 'diagnosticAnswer' which is the correct Level (1 to 4) of that practice scenario, with a detailed explanatory justification.

Return standard JSON that conforms to the requested response schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleSlide: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                welcomeMessage: { type: Type.STRING },
              },
              required: ["title", "subtitle", "welcomeMessage"],
            },
            rubricsExtra: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rubricId: { type: Type.STRING, description: "Matches collaboration, communication, knowledge_construction, self_regulation, problem_solving, ict_tools, or ict_learning" },
                  slideSubheading: { type: Type.STRING },
                  presenterNote: { type: Type.STRING },
                  targetLevel4Emphasis: { type: Type.STRING },
                  practiceScenario: { type: Type.STRING },
                  diagnosticAnswer: { type: Type.INTEGER, description: "Correct MCE Rubric Level (1-4)" },
                  diagnosticJustification: { type: Type.STRING },
                },
                required: [
                  "rubricId",
                  "slideSubheading",
                  "presenterNote",
                  "targetLevel4Emphasis",
                  "practiceScenario",
                  "diagnosticAnswer",
                  "diagnosticJustification",
                ],
              },
            },
          },
          required: ["titleSlide", "rubricsExtra"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini processing error:", error);
    res.status(500).json({ error: error.message || "Failed to generate customized outlines" });
  }
});

// Configure Vite and static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
