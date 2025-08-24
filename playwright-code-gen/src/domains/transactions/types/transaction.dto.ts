export interface TransactionDto {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  accountId?: string;
  categoryId?: string;
  date?: string;
  notes?: string;
}

export class TransactionCreateDto {
  constructor(data: {
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    accountId?: string;
    categoryId?: string;
    date?: string;
    notes?: string;
  }) {
    this.description = data.description;
    this.amount = data.amount;
    this.type = data.type;
    this.accountId = data.accountId;
    this.categoryId = data.categoryId;
    this.date = data.date;
    this.notes = data.notes;
  }

  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  accountId?: string;
  categoryId?: string;
  date?: string;
  notes?: string;
}
