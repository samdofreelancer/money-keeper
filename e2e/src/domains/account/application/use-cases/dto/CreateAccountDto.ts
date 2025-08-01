export interface CreateAccountRequest {
  accountName: string;
  accountType: string;
  initialBalance: number;
  currency: string;
  description?: string;
}

export interface CreateAccountResponse {
  success: boolean;
  accountId?: string;
  accountName?: string;
  error?: {
    type: "validation" | "domain" | "unknown";
    message: string;
    details?: string;
  };
}
