require('dotenv').config();
const { City } = require('../models');
const logger = require('../helper/logger');

const checkIfCityExists = async (name) => {
    try {
        logger.debug(`Checking if city exists: ${name}`);
        const city = await City.findOne({ where: { city_name: name } });
        const exists = city ? true : false;
        logger.debug(`City ${name} exists: ${exists}`);
        return exists;
    } catch (error) {
        logger.error(`Error checking if city exists for ${name}: ${error.message}`);
        throw error;
    }
}

const createCity = async (city) => {
    try {
        logger.info(`Creating new city: ${city.city_name || city.name || 'Unknown'}`);
        const newCity = await City.create(city);
        logger.info(`Successfully created city: ${newCity.city_name || newCity.name || 'Unknown'} with ID: ${newCity.id}`);
        return newCity;
    } catch (error) {
        logger.error(`Error creating city ${city.city_name || city.name || 'Unknown'}: ${error.message}`);
        throw error;
    }
}

const updateByCityName = async (name, city) => {
    try {
        logger.info(`Updating city: ${name}`);
        const updatedCity = await City.update(city, { where: { city_name: name } });
        logger.info(`Successfully updated city: ${name}, rows affected: ${updatedCity[0]}`);
        return updatedCity;
    } catch (error) {
        logger.error(`Error updating city ${name}: ${error.message}`);
        throw error;
    }
}

const getCities = async () => {
    try {
        logger.info('Fetching all active cities ordered by pollution');
        const cities = await City.findAll({ where: { status: 'active' }, order: [['pollution', 'DESC']] });
        logger.info(`Successfully retrieved ${cities.length} active cities`);
        return cities;
    } catch (error) {
        logger.error(`Error fetching all cities: ${error.message}`);
        throw error;
    }
}

const getCitiesByCountryWithPagination = async (countryName, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        logger.info(`Fetching cities for country: ${countryName}, page: ${page}, limit: ${limit}`);

        const { count, rows } = await City.findAndCountAll({
            where: {
                country_name: countryName,
                status: 'active'
            },
            attributes: [['city_name', 'name'], 'pollution', 'description', ['country_name', 'country']],
            order: [['pollution', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        logger.info(`Successfully retrieved ${rows.length} cities for ${countryName} (page ${page}/${Math.ceil(count / limit)})`);

        return {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            cities: rows,
        };
    } catch (error) {
        logger.error(`Error fetching cities for country ${countryName}, page ${page}: ${error.message}`);
        throw error;
    }
}

const getCitiesWithoutDescription = async () => {
    try {
        const LIMIT = 200;
        logger.info(`Fetching cities without descriptions (limit: ${LIMIT})`);
        const cities = await City.findAll({ where: { description: null, status: 'inactive' }, limit: LIMIT, raw: true, order: [['updatedAt', 'ASC']] });
        logger.info(`Found ${cities.length} cities without descriptions`);
        return cities;
    } catch (error) {
        logger.error(`Error fetching cities without descriptions: ${error.message}`);
        throw error;
    }
}

module.exports = {
    checkIfCityExists, getCitiesWithoutDescription,
    createCity,
    updateByCityName,
    getCities,
    getCitiesByCountryWithPagination
}