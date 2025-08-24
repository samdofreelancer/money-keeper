export const generateTestName = (prefix: string = 'test'): string => {
  return `${prefix}_${Date.now()}`;
};

export const sanitizeCategoryName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
};
