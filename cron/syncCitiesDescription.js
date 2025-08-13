const cityDbService = require('../services/cityDbService');
const getCityDescription = require('../services/wikipediaService');
const logger = require('../helper/logger');

const fetchCityDescription = async () => {
    try {
        const cities = await cityDbService.getCitiesWithoutDescription();
        logger.info('Found ' + cities.length + ' cities without descriptions to process');

        if (cities.length === 0) {
            logger.info('No cities found without descriptions. Skipping sync.');
            return true;
        }

        // make a chunk of 5 cities
        const chunkSize = 5;
        let totalChunks = Math.ceil(cities.length / chunkSize);
        let processedCities = 0;
        let successfulUpdates = 0;
        let failedUpdates = 0;

        logger.info('Processing cities in ' + totalChunks + ' chunks of size ' + chunkSize);

        for (let i = 0; i < cities.length; i += chunkSize) {
            const chunk = cities.slice(i, i + chunkSize);
            const chunkNumber = Math.floor(i / chunkSize) + 1;

            logger.info('Processing chunk ' + chunkNumber + '/' + totalChunks + ' with ' + chunk.length + ' cities');

            try {
                // fetch city description from wikipedia for all cities in async mode
                const cityDescriptions = await Promise.all(
                    chunk.map(city => getCityDescription(city.city_name))
                );

                logger.debug('Retrieved descriptions for chunk ' + chunkNumber + ': ' + cityDescriptions.filter(desc => desc.description).length + ' descriptions found');

                // add city description to filtered cities
                chunk.forEach(city => {
                    city.description = cityDescriptions.find(description => description.name === city.city_name)?.description;
                });

                // store city description in db
                for (const city of chunk) {
                    try {
                        if (city.description) {
                            await cityDbService.updateByCityName(city.city_name, {
                                city_name: city.city_name.trim(),
                                description: city.description,
                                status: 'active'
                            });
                            successfulUpdates++;
                            logger.debug('Successfully updated city: ' + city.city_name + ' with description');
                        } else {
                            await cityDbService.updateByCityName(city.city_name, {
                                city_name: city.city_name.trim(),
                                status: 'invalid'
                            }); 
                            logger.warn('No description found for city: ' + city.city_name);
                        }
                        processedCities++;
                    } catch (updateError) {
                        failedUpdates++;
                        logger.error('Failed to update city ' + city.city_name + ': ' + updateError.message, {
                            city: city.city_name,
                            error: updateError.message
                        });
                    }
                }

                logger.info('Completed chunk ' + chunkNumber + '/' + totalChunks + '. Processed: ' + processedCities + ', Success: ' + successfulUpdates + ', Failed: ' + failedUpdates);

            } catch (chunkError) {
                logger.error('Error processing chunk ' + chunkNumber + '/' + totalChunks + ': ' + chunkError.message, {
                    chunkNumber,
                    totalChunks,
                    error: chunkError.message,
                    stack: chunkError.stack
                });
            }

            // wait for 2 second between chunks to avoid rate limiting
            if (i + chunkSize < cities.length) {
                logger.debug('Waiting 2 seconds before processing next chunk...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        logger.info('City descriptions sync completed. Total processed: ' + processedCities + ', Success: ' + successfulUpdates + ', Failed: ' + failedUpdates);

        return true;
    } catch (error) {
        logger.error('Error in fetchCityDescription: ' + error.message, {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

const main = async () => {
    const startTime = new Date();
    logger.info('CRON JOB STARTED - syncCitiesDescription at: ' + startTime.toISOString());

    try {
        await fetchCityDescription();
        const endTime = new Date();
        const duration = endTime - startTime;
        logger.info('CRON JOB COMPLETED - syncCitiesDescription finished successfully in ' + duration + 'ms');
    } catch (error) {
        const endTime = new Date();
        const duration = endTime - startTime;
        logger.error('CRON JOB FAILED - syncCitiesDescription failed after ' + duration + 'ms: ' + error.message, {
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


