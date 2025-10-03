const express = require('express');
const { createTravelPlan } = require('../controllers/travelController');
const { validateTravelInput } = require('../validators/travelValidator');

const router = express.Router();

router.post('/', validateTravelInput, createTravelPlan);

module.exports = router;
