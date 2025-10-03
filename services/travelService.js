const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateTravelPlan = async ({ destination, passport, start_date, end_date, budget }) => {
  const start = new Date(start_date);
  const end = new Date(end_date);
  const tripLength = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

const systemPrompt = `
You are a structured travel assistant.
Given: Destination, Passport, Start Date, End Date, Budget.

Output a JSON object ONLY with these fields:

{
  "visa": "HTML string with headings, paragraphs, links",
  "budget": { "totalUSD": number, "perDayUSD": number, "perDayJPY": number, "breakdown": { "accommodation": number, "food": number, "transportation": number, "activities": number,"stay":number, } },
  "local": { "apps": ["string"], "eSIM": ["string"] },
  "currency": { "localCurrency": "string", "exchangeTips": ["string"] },
  "safety": { "generalSafety": "string", "emergencyNumbers": { "police": number, "ambulanceFire": number }, "travelInsurance": "string" },
  "mini": ["string"] // dynamic number of days based on trip length
}

- The "mini" array must match the number of trip days.
- Do not include any extra text outside JSON.
`;

  const userMessage = `
Destination: ${destination}
Passport: ${passport}
Dates: ${start_date} to ${end_date} (Trip Length: ${tripLength} days)
Budget: $${budget}
`;

  const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  });
   return JSON.parse(response.choices[0].message.content);
};

module.exports = { generateTravelPlan };
