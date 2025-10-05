const express = require('express');
const travelController = require('../controllers/travelController');
const travelValidator = require('../validators/travelValidator');

const router = express.Router();

router.post('/', travelValidator.validateTravelInput, travelController.createTravelPlan);
router.post('/feedback', travelValidator.validateFeedbackInput, travelController.sendFeedbackForm);
router.post('/sendEmail',  travelController.sendTravelPlanEmail);

module.exports = router;
