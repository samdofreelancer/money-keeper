export const CATEGORY_CONFIG = {
  MAX_NAME_LENGTH: 255,
  DEFAULT_ICON: "default",
  DEFAULT_TYPE: "EXPENSE",
  DEFAULT_API_URL: "http://127.0.0.1:8080/api",
  CATEGORY_TYPES: {
    EXPENSE: "EXPENSE",
    INCOME: "INCOME"
  } as const
} as const;

export type CategoryType = keyof typeof CATEGORY_CONFIG.CATEGORY_TYPES;