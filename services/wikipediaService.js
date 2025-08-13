require('dotenv').config();
const axios = require('axios');
const logger = require('../helper/logger');
const isValidCityName = require('../utils/isValidCityName');

async function getCityDescription(cityName) {
    // Check if city name is valid before making the request
    if (!isValidCityName(cityName)) {
        logger.warn(`Skipping invalid city name: ${cityName}`);
        return { name: cityName, description: null };
    }

    const baseUrl = process.env.WIKIPEDIA_API_BASE_URL;

    try {
        logger.info(`Fetching Wikipedia description for city: ${cityName}`);

        const url = `${baseUrl}/page/summary/${encodeURIComponent(cityName)}`;
        logger.debug(`Wikipedia API URL: ${url}`);

        const response = await axios.get(url);

        if (response.data && response.data.extract) {
            const descriptionLength = response.data.extract.length;
            logger.info(`Successfully retrieved Wikipedia description for ${cityName} (${descriptionLength} characters)`);
            return { name: cityName, description: response.data.extract }; // Short description
        } else {
            logger.warn(`No description found in Wikipedia response for city: ${cityName}`);
            return { name: cityName, description: null };
        }
    } catch (error) {
        logger.error(`Error fetching Wikipedia description for ${cityName}: ${error.message}`);
        if (error.response?.status) {
            logger.error(`HTTP status: ${error.response.status}`);
        }
        if (error.response?.statusText) {
            logger.error(`HTTP status text: ${error.response.statusText}`);
        }
        return { name: cityName, description: null };
    }
}


module.exports = getCityDescription;
