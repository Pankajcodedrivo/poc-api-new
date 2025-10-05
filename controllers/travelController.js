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
      to: "bittus@scaleupsoftware.io",
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

    // Convert the TravelResult object to HTML
    const htmlContent = `
      <h2>Travel Planner Results</h2>
      <h3>Visa & Entry</h3>
      <p>${data.visa}</p>
      <h3>Budget</h3>
      <ul>
        <li>Accommodation: $${data.budget.breakdown.accommodation}</li>
        <li>Food: $${data.budget.breakdown.food}</li>
        <li>Transportation: $${data.budget.breakdown.transportation}</li>
        <li>Activities: $${data.budget.breakdown.activities}</li>
        <li>Stay: $${data.budget.breakdown.stay}</li>
      </ul>
      <p>Total / Day: $${data.budget.perDayUSD} USD (~${data.budget.perDayJPY} JPY)</p>
      <p>Total Trip: $${data.budget.totalUSD} USD</p>
      <h3>Local Tools & Connectivity</h3>
      <p>Apps: ${data.local.apps.join(", ")}</p>
      <p>eSIMs: ${data.local.eSIM.join(", ")}</p>
      <h3>Currency & Exchange Tips</h3>
      <p>Local Currency: ${data.currency.localCurrency}</p>
      <ul>
        ${data.currency.exchangeTips.map(tip => `<li>${tip}</li>`).join("")}
      </ul>
      <h3>Safety & Emergency</h3>
      <p>${data.safety.generalSafety}</p>
      <p>Emergency Numbers - Police: ${data.safety.emergencyNumbers.police}, Ambulance/Fire: ${data.safety.emergencyNumbers.ambulanceFire}</p>
      <p>Travel Insurance: ${data.safety.travelInsurance}</p>
      <h3>Mini Plan</h3>
      <ol>
        ${data.mini.map(day => `<li>${day}</li>`).join("")}
      </ol>
    `;

    await sendEmail({
      to: email,
      subject: "Your Travel Plan Results",
      text: `Here is your travel plan summary.`,
      html: htmlContent,
    });

    res.json({ success: true, message: "Travel plan emailed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createTravelPlan, sendFeedbackForm,sendTravelPlanEmail };
