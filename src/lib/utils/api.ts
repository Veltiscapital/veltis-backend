import { NextApiResponse } from 'next';

/**
 * Send a success response
 * @param res The response object
 * @param data The data to send
 * @param status The status code (default: 200)
 */
export function sendSuccess(res: NextApiResponse, data: any, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

/**
 * Send an error response
 * @param res The response object
 * @param message The error message
 * @param status The status code (default: 500)
 */
export function sendError(res: NextApiResponse, message: string, status = 500) {
  return res.status(status).json({
    success: false,
    error: message,
  });
}

/**
 * Validate required fields
 * @param data The data to validate
 * @param requiredFields The required fields
 * @returns An error message if validation fails, null otherwise
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): string | null {
  const missingFields = requiredFields.filter((field) => !data[field]);
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }
  return null;
}

/**
 * Parse a query parameter
 * @param param The query parameter
 * @param defaultValue The default value
 * @returns The parsed parameter
 */
export function parseQueryParam<T>(
  param: string | string[] | undefined,
  defaultValue: T
): T {
  if (param === undefined) {
    return defaultValue;
  }

  const value = Array.isArray(param) ? param[0] : param;

  if (typeof defaultValue === 'number') {
    const parsed = parseInt(value, 10);
    return (isNaN(parsed) ? defaultValue : parsed) as unknown as T;
  }

  if (typeof defaultValue === 'boolean') {
    return (value === 'true') as unknown as T;
  }

  return value as unknown as T;
}

/**
 * Parse pagination parameters
 * @param query The query object
 * @returns The pagination parameters
 */
export function parsePagination(query: {
  page?: string | string[];
  limit?: string | string[];
}): { page: number; limit: number; offset: number } {
  const page = parseQueryParam(query.page, 1);
  const limit = parseQueryParam(query.limit, 10);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Parse a comma-separated list query parameter
 * @param param The query parameter
 * @returns The parsed list
 */
export function parseListParam(param: string | string[] | undefined): string[] {
  if (param === undefined) {
    return [];
  }

  const value = Array.isArray(param) ? param[0] : param;
  return value.split(',').map((item) => item.trim());
}

/**
 * Parse a JSON query parameter
 * @param param The query parameter
 * @param defaultValue The default value
 * @returns The parsed JSON
 */
export function parseJsonParam<T>(
  param: string | string[] | undefined,
  defaultValue: T
): T {
  if (param === undefined) {
    return defaultValue;
  }

  const value = Array.isArray(param) ? param[0] : param;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Get the base URL
 * @param req The request object
 * @returns The base URL
 */
export function getBaseUrl(req: any): string {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}

/**
 * Check if a wallet address is valid
 * @param address The wallet address to check
 * @returns Whether the address is valid
 */
export function isValidWalletAddress(address: string): boolean {
  // Ethereum address format: 0x followed by 40 hexadecimal characters
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Generate a nonce for wallet signature
 * @returns A random nonce
 */
export function generateNonce(): string {
  return Math.floor(Math.random() * 1000000).toString();
}

/**
 * Parse a string query parameter
 * @param param The query parameter
 * @param defaultValue The default value
 * @returns The parsed parameter
 */
export function parseStringParam(
  param: string | string[] | undefined,
  defaultValue = ''
): string {
  return parseQueryParam(param, defaultValue);
}

/**
 * Parse a number query parameter
 * @param param The query parameter
 * @param defaultValue The default value
 * @returns The parsed parameter
 */
export function parseNumberParam(
  param: string | string[] | undefined,
  defaultValue = 0
): number {
  return parseQueryParam(param, defaultValue);
}
