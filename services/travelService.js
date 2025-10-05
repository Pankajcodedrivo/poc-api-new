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
    "local": { "apps": ["string"], "eSIM": ["string"] },
    "currency": { "localCurrency": "string", "exchangeRate": number, "exchangeTips": ["string"] },
    "safety": { "generalSafety": "string", "emergencyNumbers": { "police": number, "ambulanceFire": number }, "travelInsurance": "string" },
    "mini": ["string"]
  }

  Rules:
  - "mini" array must match trip length.
  - All amounts are in USD only.
  - "local.apps" and "local.eSIM" must be country-specific.
  - Include the local currency and live exchange rate as provided.
  - For "visa", include official embassy links with target="_blank".
  - Output JSON only, no extra text.
  `;
    const userMessage = `
  Destination: ${destination}
  Passport: ${passport}
  Dates: ${start_date} to ${end_date} (${tripLength} days)
  Budget: $${budget}
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
