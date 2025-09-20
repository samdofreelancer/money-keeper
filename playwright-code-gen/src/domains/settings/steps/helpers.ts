import { getWorldSettingsUseCase as getFromHooks } from 'shared/utilities/hooks';
import type { SettingsUiUseCase } from 'settings-domain/usecases/ui/SettingsUiUseCase';

export function getWorldSettingsUseCase(): SettingsUiUseCase {
  return getFromHooks();
}
