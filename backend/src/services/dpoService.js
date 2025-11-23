const axios = require('axios');
const { parseStringPromise } = require('xml2js');

const DPO_BASE_URL = process.env.DPO_BASE_URL || 'https://secure.3gdirectpay.com/API/v6/';
const COMPANY_TOKEN = process.env.DPO_COMPANY_TOKEN;
const SERVICE_TYPE = process.env.DPO_SERVICE_TYPE;

const createToken = async (paymentData) => {
    if (process.env.MOCK_PAYMENTS === 'true') {
        console.log('Mocking DPO createToken', paymentData);
        return {
            transToken: 'MOCK_TRANS_TOKEN_' + Date.now(),
            transRef: 'MOCK_TRANS_REF_' + Date.now(),
            paymentUrl: `${paymentData.redirectUrl}?mock_payment=success` // Direct back to success
        };
    }

    const date = new Date();
    const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const xmlBody = `
<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${COMPANY_TOKEN}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${paymentData.amount}</PaymentAmount>
    <PaymentCurrency>${paymentData.currency}</PaymentCurrency>
    <CompanyRef>${paymentData.reference}</CompanyRef>
    <RedirectURL>${paymentData.redirectUrl}</RedirectURL>
    <BackURL>${paymentData.backUrl}</BackURL>
    <CompanyRefUnique>0</CompanyRefUnique>
    <PTL>5</PTL>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${SERVICE_TYPE}</ServiceType>
      <ServiceDescription>${paymentData.description}</ServiceDescription>
      <ServiceDate>${formattedDate}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

    try {
        const response = await axios.post(`${DPO_BASE_URL}createToken`, xmlBody, {
            headers: { 'Content-Type': 'application/xml' }
        });

        const result = await parseStringPromise(response.data);
        const apiResult = result.API3G;

        if (apiResult.Result[0] !== '000') {
            throw new Error(`DPO Error: ${apiResult.ResultExplanation[0]}`);
        }

        return {
            transToken: apiResult.TransToken[0],
            transRef: apiResult.TransRef[0],
            paymentUrl: `${DPO_BASE_URL.replace('API/v6/', '')}payv2.php?ID=${apiResult.TransToken[0]}`
        };
    } catch (error) {
        console.error('DPO Create Token Error:', error);
        throw error;
    }
};

const verifyToken = async (transToken) => {
    if (process.env.MOCK_PAYMENTS === 'true') {
        console.log('Mocking DPO verifyToken', transToken);
        return {
            status: 'paid',
            transToken: transToken,
            customerName: 'Mock User',
            customerPhone: '12345678',
            transactionAmount: '500.00',
            transactionCurrency: 'BWP'
        };
    }

    const xmlBody = `
<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${COMPANY_TOKEN}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${transToken}</TransactionToken>
</API3G>`;

    try {
        const response = await axios.post(`${DPO_BASE_URL}verifyToken`, xmlBody, {
            headers: { 'Content-Type': 'application/xml' }
        });

        const result = await parseStringPromise(response.data);
        const apiResult = result.API3G;

        if (apiResult.Result[0] === '900') { // Transaction not paid yet
            return { status: 'pending' };
        }

        if (apiResult.Result[0] !== '000') {
            return { status: 'failed', explanation: apiResult.ResultExplanation[0] };
        }

        return {
            status: 'paid',
            transToken: apiResult.TransactionToken[0],
            customerName: apiResult.CustomerName ? apiResult.CustomerName[0] : null,
            customerPhone: apiResult.CustomerPhone ? apiResult.CustomerPhone[0] : null,
            transactionAmount: apiResult.TransactionAmount ? apiResult.TransactionAmount[0] : null,
            transactionCurrency: apiResult.TransactionCurrency ? apiResult.TransactionCurrency[0] : null
        };

    } catch (error) {
        console.error('DPO Verify Token Error:', error);
        throw error;
    }
};

module.exports = { createToken, verifyToken };
