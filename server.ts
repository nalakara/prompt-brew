import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // Lazy initialization helper for Google GenAI client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      // In development, the platform might load variables from env/setting
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required but was not found. Please verify Settings > Secrets.");
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Secure API endpoint for prompt refinement (Server-side Gemini proxy)
  app.post("/api/gemini/refine", async (req, res) => {
    try {
      const { prompt, model, purpose, language, customContext } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const systemInstruction = `You are a world-class prompt engineering expert. Your task is to refine and enhance the user-provided prompt to make it more effective, detailed, and specific for the target AI model. 
- The user's target AI is "${model}" and their goal is "${purpose}".
- The final generated content from the prompt should be in ${language}.${customContext ? `\n- Adapt and personalize the prompt to fit this user context/persona perfectly: "${customContext}".` : ''}
- Analyze the user's prompt and add details, context, and specific instructions that would lead to a higher quality output from the target AI.
- Do NOT execute the prompt or generate the content. Your only job is to improve the prompt itself.
- Return only the improved prompt text, without any conversational preamble or explanation.`;

      const customKey = req.headers["x-gemini-key"];
      let ai: GoogleGenAI;

      if (customKey && typeof customKey === "string" && customKey.trim()) {
        ai = new GoogleGenAI({
          apiKey: customKey.trim(),
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } else {
        ai = getGeminiClient();
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash", // Utilizing the modern and efficient gemini-3.5-flash model
        contents: `Here is the user's prompt to refine:\n\n---\n${prompt}\n---`,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
        },
      });

      const text = response.text ? response.text.trim() : "";
      res.json({ refinedPrompt: text });
    } catch (error: any) {
      console.error("Error in server-side refinement:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with Gemini API." });
    }
  });

  // Integrate Vite for single-page asset rendering & HMR configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Use asterisk to safely capture SPA fallbacks
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
