const { generateTravelPlan } = require('../services/travelService');

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

module.exports = { createTravelPlan };
