// generateTravelPlan.js
const { getExchangeRates } = require("../utils/currencyExchange");
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateTravelPlan({ destination, passport, start_date, end_date, budget }) {
  // Calculate trip duration
  const start = new Date(start_date);
  const end = new Date(end_date);
  const tripLength = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Fetch exchange rate JSON from your API
  const exchangeData = await getExchangeRates(); // Must return the same JSON you posted
  const rates = exchangeData.rates;

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
  1. "visa" must include complete, valid HTML with headings, paragraphs, and **only official government/embassy links and eVisa application links** (use target='_blank' for all links).  
   - Always include a **"Visa Application Online Form"** section with the official eVisa or embassy form link of the destination country.  
   - Example format: <a href='https://official-evisa-link.com' target='_blank'>Destination eVisa Application Form</a>.  
   - If the passport allows visa-free travel, include an official link confirming visa-free status.  
   - Do NOT include "www" unless required by the official site.  
   - Do NOT invent or guess URLs.
  3. For the "currency" field:
     - Identify the local currency based on the destination (e.g., Canada → CAD, India → INR, Japan → JPY, UAE → AED, UK → GBP, Australia → AUD, etc.).
     - Parse the provided Exchange Rate JSON (under 'rates') and extract the correct numeric rate for that currency code.
     - The value corresponds to "1 USD = X local currency".
     - Include at least 3 exchange tips for travelers (ATM, cards, mobile payments, and cash).
     - Always include this field even if the currency rate is 1.
  4. "mini" array must match the **trip length** with day-by-day details.
  5. All amounts are in USD.
  6. Output must be **valid JSON only**, with HTML properly escaped inside strings (no triple backticks).
  7. Do NOT wrap your answer in markdown or backticks. Return pure JSON.
  `;

  // --- USER MESSAGE ---
  const userMessage = `
  Destination: ${destination}
  Passport: ${passport}
  Start Date: ${start_date}
  End Date: ${end_date}
  Trip Length: ${tripLength} days
  Budget: $${budget}
  Exchange Rate Data (for all currencies):
  ${JSON.stringify(rates, null, 2)}
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
