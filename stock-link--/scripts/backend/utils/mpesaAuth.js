const axios = require('axios');

// Make sure your .env variables are loaded (e.g., via dotenv.config() in index.js)
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate'; // Use sandbox for development

let cachedAccessToken = null;
let tokenExpiryTime = 0; // Timestamp when the token expires

const getAccessToken = async () => {
    // Check if token is still valid
    if (cachedAccessToken && Date.now() < tokenExpiryTime) {
        console.log('Using cached M-Pesa access token.');
        return cachedAccessToken;
    }

    // If no token or expired, generate a new one
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    try {
        const response = await axios.get(MPESA_AUTH_URL, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
            params: {
                grant_type: 'client_credentials',
            },
        });

        const { access_token, expires_in } = response.data;

        // Cache the new token and set its expiry time (a bit before actual expiry for safety)
        cachedAccessToken = access_token;
        tokenExpiryTime = Date.now() + (expires_in * 1000) - (60 * 1000); // Expires in 'expires_in' seconds, minus 1 minute buffer

        console.log('Successfully generated new M-Pesa access token.');
        return access_token;

    } catch (error) {
        console.error('Error generating M-Pesa access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get M-Pesa access token.');
    }
};

module.exports = { getAccessToken };

