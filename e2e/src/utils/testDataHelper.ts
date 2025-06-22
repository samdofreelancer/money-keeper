import { v4 as uuidv4 } from "uuid";

export function generateUniqueName(baseName: string): string {
  return `${baseName}-${uuidv4().slice(0, 8)}`;
} 