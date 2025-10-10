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

    // Combine apps across all destinations
    const combinedApps = {};
    data.local.forEach(localItem => {
      Object.entries(localItem.apps).forEach(([category, apps]) => {
        if (!combinedApps[category]) combinedApps[category] = new Set();
        apps.forEach(app => combinedApps[category].add(app));
      });
    });

    const appSections = Object.entries(combinedApps)
      .map(
        ([category, appsSet]) =>
          `<li><strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> ${Array.from(
            appsSet
          ).join(", ")}</li>`
      )
      .join("");

    const combinedESIMs = Array.from(new Set(data.local.flatMap(localItem => localItem.eSIM)));

    // Build HTML email body
    const htmlContent = `
      <h2>Travel Planner Results</h2>

      <h3>Visa & Entry</h3>
      ${data.visa}

      <h3>Budget</h3>
      <ul>
        <li>Accommodation: $${data.budget.breakdown.accommodation}</li>
        <li>Food: $${data.budget.breakdown.food}</li>
        <li>Transportation: $${data.budget.breakdown.transportation}</li>
        <li>Activities: $${data.budget.breakdown.activities}</li>
        <li>Miscellaneous: $${data.budget.breakdown.miscellaneous}</li>
      </ul>
      <p><strong>Total / Day:</strong> $${data.budget.perDayUSD}</p>
      <p><strong>Total Trip:</strong> $${data.budget.totalUSD}</p>

      <h3>Local Tools & Connectivity</h3>
      <ul>
        ${appSections}
      </ul>
      <p><strong>eSIMs:</strong> ${combinedESIMs.join(", ")}</p>

      <h3>Currencies & Exchange Tips</h3>
      ${data.currencies
        .map(
          (c, idx) => `
        <div style="margin-bottom:10px;">
          <p><strong>${c.destination}:</strong> ${c.localCurrency} (1 USD = ${c.exchangeRate} ${c.localCurrency})</p>
          <ul>
            ${c.exchangeTips.map(tip => `<li>${tip}</li>`).join("")}
          </ul>
        </div>
      `
        )
        .join("<hr style='margin-bottom:10px;'>")}

      <h3>Safety & Emergency</h3>
      ${data.safety
        .map(
          (s, idx) => `
        <div style="margin-bottom:10px;">
          <p><strong>${s.destination}:</strong> ${s.generalSafety}</p>
          <p>Emergency — Police: ${s.emergencyNumbers.police}, Ambulance/Fire: ${s.emergencyNumbers.ambulanceFire}</p>
          <div><strong>Travel Insurance</strong>: ${s.travelInsurance}</div>
        </div>
      `
        )
        .join("<hr style='margin-bottom:10px;'>")}

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
