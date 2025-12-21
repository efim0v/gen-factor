// Netlify Function to proxy API requests
// This solves the mixed content (HTTPS -> HTTP) problem

const API_BASE = 'http://92.50.154.150:45501/blup/api';
const API_USERNAME = 'blup_user';
const API_PASSWORD = '1AMoVtyg';

exports.handler = async (event, context) => {
  // Only allow GET and POST methods
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get the path from the query string
  const path = event.queryStringParameters?.path || '';
  const apiUrl = `${API_BASE}${path}`;

  // Create Basic Auth header
  const auth = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString('base64');

  try {
    // Make request to actual API
    const response = await fetch(apiUrl, {
      method: event.httpMethod,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...(event.body ? { 'Content-Length': Buffer.byteLength(event.body) } : {})
      },
      ...(event.body ? { body: event.body } : {})
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('API proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to fetch from API',
        message: error.message
      })
    };
  }
};
