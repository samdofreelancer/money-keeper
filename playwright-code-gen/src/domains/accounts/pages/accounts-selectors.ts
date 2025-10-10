export const selectors = {
  buttons: {
    addAccount: 'button:has-text("Add Account")',
    confirm: 'button:has-text("Confirm")',
    accountsTab: 'text=Accounts',
    balanceColumnHeader: 'th:has-text("Balance")',
  },
  messages: {
    success: '.el-message--success',
  },
  accountElements: {
    accountRow: '.account-row',
    accountDescription: '.account-description',
    deleteButton: '.delete-account-button',
    editButton: '.edit-account-button',
  },
  navigation: {
    categoriesPage: '/categories',
    accountsPage: '/accounts',
  },
  dialog: '.el-dialog',
  search: {
    searchInput: 'input[placeholder*="Search" i]',
    typeFilter: 'select[name="accountType"]',
  },
} as const;
