// generateTravelPlan.js
const { getExchangeRates } = require("../utils/currencyExchange");
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateTravelPlan({ destination, passport, start_date, end_date, budget }) {
  const start = new Date(start_date);
  const end = new Date(end_date);
  const tripLength = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Get live exchange rates (USD → others)
  const exchangeRates = await getExchangeRates("USD");
  
  const systemPrompt = `
You are a structured travel assistant.
Given: Destination, Passport, Start Date, End Date, Budget, and Exchange Rates.

Return ONLY a JSON object matching:

{
  "visa": "HTML string with headings, paragraphs, and official links only (use target='_blank' for all links)",
  "budget": {
    "totalUSD": number,
    "totalLocal": number,
    "perDayUSD": number,
    "perDayLocal": number,
    "breakdown": {
      "accommodationUSD": number,
      "accommodationLocal": number,
      "foodUSD": number,
      "foodLocal": number,
      "transportationUSD": number,
      "transportationLocal": number,
      "activitiesUSD": number,
      "activitiesLocal": number,
      "stayUSD": number,
      "stayLocal": number
    }
  },
  "local": { "apps": ["string"], "eSIM": ["string"] },
  "currency": { "localCurrency": "string", "exchangeTips": ["string"] },
  "safety": { "generalSafety": "string", "emergencyNumbers": { "police": number, "ambulanceFire": number }, "travelInsurance": "string" },
  "mini": ["string"]
}

Rules:
- "mini" array must match trip length.
- Convert all USD amounts → local currency using provided exchange rates.
- For "visa", include official embassy links with target="_blank".
- "local.apps" and "local.eSIM" must be country-specific.
- Output JSON only, no extra text.
`;

  const userMessage = `
Destination: ${destination}
Passport: ${passport}
Dates: ${start_date} to ${end_date} (${tripLength} days)
Budget: $${budget}
Live Exchange Rates (USD base): ${JSON.stringify(exchangeRates)}
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
