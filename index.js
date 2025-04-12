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
    if (err) {
      console.error('Error parsing XML:', err.message);
      return res.status(400).send('Invalid XML');
    }

    try {
      const envelopeId = result?.DocuSignEnvelopeInformation?.EnvelopeStatus?.[0]?.EnvelopeID?.[0];

      if (!envelopeId) {
        console.error('Envelope ID not found.');
        return res.status(400).send('Envelope ID missing');
      }

      console.log('Voiding envelope:', envelopeId);

      const url = `https://demo.docusign.net/restapi/v2.1/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}`;
      const body = {
        status: 'voided',
        voidedReason: VOID_REASON,
      };

      console.log('PUT request to:', url);
      console.log('Payload:', body);

      await axios.put(url, body, {
        headers: {
          Authorization: `Bearer ${DOCUSIGN_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Envelope ${envelopeId} voided successfully.`);
      res.status(200).send('OK');
    } catch (e) {
      const errorDetails = e.response?.data || e.message;
      console.error('Error voiding envelope:', errorDetails);
      res.status(500).send('Error voiding envelope');
    }
  });
});

app.listen(3000, () => console.log('Webhook running on port 3000'));
