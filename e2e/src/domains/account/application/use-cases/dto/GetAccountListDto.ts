export interface GetAccountListRequest {
  limit?: number;
  offset?: number;
  filter?: {
    accountName?: string;
    accountType?: string;
    currency?: string;
  };
}

export interface AccountDto {
  id: string;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  description?: string;
}

export interface GetAccountListResponse {
  success: boolean;
  accounts?: AccountDto[];
  totalBalance?: number;
  totalCount?: number;
  error?: {
    type: "validation" | "domain" | "unknown";
    message: string;
  };
}
