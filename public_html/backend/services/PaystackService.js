const axios = require('axios');
const crypto = require('crypto');

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.baseURL = 'https://api.paystack.co';
  }

  async initializePayment(email, amount, reference, metadata = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          metadata,
          callback_url: `${process.env.FRONTEND_URL}/payment/verify`
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Payment initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async verifyPayment(reference) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  verifyWebhookSignature(payload, signature) {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }

  async getBanks() {
    try {
      const response = await axios.get(
        `${this.baseURL}/bank`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch banks: ${error.response?.data?.message || error.message}`);
    }
  }

  async createTransferRecipient(name, accountNumber, bankCode) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transferrecipient`,
        {
          type: 'nuban',
          name,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN'
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create transfer recipient: ${error.response?.data?.message || error.message}`);
    }
  }

  async initiateTransfer(amount, recipientCode, reason) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transfer`,
        {
          source: 'balance',
          amount: amount * 100, // Convert to kobo
          recipient: recipientCode,
          reason
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Transfer failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = new PaystackService();