const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, 'private.key'); // Update if your key has a different name

const clientId = 'YOUR_INTEGRATION_KEY';
const userId = 'YOUR_USER_ID_GUID';
const authServer = 'account-d.docusign.com'; // Demo environment
const scopes = ['signature', 'impersonation'];

const getAccessToken = async () => {
  const apiClient = new docusign.ApiClient();
  apiClient.setOAuthBasePath(authServer);

  try {
    const result = await apiClient.requestJWTUserToken(
      clientId,
      userId,
      scopes,
      fs.readFileSync(privateKeyPath),
      3600
    );

    return result.body.access_token;
  } catch (err) {
    console.error('JWT Token Error:', err.response?.body || err.message);
    throw err;
  }
};

module.exports = getAccessToken;
