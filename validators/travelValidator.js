const Joi = require('joi');

const travelSchema = Joi.object({
  destination: Joi.string().required(),
  passport: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  budget: Joi.number().required()
});

const validateTravelInput = (req, res, next) => {
  const { error } = travelSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validateTravelInput };
