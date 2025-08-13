require('dotenv').config();
const axios = require('axios');
const logger = require('../helper/logger');

class PollutionApiService {
  constructor() {
    this.baseUrl = process.env.POLLUTION_API_BASE_URL;
    this.username = process.env.POLLUTION_API_USERNAME;
    this.password = process.env.POLLUTION_API_PASSWORD;
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.cache = new Map();
    this.cacheTimeout = parseInt(process.env.POLLUTION_API_CACHE_TIMEOUT); // 1 minute in milliseconds

    logger.info(`PollutionApiService initialized with base URL: ${this.baseUrl}`);
  }

  // Login to get initial tokens
  async login(username = null, password = null) {
    const loginUsername = username || this.username;
    const loginPassword = password || this.password;

    try {
      logger.info(`Attempting login for user: ${loginUsername}`);

      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        username: loginUsername,
        password: loginPassword
      });

      this.token = response.data.token;
      this.refreshToken = response.data.refreshToken;
      this.tokenExpiry = Date.now() + (response.data.expiresIn * 1000);

      logger.info(`Login successful for user: ${loginUsername}, token expires in ${response.data.expiresIn} seconds`);
      return true;
    } catch (error) {
      logger.error(`Login failed for user: ${loginUsername}, error: ${error.message}`);
      if (error.response?.status) {
        logger.error(`HTTP status: ${error.response.status}`);
      }
      throw new Error('Authentication failed');
    }
  }

  // Refresh token when expired
  async refreshAuthToken() {
    if (!this.refreshToken) {
      logger.warn('No refresh token available for token refresh');
      throw new Error('No refresh token available');
    }

    try {
      logger.info('Attempting to refresh authentication token');

      const response = await axios.post(`${this.baseUrl}/auth/refresh`, {
        refreshToken: this.refreshToken
      });

      this.token = response.data.token;
      this.tokenExpiry = Date.now() + (response.data.expiresIn * 1000);

      logger.info(`Token refreshed successfully, expires in ${response.data.expiresIn} seconds`);
      return true;
    } catch (error) {
      logger.error(`Token refresh failed: ${error.message}`);
      if (error.response?.status) {
        logger.error(`HTTP status: ${error.response.status}`);
      }
      // Clear tokens and force re-login
      this.token = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
      logger.warn('Cleared invalid tokens, will require re-login');
      throw new Error('Token refresh failed');
    }
  }

  // Check if token is expired or about to expire (within 10 seconds)
  isTokenExpired() {
    const isExpired = !this.token || !this.tokenExpiry || (Date.now() + 10000) >= this.tokenExpiry;

    if (isExpired && this.tokenExpiry) {
      const timeUntilExpiry = this.tokenExpiry - Date.now();
      logger.debug(`Token expired or expiring soon. Time until expiry: ${timeUntilExpiry}ms`);
    }

    return isExpired;
  }

  // Get pollution data for cities with caching
  async getCitiesPollution(country = 'PL', page = 1, limit = 10) {
    const cacheKey = `pollution_${country}_${page}_${limit}`;

    logger.info(`Requesting pollution data for country: ${country}, page: ${page}, limit: ${limit}`);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      const cacheAge = Date.now() - cachedData.timestamp;

      if (cacheAge < this.cacheTimeout) {
        logger.info(`Returning cached data (age: ${cacheAge}ms, timeout: ${this.cacheTimeout}ms)`);
        return cachedData.data;
      } else {
        // Remove expired cache entry
        this.cache.delete(cacheKey);
        logger.debug(`Removed expired cache entry for key: ${cacheKey}`);
      }
    }

    // Ensure we have a valid token
    if (this.isTokenExpired()) {
      logger.info('Token expired, attempting to refresh or login');
      if (this.refreshToken) {
        await this.refreshAuthToken();
      } else {
        await this.login();
      }
    }

    try {
      const response = await axios.get(`${this.baseUrl}/pollution`, {
        params: { country, page, limit },
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'accept': 'application/json'
        }
      });

      logger.info(`Pollution data retrieved successfully for ${country}, page ${page}`);

      const data = response.data;
      const resultCount = data.results ? data.results.length : 0;

      logger.info(`Retrieved ${resultCount} pollution records for ${country}, page ${page}`);

      // Cache the response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      logger.debug(`Cached pollution data for key: ${cacheKey}`);

      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        logger.warn(`Received 401 Unauthorized for ${country}, page ${page}, attempting token refresh and retry`);
        // Token might be invalid, try to refresh
        try {
          await this.refreshAuthToken();
          // Retry the request with new token
          const retryResponse = await axios.get(`${this.baseUrl}/pollution`, {
            params: { country, page, limit },
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'accept': 'application/json'
            }
          });

          const retryData = retryResponse.data;
          const retryResultCount = retryData.results ? retryData.results.length : 0;

          // Cache the retry response
          this.cache.set(cacheKey, {
            data: retryData,
            timestamp: Date.now()
          });

          logger.info(`Pollution data retrieved successfully on retry for ${country}, page ${page} (${retryResultCount} records)`);
          return retryData;
        } catch (retryError) {
          logger.error(`Retry failed for ${country}, page ${page}: ${retryError.message}`);
          if (retryError.response?.status) {
            logger.error(`Retry HTTP status: ${retryError.response.status}`);
          }
          throw new Error('Failed to retrieve pollution data after token refresh');
        }
      }

      logger.error(`Failed to retrieve pollution data for ${country}, page ${page}: ${error.message}`);
      if (error.response?.status) {
        logger.error(`HTTP status: ${error.response.status}`);
      }
      if (error.response?.data) {
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }

      return {
        results: []
      }
    }
  }

}

// Create and export a singleton instance
const pollutionApiService = new PollutionApiService();

module.exports = pollutionApiService;

