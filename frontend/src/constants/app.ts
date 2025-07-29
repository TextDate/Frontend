export const APP_CONSTANTS = {
  ALLOWED_FILE_TYPES: ['text/plain'] as const,
  VALID_MODEL_KEYS: ['decade', 'century'] as const,
  DEFAULT_VIEW_MODE: 'flat' as const,
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'File size must be less than 5MB',
    INVALID_FILE_TYPE: 'Only .txt files are allowed',
    NO_FILE_SELECTED: 'Please select a file',
    INVALID_MODEL_KEY: 'Please select a valid model type',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    INVALID_REQUEST: 'Invalid request. Please check your input.',
    UNEXPECTED_ERROR: 'An unexpected error occurred',
    INVALID_RESPONSE: 'Invalid response format',
  }
} as const;