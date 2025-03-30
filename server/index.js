import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabase = createClient("https://hfduzkjpzvowjzrkeagp.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZHV6a2pwenZvd2p6cmtlYWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMzIzMjksImV4cCI6MjA1ODgwODMyOX0.1F0lhUhrzh84r1QP64ta0utUyztSqvnjPBcnUujGtaE");

// Initialize Gemini AI"
const genAI = new GoogleGenerativeAI("AIzaSyCJ5GaisuqS73ju5rqs0zAkMvaoR09pOF8");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * API 1: Analyze and Save User Writing Style
 */
app.post("/analyze-style", async (req, res) => {
  console.log("Received body:", req.body);
  try {
    const { user_id, messages } = req.body;
    if (!user_id || !messages || !Array.isArray(messages) || messages.length < 1) {
      return res.status(400).json({ error: "Provide user_id and an array of messages." });
    }

    // Construct prompt for Gemini
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

    // Call Gemini API
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

    // **🚀 Fix: Ensure upsert works by correctly using `onConflict`**
    const { error } = await supabase
  .from("user_styles")
  .upsert(
    { username, ...userStyleData },
    { 
      conflict: 'username', // Newer syntax
      updateColumns: ['tone', 'vocabulary', 'humor', 'emoji_usage', 'sentence_structure', 'greeting_style', 'closing_style', 'response_pattern', 'level_of_enthusiasm'] // Explicitly list columns to update
    }
  );

    if (error) {
      console.error("Supabase Insert Error:", error);
      return res.status(500).json({ error: "Failed to save data to Supabase." });
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
      return res.status(400).json({ error: "Provide user_id and an email or message." });
    }

    // Fetch User Writing Style from Supabase
    const { data, error } = await supabase.from("user_styles").select("*").eq("user_id", user_id).single();
    if (error || !data) {
      return res.status(404).json({ error: "User writing style not found. Please analyze first." });
    }

    // Construct prompt for Gemini using the fetched style
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

    const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
    const responseText = result.response.text();
    console.log("Gemini Raw Response:", responseText);
    const jsonMatch = responseText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error("Failed to extract JSON from AI response.");
      return res.status(500).json({ error: "AI response format is invalid." });
    }
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      return res.status(500).json({ error: "Failed to parse AI response." });
    }
    const ai_response = jsonResponse?.personalized_response || "No response generated.";

    // Save AI response to Supabase
    const { error: insertError } = await supabase
      .from("user_responses")
      .insert([{ user_id, email_or_msg, ai_response }]);
    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return res.status(500).json({ error: "Failed to save AI response to Supabase." });
    }

    res.json({ success: true, ai_response });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));