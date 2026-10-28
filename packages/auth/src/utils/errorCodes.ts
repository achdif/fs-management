// Error Code Generator
// Format: [CATEGORY]_[FIXED_NUMBER]
// Categories:
// ED - Error Database (SurrealDB connection/query issues)
// EM - Error Mobile (Device/network issues)
// ES - Error Server (Upstash/Gmail service issues)
// EA - Error Auth (Authentication/authorization issues)
// EV - Error Validation (Input validation errors)

export const ErrorCodes = {
  // Database Errors (ED)
  DATABASE_CONNECTION_FAILED: 'ED_0001',
  DATABASE_QUERY_FAILED: 'ED_0002',
  DATABASE_NOT_INITIALIZED: 'ED_0003',
  
  // Mobile/Device Errors (EM)
  DEVICE_NETWORK_OFFLINE: 'EM_0812',
  DEVICE_STORAGE_FAILED: 'EM_0813',
  DEVICE_DECODE_FAILED: 'EM_0814',
  
  // Server Errors (ES)
  SERVER_UNAVAILABLE: 'ES_0001',
  UPSTASH_CONNECTION_FAILED: 'ES_0002',
  GMAIL_SEND_FAILED: 'ES_0003',
  
  // Auth Errors (EA)
  AUTH_INVALID_CREDENTIALS: 'EA_0001',
  AUTH_ACCOUNT_LOCKED: 'EA_0002',
  AUTH_TOKEN_EXPIRED: 'EA_0003',
  AUTH_OTP_INVALID: 'EA_0004',
  AUTH_RESET_TOKEN_INVALID: 'EA_0005',
  
  // Validation Errors (EV)
  VALIDATION_EMAIL_INVALID: 'EV_0001',
  VALIDATION_PASSWORD_WEAK: 'EV_0002',
  VALIDATION_REQUIRED_FIELD: 'EV_0003',
};

export function getErrorCategory(errorCode: string): string {
  if (errorCode.startsWith('ED_')) return 'Database Error';
  if (errorCode.startsWith('EM_')) return 'Device Error';
  if (errorCode.startsWith('ES_')) return 'Server Error';
  if (errorCode.startsWith('EA_')) return 'Authentication Error';
  if (errorCode.startsWith('EV_')) return 'Validation Error';
  return 'Unknown Error';
}
