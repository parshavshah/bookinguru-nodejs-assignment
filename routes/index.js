const express = require('express');
const router = express.Router();
const { citiesValidation } = require('../middleware/validation');
const { getCitiesByCountry } = require('../controllers/citiesController');
const { healthCheck } = require('../controllers/healthController');

router.get('/health', healthCheck);
router.get('/cities/:countryCode', citiesValidation, getCitiesByCountry);

module.exports = router;
