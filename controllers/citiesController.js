const cityDbService = require('../services/cityDbService');
const { country_name_map } = require('../utils/country');

/**
 * Get cities by country code with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCitiesByCountry = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { page, limit } = req.query;

    // Validate and set default values for pagination
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;

    // Ensure page and limit are positive numbers
    if (pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({
        error: 'Page and limit must be positive numbers'
      });
    }

    const countryName = country_name_map[countryCode];

    if (!countryName) {
      return res.status(400).json({
        error: 'Invalid country code'
      });
    }

    const result = await cityDbService.getCitiesByCountryWithPagination(
      countryName,
      pageNumber,
      limitNumber
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCitiesByCountry
};
