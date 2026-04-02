export const paystackService = {
  createTransferRecipient: async (accountNumber: string, bankCode: string, accountName: string) => {
    const response = await fetch('/api/payments/transfer-recipient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        accountNumber,
        bankCode,
        accountName
      })
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },

  initiateTransfer: async (amount: number, recipientCode: string, reason: string) => {
    const response = await fetch('/api/payments/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        amount,
        recipientCode,
        reason
      })
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },

  finalizeTransfer: async (transferCode: string, otp: string) => {
    const response = await fetch('/api/payments/finalize-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        transferCode,
        otp
      })
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },

  verifyAccountNumber: async (accountNumber: string, bankCode: string) => {
    const response = await fetch('/api/payments/verify-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        accountNumber,
        bankCode
      })
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  }
};
