import { getWorldSettingsUseCase as getFromHooks } from 'shared/utilities/hooks';
import type { SettingsUiUseCase } from '../usecases/ui/SettingsUiUseCase';

export function getWorldSettingsUseCase(): SettingsUiUseCase {
  return getFromHooks();
}
