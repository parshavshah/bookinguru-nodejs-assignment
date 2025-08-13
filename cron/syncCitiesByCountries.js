const pollutionApiService = require('../services/pollutionApi');
const cityDbService = require('../services/cityDbService');
const { country_name_map } = require('../utils/country');
const logger = require('../helper/logger');

const fetchAndStoreCities = async () => {
    const availableCountries = [
        "PL",
        "DE",
        "FR",
        "ES",
    ];

    logger.info('Starting to fetch and store cities for countries: ' + availableCountries.join(', '));
    
    const cities = [];
    let totalCitiesProcessed = 0;
    let totalCitiesCreated = 0;
    let totalCitiesUpdated = 0;

    for (const country of availableCountries) {
        logger.info('Processing country: ' + country + ' (' + country_name_map[country] + ')');

        // first api call to get all cities
        let page = 1;
        let limit = 50;
        
        try {
            const data = await pollutionApiService.getCitiesPollution(country, page, limit);
            cities.push(...data.results);
            logger.info('Retrieved ' + data.results.length + ' cities from page ' + page + ' for country ' + country);

            if (data && data.meta && data.meta.totalPages > 1) {
                logger.info('Country ' + country + ' has ' + data.meta.totalPages + ' total pages, fetching remaining pages...');
                
                for (let i = 2; i <= data.meta.totalPages; i++) {
                    const pageData = await pollutionApiService.getCitiesPollution(country, i, limit);
                    cities.push(...pageData.results);
                    logger.info('Retrieved ' + pageData.results.length + ' cities from page ' + i + ' for country ' + country);
                }
            }

            // store cities in db
            logger.info('Processing ' + cities.length + ' cities for country ' + country);
            
            for (const city of cities) {
                try {
                    const isCityExists = await cityDbService.checkIfCityExists(city.name);
                    if (!isCityExists) {
                        await cityDbService.createCity({
                            city_name: city.name,
                            country_name: country_name_map[country],
                            pollution: city.pollution,
                            status: 'inactive'
                        });
                        totalCitiesCreated++;
                        logger.debug('Created new city: ' + city.name + ' in country ' + country);
                    } else {
                        await cityDbService.updateByCityName(city.name, {
                            pollution: city.pollution
                        });
                        totalCitiesUpdated++;
                        logger.debug('Updated city: ' + city.name + ' in country ' + country);
                    }
                    totalCitiesProcessed++;
                } catch (cityError) {
                    logger.error('Error processing city ' + city.name + ' in country ' + country + ': ' + cityError.message, {
                        city: city.name,
                        country: country,
                        error: cityError.message
                    });
                }
            }
            
            logger.info('Completed processing country ' + country + ': ' + cities.length + ' cities processed, ' + totalCitiesCreated + ' created, ' + totalCitiesUpdated + ' updated');
                
        } catch (countryError) {
            logger.error('Error processing country ' + country + ': ' + countryError.message, {
                country: country,
                error: countryError.message,
                stack: countryError.stack
            });
        }
    }

    logger.info('Cities sync completed. Total processed: ' + totalCitiesProcessed + ', Created: ' + totalCitiesCreated + ', Updated: ' + totalCitiesUpdated);
}

const main = async () => {
    const startTime = new Date();
    logger.info('CRON JOB STARTED - syncCitiesByCountries at: ' + startTime.toISOString());

    try {
        await fetchAndStoreCities();
        const endTime = new Date();
        const duration = endTime - startTime;
        logger.info('CRON JOB COMPLETED - syncCitiesByCountries finished successfully in ' + duration + 'ms');
    } catch (error) {
        const endTime = new Date();
        const duration = endTime - startTime;
        logger.error('CRON JOB FAILED - syncCitiesByCountries failed after ' + duration + 'ms: ' + error.message, {
            error: error.message,
            stack: error.stack,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        });
        throw error;
    }
}

module.exports = {
    main
};


