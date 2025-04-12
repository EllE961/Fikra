// Simple logger placeholder, can integrate with Sentry or other platforms

export const logInfo = (msg) => {
    console.log(`[INFO] ${msg}`);
  };
  
  export const logError = (error) => {
    console.error(`[ERROR] ${error?.message || error}`);
  };
  
  // Add any other logging or analytics tools as needed
  