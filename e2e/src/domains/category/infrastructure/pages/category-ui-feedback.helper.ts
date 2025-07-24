import { Page } from "@playwright/test";

export class UiFeedbackHelper {
  constructor(
    private readonly page: Page
  ) {}

  async isErrorMessageVisible(message: string): Promise<boolean> {
    // First check for form validation errors
    const errorElements = await this.page.$$(".el-form-item__error");
    for (const el of errorElements) {
      const text = await el.textContent();
      if (text?.trim() === message) {
        return true;
      }
    }

    // Then check for Element Plus toast messages
    const toastMessages = await this.page.$$(".el-message--error");
    for (const el of toastMessages) {
      const text = await el.textContent();
      if (text?.trim().includes(message)) {
        return true;
      }
    }

    // Also check for any element with the error message text
    const messageElements = await this.page.$$(`text=${message}`);
    if (messageElements.length > 0) {
      return true;
    }

    return false;
  }

  async isToastMessageVisible(message: string): Promise<boolean> {
    // Wait a bit for toast to appear
    await this.page.waitForTimeout(1000);

    // Check for Element Plus toast messages
    const toastMessages = await this.page.$$(".el-message--error");
    for (const el of toastMessages) {
      const text = await el.textContent();
      if (text?.trim().includes(message)) {
        return true;
      }
    }

    return false;
  }

  async waitForToastMessage(message: string, timeout = 5000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        (msg) => {
          const toastMessages = Array.from(
            document.querySelectorAll(".el-message--error")
          );
          for (const el of toastMessages) {
            if (el.textContent?.includes(msg)) {
              return true;
            }
          }
          return false;
        },
        message,
        { timeout }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async isErrorMessageVisibleInErrorBox(message: string): Promise<boolean> {
    const errorLocator = this.page.getByTestId("error-message");
    const errorText = await errorLocator.textContent();
    return !!errorText && errorText.includes(message);
  }
}
