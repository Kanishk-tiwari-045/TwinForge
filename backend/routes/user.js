import pool from '../config/database.js';

export const analyzeWritingStyle = async (req, res, model, generationConfig) => {
  console.log("Received body:", req.body);
  try {
    const { user_id, messages } = req.body;
    if (!user_id || !messages || !Array.isArray(messages) || messages.length < 1) {
      return res.status(400).json({ error: "Provide user_id and an array of messages." });
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
      generationConfig
    });
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      console.error("Invalid response format:", responseText);
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    const userStyleData = JSON.parse(jsonMatch[0]).user_style;

    await pool.query(
      `INSERT INTO user_styles (user_id, tone, vocabulary, humor, emoji_usage, sentence_structure, 
        greeting_style, closing_style, response_pattern, level_of_enthusiasm)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (user_id) DO UPDATE SET
        tone = EXCLUDED.tone,
        vocabulary = EXCLUDED.vocabulary,
        humor = EXCLUDED.humor,
        emoji_usage = EXCLUDED.emoji_usage,
        sentence_structure = EXCLUDED.sentence_structure,
        greeting_style = EXCLUDED.greeting_style,
        closing_style = EXCLUDED.closing_style,
        response_pattern = EXCLUDED.response_pattern,
        level_of_enthusiasm = EXCLUDED.level_of_enthusiasm`,
      [user_id, userStyleData.tone, userStyleData.vocabulary, userStyleData.humor,
       userStyleData.emoji_usage, userStyleData.sentence_structure, userStyleData.greeting_style,
       userStyleData.closing_style, userStyleData.response_pattern, userStyleData.level_of_enthusiasm]
    );

    res.json({ success: true, user_style: userStyleData });
  } catch (error) {
    console.error("Error analyzing writing style:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const generatePersonalizedResponse = async (req, res, model, generationConfig) => {
  try {
    const { user_id, email_or_msg } = req.body;
    if (!user_id || !email_or_msg) {
      return res.status(400).json({ error: "Provide user_id and an email or message." });
    }

    const result = await pool.query('SELECT * FROM user_styles WHERE user_id = $1', [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User writing style not found. Please analyze first." });
    }

    const data = result.rows[0];

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

    const aiResult = await model.generateContent({ 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig
    });
    
    const responseText = aiResult.response.text();
    const jsonMatch = responseText.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      console.error("Failed to extract JSON from AI response:", responseText);
      return res.status(500).json({ error: "AI response format is invalid." });
    }
    
    const jsonResponse = JSON.parse(jsonMatch[0]);
    const ai_response = jsonResponse?.personalized_response || "No response generated.";

    await pool.query(
      'INSERT INTO user_responses (user_id, email_or_msg, ai_response) VALUES ($1, $2, $3)',
      [user_id, email_or_msg, ai_response]
    );

    res.json({ success: true, ai_response });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
