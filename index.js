const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
app.use(bodyParser.text({ type: '*/*', limit: '5mb' }));

const DOCUSIGN_TOKEN = process.env.DOCUSIGN_TOKEN;
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;
const VOID_REASON = 'Auto-voided by webhook';

app.post('/webhook', async (req, res) => {
  const xml = req.body;

  xml2js.parseString(xml, async (err, result) => {
    if (err) return res.status(400).send('Invalid XML');

    try {
      const envelopeId = result.DocuSignEnvelopeInformation.EnvelopeStatus[0].EnvelopeID[0];

      await axios.post(
        `https://demo.docusign.net/restapi/v2.1/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}`,
        { status: 'voided', voidedReason: VOID_REASON },
        {
          headers: {
            Authorization: `Bearer ${DOCUSIGN_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`Envelope ${envelopeId} voided.`);
      res.status(200).send('OK');
    } catch (e) {
      console.error('Error voiding envelope:', e.message);
      res.status(500).send('Error');
    }
  });
});

app.listen(3000, () => console.log('Webhook running on port 3000'));
