export enum AccountTypeEnum {
  E_WALLET = 'E_WALLET',
  BANK_ACCOUNT = 'BANK_ACCOUNT'
}

export const accountTypes = [
  { label: 'E-Wallet', value: AccountTypeEnum.E_WALLET, icon: 'Wallet' },
  { label: 'Bank Account', value: AccountTypeEnum.BANK_ACCOUNT, icon: 'Bank' }
]
