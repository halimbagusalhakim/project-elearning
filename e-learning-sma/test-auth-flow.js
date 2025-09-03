// Test script to verify authentication and assignment loading flow
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAuthFlow() {
  console.log('=== Testing Authentication and Assignment Flow ===\n');

  try {
    // Step 1: Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'siswa1',
      password: 'password123'
    });

    console.log('Login successful!');
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    console.log('User:', loginResponse.data.user);

    const token = loginResponse.data.token;

    // Step 2: Test assignment endpoint with token
    console.log('\n2. Testing assignment endpoint...');
    const assignmentResponse = await axios.get(`${BASE_URL}/assignments/student`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Assignment endpoint successful!');
    console.log('Assignments:', assignmentResponse.data);

    // Step 3: Test without token (should fail)
    console.log('\n3. Testing without token (should fail)...');
    try {
      await axios.get(`${BASE_URL}/assignments/student`);
      console.log('ERROR: Request without token should have failed!');
    } catch (error) {
      console.log('Expected error without token:', error.response?.data?.error || error.message);
    }

    console.log('\n=== All tests passed! ===');

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('\nPossible issues:');
      console.log('- Server not running on port 5000');
      console.log('- Database not initialized');
      console.log('- Route not properly configured');
    }
  }
}

// Run the test
testAuthFlow();
