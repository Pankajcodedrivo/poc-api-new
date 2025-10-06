const { generateTravelPlan } = require('../services/travelService');
const { sendEmail } = require('../utils/emailService');

const createTravelPlan = async (req, res) => {
  try {
    const { destination, passport, start_date, end_date, budget } = req.body;
    const plan = await generateTravelPlan({ destination, passport, start_date, end_date, budget });
    res.json({ success: true, data: plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Controller to handle feedback form submission
const sendFeedbackForm = async (req, res) => {
  try {
    const { message } = req.body

    // Optional: send feedback email
    await sendEmail({
      to: process.env.SENDGRID_FROM_EMAIL,
      subject: "New Feedback Received",
      text: message
    });

    res.json({ success: true, message: "Feedback received successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const sendTravelPlanEmail = async (req, res) => {
  try {
    const { email, data } = req.body;

    if (!email || !data) {
      return res.status(400).json({ success: false, message: "Email and data are required" });
    }

    // Generate local apps section dynamically
    const appSections = Object.entries(data.local.apps)
      .map(
        ([category, apps]) =>
          `<li><strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> ${apps.join(", ")}</li>`
      )
      .join("");

    // Build HTML email body
    const htmlContent = `
      <h2>Travel Planner Results</h2>

      <h3>Visa & Entry</h3>
      ${data.visa}

      <h3>Budget</h3>
      <ul>
        <li>Accommodation: $${data.budget.breakdown.accommodation} (~${(
      data.budget.breakdown.accommodation * data.currency.exchangeRate
    ).toFixed(2)} ${data.currency.localCurrency})</li>
        <li>Food: $${data.budget.breakdown.food} (~${(
      data.budget.breakdown.food * data.currency.exchangeRate
    ).toFixed(2)} ${data.currency.localCurrency})</li>
        <li>Transportation: $${data.budget.breakdown.transportation} (~${(
      data.budget.breakdown.transportation * data.currency.exchangeRate
    ).toFixed(2)} ${data.currency.localCurrency})</li>
        <li>Activities: $${data.budget.breakdown.activities} (~${(
      data.budget.breakdown.activities * data.currency.exchangeRate
    ).toFixed(2)} ${data.currency.localCurrency})</li>
        <li>Stay: $${data.budget.breakdown.stay} (~${(
      data.budget.breakdown.stay * data.currency.exchangeRate
    ).toFixed(2)} ${data.currency.localCurrency})</li>
      </ul>
      <p><strong>Total / Day:</strong> $${data.budget.perDayUSD} (~${(
      data.budget.perDayUSD * data.currency.exchangeRate
    ).toFixed(2)} ${data.currency.localCurrency})</p>
      <p><strong>Total Trip:</strong> $${data.budget.totalUSD} (~${(
      data.budget.totalUSD * data.currency.exchangeRate
    ).toFixed(2)} ${data.currency.localCurrency})</p>

      <h3>Local Tools & Connectivity</h3>
      <ul>
        ${appSections}
      </ul>
      <p><strong>eSIMs:</strong> ${data.local.eSIM.join(", ")}</p>

      <h3>Currency & Exchange Tips</h3>
      <p><strong>Local Currency:</strong> ${data.currency.localCurrency}</p>
      <p><strong>Exchange Rate (USD → ${data.currency.localCurrency}):</strong> ${data.currency.exchangeRate}</p>
      <ul>
        ${data.currency.exchangeTips.map(tip => `<li>${tip}</li>`).join("")}
      </ul>

      <h3>Safety & Emergency</h3>
      <p>${data.safety.generalSafety}</p>
      <p><strong>Emergency Numbers:</strong> Police - ${data.safety.emergencyNumbers.police}, 
      Ambulance/Fire - ${data.safety.emergencyNumbers.ambulanceFire}</p>
      <p><strong>Travel Insurance:</strong> ${data.safety.travelInsurance}</p>

      <h3>Mini Plan</h3>
      <ol>
        ${data.mini.map(day => `<li>${day}</li>`).join("")}
      </ol>
    `;

    await sendEmail({
      to: email,
      subject: "Your Travel Plan Results",
      text: "Here is your travel plan summary.",
      html: htmlContent,
    });

    res.json({ success: true, message: "Travel plan emailed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = { createTravelPlan, sendFeedbackForm,sendTravelPlanEmail };
