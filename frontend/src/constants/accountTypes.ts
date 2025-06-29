export enum AccountTypeEnum {
  WALLET = 'WALLET',
  BANK = 'BANK'
}

export const accountTypes = [
  { label: 'Wallet', value: AccountTypeEnum.WALLET, icon: 'Wallet' },
  { label: 'Bank', value: AccountTypeEnum.BANK, icon: 'Bank' }
]
