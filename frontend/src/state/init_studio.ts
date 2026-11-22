import { loggedEditsSig } from './controls';
import { sequenceSig, statusSig } from './signals';
import { apiUrl, resolveBackend } from './api';
import { checkUpdates } from './updater';
import { runAnalyze } from './run_analyze';

export async function initStudio() {
  await resolveBackend();
  checkUpdates();
  try {
    const [st, seq, lrn] = await Promise.all(['/api/filmcraft/status', '/api/filmcraft/sequence', '/api/learning/stats'].map((p) => fetch(apiUrl(p)).then((r) => r.json())));
    statusSig.value = st; if (seq?.width) sequenceSig.value = seq; if (typeof lrn?.logged_edits === 'number') loggedEditsSig.value = lrn.logged_edits;
  } catch { /* static Pages mode */ }
  await runAnalyze();
}
