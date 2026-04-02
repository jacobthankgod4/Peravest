export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  paystackPublicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || '',
  appName: process.env.REACT_APP_APP_NAME || 'PeraVest',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || ''
};
