# TODO: Create Custom Response Helper Library

## Tasks
- [x] Create server/utils/responseHelper.js with standardized response functions (sendSuccess, sendError)
- [x] Ensure the helper provides consistent API response formats across the application

## Notes
- This helper will standardize success and error responses in controllers.
- Functions: sendSuccess(res, message, data, status), sendError(res, error, status)
- Updated classController.js to use the helper for demonstration.
