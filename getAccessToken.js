const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, 'private.key'); // Update if your key has a different name

const clientId = '57470690-59bf-477c-96c3-57721da9dce0';
const userId = 'f1ba7faf-fc5d-4b50-a591-09bdc1ba2714';
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
