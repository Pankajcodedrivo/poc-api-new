// generateTravelPlan.js
const { getExchangeRates } = require("../utils/currencyExchange");
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateTravelPlan({ destination, passport, start_date, end_date, budget }) {
  const start = new Date(start_date);
  const end = new Date(end_date);
  const tripLength = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const systemPrompt = `
You are a structured travel assistant.
Given: Destination, Passport, Start Date, End Date, Budget, and Exchange Rate.

Return ONLY a JSON object matching:

{
  "visa": "HTML string with headings, paragraphs, and official links only (use target='_blank' for all links)",
  "budget": {
    "totalUSD": number,
    "perDayUSD": number,
    "breakdown": {
      "accommodation": number,
      "food": number,
      "transportation": number,
      "activities": number,
      "stay": number
    }
  },
  "local": {
    "apps": {
      "transportation": ["string"],
      "lodging": ["string"],
      "communication": ["string"],
      "budgetTravel": ["string"],
      "navigation": ["string"],
      "utilities": ["string"]
    },
    "eSIM": ["string"]
  },
  "currency": { "localCurrency": "string", "exchangeRate": number, "exchangeTips": ["string"] },
  "safety": { "generalSafety": "string", "emergencyNumbers": { "police": number, "ambulanceFire": number }, "travelInsurance": "string" },
  "mini": ["string"]
}

Rules:
- "mini" array must match trip length.
- All amounts are in USD only.
- "local.apps" must include **both local (country-specific)** and **universal (global)** apps in each category:
  - transportation: local ride-sharing or public transport apps (e.g., Grab, Bolt, Joyride) + universal (e.g., Uber)
  - lodging: local accommodation apps (e.g., Agoda) + universal (e.g., Airbnb, Booking.com)
  - communication: local messaging or SIM apps (e.g., LINE, WeChat) + universal (e.g., WhatsApp, Google Translate)
  - budgetTravel: local sharing or backpacking communities + universal (e.g., Couchsurfing, BlaBlaCar)
  - navigation: local transit or map tools + universal (e.g., Google Maps, Citymapper)
  - utilities: local financial or weather apps + universal (e.g., XE Currency, AccuWeather)
- "eSIM" should include top eSIM providers available in the destination country.
- For "visa", include both official visa application link and embassy info.
- Output must be valid JSON only — no extra text.
`;


  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    temperature: 0.7
  });

  const content = response.choices[0]?.message?.content;

  try {
    return JSON.parse(content);
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err.message);
    console.log("Raw output:", content);
    throw new Error("Model did not return valid JSON.");
  }
}

module.exports = { generateTravelPlan };
