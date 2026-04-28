import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "", dangerouslyAllowBrowser: true });

export interface AnalysisResult {
  priority: "High" | "Medium" | "Low";
  categories: string[];
  entities: string[];
  sentiment: "positive" | "neutral" | "negative";
  impact_score: number;
}

export async function analyzeNewsItem(title: string, body: string): Promise<AnalysisResult> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a financial news analyzer. Analyze the provided financial news item and provide exactly a JSON object with the following fields:
"priority": "High" | "Medium" | "Low",
"categories": array of strings,
"entities": array of strings,
"sentiment": "positive" | "neutral" | "negative",
"impact_score": number between 0 and 1.

Requirements:
1. Priority: High (market-moving, central bank, major M&A), Medium (sector news, earnings), Low (commentary, minor news).
2. Categories: List finance categories.
3. Entities: Extract company names, tickers, people, or currencies.
4. Sentiment: positive, neutral, or negative.
5. Impact Score: 0 to 1 based on expected market impact.`
        },
        {
          role: "user",
          content: `Title: ${title}\nBody: ${body}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    const result = JSON.parse(content || "{}");
    
    return {
      priority: result.priority || "Low",
      categories: result.categories || [],
      entities: result.entities || [],
      sentiment: result.sentiment || "neutral",
      impact_score: typeof result.impact_score === 'number' ? result.impact_score : 0.1
    } as AnalysisResult;
  } catch (error) {
    console.error("Groq analysis error:", error);
    return {
      priority: "Low",
      categories: [],
      entities: [],
      sentiment: "neutral",
      impact_score: 0.1
    };
  }
}
