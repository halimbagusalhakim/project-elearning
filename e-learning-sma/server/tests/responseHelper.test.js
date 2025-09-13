/**
 * Simple test for responseHelper library
 * Run with: node tests/responseHelper.test.js
 */

const { sendSuccess, sendError } = require('../utils/responseHelper');

// Mock response object
const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.responseData = data;
    return this;
  }
};

console.log('Testing responseHelper library...\n');

// Test sendSuccess
console.log('1. Testing sendSuccess with message and data:');
const res1 = { ...mockRes };
sendSuccess(res1, 'Operation successful', { id: 1, name: 'Test' }, 200);
console.log('Status:', res1.statusCode);
console.log('Response:', JSON.stringify(res1.responseData, null, 2));

console.log('\n2. Testing sendSuccess with only message:');
const res2 = { ...mockRes };
sendSuccess(res2, 'Success');
console.log('Status:', res2.statusCode);
console.log('Response:', JSON.stringify(res2.responseData, null, 2));

console.log('\n3. Testing sendError with custom status:');
const res3 = { ...mockRes };
sendError(res3, 'Not found', 404);
console.log('Status:', res3.statusCode);
console.log('Response:', JSON.stringify(res3.responseData, null, 2));

console.log('\n4. Testing sendError with default status:');
const res4 = { ...mockRes };
sendError(res4, 'Server error');
console.log('Status:', res4.statusCode);
console.log('Response:', JSON.stringify(res4.responseData, null, 2));

console.log('\nAll tests completed!');
