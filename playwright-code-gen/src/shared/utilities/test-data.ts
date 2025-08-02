/**
 * Test data utilities for generating test data
 */
export class TestData {
  /**
   * Generate account test data
   */
  static getTestAccount() {
    return {
      name: 'Test Account',
      type: 'Bank Account',
      balance: 1000,
      currency: 'US Dollar',
      description: 'Test account description'
    };
  }
}