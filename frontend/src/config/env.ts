export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000"),
  maxFileSize: parseInt(import.meta.env.VITE_API_MAX_FILE_SIZE || "5242880"),
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
} as const;

export const validateConfig = () => {
  if (!config.apiUrl) {
    throw new Error('VITE_API_URL is required');
  }

  if (config.isProduction && config.apiUrl.includes('localhost')) {
    console.warn('Warning: Using localhost API URL in production');
  }
};

if (typeof window !== 'undefined') {
  validateConfig();
}