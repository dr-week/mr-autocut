import { createDesignPresets } from '@zuari/presets';
import type { ThemePresetName } from '@zuari/tokens';
import { notify } from './notify';

const THEMES: ThemePresetName[] = ['midnight', 'studio', 'noir', 'twilight', 'paper'];
const SURFACES = ['liquid', 'frosted', 'cel'] as const;
export const zuariPresets = createDesignPresets({ theme: 'midnight', surface: 'liquid', elevation: 'float', spacing: 'compact' });

export function cycleZuariTheme() {
  const nxt = THEMES[(THEMES.indexOf(zuariPresets.theme.value) + 1) % THEMES.length];
  zuariPresets.setTheme(nxt); notify(`Zuari Theme: ${nxt} (${zuariPresets.surface.value} glass)`);
}
export function cycleZuariSurface() {
  const nxt = SURFACES[(SURFACES.indexOf(zuariPresets.surface.value as any) + 1) % SURFACES.length];
  zuariPresets.setSurface(nxt); notify(`Zuari Surface: ${nxt}`);
}
