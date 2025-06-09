// src/lib/gemini-service.ts
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
  ChatSession,
  Content,
  Tool,
  FunctionDeclarationsTool,
  Part,
  SchemaType,
  SafetySetting,
} from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const GET_ODDS_TOOL_NAME = "GET_ODDS";

const SUPPORTED_SPORTSBOOKS = ["fanduel", "draftkings", "betmgm", "pointsbet", "caesars", "wynn", "bet_rivers_ny"];

interface GetOddsToolArgs {
  sportsbook?: string;
  model?: string;
  kelly_criterion?: boolean;
}

const getNBAGameOddsToolDeclaration: FunctionDeclarationsTool = {
  functionDeclarations: [
    {
      name: GET_ODDS_TOOL_NAME,
      description: `Fetches current NBA game odds, AI predictions, and potentially live/recent-final scores from the backend data feed. Supported sportsbooks include: ${SUPPORTED_SPORTSBOOKS.join(', ')}. If the user specifies a sportsbook, use it. Otherwise, 'fanduel' is the default.`,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          sportsbook: {
            type: SchemaType.STRING,
            description: `The sportsbook to fetch odds from. Examples: ${SUPPORTED_SPORTSBOOKS.join(', ')}. Defaults to 'fanduel' if not specified or if an unsupported one is requested by the user.`
          },
          model: { type: SchemaType.STRING, description: "Prediction model (e.g., 'xgboost'). Default 'xgboost'." },
          kelly_criterion: { type: SchemaType.BOOLEAN, description: "Include Kelly Criterion. Default true." },
        },
        required: [],
      },
    },
  ],
};

// <<< MODIFICATION: modelTools now includes googleSearch again for modelForChat >>>
const modelToolsWithSearch: Tool[] = [ getNBAGameOddsToolDeclaration, { googleSearch: {} } as Tool ]; 

async function callGetNbaOddsAPI(sportsbook: string = "fanduel", model: string = "xgboost", kelly_criterion: boolean = true): Promise<any> {
  const effectiveSportsbook = SUPPORTED_SPORTSBOOKS.includes(sportsbook.toLowerCase()) ? sportsbook.toLowerCase() : 'fanduel';
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const queryParams = new URLSearchParams({ sportsbook: effectiveSportsbook, model, kelly_criterion: String(kelly_criterion) });
    const apiUrl = `${siteUrl}/api/get-nba-odds?${queryParams.toString()}`;
    console.log(`GEMINI_SERVICE (callGetNbaOddsAPI): Fetching from ${apiUrl}`);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`GEMINI_SERVICE (callGetNbaOddsAPI): Error from /api/get-nba-odds. Status: ${response.status}. Body: ${errorBody}`);
      return { error: `Failed to fetch NBA odds for ${effectiveSportsbook}. Status: ${response.status}.`, details: errorBody.substring(0,150) };
    }
    const data = await response.json();
    console.log(`GEMINI_SERVICE (callGetNbaOddsAPI): Data received for ${effectiveSportsbook}:`, JSON.stringify(data, null, 2).substring(0, 200) + "...");
    if (!data.sportsbook) {
        data.sportsbook = effectiveSportsbook;
    }
    return data;
  } catch (error) {
    console.error(`GEMINI_SERVICE (callGetNbaOddsAPI): Network or parsing error for ${effectiveSportsbook}:`, error);
    return { error: error instanceof Error ? error.message : `Unknown error fetching odds for ${effectiveSportsbook}.` };
  }
}

const generationConfig = { temperature: 0.7, maxOutputTokens: 8192 };
const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// SYSTEM_INSTRUCTION_TEXT remains the same full paragraph version that emphasizes "devil's advocate" and JSON structure
const SYSTEM_INSTRUCTION_TEXT = `You are "Betting Buddy AI," an exceptionally knowledgeable and articulate NBA analyst and strategic consultant... 
// ... (Ensure this is the FULL paragraph-style system prompt from our previous successful iteration where formatPreloadedOddsWithAI worked well textually) ...
// Key instructions it must contain:
// - Your very first message... "Hello! How can I assist..."
// - Tool Usage: ${GET_ODDS_TOOL_NAME} for feed data, Google Search for broader/historical/live if feed lacks it. Cite Google Search.
// - Textual Response (Analytical & Devil's Advocate Recommendation): 1. Acknowledge source. 2. Identify angle. 3. Devil's advocate reasoning. 4. Risks/Conclusion. 5. Concise. 6. No raw data in text.
// - MANDATORY Structured JSON Output: With "uiGamePrediction" or "uiGamePredictions" wrapper.
// - UIGamePredictionFormat schema details.
// - Handling preloaded data (mentioning sportsbook, using fallback message if problematic).
// - Handling ${GET_ODDS_TOOL_NAME} tool errors gracefully.
If the ${GET_ODDS_TOOL_NAME} tool itself returns a technical error... inform the user more gracefully: "I couldn't retrieve the specific odds and prediction data from our live feed right now..."
`;

export class GeminiService {
  private modelForChat: GenerativeModel;
  private modelForPreloading: GenerativeModel;

  constructor() {
    this.modelForChat = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      generationConfig,
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_INSTRUCTION_TEXT }] }, // System instruction is back
      tools: modelToolsWithSearch, // <<< USING THE TOOLSET THAT INCLUDES GOOGLE SEARCH
    });

    this.modelForPreloading = genAI.getGenerativeModel({
      model: MODEL_NAME, 
      safetySettings,
      generationConfig,
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_INSTRUCTION_TEXT }] }
      // NO tools for preloading model
    });
  }

  public startChat(history: Content[] = []): ChatSession {
    // modelForChat now has systemInstruction in constructor, so no need to prepend to history here.
    let historyForSDK = [...history];
    // ... (Standard history validation logic from previous versions)
    if (historyForSDK.length > 0 && historyForSDK[0].role === 'model') {
        const firstUserMessageIndex = historyForSDK.findIndex(m => m.role === 'user');
        if (firstUserMessageIndex === -1) { historyForSDK = []; }
        else if (firstUserMessageIndex > 0) { historyForSDK = historyForSDK.slice(firstUserMessageIndex); }
    }
    const validatedHistory: Content[] = [];
    if (historyForSDK.length > 0) {
        if (historyForSDK[0].role !== 'user') { historyForSDK = []; }
        else {
            let expectedRole: 'user' | 'model' = 'user';
            for (const message of historyForSDK) {
                if (message.role === expectedRole) {
                    validatedHistory.push(message);
                    expectedRole = (expectedRole === 'user') ? 'model' : 'user';
                } else { console.warn(`GEMINI_SERVICE (startChat): History sequence broken. Expected ${expectedRole}, got ${message.role}. Truncating.`); break; }
            }
        }
    }
    console.log("GEMINI_SERVICE (startChat): Starting chat with history (snippet):", JSON.stringify(validatedHistory, null, 2).substring(0, 300) + "...");
    return this.modelForChat.startChat({ history: validatedHistory.length > 0 ? validatedHistory : undefined });
  }

  private parseAIResponse(responseText: string): { conversationalText: string; structuredData: any } {
    // ... (Same as the version with fallback parsing for missing wrappers)
    let structuredData: any = null;
    let conversationalText = responseText;
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/gm;
    let lastMatch: RegExpExecArray | null = null;
    let currentMatch: RegExpExecArray | null;
    while ((currentMatch = jsonBlockRegex.exec(responseText)) !== null) {
        lastMatch = currentMatch;
    }
    if (lastMatch && lastMatch[1]) {
      try {
        const parsedJson = JSON.parse(lastMatch[1]);
        if (parsedJson.uiGamePrediction || parsedJson.uiGamePredictions) {
          structuredData = parsedJson; 
          conversationalText = responseText.replace(jsonBlockRegex, "").trim();
          console.log("GEMINI_SERVICE (parseAIResponse): Successfully parsed structured JSON with wrapper.");
        } 
        else if (parsedJson.game_identifier && parsedJson.ai_prediction_details) {
           structuredData = { uiGamePrediction: parsedJson }; 
           conversationalText = responseText.replace(jsonBlockRegex, "").trim();
           console.warn("GEMINI_SERVICE (parseAIResponse): Parsed JSON without wrapper, but looks like a single game. Wrapping it in uiGamePrediction.");
        }
        else if (Array.isArray(parsedJson) && parsedJson.length > 0 && parsedJson[0].game_identifier && parsedJson[0].ai_prediction_details) {
           structuredData = { uiGamePredictions: parsedJson }; 
           conversationalText = responseText.replace(jsonBlockRegex, "").trim();
           console.warn("GEMINI_SERVICE (parseAIResponse): Parsed JSON array without wrapper, but looks like multiple games. Wrapping it in uiGamePredictions.");
        }
        else {
           console.warn("GEMINI_SERVICE (parseAIResponse): Parsed JSON block does not match expected wrapper or direct game structure. JSON was:", lastMatch[1].substring(0,300));
        }
      } catch (e) {
        console.warn("GEMINI_SERVICE (parseAIResponse): Failed to parse JSON block. Content:", lastMatch[1].substring(0,300), "Error:", e);
      }
    } else if (responseText.includes("{") && responseText.includes("}")) {
        console.warn("GEMINI_SERVICE (parseAIResponse): AI response did not use markdown for JSON block, but JSON-like content found.");
    }
    return { conversationalText, structuredData };
  }

  public async sendMessage(chatSession: ChatSession, messageText: string): Promise<{ text: string; groundingSources?: any[]; structuredData?: any }> {
    // Still using NON-STREAMING sendMessage for debugging tool call errors
    try {
      console.log(`GEMINI_SERVICE (sendMessage - NON-STREAMING DEBUG): User messageText: "${messageText.substring(0,100)}..."`);
      
      let result = await chatSession.sendMessage(messageText); 
      let response = result.response;
      const functionCalls = response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        console.log("GEMINI_SERVICE (sendMessage - NON-STREAMING DEBUG): Detected function call(s):", functionCalls.map(fc => fc.name));
        const functionResponseParts: Part[] = [];
        for (const call of functionCalls) {
            if (call.name === GET_ODDS_TOOL_NAME) {
                let args = call.args as GetOddsToolArgs;
                if (args.sportsbook && !SUPPORTED_SPORTSBOOKS.includes(args.sportsbook.toLowerCase())) {
                    args.sportsbook = 'fanduel';
                }
                const oddsAPIData = await callGetNbaOddsAPI(args.sportsbook, args.model, args.kelly_criterion);
                if (oddsAPIData.error) {
                    functionResponseParts.push({ functionResponse: { name: GET_ODDS_TOOL_NAME, response: { error: `Tool execution failed: ${oddsAPIData.error} - ${oddsAPIData.details || ''}` } } });
                } else {
                    if (!oddsAPIData.sportsbook && args.sportsbook) oddsAPIData.sportsbook = args.sportsbook;
                    else if (!oddsAPIData.sportsbook) oddsAPIData.sportsbook = args.sportsbook || 'fanduel';
                    functionResponseParts.push({ functionResponse: { name: GET_ODDS_TOOL_NAME, response: { content: oddsAPIData } } });
                }
            } else { // This could be where googleSearch function calls are handled if the model emits them
                console.warn(`GEMINI_SERVICE (sendMessage - NON-STREAMING DEBUG): Unhandled function call: ${call.name}. If this is 'googleSearchInternal', no explicit response is needed.`);
                // For googleSearch, often no explicit functionResponse is needed from our side if the model handles it internally after declaration.
                // If the SDK expects a dummy response for other unhandled tools:
                // functionResponseParts.push({ functionResponse: { name: call.name, response: { content: "Function call noted, no specific action taken by host." }} });
            }
        }
        // Only send function responses if there are any that require it (e.g., our custom tool)
        if (functionResponseParts.some(p => p.functionResponse?.name === GET_ODDS_TOOL_NAME)) {
            console.log("GEMINI_SERVICE (sendMessage - NON-STREAMING DEBUG): Sending function responses back to AI for GET_ODDS.");
            result = await chatSession.sendMessage(functionResponseParts); 
            response = result.response;
        } else if (functionResponseParts.length > 0) {
             console.log("GEMINI_SERVICE (sendMessage - NON-STREAMING DEBUG): Sending (potentially empty or non-critical) function responses back to AI.");
             result = await chatSession.sendMessage(functionResponseParts); // Send if other types of function calls were handled
             response = result.response;
        }
      }

      const rawResponseText = response.text();
      console.log("GEMINI_SERVICE (sendMessage - NON-STREAMING DEBUG): Raw response from AI:", rawResponseText);
      const { conversationalText, structuredData } = this.parseAIResponse(rawResponseText);
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      let searchSuggestionsRenderedContent: string | undefined;
      if (groundingMetadata?.searchEntryPoint?.renderedContent) {
        searchSuggestionsRenderedContent = groundingMetadata.searchEntryPoint.renderedContent;
      }
      return { text: conversationalText, groundingSources: searchSuggestionsRenderedContent ? [{ renderedContent: searchSuggestionsRenderedContent }] : undefined, structuredData };

    } catch (error) {
      console.error("GEMINI_SERVICE (sendMessage - NON-STREAMING DEBUG): ERROR in sendMessage:", error);
      return { text: "I've encountered an unexpected technical issue (debug: non-streaming). Please try your request again in a moment." };
    }
  }

  public async formatPreloadedOddsWithAI(
    oddsData: any,
    userQueryHint: string
  ): Promise<{ text: string; groundingSources?: any[]; structuredData?: any }> {
    // ... (This method remains the same as the last complete version, using this.modelForPreloading)
    console.log("GEMINI_SERVICE (formatPreloadedOddsWithAI): Received oddsData snippet:", JSON.stringify(oddsData, null, 2).substring(0, 300) + "...");
    if (!oddsData || typeof oddsData.sportsbook !== 'string' || !Array.isArray(oddsData.predictions)) {
        console.error("GEMINI_SERVICE (formatPreloadedOddsWithAI): Invalid oddsData structure. Expected { sportsbook: string, predictions: array }.", oddsData);
        return { text: `I seem to be having trouble with the initial game data provided for this session. To get you the freshest information, could you please ask specifically for 'tonight's odds' or for a particular game, perhaps specifying a sportsbook like ${SUPPORTED_SPORTSBOOKS[0]} or ${SUPPORTED_SPORTSBOOKS[1]}? That way, I can use my live tools.` };
    }
    if (oddsData.predictions.length === 0) {
        console.log("GEMINI_SERVICE (formatPreloadedOddsWithAI): Preloaded oddsData has an empty predictions array.");
         return { text: `The initial game data for today (from ${oddsData.sportsbook}) appears to be empty. Please ask for 'tonight's odds' to fetch live information, or specify a game you're interested in.` };
    }
    const promptForPreloading = `
      The user's query was: "${userQueryHint}".
      I have the following pre-loaded game data... 
      (Ensure this prompt is the full one from before, instructing the AI on the JSON wrapper and how to use the preloaded data)
      ...
      The JSON output MUST be an object with a SINGLE top-level key: either "uiGamePrediction" (if one game) or "uiGamePredictions" (if multiple games).
      ...
      \`\`\`json
      ${JSON.stringify(oddsData, null, 2)}
      \`\`\`
      ...
    `; // Ensure this prompt is complete
    try {
      const result = await this.modelForPreloading.generateContent(promptForPreloading); 
      const response = result.response;
      const rawResponseText = response.text();
      console.log("GEMINI_SERVICE (formatPreloadedOddsWithAI): Raw response from AI:", rawResponseText);
      const { conversationalText, structuredData } = this.parseAIResponse(rawResponseText);
      if (!structuredData && oddsData.predictions.length > 0 && !conversationalText.includes("having trouble with the initial game data")) {
          console.warn("GEMINI_SERVICE (formatPreloadedOddsWithAI): AI failed to produce structured data as expected or use prescribed error message. Falling back. Raw AI text:", rawResponseText);
          return { text: `I processed the preloaded data from ${oddsData.sportsbook} but had some trouble generating the full detailed view. You can ask for 'tonight's odds' to try fetching fresh data...` };
      }
      // ... (grounding metadata handling)
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      let searchSuggestionsRenderedContent: string | undefined;
      if (groundingMetadata?.searchEntryPoint?.renderedContent) {
        searchSuggestionsRenderedContent = groundingMetadata.searchEntryPoint.renderedContent;
      }
      return { text: conversationalText, structuredData, groundingSources: searchSuggestionsRenderedContent ? [{ renderedContent: searchSuggestionsRenderedContent }] : undefined };
    } catch (error) {
      console.error("GEMINI_SERVICE (formatPreloadedOddsWithAI): ERROR formatting preloaded odds:", error);
      return { text: "An unexpected technical difficulty occurred while preparing the initial game summary..." };
    }
  }
}

export const geminiService = new GeminiService();
