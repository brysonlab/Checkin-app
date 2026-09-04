import { GoogleGenAI } from "@google/genai";

/**
 * Result structure returned by the Gemini reflection service.
 */
export interface ReflectionResult {
  reflection: string;
  source: "gemini" | "fallback";
  modelUsed?: string;
  error?: string;
}

// System instruction tailored for empathetic, non-diagnostic journal reflection
const SYSTEM_INSTRUCTION = `You are the empathetic, grounded reflection companion for the Check-In micro-support app.
Your sole purpose is to write a warm, brief (2 to 3 sentences) emotional reflection for someone who just shared a private journal entry to process their feelings.

CRITICAL RULES:
1. Acknowledge what the person expressed and validate their emotions with warmth and dignity.
2. Use gentle, grounded, plain human language.
3. Keep the reflection short — strictly 2 to 3 sentences.
4. Do NOT give advice, action steps, solutions, or life coaching. This space is purely for emotional validation and holding space.
5. Do NOT diagnose, label, or evaluate psychological conditions or mental health states.
6. Do NOT claim certainty about the person's mental state.
7. Do NOT pretend to be a therapist, clinical psychologist, medical doctor, or licensed counselor.
8. Do NOT mention being an AI, language model, algorithm, or virtual assistant.
9. Maintain strict emotional safety and non-judgmental acceptance.`;

// Compassionate fallback reflections used when Gemini API is unreachable, unconfigured, or returns an error
const FALLBACK_REFLECTIONS = [
  "Thank you for putting this into words. Taking time to acknowledge how you feel is an act of gentle, honest care.",
  "It takes courage to name what you are carrying. Thank you for giving your thoughts and feelings a safe space to breathe.",
  "Thank you for sharing your thoughts here. Honoring your emotional experience as it is right now is a meaningful step.",
];

function getRandomFallback(): string {
  const index = Math.floor(Math.random() * FALLBACK_REFLECTIONS.length);
  return FALLBACK_REFLECTIONS[index];
}

// Lazy-initialized Gemini client singleton
let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  // Re-instantiate if the API key changed in the environment
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    cachedApiKey = apiKey;
  }

  return cachedClient;
}

/**
 * Resolves the primary Gemini model name to use.
 * Defaults to "gemini-3.1-flash-lite" for ultra-fast, high-availability micro-support reflections,
 * with graceful fallback to "gemini-3.8-flash" and "gemini-flash-latest".
 */
export function getGeminiModelName(): string {
  const configured = process.env.GEMINI_MODEL?.trim();
  // Ensure the configured model name is actually a valid gemini model identifier (and not an invalid token or deprecated 3.6)
  if (configured && configured.startsWith("gemini-") && !configured.includes("3.6-flash")) {
    return configured;
  }
  return "gemini-3.1-flash-lite";
}

/**
 * Helper to wait for a given number of milliseconds.
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates an empathetic, validated reflection for a user's check-in journal entry.
 *
 * @param rawText The raw text submitted by the user.
 * @returns ReflectionResult containing the generated reflection and metadata.
 */
export async function generateJournalReflection(rawText: string): Promise<ReflectionResult> {
  // 1. Input validation
  if (!rawText || typeof rawText !== "string") {
    return {
      reflection: getRandomFallback(),
      source: "fallback",
      error: "Empty or invalid input received.",
    };
  }

  const trimmedText = rawText.trim();
  if (trimmedText.length === 0) {
    return {
      reflection: getRandomFallback(),
      source: "fallback",
      error: "Journal entry contains only whitespace.",
    };
  }

  // Guard against excessively long entries (token abuse / denial of service)
  const MAX_CHAR_LENGTH = 10000;
  const sanitizedText =
    trimmedText.length > MAX_CHAR_LENGTH ? trimmedText.slice(0, MAX_CHAR_LENGTH) : trimmedText;

  // 2. Client & API Key verification
  const ai = getGeminiClient();
  const configuredModel = getGeminiModelName();

  if (!ai) {
    return {
      reflection: getRandomFallback(),
      source: "fallback",
      error: "GEMINI_API_KEY is not configured.",
    };
  }

  // 3. Resilient model fallback cascade (avoiding deprecated / overloaded models)
  const candidateModels: string[] = [];
  if (configuredModel) {
    candidateModels.push(configuredModel);
  }
  if (!candidateModels.includes("gemini-3.1-flash-lite")) {
    candidateModels.push("gemini-3.1-flash-lite");
  }
  if (!candidateModels.includes("gemini-3.8-flash")) {
    candidateModels.push("gemini-3.8-flash");
  }
  if (!candidateModels.includes("gemini-flash-latest")) {
    candidateModels.push("gemini-flash-latest");
  }

  const prompt = `A person wrote this personal journal entry to process what they are experiencing:\n"""\n${sanitizedText}\n"""\n\nPlease provide a short, compassionate, 2 to 3 sentence reflection validating what they felt.`;

  for (const modelToTry of candidateModels) {
    // Attempt with retry on 503 / 429 temporary demand spikes
    const MAX_RETRIES_PER_MODEL = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelToTry,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        const generatedText = response.text?.trim();

        if (generatedText && generatedText.length > 0) {
          return {
            reflection: generatedText,
            source: "gemini",
            modelUsed: modelToTry,
          };
        }
      } catch (error: any) {
        const status = Number(error?.status || error?.statusCode || error?.code) || 0;
        const errorMessage = String(error?.message || "");
        const isTransient =
          status === 503 ||
          status === 429 ||
          errorMessage.includes("high demand") ||
          errorMessage.includes("UNAVAILABLE") ||
          errorMessage.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt < MAX_RETRIES_PER_MODEL) {
          // Exponential backoff with small jitter before retrying same model
          const delayMs = 350 * attempt + Math.floor(Math.random() * 150);
          await wait(delayMs);
          continue;
        }

        // Move to the next candidate model in the cascade
        break;
      }
    }
  }

  // If all candidate models failed, return graceful empathetic fallback reflection
  return {
    reflection: getRandomFallback(),
    source: "fallback",
    modelUsed: configuredModel,
  };
}
