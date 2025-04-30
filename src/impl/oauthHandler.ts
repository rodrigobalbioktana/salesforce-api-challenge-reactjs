import { CLIENT_KEY, CLIENT_SECRET as C_SECRET, LOCALHOST_URL } from "../utils/constants";

// function oauthLogin(baseUrl : String) : any{
//     const oauthUrl = baseUrl + OAUTH_LOGIN_ENDPOINT.replace('{1}', CLIENT_KEY).replace('{2}', LOCALHOST_URL);
//     window.location.href = oauthUrl;
// }

import axios from 'axios';
import {useEffect} from 'react';

// Salesforce OAuth 2.0 Credentials
const CLIENT_ID = CLIENT_KEY; // From Salesforce connected app
const CLIENT_SECRET = C_SECRET; // From Salesforce connected app
const REDIRECT_URI = LOCALHOST_URL; // This is where Salesforce will redirect after authentication
const AUTHORIZATION_URL = 'https://orgfarm-343e380a70-dev-ed.develop.my.salesforce.com/services/oauth2/authorize';
const TOKEN_URL = 'https://orgfarm-343e380a70-dev-ed.develop.my.salesforce.com/services/oauth2/token';

// Function to generate the Salesforce OAuth 2.0 URL
const generateAuthUrl = (): string => {
  const authUrl = `${AUTHORIZATION_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
  return authUrl;
};


// Function to exchange authorization code for access token
const getAccessToken = async (code: string) => {
  // useEffect(() => {
  //   fetch('/login')
  //     .then(res => res.json())
  //     .then(data => console.log(data))
  //     .catch(err => console.error(err));
  // }, []);
  // try {
  //   const response = await axios.post('https://orgfarm-343e380a70-dev-ed.develop.my.salesforce.com/services/oauth2/authorize', null, {
  //     params: {
  //       response_type: 'code',
  //       client_id: '3MVG9rZjd7MXFdLhBu37ETrj31crxrFHjQ8pSUxpQKybM9JgtT954ekL0Jgze2oqMbIhM.GCX4YXN22EMMqza',
  //       client_secret: '896DB73DE74D776F39EE978515017EC3AF2C3E07D2D1B607A548D0EEE00A9780',
  //       redirect_uri: 'http://localhost:5000'
  //     },
  //   });

  //   console.log('response', response);

  //   // Retrieve the access token from the response
  //   const { access_token } = response.data;
  //   return access_token;
  // } catch (error) {
  //   console.error('Error during OAuth token exchange', error);
  //   return null;
  // }
};

// Function to make a request to Salesforce using the access token
const makeSalesforceRequest = async (accessToken: string) => {
  try {
    const response = await axios.get('https://yourInstance.salesforce.com/services/data/v53.0/sobjects/Account/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('Salesforce Response:', response.data);
  } catch (error) {
    console.error('Error making Salesforce API request', error);
  }
};

// Example: Usage
const startOAuthFlow = async () => {
  console.log('Go to this URL to authenticate:', generateAuthUrl());
  
  // After the user authenticates and gets redirected to your `redirectUri`,
  // they will pass an authorization code to your redirect URI.
  // For example, you can extract the authorization code like this:
  const code = 'AUTHORIZATION_CODE_FROM_REDIRECT'; 
  getAccessToken(code);// You need to retrieve this from the query parameters
  
  // const accessToken = await getAccessToken(code);
  // if (accessToken) {
  //   await makeSalesforceRequest(accessToken);
  // }
};

// Start the OAuth process (You can call this function after getting the code from the redirect URL)


export { startOAuthFlow };

