import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint to generate customized fitness and nutritional plan
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const assessment = req.body;
      if (!assessment) {
        return res.status(400).json({ error: "Assessment questionnaire data is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured. Please add your key in the Settings > Secrets panel of Google AI Studio."
        });
      }

      const prompt = `Generate a highly personalized fitness training and nutrition plan based on the following user assessment questionnaire:
${JSON.stringify(assessment, null, 2)}

Ensure the workouts match their fitness level, preferences, equipment availability, and weekly frequency.
Ensure the nutrition recommendations strictly respect their diet type (e.g. Vegetarian, Vegan, Keto, etc.) and any allergies or food restrictions.
Make the instructions extremely actionable, highly detailed, and encouraging.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite, professional athletic coach and certified clinical nutritionist. You analyze a user's exact health profile, current state, equipment, goals, and diet restrictions to formulate a high-fidelity, customized weekly workout split and macro-matched meal guidelines.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              workoutPlan: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  weeklySchedule: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        day: { type: Type.STRING, description: "e.g., 'Monday - Chest & Triceps Split' or 'Tuesday - REST/Active Recovery'" },
                        activityType: { type: Type.STRING, description: "e.g., 'Strength', 'Cardio', 'HIIT', 'Rest', 'Stretching'" },
                        durationMinutes: { type: Type.INTEGER },
                        exercises: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              sets: { type: Type.INTEGER },
                              reps: { type: Type.STRING, description: "e.g., '10-12 reps' or '45 seconds duration'" },
                              restSeconds: { type: Type.INTEGER, description: "Rest time between sets in seconds" },
                              instruction: { type: Type.STRING }
                            },
                            required: ["name", "sets", "reps", "restSeconds", "instruction"]
                          }
                        }
                      },
                      required: ["day", "activityType", "durationMinutes", "exercises"]
                    }
                  },
                  tips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["title", "description", "difficulty", "weeklySchedule", "tips"]
              },
              nutritionPlan: {
                type: Type.OBJECT,
                properties: {
                  dietType: { type: Type.STRING },
                  dailyCalories: { type: Type.INTEGER },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      protein: { type: Type.INTEGER, description: "Protein target in grams" },
                      carbs: { type: Type.INTEGER, description: "Carbohydrates target in grams" },
                      fat: { type: Type.INTEGER, description: "Fats target in grams" }
                    },
                    required: ["protein", "carbs", "fat"]
                  },
                  guidelines: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  mealSuggestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        mealType: { type: Type.STRING, description: "Breakfast, Lunch, Dinner, or Snack" },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        calories: { type: Type.INTEGER },
                        proteinGrams: { type: Type.INTEGER }
                      },
                      required: ["mealType", "name", "description", "calories", "proteinGrams"]
                    }
                  }
                },
                required: ["dietType", "dailyCalories", "macros", "guidelines", "mealSuggestions"]
              }
            },
            required: ["workoutPlan", "nutritionPlan"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response content from Gemini API");
      }

      const planJson = JSON.parse(text.trim());
      res.json(planJson);
    } catch (error) {
      console.error("Gemini Plan Generation Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
  });

  // Serve static files or hook up Vite middleware
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
