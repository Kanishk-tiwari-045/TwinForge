import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from '@mozilla/readability';

export const summarizeArticle = async (req, res, model, generationConfig) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.get(url);
    if (!response.data) {
      throw new Error("Failed to fetch article content");
    }
    const html = response.data;
    const dom = new JSDOM(html, { url });
    const { document } = dom.window;
    const reader = new Readability(document);
    const article = reader.parse();
    
    if (!article || !article.textContent) {
      throw new Error("Unable to extract article content");
    }
    
    const content = article.textContent;
    const prompt = `Summarize the following article in a concise manner, capturing the key points and main ideas:\n\n${content}`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig
    });

    const summary = result.response.text();
    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing article:", error);
    res.status(500).json({ error: error.message || "Failed to summarize article" });
  }
};

export const detectAI = async (req, res, model, generationConfig) => {
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
};

export const generateResearchInsights = async (req, res, model) => {
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
};
