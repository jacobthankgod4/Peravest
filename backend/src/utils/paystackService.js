const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackService = {
  verifyTransaction: async (reference) => {
    try {
      const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Paystack verification failed: ${error.message}`);
    }
  },

  createTransferRecipient: async (accountNumber, bankCode, accountName) => {
    try {
      const response = await axios.post(`${PAYSTACK_BASE_URL}/transferrecipient`, {
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN'
      }, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create transfer recipient: ${error.message}`);
    }
  },

  initiateTransfer: async (amount, recipientCode, reason) => {
    try {
      const response = await axios.post(`${PAYSTACK_BASE_URL}/transfer`, {
        source: 'balance',
        amount: amount * 100,
        recipient: recipientCode,
        reason
      }, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to initiate transfer: ${error.message}`);
    }
  },

  finalizeTransfer: async (transferCode, otp) => {
    try {
      const response = await axios.post(`${PAYSTACK_BASE_URL}/transfer/finalize_transfer`, {
        transfer_code: transferCode,
        otp
      }, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to finalize transfer: ${error.message}`);
    }
  },

  verifyAccountNumber: async (accountNumber, bankCode) => {
    try {
      const response = await axios.get(`${PAYSTACK_BASE_URL}/bank/resolve`, {
        params: {
          account_number: accountNumber,
          bank_code: bankCode
        },
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to verify account: ${error.message}`);
    }
  }
};

module.exports = paystackService;
