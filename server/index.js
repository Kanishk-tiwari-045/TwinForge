import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabase = createClient(
  "https://hfduzkjpzvowjzrkeagp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZHV6a2pwenZvd2p6cmtlYWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMzIzMjksImV4cCI6MjA1ODgwODMyOX0.1F0lhUhrzh84r1QP64ta0utUyztSqvnjPBcnUujGtaE"
);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyCJ5GaisuqS73ju5rqs0zAkMvaoR09pOF8");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generationConfig = {
  temperature: 0.5,
  topP: 0.8,
  topK: 30,
  maxOutputTokens: 1024,
  responseMimeType: "text/plain",
};

/**
 * API 1: Analyze and Save User Writing Style
 */
app.post("/analyze-style", async (req, res) => {
  console.log("Received body:", req.body);
  try {
    const { user_id, messages } = req.body;
    if (
      !user_id ||
      !messages ||
      !Array.isArray(messages) ||
      messages.length < 1
    ) {
      return res
        .status(400)
        .json({ error: "Provide user_id and an array of messages." });
    }

    const prompt = `
Examine the provided messages and determine the user's unique writing style based on:
Tone (formal, friendly, sarcastic, etc.)
Vocabulary (sophisticated, simple, etc.)
Humor (dry, witty, playful, none)
Emoji Usage (frequent, minimal, never)
Sentence Structure (long & detailed, short & direct)
Greeting Style (Hey!, Dear [Name], etc.)
Closing Style (Best regards, Cheers!, etc.)
Response Pattern (detailed, brief, asks questions)
Level of Enthusiasm (high-energy, neutral, reserved)
User Messages:
${messages.map((msg, index) => `${index + 1}. "${msg}"`).join("\n")}
Return the analysis strictly in this JSON format:
\`\`\`json
{
  "user_style": {
    "tone": "...",
    "vocabulary": "...",
    "humor": "...",
    "emoji_usage": "...",
    "sentence_structure": "...",
    "greeting_style": "...",
    "closing_style": "...",
    "response_pattern": "...",
    "level_of_enthusiasm": "..."
  }
}
\`\`\`
Do not include any explanations, only return valid JSON.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      console.error("Invalid response format:", responseText);
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    const userStyleData = JSON.parse(jsonMatch[0]).user_style;

    const { error } = await supabase
      .from("user_styles")
      .upsert({ user_id, ...userStyleData }, { onConflict: "user_id" });

    if (error) {
      console.error("Supabase Upsert Error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return res
        .status(500)
        .json({
          error: "Failed to save data to Supabase.",
          details: error.message,
        });
    }

    res.json({ success: true, user_style: userStyleData });
  } catch (error) {
    console.error("Error analyzing writing style:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * API 2: Generate a Personalized Response Based on Writing Style
 */
app.post("/generate-response", async (req, res) => {
  try {
    const { user_id, email_or_msg } = req.body;
    if (!user_id || !email_or_msg) {
      return res
        .status(400)
        .json({ error: "Provide user_id and an email or message." });
    }

    const { data, error } = await supabase
      .from("user_styles")
      .select("*")
      .eq("user_id", user_id)
      .single();
    if (error) {
      console.error("Supabase Fetch Error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return res
        .status(500)
        .json({
          error: "Failed to fetch user style from Supabase.",
          details: error.message,
        });
    }
    if (!data) {
      return res
        .status(404)
        .json({ error: "User writing style not found. Please analyze first." });
    }

    const prompt = `
The user has the following writing style:
Tone: ${data.tone}
Vocabulary: ${data.vocabulary}
Humor: ${data.humor}
Emoji Usage: ${data.emoji_usage}
Sentence Structure: ${data.sentence_structure}
Greeting Style: ${data.greeting_style}
Closing Style: ${data.closing_style}
Response Pattern: ${data.response_pattern}
Level of Enthusiasm: ${data.level_of_enthusiasm}
Craft a personalized response to the following message using this style:
Message: "${email_or_msg}"
Return the response strictly in this JSON format:
\`\`\`json
{
  "personalized_response": "..."
}
\`\`\`
Do not include any explanations, only return valid JSON.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const responseText = result.response.text();
    console.log("Gemini Raw Response:", responseText);
    const jsonMatch = responseText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error("Failed to extract JSON from AI response:", responseText);
      return res.status(500).json({ error: "AI response format is invalid." });
    }
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      return res.status(500).json({ error: "Failed to parse AI response." });
    }
    const ai_response =
      jsonResponse?.personalized_response || "No response generated.";

    const { error: insertError } = await supabase
      .from("user_responses")
      .insert([{ user_id, email_or_msg, ai_response }]);
    if (insertError) {
      console.error("Supabase Insert Error:", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      });
      return res
        .status(500)
        .json({
          error: "Failed to save AI response to Supabase.",
          details: insertError.message,
        });
    }

    res.json({ success: true, ai_response });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * API 3: Detect AI-Generated Text
 */
app.post("/detect-ai", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const strictPrompt = `
    You are an advanced AI text evaluator with expertise in distinguishing AI-generated content from human-written text.
    Analyze the following text thoroughly based on these factors:
    - Sentence Complexity & Variance
    - Logical Coherence
    - Repetitive Patterns
    - Linguistic Fluency & Natural Errors
    - Emotional & Personal Touch
    - Fact-checking & Hallucination Detection
    Strictly analyze these aspects and determine **only** whether the text is AI-generated or human-written.
    Respond **only** with "true" (if AI-generated) or "false" (if human-written) without any additional explanation.
    `;

    const chatSession = model.startChat({
      generationConfig,
      history: [{ role: "user", parts: [{ text: strictPrompt }] }],
    });

    const result = await chatSession.sendMessage(text);
    const responseText = result.response.text().trim().toLowerCase();
    const isAIGenerated = responseText.includes("true");

    res.json({ ai_generated: isAIGenerated });
  } catch (error) {
    console.error("Error in detect-ai:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * API 4: Generate Research Insights (No Supabase Insertion)
 */
app.post("/research-insights", async (req, res) => {
  try {
    const { user_id, topic } = req.body;
    if (!user_id || !topic) {
      return res.status(400).json({ error: "Provide user_id and a topic." });
    }

    const prompt = `
Generate research insights for the following topic:
Topic: "${topic}"
For each insight, provide a concise summary and a specific action item.
Return the insights strictly in this JSON format:
\`\`\`json
{
  "insights": [
    {
      "summary": "...",
      "action": "..."
    }
  ]
}
\`\`\`
Do not include any explanations, only return valid JSON.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      console.error("Invalid response format:", responseText);
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    const insightsData = JSON.parse(jsonMatch[0]).insights;

    res.json({ success: true, insights: insightsData });
  } catch (error) {
    console.error("Error generating research insights:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
