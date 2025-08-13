/**
 * Health check endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const healthCheck = (req, res) => {
  res.json({ ok: 'ok' });
};

module.exports = {
  healthCheck
};
