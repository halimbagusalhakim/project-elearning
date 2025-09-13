/**
 * Response Helper Library
 * Provides standardized functions for API responses
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Data to send
 * @param {number} status - HTTP status code (default 200)
 */
const sendSuccess = (res, message = 'Success', data = null, status = 200) => {
  const response = { success: true };
  if (message) response.message = message;
  if (data !== null) response.data = data;
  return res.status(status).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} status - HTTP status code (default 500)
 */
const sendError = (res, error = 'Internal Server Error', status = 500) => {
  return res.status(status).json({ success: false, error });
};

module.exports = {
  sendSuccess,
  sendError
};
