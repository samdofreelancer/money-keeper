import { v4 as uuidv4 } from "uuid";

/**
 * Generates a unique name by appending a UUID segment to a base name
 * Useful for creating unique test data
 */
export function generateUniqueName(baseName: string): string {
  return `${baseName}-${uuidv4().slice(0, 8)}`;
}

/**
 * Generates a unique email address
 */
export function generateUniqueEmail(baseName: string = "test"): string {
  return `${baseName}-${uuidv4().slice(0, 8)}@example.com`;
}

/**
 * Generates a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a random number within a range
 */
export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
