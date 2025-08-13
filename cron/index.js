const cron = require('node-cron');
const logger = require('../helper/logger');
const { main: syncCitiesByCountries } = require('./syncCitiesByCountries');
const { main: syncCitiesDescription } = require('./syncCitiesDescription');

/**
 * Initialize all cron jobs
 */
function initializeCronJobs() {
    logger.info('Initializing cron jobs...');

    // Cron job that runs every 1 minute and prints "hello world"
    cron.schedule('*/1 * * * *', async () => {
        logger.info('Hello world - Cron job executed at: ' + new Date().toISOString());
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    // Cron job that runs every 45 minutes to sync cities by countries
    cron.schedule('*/45 * * * *', async () => {
        try {
            logger.info('Starting syncCitiesByCountries cron job at: ' + new Date().toISOString());
            await syncCitiesByCountries();
            logger.info('syncCitiesByCountries cron job completed successfully');
        } catch (error) {
            logger.error('Error in syncCitiesByCountries cron job: ' + error.message, { 
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    // Cron job that runs every 1 minute to sync city descriptions
    cron.schedule('*/1 * * * *', async () => {
        try {
            logger.info('Starting syncCitiesDescription cron job at: ' + new Date().toISOString());
            await syncCitiesDescription();
            logger.info('syncCitiesDescription cron job completed successfully');
        } catch (error) {
            logger.error('Error in syncCitiesDescription cron job: ' + error.message, { 
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    logger.info('Cron jobs initialized successfully');
}

module.exports = {
    initializeCronJobs
}; 