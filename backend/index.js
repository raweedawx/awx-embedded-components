// require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });


const { generateCodeVerifier, generateCodeChallengeFromVerifier } = require('./authUtils');


const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());


let accessToken = null; // Store access token in memory
let tokenExpiry = null;  // Track expiry timestamp

/**
 * Function to fetch a fresh access token
 */
const fetchAccessToken = async () => {
  try {
      console.log('Fetching new access token...');
      const response = await axios.post(
          'https://api-demo.airwallex.com/api/v1/authentication/login',
          {},
          {
              headers: {
                  'x-client-id': process.env.API_CLIENT_ID,
                  'x-api-key': process.env.API_KEY
              }
          }
      );

      accessToken = response.data.token;
      tokenExpiry = new Date(response.data.expires_at).getTime(); // Convert expires_at to timestamp

      console.log('New Access Token:', accessToken);
      console.log('Token Expiry:', new Date(tokenExpiry).toISOString()); // Log expiry time for debugging
      return accessToken;
  } catch (error) {
      console.error('Error fetching access token:', error.response ? error.response.data : error.message);
      throw new Error('Failed to retrieve access token');
  }
};


/**
 * Middleware to ensure a valid access token before making requests
 */
const ensureAccessToken = async (req, res, next) => {
  try {
      if (!accessToken || Date.now() >= tokenExpiry - 60 * 1000) {  // Refresh 1 minute before expiry
          await fetchAccessToken();
      }
      req.accessToken = accessToken;
      next();
  } catch (error) {
      res.status(500).json({ message: 'Failed to authenticate', error: error.message });
  }
};


// Axios request interceptor
axios.interceptors.request.use(
  (config) => {
    console.log('[REQUEST]', JSON.stringify({
      method: config.method.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    }, null, 2));
    return config;
  },
  (error) => {
    console.error('[REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Axios response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log('[RESPONSE]', JSON.stringify({
      url: response.config.url,
      data: response.data,
      status: response.status,
    }, null, 2));
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[RESPONSE ERROR]', JSON.stringify({
        url: error.response.config.url,
        data: error.response.data,
        status: error.response.status,
      }, null, 2));
    } else {
      console.error('[ERROR MESSAGE]', error.message);
    }
    return Promise.reject(error);
  }
);

// API endpoint to create an account
app.post('/api/create-account', ensureAccessToken, async (req, res) => {
  const { email, countryCode, terms, dataUsage } = req.body;

  const accountPayload = {
      primary_contact: { email },
      account_details: {
          business_details: { registration_address: { country_code: countryCode } }
      },
      customer_agreements: {
          agreed_to_terms_and_conditions: terms,
          agreed_to_data_usage: dataUsage
      }
  };

  console.log('Request Payload:', JSON.stringify(accountPayload, null, 2));

  try {
      const response = await axios.post(
          'https://api-demo.airwallex.com/api/v1/accounts/create',
          accountPayload,
          {
              headers: {
                  Authorization: `Bearer ${req.accessToken}`,
                  'Content-Type': 'application/json',
                  'x-client-id': process.env.API_CLIENT_ID
              }
          }
      );

      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      res.json({ accountId: response.data.id });
  } catch (error) {
      if (error.response) {
          console.error('Error Response Data:', JSON.stringify(error.response.data, null, 2));
          res.status(500).json({ message: 'Failed to create account', error: error.response.data });
      } else {
          console.error('Error Message:', error.message);
          res.status(500).json({ message: 'Failed to create account', error: error.message });
      }
  }
});

// API endpoint to get authorization code
app.post('/api/get-auth-code', ensureAccessToken, async (req, res) => {
  const { accountId, component = 'kyc' } = req.body;

  console.log('Received request to get authorization code for accountId:', accountId);

  try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier);

      console.log('Generated codeVerifier:', codeVerifier);
      console.log('Generated codeChallenge:', codeChallenge);

      const scopeByComponent = {
          kyc: ['w:awx_action:onboarding'],
          kycRfi: ['r:awx_action:rfi_view', 'w:awx_action:rfi_edit'],
          beneficiary: ['w:awx_action:transfers_edit'],
          transfer: ['w:awx_action:transfers_edit'],
      };

      const scope = scopeByComponent[component] || scopeByComponent.kyc;

      const authPayload = {
          scope,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256'
      };

      console.log('Authorization Payload:', JSON.stringify(authPayload, null, 2));

      const response = await axios.post(
          'https://api-demo.airwallex.com/api/v1/authentication/authorize',
          authPayload,
          {
              headers: {
                  Authorization: `Bearer ${req.accessToken}`,
                  'Content-Type': 'application/json',
                  'x-client-id': process.env.API_CLIENT_ID,
                  'x-on-behalf-of': accountId
              }
          }
      );

      console.log('Received response from Airwallex:', JSON.stringify(response.data, null, 2));

      res.json({ authCode: response.data.authorization_code, codeVerifier });
  } catch (error) {
      if (error.response) {
          console.error('Error Response Data:', JSON.stringify(error.response.data, null, 2));
          res.status(500).json({ message: 'Failed to get authorization code', error: error.response.data });
      } else {
          console.error('Error Message:', error.message);
          res.status(500).json({ message: 'Failed to get authorization code', error: error.message });
      }
  }
});


// API endpoint to create a beneficiary
app.post('/api/create-beneficiary', ensureAccessToken, async (req, res) => {
  try {
      const beneficiaryPayload = req.body; // Frontend sends beneficiary data

      console.log('Received beneficiary creation request:', JSON.stringify(beneficiaryPayload, null, 2));

      // Make request to Airwallex
      const response = await axios.post(
          'https://api-demo.airwallex.com/api/v1/beneficiaries/create',
          beneficiaryPayload,
          {
              headers: {
                  Authorization: `Bearer ${req.accessToken}`, // Use stored token
                  'Content-Type': 'application/json',
                  'x-client-id': process.env.API_CLIENT_ID
              }
          }
      );

      console.log('Beneficiary created:', JSON.stringify(response.data, null, 2));

      res.json(response.data); // Return Airwallex response to frontend
  } catch (error) {
      if (error.response) {
          console.error('Error creating beneficiary:', JSON.stringify(error.response.data, null, 2));
          res.status(500).json({ message: 'Failed to create beneficiary', error: error.response.data });
      } else {
          console.error('Error:', error.message);
          res.status(500).json({ message: 'Failed to create beneficiary', error: error.message });
      }
  }
});

  
  

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
