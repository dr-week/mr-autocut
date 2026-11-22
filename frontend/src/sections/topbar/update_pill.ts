import { effect } from '@zuari/signals';
import { updateSig } from '../../state';

export const RELEASES_URL = 'https://github.com/dr-week/mr-autocut/releases/latest';

export function bindUpdatePill(el: HTMLElement) {
  const pill = el.querySelector<HTMLAnchorElement>('#update-pill')!;
  pill.href = RELEASES_URL;
  effect(() => {
    const u = updateSig.value, show = Boolean(u?.update_available && u.latest_version);
    pill.hidden = !show;
    pill.textContent = show ? `⬆ v${u!.latest_version.replace(/^v/, '')} available` : '';
  });
}
