/**
 * Test data utilities for generating test data
 */
export class TestData {
  /**
   * Generate a test ID based on the scenario name
   * @param scenarioName The name of the test scenario
   * @returns A formatted test ID
   */
  static generateTestId(scenarioName: string): string {
    return scenarioName.toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')    // Remove special characters
      .substring(0, 100);             // Limit length
  }
  
  /**
   * Generate a unique account name based on scenario name and actual name
   * @param scenarioName The name of the test scenario
   * @param actualName The actual name from the data table
   * @returns A unique account name in the format testId_actualName
   */
  static generateUniqueAccountName(scenarioName: string, actualName: string): string {
    const testId = this.generateTestId(scenarioName);
    return `${testId}_${actualName}`;
  }

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
