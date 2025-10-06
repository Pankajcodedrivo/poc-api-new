// generateTravelPlan.js
const { getExchangeRates } = require("../utils/currencyExchange");
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateTravelPlan({ destination, passport, start_date, end_date, budget }) {
  // Calculate trip duration
  const start = new Date(start_date);
  const end = new Date(end_date);
  const tripLength = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Fetch live exchange rate JSON (your function must return full rates object)
  const exchangeRate = await getExchangeRates();
  console.log(exchangeRate);
  // --- SYSTEM PROMPT ---
  const systemPrompt = `
  You are a structured travel assistant. 

  Given: Destination, Passport, Start Date, End Date, Budget, and Exchange Rate JSON (all currencies), return ONLY a JSON object matching:

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
    "currency": {
      "localCurrency": "string",
      "exchangeRate": number,
      "exchangeTips": ["string"]
    },
    "safety": {
      "generalSafety": "string",
      "emergencyNumbers": {
        "police": number,
        "ambulanceFire": number
      },
      "travelInsurance": "string"
    },
    "mini": ["string"]
  }

  Rules:
  1. "visa" must include complete, valid HTML with headings, paragraphs, and **only official government/embassy links and eVisa application links** (use target='_blank'). Do NOT invent URLs.
  2. "local.apps" must include **at least 5–6 apps per category**, mixing local (country-specific) and global/universal apps.
  3. For the "currency" field:
     - Automatically determine the local currency based on the destination.
     - Extract the exact exchange rate from the provided Exchange Rate JSON.
     - Include exchange tips for travelers.
  4. "mini" array must match the **trip length** with day-by-day details.
  5. All amounts are in **USD**.
  6. Output must be **valid JSON only**, with HTML properly escaped inside strings.
  `;

  // --- USER MESSAGE ---
  const userMessage = `
  Destination: ${destination}
  Passport: ${passport}
  Start Date: ${start_date}
  End Date: ${end_date}
  Trip Length: ${tripLength} days
  Budget: $${budget}
  Exchange Rates JSON: ${JSON.stringify(exchangeRate.rate)}
  `;

  // --- CALL OPENAI ---
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    temperature: 0.7
  });

  const content = response.choices?.[0]?.message?.content?.trim();

  // --- PARSE OUTPUT ---
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error("❌ Failed to parse JSON:", err.message);
    console.log("Raw model output:", content);
    throw new Error("Model did not return valid JSON.");
  }
}

module.exports = { generateTravelPlan };
