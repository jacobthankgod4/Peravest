/**
 * Debug utility to trace 406 errors
 * Add this to your main App.tsx to monitor all Supabase queries
 */

export const setupSupabaseDebug = () => {
  // Intercept console.error to catch 406 errors
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const errorStr = JSON.stringify(args);
    if (errorStr.includes('406') || errorStr.includes('Not Acceptable')) {
      console.warn('🔴 406 ERROR DETECTED:', args);
      console.trace('Stack trace for 406 error:');
    }
    originalError.apply(console, args);
  };

  // Monitor fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (url.includes('supabase.co') && url.includes('user_accounts')) {
      console.log('📡 Supabase Query:', {
        url,
        method: init?.method || 'GET',
        headers: init?.headers,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalFetch.apply(window, [input, init] as any);
  };
};

// Call this in your App.tsx useEffect
export const debugSupabaseQueries = () => {
  if (process.env.NODE_ENV === 'development') {
    setupSupabaseDebug();
  }
};
