export class AccountData {
  name: string;
  type: string;
  balance: number;
  currency: string;
  description: string;

  constructor(
    name: string,
    type: string,
    balance: number,
    currency: string,
    description: string
  ) {
    this.name = name;
    this.type = type;
    this.balance = balance;
    this.currency = currency;
    this.description = description;
  }
}
