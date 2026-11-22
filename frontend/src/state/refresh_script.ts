import { cliCmdSig, jsonlSig } from './controls';
import { postJson } from './post_json';
import { scriptPayload } from './script_payload';

export async function refreshScript() {
  try {
    const d = await postJson('/api/filmcraft/script', scriptPayload()).then((r) => r.json());
    jsonlSig.value = d.jsonl || ''; cliCmdSig.value = d.cli_invocation || '';
  } catch { /* ignore */ }
}
