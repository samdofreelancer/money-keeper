import { AccountPort } from '../../../domain/ports/ui/create-account-ui.port';

export class TrySubmitWithValidationUseCase {
  constructor(private readonly accountPort: AccountPort) {}

  async execute(): Promise<{
    hasValidationErrors: boolean;
    errorMessage?: string;
    validationErrors?: string[];
  }> {
    try {
      await this.accountPort.submitForm();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const stillOnForm = await this.accountPort.isOnFormPage();
      if (stillOnForm) {
        const errorMessage = await this.accountPort.verifyValidationErrors();
        if (errorMessage) {
          return {
            hasValidationErrors: true,
            errorMessage,
            validationErrors: [errorMessage],
          };
        }
        return {
          hasValidationErrors: true,
          errorMessage: 'Form validation prevented submission',
          validationErrors: ['Form validation prevented submission'],
        };
      }
      return { hasValidationErrors: false };
    } catch (error) {
      return {
        hasValidationErrors: true,
        errorMessage: error instanceof Error ? error.message : String(error),
        validationErrors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}
