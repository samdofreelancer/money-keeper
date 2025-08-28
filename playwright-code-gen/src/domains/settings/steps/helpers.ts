import { getWorld } from '../../../shared/utilities/world.helper';
import { TOKENS } from '../../../shared/di/tokens';
import type { SettingsUiUseCase } from '../usecases/ui/SettingsUiUseCase';

export function getWorldSettingsUseCase(): SettingsUiUseCase {
  const world = getWorld();
  return (world as any).settingsUiUseCase as SettingsUiUseCase;
}
