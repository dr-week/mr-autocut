import { activeApiSig, notify, resolveBackend } from '../../state';

export async function promptBackendUrl() {
  const u = prompt('Custom Backend URL (HF Space / Render / Colab / Local):', localStorage.getItem('mr_api_url') || '');
  if (u === null) return;
  localStorage.setItem('mr_api_url', u.trim());
  await resolveBackend();
  notify(`Engine: ${activeApiSig.value}`);
}
