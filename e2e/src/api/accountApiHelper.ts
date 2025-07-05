import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api";

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  description?: string;
}

export async function getAllAccounts(): Promise<Account[]> {
  const response = await axios.get<Account[]>(`${API_BASE_URL}/accounts`);
  return response.data;
}

export async function deleteAccountById(id: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/accounts/${id}`);
}

export async function getAccountByName(name: string): Promise<Account | undefined> {
  const accounts = await getAllAccounts();
  // Support both 'name' and 'accountName' for compatibility
  return accounts.find((acc: any) => acc.accountName === name);
}

export async function createAccount({ name, type, balance, currency = "USD", description }: { name: string; type: string; balance: number; currency?: string; description?: string; }) {
  // The backend expects 'accountName' and 'initBalance' fields
  await axios.post(`${API_BASE_URL}/accounts`, {
    accountName: name,
    type,
    initBalance: balance,
    currency,
    description,
  });
}
