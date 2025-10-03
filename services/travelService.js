const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateTravelPlan = async ({ destination, passport, start_date, end_date, budget }) => {
  const start = new Date(start_date);
  const end = new Date(end_date);
  const tripLength = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  const systemPrompt = `
You are a structured travel assistant.
Given: Destination, Passport, Start Date, End Date, Budget.

Steps:
1. Calculate trip length in days.
2. Provide clear sections in this order:
   - Visa & Entry Requirements (with official government links)
   - Budget Breakdown (total & per day in local currency and USD)
   - Local Apps / eSIM suggestions
   - Currency info & exchange tips
   - Safety tips
   - Mini Itinerary (1–3 days with highlights)

Output must be formatted with headings and bullet points where useful.
`;

  const userMessage = `
Destination: ${destination}
Passport: ${passport}
Dates: ${start_date} to ${end_date} (Trip Length: ${tripLength} days)
Budget: $${budget}
`;

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ]
  });

  return response.choices[0].message.content;
};

module.exports = { generateTravelPlan };
