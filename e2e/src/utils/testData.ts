export interface CategoryTestData {
  name: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
  parentId?: string | null;
}

export const TestCategories = {
  EXPENSE: {
    GROCERIES: {
      name: "Groceries",
      icon: "Grid",
      type: "EXPENSE" as const,
      parentId: null,
    },
    TRANSPORTATION: {
      name: "Transportation",
      icon: "Grid", 
      type: "EXPENSE" as const,
      parentId: null,
    },
    ENTERTAINMENT: {
      name: "Entertainment",
      icon: "Grid",
      type: "EXPENSE" as const,
      parentId: null,
    },
  },
  INCOME: {
    SALARY: {
      name: "Salary Income",
      icon: "Shopping",
      type: "INCOME" as const,
      parentId: null,
    },
    FREELANCE: {
      name: "Freelance Income",
      icon: "Shopping",
      type: "INCOME" as const,
      parentId: null,
    },
  },
} as const;

export const ValidationMessages = {
  REQUIRED_NAME: "Please input category name",
  DUPLICATE_NAME: "Category name already exists",
} as const;

export const getTestCategoryData = (key: keyof typeof TestCategories.EXPENSE | keyof typeof TestCategories.INCOME, type: "EXPENSE" | "INCOME"): CategoryTestData => {
  if (type === "EXPENSE") {
    return TestCategories.EXPENSE[key as keyof typeof TestCategories.EXPENSE];
  } else {
    return TestCategories.INCOME[key as keyof typeof TestCategories.INCOME];
  }
};
